import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Network, Send, Loader2, Download, 
  RefreshCw, ZoomIn, ZoomOut, Maximize2,
  Sparkles, BrainCircuit, AlertCircle, Info,
  Share2, Camera, Check, ChevronDown, ChevronUp,
  Plus, Minus
} from "lucide-react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  Handle,
  Position,
  ConnectionLineType,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GoogleGenAI, Type } from "@google/genai";
import { getGeminiAI } from "../lib/gemini";
import * as htmlToImage from "html-to-image";

// Custom Node Components for better styling
const RootNode = ({ data }: { data: { label: string } }) => (
  <div id="mind-map-root-node" className="px-6 py-4 rounded-2xl bg-neon-green text-green-950 font-black border-2 border-green-950 shadow-[0_10px_30px_rgba(57,255,20,0.3)] min-w-[200px] text-center relative group hover:scale-105 hover:shadow-[0_15px_40px_rgba(57,255,20,0.5)] transition-all cursor-default">
    <div className="absolute -top-3 -left-3 bg-green-950 text-neon-green p-1.5 rounded-lg rotate-[-12deg] shadow-lg group-hover:rotate-0 transition-transform">
      <BrainCircuit className="w-4 h-4" />
    </div>
    <div className="text-lg uppercase tracking-tighter">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-green-950 !border-neon-green" />
  </div>
);

const BranchNode = ({ data }: { data: { label: string; isCollapsed?: boolean; toggle?: () => void; hasChildren?: boolean } }) => (
  <div 
    id={`branch-node-${data.label.replace(/\s+/g, '-').toLowerCase()}`}
    onClick={data.toggle}
    className={`px-5 py-3 rounded-xl bg-white border-2 font-bold shadow-lg min-w-[150px] text-center transition-all cursor-pointer group hover:-translate-y-1
      ${data.isCollapsed 
        ? 'border-amber-400 bg-amber-50/30 text-amber-900 shadow-amber-200/50' 
        : 'border-neon-green/40 hover:border-neon-green hover:shadow-[0_10px_25px_rgba(57,255,20,0.2)] text-green-950'}
    `}
  >
    <Handle type="target" position={Position.Top} className="!bg-neon-green" />
    <div className="flex items-center justify-center gap-2">
      <div className="text-sm">{data.label}</div>
      {data.hasChildren && (
        <div className={`p-1 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors ${data.isCollapsed ? 'text-amber-500' : 'text-neon-green'}`}>
          {data.isCollapsed ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        </div>
      )}
    </div>
    {!data.isCollapsed && <Handle type="source" position={Position.Bottom} className="!bg-neon-green" />}
  </div>
);

const LeafNode = ({ data }: { data: { label: string } }) => (
  <div id={`leaf-node-${data.label.slice(0, 15).replace(/\s+/g, '-').toLowerCase()}`} className="px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-800 shadow-sm max-w-[180px] hover:bg-green-100 hover:border-green-400 hover:shadow-md transition-all cursor-default">
    <Handle type="target" position={Position.Left} className="!bg-green-400" />
    <div className="text-[11px] leading-tight font-medium">{data.label}</div>
  </div>
);

const nodeTypes = {
  root: RootNode,
  branch: BranchNode,
  leaf: LeafNode,
};

interface MindMapData {
  topic: string;
  branches: {
    label: string;
    details: string[];
  }[];
}

function MindMapInner() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const generateMindMap = async () => {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = getGeminiAI();
      const prompt = `Topic: "${topic}". 
      You are an expert academic mentor. Create a comprehensive, well-structured hierarchical mind map for this topic. 
      Break it down into 4-6 main logical branches and 3-5 key details/sub-points for each branch.
      The level should be suitable for higher education students but clear enough for high schoolers.
      Use professional yet engaging academic terminology.
      Return the response strictly as valid JSON.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING, description: "The central core topic" },
              branches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING, description: "Main branch category" },
                    details: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING, description: "Specific sub-point or detail" }
                    }
                  },
                  required: ["label", "details"]
                }
              }
            },
            required: ["topic", "branches"]
          }
        }
      });

      const text = result.text || "";
      if (!text) throw new Error("AI ne koi response nahi bheja. Phir se try karein!");
      
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      const data = JSON.parse(cleanJson) as MindMapData;
      
      transformToFlow(data);
      
      // Automatically fit view after a slightly longer delay to ensure DOM is ready
      setTimeout(() => {
        fitView({ duration: 1000, padding: 0.2 });
      }, 300);
    } catch (err: any) {
      console.error("Mind map generation error:", err);
      setError({ 
        message: "Ofo! Kuch gadbad ho gayi. " + (err.message || "Please try again later."), 
        type: 'error' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleBranch = (branchId: string, childIds: string[]) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === branchId) {
          return {
            ...node,
            data: { ...node.data, isCollapsed: !node.data.isCollapsed },
          };
        }
        if (childIds.includes(node.id)) {
          return { ...node, hidden: !node.hidden };
        }
        return node;
      })
    );

    setEdges((eds) =>
      eds.map((edge) => {
        if (childIds.includes(edge.target)) {
          return { ...edge, hidden: !edge.hidden };
        }
        return edge;
      })
    );
  };

  const transformToFlow = (data: MindMapData) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Root Node
    const rootId = "root";
    newNodes.push({
      id: rootId,
      type: "root",
      data: { label: data.topic },
      position: { x: 0, y: 0 },
    });

    const radius = 350;

    data.branches.forEach((branch, bIdx) => {
      const branchId = `branch-${bIdx}`;
      const angle = (bIdx / data.branches.length) * 2 * Math.PI;
      const bx = Math.cos(angle) * radius;
      const by = Math.sin(angle) * radius;

      const detailIds: string[] = [];

      // Sub-details
      branch.details.forEach((detail, dIdx) => {
        const detailId = `detail-${bIdx}-${dIdx}`;
        detailIds.push(detailId);
        // Spread details around the branch
        const detailAngle = angle + (dIdx - (branch.details.length - 1) / 2) * 0.25;
        const dx = bx + Math.cos(detailAngle) * 220;
        const dy = by + Math.sin(detailAngle) * 220;

        newNodes.push({
          id: detailId,
          type: "leaf",
          data: { label: detail },
          position: { x: dx, y: dy },
          hidden: false,
        });

        newEdges.push({
          id: `e-${branchId}-${detailId}`,
          source: branchId,
          target: detailId,
          style: { stroke: "#A3E635", strokeWidth: 1.5, opacity: 0.6 },
          type: ConnectionLineType.Bezier,
          hidden: false,
        });
      });

      newNodes.push({
        id: branchId,
        type: "branch",
        data: { 
          label: branch.label, 
          isCollapsed: false,
          hasChildren: branch.details.length > 0,
          toggle: () => toggleBranch(branchId, detailIds)
        },
        position: { x: bx, y: by },
      });

      newEdges.push({
        id: `e-root-${branchId}`,
        source: rootId,
        target: branchId,
        animated: true,
        type: ConnectionLineType.SmoothStep,
        style: { stroke: "#39FF14", strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#39FF14" },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    setTopic("");
    setError(null);
  };

  const handleDownloadImage = async () => {
    if (reactFlowWrapper.current === null) return;

    try {
      // Use toPng to capture the screenshot
      const dataUrl = await htmlToImage.toPng(reactFlowWrapper.current, {
        backgroundColor: "#ffffff",
        quality: 1,
        pixelRatio: 2, // Higher quality
      });

      const link = document.createElement("a");
      link.download = `mind-map-${topic || "gyaan"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Screenshot error:", err);
    }
  };

  const handleShare = async () => {
    const shareText = `Check out this Mind Map for "${topic || 'Study'}" generated by SwasthyaSaathi AI! 🧠✨`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SwasthyaSaathi AI Mind Map",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share error:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  return (
    <section id="mind-map-section" className="py-24 relative overflow-hidden bg-white border-y border-green-100 min-h-screen flex flex-col">
      {/* Subtle Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-neon-green/[0.03] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-green-500/[0.03] rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex flex-col">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-neon-green/5 border border-neon-green/20 text-neon-green text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm"
          >
            <Network className="w-3.5 h-3.5" />
            Neural Brain Mapping
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-display font-black text-green-950 mb-6 tracking-tighter leading-none">
            Topic <span className="text-neon-green italic underline decoration-neon-green/30 underline-offset-8">Visualization</span>
          </h2>
          <p className="text-green-800/60 max-w-2xl mx-auto font-medium text-base md:text-lg text-balance">
            Complex topics ko asan banayein! Bas ek chapter ka naam dalo aur magic dekho Swasthyasaathi AI ke saath. 🧠✨
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-12 items-center mb-8">
          {/* Controls Top Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl"
          >
            <div className="bg-white p-8 rounded-[40px] border border-green-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] space-y-8">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-green-800/40 uppercase tracking-[0.2em]">
                      Step 1: Enter Your Topic
                    </label>
                    <span className="text-[9px] font-bold text-neon-green/60">AI Study Mentor</span>
                  </div>
                  <div id="mind-map-input-container" className="relative group">
                    <input
                      id="mind-map-main-input"
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && generateMindMap()}
                      placeholder="e.g. Newton's Laws, Civil War, Photosynthesis..."
                      className="w-full bg-green-50/30 border-2 border-green-100 rounded-[24px] p-5 text-base font-bold text-green-950 placeholder:text-green-800/20 focus:outline-none focus:ring-8 focus:ring-neon-green/5 focus:border-neon-green transition-all"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-neon-green group-focus-within:scale-125 transition-transform">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <button
                  id="mind-map-generate-btn"
                  onClick={generateMindMap}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full md:w-auto px-10 group relative h-[72px] overflow-hidden bg-white text-green-950 border-2 border-green-950 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] hover:bg-neon-green hover:border-neon-green active:scale-[0.98] transition-all disabled:opacity-30 shadow-lg hover:shadow-neon-green/20 shrink-0"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Mapping Nodes...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-6 h-6" />
                        Visualize Gyaan
                      </>
                    )}
                  </div>
                </button>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-green-50">
                <div className="flex gap-3 order-2 md:order-1">
                  <button 
                    disabled={nodes.length === 0}
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-green-100 text-[10px] font-black text-green-900 uppercase tracking-widest hover:bg-green-50 transition-all disabled:opacity-30"
                  >
                    <Download className="w-4 h-4" />
                    Save PDF
                  </button>
                  <button 
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-red-100 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear Canvas
                  </button>
                </div>

                <div className="flex items-center gap-3 text-green-900/60 order-1 md:order-2">
                  <Info className="w-4 h-4 text-neon-green shrink-0" />
                  <p className="text-[10px] font-bold tracking-tight">
                    Topic dalo aur hamara AI mentor aapke liye visual nodes taiyar kar dega!
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-6 rounded-[30px] border-l-[6px] ${
                  error.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                } flex gap-4 shadow-xl`}
              >
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="text-xs font-bold leading-tight">{error.message}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Visualization Canvas Area - Always Visible Result Panel */}
          <motion.div
            ref={reactFlowWrapper}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="w-full relative min-h-[700px] bg-white rounded-[50px] overflow-hidden border border-green-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]"
          >
            {nodes.length > 0 ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="font-sans"
              >
                <Background 
                  color="#D1FAE5"
                  variant={BackgroundVariant.Dots} 
                  gap={24} 
                  size={1.5} 
                  className="opacity-50"
                />
                <Controls className="!bg-white !border-green-100 !rounded-2xl !overflow-hidden !shadow-xl !m-6" />
                
                <Panel position="bottom-right" className="m-6">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => fitView({ duration: 800 })}
                      title="Center View"
                      className="p-4 bg-white rounded-2xl border border-green-100 shadow-xl hover:text-neon-green transition-all hover:scale-110 active:scale-95"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleShare}
                      title="Share Map"
                      className="p-4 bg-white rounded-2xl border border-green-100 shadow-xl hover:text-neon-green transition-all hover:scale-110 active:scale-95 group relative"
                    >
                      {shareStatus === 'copied' ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                      <AnimatePresence>
                        {shareStatus === 'copied' && (
                          <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -40 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-1/2 -translate-x-1/2 text-[9px] font-black bg-green-500 text-white px-2 py-1 rounded-full whitespace-nowrap"
                          >
                            COPIED!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                    <button 
                      onClick={handleDownloadImage}
                      title="Take Screenshot"
                      className="p-4 bg-white rounded-2xl border border-green-100 shadow-xl hover:text-neon-green transition-all hover:scale-110 active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                </Panel>
              </ReactFlow>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-8 flex items-center justify-center">
                  <div className="absolute w-40 h-40 bg-neon-green/5 rounded-full animate-ping" />
                  <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-neon-green/20 flex items-center justify-center">
                    <Network className="w-16 h-16 text-neon-green/20" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-green-950 mb-2 uppercase tracking-widest">
                  Neural Canvas
                </h3>
                <p className="text-sm text-green-800/30 max-w-sm font-medium">
                  Aapka visual study plan yahan dikhai dega. Let's start mapping!
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-24 h-24">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-t-4 border-neon-green"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="w-8 h-8 text-neon-green animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1 text-center">
                    <div className="text-[10px] font-black text-green-950 uppercase tracking-[0.5em] animate-pulse">
                      Gyaan Generate Ho Raha Hai
                    </div>
                    <div className="text-[9px] text-green-800/40 font-bold uppercase tracking-widest">
                      AI brain nodes connect kar raha hai...
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function MindMapGenerator() {
  return (
    <ReactFlowProvider>
      <MindMapInner />
    </ReactFlowProvider>
  );
}

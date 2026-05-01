import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wand2, Download, RefreshCw, Layers, 
  Maximize2, Sparkles, Loader2, RotateCcw
} from "lucide-react";
import { getGeminiAI } from "../lib/gemini";

type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";

const aspectRatios: { label: string; value: AspectRatio; icon: string }[] = [
  { label: "Square", value: "1:1", icon: "▢" },
  { label: "Portrait", value: "3:4", icon: "▯" },
  { label: "Landscape", value: "4:3", icon: "▭" },
  { label: "Mobile", value: "9:16", icon: "📱" },
  { label: "Cinematic", value: "21:9", icon: " 넓" },
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedAR, setSelectedAR] = useState<AspectRatio>("1:1");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: `High quality academic/motivational visual: ${prompt}` }]
        },
        config: {
          imageConfig: {
            aspectRatio: selectedAR
          }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      const base64 = imagePart?.inlineData?.data;

      if (base64) {
        setGeneratedImage(`data:image/png;base64,${base64}`);
      } else {
        throw new Error("The AI didn't return an image part. It might have responded with text instead.");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      const msg = err?.message?.toLowerCase() || "";
      const isKeyError = msg.includes("key") || msg.includes("401") || msg.includes("unauthorized") || msg.includes("missing");
      setError(isKeyError 
        ? "⚠️ AI Key setup nahi hai. Screen ke bottom right mein 'Fix AI Key' button dhoondo aur setup kar lo!"
        : (err.message || "Failed to generate image. Please try again."));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedImage(null);
    setPrompt("");
    setError(null);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `swasthya-saathi-ai-${Date.now()}.png`;
    link.click();
  };

  return (
    <section className="py-24 relative overflow-hidden bg-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            NexPoster AI Generator
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-green-950 mb-6">
            Visualize Your <span className="neon-text">Success</span>
          </h2>
          <p className="text-lg text-green-800/70 max-w-2xl mx-auto font-medium">
            Generate motivational posters, study diagrams, or personalized wallpapers for your study space using our advanced Image AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-stretch">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-[32px] border-white shadow-xl bg-white/80 flex flex-col h-full"
          >
            <div className="space-y-8 flex-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-green-900 uppercase tracking-widest">
                    1. What's on your mind?
                  </label>
                  {(prompt || generatedImage || error) && (
                    <button 
                      onClick={handleReset}
                      className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset All
                    </button>
                  )}
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A futuristic library with neon plants, peaceful study atmosphere, 4k digital art"
                  className="w-full bg-green-50/50 border border-green-100 rounded-2xl p-4 text-green-950 placeholder:text-green-800/30 focus:outline-none focus:ring-4 focus:ring-neon-green/5 focus:border-neon-green transition-all min-h-[120px] font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-green-900 uppercase tracking-widest mb-4">
                  2. Choose Aspect Ratio
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {aspectRatios.map((ar) => (
                    <button
                      key={ar.value}
                      onClick={() => setSelectedAR(ar.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-2 ${
                        selectedAR === ar.value
                          ? "bg-green-800 border-neon-green text-white shadow-lg"
                          : "bg-white border-green-50 text-green-800 hover:border-green-100"
                      }`}
                    >
                      <span className="text-lg font-bold">{ar.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {ar.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-medium flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-neon-green text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-neon-green/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Bending Light...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    Generate Vision
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-full"
          >
            <div className={`glass h-full min-h-[400px] md:min-h-0 rounded-[32px] overflow-hidden border-white shadow-2xl bg-green-100/30 flex items-center justify-center relative group`}>
              <AnimatePresence mode="wait">
                {generatedImage ? (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full relative"
                  >
                    <img
                      src={generatedImage}
                      alt="Generated motivation"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                      <button
                        onClick={downloadImage}
                        className="p-4 bg-white text-green-950 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                        title="Download Image"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleReset}
                        className="p-4 bg-white text-red-600 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                        title="Reset Generator"
                      >
                        <RefreshCw className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 text-green-800/30"
                  >
                    {isGenerating ? (
                      <div className="relative">
                        <RefreshCw className="w-10 h-10 animate-spin opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Layers className="w-5 h-5 animate-bounce" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Layers className="w-10 h-10 opacity-10" />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Waiting for prompt...</p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

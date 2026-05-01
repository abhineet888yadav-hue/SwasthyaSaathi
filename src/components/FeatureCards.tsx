import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Calendar, Activity, Zap, Send, Loader2, 
  Trash2, X, RefreshCw, Image as ImageIcon, Volume2, Play, BrainCircuit,
  BookOpen, Sparkles, ChevronRight, Search, CheckCircle2, AlertCircle, ChevronDown, List
} from "lucide-react";
import NeuralLoader from "./NeuralLoader";
import ReactMarkdown from "react-markdown";
import { getGeminiAI } from "../lib/gemini";
import { ThinkingLevel, Modality } from "@google/genai";

const features = [
  {
    title: "Ask Doubts Instantly",
    description: "Get sharp, AI-powered explanations for any doubt. From Class 5 math to GATE-level engineering. Sab kuch instantly sorted!",
    icon: MessageSquare,
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Neural Doubt Solver"
  },
  {
    title: "Study Plan Generator",
    description: "Smart schedules tailored to your current energy. Optimized for Class 5 to technical GATE prep. No more random study schedules!",
    icon: Calendar,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    label: "Mastery Planner"
  },
  {
    title: "Health & Stress Check",
    description: "AI-driven mood mapping to identify burnout. Routine optimization based on your real-time health metrics. Health hi toh wealth hai!",
    icon: Activity,
    color: "text-neon-green",
    bg: "bg-green-100",
    label: "Burnout Defense"
  },
  {
    title: "Instant Revision Tips",
    description: "Quick memory hacks and technical derivations. Scale your revision speed with structured memory maps. Exam pressure? Zero percent!",
    icon: Zap,
    color: "text-lime-600",
    bg: "bg-lime-100",
    label: "Flash Revision"
  },
  {
    title: "Chapter Deep-Dive",
    description: "Break complex chapters into scannable topics and mastery tips. Technical deep-dives made simple for every student.",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "Context Mapper"
  }
];

type ChatMessage = {
  role: "user" | "model";
  content: string;
  imageUrl?: string;
  provider?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
};

interface Topic {
  title: string;
  importance: "High" | "Medium" | "Low";
  description: string;
  keyPoints: string[];
}

function MiniChatCard({ feature, index }: { feature: any, index: number }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{file: File, preview: string} | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", content: "Namaste! I'm SwasthyaSaathi. Ask me any academic doubt—I'll help you solve it with Padhai bhi, Health bhi! 📚💪" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;
    
    const userMessage: ChatMessage = { 
      role: "user", 
      content: textToSend,
      imageUrl: selectedImage?.preview
    };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const imgData = selectedImage;
    setSelectedImage(null);
    if (!overrideInput) setInput("");
    setIsLoading(true);

    try {
      const parts: any[] = [{ text: textToSend }];
      if (imgData) {
        const base64 = await fileToBase64(imgData.file);
        parts.push({
          inlineData: {
            data: base64,
            mimeType: imgData.file.type
          }
        });
      }

      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.slice(-5).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
          { role: "user", parts }
        ],
        config: {
          systemInstruction: `You are the **SwasthyaSaathi AI Mentor**, an expert companion for students designed to balance academic excellence with mental and physical well-being. Your mission: "Padhai bhi, Health bhi."

Core Competencies:
1. **Academic Support**: Solve complex doubts, explain difficult concepts simply, and help create efficient study schedules.
2. **Health & Wellness**: Provide tips for managing exam stress, preventing burnout, improving posture, and maintaining a healthy sleep cycle.
3. **Motivation**: Act as a supportive coach. Use natural Hinglish to build trust (e.g., "Ab study hogi bina kisi stress ke").

Response Guidelines:
- **Tone**: Professional, encouraging, and grounded. 
- **Language**: Primarily English, but use relatesble **Hinglish** phrases.
- **Clarity**: Use bullet points for complex explanations. Keep responses concise.
- **Boundaries**: You are an AI Mentor, not a doctor. Include disclaimers for health issues.
- **Scope**: Stay focused on study and health. Gently steer irrelevant questions back.

End with 'Need more detail? Just ask!' only if appropriate for the flow.`
        }
      });

      setMessages(prev => [...prev, { role: "model", content: response.text || "error", provider: "gemini" }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const msg = (error?.message || "").toLowerCase();
      let errorContent = `I encountered an error: ${msg}. Please try again.`;
      if (msg.includes("api key") || msg.includes("api_key") || msg.includes("api_key_missing") || msg.includes("unauthorized") || msg.includes("403") || msg.includes("401")) {
        errorContent = "⚠️ API Key Invalid or Missing. Please ensure the key AIzaSyCDY52-qmmKrDWOzkDZ6mcpndt4SDaj5NA is valid.";
      } else if (msg.includes("quota")) {
        errorContent = "⚠️ AI Quota exceeded. Please try again later.";
      }
      setMessages(prev => [...prev, { role: "model", content: errorContent, provider: "system" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (index: number, text: string) => {
    if (playingId === index) {
      window.speechSynthesis?.cancel();
      setPlayingId(null);
      return;
    }

    window.speechSynthesis?.cancel();
    setPlayingId(index);

    // Clean text for speech
    const cleanText = text
      .replace(/[*#_`~]/g, '') // Remove markdown
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Remove complex emojis
      .trim();

    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    let currentSentenceIndex = 0;

    const speakChunk = () => {
      if (currentSentenceIndex >= sentences.length) {
        setPlayingId(null);
        return;
      }

      // Clean text for natural Indian pronunciation
      let cleanSentence = sentences[currentSentenceIndex].trim()
        .replace(/[*#_~]/g, '')
        .replace(/SwasthyaSaathi/g, 'Swasthya Saathi')
        .replace(/e\.g\./gi, 'for example')
        .trim();

      if (!cleanSentence) {
        currentSentenceIndex++;
        speakChunk();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanSentence);
      
      const voices = window.speechSynthesis?.getVoices() || [];
      // 1. Prioritize Hindi (hi-IN) - Most relatable
      let preferredVoice = voices.find(v => 
        (v.lang === 'hi-IN' || v.lang.startsWith('hi')) && v.name.toLowerCase().includes('google')
      ) || voices.find(v => 
        v.lang === 'hi-IN' || v.lang.startsWith('hi')
      );

      // 2. Fallback to Indian English (en-IN) - Better for Hinglish than US/UK
      if (!preferredVoice) {
        preferredVoice = voices.find(v => 
          v.lang === 'en-IN' && v.name.toLowerCase().includes('google')
        ) || voices.find(v => 
          v.lang === 'en-IN' && (v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('india'))
        ) || voices.find(v => 
          v.lang === 'en-IN'
        );
      }

      // 3. Last resort fallbacks
      if (!preferredVoice) {
        preferredVoice = voices.find(v => 
          v.name.toLowerCase().includes('india') || v.lang.includes('IN')
        ) || voices.find(v => 
          v.name.toLowerCase().includes('google')
        ) || voices.find(v => v.lang.includes('en-GB'));
      }

      if (preferredVoice) utterance.voice = preferredVoice;
      
      const isHindi = preferredVoice?.lang.startsWith('hi');
      utterance.pitch = isHindi ? 1.05 : 0.98;
      utterance.rate = isHindi ? 0.95 : 0.92;
      utterance.volume = 1.0;

      utterance.onend = () => {
        currentSentenceIndex++;
        // Small pause between sentences for natural flow
        setTimeout(speakChunk, isHindi ? 150 : 300);
      };

      utterance.onerror = (err: any) => {
        const errorMessage = err.error || String(err);
        if (errorMessage !== 'canceled' && errorMessage !== 'interrupted') {
          console.error("Speech error:", errorMessage);
        }
        setPlayingId(null);
      };

      window.speechSynthesis?.speak(utterance);
    };

    speakChunk();
  };

  const deleteMessage = (idx: number) => {
    setMessages(prev => prev.filter((_, i) => i !== idx));
  };

  const clearChat = () => {
    setMessages([{ role: "model", content: "Namaste! Ask me any academic doubt." }]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, y: { type: "spring", stiffness: 300, damping: 20 } }}
      viewport={{ once: true }}
      className="glass p-6 rounded-3xl border-neon-green/30 transition-all group bg-white shadow-sm flex flex-col h-[650px] relative overflow-hidden"
    >
      {/* Architectural Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl ${feature.bg} shadow-inner transition-transform group-hover:scale-110`}>
            <feature.icon className={`w-7 h-7 ${feature.color}`} />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-green-950 tracking-tight leading-none mb-1">{feature.title}</h3>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neon-green">{feature.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button 
              onClick={clearChat}
              className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
              title="Clear all chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-hide text-sm">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex group/msg ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`relative p-4 rounded-2xl max-w-[90%] ${msg.role === "user" ? "bg-neon-green text-white shadow-md shadow-green-100" : "bg-green-50 text-green-900"}`}>
                {msg.imageUrl && (
                  <img 
                    src={msg.imageUrl} 
                    alt="User uploaded attachment" 
                    className="w-full h-auto rounded-lg mb-2" 
                    referrerPolicy="no-referrer" 
                  />
                )}
                <div className="prose prose-base max-w-none prose-p:leading-relaxed prose-p:my-0">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === "model" && msg.content.length > 20 && (
                  <button 
                    onClick={() => speak(i, msg.content)} 
                    className={`absolute -bottom-2 -right-2 p-1.5 rounded-full shadow-md border border-green-100 transition-all ${playingId === i ? 'bg-neon-green text-white animate-pulse' : 'bg-white text-neon-green hover:scale-110'}`}
                    title={playingId === i ? "Stop" : "Listen"}
                  >
                    {playingId === i ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                )}
                {msg.provider && (
                  <div className={`text-[8px] mt-1 font-bold uppercase tracking-widest opacity-40 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    Powered by {msg.provider}
                  </div>
                )}
                {/* Individual Delete Button */}
                <button 
                  onClick={() => deleteMessage(i)}
                  className={`absolute -top-2 ${msg.role === "user" ? "-left-2" : "-right-2"} p-1 bg-white border border-green-100 text-red-400 hover:text-red-600 rounded-full shadow-sm opacity-0 group-hover/msg:opacity-100 transition-opacity`}
                  title="Delete message"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 p-2 bg-red-50 border-t border-red-100 text-[10px] text-red-500 font-bold text-center z-50"
          >
            {error}
          </motion.div>
        )}
        {!isLoading && messages.length > 1 && messages[messages.length - 1].role === "model" && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 ml-2"
          >
          </motion.div>
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-green-50 flex items-center justify-center">
              <NeuralLoader size="sm" label="Neural Thinking" />
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-auto shrink-0 flex flex-col gap-2">
        {selectedImage && (
          <div className="absolute bottom-full left-0 mb-2 p-1 bg-white rounded-lg shadow-lg border border-green-100 flex items-center gap-2">
            <img 
              src={selectedImage.preview} 
              alt="Thumbnail preview" 
              className="w-10 h-10 rounded-md object-cover" 
              referrerPolicy="no-referrer" 
            />
            <button onClick={() => setSelectedImage(null)} className="p-0.5 bg-red-100 text-red-500 rounded-full">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl transition-all ${selectedImage ? 'bg-neon-green text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <div className="relative flex-1 ml-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedImage({ file, preview: URL.createObjectURL(file) });
              }}
              accept="image/*"
              className="hidden"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a doubt..."
              className="w-full bg-green-50/50 border border-green-100 rounded-xl py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:border-neon-green transition-colors text-green-950 font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-neon-green text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md shadow-green-100"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StudyPlanCard({ feature, index }: { feature: any, index: number }) {
  const [topic, setTopic] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setPlan(null);

    try {
      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: `Generate study plan for: ${topic}` }] }],
        config: {
          systemInstruction: "You are an expert academic planner. Create a highly professional, scannable study plan with realistic time slots, emoji guides, and breaks. Keep it encouraging and use natural Hinglish."
        }
      });

      setPlan(response.text || "Failed to generate plan.");
    } catch (error: any) {
      console.error("Plan generation error:", error);
      const msg = error?.message || "";
      const isKeyError = msg.includes("key") || msg.includes("401") || msg.includes("missing") || msg.includes("API_KEY");
      setPlan(isKeyError 
        ? "⚠️ API Key Invalid or Missing. Please ensure it is valid."
        : `Sorry, I encountered an error: ${msg}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, y: { type: "spring", stiffness: 300, damping: 20 } }}
      viewport={{ once: true }}
      className="glass p-6 rounded-3xl border-emerald-600/30 transition-all group bg-white shadow-sm flex flex-col h-[650px] relative overflow-hidden"
    >
      {/* Architectural Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl ${feature.bg} shadow-inner transition-transform group-hover:scale-110`}>
            <feature.icon className={`w-7 h-7 ${feature.color}`} />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-green-950 tracking-tight leading-none mb-1">{feature.title}</h3>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neon-green">{feature.label}</span>
          </div>
        </div>
        {plan && (
          <button 
            onClick={() => setPlan(null)}
            className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
            title="Clear plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-hide text-sm">
        {!plan && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-green-800/60 space-y-3">
            <Calendar className="w-10 h-10 text-emerald-200" />
            <p>Enter a subject or topic to generate a personalized study plan.</p>
          </div>
        )}
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-green-800/60 space-y-4">
            <NeuralLoader size="md" label="Crafting Plan" />
          </div>
        )}
        {plan && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-sm max-w-none prose-p:leading-snug prose-headings:text-green-900 prose-headings:mb-2 prose-p:my-1 prose-li:my-0"
          >
            <ReactMarkdown>{plan}</ReactMarkdown>
          </motion.div>
        )}
      </div>

      <div className="relative mt-auto shrink-0 flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="e.g., Quantum Physics"
          className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-green-950 min-w-0"
        />
        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isLoading}
          className="px-3 py-2.5 bg-emerald-600 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md shadow-emerald-100 font-medium text-sm shrink-0"
        >
          Generate
        </button>
      </div>
    </motion.div>
  );
}

function RevisionCard({ feature, index }: { feature: any, index: number }) {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<{ tips: string, questions: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingType, setPlayingType] = useState<"tips" | "questions" | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);

    try {
      const prompt = `Analyze: "${topic}". 
      1. Provide 5 highly effective "Instant Revision Tips".
      2. Generate a "Mini Question Paper" (5 questions: 2 short, 2 medium, 1 long).
      Provide in Markdown.`;

      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "You are a top academic coach. Provide clear revision tips and challenge questions. Use Hinglish naturally.",
        }
      });

      const text = response.text || "";
      const parts = text.split(/## Question Paper|## Mini Question Paper|Question Paper:/i);
      
      setResult({
        tips: parts[0].trim(),
        questions: parts[1] ? parts[1].trim() : "Question paper generation failed. Please try again."
      });
    } catch (error: any) {
      console.error("Revision error:", error);
      const msg = error?.message || "";
      if (msg.includes("API_KEY") || msg.includes("key") || msg.includes("missing")) {
        setError("⚠️ API Key invalid or missing.");
      } else {
        setError(`I encountered an error: ${msg}. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (type: "tips" | "questions") => {
    if (!result) return;
    const text = type === "tips" ? result.tips : result.questions;

    if (playingType === type) {
      window.speechSynthesis?.cancel();
      setPlayingType(null);
      return;
    }

    window.speechSynthesis?.cancel();
    setPlayingType(type);

    // Clean text for speech
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
      .trim();

    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    let currentSentenceIndex = 0;

    const speakChunk = () => {
      if (currentSentenceIndex >= sentences.length) {
        setPlayingType(null);
        return;
      }

      // Clean text for natural Indian pronunciation
      let cleanSentence = sentences[currentSentenceIndex].trim()
        .replace(/[*#_~]/g, '')
        .replace(/SwasthyaSaathi/g, 'Swasthya Saathi')
        .replace(/e\.g\./gi, 'for example')
        .trim();

      if (!cleanSentence) {
        currentSentenceIndex++;
        speakChunk();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanSentence);
      
      const voices = window.speechSynthesis?.getVoices() || [];
      // 1. Prioritize Hindi (hi-IN) - Most relatable
      let preferredVoice = voices.find(v => 
        (v.lang === 'hi-IN' || v.lang.startsWith('hi')) && v.name.toLowerCase().includes('google')
      ) || voices.find(v => 
        v.lang === 'hi-IN' || v.lang.startsWith('hi')
      );

      // 2. Fallback to Indian English (en-IN) - Better for Hinglish than US/UK
      if (!preferredVoice) {
        preferredVoice = voices.find(v => 
          v.lang === 'en-IN' && v.name.toLowerCase().includes('google')
        ) || voices.find(v => 
          v.lang === 'en-IN' && (v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('india'))
        ) || voices.find(v => 
          v.lang === 'en-IN'
        );
      }

      // 3. Last resort fallbacks
      if (!preferredVoice) {
        preferredVoice = voices.find(v => 
          v.name.toLowerCase().includes('india') || v.lang.includes('IN')
        ) || voices.find(v => 
          v.name.toLowerCase().includes('google')
        ) || voices.find(v => v.lang.includes('en-GB'));
      }

      if (preferredVoice) utterance.voice = preferredVoice;
      
      const isHindi = preferredVoice?.lang.startsWith('hi');
      utterance.pitch = isHindi ? 1.05 : 0.98;
      utterance.rate = isHindi ? 0.95 : 0.92;
      utterance.volume = 1.0;

      utterance.onend = () => {
        currentSentenceIndex++;
        // Small pause between sentences for natural flow
        setTimeout(speakChunk, isHindi ? 150 : 300);
      };

      utterance.onerror = (err: any) => {
        const errorMessage = err.error || String(err);
        if (errorMessage !== 'canceled' && errorMessage !== 'interrupted') {
          console.error("Speech error:", errorMessage);
        }
        setPlayingType(null);
      };

      window.speechSynthesis?.speak(utterance);
    };

    speakChunk();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, y: { type: "spring", stiffness: 300, damping: 20 } }}
      viewport={{ once: true }}
      className="glass p-6 rounded-3xl border-lime-600/30 transition-all group bg-white shadow-sm flex flex-col h-[650px] relative overflow-hidden"
    >
      {/* Architectural Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-lime-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl ${feature.bg} shadow-inner transition-transform group-hover:scale-110`}>
            <feature.icon className={`w-7 h-7 ${feature.color}`} />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-green-950 tracking-tight leading-none mb-1">{feature.title}</h3>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neon-green">{feature.label}</span>
          </div>
        </div>
        {result && (
          <button 
            onClick={() => setResult(null)}
            className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
            title="Clear results"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-hide text-sm">
        {!result && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-green-800/60 space-y-3">
            <Zap className="w-10 h-10 text-lime-200" />
            <p>Enter a topic to generate tips and a question paper.</p>
          </div>
        )}
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-green-800/60 space-y-4">
            <NeuralLoader size="md" label="Analyzing Node" />
          </div>
        )}
        {result && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {error && <div className="p-2 bg-red-50 text-[10px] text-red-500 font-bold border border-red-100 rounded-lg text-center mb-2">{error}</div>}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-lime-600 uppercase tracking-widest">Revision Tips</span>
                <button onClick={() => speak("tips")} className={`p-1 rounded-full transition-colors ${playingType === "tips" ? "bg-lime-500 text-white" : "text-lime-600 hover:bg-lime-50"}`}>
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="prose prose-sm prose-green bg-lime-50/30 p-3 rounded-xl border border-lime-50 max-w-none">
                <ReactMarkdown>{result.tips}</ReactMarkdown>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Question Paper</span>
                <button onClick={() => speak("questions")} className={`p-1 rounded-full transition-colors ${playingType === "questions" ? "bg-neon-green text-white" : "text-neon-green hover:bg-green-50"}`}>
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="prose prose-sm prose-green bg-green-50/50 p-3 rounded-xl border border-green-50 max-w-none">
                <ReactMarkdown>{result.questions}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative mt-auto shrink-0 flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Topic name..."
          className="flex-1 bg-lime-50/50 border border-lime-100 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-lime-500 transition-colors text-green-950 min-w-0"
        />
        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isLoading}
          className="px-3 py-2.5 bg-lime-600 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md shadow-lime-100 font-medium text-sm shrink-0"
        >
          {result ? "Regen" : "Go"}
        </button>
      </div>
    </motion.div>
  );
}

import { useHealth } from "../context/HealthContext";
import { Type } from "@google/genai";

function HealthCheckCard({ feature, index }: { feature: any, index: number }) {
  const { addHistoryRecord, history } = useHealth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    sleep: "",
    sleepTime: "",
    mood: "",
    study: "",
    stress: "",
    water: "",
    breaks: ""
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const questions = [
    { key: "sleep", q: "Kal raat kitne ghante soye aap?", options: ["< 5h", "5-7h", "7-9h", "9h+"] },
    { key: "sleepTime", q: "Sleep quality kaisi thi?", options: ["Poor", "Restless", "Good", "Deep"] },
    { key: "mood", q: "Abhi kaisa feel kar rahe hain?", options: ["Stressed", "Tired", "Neutral", "Positive"] },
    { key: "study", q: "Aaj kitni padhai ho chuki hai?", options: ["< 2h", "2-4h", "4-6h", "6h+"] },
    { key: "stress", q: "Kya workload pressure feel ho raha hai?", options: ["Not at all", "A little", "Somewhat", "Very much"] },
    { key: "water", q: "Paani kitna piya aaj?", options: ["Dehydrated", "1-2 Liters", "2-3 Liters", "Well Hydrated"] },
    { key: "breaks", q: "Study breaks ka kya haal hai?", options: ["Rarely", "Every 2h", "Every 1h", "Every 45m"] }
  ];

  const handleAnswer = (val: string) => {
    const newAnswers = { ...answers, [questions[step].key]: val };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = async (finalAnswers: typeof answers) => {
    setIsAnalyzing(true);
    
    // Get last 3 records for context
    const recentHistory = history.slice(0, 3).map(h => ({
      date: h.date,
      sleep: h.sleepHours,
      mood: h.mood,
      risk: h.burnoutRisk
    }));

    try {
      const prompt = `Analyze this student's health data. Be safe, empathetic, and encouraging like a mentor.
      
      Compare with recent history to provide 'Progress-Aware' tips. If they improved, appreciate them. If declining, warn gently.
      
      1. A personalized health tip (max 20 words) in professional yet relatable Hinglish.
      2. A safety status: "Safe", "At Risk", or "Problem Detected".
      3. Exactly 3 highly actionable recommendations based on CURRENT data AND HISTORY trends.

      Current Data:
      Sleep: ${finalAnswers.sleep} (${finalAnswers.sleepTime})
      Mood: ${finalAnswers.mood}
      Study: ${finalAnswers.study}
      Stress: ${finalAnswers.stress}
      Recent Trends: ${JSON.stringify(recentHistory)}`;

      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "You are SwasthyaSaathi, a wise and compassionate mentor. You analyze health trends to prevent student burnout.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthTip: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["Safe", "At Risk", "Problem Detected"] },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["healthTip", "status", "recommendations"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");

      const sleepProgress = finalAnswers.sleep === "Skipped" ? 50 : (finalAnswers.sleep === "< 5h" ? 30 : finalAnswers.sleep === "5-7h" ? 60 : 90);
      const moodProgress = finalAnswers.mood === "Skipped" ? 50 : (finalAnswers.mood === "Stressed" ? 20 : finalAnswers.mood === "Tired" ? 40 : finalAnswers.mood === "Neutral" ? 70 : 90);
      const studyProgress = finalAnswers.study === "Skipped" ? 50 : (finalAnswers.study === "< 2h" ? 20 : finalAnswers.study === "2-4h" ? 50 : finalAnswers.study === "4-6h" ? 80 : 100);
      const burnoutProgress = finalAnswers.stress === "Skipped" ? 50 : (finalAnswers.stress === "Not at all" ? 10 : finalAnswers.stress === "A little" ? 30 : finalAnswers.stress === "Somewhat" ? 60 : 90);

      addHistoryRecord({
        date: new Date().toISOString(),
        sleepHours: finalAnswers.sleep === "Skipped" ? "Not tracked" : finalAnswers.sleep,
        sleepTime: finalAnswers.sleepTime === "Skipped" ? "N/A" : finalAnswers.sleepTime,
        mood: finalAnswers.mood === "Skipped" ? "Not tracked" : finalAnswers.mood,
        studyHours: finalAnswers.study === "Skipped" ? "Not tracked" : finalAnswers.study,
        burnoutRisk: finalAnswers.stress === "Skipped" ? "Unknown" : (burnoutProgress > 70 ? "High" : burnoutProgress > 40 ? "Moderate" : "Low"),
        sleepProgress,
        moodProgress,
        studyProgress,
        burnoutProgress,
        healthTip: result.healthTip || "Stay balanced!",
        status: result.status || "Safe",
        recommendations: result.recommendations || []
      });
    } catch (error) {
      console.error("Health analysis error:", error);
    } finally {
      setIsAnalyzing(false);
      setStep(questions.length);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({
      sleep: "",
      sleepTime: "",
      mood: "",
      study: "",
      stress: "",
      water: "",
      breaks: ""
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, y: { type: "spring", stiffness: 300, damping: 20 } }}
      viewport={{ once: true }}
      id={`feature-card-${index}`}
      className="glass p-7 rounded-[32px] border-neon-green/30 transition-all group bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[650px] relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-green/5 rounded-full blur-3xl pointer-events-none group-hover:bg-neon-green/10 transition-colors" />
      <div className="absolute top-0 left-0 w-1 h-full bg-neon-green/20" />
      
      <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-[20px] ${feature.bg} shadow-sm group-hover:rotate-6 transition-transform border border-white`}>
            <feature.icon className={`w-6 h-6 ${feature.color}`} />
          </div>
          <div>
            <h3 className="text-xl font-black text-green-950 tracking-tight leading-none mb-1.5">{feature.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neon-green/60">{feature.label}</span>
              <div className="w-1 h-1 bg-neon-green/30 rounded-full" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-900/30">v2.0 Sync</span>
            </div>
          </div>
        </div>
        {step > 0 && (
          <button 
            onClick={reset}
            className="p-2.5 bg-green-50 hover:bg-neon-green/10 text-green-600 hover:text-neon-green rounded-xl transition-all active:scale-90"
            title="Restart check"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        {isAnalyzing ? (
          <div className="text-center space-y-6">
            <NeuralLoader size="lg" label="Analyzing Neural Patterns..." />
            <p className="text-xs font-bold text-green-800/40 uppercase tracking-widest animate-pulse">Comparing with history records</p>
          </div>
        ) : step < questions.length ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">Question {step + 1} of {questions.length}</span>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-4 bg-neon-green' : i < step ? 'w-2 bg-neon-green/40' : 'w-2 bg-green-100'}`} />
                  ))}
                </div>
              </div>
              <h4 className="text-2xl font-bold text-green-950 leading-tight tracking-tight">{questions[step].q}</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence mode="wait">
                {questions[step].options.map((opt) => (
                  <motion.button
                    key={opt}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(opt)}
                    className="p-4 rounded-[22px] border-2 border-green-50 hover:border-neon-green/40 hover:bg-green-50/50 transition-all text-sm font-bold text-green-900 text-center relative overflow-hidden group/btn shadow-sm hover:shadow-md"
                  >
                    <span className="relative z-10">{opt}</span>
                    <div className="absolute inset-0 bg-neon-green/5 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
            
            <button
              onClick={() => handleAnswer("Skipped")}
              className="w-full p-2 text-[10px] font-black uppercase tracking-[0.2em] text-green-800/30 hover:text-green-800/60 transition-colors"
            >
              Skip this metric
            </button>
          </div>
        ) : (
          <div className="text-center space-y-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 bg-neon-green/10 rounded-[28px] flex items-center justify-center mx-auto border-2 border-neon-green/20"
            >
              <CheckCircle2 className="w-10 h-10 text-neon-green" />
            </motion.div>
            <div className="space-y-3">
              <h4 className="text-2xl font-black text-green-950 tracking-tight">Sync Complete!</h4>
              <p className="text-sm font-medium text-green-800/60 leading-relaxed px-4">
                SwasthyaSaathi ne aapki metrics analyze kar li hain. Dashboad par check karein apna personalized <span className="text-neon-green font-bold">Neural Plan</span>.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <button
                onClick={() => {
                  const dashboard = document.getElementById('dashboard');
                  if (dashboard) dashboard.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-4 bg-neon-green text-green-950 rounded-2xl font-black uppercase tracking-widest hover:bg-[#00ff00] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all active:scale-95 text-sm"
              >
                View Dashboard
              </button>
              <button
                onClick={reset}
                className="w-full py-4 bg-green-50 text-green-900 rounded-2xl font-bold hover:bg-green-100 transition-all text-sm"
              >
                Retake Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ChapterAnalysisCard({ feature, index }: { feature: any, index: number }) {
  const [chapterName, setChapterName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    topics: Topic[];
    tips: string[];
  } | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyze = async () => {
    if (!chapterName.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const prompt = `Analyze the academic chapter: "${chapterName}". Provide a brief summary, 4-6 topics with descriptions and key points, and 3 specific tips. Respond in strictly valid JSON.`;

      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "You are a senior academic analyst. Break down complex chapters into simple, manageable topics using first principles. Use professional tone and Hinglish where appropriate. Response must be strictly valid JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              topics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    importance: { type: "string", enum: ["High", "Medium", "Low"] },
                    description: { type: "string" },
                    keyPoints: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "importance", "description", "keyPoints"]
                }
              },
              tips: { type: "array", items: { type: "string" } }
            },
            required: ["summary", "topics", "tips"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (err: any) {
      console.error("Chapter Analysis error:", err);
      const msg = err?.message?.toLowerCase() || "";
      const isKeyError = msg.includes("key") || msg.includes("401") || msg.includes("unauthorized") || msg.includes("missing");
      setError(isKeyError 
        ? "API Key missing or invalid. Check Secret keys."
        : "Failed to analyze chapter. Please check the name.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="glass p-6 rounded-3xl border-blue-600/30 transition-all group bg-white shadow-sm flex flex-col min-h-[500px] h-full relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${feature.bg}`}>
            <feature.icon className={`w-5 h-5 ${feature.color}`} />
          </div>
          <h3 className="text-base font-bold text-green-900">{feature.title}</h3>
        </div>
        {result && (
          <button 
            onClick={() => {
              setResult(null);
              setChapterName("");
            }}
            className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-hide text-sm">
        {!result && !isAnalyzing && (
          <div className="h-full flex flex-col items-center justify-center text-center text-green-800/60 pb-8">
            <BookOpen className="w-12 h-12 text-blue-200 mb-4" />
            <p className="font-medium mb-6">Enter a chapter name to begin deep analysis.</p>
            <div className="w-full relative">
              <input 
                type="text" 
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="e.g., Photosynthesis..."
                className="w-full bg-green-50/50 border border-green-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-all"
              />
              <button 
                onClick={handleAnalyze}
                disabled={!chapterName.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {error && <p className="text-[10px] text-red-500 mt-2 font-bold uppercase">{error}</p>}
          </div>
        )}

        {isAnalyzing && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-green-950">AI Analyst Active</p>
              <p className="text-[10px] text-green-800/40 uppercase tracking-widest font-black">Refining topics...</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 relative group/card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Chapter Gist</span>
                <button onClick={handleCopy} className="text-[10px] text-blue-400 hover:text-blue-600 font-bold uppercase">
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="prose prose-sm prose-blue max-w-none text-green-950/80 leading-relaxed font-medium">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-green-950 flex items-center gap-2">
                <List className="w-3.5 h-3.5 text-blue-600" />
                Refined Topics
              </h4>
              {result.topics.map((topic, i) => (
                <div 
                  key={i}
                  onClick={() => setExpandedTopic(expandedTopic === i ? null : i)}
                  className="p-3 bg-white border border-green-50 rounded-xl cursor-pointer hover:border-blue-200 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-green-900">{topic.title}</span>
                    <ChevronDown className={`w-4 h-4 text-green-200 transition-transform ${expandedTopic === i ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {expandedTopic === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="overflow-hidden pt-3 space-y-2"
                      >
                        <p className="text-xs text-green-800/60 italic leading-relaxed">"{topic.description}"</p>
                        <div className="space-y-1.5">
                          {topic.keyPoints.map((p, pi) => (
                            <div key={pi} className="flex gap-2 text-[10px] text-green-900 font-medium">
                              <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                              {p}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="p-4 bg-green-950 rounded-2xl text-white">
              <h4 className="text-xs font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Mastery Tips
              </h4>
              <div className="space-y-2">
                {result.tips.map((tip, i) => (
                  <div key={i} className="flex gap-2 text-[10px] text-green-50/70 font-medium">
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {!result && !isAnalyzing && (
        <div className="mt-auto pt-4 border-t border-green-50">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["Photosynthesis", "Thermodynamics", "Cell Division"].map(t => (
              <button 
                key={t}
                onClick={() => setChapterName(t)}
                className="whitespace-nowrap px-3 py-1 bg-green-50 hover:bg-green-100 rounded-full text-[10px] font-bold text-green-700 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

import { useTheme } from "../context/ThemeContext";

export default function FeatureCards() {
  const { theme } = useTheme();

  return (
    <section id="features" className={`py-32 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#051510]' : 'bg-green-50/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'bg-green-900/40 border-green-800 text-neon-green' : 'bg-green-100 border-green-200 text-green-700'}`}
          >
            <Zap className="w-3 h-3 fill-current" />
            Neural Capabilities
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-7xl font-display font-black mb-8 tracking-tighter leading-[0.9] ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}
          >
            Engineering <span className="neon-text italic">Student Success</span> <br /> 
            <span className="text-xl md:text-3xl font-bold tracking-widest uppercase opacity-40">Through Neural Insights</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className={`max-w-2xl mx-auto text-xl font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/70'}`}
          >
            Everything you need to master your curriculum while maintaining the cognitive agility of a top-tier performer.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            if (index === 0) {
              return (
                <div key={index} className="md:col-span-2">
                  <MiniChatCard feature={feature} index={index} />
                </div>
              );
            }
            if (index === 1) {
              return <StudyPlanCard key={index} feature={feature} index={index} />;
            }
            if (index === 2) {
              return <HealthCheckCard key={index} feature={feature} index={index} />;
            }
            if (index === 3) {
              return <RevisionCard key={index} feature={feature} index={index} />;
            }
            if (index === 4) {
              return <ChapterAnalysisCard key={index} feature={feature} index={index} />;
            }
            return null;
          })}
        </div>
      </div>
    </section>
  );
}

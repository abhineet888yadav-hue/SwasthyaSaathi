import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageCircle, Send, X, Bot, User, Loader2, Sparkles, 
  Trash2, BrainCircuit, Image as ImageIcon, Volume2, 
  Pause, Play, Activity, RefreshCw, AlertCircle,
  ThumbsUp, ThumbsDown, Mic, MicOff, Settings, Moon, Calendar
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useHealth } from "../context/HealthContext";
import { getGeminiAI } from "../lib/gemini";
import { ThinkingLevel, Modality } from "@google/genai";

import NeuralLoader from "./NeuralLoader";

interface Message {
  role: "user" | "model";
  content: string;
  image?: string;
  feedback?: 'up' | 'down';
  timestamp?: string;
}

import { useTheme } from "../context/ThemeContext";

export default function ChatbotWidget() {
  const { metrics, history, profile } = useHealth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "model", 
      content: "Namaste! I am SwasthyaSaathi, your AI Mentor. Padhai bhi, Health bhi! 📚💪\n\nI can help you clear academic doubts, manage study stress, or plan your routine. How are you feeling today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsLoadingId, setTtsLoadingId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{file: File, preview: string} | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(() => {
    try {
      return localStorage.getItem('swasthya_voice_uri');
    } catch {
      return null;
    }
  });

  // Keep voices list updated with better sorting for Indian users
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis?.getVoices() || [];
      
      // Sort: Popular Indian Google voices first, then other Indian voices, then high-quality English
      const sorted = [...allVoices].sort((a, b) => {
        const aLang = a.lang.toLowerCase();
        const bLang = b.lang.toLowerCase();
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        const aIsIndian = aLang.includes('in') || aName.includes('india');
        const bIsIndian = bLang.includes('in') || bName.includes('india');
        const aIsHindi = aLang.startsWith('hi');
        const bIsHindi = bLang.startsWith('hi');
        const aIsModern = aName.includes('google') || aName.includes('enhanced') || aName.includes('natural');
        const bIsModern = bName.includes('google') || bName.includes('enhanced') || bName.includes('natural');

        if (aIsHindi && !bIsHindi) return -1;
        if (!aIsHindi && bIsHindi) return 1;
        if (aIsIndian && !bIsIndian) return -1;
        if (!aIsIndian && bIsIndian) return 1;
        if (aIsModern && !bIsModern) return -1;
        if (!aIsModern && bIsModern) return 1;
        return 0;
      });

      setAvailableVoices(sorted);
      
      // Auto-select best Indian voice on first load if nothing specifically saved
      if (sorted.length > 0 && !localStorage.getItem('swasthya_voice_uri')) {
        const best = sorted.find(v => v.lang.startsWith('hi') && v.name.includes('Google')) || 
                     sorted.find(v => v.lang.startsWith('hi')) ||
                     sorted.find(v => v.lang.includes('IN')) ||
                     sorted[0];
        setSelectedVoiceURI(best.voiceURI);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Default to English (India)

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(prev => {
            const separator = prev.length > 0 ? ' ' : '';
            return prev + separator + finalTranscript.trim();
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        switch(event.error) {
          case 'not-allowed':
            setError("Microphone access denied. Please allow mic permissions in your browser settings to use voice input.");
            break;
          case 'no-speech':
            // Don't show error for no-speech, just stop listening silently
            break;
          case 'network':
            setError("Network error occurred during speech recognition. Please check your connection.");
            break;
          default:
            setError(`Speech recognition error: ${event.error}`);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Start listening error:", err);
      }
    }
  };

  const clearChat = () => {
    setMessages([
      { role: "model", content: "Chat cleared! Ready for your next question." }
    ]);
    setSelectedImage(null);
  };

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

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { 
      role: "user", 
      content: textToSend || (selectedImage ? "Analyze this image." : ""),
      image: selectedImage?.preview,
      timestamp
    };

    setMessages(prev => [...prev, userMessage].slice(-20));
    if (!overrideInput) setInput("");
    const imgToProcess = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    // Prepare Health Context for the AI
    const last7DaysHistory = history.slice(0, 7).map(h => ({
      date: new Date(h.date).toLocaleDateString(),
      sleep: h.sleepHours,
      mood: h.mood,
      study: h.studyHours,
      burnout: h.burnoutRisk,
      status: h.status
    }));

    const healthContextString = `
Current Student Health Metrics:
- Date: ${new Date(metrics.date).toLocaleDateString()}
- Sleep Hours: ${metrics.sleepHours} (${metrics.sleepTime})
- Current Mood: ${metrics.mood}
- Study Hours: ${metrics.studyHours}
- Burnout Risk Level: ${metrics.burnoutRisk}
- Overall Wellness Status: ${metrics.status}

User Academic Profile:
- Goal/Target: ${profile.goal}
- Motivation Style: ${profile.motivation}
- Study Method preference: ${profile.studyPreference}

Recent 7-Day History:
${last7DaysHistory.map(h => `- ${h.date}: Sleep ${h.sleep}, Mood ${h.mood}, Study ${h.study}, Burnout ${h.burnout} (${h.status})`).join('\n')}

Student Persona Analysis:
${history.length > 5 ? "User shows consistent academic focus but occasional sleep deprivation trends." : "New user, building neural profile."}
`;

    const contents: any[] = messages.slice(-5).map(m => ({ 
      role: m.role, 
      parts: [{ text: m.content }] 
    }));

    // Add user message with parts
    const userParts: any[] = [{ text: userMessage.content }];
    if (imgToProcess) {
      const base64 = await fileToBase64(imgToProcess.file);
      userParts.push({
        inlineData: {
          data: base64,
          mimeType: imgToProcess.file.type
        }
      });
    }
    contents.push({ role: "user", parts: userParts });

    const customSystemInstruction = `You are the **SwasthyaSaathi AI Mentor**, an expert companion for students. 
    
    SPECIAL CAPABILITY: **OCR & Vision Protocol**
    - You can "see" and "read" everything the user uploads.
    - If it's a photo of handwritten notes: Summarize them, find key concepts, and suggest 3 practice questions.
    - If it's a medical/health report: Explain the key findings in simple Hinglish, highlight any "At Risk" parameters, but remind them you are an AI, not a doctor.
    - If it's a study schedule: Optimize it based on their current burnout risk.

    Persona Alignment:
    - You are a wise, high-energy mentor. Use Hinglish naturally (e.g., "Ye concepts toh crystal clear ho jayenge!").
    - Remember their context: ${healthContextString}
    - If they are "At Risk" of burnout, be extra empathetic and suggest "Zen Protocol" (meditation).

    ${isDeepThinking ? 'MODE: [DEEP REASONING ACTIVE] - Perform advanced synthesis and high-energy academic coaching.' : 'MODE: [RAPID RESPONSE] - Quick motivational support.'}
    `;

    const callGemini = async (modelName: string, retryCount = 0): Promise<any> => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contents, 
            systemInstruction: customSystemInstruction,
            thinkingConfig: isDeepThinking ? { thinkingLevel: 'HIGH' } : undefined
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || "Server error");
        }

        return await response.json();
      } catch (err: any) {
        throw err;
      }
    };

    try {
      const initialModel = "gemini-3-flash-preview";
      const response = await callGemini(initialModel);

      setMessages(prev => {
        const modelMessage: Message = { 
          role: "model", 
          content: response.text || "I processed that, but have no words.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const newMessages = [...prev, modelMessage];
        return newMessages.slice(-20);
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      
      let userFriendlyError = "SwasthyaSaathi thoda thak gaya hai. Ek minute baad phir se try karein!";
      const msg = err?.message?.toLowerCase() || "";
      
      if (msg.includes("429") || msg.includes("quota")) {
        userFriendlyError = "Bahut saare students ek saath sawal pooch rahe hain! SwasthyaSaathi thoda overwhelmed hai. (Quota Limit)";
      } else if (msg.includes("safety") || msg.includes("blocked")) {
        userFriendlyError = "Hmm, ye topic safety guidelines ke khilaaf hai. Chaliye padhai ya health ki baat karte hain!";
      } else if (msg.includes("api key") || msg.includes("unauthorized") || msg.includes("configured") || msg.includes("missing")) {
        userFriendlyError = "Server configuration mein kuch kami hai. Please admin se contact karein ya thodi der mein try karein.";
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("offline")) {
        userFriendlyError = "Internet connection check karein, main aap tak nahi pahunch paa raha hoon!";
      } else if (msg.includes("500") || msg.includes("503")) {
        userFriendlyError = "Gemini servers thodi der ke liye so gaye hain. Refresh karke dekhein!";
      }

      setError(userFriendlyError);
      
      setMessages(prev => {
        const errMessage: Message = { 
          role: "model", 
          content: `⚠️ **Attention:**\n${userFriendlyError}\n\nI couldn't process your last request. You can try resending it or refreshing the chat.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return [...prev, errMessage].slice(-20);
      });
      
      // Auto-clear error notification after 8 seconds (X button still exists for manual dismissal)
      setTimeout(() => setError(null), 8000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (index: number, type: 'up' | 'down') => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[index].feedback === type) {
        delete newMessages[index].feedback;
      } else {
        newMessages[index].feedback = type;
      }
      return newMessages;
    });
  };

  const speakMessage = (index: number, text: string) => {
    if (playingId === index) {
      window.speechSynthesis?.cancel();
      setPlayingId(null);
      return;
    }

    window.speechSynthesis?.cancel();

    try {
      setTtsLoadingId(index);
      
      // 1. Text Cleaning for Indian Pronunciation (Phonetic help)
      let cleanText = text
        .replace(/[*#_~]/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/:\w+:/g, '')
        .replace(/e\.g\./gi, 'for example')
        .replace(/i\.e\./gi, 'that is')
        .replace(/etc\./gi, 'et cetera')
        .replace(/SwasthyaSaathi/g, 'Swasthya Saathi') 
        .replace(/:\s*\n/g, ': ') // Fix pauses at list starts
        .replace(/:/g, ', ') 
        .trim();

      // 2. Chunking into smaller bits for natural breath-work
      const chunks = cleanText.split(/([.?!])\s+/).reduce((acc: string[], curr, i, arr) => {
        if (i % 2 === 0) {
          const punctuation = arr[i+1] || '';
          const sentence = curr + punctuation;
          if (sentence.trim()) acc.push(sentence.trim());
        }
        return acc;
      }, []);

      let chunkIndex = 0;

      const playNextChunk = () => {
        if (chunkIndex >= chunks.length) {
          setPlayingId(null);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
        
        let voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (!voice) {
          voice = availableVoices.find(v => (v.lang.startsWith('hi') || v.lang.includes('IN')) && v.name.includes('Google')) ||
                  availableVoices.find(v => v.lang.startsWith('hi')) ||
                  availableVoices.find(v => v.lang.includes('IN'));
        }

        if (voice) utterance.voice = voice;
        
        // Natural Indian Cadence Configuration
        // Indian English is typically slower and slightly higher pitch than US English
        const isHindi = voice?.lang.startsWith('hi');
        utterance.pitch = isHindi ? 1.05 : 1.0;
        utterance.rate = isHindi ? 0.95 : 0.9; // Hindi can be slightly faster, English India should be deliberate
        utterance.volume = 1.0;

        utterance.onstart = () => {
          if (chunkIndex === 0) {
            setTtsLoadingId(null);
            setPlayingId(index);
          }
        };

        utterance.onend = () => {
          chunkIndex++;
          // Minimal overlap/gap for natural conversational flow
          setTimeout(playNextChunk, isHindi ? 200 : 350);
        };

        utterance.onerror = (err) => {
          if (err.error !== 'interrupted' && err.error !== 'canceled') {
            console.error("TTS Chunk Error:", err);
          }
          setPlayingId(null);
          setTtsLoadingId(null);
        };

        window.speechSynthesis?.speak(utterance);
      };

      if (chunks.length > 0) {
        playNextChunk();
      } else {
        setTtsLoadingId(null);
      }

    } catch (error) {
      console.error("Advanced TTS Failure:", error);
      setPlayingId(null);
      setTtsLoadingId(null);
    }
  };

  return (
    <div id="chatbot-widget" className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`w-[calc(100vw-32px)] sm:w-[450px] h-[80vh] max-h-[700px] min-h-[400px] rounded-[32px] shadow-2xl flex flex-col overflow-hidden mb-4 transition-colors duration-500 border ${theme === 'dark' ? 'bg-[#0a201a] border-green-900' : 'glass border-green-200 bg-white'}`}
          >
            {/* Header */}
            <div className={`p-4 backdrop-blur-md border-b shrink-0 flex items-center justify-between ${theme === 'dark' ? 'bg-green-950/80 border-green-900' : 'bg-green-50/80 border-green-100'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-green/10 rounded-xl relative">
                  <Bot className="w-5 h-5 text-neon-green" />
                  <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-green border-2 rounded-full animate-pulse ${theme === 'dark' ? 'border-green-950' : 'border-white'}`} />
                </div>
                <div>
                  <div className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>SwasthyaSaathi AI</div>
                  <div className="text-[10px] text-neon-green font-bold flex items-center gap-1 uppercase tracking-wider">
                    Padhai bhi, Health bhi
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsDeepThinking(!isDeepThinking)}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border-2 ${isDeepThinking ? 'bg-green-800 border-green-700 text-white shadow-lg shadow-green-900/20' : theme === 'dark' ? 'bg-green-900/40 border-green-800 text-green-300 hover:border-neon-green/50' : 'bg-white border-green-100 text-green-800 hover:border-neon-green/50'}`}
                  title={isDeepThinking ? "Deactivate Deep Thinking" : "Activate Deep Thinking"}
                >
                  <BrainCircuit className={`w-3.5 h-3.5 ${isDeepThinking ? 'animate-pulse text-neon-green' : ''}`} />
                  {isDeepThinking ? 'Deep ON' : 'Deep Mode'}
                </button>
                <button 
                  onClick={() => setShowSettings(!showSettings)} 
                  className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-green-900/40 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                  title="Voice Settings"
                >
                  <Settings className={`w-5 h-5 ${showSettings ? 'rotate-90' : ''} transition-transform`} />
                </button>
                <button 
                  onClick={clearChat} 
                  className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-green-900/40 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                  title="Refresh Chat"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setIsOpen(false)} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-green-900 text-white' : 'hover:bg-green-100 text-green-800'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`border-b overflow-hidden ${theme === 'dark' ? 'bg-green-950/20 border-green-900' : 'bg-green-50/30 border-green-100'}`}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>
                        Voice Personalization
                      </span>
                      <button onClick={() => setShowSettings(false)}>
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className={`text-[9px] font-bold uppercase tracking-tighter ${theme === 'dark' ? 'text-green-500/60' : 'text-green-950/40'}`}>
                        Select AI Persona Voice
                      </label>
                      <select 
                        value={selectedVoiceURI || ''}
                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                        className={`w-full p-2 text-xs rounded-xl border appearance-none cursor-pointer focus:ring-2 focus:ring-neon-green/30 transition-all ${theme === 'dark' ? 'bg-[#0a201a] border-green-900 text-white' : 'bg-white border-green-200 text-green-950'}`}
                      >
                        <option value="">Auto-Detect (Recommended)</option>
                        {/* Prioritize Indian Voices */}
                        {availableVoices
                          .filter(v => v.lang.includes('IN') || v.name.toLowerCase().includes('india'))
                          .map(voice => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                              🇮🇳 {voice.name}
                            </option>
                          ))}
                        <hr className="my-1 border-gray-200" />
                        {/* Other English Voices */}
                        {availableVoices
                          .filter(v => !v.lang.includes('IN') && !v.name.toLowerCase().includes('india') && v.lang.startsWith('en'))
                          .map(voice => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                              🌐 {voice.name}
                            </option>
                          ))}
                      </select>
                      <p className={`text-[8px] italic ${theme === 'dark' ? 'text-green-500/40' : 'text-green-800/40'}`}>
                        * Available voices depend on your system/browser capabilities.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide ${theme === 'dark' ? 'bg-[#051510]/50' : 'bg-white/50'}`}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => msg.role === "model" && speakMessage(i, msg.content)}
                      className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm transition-all ${
                        msg.role === "user" 
                          ? "bg-green-800" 
                          : theme === 'dark' 
                            ? `border ${playingId === i ? 'bg-neon-green/20 border-neon-green shadow-[0_0_15px_#39FF14]' : 'bg-green-900/40 border-green-800 hover:border-neon-green/50'}` 
                            : `border ${playingId === i ? 'bg-neon-green/10 border-neon-green shadow-lg' : 'bg-white border-green-100 hover:border-neon-green/50'}`
                      }`}
                      title={msg.role === "model" ? "Listen to response" : "User Profile"}
                    >
                      {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className={`w-5 h-5 ${playingId === i ? 'text-neon-green animate-pulse' : 'text-neon-green'}`} />}
                    </motion.button>
                    <div className="space-y-2">
                      <motion.div 
                        animate={playingId === i ? {
                          borderColor: theme === 'dark' ? ['#22c55e', '#166534', '#22c55e'] : ['#22c55e', '#86efac', '#22c55e'],
                          boxShadow: theme === 'dark' 
                            ? ['0 0 0px #22c55e', '0 0 15px #22c55e', '0 0 0px #22c55e']
                            : ['0 0 0px #22c55e', '0 0 10px #22c55e', '0 0 0px #22c55e']
                        } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`p-4 rounded-[24px] shadow-sm relative group border-2 transition-all duration-500 ${
                          msg.role === "user" 
                            ? "bg-green-800 text-white rounded-tr-none border-transparent" 
                            : theme === 'dark' 
                              ? `bg-green-900/40 text-gray-200 rounded-tl-none ${playingId === i ? 'border-green-500' : 'border-green-800'}` 
                              : `bg-white text-green-900 rounded-tl-none ${playingId === i ? 'border-green-500' : 'border-green-50'}`
                        }`}
                      >
                        {msg.image && (
                          <img src={msg.image} alt="User upload" className="w-full h-auto rounded-xl mb-3 border border-white/20" referrerPolicy="no-referrer" />
                        )}
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {msg.timestamp && (
                          <p className={`text-[9px] mt-1 ${msg.role === "user" ? "text-green-100" : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {msg.timestamp}
                          </p>
                        )}
                        
                        {msg.role === "model" && (
                          <>
                            <div className="absolute -bottom-3 -right-2 flex items-center gap-1">
                              <div className={`flex items-center gap-1 p-1 rounded-full shadow-lg border backdrop-blur-sm transition-all ${theme === 'dark' ? 'bg-green-950/90 border-green-900' : 'bg-white border-green-100'}`}>
                                <button
                                  onClick={() => handleFeedback(i, 'up')}
                                  className={`p-1.5 rounded-full transition-colors ${
                                    msg.feedback === 'up' 
                                      ? 'bg-green-100 text-green-600' 
                                      : theme === 'dark' ? 'text-gray-500 hover:text-green-400' : 'text-gray-400 hover:text-green-600'
                                  }`}
                                  title="Helpful"
                                >
                                  <ThumbsUp className={`w-3 h-3 ${msg.feedback === 'up' ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  onClick={() => handleFeedback(i, 'down')}
                                  className={`p-1.5 rounded-full transition-colors ${
                                    msg.feedback === 'down' 
                                      ? 'bg-red-100 text-red-600' 
                                      : theme === 'dark' ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'
                                  }`}
                                  title="Not helpful"
                                >
                                  <ThumbsDown className={`w-3 h-3 ${msg.feedback === 'down' ? 'fill-current' : ''}`} />
                                </button>
                              </div>

                              <button 
                                onClick={() => speakMessage(i, msg.content)}
                                disabled={ttsLoadingId !== null && ttsLoadingId !== i}
                                className={`p-2 rounded-full shadow-lg transition-all focus:ring-4 focus:ring-neon-green/20 overflow-hidden border ${
                                  playingId === i ? 'bg-neon-green text-white border-neon-green' : 
                                  ttsLoadingId === i ? 'bg-green-100 text-neon-green border-green-200' :
                                  theme === 'dark' 
                                    ? 'bg-[#0a201a] text-green-400 border-green-900 hover:scale-110' 
                                    : 'bg-white text-green-800 hover:scale-110 border-green-100 ring-4 ring-white'
                                }`}
                                title={playingId === i ? "Stop" : "Listen to response"}
                              >
                                <AnimatePresence mode="wait">
                                  {ttsLoadingId === i ? (
                                    <motion.div
                                      key="loading"
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0 }}
                                    >
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    </motion.div>
                                  ) : playingId === i ? (
                                    <motion.div
                                      key="playing"
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="flex items-center gap-1"
                                    >
                                      <div className="flex gap-0.5">
                                        {[0, 1, 2].map(v => (
                                          <motion.div
                                            key={v}
                                            animate={{ height: [4, 10, 4] }}
                                            transition={{ repeat: Infinity, duration: 0.6, delay: v * 0.1 }}
                                            className="w-0.5 bg-white rounded-full"
                                          />
                                        ))}
                                      </div>
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key="idle"
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0 }}
                                    >
                                      <Play className="w-4 h-4" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-9 h-9 rounded-2xl bg-white border border-green-100 flex items-center justify-center shadow-sm">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: isDeepThinking ? 360 : 0
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Bot className={`w-5 h-5 ${isDeepThinking ? 'text-green-800' : 'text-neon-green'}`} />
                      </motion.div>
                    </div>
                    <div className={`p-5 rounded-[28px] rounded-tl-none flex flex-col gap-3 min-w-[240px] shadow-sm border ${
                      isDeepThinking 
                        ? 'bg-gradient-to-br from-green-900 to-green-950 text-white border-green-800' 
                        : 'bg-white border-green-50 text-green-900'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <NeuralLoader size="sm" className="scale-75 origin-left" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-green leading-none mb-1">
                              {isDeepThinking ? 'Neural Reasoning' : 'Rapid Response'}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-green-800/40"> Swasthya Core v2.4 </span>
                          </div>
                        </div>
                        {isDeepThinking && (
                          <div className="flex gap-0.5">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ height: [4, 12, 4] }}
                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                className="w-0.5 bg-neon-green/40 rounded-full"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Loading Progress Visual */}
                      <div className="relative h-1.5 w-full bg-green-100/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: isDeepThinking ? 4 : 1.5, 
                            ease: "easeInOut" 
                          }}
                          className={`absolute inset-0 w-1/2 ${
                            isDeepThinking 
                              ? 'bg-gradient-to-r from-transparent via-neon-green to-transparent' 
                              : 'bg-neon-green'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <p className={`text-[10px] font-bold ${isDeepThinking ? 'text-white/90' : 'text-green-950'}`}>
                          {isDeepThinking ? 'Neural Reasoning Engine' : 'Rapid Response'}
                        </p>
                        <p className={`text-[9px] ${isDeepThinking ? 'text-white/50' : 'text-green-800/50'} font-medium italic`}>
                          {isDeepThinking 
                            ? "Parsing data, health history, and complex academic patterns..." 
                            : "Fetching the best advice for you..."}
                        </p>
                      </div>

                      {isDeepThinking && (
                        <div className="pt-2 border-t border-white/5 mt-1">
                          <div className="flex items-center justify-between text-[8px] font-bold text-neon-green/40 uppercase tracking-tighter">
                            <span>Logic Nodes: Active</span>
                            <span>Memory: 100%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input and Controls */}
            <div className={`p-4 backdrop-blur-md border-t shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a201a] border-green-900' : 'bg-white/80 border-green-100'}`}>
              
              {/* Quick Action Suggestions */}
              {!isLoading && messages.length < 4 && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-1 no-scrollbar scrollbar-hide">
                  {[
                    { label: "Study Tips", icon: Sparkles, text: "Mujhe aaj ke liye productive study tips chahiye." },
                    { label: "Doubt Solver", icon: BrainCircuit, text: "Explain a complex concept using a simple analogy." },
                    { label: "Burnout Check", icon: Activity, text: "Help me check if I'm reaching burnout." },
                    { label: "Relax Mode", icon: Moon, text: "Give me a quick 5-min relaxation exercise." }
                  ].map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      onClick={() => {
                        setInput(s.text);
                        // Trigger send after a tiny delay to show the text
                        setTimeout(() => handleSend(s.text), 100);
                      }}
                      className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${theme === 'dark' ? 'bg-green-900/40 border-green-800 text-neon-green hover:border-neon-green/50' : 'bg-white border-green-100 text-green-700 hover:border-neon-green shadow-sm'}`}
                    >
                      <s.icon className="w-3 h-3" />
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`mb-3 p-3 border rounded-xl flex items-center justify-between gap-3 text-xs font-medium shadow-sm transition-colors ${theme === 'dark' ? 'bg-red-950/20 border-red-900 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{error}</span>
                    </div>
                    <button 
                      onClick={() => setError(null)}
                      className={`p-1 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-red-900/40' : 'hover:bg-red-100'}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="flex flex-col gap-2 relative">
                {isListening && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-neon-green/90 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-20"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-0.5 bg-white rounded-full" />
                      ))}
                    </div>
                    Listening...
                  </motion.div>
                )}
                
                <div className="flex items-end gap-2 relative">
                  <div className="flex flex-col gap-1.5">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-3 rounded-2xl transition-all shadow-sm border group/btn ${theme === 'dark' ? 'bg-green-950/40 border-green-900 text-green-400 hover:border-neon-green/30' : 'bg-green-50/50 border-green-100 text-green-600 hover:border-neon-green/30'}`}
                      title="Upload notes/reports for scanning"
                    >
                      <ImageIcon className="w-5 h-5 group-hover/btn:text-neon-green transition-colors" />
                    </motion.button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const preview = URL.createObjectURL(file);
                        setSelectedImage({file, preview});
                      }
                    }} />
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={isListening ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0px #39FF14', '0 0 15px #39FF14', '0 0 0px #39FF14'] } : {}}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      onClick={toggleListening}
                      className={`p-3 rounded-2xl transition-all shadow-sm border ${isListening ? 'bg-neon-green text-white border-neon-green' : theme === 'dark' ? 'bg-green-950/40 border-green-900 text-green-400 hover:border-neon-green/30' : 'bg-green-50/50 border-green-100 text-green-600 hover:border-neon-green/30'}`}
                      title={isListening ? "Stop listening" : "Voice input"}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className={`w-5 h-5 ${isListening ? '' : 'hover:text-neon-green transition-colors'}`} />}
                    </motion.button>
                  </div>

                  <div className="flex-1 relative">
                    <AnimatePresence>
                      {selectedImage && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0, y: 10 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.8, opacity: 0, y: 10 }}
                          className="absolute -top-16 left-2 z-20"
                        >
                          <div className="relative">
                             <img src={selectedImage.preview} className="w-14 h-14 object-cover rounded-xl border-2 border-neon-green shadow-[0_0_15px_#39FF1450]" />
                             <button 
                               onClick={() => setSelectedImage(null)} 
                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 active:scale-95 transition-all border border-white/20"
                             >
                               <X className="w-3 h-3" />
                             </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={isListening ? "Listening..." : selectedImage ? "Analyzing your document..." : "Doubt clear karein? Stress manage karein?"}
                      className={`w-full p-4 pr-14 rounded-[28px] text-sm resize-none focus:outline-none focus:ring-4 focus:ring-neon-green/10 transition-all min-h-[56px] max-h-[150px] shadow-inner font-medium placeholder:italic ${theme === 'dark' ? 'bg-green-950/40 border-green-900 text-white placeholder:text-gray-600' : 'bg-green-50/40 border-green-100 text-green-950 placeholder:text-green-800/30'}`}
                    />
                    
                    <motion.button
                      whileHover={input.trim() || selectedImage ? { scale: 1.05 } : {}}
                      whileTap={input.trim() || selectedImage ? { scale: 0.95 } : {}}
                      onClick={() => handleSend()}
                      disabled={(!input.trim() && !selectedImage) || isLoading}
                      className={`absolute bottom-2 right-2 p-3 rounded-2xl transition-all shadow-md ${input.trim() || selectedImage ? 'bg-neon-green text-black hover:shadow-[0_0_20px_#39FF14]' : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-30 shadow-none'}`}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                <div className="mt-2 text-[9px] text-green-800/40 text-center flex items-center justify-center gap-3 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-neon-green" /> Vision AI</span>
                  <span className="flex items-center gap-1"><BrainCircuit className="w-3 h-3 text-neon-green" /> Reasoning</span>
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-neon-green" /> Speakable</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-green-800 rounded-[24px] flex items-center justify-center shadow-2xl relative group overflow-hidden border-2 border-neon-green/20"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="relative z-10"
        >
          {isOpen ? <X className="w-8 h-8 text-white" /> : <MessageCircle className="w-8 h-8 text-white" />}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-tr from-green-900 to-green-700 opacity-50" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-tl-xl border-2 border-green-800 animate-pulse" />
      </motion.button>
    </div>
  );
}

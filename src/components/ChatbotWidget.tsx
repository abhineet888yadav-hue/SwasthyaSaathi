import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageCircle, Send, X, Bot, User, Loader2, Sparkles, 
  Trash2, BrainCircuit, Image as ImageIcon, Volume2, 
  Pause, Play, Activity, RefreshCw, AlertCircle,
  ThumbsUp, ThumbsDown, Mic, MicOff, Settings
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useHealth } from "../context/HealthContext";
import { ai } from "../lib/gemini";
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
  const { metrics, history } = useHealth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "model", 
      content: "Namaste! I am SwasthyaSaathi. I can now see images, think deeply, and even speak! How can I help you today?",
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

  useEffect(() => {
    try {
      localStorage.setItem('swasthya_voice_uri', selectedVoiceURI || '');
    } catch {
      // Ignore
    }
  }, [selectedVoiceURI]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Pre-load voices for SpeechSynthesis
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };

    loadVoices();

    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices);
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

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { 
      role: "user", 
      content: input || (selectedImage ? "Analyze this image." : ""),
      image: selectedImage?.preview,
      timestamp
    };

    setMessages(prev => [...prev, userMessage].slice(-20));
    setInput("");
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
- Sleep: ${metrics.sleepHours} (${metrics.sleepTime})
- Mood: ${metrics.mood}
- Study Hours: ${metrics.studyHours}
- Burnout Risk: ${metrics.burnoutRisk}
- Overall Status: ${metrics.status}

Recent 7-Day History:
${last7DaysHistory.map(h => `- ${h.date}: Sleep ${h.sleep}, Mood ${h.mood}, Study ${h.study}, Burnout ${h.burnout} (${h.status})`).join('\n')}
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

    const customSystemInstruction = isDeepThinking 
      ? `You are SwasthyaSaathi (Advanced Synthesis Mode). You are the ultimate AI Neural Mentor.
      - TONE: High-energy, elite academic coach. Use "Super Hinglish" - mixing complex technical English with motivating Hindi.
      - TTS GUIDANCE: Keep sentences relatively short. Minimize intense technical punctuation (like nested parentheses or heavy colon usage) as this makes TTS awkward. Keep Hinglish conversational and easy to pronounce for a standard browser voice.
      - GOAL: Provide deep, first-principles analysis of questions.
      - CONTEXT: Use the user's health history to caution them if they are studying too much during burnout.
      - STRUCTURE: Use headings like: [ANALYSIS], [NEURAL_MAPPING], [ACTION_PLAN].

${healthContextString}

Use the above user data to personalize your deep reasoning.`
      : `You are SwasthyaSaathi, the empathetic student mentor.
      - TONE: Friendly, motivational, and light. Natural Hinglish (e.g., "Arre waah, progress toh solid hai!").
      - TTS GUIDANCE: Keep sentences conversational and clear. Use simple structure so it flows well when read aloud.
      - GOAL: Quick doubt clearing and stress relief.
      - STRUCTURE: Short paragraphs, emojis, and clear advice.

${healthContextString}

Refer to this data to suggest specific improvements in their daily routine.`;

    const callGemini = async (modelName: string, retryCount = 0): Promise<any> => {
      try {
        return await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: customSystemInstruction,
            thinkingConfig: isDeepThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined
          }
        });
      } catch (err: any) {
        const msg = err?.message?.toLowerCase() || "";
        const isQuotaError = msg.includes("429") || msg.includes("quota");
        
        // If it's a quota error and we haven't tried the lightest model yet
        if (isQuotaError && retryCount < 2) {
          console.warn(`Quota hit for ${modelName}, falling back...`);
          const fallbackModel = retryCount === 0 ? "gemini-3-flash-preview" : "gemini-3.1-flash-lite-preview";
          return await callGemini(fallbackModel, retryCount + 1);
        }
        throw err; // Rethrow if not a quota error or out of retries
      }
    };

    try {
      const initialModel = isDeepThinking || imgToProcess ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
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
      
      let userFriendlyError = "I hit a glitch in my neural network. Please try again!";
      const msg = err?.message?.toLowerCase() || "";
      
      if (msg.includes("429") || msg.includes("quota")) {
        userFriendlyError = "I'm a bit overwhelmed with requests right now! Please wait a moment before asking again. (Quota Limit)";
      } else if (msg.includes("safety") || msg.includes("blocked")) {
        userFriendlyError = "I can't answer that because it might violate safety guidelines. Let's talk about something else!";
      } else if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("key")) {
        userFriendlyError = "API Key is missing or invalid. If you are on Netlify, please add 'VITE_GEMINI_API_KEY' to your environment variables.";
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("offline")) {
        userFriendlyError = "I can't reach the internet! Please check your connection.";
      } else if (msg.includes("500") || msg.includes("503")) {
        userFriendlyError = "The Gemini servers are currently having a nap. Try again in a few seconds!";
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
    // If clicking the currently playing message, stop it
    if (playingId === index) {
      window.speechSynthesis?.cancel();
      setPlayingId(null);
      return;
    }

    // Stop and clear everything
    window.speechSynthesis?.cancel();

    try {
      setTtsLoadingId(index);
      
      // Advanced Cleaning: Better handle Hinglish, pauses, and abbreviations for natural TTS
      let cleanText = text
        .replace(/[*#_~]/g, '') // Remove markdown
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
        .replace(/:\w+:/g, '') // Remove emoji shortcodes
        .replace(/e\.g\./gi, 'for example')
        .replace(/i\.e\./gi, 'that is')
        .replace(/SwasthyaSaathi/g, 'Swasthya Sathi') // Improve pronunciation
        .replace(/:/g, ', ') // Replace colon with a comma for a natural pause
        .replace(/(\.|\!|\?|\n)/g, '$1.. ') // Add pause after terminal punctuation
        .replace(/[^\x00-\x7F]/g, "") // Remove emojis/non-ascii for stability
        .replace(/\s+/g, ' ') // Clean up extra spaces
        .trim();

      // Split into logical chunks (sentences) for more natural pauses
      const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
      let currentSentenceIndex = 0;

      const playNextSentence = () => {
        if (currentSentenceIndex >= sentences.length) {
          setPlayingId(null);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentences[currentSentenceIndex].trim());
        
        // Manual Voice Selection or Dynamic Fallback
        let preferredVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        
        if (!preferredVoice) {
          // Prioritize high-quality Google voices if available
          preferredVoice = availableVoices.find(v => 
            v.name.toLowerCase().includes('google')
          ) || availableVoices.find(v => 
            (v.lang === 'en-IN' && v.name.toLowerCase().includes('enhanced')) ||
            (v.lang === 'hi-IN' && v.name.toLowerCase().includes('enhanced'))
          ) || availableVoices.find(v => 
            v.lang === 'en-IN' || v.lang === 'hi-IN'
          ) || availableVoices.find(v => 
            v.name.toLowerCase().includes('india') || v.lang.includes('IN')
          ) || availableVoices.find(v => v.lang.includes('UK'));
        }

        if (preferredVoice) utterance.voice = preferredVoice;
        
        // Mentor Tone Configuration
        utterance.pitch = 0.95; // Slightly lower pitch for a calmer, more empathetic tone
        utterance.rate = 0.95;  // Slightly slower rate for deliberate, mentor-like speech
        utterance.volume = 1.0;

        utterance.onstart = () => {
          if (currentSentenceIndex === 0) {
            setTtsLoadingId(null);
            setPlayingId(index);
          }
        };

        utterance.onend = () => {
          currentSentenceIndex++;
          // Add a small pause between sentences to simulate human breathing
          setTimeout(playNextSentence, 300);
        };

        utterance.onerror = (err: any) => {
          const errorMessage = err.error || err;
          if (errorMessage !== 'canceled') {
            console.error("Speech sentence error:", errorMessage);
          }
          setPlayingId(null);
          setTtsLoadingId(null);
        };

        window.speechSynthesis?.speak(utterance);
      };

      if (sentences.length > 0) {
        playNextSentence();
      } else {
        setTtsLoadingId(null);
      }

    } catch (error: any) {
      console.error("Advanced TTS error:", error);
      setTtsLoadingId(null);
      setPlayingId(null);
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
                    Multimodal Core Active
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
                    <div className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === "user" ? "bg-green-800" : theme === 'dark' ? "bg-green-900/40 border border-green-800" : "bg-white border border-green-100"}`}>
                      {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-neon-green" />}
                    </div>
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

              {selectedImage && (
                <div className="mb-3 flex items-center gap-2">
                  <div className="relative">
                    <img src={selectedImage.preview} className="w-12 h-12 rounded-xl border-2 border-neon-green object-cover" referrerPolicy="no-referrer" />
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-green-400/60' : 'text-green-800/60'}`}>Ready to analyze...</span>
                </div>
              )}
              
              <div className="flex gap-2 items-center">
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
                <button 
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl transition-all relative group ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' : theme === 'dark' ? 'bg-green-900/40 text-green-400 hover:bg-green-900/60' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isListening && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 rounded-2xl transition-all ${selectedImage ? 'bg-neon-green text-white' : theme === 'dark' ? 'bg-green-900/40 text-green-400 hover:bg-green-900/60' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={isDeepThinking ? "Ask a complex doubt..." : "Ask me anything..."}
                    className={`w-full border rounded-2xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:border-neon-green transition-all focus:ring-4 focus:ring-neon-green/5 font-medium ${theme === 'dark' ? 'bg-green-950/40 border-green-900 text-white shadow-inner' : 'bg-green-50/50 border-green-100 text-green-950'}`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && !selectedImage) || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-neon-green text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-neon-green/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-[9px] text-green-800/40 text-center flex items-center justify-center gap-3 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-neon-green" /> Vision AI</span>
                <span className="flex items-center gap-1"><BrainCircuit className="w-3 h-3 text-neon-green" /> Reasoning</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-neon-green" /> Speakable</span>
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, ExternalLink, X, Check, AlertCircle, Info } from 'lucide-react';
import { setLocalGeminiKey, getGeminiAI } from '../lib/gemini';

export default function GeminiKeyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the key is missing globally to show the modal initially
    try {
      getGeminiAI();
    } catch (err: any) {
      if (err.message === 'API_KEY_MISSING') {
        // We only show it automatically if specifically asked or on failure
        // For now, we'll let users trigger it or show if missing
        setIsOpen(true);
      }
    }
    
    // Check if we already have a local key to populate the field
    const localKey = localStorage.getItem('SW_GEMINI_KEY');
    if (localKey) setApiKey(localKey);
  }, []);

  const handleSave = () => {
    if (apiKey.trim().length < 10) return;
    setLocalGeminiKey(apiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsOpen(false);
      // Refresh to apply changes if needed, or just let components retry
      window.location.reload();
    }, 1500);
  };

  return (
    <>
      {/* Small floating trigger if closed but key missing */}
      <AnimatePresence>
        {!isOpen && !import.meta.env.VITE_GEMINI_API_KEY && !localStorage.getItem('SW_GEMINI_KEY') && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-[60] bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2 group"
          >
            <AlertCircle size={20} className="animate-pulse" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-black uppercase tracking-tighter">
              Fix AI Key Missing!
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#051510] border border-neon-green/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(57,255,20,0.1)]"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-neon-green/10 rounded-xl">
                      <Key className="text-neon-green" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-black text-white tracking-tight">AI Key Setup</h2>
                      <p className="text-neon-green/60 text-xs font-black uppercase tracking-widest">Neural Configuration</p>
                    </div>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <div className="flex items-start gap-3">
                      <Info size={18} className="text-neon-green mt-0.5 shrink-0" />
                      <div className="text-sm text-gray-300 leading-relaxed">
                        <p className="font-bold text-white mb-2 underline decoration-neon-green/30">Oho! AI works nahi kar raha?</p>
                        <p>Boss, AI functions (Chatbot, Study Plans, Image Gen) ke liye <span className="text-neon-green font-bold">Gemini API Key</span> chahiye hoti hai. Ye ekdum FREE hai!</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Step-by-Step Instructions:</h3>
                    <ol className="text-sm text-gray-400 space-y-3 pl-4 list-decimal">
                      <li>
                        Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-neon-green hover:underline inline-flex items-center gap-1">
                          Google AI Studio <ExternalLink size={12} />
                        </a>.
                      </li>
                      <li>Click on <span className="text-white font-bold">"Create API key"</span> button.</li>
                      <li>Copy karke yahan input box mein paste kar do.</li>
                      <li><span className="italic text-neon-green/80">Tip: Ye key sirf aapke browser mein save hogi, tension mat lo!</span></li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={isVisible ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your API Key here (AIza...)"
                        className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm focus:outline-none focus:border-neon-green/50 transition-all placeholder:text-gray-700"
                      />
                      <button 
                        onClick={() => setIsVisible(!isVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-green transition-colors text-xs font-black uppercase tracking-tighter"
                      >
                        {isVisible ? "Hide" : "Show"}
                      </button>
                    </div>

                    <button
                      disabled={apiKey.trim().length < 10 || isSaved}
                      onClick={handleSave}
                      className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] transition-all ${
                        isSaved 
                          ? 'bg-green-500 text-white' 
                          : 'bg-neon-green text-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check size={20} />
                          Saved! Reloading...
                        </>
                      ) : (
                        <>
                          <Check size={20} />
                          Save API Key
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-4 bg-black/50 border-t border-white/5 flex items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">SwasthyaSaathi Secures Your Neural Node</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

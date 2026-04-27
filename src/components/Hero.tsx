import { motion, useMotionValue, useSpring } from "motion/react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    setIsMounted(true);
    
    // Delay loading the heavy 3D models slightly to prioritize UI interactivity
    const timer = setTimeout(() => setShowModels(true), 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className={`relative pt-32 pb-20 overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#051510]' : 'bg-white'}`}>
      {/* Background Glows */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className={`absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[80px] ${theme === 'dark' ? 'bg-neon-green/10' : 'bg-neon-green/5'}`} 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className={`absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[80px] ${theme === 'dark' ? 'bg-green-400/5' : 'bg-green-200/10'}`} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="relative z-10">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs mb-8 font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-green-900/40 border-neon-green/30 text-neon-green shadow-[0_0_15px_rgba(57,255,20,0.1)]' : 'bg-green-50 border-green-200 text-green-700 shadow-sm'}`}>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Padhai bhi, Health bhi • AI Mentor</span>
              </div>
              <h1 className={`text-6xl md:text-8xl font-display font-black leading-[0.9] mb-8 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                Scale Your <span className="neon-text italic">Study Power</span> with AI
              </h1>
              <p className={`text-xl md:text-2xl mb-10 max-w-xl leading-relaxed font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/70'}`}>
                SwasthyaSaathi handles your <span className="text-neon-green">burnout</span> and <span className="text-neon-green">doubts</span> so you can focus on mastering your goals. 
                <span className="block mt-2 opacity-60">Ab study hogi bina kisi stress ke!</span>
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/signup"
                  className="bg-neon-green text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform neon-glow flex items-center gap-2"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-80 transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'glass text-green-900'}`}
                >
                  See Demo
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[500px] sm:h-[600px] lg:h-[700px] w-full"
          >
            <div className="w-full h-full relative z-10">
              {/* Background Glow */}
              <div className={`absolute inset-0 rounded-full blur-3xl -z-10 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-gradient-to-tr from-green-100 to-green-50'}`} />
              
              {isMounted && (
                <div className={`w-full h-full relative z-10 overflow-hidden rounded-3xl border shadow-2xl group ${theme === 'dark' ? 'bg-green-950/40 border-green-900' : 'bg-white border-green-100'}`}>
                  <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-1000 z-0 ${isIframeLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${theme === 'dark' ? 'bg-green-950/80' : 'bg-green-50/50'}`}>
                    <Loader2 className="w-10 h-10 text-neon-green animate-spin" />
                    <span className={`text-sm font-bold animate-pulse ${theme === 'dark' ? 'text-green-400/60' : 'text-green-800/60'}`}>Initializing AI Core...</span>
                  </div>
                  {showModels && (
                    <motion.iframe 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isIframeLoaded ? 1 : 0 }}
                      transition={{ duration: 1 }}
                      src="https://my.spline.design/nexbotrobotcharacterconcept-5xDdgaaXYPJt26AVkcadnlqw/" 
                      frameBorder="0" 
                      width="100%" 
                      height="100%"
                      className="w-full h-full scale-110 relative z-10"
                      title="NexBot 3D Model"
                      loading="lazy"
                      onLoad={() => setIsIframeLoaded(true)}
                    ></motion.iframe>
                  )}
                </div>
              )}
              
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

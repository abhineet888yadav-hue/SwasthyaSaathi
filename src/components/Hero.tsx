import { motion, useMotionValue, useSpring } from "motion/react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

import { useTheme } from "../context/ThemeContext";

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  useEffect(() => {
    setIsMounted(true);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Delay loading the heavy 3D models slightly to prioritize UI interactivity
    const timer = setTimeout(() => setShowModels(true), 1500);
    
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className={`relative pt-32 pb-20 overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#051510]' : 'bg-white'}`}>
      {/* Integrated Neural Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 opacity-[0.05] ${theme === 'dark' ? 'invert' : ''}`} style={{ backgroundImage: 'radial-gradient(#39FF14 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-1/4 -right-1/4 w-full h-full rounded-full blur-[160px] opacity-20 ${theme === 'dark' ? 'bg-neon-green' : 'bg-green-300'}`} 
        />
      </div>

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
              <h1 className={`text-5xl md:text-8xl font-display font-black leading-[0.9] mb-8 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                The Neural <span className="neon-text italic">Study Path</span> <br />
                <span className="text-xl md:text-3xl font-bold tracking-widest uppercase opacity-40">for Smart Students</span>
              </h1>
              <p className={`text-xl md:text-2xl mb-10 max-w-xl leading-relaxed font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/70'}`}>
                SwasthyaSaathi balances your <span className="text-neon-green font-black underline decoration-neon-green/30 underline-offset-4">burnout</span> and cognitive state so you can focus on mastering your academic peak. 
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                <button 
                  onClick={() => scrollToSection(user ? 'dashboard' : 'signup')}
                  className="bg-neon-green text-green-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-neon-green/20 flex items-center gap-2 group"
                >
                  {user ? "Personal Dashboard" : "Start Neural Path"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {!user && (
                    <button 
                      onClick={() => navigate('/signin')}
                      className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${theme === 'dark' ? 'bg-transparent border-green-900 text-white hover:border-neon-green' : 'bg-transparent border-green-100 text-green-900 hover:border-neon-green'}`}
                    >
                      Sign In
                    </button>
                )}
              </div>

              {/* Social Proof */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-4 py-4 border-l-2 border-neon-green/30 pl-6"
              >
                <div className="flex -space-x-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'}`}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="User" className="w-full h-full rounded-full" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>10k+ Students</p>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-neon-green/60' : 'text-green-700/60'}`}>Mastering Studies & Health</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative w-full aspect-square sm:aspect-video lg:aspect-[4/3] max-h-[700px] flex items-center justify-center"
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
                      title="SwasthyaSaathi 3D Model"
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2 } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatbotWidget from "./components/ChatbotWidget";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Auth from "./components/Auth";

import { HealthProvider } from "./context/HealthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

import NeuralLoader from "./components/NeuralLoader";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";

function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const { theme } = useTheme();

  const loadingStatuses = [
    "Initializing Neural Core...",
    "Calibrating Empathy Modules...",
    "Booting Hinglish Persona...",
    "Syncing Academic Mastery Nodes...",
    "Saathi is warming up...",
    "Bas thoda sa aur, Boss! Connecting...",
    "Neural Network: Optimal ✅"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });

    const statusInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingStatuses.length - 1 ? prev + 1 : prev));
    }, 450);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
      clearInterval(statusInterval);
    };
  }, []);

  const isUnverified = user && !user.emailVerified;

  if (isLoading || isAuthChecking) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-[#051510]' : 'bg-white'}`}
        >
          {/* Enhanced Neural Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#39FF14 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
            
            {/* Pulsing Glows */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                x: [-20, 20, -20],
                y: [-20, 20, -20]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -top-1/4 -left-1/4 w-full h-full bg-neon-green/10 rounded-full blur-[120px]"
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.05, 0.15, 0.05],
                x: [20, -20, 20],
                y: [20, -20, 20]
              }}
              transition={{ duration: 12, repeat: Infinity }}
              className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-neon-green/5 rounded-full blur-[120px]"
            />
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-12"
          >
            <NeuralLoader size="lg" />
          </motion.div>
          
          <div className="text-center space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <h1 className={`text-5xl md:text-7xl font-display font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                SWASTHYA <span className="neon-text italic">SAATHI</span>
              </h1>
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-neon-green/50" />
                <span className="text-[12px] font-black uppercase tracking-[0.6em] text-neon-green drop-shadow-[0_0_8px_#39FF14]">Neural Student Mentor</span>
                <div className="h-[1px] w-8 bg-neon-green/50" />
              </div>
            </motion.div>

            <motion.div 
              key={loadingStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[1.5rem]"
            >
              <span className={`text-[12px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-neon-green/20 ${theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'}`}>
                {loadingStatuses[loadingStep]}
              </span>
            </motion.div>
          </div>

          <div className="absolute bottom-16 px-8 w-full max-w-sm space-y-4">
            <div className={`w-full h-1.5 rounded-full overflow-hidden p-[1px] ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-green-50 border border-green-100'}`}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.5, ease: "easeInOut" }}
                className="h-full bg-neon-green shadow-[0_0_20px_#39FF14] rounded-full"
              />
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-neon-green/40">Syncing Neurons...</span>
              <motion.span 
                animate={{ opacity: [1, 0.5, 1] }} 
                transition={{ duration: 1, repeat: Infinity }}
                className="text-[10px] font-black uppercase tracking-widest text-neon-green"
              >
                Quantum Stable
              </motion.span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen selection:bg-neon-green selection:text-white flex flex-col transition-colors duration-500 overflow-x-hidden ${theme === 'dark' ? 'bg-[#051510] text-gray-100' : 'bg-white text-green-900'}`}
    >
      <Navbar />
      <main className="flex-1">
        {isUnverified ? (
          <Auth />
        ) : (
          <AnimatePresence mode="wait">
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </PageTransition>
          </AnimatePresence>
        )}
      </main>
      <Footer />
      {!isUnverified && <ChatbotWidget />}
    </motion.div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HealthProvider>
        <BrowserRouter>
          <MainContent />
        </BrowserRouter>
      </HealthProvider>
    </ThemeProvider>
  );
}


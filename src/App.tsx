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
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Verification from "./components/Verification";
import Profile from "./components/Profile";

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

function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const { theme } = useTheme();

  const loadingStatuses = [
    "Initializing Neural Core...",
    "Calibrating Empathy Modules...",
    "Booting Hinglish Persona...",
    "Syncing Academic Mastery Nodes...",
    "Almost there, Boss! Bas ho gaya..."
  ];

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingStatuses.length - 1 ? prev + 1 : prev));
    }, 600);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3200);

    return () => {
      clearTimeout(timer);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-[#051510]' : 'bg-white'}`}
        >
          {/* Neural Grid Background */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#39FF14 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-neon-green/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative mb-12">
            <NeuralLoader size="lg" />
          </div>
          
          <div className="text-center space-y-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <h1 className={`text-4xl md:text-5xl font-display font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                SWASTHYA <span className="neon-text italic">SAATHI</span>
              </h1>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neon-green/60 mt-1 pl-2">Neural Student Mentor</span>
            </motion.div>

            <motion.div 
              key={loadingStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-3 justify-center min-h-[1.5rem]`}
            >
              <span className={`text-[11px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>
                {loadingStatuses[loadingStep]}
              </span>
            </motion.div>
          </div>

          <div className="absolute bottom-20 px-8 w-full max-w-xs space-y-2">
            <div className={`w-full h-1 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-green-50'}`}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.2, ease: "linear" }}
                className="h-full bg-neon-green shadow-[0_0_15px_#39FF14]"
              />
            </div>
            <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest opacity-40">
              <span>System Boot</span>
              <span>v2.0.4 - Active</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`min-h-screen selection:bg-neon-green selection:text-white flex flex-col transition-colors duration-500 overflow-x-hidden ${theme === 'dark' ? 'bg-[#051510] text-gray-100' : 'bg-white text-green-900'}`}
        >
          <Navbar />
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </PageTransition>
            </AnimatePresence>
          </main>
          <Footer />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HealthProvider>
        <BrowserRouter>
          <MainContent />
          <ChatbotWidget />
        </BrowserRouter>
      </HealthProvider>
    </ThemeProvider>
  );
}


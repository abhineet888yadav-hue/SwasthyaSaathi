import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Brain, Menu, X, MessageSquare, Sun, Moon, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const handleScroll = () => {
      if (window.scrollY > 20) {
        if (!isScrolled) setIsScrolled(true);
      } else {
        if (isScrolled) setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isScrolled]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/signin");
    setIsOpen(false);
  };

  const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }
    
    // Close menu first
    setIsOpen(false);
    
    // Smooth scroll with a slight delay to let the menu close first
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 200);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] mx-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isScrolled 
          ? theme === 'dark' 
            ? "top-4 w-[92%] max-w-6xl bg-[#0a201a]/80 backdrop-blur-md border border-green-900/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px] py-1" 
            : "top-4 w-[92%] max-w-6xl bg-white/80 backdrop-blur-md border border-green-100/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] py-1" 
          : "w-full bg-transparent py-4 sm:py-6"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'}`}>
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <div className="p-1.5 sm:p-2 bg-neon-green/10 rounded-lg">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green" />
            </div>
            <span className={`text-lg sm:text-xl font-display font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
              SWASTHYA <span className="neon-text italic">SAATHI</span>
            </span>
          </Link>

          <div className="hidden md:block">
            <div className="flex items-center gap-x-6 lg:gap-x-10">
              {!isAuthPage && (
                <div className="flex items-center gap-x-6 lg:gap-x-8">
                  <button onClick={() => scrollToSection("hero")} className={`transition-colors font-bold text-sm tracking-tight cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Home</button>
                  <button onClick={() => scrollToSection("features")} className={`transition-colors font-bold text-sm tracking-tight cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Features</button>
                  <button onClick={() => scrollToSection("dashboard")} className={`transition-colors font-bold text-sm tracking-tight cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Dashboard</button>
                  <button onClick={() => scrollToSection("pricing")} className={`transition-colors font-bold text-sm tracking-tight cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Pricing</button>
                  <button onClick={() => scrollToSection("community")} className={`transition-colors font-bold text-sm tracking-tight cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Community</button>
                </div>
              )}
              
                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleTheme}
                    className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-green-900/50 text-yellow-400 hover:bg-green-900' : 'bg-green-50 text-green-800 hover:bg-green-100'}`}
                    title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={() => {
                      const el = document.getElementById("chatbot-widget");
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-neon-green/10 text-neon-green rounded-full font-bold hover:bg-neon-green hover:text-white transition-all text-sm group"
                  >
                    <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Chat Now
                  </button>

                  <div className="flex items-center gap-2 lg:gap-4">
                    {user ? (
                      <>
                        <Link 
                          to="/profile" 
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 border ${theme === 'dark' ? 'bg-green-900/20 border-green-800 shadow-lg' : 'bg-green-50 border-green-100 shadow-sm'}`}
                        >
                          {user.photoURL ? (
                            <img src={user.photoURL} className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                          ) : (
                            <User className="w-5 h-5 text-neon-green" />
                          )}
                          <span className={`${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                            {user.displayName?.split(' ')[0] || "Student"}
                          </span>
                        </Link>
                        <button 
                          onClick={handleSignOut}
                          className={`p-2.5 rounded-2xl transition-all border ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'}`}
                          title="Sign Out"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                          to="/signin" 
                          className={`hidden lg:block px-4 py-2 rounded-full font-bold text-sm transition-all active:scale-95 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-green-800 hover:text-neon-green'}`}
                        >
                          Log In
                        </Link>
                        <Link 
                          to="/signup" 
                          className="bg-neon-green text-green-950 px-6 lg:px-8 py-2.5 lg:py-3 rounded-2xl font-black uppercase tracking-widest hover:scale-105 hover:bg-[#00ff00] transition-all active:scale-95 text-[10px] lg:text-xs whitespace-nowrap shadow-xl shadow-neon-green/20"
                        >
                          Get Started
                        </Link>
                      </>
                    )}
                  </div>
                </div>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-colors ${theme === 'dark' ? 'bg-green-900/50 text-yellow-400' : 'bg-green-50 text-green-900'}`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`p-2.5 rounded-xl transition-colors ${theme === 'dark' ? 'bg-green-900/50 text-white' : 'bg-green-50 text-green-900'}`}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`md:hidden border-t p-4 space-y-4 overflow-hidden backdrop-blur-lg ${theme === 'dark' ? 'bg-green-950/95 border-green-900' : 'glass border-green-100 bg-white/95'}`}
          >
            {!isAuthPage && (
              <div className="flex flex-col gap-1">
                <button onClick={() => scrollToSection("hero")} className={`block w-full text-left p-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'text-gray-300 hover:bg-white/5 active:text-neon-green' : 'text-green-800 hover:bg-green-50 active:text-neon-green'}`}>Home</button>
                <button onClick={() => scrollToSection("features")} className={`block w-full text-left p-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'text-gray-300 hover:bg-white/5 active:text-neon-green' : 'text-green-800 hover:bg-green-50 active:text-neon-green'}`}>Features</button>
                <button onClick={() => scrollToSection("dashboard")} className={`block w-full text-left p-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'text-gray-300 hover:bg-white/5 active:text-neon-green' : 'text-green-800 hover:bg-green-50 active:text-neon-green'}`}>Dashboard</button>
                <button onClick={() => scrollToSection("pricing")} className={`block w-full text-left p-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'text-gray-300 hover:bg-white/5 active:text-neon-green' : 'text-green-800 hover:bg-green-50 active:text-neon-green'}`}>Pricing</button>
                <button onClick={() => scrollToSection("community")} className={`block w-full text-left p-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'text-gray-300 hover:bg-white/5 active:text-neon-green' : 'text-green-800 hover:bg-green-50 active:text-neon-green'}`}>Community</button>
              </div>
            )}
            
              <div className="space-y-4">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsOpen(false)}
                      className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold border ${theme === 'dark' ? 'bg-green-900/40 text-white border-green-800 shadow-lg shadow-black/20' : 'bg-green-50 text-green-900 border-green-100'}`}
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} className="w-8 h-8 rounded-full shadow-sm" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-5 h-5 text-neon-green" />
                      )}
                      <span>{user.displayName || "Student Profile"}</span>
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-95 border ${theme === 'dark' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100'}`}
                    >
                      <LogOut className="w-5 h-5" />
                      Exit Account
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/signin" 
                      onClick={() => setIsOpen(false)}
                      className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold border ${theme === 'dark' ? 'bg-green-900/40 text-white border-green-800' : 'bg-green-50 text-green-900 border-green-100'}`}
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-neon-green text-green-950 flex items-center justify-center gap-3 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-neon-green/20 active:scale-95"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

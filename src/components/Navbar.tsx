import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Brain, Menu, X, LogOut, User, MessageSquare, Sun, Moon } from "lucide-react";
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
    navigate("/");
  };

  const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 will-change-[transform,background-color] ${
        isScrolled 
          ? theme === 'dark' ? "bg-green-950/90 backdrop-blur-md border-b border-green-900/50 shadow-lg py-2" : "bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm py-2" 
          : "bg-transparent py-4 border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-neon-green/10 rounded-lg">
              <Brain className="w-6 h-6 text-neon-green" />
            </div>
            <span className={`text-xl font-display font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>
              Swasthya<span className="text-neon-green">Saathi</span>
            </span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {!isAuthPage && (
                <>
                  <button onClick={() => scrollToSection("hero")} className={`transition-colors font-medium cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Home</button>
                  <button onClick={() => scrollToSection("features")} className={`transition-colors font-medium cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Features</button>
                  <button onClick={() => scrollToSection("dashboard")} className={`transition-colors font-medium cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Dashboard</button>
                  <button onClick={() => scrollToSection("pricing")} className={`transition-colors font-medium cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Pricing</button>
                  <button onClick={() => scrollToSection("faq")} className={`transition-colors font-medium cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>FAQ</button>
                </>
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

                {user ? (
                  <div className="flex items-center gap-3">
                    <Link 
                      to="/profile" 
                      className={`flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-2xl border transition-all active:scale-95 group ${theme === 'dark' ? 'bg-green-900/20 border-green-800/50 hover:bg-green-900/40 hover:border-green-700' : 'bg-green-50/50 border-green-100 hover:bg-green-100 hover:border-green-200'}`}
                    >
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || "User"} 
                          className="w-7 h-7 rounded-full border border-white shadow-sm transition-transform group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-neon-green/20 rounded-full flex items-center justify-center text-neon-green">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <span className={`text-sm font-bold tracking-tight transition-colors ${theme === 'dark' ? 'text-gray-200 group-hover:text-white' : 'text-green-900 group-hover:text-neon-green'}`}>
                        {user.displayName || user.email?.split('@')[0]}
                      </span>
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all text-xs uppercase tracking-wider active:scale-95 border ${theme === 'dark' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 shadow-sm'}`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Exit
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link 
                      to="/signin" 
                      className={`hidden sm:block px-5 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-green-800 hover:text-neon-green hover:bg-green-50'}`}
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="bg-neon-green text-green-950 px-7 py-2.5 rounded-full font-bold hover:scale-105 hover:bg-[#00ff00] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all active:scale-95 text-sm whitespace-nowrap"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'text-yellow-400' : 'text-green-900'}`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>
              {isOpen ? <X /> : <Menu />}
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
              <>
                <button onClick={() => scrollToSection("hero")} className={`block w-full text-left font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Home</button>
                <button onClick={() => scrollToSection("features")} className={`block w-full text-left font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Features</button>
                <button onClick={() => scrollToSection("dashboard")} className={`block w-full text-left font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Dashboard</button>
                <button onClick={() => scrollToSection("pricing")} className={`block w-full text-left font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>Pricing</button>
                <button onClick={() => scrollToSection("faq")} className={`block w-full text-left font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-neon-green' : 'text-green-800 hover:text-neon-green'}`}>FAQ</button>
              </>
            )}
            
            {user ? (
              <div className="space-y-4">
                <Link 
                  to="/profile" 
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold border ${theme === 'dark' ? 'bg-green-900/40 text-white border-green-800' : 'bg-green-50 text-green-900 border-green-100'}`}
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-5 h-5 text-neon-green" />
                  )}
                  {user.displayName || user.email?.split('@')[0]}
                </Link>
                <button 
                  onClick={() => {
                    const el = document.getElementById("chatbot-widget");
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-neon-green/10 text-neon-green py-3 rounded-xl font-bold border border-neon-green/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat Now
                </button>
                <button 
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-95 ${theme === 'dark' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600'}`}
                >
                  <LogOut className="w-4 h-4" />
                  Exit Account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link 
                  to="/signin" 
                  onClick={() => setIsOpen(false)}
                  className={`block w-full text-center py-3 rounded-xl font-bold border transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/5 text-white border-white/10' : 'bg-green-50 text-green-900 border-green-100'}`}
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-neon-green text-green-950 px-5 py-3 rounded-xl font-bold shadow-lg shadow-neon-green/20 text-center active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

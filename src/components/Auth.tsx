import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { 
  LogIn, Mail, Lock, ArrowRight, User, Sparkles, 
  Eye, EyeOff, CheckCircle2, AlertCircle, X, Chrome,
  CheckCircle,
  RefreshCcw,
  ExternalLink
} from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useTheme } from "../context/ThemeContext";

type AuthMode = "signin" | "signup" | "verify";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [verifiedEmailForMessage, setVerifiedEmailForMessage] = useState("");
  
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Listen for auth state to handle direct access to verify screen if unverified
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.emailVerified) {
        setVerifiedEmailForMessage(user.email || "");
        setMode("verify");
      }
    });
    return () => unsubscribe();
  }, []);

  const validate = () => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      errors.push("Email valid nahi lag raha, Boss.");
    }
    if (password.length < 6) {
      errors.push("Password kam se kam 6 characters ka hona chahiye.");
    }
    if (mode === "signup" && fullName.trim().length < 2) {
      errors.push("Pura naam toh batayein!");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      
      // Google sign-ins are usually verified, but let's check
      if (result.user.emailVerified) {
        navigate("/");
      } else {
        await sendEmailVerification(result.user);
        setVerifiedEmailForMessage(result.user.email || "");
        setMode("verify");
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      const errorCode = err.code;
      const errorMessage = err.message;
      
      if (errorCode === "auth/popup-closed-by-user") {
        setError("Arrey! Popup kyu band kar diya? Sign-in process pura nahi hua. Ek baar phir try karein?");
      } else if (errorCode === "auth/popup-blocked") {
        setError("Browser ne popup block kar diya hai. Top right mein icon check karein aur allow karein, ya phir incognito window check karein.");
      } else if (errorCode === "auth/unauthorized-domain") {
        setError(`Aapka domain ('${window.location.hostname}') Firebase Console mien authorized nahi hai! Go to: Authentication > Settings > Authorized Domains aur wahan '${window.location.hostname}' copy-paste kar dein.`);
      } else if (errorCode === "auth/operation-not-allowed") {
        setError("Google Sign-In enable nahi kiya gaya hai. Firebase Console mien 'Google' provider enable karein.");
      } else if (errorCode === "auth/internal-error") {
        setError("Kuch internal error hai. Check karein ki Firebase config sahi hai aur domain authorized hai.");
      } else if (errorCode === "auth/network-request-failed") {
        setError("Network issue! Browser internet se connect nahi ho pa raha. Internet check karein ya VPN off karke dekhein.");
      } else {
        setError(`Oho! Sign-in mien issue aa raha hai. Error Code: ${errorCode || 'Internal Error'}. Message: ${errorMessage || 'Unknown issue'}. Try reloading (Ctrl+R) or confirm your Firebase API settings.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
          // If not verified, send verification email if needed and sign out
          await sendEmailVerification(user);
          setVerifiedEmailForMessage(user.email || "");
          setMode("verify");
          await signOut(auth);
          setLoading(false);
          return;
        }
        navigate("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send verification email
        await sendEmailVerification(user);
        
        // Custom name update if needed (although task implies keeping it simple)
        if (fullName) {
          await updateProfile(user, { displayName: fullName });
        }
        
        setVerifiedEmailForMessage(user.email || "");
        setMode("verify");
        // Sign out right after registration so they have to login after verification
        await signOut(auth);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("User already exists. Please sign in");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Email or password is incorrect");
      } else if (err.code === "auth/weak-password") {
        setError("Password thoda kamzor hai. Kam se kam 6 characters use karo.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Bahut saare attempts ho gaye! Thodi der rukk jao, phir try karna.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network issue! Check your internet connection or Firebase service status.");
      } else {
        setError("Email or password is incorrect");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 flex items-center justify-center p-4 relative overflow-hidden pt-20 ${theme === 'dark' ? 'bg-[#051510]' : 'bg-white'}`}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className={`absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[100px] ${theme === 'dark' ? 'bg-neon-green/10' : 'bg-neon-green/5'}`}
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className={`absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[100px] ${theme === 'dark' ? 'bg-green-800/10' : 'bg-green-200/20'}`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`p-8 sm:p-10 rounded-[40px] border relative overflow-hidden backdrop-blur-2xl transition-all duration-500 ${
          theme === 'dark' ? 'bg-[#0a201a]/80 border-green-900/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,1)]' : 'bg-white/90 border-green-100 shadow-2xl shadow-green-900/10'
        }`}>
          {/* Animated Edge Glow */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon-green/40 to-transparent" />
          
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`inline-flex items-center justify-center p-4 rounded-[22px] mb-6 shadow-inner border transition-colors ${
                theme === 'dark' ? 'bg-green-900/40 border-green-800' : 'bg-green-50 border-green-100'
              }`}
            >
              {mode === "verify" ? (
                <Mail className="w-8 h-8 text-neon-green" />
              ) : (
                <Sparkles className="w-8 h-8 text-neon-green" />
              )}
            </motion.div>
            <h2 className={`text-3xl font-display font-black tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
              {mode === "verify" ? (
                <>Email <span className="neon-text italic">Verify Karein!</span></>
              ) : mode === "signin" ? (
                <>Namaste <span className="neon-text italic">Saathi!</span></>
              ) : (
                <>Naya <span className="neon-text italic">Account?</span></>
              )}
            </h2>
            <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/40'}`}>
              {mode === "verify" ? "Identity Validation" : "Neural Gateway to Wellness"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode === "verify" ? (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 text-center"
              >
                <div className={`p-6 rounded-[30px] border leading-relaxed ${theme === 'dark' ? 'bg-green-950/20 border-green-900/50 text-gray-300' : 'bg-green-50 border-green-100 text-green-900'}`}>
                  <p className="text-sm font-medium mb-4">
                    We have sent you a verification email to <span className="text-neon-green font-black select-all">{verifiedEmailForMessage}</span>. Please verify it and log in.
                  </p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                    Spam folder check karna na bhulein!
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setMode("signin");
                      setError("");
                    }}
                    className={`w-full py-5 rounded-[22px] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 ${
                      theme === 'dark' 
                        ? 'bg-neon-green text-green-950 shadow-[0_20px_40px_-10px_rgba(57,255,20,0.3)] hover:scale-[1.02]' 
                        : 'bg-neon-green text-white shadow-xl hover:scale-[1.02]'
                    }`}
                  >
                    <LogIn className="w-5 h-5" />
                    Back to Login
                  </button>

                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        // User needs to be signed in to resend verification
                        // This assumes they might still have a partial session or we re-trigger if they try to login again
                        if (auth.currentUser) {
                          await sendEmailVerification(auth.currentUser);
                          setError("Verification email resent!");
                        } else {
                          setError("Pehle login try karein fir resend option milega.");
                        }
                      } catch (err: any) {
                        setError("Bahut jaldi resend mat karein, thoda rukk jao.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className={`w-full py-4 rounded-[20px] font-bold text-xs transition-all flex items-center justify-center gap-3 border ${
                      theme === 'dark' 
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                        : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Resend Email
                  </button>
                </div>
                
                {error && (
                  <p className={`text-[10px] font-bold ${error.includes('resent') ? 'text-neon-green' : 'text-red-500'}`}>
                    {error}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Mode Switcher */}
                <div className={`flex p-1 rounded-2xl mb-8 border transition-colors ${theme === 'dark' ? 'bg-green-950/50 border-green-900' : 'bg-green-50 border-green-100'}`}>
                  <button
                    onClick={() => setMode("signin")}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      mode === "signin" 
                        ? 'bg-neon-green text-green-950 shadow-lg' 
                        : theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-green-800/60 hover:text-neon-green'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      mode === "signup" 
                        ? 'bg-neon-green text-green-950 shadow-lg' 
                        : theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-green-800/60 hover:text-neon-green'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-green-900'}`}>Full Name</label>
                        <div className="relative group">
                          <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${theme === 'dark' ? 'text-green-900 group-focus-within:text-neon-green' : 'text-green-300 group-focus-within:text-neon-green'}`} />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`w-full pl-12 pr-4 py-4 rounded-[18px] border-2 outline-none transition-all font-bold text-sm ${
                              theme === 'dark' 
                                ? 'bg-green-950/40 border-green-900/50 text-white placeholder:text-gray-700 focus:border-neon-green/50 focus:ring-4 focus:ring-neon-green/5' 
                                : 'bg-green-50/50 border-green-100/50 text-green-950 placeholder:text-green-200 focus:border-neon-green/50 focus:ring-4 focus:ring-neon-green/5'
                            }`}
                            placeholder="Apna naam likhein..."
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-green-900'}`}>Email Address</label>
                    <div className="relative group">
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${theme === 'dark' ? 'text-green-900 group-focus-within:text-neon-green' : 'text-green-300 group-focus-within:text-neon-green'}`} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-[18px] border-2 outline-none transition-all font-bold text-sm ${
                          theme === 'dark' 
                            ? 'bg-green-950/40 border-green-900/50 text-white placeholder:text-gray-700 focus:border-neon-green/50 focus:ring-4 focus:ring-neon-green/5' 
                            : 'bg-green-50/50 border-green-100/50 text-green-950 placeholder:text-green-200 focus:border-neon-green/50 focus:ring-4 focus:ring-neon-green/5'
                        }`}
                        placeholder="name@nexus.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-green-900'}`}>Security Key</label>
                    <div className="relative group">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${theme === 'dark' ? 'text-green-900 group-focus-within:text-neon-green' : 'text-green-300 group-focus-within:text-neon-green'}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-12 pr-12 py-4 rounded-[18px] border-2 outline-none transition-all font-bold text-sm ${
                          theme === 'dark' 
                            ? 'bg-green-950/40 border-green-900/50 text-white placeholder:text-gray-700 focus:border-neon-green/50 focus:ring-4 focus:ring-neon-green/5' 
                            : 'bg-green-50/50 border-green-100/50 text-green-950 placeholder:text-green-200 focus:border-neon-green/50 focus:ring-4 focus:ring-neon-green/5'
                        }`}
                        placeholder="Min 6 characters..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${theme === 'dark' ? 'text-gray-600 hover:text-neon-green' : 'text-green-200 hover:text-neon-green'}`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {validationErrors.length > 0 && (
                    <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50 border-red-100/50'}`}>
                      {validationErrors.map((err, i) => (
                        <p key={i} className="text-[10px] font-bold text-red-500 flex items-center gap-2 mb-1 last:mb-0">
                          <AlertCircle className="w-3 h-3" /> {err}
                        </p>
                      ))}
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-center text-xs font-bold">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-5 rounded-[22px] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                      theme === 'dark' 
                        ? 'bg-neon-green text-green-950 shadow-[0_20px_40px_-10px_rgba(57,255,20,0.3)] hover:shadow-neon-green/40 hover:-translate-y-1' 
                        : 'bg-neon-green text-white shadow-xl shadow-neon-green/20 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-green-900/30 border-t-green-950 rounded-full animate-spin" />
                    ) : (
                      <>
                        Connect <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className={`absolute inset-0 flex items-center ${theme === 'dark' ? 'text-green-950' : 'text-green-50'}`}>
                    <div className="w-full border-t border-current" />
                  </div>
                  <div className={`relative flex justify-center text-[10px] uppercase font-black tracking-widest ${theme === 'dark' ? 'text-gray-600' : 'text-green-800/40'}`}>
                    <span className={`px-4 ${theme === 'dark' ? 'bg-[#0a201a]' : 'bg-white'}`}>Atwa</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className={`w-full py-4 rounded-[20px] font-bold text-sm transition-all flex items-center justify-center gap-3 border ${
                    theme === 'dark' 
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                      : 'bg-white border-gray-100 text-gray-700 shadow-sm hover:bg-gray-50'
                  }`}
                >
                  <Chrome className="w-5 h-5 text-neon-green" />
                  Continue with Google
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className={`mt-8 text-center text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-600' : 'text-green-800/30'}`}>
            Secured via RSA-Neural Encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
}

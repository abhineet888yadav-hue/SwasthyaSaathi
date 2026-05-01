import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useHealth } from "../context/HealthContext";
import { User, Mail, Save, Loader2, AlertCircle, CheckCircle2, History, TrendingUp, Moon, Sun, BookOpen, AlertTriangle, Bell, Shield, Sparkles } from "lucide-react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useTheme } from "../context/ThemeContext";

export default function Profile() {
  const { metrics, history: realHistory } = useHealth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setFullName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (realHistory && realHistory.length > 0) {
      setHistory(realHistory.map(entry => ({
        date: new Date(entry.date).toLocaleDateString(),
        sleep: entry.sleepHours,
        mood: entry.mood,
        study: entry.studyHours,
        burnout: entry.burnoutRisk,
        status: entry.status
      })));
    }
  }, [realHistory]);
  
  const [notifPrefs, setNotifPrefs] = useState({
    studyReminders: true,
    meditationReminders: true
  });

  const handleToggleNotif = (key: string) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    setMessage(null);

    try {
      await updateProfile(user, {
        displayName: fullName
      });
      setMessage({ type: "success", text: "Profile update ho gaya, Boss! Locals nodes synced." });
    } catch (err: any) {
      console.error("Profile update error:", err);
      setMessage({ type: "error", text: "Profile update mien issue aa gaya. Phir se try karein?" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 ${theme === 'dark' ? 'bg-[#051510]' : 'bg-white'}`}>
        <motion.div
           animate={{ rotate: 360, scale: [1, 1.2, 1] }}
           transition={{ duration: 1.5, repeat: Infinity }}
           className="p-4 bg-neon-green/10 rounded-3xl"
        >
          <Sparkles className="w-10 h-10 text-neon-green" />
        </motion.div>
        <span className={`text-sm font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-neon-green' : 'text-green-800'}`}>Syncing Local Identity...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 pt-32 pb-20 ${theme === 'dark' ? 'bg-[#051510]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className={`text-4xl md:text-6xl font-display font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
            Neural <span className="neon-text italic">Identity</span>
          </h1>
          <p className={`text-lg font-medium opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-green-800'}`}>Managing your local cognitive profile.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Info & Edit */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-8 rounded-[40px] border shadow-2xl transition-all h-fit ${
                theme === 'dark' ? 'bg-[#0a201a]/80 border-green-900 shadow-black' : 'bg-white border-green-100 shadow-green-100/10'
              } backdrop-blur-xl`}
            >
              <div className="flex flex-col items-center mb-8">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 border-4 p-1 shadow-2xl relative overflow-hidden group ${
                  theme === 'dark' ? 'border-green-900 bg-green-950' : 'border-white bg-green-50'
                }`}>
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-16 h-16 text-neon-green" />
                  )}
                </div>
                <div className="text-center">
                  <h2 className={`text-2xl font-display font-black ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                    {fullName || "Student"}
                  </h2>
                  <p className={`text-sm font-bold flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/60'}`}>
                    <Mail className="w-3.5 h-3.5" />
                    {email}
                  </p>
                  <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${
                    user ? 'bg-green-900/40 border-neon-green/30 text-neon-green' : 'bg-red-900/10 border-red-500/20 text-red-400'
                  }`}>
                    <Shield className="w-3.5 h-3.5" />
                    {user ? "Neural Verified Account" : "Unlinked Neural Node"}
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-green-900'}`}>Pura Naam (Full Name)</label>
                  <div className="relative group">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${theme === 'dark' ? 'text-green-900 group-focus-within:text-neon-green' : 'text-green-300 group-focus-within:text-neon-green'}`} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 rounded-[18px] border-2 outline-none transition-all font-bold text-sm ${
                        theme === 'dark' 
                          ? 'bg-green-950/40 border-green-900/50 text-white placeholder:text-gray-700 focus:border-neon-green/50 focus:ring-4 focus:ring-neon-green/5' 
                          : 'bg-green-50/50 border-green-100/50 text-green-950 placeholder:text-green-200 focus:border-neon-green/50 focus:ring-4 focus:ring-neon-green/5'
                      }`}
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-3 p-4 rounded-[20px] text-xs font-bold border-2 ${
                      message.type === "success" 
                        ? theme === 'dark' ? "bg-green-900/20 text-green-400 border-green-800" : "bg-green-50 text-green-700 border-green-100" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                  >
                    {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {message.text}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={updating}
                  className={`w-full py-5 rounded-[22px] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${
                    theme === 'dark' 
                      ? 'bg-neon-green text-green-950 shadow-lg shadow-neon-green/20 hover:shadow-neon-green/40' 
                      : 'bg-neon-green text-white shadow-xl shadow-neon-green/20 hover:scale-[1.02]'
                  }`}
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Sync Profile</>}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Metrics & History */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Notification Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`p-8 rounded-[40px] border shadow-2xl transition-all ${
                theme === 'dark' ? 'bg-[#0a201a]/80 border-green-900 shadow-black' : 'bg-white border-green-100 shadow-green-100/10'
              } backdrop-blur-xl`}
            >
              <h3 className={`text-xl font-display font-black mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                <div className="p-2 bg-neon-green/10 rounded-xl">
                  <Bell className="w-5 h-5 text-neon-green" />
                </div>
                Neural Alert System
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className={`p-6 rounded-[28px] border transition-all flex flex-col gap-6 ${theme === 'dark' ? 'bg-green-900/10 border-green-900' : 'bg-green-50/50 border-green-100'}`}>
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${theme === 'dark' ? 'bg-green-950 text-neon-green' : 'bg-white text-neon-green'}`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => handleToggleNotif('studyReminders')}
                      className={`w-14 h-7 rounded-full transition-all relative p-1 ${notifPrefs.studyReminders ? 'bg-neon-green shadow-[0_0_15px_#39FF14]' : theme === 'dark' ? 'bg-green-900' : 'bg-green-200'}`}
                    >
                      <motion.div
                        animate={{ x: notifPrefs.studyReminders ? 28 : 0 }}
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                  <div>
                    <div className={`text-base font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>Study Reminders</div>
                    <div className={`text-xs font-medium leading-relaxed opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-green-800'}`}>Saathi will nudge you when it's study time, Boss!</div>
                  </div>
                </div>

                <div className={`p-6 rounded-[28px] border transition-all flex flex-col gap-6 ${theme === 'dark' ? 'bg-green-900/10 border-green-900' : 'bg-green-50/50 border-green-100'}`}>
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${theme === 'dark' ? 'bg-green-950 text-neon-green' : 'bg-white text-neon-green'}`}>
                      <Moon className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => handleToggleNotif('meditationReminders')}
                      className={`w-14 h-7 rounded-full transition-all relative p-1 ${notifPrefs.meditationReminders ? 'bg-neon-green shadow-[0_0_15px_#39FF14]' : theme === 'dark' ? 'bg-green-900' : 'bg-green-200'}`}
                    >
                      <motion.div
                        animate={{ x: notifPrefs.meditationReminders ? 28 : 0 }}
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                  <div>
                    <div className={`text-base font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>Meditation Alerts</div>
                    <div className={`text-xs font-medium leading-relaxed opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-green-800'}`}>Notification when it's time to enter Zen mode.</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Current Metrics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-8 rounded-[40px] border shadow-2xl transition-all ${
                theme === 'dark' ? 'bg-[#0a201a]/80 border-green-900 shadow-black' : 'bg-white border-green-100 shadow-green-100/10'
              } backdrop-blur-xl relative overflow-hidden`}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />
              <h3 className={`text-xl font-display font-black mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                <div className="p-2 bg-neon-green/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                </div>
                Latest Node Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className={`p-5 rounded-[24px] border transition-all ${theme === 'dark' ? 'bg-green-950/40 border-green-900' : 'bg-green-50/50 border-green-100'}`}>
                  <Moon className="w-5 h-5 text-blue-500 mb-4" />
                  <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{metrics.sleepHours}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'dark' ? 'text-white' : 'text-green-800'}`}>Sleep</div>
                </div>
                <div className={`p-5 rounded-[24px] border transition-all ${theme === 'dark' ? 'bg-green-950/40 border-green-900' : 'bg-green-50/50 border-green-100'}`}>
                  <Sun className="w-5 h-5 text-yellow-500 mb-4" />
                  <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{metrics.mood}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'dark' ? 'text-white' : 'text-green-800'}`}>Mood</div>
                </div>
                <div className={`p-5 rounded-[24px] border transition-all ${theme === 'dark' ? 'bg-green-950/40 border-green-900' : 'bg-green-50/50 border-green-100'}`}>
                  <BookOpen className="w-5 h-5 text-emerald-500 mb-4" />
                  <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{metrics.studyHours}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'dark' ? 'text-white' : 'text-green-800'}`}>Study</div>
                </div>
                <div className={`p-5 rounded-[24px] border transition-all ${theme === 'dark' ? 'bg-green-950/40 border-green-900' : 'bg-green-50/50 border-green-100'}`}>
                  <AlertTriangle className="w-5 h-5 text-neon-green mb-4" />
                  <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{metrics.burnoutRisk}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'dark' ? 'text-white' : 'text-green-800'}`}>Burnout</div>
                </div>
              </div>
            </motion.div>

            {/* Past Metrics History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-8 rounded-[40px] border shadow-2xl transition-all ${
                theme === 'dark' ? 'bg-[#0a201a]/80 border-green-900 shadow-black' : 'bg-white border-green-100 shadow-green-100/10'
              } backdrop-blur-xl relative overflow-hidden group`}
            >
              <h3 className={`text-xl font-display font-black mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                <div className="p-2 bg-neon-green/10 rounded-xl">
                  <History className="w-5 h-5 text-neon-green" />
                </div>
                Telemetry Logs
              </h3>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neon-green/10">
                {history.length > 0 ? history.map((entry, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-6 rounded-[28px] border grid grid-cols-1 md:grid-cols-5 gap-4 items-center transition-all group/item ${
                      theme === 'dark' ? 'bg-green-950/20 border-green-900 hover:bg-green-900/20' : 'bg-green-50/20 border-green-100 hover:bg-white'
                    }`}
                  >
                    <div className="md:col-span-1">
                      <div className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{entry.date}</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest text-neon-green/60`}>Mapping Completed</div>
                    </div>
                    <div className="md:col-span-3 flex items-center gap-6">
                      <div className="flex flex-col items-center">
                         <Moon className="w-3.5 h-3.5 text-blue-500 mb-1" />
                         <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>{entry.sleep}</span>
                      </div>
                      <div className="flex flex-col items-center">
                         <Sun className="w-3.5 h-3.5 text-yellow-500 mb-1" />
                         <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>{entry.mood}</span>
                      </div>
                      <div className="flex flex-col items-center">
                         <BookOpen className="w-3.5 h-3.5 text-emerald-500 mb-1" />
                         <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>{entry.study}</span>
                      </div>
                    </div>
                    <div className="md:col-span-1 text-right">
                       <div className={`inline-block text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border-2 ${
                         entry.status === "Safe" ? "bg-green-100/50 border-green-400/50 text-green-800" :
                         entry.status === "At Risk" ? "bg-yellow-100/50 border-yellow-400/50 text-yellow-800" :
                         "bg-red-100/50 border-red-400/50 text-red-800"
                       }`}>
                         {entry.status}
                       </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className={`text-center py-20 rounded-[40px] border-2 border-dashed ${theme === 'dark' ? 'border-green-900/50 text-green-800/40' : 'border-green-100 text-green-800/20'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed">No logs found. <br /> Check-in for neural mapping!</p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

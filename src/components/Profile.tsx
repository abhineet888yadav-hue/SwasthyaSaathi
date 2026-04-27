import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useHealth } from "../context/HealthContext";
import { User, Mail, Save, Loader2, AlertCircle, CheckCircle2, History, TrendingUp, Moon, Sun, BookOpen, AlertTriangle, LogOut, Bell, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, updateProfile, signOut } from "firebase/auth";

export default function Profile() {
  const { metrics } = useHealth();
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setFullName(currentUser.displayName || "");
      } else {
        navigate("/signin");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const [history, setHistory] = useState<any[]>([
    { date: "2024-03-20", sleep: "7-9h", mood: "Positive", study: "4-6h", burnout: "Low" },
    { date: "2024-03-19", sleep: "5-7h", mood: "Neutral", study: "2-4h", burnout: "Moderate" }
  ]);
  
  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    studyReminders: true,
    meditationReminders: true
  });

  const handleToggleNotif = (key: string) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setUpdating(true);
    setMessage(null);

    try {
      await updateProfile(auth.currentUser, {
        displayName: fullName
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      console.error("Update profile error:", err);
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Mock historical data for metrics removed as we now fetch from Supabase

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Profile Info & Edit */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 rounded-[32px] border-green-50 bg-white sticky top-32"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-xl overflow-hidden">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-12 h-12 text-neon-green" />
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-display font-bold text-green-950">{user?.displayName || "Student"}</h2>
                  <p className="text-green-800/60 text-sm flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user?.email}
                  </p>
                  {user?.emailVerified && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                      <Shield className="w-3 h-3" />
                      Verified Account
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-green-900 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-green-50/50 border border-green-100 rounded-xl focus:ring-2 focus:ring-neon-green/20 focus:border-neon-green outline-none transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-green-900 ml-1">Email (Read-only)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3 bg-green-50/20 border border-green-100 rounded-xl text-green-800/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                      message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-neon-green text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-green-50">
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>

          {/* Metrics & History */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Notification Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass p-8 rounded-[32px] border-green-50 bg-white"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-950">
                <Bell className="w-5 h-5 text-neon-green" />
                Notification Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50/30 rounded-2xl border border-green-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <BookOpen className="w-5 h-5 text-neon-green" />
                    </div>
                    <div>
                      <div className="font-bold text-green-950">Study Reminders</div>
                      <div className="text-xs text-green-800/60">Get notified when it's time to start a task</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotif('studyReminders')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifPrefs.studyReminders ? 'bg-neon-green' : 'bg-green-200'}`}
                  >
                    <motion.div
                      animate={{ x: notifPrefs.studyReminders ? 26 : 2 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50/30 rounded-2xl border border-green-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Moon className="w-5 h-5 text-neon-green" />
                    </div>
                    <div>
                      <div className="font-bold text-green-950">Meditation Alerts</div>
                      <div className="text-xs text-green-800/60">Notifications when your session is complete</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotif('meditationReminders')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifPrefs.meditationReminders ? 'bg-neon-green' : 'bg-green-200'}`}
                  >
                    <motion.div
                      animate={{ x: notifPrefs.meditationReminders ? 26 : 2 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Current Metrics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-[32px] border-green-50 bg-white"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-950">
                <TrendingUp className="w-5 h-5 text-neon-green" />
                Latest Health Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                  <Moon className="w-5 h-5 text-green-600 mb-2" />
                  <div className="text-lg font-bold text-green-950">{metrics.sleepHours}</div>
                  <div className="text-xs text-green-800/60">Sleep</div>
                </div>
                <div className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                  <Sun className="w-5 h-5 text-yellow-600 mb-2" />
                  <div className="text-lg font-bold text-green-950">{metrics.mood}</div>
                  <div className="text-xs text-green-800/60">Mood</div>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <BookOpen className="w-5 h-5 text-emerald-600 mb-2" />
                  <div className="text-lg font-bold text-green-950">{metrics.studyHours}</div>
                  <div className="text-xs text-green-800/60">Study</div>
                </div>
                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                  <AlertTriangle className="w-5 h-5 text-neon-green mb-2" />
                  <div className="text-lg font-bold text-green-950">{metrics.burnoutRisk}</div>
                  <div className="text-xs text-green-800/60">Burnout</div>
                </div>
              </div>
            </motion.div>

            {/* Past Metrics History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-8 rounded-[32px] border-green-50 bg-white"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-950">
                <History className="w-5 h-5 text-neon-green" />
                Past Metrics History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-green-50">
                      <th className="pb-4 font-bold text-green-900 text-sm">Date</th>
                      <th className="pb-4 font-bold text-green-900 text-sm">Sleep</th>
                      <th className="pb-4 font-bold text-green-900 text-sm">Mood</th>
                      <th className="pb-4 font-bold text-green-900 text-sm">Study</th>
                      <th className="pb-4 font-bold text-green-900 text-sm">Burnout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {history.map((entry, i) => (
                      <tr key={i} className="group hover:bg-green-50/30 transition-colors">
                        <td className="py-4 text-sm text-green-800/80">{entry.date}</td>
                        <td className="py-4 text-sm font-medium text-green-950">{entry.sleep}</td>
                        <td className="py-4 text-sm font-medium text-green-950">{entry.mood}</td>
                        <td className="py-4 text-sm font-medium text-green-950">{entry.study}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                            entry.burnout === "Low" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {entry.burnout}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-green-50/50 rounded-2xl border border-dashed border-green-200 text-center">
                <p className="text-xs text-green-800/60 italic">Showing up to your last 7 days of recorded metrics.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

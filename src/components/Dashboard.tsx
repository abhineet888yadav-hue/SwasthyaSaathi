import { motion, AnimatePresence } from "motion/react";
import { Moon, Sun, BookOpen, AlertTriangle, RefreshCw, CheckCircle2, Play, Pause, RotateCcw, X, Sparkles, Zap, Activity, Trash2, Plus, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
  trend: string;
  progress: number;
}

interface Task {
  id: string;
  task: string;
  time: string;
  energy?: number;
  status: "Upcoming" | "Planned" | "Completed";
}

import { useHealth } from "../context/HealthContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

import { useTheme } from "../context/ThemeContext";

import NeuralLoader from "./NeuralLoader";

export default function Dashboard() {
  const { metrics, history, updateMetrics } = useHealth();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  const [showMeditation, setShowMeditation] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [studyTopic, setStudyTopic] = useState("");
  
  const stats: Stat[] = [
    { label: "Sleep Quality", value: metrics.sleepTime || "Good", icon: Moon, color: "text-blue-600", trend: "Latest", progress: metrics.sleepProgress },
    { label: "Mood", value: metrics.mood, icon: Sun, color: "text-yellow-600", trend: "Latest", progress: metrics.moodProgress },
    { label: "Study Hours", value: metrics.studyHours, icon: BookOpen, color: "text-emerald-600", trend: "Daily goal", progress: metrics.studyProgress },
    { label: "Burnout Risk", value: metrics.burnoutRisk, icon: AlertTriangle, color: "text-neon-green", trend: metrics.status, progress: metrics.burnoutProgress }
  ];

  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", task: "Review Mathematics Chapter 4", time: "45 mins", energy: 7, status: "Upcoming" },
    { id: "2", task: "Practice Chemistry Equations", time: "30 mins", energy: 5, status: "Completed" },
    { id: "3", task: "Read English Literature", time: "20 mins", energy: 3, status: "Upcoming" }
  ]);

  // Meditation Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      setIsComplete(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate real-time re-analysis of metrics
    setTimeout(() => {
      updateMetrics({
        sleepProgress: Math.min(100, Math.max(0, metrics.sleepProgress + (Math.random() - 0.5) * 5)),
        studyProgress: Math.min(100, Math.max(0, metrics.studyProgress + (Math.random() - 0.5) * 5)),
        moodProgress: Math.min(100, Math.max(0, metrics.moodProgress + (Math.random() - 0.5) * 5)),
      });
      setIsRefreshing(false);
    }, 1500);
  };

  const [streak, setStreak] = useState(7);
  const [xp, setXp] = useState(1450);
  const nextLevelXp = 2000;
  const level = Math.floor(xp / 1000) + 1;

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const isCompleting = !prev.find(t => t.id === id)?.status || prev.find(t => t.id === id)?.status !== "Completed";
      if(isCompleting) setXp(xp => xp + 50);
      else setXp(xp => xp - 50);
      
      return prev.map(t => 
        t.id === id ? { ...t, status: t.status === "Completed" ? "Upcoming" : "Completed" } : t
      );
    });
  };

  const deleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const generateStudyTasks = () => {
    if (!studyTopic.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      task: studyTopic,
      time: Math.floor(Math.random() * 40 + 20) + " mins",
      energy: Math.floor(Math.random() * 5 + 3),
      status: "Upcoming"
    };
    setTasks(prev => [newTask, ...prev]);
    setStudyTopic("");
  };

  const meditationTips = [
    "Find a comfortable, quiet place to sit or lie down.",
    "Close your eyes and take three deep, slow breaths.",
    "Focus your attention on the sensation of your breath entering and leaving your body.",
    "If your mind wanders, gently acknowledge the thought and return to your breath.",
    "Relax your jaw, shoulders, and hands as you breathe."
  ];

  const timePresets = [
    { label: "5m", value: 300 },
    { label: "10m", value: 600 },
    { label: "15m", value: 900 },
    { label: "20m", value: 1200 }
  ];

  return (
    <section id="dashboard" className={`py-20 relative transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a201a]' : 'bg-white'}`}>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#39FF14 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className={`absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-neon-green' : 'bg-green-200'}`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <h2 className={`text-5xl md:text-7xl font-display font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                Hello, <span className="neon-text italic">{user?.displayName?.split(' ')[0] || "Student"}</span>
              </h2>
              <div className="flex gap-2 mt-4 md:mt-0">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${theme === 'dark' ? 'bg-orange-950/30 border-orange-500/30 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
                  <Zap className="w-5 h-5 fill-current" />
                  <span className="font-bold">{streak} Day Streak!</span>
                </div>
                <div className={`flex flex-col justify-center px-4 py-1.5 rounded-full border-2 ${theme === 'dark' ? 'bg-blue-950/30 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                  <div className="flex items-center justify-between gap-4 text-xs font-bold leading-none mb-1">
                    <span>Level {level}</span>
                    <span className="opacity-70">{xp}/{level * 1000} XP</span>
                  </div>
                  <div className="w-24 h-1.5 bg-blue-200/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(xp % 1000) / 10}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/70'} font-medium tracking-tight`}>
              Optimizing your <span className="text-neon-green">Neural-to-Study Ratio</span> in real-time.
            </p>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className={`px-6 py-4 rounded-3xl flex items-center gap-4 transition-all group overflow-hidden relative ${theme === 'dark' ? 'bg-green-900/20 border-2 border-green-800 text-white' : 'glass bg-green-50/50 border-2 border-green-100'}`}
          >
            {isRefreshing ? (
               <NeuralLoader size="sm" className="scale-75" />
            ) : (
              <div className="w-3 h-3 bg-neon-green rounded-full relative animate-pulse">
                 <div className="absolute inset-0 bg-neon-green rounded-full blur-sm" />
              </div>
            )}
            <span className="text-sm font-black text-green-900 flex items-center gap-3 uppercase tracking-widest leading-none">
              {isRefreshing ? 'Recalculating...' : 'Neural Check Active'}
              <RefreshCw className={`w-4 h-4 text-green-600 transition-transform duration-1000 ${isRefreshing ? 'rotate-180 transition-none' : 'group-hover:rotate-180'}`} />
            </span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              animate={isRefreshing ? { scale: [1, 1.05, 1], opacity: [1, 0.7, 1] } : {}}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => setSelectedHistory(stat.label)}
              transition={{ 
                delay: index * 0.1,
                scale: { type: "spring", stiffness: 300, damping: 20 }
              }}
              viewport={{ once: true }}
              className={`p-6 rounded-3xl shadow-sm border cursor-pointer transition-all ${theme === 'dark' ? 'bg-green-950/20 border-green-900 group' : 'glass bg-white border-green-50'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-green-900/40' : 'bg-green-50'} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end">
                   <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-neon-green' : 'text-green-700'}`}>{stat.trend}</span>
                   <span className={`text-[7px] font-bold uppercase opacity-30 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Real-time Node</span>
                </div>
              </div>
              <div className={`text-4xl font-display font-bold mb-1 group-hover:scale-105 transition-transform origin-left ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{stat.value}</div>
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center justify-between ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/40'}`}>
                {stat.label}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  className={`h-full bg-gradient-to-r from-neon-green/40 to-neon-green rounded-full shadow-[0_0_10px_#39FF14]`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className={`p-8 rounded-3xl border relative overflow-hidden transition-all ${theme === 'dark' ? 'bg-green-950/20 border-green-900' : 'glass bg-white border-green-50'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green/40 via-transparent to-transparent" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                <BookOpen className="w-5 h-5 text-neon-green" />
                Daily Habits & Tasks
                <button 
                  onClick={() => setTasks([])}
                  className="ml-2 text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                >
                  Clear All
                </button>
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64 flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={studyTopic}
                      onChange={(e) => setStudyTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateStudyTasks()}
                      placeholder="Add a new study task..."
                      className={`w-full border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors pr-10 shadow-inner ${theme === 'dark' ? 'bg-green-950/40 border-green-900 text-white' : 'bg-green-50/40 border-green-100 text-green-950'}`}
                    />
                    <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green/30 pointer-events-none" />
                  </div>
                  <button 
                    onClick={generateStudyTasks}
                    className="p-2.5 bg-neon-green text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-neon-green/20"
                    title="Add Task"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {tasks.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => toggleTask(item.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                      item.status === "Completed" 
                        ? theme === 'dark' ? "bg-green-950/40 border-green-900 opacity-60" : "bg-green-50/30 border-green-100 opacity-60" 
                        : theme === 'dark' ? "bg-green-900/10 border-green-900 hover:border-neon-green/30" : "bg-green-50/50 border-green-100 hover:border-neon-green/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.status === "Completed" ? "bg-neon-green border-neon-green" : theme === 'dark' ? "border-green-800" : "border-green-200 group-hover:border-neon-green"
                      }`}>
                        {item.status === "Completed" && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <div className={`font-bold transition-all ${item.status === "Completed" ? (theme === 'dark' ? "text-green-400/50 line-through" : "text-green-800/50 line-through") : (theme === 'dark' ? "text-white" : "text-green-900")}`}>
                          {item.task}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>{item.time}</div>
                          {item.energy && (
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                              item.energy <= 3 ? "bg-green-50 border-green-100 text-green-600" :
                              item.energy <= 7 ? "bg-yellow-50 border-yellow-100 text-yellow-600" :
                              "bg-red-50 border-red-100 text-red-600"
                            }`}>
                              <Zap className="w-2.5 h-2.5 fill-current" />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Energy: {item.energy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        item.status === "Completed" ? "bg-green-200 text-green-800" : (theme === 'dark' ? "bg-green-800/40 text-green-200" : "bg-green-100 text-green-800")
                      }`}>
                        {item.status}
                      </span>
                      <button 
                        onClick={(e) => deleteTask(e, item.id)}
                        className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className={`p-8 rounded-3xl border relative overflow-hidden group min-h-[400px] transition-all flex flex-col ${theme === 'dark' ? 'bg-green-950/20 border-green-900 bg-gradient-to-br from-neon-green/5 to-transparent' : 'glass bg-gradient-to-br from-neon-green/5 to-transparent border-green-100'}`}>
               <div className="absolute top-0 right-0 w-48 h-48 bg-neon-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
               <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />
               
               <div className="text-center z-10 w-full flex-1 flex flex-col relative">
                 <div className="flex items-center justify-between mb-8">
                   <div className="flex flex-col items-start">
                     <h3 className={`text-2xl font-display font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                       <Sun className="w-6 h-6 text-yellow-500 animate-pulse" />
                       Node Analysis
                     </h3>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-green ml-9">Operational Status</span>
                   </div>
                   <div className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border-2 shadow-sm ${
                     metrics.status === "Safe" ? "bg-green-100 border-green-200 text-green-800" :
                     metrics.status === "At Risk" ? "bg-yellow-100 border-yellow-200 text-yellow-800" :
                     "bg-red-100 border-red-200 text-red-800"
                   }`}>
                     {metrics.status}
                   </div>
                 </div>

                 <div className="space-y-6 flex-1 flex flex-col">
                   <motion.div 
                     whileHover={{ x: 5 }}
                     className={`p-6 rounded-[32px] border shadow-inner text-left transition-all ${theme === 'dark' ? 'bg-green-950/60 border-green-900' : 'bg-white/60 border-green-100'}`}
                   >
                     <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-3 ${theme === 'dark' ? 'text-neon-green' : 'text-green-800'}`}>Neural Insight</span>
                     <p className={`text-base font-medium italic leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-green-950'}`}>&ldquo;{metrics.healthTip}&rdquo;</p>
                   </motion.div>

                   <div className="flex-1 space-y-4 text-left">
                     <div className="flex items-center justify-between mb-2">
                       <span className={`text-[10px] font-black uppercase tracking-[0.2em] pl-1 ${theme === 'dark' ? 'text-green-400/60' : 'text-green-800/40'}`}>Optimization Queue</span>
                       <div className="h-px bg-neon-green/20 flex-1 ml-4" />
                     </div>
                     <div className="space-y-3">
                       {metrics.recommendations.length > 0 ? (
                         metrics.recommendations.map((rec, i) => (
                           <motion.div 
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: i * 0.1 }}
                             key={i} 
                             className={`flex gap-4 text-sm p-4 rounded-2xl border hover:border-neon-green/50 hover:bg-neon-green/5 transition-all group/rec ${theme === 'dark' ? 'bg-green-900/5 text-gray-300 border-green-900' : 'text-green-950 bg-green-50/30 border-green-100'}`}
                           >
                             <div className="w-2 h-2 bg-neon-green rounded-full mt-1.5 shrink-0 group-hover/rec:scale-125 transition-transform shadow-[0_0_10px_#39FF14]" />
                             <span className="flex-1 font-bold tracking-tight leading-snug">{rec}</span>
                           </motion.div>
                         ))
                       ) : (
                         <div className={`text-center py-10 text-sm italic ${theme === 'dark' ? 'text-green-800/60' : 'text-green-800/30'}`}>
                           System Idle. Complete regular check-ins for neural mapping.
                         </div>
                       )}
                     </div>
                   </div>

                   <div className={`pt-6 border-t ${theme === 'dark' ? 'border-green-900' : 'border-green-100'}`}>
                     <motion.button 
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={() => setShowMeditation(true)}
                       className="w-full py-5 bg-neon-green text-white rounded-[24px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_10px_30px_-10px_rgba(57,255,20,0.3)] flex items-center justify-center gap-4 group/zen"
                     >
                       <div className="p-1 bg-white/20 rounded-lg group-hover/zen:rotate-12 transition-transform">
                         <Play className="w-5 h-5 fill-current" />
                       </div>
                       Initiate Zen Protocol
                     </motion.button>
                   </div>
                 </div>
               </div>
             </div>

            <div className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all ${theme === 'dark' ? 'bg-green-950/20 border-green-900' : 'glass bg-white border-green-50'}`}>
              <div className="flex items-center justify-between mb-6">
                <h4 className={`text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                  <Activity className="w-4 h-4 text-neon-green" />
                  Comprehensive Health Journal
                </h4>
                <button 
                  onClick={() => setShowFullHistory(true)}
                  className="text-[10px] font-bold text-neon-green uppercase tracking-widest hover:underline"
                >
                  View History
                </button>
              </div>
              <div className="space-y-4">
                {history.slice(0, 3).map((record, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-2xl border transition-all group ${theme === 'dark' ? 'bg-green-900/5 border-green-900 hover:border-neon-green/30' : 'bg-green-50/20 border-green-50 hover:border-neon-green/30'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${theme === 'dark' ? 'text-green-400' : 'text-green-800/40'}`}>
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                        record.status === "Safe" ? "bg-green-50 border-green-200 text-green-700" : 
                        record.status === "At Risk" ? "bg-yellow-50 border-yellow-200 text-yellow-700" :
                        "bg-red-50 border-red-200 text-red-700"
                      }`}>
                        {record.status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <div className="flex items-center gap-2">
                        <Moon className="w-3 h-3 text-blue-500" />
                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-green-900'}`}>{record.sleepHours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="w-3 h-3 text-yellow-500" />
                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-green-900'}`}>{record.mood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-emerald-500" />
                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-green-900'}`}>{record.studyHours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-neon-green" />
                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-green-900'}`}>{record.burnoutRisk}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {history.length === 0 && (
                  <div className={`text-center py-6 text-[10px] italic font-medium ${theme === 'dark' ? 'text-green-800/60' : 'text-green-800/30'}`}>No health records yet. Complete a check!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full History Modal */}
      <AnimatePresence>
        {showFullHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md ${theme === 'dark' ? 'bg-black/60' : 'bg-green-950/20'}`}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-4xl max-h-[90vh] rounded-[40px] p-8 md:p-10 shadow-2xl relative border flex flex-col ${theme === 'dark' ? 'bg-[#0a201a] border-green-900' : 'bg-white border-green-100'}`}
            >
              <button 
                onClick={() => setShowFullHistory(false)}
                className={`absolute top-8 right-8 p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-green-900 text-white' : 'hover:bg-green-50 text-green-800'}`}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
                <div className="p-4 bg-neon-green/10 rounded-[28px] text-neon-green flex-shrink-0">
                  <Activity className="w-8 h-8" />
                </div>
                <div>
                  <h3 className={`text-3xl font-display font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>30-Day Health Journal</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'} font-medium`}>Historical analysis of your academic and physical wellness metrics.</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                <div className="grid grid-cols-1 gap-4">
                  {history.slice(0, 30).map((record, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group grid grid-cols-1 sm:grid-cols-5 p-6 rounded-[32px] border hover:border-neon-green/40 transition-all gap-4 items-center ${theme === 'dark' ? 'bg-green-900/10 border-green-900 hover:bg-green-900/20' : 'bg-green-50/20 border-green-100 hover:bg-white'}`}
                    >
                      <div className="sm:col-span-1">
                        <div className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                          {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                        <div className={`text-[10px] uppercase font-black tracking-widest ${theme === 'dark' ? 'text-green-400' : 'text-green-800/40'}`}>{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long' })}</div>
                      </div>

                      <div className="flex items-center gap-6 sm:col-span-3">
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <Moon className="w-4 h-4 text-blue-500 mb-1" />
                          <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{record.sleepHours}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-green-400' : 'text-green-800/40'}`}>Sleep</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <Sun className="w-4 h-4 text-yellow-500 mb-1" />
                          <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{record.mood}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-green-400' : 'text-green-800/40'}`}>Mood</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <BookOpen className="w-4 h-4 text-emerald-500 mb-1" />
                          <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{record.studyHours}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-green-400' : 'text-green-800/40'}`}>Study</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mb-1" />
                          <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{record.burnoutRisk}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-green-400' : 'text-green-800/40'}`}>Stress</span>
                        </div>
                      </div>

                      <div className="sm:col-span-1 text-right">
                        <div className={`inline-block text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border-2 ${
                          record.status === "Safe" ? "bg-green-100 border-green-200 text-green-800" :
                          record.status === "At Risk" ? "bg-yellow-100 border-yellow-200 text-yellow-800" :
                          "bg-red-100 border-red-200 text-red-800"
                        }`}>
                          {record.status}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {history.length === 0 && (
                    <div className={`text-center py-20 flex flex-col items-center gap-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-800/30'}`}>
                      <RotateCcw className="w-10 h-10 opacity-20 animate-spin-slow" />
                      <p className="italic font-medium text-lg">Your health history is empty. Start your daily check-in!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {selectedHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md ${theme === 'dark' ? 'bg-black/60' : 'bg-green-950/20'}`}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative border ${theme === 'dark' ? 'bg-[#0a201a] border-green-900' : 'bg-white border-green-100'}`}
            >
              <button 
                onClick={() => setSelectedHistory(null)}
                className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-green-900 text-white' : 'hover:bg-green-50 text-green-800'}`}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-neon-green/10 rounded-2xl text-neon-green">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-2xl font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{selectedHistory} History</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>Tracking your health journey</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {history.map((record, i) => {
                  let val = "";
                  if (selectedHistory === "Sleep Hours") val = record.sleepHours;
                  else if (selectedHistory === "Mood") val = record.mood;
                  else if (selectedHistory === "Study Hours") val = record.studyHours;
                  else if (selectedHistory === "Burnout Risk") val = record.burnoutRisk;

                  return (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${theme === 'dark' ? 'bg-green-900/10 border-green-900' : 'bg-green-50/50 border-green-100'}`}>
                      <div>
                        <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>{val}</div>
                        <div className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-green-400' : 'text-green-800/40'}`}>
                          {new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                        record.status === "Safe" ? "bg-green-100 text-green-800" :
                        record.status === "At Risk" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {record.status}
                      </div>
                    </div>
                  );
                })}
                {history.length === 0 && (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-green-800/60' : 'text-green-800/40'}`}>
                    No history records found yet.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meditation Modal */}
      <AnimatePresence>
        {showMeditation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md ${theme === 'dark' ? 'bg-black/60' : 'bg-green-950/20'}`}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-2xl rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden border ${theme === 'dark' ? 'bg-[#0a201a] border-green-900' : 'bg-white border-green-100'}`}
            >
              <button 
                onClick={() => { setShowMeditation(false); setIsActive(false); setIsComplete(false); }}
                className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-green-900 text-white' : 'hover:bg-green-50 text-green-800'}`}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid md:grid-cols-2 gap-12 items-start relative z-10">
                <div className="text-left">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-3xl relative ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
                      <div className={`absolute inset-0 rounded-3xl border border-neon-green/30 ${isActive ? 'animate-ping' : ''}`} />
                      <Sun className={`w-10 h-10 text-neon-green ${isActive ? 'animate-spin-slow' : ''}`} />
                    </div>
                  </div>
                  <h3 className={`text-5xl font-display font-black mb-1 leading-none ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>Zen Protocol</h3>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 block mb-8">Neural Pattern Reset</span>

                  <div className="relative mb-10">
                    <div className={`text-8xl font-display font-black tracking-tight transition-all tabular-nums ${isComplete ? 'scale-75 opacity-50' : ''} ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>
                      {formatTime(timer)}
                    </div>
                    
                    <AnimatePresence>
                      {isComplete && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm rounded-3xl ${theme === 'dark' ? 'bg-green-950/80' : 'bg-white/80'}`}
                        >
                          <CheckCircle2 className="w-12 h-12 text-neon-green mb-2" />
                          <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>Session Complete</span>
                          <button 
                            onClick={() => { setIsComplete(false); setTimer(600); }}
                            className="mt-4 text-sm font-bold text-neon-green hover:underline"
                          >
                            Reset Timer
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
                    {timePresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => { setTimer(preset.value); setIsActive(false); setIsComplete(false); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          timer === preset.value 
                            ? "bg-neon-green text-white" 
                            : theme === 'dark' ? "bg-green-900/40 text-green-300 hover:bg-green-900/60" : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-6">
                    <button 
                      onClick={() => { setTimer(600); setIsActive(false); setIsComplete(false); }}
                      className={`p-4 rounded-2xl transition-colors ${theme === 'dark' ? 'bg-green-900/20 text-green-400 hover:bg-green-900/40' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                      <RotateCcw className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => {
                        if (isComplete) {
                          setIsComplete(false);
                          setTimer(600);
                        }
                        setIsActive(!isActive);
                      }}
                      className="w-20 h-20 bg-neon-green text-white rounded-3xl flex items-center justify-center shadow-xl shadow-green-200 hover:scale-105 transition-transform"
                    >
                      {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>
                  </div>
                </div>

                <div className={`p-8 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-green-900/5 border-green-900' : 'bg-green-50/50 border-green-100'}`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>
                    <Sparkles className="w-5 h-5 text-neon-green" />
                    Meditation Tips
                  </h4>
                  <ul className="space-y-4">
                    {meditationTips.map((tip, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex gap-3 text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/80'}`}
                      >
                        <div className="w-1.5 h-1.5 bg-neon-green rounded-full mt-1.5 shrink-0" />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


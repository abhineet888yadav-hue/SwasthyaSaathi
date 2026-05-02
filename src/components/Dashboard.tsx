import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";
import { Moon, Sun, BookOpen, AlertTriangle, RefreshCw, CheckCircle2, Play, Pause, RotateCcw, X, Sparkles, Zap, Activity, Trash2, Plus, ChevronRight, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { 
  fadeInUp, 
  staggerContainer, 
  hover3D, 
  buttonPress, 
  springConfig 
} from "../lib/animations";

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
import { getGeminiAI } from "../lib/gemini";
import { Type } from "@google/genai";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

import { useTheme } from "../context/ThemeContext";

import NeuralLoader from "./NeuralLoader";

export default function Dashboard() {
  const { metrics, history, profile, updateProfile, updateMetrics, addHistoryRecord } = useHealth();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  // Scroll progress logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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

  function StatSkeleton() {
    return (
      <div className={`p-6 rounded-3xl border animate-pulse ${theme === 'dark' ? 'bg-green-950/20 border-green-900' : 'bg-green-50 border-green-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-green-200/20" />
          <div className="w-16 h-4 bg-green-200/20 rounded-full" />
        </div>
        <div className="w-24 h-10 bg-green-200/20 rounded-lg mb-4" />
        <div className="w-full h-1.5 bg-green-200/20 rounded-full" />
      </div>
    );
  }

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("swasthya-tasks");
    return saved ? JSON.parse(saved) : [
      { id: "1", task: "Review Mathematics Chapter 4", time: "45 mins", energy: 7, status: "Upcoming" },
      { id: "2", task: "Practice Chemistry Equations", time: "30 mins", energy: 5, status: "Completed" },
      { id: "3", task: "Read English Literature", time: "20 mins", energy: 3, status: "Upcoming" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("swasthya-tasks", JSON.stringify(tasks));
  }, [tasks]);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const recentHistory = history.slice(0, 5).map(h => ({
        date: h.date,
        sleep: h.sleepHours,
        mood: h.mood,
        status: h.status
      }));

      const prompt = `As SwasthyaSaathi, analyze the following student metrics and history to provide a coaching status.
      
      Compare current metrics with these recent trend: ${JSON.stringify(recentHistory)}.
      
      Metrics:
      - Sleep Progress: ${metrics.sleepProgress}/100
      - Study Progress: ${metrics.studyProgress}/100
      - Mood Progress: ${metrics.moodProgress}/100
      - Burnout Risk: ${metrics.burnoutProgress}/100
      
      Return a coaching insight object. Use professional yet relatable Hinglish for the healthTip (e.g., "Sleep pattern thoda off hai, aaj 15 min pehle so jao").`;

      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "You are SwasthyaSaathi, a wise and compassionate mentor. You analyze health trends to prevent student burnout. Response MUST be valid JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ["Safe", "At Risk", "Problem Detected"] },
              healthTip: { type: Type.STRING },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              sleepProgress: { type: Type.NUMBER },
              studyProgress: { type: Type.NUMBER },
              moodProgress: { type: Type.NUMBER },
              burnoutProgress: { type: Type.NUMBER },
              sleepHours: { type: Type.STRING },
              studyHours: { type: Type.STRING },
              mood: { type: Type.STRING },
              burnoutRisk: { type: Type.STRING }
            },
            required: ["status", "healthTip", "recommendations", "sleepProgress", "studyProgress", "moodProgress", "burnoutProgress", "sleepHours", "studyHours", "mood", "burnoutRisk"]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        updateMetrics(parsed);
      }
    } catch (err: any) {
      console.error("Failed to fetch node analysis:", err);
      
      const isKeyMissing = err.message === "API_KEY_MISSING";
      
      // Fallback
      updateMetrics({
        ...metrics,
        status: "At Risk",
        healthTip: isKeyMissing 
          ? "Oho! Gemini API Key missing lag raha hai. Server configuration check karein." 
          : "Lagta hai network issue hai, but don't worry, keep analyzing internally!",
        recommendations: isKeyMissing 
          ? ["Check API Configuration", "Contact Administrator"]
          : ["Check internet connection", "Take a short manual break"]
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const neuralSyncTasks = async () => {
    setIsRefreshing(true);
    try {
      const prompt = `As SwasthyaSaathi, based on these metrics:
Sleep: ${metrics.sleepHours} (${metrics.sleepProgress}%)
Mood: ${metrics.mood} (${metrics.moodProgress}%)
Burnout: ${metrics.burnoutRisk} (${metrics.burnoutProgress}%)
Current Tasks: ${tasks.map(t => t.task).join(', ')}

Suggest 3 specific, actionable study or wellness tasks for the next hour in Hinglish.
Return a strict JSON array of objects: [{"task": "...", "time": "...", "energy": 1-10}].
No markdown, just raw JSON.`;

      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.text) {
        const suggested = JSON.parse(response.text.trim());
        const newTasks = suggested.map((s: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          task: s.task,
          time: s.time,
          energy: s.energy,
          status: "Upcoming"
        }));
        setTasks(prev => [...newTasks, ...prev]);
      }
    } catch (err) {
      console.error("Neural sync failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      return prev.map(t => 
        t.id === id ? { ...t, status: t.status === "Completed" ? "Upcoming" : "Completed" } : t
      );
    });
  };

  const deleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const generateStudyTasks = async () => {
    if (!studyTopic.trim() || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const prompt = `Student wants to study: "${studyTopic}". 
      Break this into 3 bite-sized, actionable tasks in Hinglish.
      Return a strict JSON array: [{"task": "...", "time": "...", "energy": 1-10}].
      No markdown, just raw JSON.`;

      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.text) {
        const suggested = JSON.parse(response.text.trim());
        const newTasks = suggested.map((s: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          task: s.task,
          time: s.time,
          energy: s.energy,
          status: "Upcoming"
        }));
        setTasks(prev => [...newTasks, ...prev]);
        setStudyTopic("");
      }
    } catch (err) {
      console.error("Task generation failed:", err);
      // Fallback
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        task: studyTopic,
        time: "45 mins",
        energy: 5,
        status: "Upcoming"
      };
      setTasks(prev => [newTask, ...prev]);
      setStudyTopic("");
    } finally {
      setIsRefreshing(false);
    }
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

  const deleteHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app we'd call a context method, but for now we'll just acknowledge
    alert("History cleared locally. Start a new check-in to begin fresh neural mapping!");
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous + 5) return "↗️";
    if (current < previous - 5) return "↘️";
    return "➡️";
  };

  const trendAnalysis = history.length >= 2 ? {
    sleep: getTrendIcon(history[0].sleepProgress, history[1].sleepProgress),
    mood: getTrendIcon(history[0].moodProgress, history[1].moodProgress),
    study: getTrendIcon(history[0].studyProgress, history[1].studyProgress),
    burnout: getTrendIcon(history[1].burnoutProgress, history[0].burnoutProgress), // Burnout is better if lower
  } : null;

  return (
    <>
    <section id="dashboard" className={`py-20 relative transition-colors duration-500 overflow-hidden ${theme === 'dark' ? 'bg-[#0a201a]' : 'bg-white'}`}>
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-neon-green z-[150] origin-left"
        style={{ scaleX }}
      />
      
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
            className="flex items-center gap-6"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-neon-green rounded-[32px] blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="w-20 h-20 rounded-[32px] overflow-hidden border-2 border-neon-green/30 bg-green-900/10 flex-shrink-0 relative z-10 aspect-square">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neon-green font-black text-2xl">
                    {user?.displayName?.[0] || "S"}
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-1">
                <h2 className={`text-4xl md:text-6xl font-display font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                  Hello, <span className="neon-text italic">{user?.displayName?.split(' ')[0] || "Student"}</span>
                </h2>
              </div>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/70'} font-medium tracking-tight`}>
                Optimizing your <span className="text-neon-green">Neural-to-Study Ratio</span> in real-time.
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileSettings(true)}
              className={`p-4 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-green-900/20 border-green-800 text-neon-green' : 'bg-white border-green-100 text-green-700'}`}
              title="Identity & Goals"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
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
      </div>

        <motion.div 
          id="dashboard-stats-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 perspective-1000"
        >
          {isRefreshing ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            stats.map((stat, index) => (
              <motion.div
                key={index}
                id={`stat-card-${index}`}
                variants={fadeInUp}
                whileHover={hover3D.whileHover}
                whileTap={hover3D.whileTap}
                onClick={() => setSelectedHistory(stat.label)}
                className={`p-6 rounded-3xl shadow-sm border cursor-pointer transition-all ${theme === 'dark' ? 'bg-green-950/20 border-green-900 group hover:border-neon-green/50 hover:shadow-[0_0_20px_rgba(57,255,20,0.1)]' : 'glass bg-white border-green-50 hover:border-neon-green/30 hover:shadow-xl hover:shadow-green-100/20'}`}
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
            ))
          )}
        </motion.div>

        <motion.div 
          id="dashboard-main-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          <motion.div 
            variants={fadeInUp}
            id="dashboard-habits-wrapper"
            className="lg:col-span-2 h-full"
          >
            <div id="dashboard-habits-container" className={`p-10 rounded-[48px] border relative overflow-hidden group transition-all duration-500 h-full ${theme === 'dark' ? 'bg-[#0a201a]/60 border-green-900/50' : 'bg-white/80 border-green-100 shadow-2xl shadow-green-100/10'} backdrop-blur-xl hover:shadow-[0_0_40px_rgba(57,255,20,0.05)]`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green/40 via-transparent to-transparent" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6 relative z-10">
                <div>
                  <h3 className={`text-2xl font-display font-black flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                    <div className="p-2 bg-neon-green/20 rounded-xl">
                      <BookOpen className="w-5 h-5 text-neon-green" />
                    </div>
                    Daily Habits & Tasks
                  </h3>
                  <p className={`text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 ml-12 mt-1`}>Cognitive Schedule</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={neuralSyncTasks}
                    disabled={isRefreshing}
                    className="h-11 text-[10px] font-black text-neon-green border-2 border-neon-green/30 px-6 rounded-2xl uppercase tracking-widest hover:bg-neon-green/10 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Neural Sync
                  </button>
                  <div className="relative group/input hidden sm:block">
                    <input 
                      type="text" 
                      value={studyTopic}
                      onChange={(e) => setStudyTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateStudyTasks()}
                      placeholder="New neural task..."
                      className={`w-56 border-2 rounded-2xl py-3 px-5 text-xs font-bold focus:outline-none focus:border-neon-green/50 transition-all pr-12 shadow-inner ${theme === 'dark' ? 'bg-green-950/60 border-green-900/50 text-white' : 'bg-green-50/50 border-green-100 text-green-950'}`}
                    />
                    <button 
                      onClick={generateStudyTasks}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-neon-green text-green-900 rounded-xl hover:scale-110 active:scale-90 transition-all shadow-lg shadow-neon-green/20"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neon-green/20">
                <AnimatePresence mode="popLayout">
                  {tasks.length > 0 ? tasks.map((item, taskIndex) => (
                    <motion.div 
                      key={item.id} 
                      id={`dashboard-task-item-${taskIndex}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleTask(item.id)}
                      className={`flex items-center justify-between p-6 rounded-[32px] border transition-all cursor-pointer group ${
                        item.status === "Completed" 
                          ? theme === 'dark' ? "bg-green-950/20 border-green-900/30 opacity-60" : "bg-green-50/20 border-green-0/50 opacity-60" 
                          : theme === 'dark' ? "bg-green-900/10 border-green-800 hover:border-neon-green/40 hover:bg-green-900/20" : "bg-white border-green-100 shadow-sm hover:shadow-xl hover:shadow-green-100/20 hover:border-neon-green/30"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-500 transform group-hover:rotate-12 ${
                          item.status === "Completed" ? "bg-neon-green border-neon-green shadow-lg shadow-neon-green/20" : theme === 'dark' ? "border-green-800 bg-green-950/50" : "border-green-100 bg-white group-hover:border-neon-green/50"
                        }`}>
                          {item.status === "Completed" ? <CheckCircle2 className="w-6 h-6 text-green-900" /> : <div className="w-2 h-2 rounded-full bg-green-300 opacity-20 group-hover:opacity-100 transition-opacity" />}
                        </div>
                        <div>
                          <div className={`text-base font-black transition-all ${item.status === "Completed" ? (theme === 'dark' ? "text-green-400/50 line-through" : "text-green-800/50 line-through") : (theme === 'dark' ? "text-white" : "text-green-950")}`}>
                            {item.task}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/40'}`}>{item.time}</span>
                            {item.energy && (
                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 ${
                                item.energy <= 3 ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                item.energy <= 7 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                                "bg-red-500/10 border-red-500/20 text-red-500"
                              }`}>
                                <Zap className="w-2.5 h-2.5 fill-current" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Load: {item.energy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => deleteTask(e, item.id)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${theme === 'dark' ? 'text-red-400/30 hover:text-red-400 hover:bg-red-400/10' : 'text-red-200 hover:text-red-500 hover:bg-red-50 shadow-sm'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )) : (
                    <div className={`text-center py-24 rounded-[40px] border-2 border-dashed ${theme === 'dark' ? 'border-green-900/50' : 'border-green-100'}`}>
                      <p className={`text-sm font-bold italic ${theme === 'dark' ? 'text-green-800/40' : 'text-green-800/20'}`}>No active tasks. <br /> Use Neural Sync to generate a path.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          <motion.div 
              variants={fadeInUp}
              className="flex flex-col gap-8"
            >
              <div id="dashboard-node-analysis-card" className={`p-8 rounded-[40px] border relative overflow-hidden group min-h-[500px] transition-all flex flex-col ${theme === 'dark' ? 'bg-[#0a201a]/80 border-green-900/50' : 'bg-white/80 border-green-100 shadow-2xl shadow-green-100/20'} backdrop-blur-2xl hover:border-neon-green/30`}>
               {/* Animated Neural Mesh Background */}
               <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-neon-green rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-30" />
                 <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-10' : 'opacity-5'}`} style={{ backgroundImage: 'radial-gradient(#39FF14 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
               </div>
               
               <div className="z-10 w-full flex-1 flex flex-col relative">
                 <div className="flex items-center justify-between mb-10">
                   <div className="flex flex-col items-start">
                     <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-neon-green/20 rounded-xl">
                          <Activity className="w-5 h-5 text-neon-green" />
                        </div>
                        <h3 className={`text-2xl font-display font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                          Node Analysis
                        </h3>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-green/60 ml-1">Real-time Cognitive Sync</span>
                   </div>
                   <motion.div 
                     animate={{ 
                       scale: [1, 1.05, 1],
                       boxShadow: metrics.status === "Safe" ? ["0 0 0px #39FF14", "0 0 15px #39FF14", "0 0 0px #39FF14"] : []
                     }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className={`px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase border-2 ${
                       metrics.status === "Safe" ? "bg-green-100/50 border-green-400/50 text-green-800 shadow-neon-green/20" :
                       metrics.status === "At Risk" ? "bg-yellow-100/50 border-yellow-400/50 text-yellow-800 shadow-yellow-400/20" :
                       "bg-red-100/50 border-red-400/50 text-red-800 shadow-red-400/20"
                     }`}
                   >
                     {metrics.status}
                   </motion.div>
                 </div>

                 <div className="space-y-8 flex-1 flex flex-col">
                   <motion.div 
                     whileHover={{ y: -5 }}
                     className={`p-6 rounded-[32px] border relative overflow-hidden transition-all ${theme === 'dark' ? 'bg-green-950/40 border-green-800/50 shadow-inner' : 'bg-white border-green-100 shadow-xl shadow-green-100/10'}`}
                   >
                     <div className="absolute top-0 right-0 p-4">
                       <Sparkles className="w-4 h-4 text-neon-green opacity-40" />
                     </div>
                     <span className={`text-[9px] font-black uppercase tracking-[0.3em] block mb-4 ${theme === 'dark' ? 'text-neon-green/80' : 'text-green-700'}`}>Neural Insight</span>
                     <p className={`text-lg font-bold leading-relaxed tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>&ldquo;{metrics.healthTip}&rdquo;</p>
                   </motion.div>

                   <div className="flex-1 space-y-5">
                     <div className="flex items-center justify-between mb-2 px-2">
                       <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/40'}`}>Optimization Queue</span>
                       <div className="flex gap-1">
                         {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-neon-green/30 rounded-full" />)}
                       </div>
                     </div>
                     <div className="space-y-4">
                       {metrics.recommendations.length > 0 ? (
                         metrics.recommendations.map((rec, i) => (
                           <motion.div 
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: i * 0.1 }}
                             key={i} 
                             className={`flex items-start gap-4 p-5 rounded-[24px] border group/rec transition-all duration-300 ${theme === 'dark' ? 'bg-green-900/10 border-green-900/50 text-gray-300 hover:bg-green-900/20 hover:border-neon-green/30' : 'bg-green-50/30 border-green-100 text-green-950 hover:bg-white hover:border-neon-green/30 hover:shadow-lg hover:shadow-neon-green/5'}`}
                           >
                             <div className="w-5 h-5 bg-neon-green/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border border-neon-green/20 group-hover/rec:bg-neon-green/20 transition-colors">
                               <CheckCircle2 className="w-3 h-3 text-neon-green" />
                             </div>
                             <span className="flex-1 font-bold tracking-tight leading-snug text-sm">{rec}</span>
                             <ChevronRight className="w-4 h-4 text-neon-green/0 group-hover/rec:text-neon-green/100 transition-all -translate-x-2 group-hover/rec:translate-x-0" />
                           </motion.div>
                         ))
                       ) : (
                         <div className={`text-center py-16 rounded-[32px] border-2 border-dashed ${theme === 'dark' ? 'border-green-900/50 text-green-800/60' : 'border-green-100 text-green-800/30'}`}>
                           <p className="italic font-bold text-sm">System Idle. <br /> Awaiting neural dataset.</p>
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="pt-8 space-y-4">
                     <div className="flex gap-4">
                       <motion.button 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={handleRefresh}
                         className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 ${theme === 'dark' ? 'bg-green-900/30 border-neon-green/50 text-neon-green hover:bg-neon-green/10' : 'bg-white border-neon-green/20 text-neon-green hover:bg-neon-green/5 hover:border-neon-green/40 shadow-sm'}`}
                       >
                         <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                         {isRefreshing ? 'Syncing...' : 'Scan'}
                       </motion.button>
                       <motion.button 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => addHistoryRecord(metrics)}
                         className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 ${theme === 'dark' ? 'bg-blue-900/30 border-blue-500/50 text-blue-400 hover:bg-blue-500/10' : 'bg-white border-blue-500/20 text-blue-500 hover:bg-blue-500/5 hover:border-blue-500/40 shadow-sm'}`}
                       >
                         <Activity className="w-4 h-4" />
                         Log Node
                       </motion.button>
                     </div>
                     <motion.button 
                       whileHover={{ scale: 1.01, filter: "brightness(1.1)" }}
                       whileTap={{ scale: 0.99 }}
                       onClick={() => setShowMeditation(true)}
                       className="w-full py-5 bg-neon-green text-green-900 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-neon-green/30 flex items-center justify-center gap-4 group/zen"
                     >
                       <div className="p-1.5 bg-white/30 rounded-xl group-hover/zen:scale-110 group-hover/zen:rotate-12 transition-transform">
                         <Zap className="w-4 h-4 fill-current" />
                       </div>
                       Initiate Zen Protocol
                     </motion.button>
                   </div>
                 </div>
               </div>
             </div>
            </motion.div>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col gap-8"
          >


            <div id="dashboard-journal-card" className={`p-10 rounded-[48px] border shadow-2xl transition-all backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0a201a]/40 border-green-900/50 hover:border-neon-green/30 shadow-black' : 'bg-white border-green-100 hover:shadow-neon-green/5 shadow-green-100/20'}`}>
              <div className="flex items-center justify-between mb-10 text-left">
                <div className="flex flex-col">
                  <h4 className={`text-xl font-display font-black flex items-center gap-3 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    Health Journal
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/60 ml-12 mt-1">30-Day Analysis</span>
                </div>
                <button 
                  onClick={() => setShowFullHistory(true)}
                  className="px-6 py-3 rounded-2xl text-[10px] font-black text-neon-green uppercase tracking-widest border-2 border-neon-green/20 hover:bg-neon-green/10 transition-all active:scale-95"
                >
                  History
                </button>
              </div>
              
              <div className="space-y-5">
                {history.slice(0, 3).map((record, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 rounded-[32px] border transition-all duration-300 group hover:-translate-y-1 ${theme === 'dark' ? 'bg-green-900/5 border-green-800/40 hover:border-blue-500/50' : 'bg-white border-green-100 hover:border-blue-200 shadow-sm hover:shadow-lg'}`}
                  >
                    <div className="flex items-center justify-between mb-6 text-left">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800/40'}`}>
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className={`text-[8px] font-black px-3 py-1 rounded-full border-2 ${
                        record.status === "Safe" ? "bg-green-100/50 border-green-400/50 text-green-800" : 
                        record.status === "At Risk" ? "bg-yellow-100/50 border-yellow-400/50 text-yellow-700" :
                        "bg-red-100/50 border-red-400/50 text-red-700"
                      }`}>
                        {record.status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`flex flex-col gap-1.5 p-4 rounded-2xl ${theme === 'dark' ? 'bg-green-950/40' : 'bg-green-50/50'}`}>
                        <div className="flex items-center gap-2">
                           <Moon className="w-3.5 h-3.5 text-blue-500" />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/40'}`}>Sleep</span>
                        </div>
                        <span className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>{record.sleepHours}</span>
                      </div>
                      <div className={`flex flex-col gap-1.5 p-4 rounded-2xl ${theme === 'dark' ? 'bg-green-950/40' : 'bg-green-50/50'}`}>
                        <div className="flex items-center gap-2">
                           <Sun className="w-3.5 h-3.5 text-yellow-500" />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/40'}`}>Mood</span>
                        </div>
                        <span className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>{record.mood}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {history.length === 0 && (
                  <div className={`text-center py-16 rounded-[40px] border-2 border-dashed ${theme === 'dark' ? 'border-green-900/50 text-green-800/40' : 'border-green-100 text-green-800/20'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed">Awaiting node telemetry <br /> for analysis</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
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
              transition={springConfig}
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

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {showProfileSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-md ${theme === 'dark' ? 'bg-black/80' : 'bg-green-950/20'}`}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={springConfig}
              className={`w-full max-w-xl rounded-[40px] p-8 md:p-10 shadow-2xl relative border ${theme === 'dark' ? 'bg-[#0a201a] border-green-900' : 'bg-white border-green-100'}`}
            >
              <button 
                onClick={() => setShowProfileSettings(false)}
                className={`absolute top-8 right-8 p-3 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-green-900 text-white' : 'hover:bg-green-50 text-green-800'}`}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-6 mb-10">
                <div className="p-4 bg-neon-green/10 rounded-[28px] text-neon-green">
                  <Settings className="w-8 h-8" />
                </div>
                <div>
                  <h3 className={`text-3xl font-display font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>Identity & Goals</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'} font-medium`}>Customize your AI Mentor focus.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${theme === 'dark' ? 'text-neon-green' : 'text-green-800'}`}>Current Goal / Target</label>
                  <input 
                    type="text" 
                    value={profile.goal}
                    onChange={(e) => updateProfile({ goal: e.target.value })}
                    placeholder="e.g., JEE Advanced, Class 10 Boards, Learn to Code"
                    className={`w-full p-5 rounded-2xl border transition-all focus:ring-4 focus:ring-neon-green/10 outline-none font-bold ${theme === 'dark' ? 'bg-green-950/40 border-green-900 text-white' : 'bg-green-50/40 border-green-100 text-green-950'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${theme === 'dark' ? 'text-neon-green' : 'text-green-800'}`}>Motivation Style</label>
                    <select 
                      value={profile.motivation}
                      onChange={(e) => updateProfile({ motivation: e.target.value })}
                      className={`w-full p-5 rounded-2xl border transition-all outline-none font-bold ${theme === 'dark' ? 'bg-green-950/40 border-green-900 text-white' : 'bg-green-50/40 border-green-100 text-green-950'}`}
                    >
                      <option>Balanced</option>
                      <option>Strict & Hardcore</option>
                      <option>Empathetic & Gentle</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${theme === 'dark' ? 'text-neon-green' : 'text-green-800'}`}>Study Method</label>
                    <select 
                      value={profile.studyPreference}
                      onChange={(e) => updateProfile({ studyPreference: e.target.value })}
                      className={`w-full p-5 rounded-2xl border transition-all outline-none font-bold ${theme === 'dark' ? 'bg-green-950/40 border-green-900 text-white' : 'bg-green-50/40 border-green-100 text-green-950'}`}
                    >
                      <option>Interactive</option>
                      <option>Video-First</option>
                      <option>Deep Reading</option>
                    </select>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfileSettings(false)}
                  className="w-full py-5 bg-neon-green text-white rounded-[24px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-neon-green/20 transition-all"
                >
                  Save Neural Profile
                </motion.button>
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
    </>
  );
}


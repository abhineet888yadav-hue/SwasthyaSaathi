import { motion } from "motion/react";
import { Users, MessageSquare, Heart, Share2, Sparkles, Zap, TrendingUp, Trophy } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const activities = [
  {
    id: "1",
    user: "Rahul S.",
    action: "completed a 4-hour Deep Focus session",
    time: "2 mins ago",
    type: "academic",
    likes: 24,
    comments: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
  },
  {
    id: "2",
    user: "Priya V.",
    action: "solved 50 complex Calculus problems",
    time: "15 mins ago",
    type: "win",
    likes: 42,
    comments: 12,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
  },
  {
    id: "3",
    user: "Ananya K.",
    action: "optimized her sleep cycle for exam week",
    time: "45 mins ago",
    type: "health",
    likes: 18,
    comments: 3,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
  }
];

const trendingTopics = [
  { topic: "#GATE2026Prep", posts: "2.4k", color: "text-neon-green" },
  { topic: "#BoardsCombat", posts: "5.1k", color: "text-blue-400" },
  { topic: "#LateNightSaathis", posts: "1.2k", color: "text-purple-400" },
  { topic: "#HealthOverGrades", posts: "3.8k", color: "text-emerald-400" }
];

export default function Community() {
  const { theme } = useTheme();

  return (
    <section id="community" className={`py-24 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#051510]' : 'bg-white'}`}>
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-green rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex flex-col">
          <div id="community-main-container" className="flex flex-col lg:flex-row gap-12">
            {/* Left Column: Feed */}
            <div id="community-feed-column" className="lg:w-2/3">
              <div className="mb-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  id="community-feed-tag"
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'bg-green-900/40 border-green-800 text-neon-green' : 'bg-green-50 border-green-100 text-green-700'}`}
                >
                  <Sparkles className="w-3 h-3 fill-current" />
                  Neural Network Feed
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                  id="community-header-title"
                  className={`text-4xl md:text-5xl font-display font-black mb-6 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}
                >
                  Together we <span className="neon-text italic">thrive.</span>
                </motion.h2>
                <p id="community-description" className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/70'} font-medium`}>
                  See how your fellow <span className="text-neon-green">Saathis</span> are balancing the grind.
                </p>
              </div>

              <div id="community-activities-list" className="space-y-6">
                {activities.map((item, index) => (
                  <motion.div
                    key={item.id}
                    id={`community-activity-card-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    className={`p-6 rounded-[32px] border transition-all duration-300 group ${theme === 'dark' ? 'bg-green-900/10 border-green-900/50 hover:border-neon-green/40 hover:shadow-[0_0_30px_rgba(57,255,20,0.15)]' : 'bg-white border-green-50 shadow-md hover:shadow-2xl hover:shadow-green-100/30'}`}
                  >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-green-900/20 border border-neon-green/20">
                      <img src={item.avatar} alt={item.user} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{item.user}</span>
                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/40'}`}>{item.time}</span>
                      </div>
                      <p className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-green-900/70'}`}>
                        {item.action} 
                        {item.type === 'academic' && <Zap className="w-3 h-3 inline ml-2 text-neon-green fill-current" />}
                        {item.type === 'win' && <Trophy className="w-3 h-3 inline ml-2 text-yellow-400 fill-current" />}
                        {item.type === 'health' && <Heart className="w-3 h-3 inline ml-2 text-red-400 fill-current" />}
                      </p>
                      
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-neon-green transition-colors">
                          <Heart className="w-4 h-4" /> {item.likes}
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-neon-green transition-colors">
                          <MessageSquare className="w-4 h-4" /> {item.comments}
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-neon-green transition-colors ml-auto">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Trending & Committee */}
          <div className="lg:w-1/3">
            <div className={`p-8 rounded-[40px] border h-full transition-all ${theme === 'dark' ? 'bg-[#0a201a]/80 border-green-900/50' : 'bg-green-50/50 border-green-100 shadow-xl'}`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className={`text-xl font-display font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                  Academic Committee
                </h3>
              </div>

              <div className="space-y-6 mb-10">
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] block mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/40'}`}>Trending Nodes</span>
                {trendingTopics.map((topic, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 5 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${theme === 'dark' ? 'bg-green-900/10 border-green-900/50' : 'bg-white border-green-50 shadow-sm'}`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-black text-sm ${topic.color}`}>{topic.topic}</span>
                      <span className="text-[10px] font-bold text-gray-500">{topic.posts} active students</span>
                    </div>
                    <TrendingUp className={`w-4 h-4 ${topic.color}`} />
                  </motion.div>
                ))}
              </div>

              <div className={`p-6 rounded-[32px] border relative overflow-hidden ${theme === 'dark' ? 'bg-green-950/40 border-green-900' : 'bg-white border-green-100'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Zap className="w-12 h-12 text-neon-green" />
                </div>
                <h4 className={`text-lg font-black mb-2 leading-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                  Join the <br /> Committee Discussion
                </h4>
                <p className={`text-xs mb-6 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>
                  Bhai, don't study alone! Connect with peers who share your goals and energy.
                </p>
                <button className="w-full py-4 bg-neon-green text-green-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-neon-green/20 hover:scale-105 transition-all">
                  Connect Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

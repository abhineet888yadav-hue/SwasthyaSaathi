import { motion } from "motion/react";
import { Sparkles, Brain } from "lucide-react";

interface NeuralLoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function NeuralLoader({ label, size = "md", className = "" }: NeuralLoaderProps) {
  const sizes = {
    sm: { container: "w-16 h-16", icon: "w-6 h-6", text: "text-[8px]" },
    md: { container: "w-28 h-28", icon: "w-10 h-10", text: "text-[10px]" },
    lg: { container: "w-40 h-40", icon: "w-14 h-14", text: "text-xs" }
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className={`relative ${s.container}`}>
        {/* Outer Orbit 1 */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-0 border-[1.5px] border-dashed border-neon-green/20 rounded-[40%] blur-[0.5px]"
        />

        {/* Outer Orbit 2 */}
        <motion.div
          animate={{ 
            rotate: -360,
          }}
          transition={{ 
            rotate: { duration: 12, repeat: Infinity, ease: "linear" }
          }}
          className="absolute inset-2 border-[1px] border-dotted border-neon-green/30 rounded-[45%]"
        />

        {/* Synapse Connection Paths (SVG) */}
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none opacity-40">
          <defs>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#39FF14" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="url(#line-grad)"
            strokeWidth="1"
            strokeDasharray="1, 10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Floating Synapse Flares */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: [0, 360],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div 
              className="w-1.5 h-1.5 bg-neon-green rounded-full blur-[2px] shadow-[0_0_10px_#39FF14]"
              style={{ transform: `translateX(${45 + i * 5}px)` }}
            />
          </motion.div>
        ))}

        {/* Core Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 p-4 bg-neon-green/5 rounded-full border border-neon-green/20 backdrop-blur-sm"
          >
            <div className="relative">
              <Brain className={`${s.icon} text-neon-green drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]`} />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-3 h-3 text-neon-green" />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Inner Glow Pulse */}
          <motion.div
            animate={{ 
              scale: [0.8, 1.3, 0.8],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 bg-neon-green/30 rounded-full blur-2xl"
          />
        </div>
      </div>
      
      {label && (
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center gap-2 font-black uppercase tracking-[0.4em] text-neon-green ${s.text}`}
          >
            <span className="w-1.5 h-1.5 bg-neon-green rounded-full shadow-[0_0_8px_#39FF14] animate-pulse" />
            {label}
            <span className="w-1.5 h-1.5 bg-neon-green rounded-full shadow-[0_0_8px_#39FF14] animate-pulse delay-150" />
          </motion.div>
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-neon-green/50 to-transparent overflow-hidden">
            <motion.div 
              animate={{ x: [-48, 48] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-1/2 h-full bg-neon-green"
            />
          </div>
        </div>
      )}
    </div>
  );
}

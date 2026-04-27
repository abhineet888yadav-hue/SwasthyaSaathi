import { motion } from "motion/react";
import { Sparkles, Loader2 } from "lucide-react";

interface NeuralLoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function NeuralLoader({ label, size = "md", className = "" }: NeuralLoaderProps) {
  const sizes = {
    sm: { container: "w-12 h-12", icon: "w-4 h-4", text: "text-[8px]" },
    md: { container: "w-20 h-20", icon: "w-6 h-6", text: "text-[10px]" },
    lg: { container: "w-32 h-32", icon: "w-10 h-10", text: "text-xs" }
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`relative ${s.container}`}>
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-0 border border-dashed border-neon-green rounded-full"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-2 border border-dotted border-neon-green rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Sparkles className={`${s.icon} text-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]`} />
            <Loader2 className={`absolute inset-0 ${s.icon} text-neon-green/30 animate-spin`} />
          </motion.div>
        </div>
      </div>
      
      {label && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-center gap-2 font-black uppercase tracking-[0.3em] text-neon-green/60 ${s.text}`}
        >
          <span className="w-1 h-1 bg-neon-green rounded-full animate-pulse" />
          {label}
          <span className="w-1 h-1 bg-neon-green rounded-full animate-pulse delay-75" />
        </motion.div>
      )}
    </div>
  );
}

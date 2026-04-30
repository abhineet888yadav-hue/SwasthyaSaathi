import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Ask a Question",
    description: "Type your academic doubt or share how you're feeling in the chat."
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Our SwasthyaSaathi AI analyzes your query using advanced Gemini intelligence."
  },
  {
    number: "03",
    title: "Smart Response",
    description: "Receive a simple explanation, a study plan, or a health tip instantly."
  },
  {
    number: "04",
    title: "Track Progress",
    description: "Watch your dashboard update with new insights and tasks."
  }
];

import { useTheme } from "../context/ThemeContext";

export default function HowItWorks() {
  const { theme } = useTheme();

  return (
    <section className={`py-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a201a]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-5xl font-display font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>How it <span className="neon-text">Works</span></h2>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>Four simple steps to a smarter student life.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="relative group w-full flex justify-center"
            >
              <div className={`relative z-10 aspect-square w-full max-w-[260px] rounded-full flex flex-col items-center justify-center p-6 text-center shadow-sm transition-all duration-500 hover:-translate-y-2 border ${theme === 'dark' ? 'bg-green-950/20 border-green-900 hover:border-neon-green/50 hover:shadow-neon-green/5' : 'bg-white border-green-100 hover:border-neon-green/50 hover:shadow-xl hover:shadow-green-100/50'}`}>
                <div className={`text-4xl font-display font-black mb-3 group-hover:text-neon-green/40 transition-colors ${theme === 'dark' ? 'text-green-900' : 'text-green-200'}`}>
                  {step.number}
                </div>
                <h3 className={`text-lg font-bold mb-2 transition-colors ${theme === 'dark' ? 'text-white group-hover:text-neon-green' : 'text-green-900 group-hover:text-neon-green'}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/70'}`}>{step.description}</p>
              </div>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className={`hidden lg:block absolute top-1/2 left-[50%] w-[calc(100%+2rem)] h-[2px] -z-10 ${theme === 'dark' ? 'bg-green-950' : 'bg-green-100'}`} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

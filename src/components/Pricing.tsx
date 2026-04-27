import { motion } from "motion/react";
import { Check, Zap, Crown, User, Star } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const plans = [
  {
    name: "Free",
    subtitle: "(Starter)",
    price: "₹0",
    period: "/ forever",
    description: "Perfect for students just starting their health-conscious study journey.",
    features: [
      "Basic AI Doubt Solving",
      "Daily Health Check-ins",
      "Standard Study Timer"
    ],
    buttonText: "Get Started",
    icon: User,
    color: "text-blue-500",
    bg: "bg-blue-50",
    popular: false
  },
  {
    name: "Pro",
    subtitle: "(Swasthya Plus)",
    price: "₹499",
    period: "/ month",
    description: "Advanced tools for students serious about academic mastery and burnout prevention.",
    features: [
      "Unlimited AI Mentorship",
      "Advanced Burnout Analytics",
      "Custom Focus Music & Meditation"
    ],
    buttonText: "Go Pro - Most Popular",
    icon: Zap,
    color: "text-neon-green",
    bg: "bg-green-50",
    popular: true
  },
  {
    name: "Elite",
    subtitle: "(The Achiever)",
    price: "₹999",
    period: "/ month",
    description: "The ultimate edge for competitive exams and peak cognitive performance.",
    features: [
      "Priority 24/7 AI Access",
      "Personalized 1-on-1 Study Path",
      "Wearable Device Integration"
    ],
    buttonText: "Unlock Elite",
    icon: Crown,
    color: "text-purple-500",
    bg: "bg-purple-50",
    popular: false
  }
];

export default function Pricing() {
  const { theme } = useTheme();

  return (
    <section id="pricing" className={`py-24 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a201a]' : 'bg-white'}`}>
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-neon-green' : 'bg-green-200'}`} />
        <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100'}`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'bg-green-900/40 border-green-800 text-neon-green shadow-lg shadow-green-950/50' : 'bg-green-50 border-green-100 text-green-700 shadow-sm'}`}
          >
            <Star className="w-3 h-3 fill-current" />
            Pricing Strategy
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-6xl font-display font-black mb-6 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}
          >
            Invest in your grades, <br />
            <span className="neon-text">without sacrificing your health.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/70'} font-medium leading-relaxed`}
          >
            Choose the plan that fits your academic goals and mental well-being. 
            SwasthyaSaathi is here to scale with you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ y: -10 }}
              transition={{ 
                delay: index * 0.1,
                scale: { type: "spring", stiffness: 300, damping: 25 }
              }}
              viewport={{ once: true }}
              className={`flex flex-col p-8 rounded-[40px] border relative overflow-hidden transition-all duration-300 ${
                plan.popular 
                  ? theme === 'dark' ? 'bg-green-900/20 border-neon-green/50 shadow-2xl shadow-neon-green/10' : 'bg-white border-neon-green shadow-xl shadow-neon-green/10 ring-4 ring-neon-green/5' 
                  : theme === 'dark' ? 'bg-green-950/20 border-green-900 hover:border-green-800' : 'bg-white border-green-50 shadow-sm hover:border-green-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-neon-green text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-2 rotate-45 translate-x-[28%] translate-y-[28%] shadow-lg">
                    Popular
                  </div>
                </div>
              )}

              <div className="mb-8">
                <div className={`p-4 rounded-2xl inline-flex mb-6 ${theme === 'dark' ? 'bg-green-900/40' : plan.bg} ${plan.color}`}>
                  <plan.icon className="w-8 h-8" />
                </div>
                <h3 className={`text-2xl font-display font-black leading-none mb-1 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                  {plan.subtitle}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{plan.price}</span>
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/40'}`}>{plan.period}</span>
                </div>
                <p className={`mt-4 text-sm font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-neon-green/10 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-neon-green" />
                    </div>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-green-900/80'}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-95 ${
                  plan.popular 
                    ? 'bg-neon-green text-white shadow-xl shadow-neon-green/20 hover:brightness-110' 
                    : theme === 'dark' ? 'bg-green-900/40 text-white border-2 border-green-800 hover:border-neon-green' : 'bg-green-50 text-green-900 border-2 border-green-100 hover:border-neon-green'
                }`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-green-800/30'}`}>
            All plans include core AI ethical safeguards & state-of-the-art encryption.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

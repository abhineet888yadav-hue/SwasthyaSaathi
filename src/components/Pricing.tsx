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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col p-8 rounded-[40px] border relative transition-all duration-500 overflow-hidden group ${
                plan.popular 
                  ? theme === 'dark' ? 'bg-green-900/10 border-neon-green/30 shadow-2xl shadow-neon-green/5' : 'bg-white border-neon-green/30 shadow-xl shadow-neon-green/10 ring-1 ring-neon-green/10' 
                  : theme === 'dark' ? 'bg-green-950/10 border-green-900/50' : 'bg-white border-green-100 shadow-sm'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {plan.popular && (
                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'bg-neon-green text-green-950' : 'bg-neon-green text-white shadow-lg shadow-neon-green/20'}`}>
                  Most Popular
                </div>
              )}

              <div className="mb-8 relative z-10">
                <div className={`p-4 rounded-2xl inline-flex mb-6 ${theme === 'dark' ? 'bg-green-900/20' : plan.bg} ${plan.color} shadow-inner`}>
                  <plan.icon className="w-8 h-8" />
                </div>
                <h3 className={`text-2xl font-display font-black leading-none mb-1 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                  {plan.name}
                </h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-neon-green/60' : 'text-green-700/60'}`}>
                  {plan.subtitle}
                </p>
              </div>

              <div className="mb-8 relative z-10">
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{plan.price}</span>
                  <span className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500/60' : 'text-green-800/30'}`}>{plan.period}</span>
                </div>
                <p className={`mt-4 text-sm font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1 relative z-10 text-[13px]">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-neon-green shrink-0" />
                    <span className={`font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-green-900/80'}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 active:scale-95 relative z-10 border-2 ${
                  plan.popular 
                    ? 'bg-neon-green text-white border-neon-green shadow-xl shadow-neon-green/20 hover:brightness-110' 
                    : theme === 'dark' ? 'bg-transparent text-white border-green-800/50 hover:border-neon-green' : 'bg-transparent text-green-900 border-green-100 hover:border-neon-green'
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
          className="mt-20 text-center"
        >
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-gray-500/40' : 'text-green-800/20'}`}>
            Secure Neural Network • HIPAA Compliant • ISO Certified
          </p>
        </motion.div>
      </div>
    </section>
  );
}

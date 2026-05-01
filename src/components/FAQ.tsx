import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const faqs = [
  {
    question: "Kya ye Hindi mein answer de sakta hai?",
    answer: "Bilkul! SwasthyaSaathi Hinglish expert hai. Hum English aur Hindi dono samajhte hain taaki aapko padhai mein koi tension na ho."
  },
  {
    question: "Stress detection kaise kaam karta hai?",
    answer: "Humara AI aapke study patterns aur tone ko analyze karta hai. Agar burnout ke symptoms milte hain, toh hum break, meditation aur light schedule suggest karte hain, Boss!"
  },
  {
    question: "Kya study plan customize ho sakta hai?",
    answer: "Haan ji! Aap apne exam dates aur preferred timings batayein, baaki neural mapping aur logic hum handle kar lenge."
  },
  {
    question: "B.Tech ya GATE ke liye helpful hai?",
    answer: "Sirf Class 5 hi nahi, Higher Education level topics aur competitive exams ke liye bhi humara logic optimize hai."
  }
];

import { useTheme } from "../context/ThemeContext";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { theme } = useTheme();

  return (
    <section id="faq" className={`py-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#051510]' : 'bg-green-50/30'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-6xl font-display font-black tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>Questions? <span className="neon-text italic">Sorted.</span></h2>
          <p className={`text-lg font-medium opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-green-800'}`}>Everything you need to know about your neural companion.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className={`rounded-[32px] overflow-hidden transition-all duration-500 border ${theme === 'dark' ? 'bg-green-900/10 border-green-800 hover:border-neon-green/30 px-2' : 'bg-white border-green-100 shadow-sm hover:shadow-md px-2'}`}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between text-left group"
              >
                <span className={`text-lg font-black tracking-tight transition-colors ${theme === 'dark' ? 'text-gray-200 group-hover:text-neon-green' : 'text-green-900 group-hover:text-neon-green'}`}>{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className={openIndex === index ? "text-neon-green" : theme === 'dark' ? "text-green-600" : "text-green-800/40"} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className={`p-6 pt-0 border-t ${theme === 'dark' ? 'text-gray-400 border-green-900' : 'text-green-800/70 border-green-50'}`}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

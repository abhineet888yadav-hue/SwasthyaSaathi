import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const faqs = [
  {
    question: "Can it answer in Hindi?",
    answer: "Yes! SwasthyaSaathi is fully capable of understanding and responding in Hindi and English to make learning more accessible."
  },
  {
    question: "How does it help with stress?",
    answer: "Our AI analyzes your tone and patterns. If it detects signs of stress or burnout, it suggests breaks, breathing exercises, or a lighter study schedule."
  },
  {
    question: "Is the study plan customizable?",
    answer: "Absolutely. You can tell the AI about your exam dates and preferred study hours, and it will generate a plan that fits your life."
  },
  {
    question: "Can I use it for any subject?",
    answer: "Yes, SwasthyaSaathi can help with a wide range of subjects from Science and Math to Humanities and Languages."
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
          <h2 className={`text-3xl md:text-5xl font-display font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>Frequently Asked <span className="neon-text">Questions</span></h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className={`rounded-2xl overflow-hidden transition-all duration-300 border ${theme === 'dark' ? 'bg-green-950/20 border-green-900 group' : 'glass bg-white border-transparent'}`}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full p-6 flex items-center justify-between text-left transition-colors group ${theme === 'dark' ? 'hover:bg-green-900/40' : 'hover:bg-green-50'}`}
              >
                <span className={`font-bold transition-colors ${theme === 'dark' ? 'text-gray-200 group-hover:text-neon-green' : 'text-green-900 group-hover:text-neon-green'}`}>{faq.question}</span>
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

import { motion } from "motion/react";
import { Brain, Github, Twitter, Linkedin, Instagram, Heart, ArrowUp, Send, Mail, MapPin, Phone, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className={`pt-32 pb-24 transition-colors duration-500 relative overflow-hidden ${theme === 'dark' ? 'bg-[#051510]' : 'bg-white'}`}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green/20 to-transparent" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#39FF14 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Newsletter / CTA Section */}
        <div className={`p-12 md:p-20 rounded-[48px] border mb-32 relative overflow-hidden ${theme === 'dark' ? 'bg-green-900/5 border-green-900/50' : 'bg-green-50 border-green-100'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div>
              <h3 className={`text-4xl md:text-5xl font-display font-black leading-none mb-6 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                Ready to reach your <br />
                <span className="neon-text">Peak Cognitive Performance?</span>
              </h3>
              <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/70'}`}>
                Join 10,000+ students engineering their academic success. <br />
                Abhi shuru karein, free mein.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link 
                to="/signup" 
                className="bg-neon-green text-green-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-neon-green/20"
              >
                Get Started Now
              </Link>
              <button 
                className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${theme === 'dark' ? 'border-green-800 text-white hover:border-neon-green' : 'border-green-200 text-green-900 hover:border-neon-green'}`}
              >
                Book Demo
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 pb-20 border-b border-green-900/10">
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-neon-green/10 rounded-lg">
                <Brain className="w-6 h-6 text-neon-green" />
              </div>
              <span className={`text-xl font-display font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>
                Swasthya<span className="text-neon-green">Saathi</span>
              </span>
            </Link>
            <p className={`text-sm font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>
              The global standard for intelligent student health and academic integration. Neural insights for the modern learner.
            </p>
            <div className="flex items-center gap-6">
              {[Twitter, Github, Instagram, Linkedin].map((Icon, i) => (
                <Link key={i} to="#" className={`transition-all hover:text-neon-green ${theme === 'dark' ? 'text-gray-600' : 'text-green-800/30'}`}>
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {[
            { 
              title: "Product", 
              links: ["Features", "Study Timer", "Pricing"] 
            },
            { 
              title: "Company", 
              links: ["About Us", "Our Mission", "Success Stories", "Blog"] 
            },
            { 
              title: "Community", 
              links: ["Support", "Documentation", "Contact Us", "Feedback"] 
            }
          ].map((col, i) => (
            <div key={i}>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-8 ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
                {col.title}
              </h4>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link to="#" className={`text-xs font-bold transition-colors hover:text-neon-green ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-600' : 'text-green-800/20'}`}>
              © {currentYear} Neural Labs Inc.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy', 'Legal', 'Security'].map((item) => (
                <Link key={item} to="#" className={`text-[10px] font-black uppercase tracking-widest transition-colors hover:text-neon-green ${theme === 'dark' ? 'text-gray-600' : 'text-green-800/20'}`}>
                  {item}
                </Link>
              ))}
            </div>
          </div>
          
          <button 
            onClick={scrollToTop}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all hover:-translate-y-1 active:scale-95 ${theme === 'dark' ? 'bg-green-900/10 border-green-900/50 text-white' : 'bg-white border-green-100 text-green-900 shadow-sm'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}

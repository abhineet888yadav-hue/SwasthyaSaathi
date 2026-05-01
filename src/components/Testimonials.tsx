import { motion } from "motion/react";
import { Star, Quote, Heart } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "Class 12 Student",
    content: "SwasthyaSaathi ne meri boards ki prep bilkul badal di. Burnout risk analysis feature is a lifesaver!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
    stars: 5,
    tag: "Board Exams"
  },
  {
    name: "Priya Varma",
    role: "NEET Aspirant",
    content: "The Hinglish AI mentor feels so real. It's like having a big brother who's also a genius at biology.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    stars: 5,
    tag: "Competitive"
  },
  {
    name: "Ismail Khan",
    role: "B.Tech 2nd Year",
    content: "Finally an app that doesn't just ask me to study more, but actually cares about my sleep and mental health.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ismail",
    stars: 5,
    tag: "Engineering"
  }
];

export default function Testimonials() {
  const { theme } = useTheme();

  return (
    <section id="testimonials" className={`py-24 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#051510]' : 'bg-green-50/30'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'bg-green-900/40 border-green-800 text-neon-green shadow-lg shadow-green-950/50' : 'bg-green-100 border-green-200 text-green-700 shadow-sm'}`}
          >
            <Heart className="w-3 h-3 fill-current" />
            Neural Community
          </motion.div>
          <motion.h2
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             viewport={{ once: true }}
             className={`text-4xl md:text-6xl font-display font-black mb-6 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}
          >
            Loved by <span className="neon-text italic">10,000+ Students</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`p-10 rounded-[48px] border relative group transition-all duration-700 ${theme === 'dark' ? 'bg-green-950/20 border-green-900 hover:border-neon-green/30' : 'bg-white border-green-100 shadow-xl shadow-green-100/10 hover:shadow-2xl hover:shadow-neon-green/5'}`}
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-neon-green/10 rounded-full flex items-center justify-center text-neon-green opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 pointer-events-none">
                <Quote className="w-6 h-6 fill-current" />
              </div>

              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-neon-green/20 relative group-hover:border-neon-green/50 transition-all duration-500 transform group-hover:rotate-6">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className={`font-black text-xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>{testimonial.name}</h4>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-neon-green/60' : 'text-green-700/60'}`}>{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className={`text-base font-medium leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-green-900/80'}`}>
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}`}>
                {testimonial.tag}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

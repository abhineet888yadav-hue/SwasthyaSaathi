import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className={`transition-colors duration-500 border-t py-12 ${theme === 'dark' ? 'bg-[#051510] border-green-950' : 'bg-green-50/50 border-green-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <span className={`text-2xl font-display font-bold tracking-tight mb-4 block ${theme === 'dark' ? 'text-white' : 'text-green-950'}`}>
              Swasthya<span className="text-neon-green">Saathi</span>
            </span>
            <p className={`max-w-sm ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>
              The ultimate AI companion for students to balance academic excellence with mental well-being. Built for the future of learning.
            </p>
          </div>
          <div>
            <h4 className={`font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>Quick Links</h4>
            <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>
              <li><a href="#hero" className="hover:text-neon-green transition-colors duration-300">Home</a></li>
              <li><a href="#features" className="hover:text-neon-green transition-colors duration-300">Features</a></li>
              <li><a href="#dashboard" className="hover:text-neon-green transition-colors duration-300">Dashboard</a></li>
              <li><a href="#faq" className="hover:text-neon-green transition-colors duration-300">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className={`font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>Connect</h4>
            <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-green-800/60'}`}>
              <li><a href="#" className="hover:text-neon-green transition-colors duration-300">GitHub</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors duration-300">Twitter</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors duration-300">Discord</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors duration-300">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className={`pt-8 border-t text-center text-sm ${theme === 'dark' ? 'border-green-950 text-green-900' : 'border-green-100 text-green-800/40'}`}>
          <p>© 2026 SwasthyaSaathi. All rights reserved. Built for Hackathon 2026.</p>
        </div>
      </div>
    </footer>
  );
}

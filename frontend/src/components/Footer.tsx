import { Github, Instagram, X } from "lucide-react";
import { motion } from 'framer-motion';

// --- Utility: The main Footer component ---
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const outer = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06, duration: 0.6 } }
  } as const;

  const inner = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } }
  } as const;

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.18 }} // animate every time
      variants={outer}
      className="relative overflow-hidden"
    >
      {/* Top hero-style section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 sm:gap-6">
          <motion.div variants={inner} className="md:col-span-8">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white"
              style={{ fontFamily: 'Georgia, ui-serif, serif' }}
            >
              Report{' '}
              <span className="font-semibold text-purple-600">Issues</span>
              <br />
              Track{' '}
              <span className="font-semibold text-purple-600">Progress</span> 
              <br className="sm:hidden" />
              Make a{' '}
              <span className="font-semibold text-purple-600">Difference</span>
            </h2>
          </motion.div>

          <motion.div
            variants={inner}
            className="md:col-span-4 flex md:justify-end mt-4 md:mt-0"
          >
            <a
              href="#"
              className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-2xl transform transition hover:-translate-y-1 hover:scale-105"
            >
              Get Started
            </a>
          </motion.div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-8 sm:pb-12">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl shadow-inner border border-slate-100/6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 p-6 sm:p-8 md:p-10">
            {/* About Section */}
            <motion.div variants={inner}>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <img src="/awaaz logo .png" alt="Awaaz logo" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded" />
                    <span className="mt-2 sm:mt-0">About Smart Issues</span>
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Smart Issues helps communities report problems, track resolutions, and drive real-world impact through transparent progress tracking.
              </p>
            </motion.div>

            {/* Contact Section */}
            <motion.div variants={inner}>
              <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-slate-900 dark:text-white">Contact Us</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Email Support</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Community Forum</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Feedback Form</a></li>
              </ul>
            </motion.div>

            {/* Connect Section */}
            <motion.div variants={inner}>
              <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-slate-900 dark:text-white">Connect With Us</h4>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-3 sm:gap-4">
                <a href="#" className="flex items-center gap-2 sm:gap-3 text-slate-700 dark:text-slate-200 transition transform hover:scale-105 hover:text-indigo-400">
                  <Instagram className="h-5 w-5 sm:h-6 sm:w-6 bg-white/60 rounded p-1" />
                  <span className="text-xs sm:text-sm">Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-2 sm:gap-3 text-slate-700 dark:text-slate-200 transition transform hover:scale-105 hover:text-indigo-400">
                  <X className="h-5 w-5 sm:h-6 sm:w-6 bg-black text-white rounded p-1" />
                  <span className="text-xs sm:text-sm">X</span>
                </a>
              </div>
            </motion.div>
          </div>

          <div className="border-t border-slate-100/6 px-6 sm:px-8 py-4 sm:py-6">
            <motion.div variants={inner} className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <p>© {currentYear} Smart Issues. All rights reserved.</p>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow { 
          0% { transform: translateY(0px);} 
          50% { transform: translateY(-6px);} 
          100% { transform: translateY(0px);} 
        }
        @keyframes float { 
          0% { transform: translateY(0px);} 
          50% { transform: translateY(-6px);} 
          100% { transform: translateY(0px);} 
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </motion.footer>
  );
};

// --- Main App Component to render the Footer ---
const App = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
        {/* Filler content adjusted to ensure scrolling is required to see the footer */}
        
        <Footer />
    </div>
  )
}

export default App;

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  Github, 
  Linkedin,
  Mail,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { personalInfo } from './data';

export default function Contact() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans selection:bg-[#FAFAFA] selection:text-[#050505] overflow-x-hidden">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-8 md:px-16 flex justify-between items-center z-50 mix-blend-difference top-0 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm shadow-xl shadow-black/10 text-white">
        <Link to="/" className="text-2xl font-bold tracking-tighter">AR.</Link>
        <Link to="/" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors">
          <ChevronLeft size={16} /> Back to Home
        </Link>
      </nav>

      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-16 z-10 pt-32 pb-16">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Let's build<br />something great.
            </h1>
            
            <p className="text-lg md:text-xl font-light text-white/60 max-w-xl mb-12 leading-relaxed">
              Whether you need bespoke consultancy for metallurgical processing, custom AI agent development, or just want to discuss materials informatics—I'm available.
            </p>
            
            <div className="space-y-8">
              <div>
                 <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Direct Contact</h2>
                 <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-4 group">
                   <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                     <Mail size={20} className="text-white" />
                   </div>
                   <span className="text-lg font-medium group-hover:text-indigo-400 transition-colors">{personalInfo.email}</span>
                 </a>
              </div>
              
              <div>
                 <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Social Platforms</h2>
                 <div className="flex gap-4">
                   <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                      <Linkedin size={20} />
                   </a>
                   <a href={`https://${personalInfo.github}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                      <Github size={20} />
                   </a>
                   <a href={`https://x.com/A_Rahmankhn`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white font-bold text-lg">
                      X
                   </a>
                 </div>
              </div>
              
              <div>
                 <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Location</h2>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50">
                     <MapPin size={20} />
                   </div>
                   <span className="text-white/60 font-medium">{personalInfo.location}</span>
                 </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#111] border border-white/5 p-8 md:p-12 rounded-3xl h-full flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
            
            <h2 className="text-3xl font-bold mb-4 relative z-10">Book a Consultation</h2>
            <p className="text-white/60 mb-8 relative z-10 leading-relaxed font-light">
              Schedule a 30-minute discovery call to discuss your industrial scaling challenges, AI workflow integration, or materials research needs.
            </p>
            
            <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 relative z-10 mb-8">
               <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3 text-white/80 font-medium">
                     <Calendar size={20} className="text-indigo-400" />
                     <span>Discovery Call</span>
                  </div>
                  <span className="text-sm border border-white/10 px-3 py-1 rounded-full text-white/60">Free</span>
               </div>
               
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/60 text-sm">
                     <Clock size={16} />
                     <span>30 Minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60 text-sm">
                     <MapPin size={16} />
                     <span>Google Meet</span>
                  </div>
               </div>
            </div>
            
            <a href="https://calendly.com/arahmankhn" target="_blank" rel="noreferrer" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center justify-center gap-3 relative z-10">
              Schedule Now <ArrowUpRight size={18} />
            </a>
            
            <p className="text-center text-xs text-white/30 tracking-widest uppercase mt-6 relative z-10">
              Powered by Calendly
            </p>
          </motion.div>

        </div>
      </section>

    </div>
  );
}

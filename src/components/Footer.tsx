import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Linkedin, 
  Facebook, 
  ArrowUp, 
  Globe, 
  Mail,
  Compass,
  Github
} from 'lucide-react';

export default function Footer() {
  // Local Time State (PKT timezone UTC+5)
  const [localTime, setLocalTime] = useState('');
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    // Live Clock PKT (Asia/Karachi)
    const updateClock = () => {
      try {
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'Asia/Karachi',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        const formatter = new Intl.DateTimeFormat([], options);
        setLocalTime(formatter.format(new Date()));
      } catch (e) {
        setLocalTime(new Date().toLocaleTimeString());
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll progress calculator
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercent((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Custom SVGs for platforms not in standard Lucide
  const TwitterXIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  const BlueskyIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 10.8c-1.32-2.16-4.08-5.4-8.4-5.4C1.32 5.4 0 7.02 0 9.18c0 3.3 2.16 7.62 6.66 10.02 3.12 1.62 4.68 2.52 5.34 3.3.66-.78 2.22-1.68 5.34-3.3C21.84 16.8 24 12.48 24 9.18c0-2.16-1.32-3.78-3.6-3.78-4.32 0-7.08 3.24-8.4 5.4z" />
    </svg>
  );

  const MediumIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.54 12a6.8 6.8 0 11-13.54 0 6.8 6.8 0 0113.54 0zM21.46 12c0 3.42-1.52 6.2-3.4 6.2s-3.4-2.78-3.4-6.2 1.52-6.2 3.4-6.2 3.4 2.78 3.4 6.2zm2.54 0c0 3.06-.36 5.54-.8 5.54s-.8-2.48-.8-5.54.36-5.54.8-5.54.8 2.48.8 5.54z" />
    </svg>
  );

  const socials = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/arahmankhn/',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'hover:text-[#0077B5] hover:bg-[#0077B5]/10 hover:border-[#0077B5]/30',
      glow: 'shadow-[#0077B5]/20',
      bgGlow: 'from-[#0077B5]/10 to-transparent'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/ARahmankhn',
      icon: <Github className="w-5 h-5" />,
      color: 'hover:text-white hover:bg-white/10 hover:border-white/30',
      glow: 'shadow-white/10',
      bgGlow: 'from-white/5 to-transparent'
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/ARhmankhn',
      icon: <TwitterXIcon />,
      color: 'hover:text-white hover:bg-white/10 hover:border-white/30',
      glow: 'shadow-white/10',
      bgGlow: 'from-white/5 to-transparent'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/ARhmankhn',
      icon: <Facebook className="w-5 h-5" />,
      color: 'hover:text-[#1877F2] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30',
      glow: 'shadow-[#1877F2]/20',
      bgGlow: 'from-[#1877F2]/10 to-transparent'
    },
    {
      name: 'Bluesky',
      url: 'https://bsky.app/profile/abdulrahmankhan.bsky.social',
      icon: <BlueskyIcon />,
      color: 'hover:text-[#0560FF] hover:bg-[#0560FF]/10 hover:border-[#0560FF]/30',
      glow: 'shadow-[#0560FF]/20',
      bgGlow: 'from-[#0560FF]/10 to-transparent'
    },
    {
      name: 'Medium',
      url: 'https://medium.com/@ARahmankhn',
      icon: <MediumIcon />,
      color: 'hover:text-[#00ab6c] hover:bg-[#00ab6c]/10 hover:border-[#00ab6c]/30',
      glow: 'shadow-[#00ab6c]/20',
      bgGlow: 'from-[#00ab6c]/10 to-transparent'
    }
  ];

  return (
    <footer id="interactive-footer" className="relative pt-24 pb-12 px-6 md:px-16 bg-[#030303] text-white border-t border-white/10 overflow-hidden z-10">
      
      {/* Decorative background visual elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute bottom-[-150px] left-[50%] -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-0 right-[15%] w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Main Content Area */}
        <div className="flex flex-col items-center text-center space-y-12 mb-16">
          
          {/* Headline & Branding */}
          <div className="space-y-4 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 shadow-inner"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300 font-bold">Let's Connect & Innovate</span>
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60"
            >
              Abdul Rahman
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base text-white/50 font-light leading-relaxed max-w-lg mx-auto"
            >
              Materials Engineer specializing in AI Informatics, Alloy Modeling, and Computational Design. Let's build the future of manufacturing and metallurgy together.
            </motion.p>
          </div>

          {/* Social Icons Hub with Gorgeous Hover States */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-3xl"
          >
            {socials.map((platform, idx) => (
              <motion.a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -6, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/70 transition-all duration-300 shadow-lg cursor-pointer group ${platform.color} ${platform.glow}`}
              >
                {/* Micro Ambient Glow Background on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${platform.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                
                <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                  {platform.icon}
                </span>
                <span className="relative z-10 text-xs font-bold uppercase tracking-wider font-sans">
                  {platform.name}
                </span>
              </motion.a>
            ))}
          </motion.div>

        </div>

        {/* Separator */}
        <div className="w-full h-px bg-white/5 mb-10" />

        {/* Bottom Bar: Copyright, Telemetry, and Scroll progress */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/40">
          
          {/* Copyright & Live Status PKT */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Abdul Rahman. All Rights Reserved.</span>
            <span className="hidden sm:inline text-white/10">•</span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
              <span>PKT: {localTime || 'Active'}</span>
            </div>
          </div>

          {/* Quick Links & Back to Top progress */}
          <div className="flex items-center gap-8">
            <div className="flex gap-5 text-[11px] font-bold uppercase tracking-wider">
              <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>
              <a href="#experience" className="hover:text-indigo-400 transition-colors">Experience</a>
              <a href="#projects" className="hover:text-indigo-400 transition-colors">Projects</a>
              <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
            </div>

            {/* Premium Micro-interactive back to top with circle progress */}
            <button
              onClick={scrollToTop}
              title="Scroll back to top"
              className="relative w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:bg-indigo-600/10 flex items-center justify-center transition-all cursor-pointer group"
            >
              {/* Progress ring outline */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="22" 
                  cy="22" 
                  r="19" 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.03)" 
                  strokeWidth="1.5" 
                />
                <motion.circle 
                  cx="22" 
                  cy="22" 
                  r="19" 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="1.5" 
                  strokeDasharray="120"
                  strokeDashoffset={120 - (120 * scrollPercent) / 100}
                  className="transition-all duration-100"
                />
              </svg>
              <ArrowUp size={15} className="text-white/60 group-hover:text-indigo-400 group-hover:-translate-y-0.5 transition-all" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}

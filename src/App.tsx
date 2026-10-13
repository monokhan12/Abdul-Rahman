import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  Github, 
  Linkedin, 
  Mail, 
  MapPin, 
  Phone,
  Calendar,
  Layers, 
  Cpu, 
  Binary, 
  Microscope, 
  Flame, 
  Recycle, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Shield,
  Award
} from 'lucide-react';
import { Toaster } from 'sonner';

import { 
  personalInfo, 
  interests, 
  skills, 
  experience, 
  education, 
  projects, 
  publications, 
  additional 
} from './data';

import Contact from './Contact';
import BlogSection from './components/BlogSection';
import AllPostsPage from './components/AllPostsPage';
import BlogPostPage from './components/BlogPostPage';
import BlogAdminPage from './components/BlogAdminPage';
import ThemeToggle from './components/ThemeToggle';
import { useAuthStore } from './stores/authStore';

// Admin CMS Components
import ProtectedRoute from './components/ProtectedRoute';
import CmsLayout from './components/CmsLayout';
import CmsLogin from './components/CmsLogin';
import CmsDashboard from './components/CmsDashboard';
import CmsPosts from './components/CmsPosts';
import CmsCategories from './components/CmsCategories';
import CmsMedia from './components/CmsMedia';
import CmsSettings from './components/CmsSettings';
import UserProfile from './components/UserProfile';
import { CmsErrorBoundary } from './components/CmsErrorPage';

function PortfolioHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-x-clip">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-8%] left-[-10%] w-[550px] h-[550px] rounded-full bg-indigo-950/25 blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-950/15 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-950/20 blur-[150px]" />
      </div>

      {/* Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#050505]/85 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity">
            AR<span className="text-indigo-500">.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-medium uppercase tracking-widest text-white/60">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#interests" className="hover:text-white transition-colors">Research</a>
            <a href="#skills" className="hover:text-white transition-colors">Skills</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#education" className="hover:text-white transition-colors">Education</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#publications" className="hover:text-white transition-colors">Publications</a>
            <Link to="/blog" className="text-indigo-400 hover:text-indigo-300 transition-colors">Blog</Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            <ThemeToggle variant="nav" />
            <Link 
              to="/contact" 
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:scale-[1.02]"
            >
              Book Call
            </Link>
            <Link 
              to="/contact" 
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-lg shadow-indigo-600/25 hover:scale-[1.02]"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle variant="nav" />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#0a0a0a] border-b border-white/10 px-6 py-6"
            >
              <div className="flex flex-col gap-4 text-sm font-medium">
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white/70 hover:text-white">About</a>
                <a href="#interests" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white/70 hover:text-white">Research Focus</a>
                <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white/70 hover:text-white">Skills & Toolkit</a>
                <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white/70 hover:text-white">Experience</a>
                <a href="#education" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white/70 hover:text-white">Education</a>
                <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white/70 hover:text-white">Projects</a>
                <a href="#publications" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white/70 hover:text-white">Publications</a>
                <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="py-2 text-indigo-400">Scientific Blog</Link>
                
                {/* Mobile Theme Toggle */}
                <div className="py-2">
                  <ThemeToggle variant="mobile" />
                </div>

                <div className="pt-4 border-t border-white/10 flex gap-3">
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2.5 bg-indigo-600 text-center rounded-xl text-xs font-bold uppercase tracking-wider text-white">
                    Contact
                  </Link>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2.5 bg-white/10 text-center rounded-xl text-xs font-bold uppercase tracking-wider text-white">
                    Book Call
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="about" className="relative min-h-screen flex items-center pt-32 pb-20 px-6 md:px-12 z-10">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold uppercase tracking-widest text-indigo-300 mb-8">
              <Sparkles size={14} />
              <span>Physical Metallurgy & Materials Informatics</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-8">
              {personalInfo.name}
            </h1>

            <p className="text-2xl sm:text-3xl text-indigo-300 font-light tracking-tight mb-6">
              {personalInfo.title}
            </p>

            <p className="text-lg sm:text-xl text-white/65 font-light leading-relaxed mb-10 max-w-3xl">
              {personalInfo.summary}
            </p>

            {/* CTAs & Socials */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a 
                href="#projects" 
                className="px-7 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl hover:scale-[1.02]"
              >
                Explore Projects
              </a>
              <Link 
                to="/blog" 
                className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02]"
              >
                Read Scientific Blog
              </Link>
              <Link 
                to="/contact" 
                className="px-7 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02]"
              >
                Schedule Consultation
              </Link>
            </div>

            {/* Quick Metadata Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/50 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-indigo-400" />
                <span>{personalInfo.location}</span>
              </div>
              <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={16} className="text-indigo-400" />
                <span>{personalInfo.email}</span>
              </a>
              <a href={`https://${personalInfo.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Github size={16} className="text-indigo-400" />
                <span>GitHub</span>
              </a>
              <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Linkedin size={16} className="text-indigo-400" />
                <span>LinkedIn</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Research Focus / Interests */}
      <section id="interests" className="py-28 px-6 md:px-12 z-10 relative border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-16 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-4 inline-block">
              Core Pillars
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Research Focus & Specialization
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Bridging classical metallurgical characterization with contemporary machine learning algorithms and thermodynamic modeling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interests.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 hover:border-indigo-500/40 transition-all group relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  {idx === 0 && <Flame size={22} />}
                  {idx === 1 && <Cpu size={22} />}
                  {idx === 2 && <Microscope size={22} />}
                  {idx === 3 && <Recycle size={22} />}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {item.details}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Technical Skills & Competencies */}
      <section id="skills" className="py-28 px-6 md:px-12 z-10 relative bg-[#080808] border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-16 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-4 inline-block">
              Technical Arsenal
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Skills & Methodologies
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Synthesizing domain physics with modern materials informatics computational suites.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 rounded-3xl bg-[#050505] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6 text-indigo-400">
                <Binary size={22} />
                <h3 className="text-lg font-bold text-white">Materials Informatics & AI</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6 font-light">
                {skills.informatics}
              </p>
              <div className="flex flex-wrap gap-2">
                {['Python', 'PyTorch', 'PyCalphad', 'Pymatgen', 'MatGL', 'Bayesian Opt', 'Agentic AI'].map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-indigo-300">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 rounded-3xl bg-[#050505] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6 text-indigo-400">
                <Microscope size={22} />
                <h3 className="text-lg font-bold text-white">Advanced Characterization</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6 font-light">
                {skills.characterization}
              </p>
              <div className="flex flex-wrap gap-2">
                {['SEM/EDX', 'XRD Refinement', 'XRF', 'Metallography', 'Mechanical Testing', 'CSWIP 3.1'].map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-purple-300">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.19, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 rounded-3xl bg-[#050505] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6 text-indigo-400">
                <Cpu size={22} />
                <h3 className="text-lg font-bold text-white">Scientific Software & Tools</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6 font-light">
                {skills.software}
              </p>
              <div className="flex flex-wrap gap-2">
                {['MATLAB', 'Thermo-Calc', 'COMSOL', 'OriginPro', 'LAMMPS', 'Quantum ESPRESSO', 'ImageJ'].map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-blue-300">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Professional Experience (Years omitted per instructions) */}
      <section id="experience" className="py-28 px-6 md:px-12 z-10 relative border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-16 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-4 inline-block">
              Career Trajectory
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Professional Experience
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Industrial testing, process metallurgy engineering, and materials characterization governance.
            </p>
          </div>

          <div className="space-y-12">
            {experience.map((exp, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 md:p-10 rounded-3xl bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="mb-6 pb-6 border-b border-white/5">
                  <h3 className="text-2xl font-bold text-white">{exp.role}</h3>
                  <p className="text-indigo-400 text-base font-medium mt-1">{exp.company}</p>
                </div>

                <ul className="space-y-3">
                  {exp.details.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3 text-sm text-white/70 font-light leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Education (Years and GPA omitted per instructions) */}
      <section id="education" className="py-28 px-6 md:px-12 z-10 relative bg-[#080808] border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-16 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-4 inline-block">
              Academic Background
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Education & Research Degrees
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Formal qualifications in metallurgical and materials engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {education.map((edu, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 rounded-3xl bg-[#050505] border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                    <Award size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {edu.degree}
                  </h3>
                  <p className="text-indigo-400 font-medium text-sm mb-4">
                    {edu.institution}
                  </p>
                  <p className="text-white/60 text-sm font-light leading-relaxed">
                    {edu.details}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-28 px-6 md:px-12 z-10 relative border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-4 inline-block">
                Open Source & Engineering
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                Selected Projects
              </h2>
              <p className="text-white/60 text-lg font-light leading-relaxed">
                Applied AI systems, materials informatics pipelines, and thermodynamic discovery models.
              </p>
            </div>

            <a 
              href={`https://${personalInfo.github}`} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View GitHub Profile <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((proj, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {proj.title}
                    </h3>
                    {proj.link && (
                      <a 
                        href={`https://${proj.link}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-6 font-light">
                    {proj.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                  {proj.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/70">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Publications */}
      <section id="publications" className="py-28 px-6 md:px-12 z-10 relative bg-[#080808] border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-16 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-4 inline-block">
              Scholarly Output
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Publications & Conference Proceedings
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Peer-reviewed manuscripts, accepted abstracts, and scientific presentations.
            </p>
          </div>

          <div className="space-y-6">
            {publications.map((pub, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 rounded-3xl bg-[#050505] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-3">
                    <FileText size={14} />
                    <span>Publication #{idx + 1}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white leading-snug mb-2">
                    {pub.title}
                  </h3>
                  <p className="text-sm text-indigo-300 font-mono">
                    {pub.details}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Affiliations & Memberships */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col md:flex-row justify-between gap-6"
          >
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Professional Memberships</h4>
              <p className="text-sm text-white/80 font-light">{additional.memberships}</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Leadership & Community</h4>
              <p className="text-sm text-white/80 font-light">{additional.leadership}</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Scientific Blog Section (Live Firestore Posts) */}
      <BlogSection />

      {/* Consultation & Advisory Section */}
      <section id="contact-cta" className="py-24 px-6 md:px-12 z-10 relative bg-[#070707] border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-6 inline-block">
            Consultancy & Advisory
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
            Available for Consultation
          </h2>
          <p className="text-white/65 text-lg font-light leading-relaxed mb-10 max-w-2xl mx-auto">
            Providing specialized advisory services in metallurgical engineering, computational materials science, materials informatics workflows, and mineral processing optimization.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              to="/contact" 
              className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/25 hover:scale-[1.02] flex items-center gap-2"
            >
              <Calendar size={16} /> Schedule 30-Min Discovery Call
            </Link>
            <a 
              href={`mailto:${personalInfo.email}`} 
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Mail size={16} /> Direct Email Inquiry
            </a>
          </div>
        </motion.div>
      </section>

      {/* Global Footer */}
      <footer className="py-16 px-6 md:px-12 border-t border-white/10 z-10 relative bg-[#030303] text-white/50 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-bold tracking-tighter text-white">
              {personalInfo.name}
            </span>
            <p className="text-white/40">{personalInfo.title} • Lahore, Pakistan</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#interests" className="hover:text-white transition-colors">Research</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#publications" className="hover:text-white transition-colors">Publications</a>
            <Link to="/blog" className="hover:text-indigo-300 transition-colors">Scientific Blog</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/admin/login" className="text-white/30 hover:text-white/70 transition-colors flex items-center gap-1">
              <Shield size={12} /> Admin
            </Link>
          </div>

          <p className="text-white/30 text-center md:text-right">
            © {new Date().getFullYear()} Abdul Rahman. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    return useAuthStore.getState().initialize();
  }, []);

  return (
    <CmsErrorBoundary>
      <Routes>
        {/* Public Portfolio Routes */}
        <Route path="/" element={<PortfolioHome />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<AllPostsPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/blog-admin" element={<BlogAdminPage />} />

        {/* CMS Administration Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<CmsLogin />} />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsDashboard />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/posts" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsPosts />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categories" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsCategories />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/media" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsMedia />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsSettings />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <UserProfile />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" richColors theme="dark" />
      <ThemeToggle variant="floating" />
    </CmsErrorBoundary>
  );
}

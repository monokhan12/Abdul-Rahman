import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  ArrowUpRight, 
  Github, 
  Linkedin,
  MapPin,
  ExternalLink,
  BookOpen,
  Microscope,
  Cpu,
  RefreshCcw,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Contact from './Contact';
import GoogleMeetScheduler from './components/GoogleMeetScheduler';
import BlogSection from './components/BlogSection';
import AllPostsPage from './components/AllPostsPage';
import BlogPostPage from './components/BlogPostPage';
import BlogAdminPage from './components/BlogAdminPage';
import ThemeToggle from './components/ThemeToggle';
import Footer from './components/Footer';

// CMS Core Imports
import CmsLogin from './components/CmsLogin';
import CmsLayout from './components/CmsLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { CmsErrorBoundary } from './components/CmsErrorPage';
import CmsDashboard from './components/CmsDashboard';
import UserProfile from './components/UserProfile';
import CmsPosts from './components/CmsPosts';
import CmsMedia from './components/CmsMedia';
import CmsCategories from './components/CmsCategories';
import CmsSettings from './components/CmsSettings';
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

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/50 pointer-events-none z-[100] mix-blend-difference flex items-center justify-center hidden md:flex"
      animate={{
        x: mousePosition.x - 16,
        y: mousePosition.y - 16,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)'
      }}
      transition={{ type: 'tween', ease: 'backOut', duration: 0.15 }}
    >
      {isHovering && <ArrowUpRight size={12} className="text-black" />}
    </motion.div>
  );
};

const Home = () => {
    const [mounted, setMounted] = useState(false);
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
    useEffect(() => {
      setMounted(true);
    }, []);
  
    if (!mounted) return null;
  
    return (
      <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans selection:bg-[#FAFAFA] selection:text-[#050505] md:cursor-none overflow-x-hidden">
        <CustomCursor />
        
        {/* Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px]" />
        </div>
  
        {/* Navigation */}
        <nav className="fixed top-0 w-full px-6 py-8 md:px-16 flex justify-between items-center z-50 mix-blend-difference top-0 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm shadow-xl shadow-black/10 text-white">
          <Link to="/" className="text-2xl font-bold tracking-tighter">AR.</Link>
          <div className="hidden md:flex gap-8 text-xs font-semibold uppercase tracking-[0.2em] items-center">
            <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>
            <a href="#experience" className="hover:text-indigo-400 transition-colors">Experience</a>
            <a href="#projects" className="hover:text-indigo-400 transition-colors">Projects</a>
            <a href="#blog" className="hover:text-indigo-400 transition-colors">Blog</a>
            <Link to="/contact" className="px-5 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors font-bold tracking-widest">Consultancy</Link>
          </div>
        </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 z-10 pt-20">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-widest text-indigo-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Available for new projects
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] leading-[0.9] font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Abdul<br />Rahman.
            </h1>
            
            <p className="text-xl md:text-2xl font-light text-white/60 max-w-2xl mb-12 leading-relaxed">
              {personalInfo.title} blending physical metallurgy with computational materials science & AI.
            </p>
            
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 uppercase tracking-widest text-[10px]"
        >
          Scroll to explore
          <ChevronDown size={16} className="animate-bounce" />
        </motion.div>
      </section>

      {/* About & Interests Matrix */}
      <section id="about" className="py-24 px-6 md:px-16 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            <div className="lg:col-span-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-4">Focus Areas</h2>
              <h3 className="text-4xl lg:text-5xl font-black tracking-tighter mb-8 leading-tight">Research <br/>Interests</h3>
              <p className="text-lg text-white/50 leading-relaxed mb-8">
                Applying a physics-first approach to data, solving industrial challenges spanning from extraction to advanced predictive modeling.
              </p>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: <Layers size={24}/>, ...interests[0] },
                { icon: <Cpu size={24}/>, ...interests[1] },
                { icon: <Microscope size={24}/>, ...interests[2] },
                { icon: <RefreshCcw size={24}/>, ...interests[3] }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group"
                >
                  <div className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform origin-left">{item.icon}</div>
                  <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                  <p className="text-sm text-white/50 leading-relaxed">{item.details}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Corporate / Consultancy Teaser (The "Company" Section) */}
      <section id="consultancy" className="py-32 px-6 md:px-16 bg-white text-[#050505] z-10 relative">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="px-4 py-1.5 border border-black/20 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-black/60 mb-8 inline-block">
              Consultancy & Ventures
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 text-black leading-tight">
              Scale industrial operations with intelligence.
            </h2>
            <p className="text-xl md:text-2xl text-black/60 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
              Offering bespoke advisory in ISO 17025 implementation, powder metallurgy facility setup, and AI-driven process optimization pipelines for manufacturing.
            </p>
            
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-3 py-5 px-10 bg-[#050505] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 hover:bg-indigo-600 transition-all duration-300 shadow-xl"
            >
              Discuss Partnership <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Experience & Education */}
      <section id="experience" className="py-32 px-6 md:px-16 z-10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          
          {/* Experience */}
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-16 flex items-center gap-4">
               Experience <span className="text-indigo-500 text-6xl leading-[0]">.</span>
            </h2>
            <div className="space-y-16">
              {experience.map((exp, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative pl-8 border-l border-white/10"
                >
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[6.5px] top-2 blur-[2px]" />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full -left-[3.5px] top-2.5" />
                  
                  <p className="text-xs font-mono text-indigo-400 mb-2">{exp.date}</p>
                  <h4 className="text-2xl font-bold tracking-tight mb-1">{exp.role}</h4>
                  <p className="text-sm text-white/50 mb-6 uppercase tracking-wider">{exp.company}</p>
                  
                  <ul className="space-y-4 text-white/70 leading-relaxed text-sm">
                    {exp.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-white/20 mt-1">―</span>
                        <span dangerouslySetInnerHTML={{ __html: detail.replace(/([^:]+):/, '<strong class="text-white">$1:</strong>') }} />
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education & Skills */}
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-16 flex items-center gap-4">
               Education <span className="text-indigo-500 text-6xl leading-[0]">.</span>
            </h2>
            <div className="space-y-12 mb-24">
              {education.map((edu, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-xl font-bold tracking-tight mb-2 leading-snug">{edu.degree}</h4>
                  <p className="text-sm text-white/70 mb-4">{edu.institution}</p>
                  <p className="text-sm text-white/50 leading-relaxed p-4 bg-white/5 rounded-xl border border-white/5">{edu.details}</p>
                </motion.div>
              ))}
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-10 flex items-center gap-4">
               Skills <span className="text-indigo-500 text-6xl leading-[0]">.</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Informatics & AI', desc: skills.informatics },
                { title: 'Characterization', desc: skills.characterization },
                { title: 'Software', desc: skills.software }
              ].map((skill, i) => (
                <div key={i}>
                  <h5 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">{skill.title}</h5>
                  <p className="text-sm text-white/60 leading-relaxed">{skill.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Projects Bento Grid */}
      <section id="projects" className="py-32 px-6 md:px-16 bg-[#111] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:flex justify-between items-end">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-4">Portfolio</h2>
              <h3 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter">Selected Works</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group p-8 md:p-12 border border-white/5 rounded-[2rem] hover:border-indigo-500/50 hover:bg-white/[0.02] transition-all duration-500 bg-[#050505] flex flex-col justify-between min-h-[350px]"
              >
                <div>
                  <h4 className="text-3xl font-bold tracking-tight mb-4 group-hover:text-indigo-300 transition-colors">{project.title}</h4>
                  <p className="text-white/60 leading-relaxed mb-8 text-lg font-light">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-4 py-1.5 bg-white/5 border border-white/10 text-white/80 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 border-t border-white/5 pt-6 mt-4">
                  {project.link && (
                    <a href={`https://${project.link}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors">
                      View Code <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications & Community Grid */}
      <section className="py-24 px-6 md:px-16 z-10 relative bg-[#050505] border-b border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          
          <div>
            <h3 className="text-4xl font-black tracking-tighter mb-12 flex items-center gap-4">
              <BookOpen size={36} className="text-indigo-400" /> Publications
            </h3>
            <div className="space-y-6">
              {publications.map((pub, i) => (
                <div key={i} className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl hover:bg-white/[0.04] transition-colors">
                  <p className="font-bold text-lg leading-relaxed mb-4">{pub.title}</p>
                  <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold">{pub.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-4xl font-black tracking-tighter mb-12 flex items-center gap-4">
              <MapPin size={36} className="text-indigo-400" /> Community <span className="text-lg text-white/50 font-normal tracking-wide">& Leadership</span>
            </h3>
            <div className="space-y-12 pl-4 md:pl-8 border-l border-white/10">
              <div>
                 <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6">Service & Engagement</h5>
                 <p className="text-sm md:text-base text-white/80 leading-relaxed mb-6">
                   <strong className="text-white">Leadership:</strong> {additional.leadership}
                 </p>
                 <p className="text-sm md:text-base text-white/80 leading-relaxed">
                   <strong className="text-white">Memberships:</strong> {additional.memberships}
                 </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Blog Showcase Section */}
      <BlogSection />

      {/* Google Meet Scheduling Section */}
      <section id="schedule-meeting" className="py-32 px-6 md:px-16 z-10 relative bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-6 inline-block">
              Google Workspace Integrated
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
              Schedule a Consultation
            </h2>
            <p className="text-lg text-white/60 font-light leading-relaxed">
              Book an appointment with Abdul Rahman. The integration will automatically generate a Google Meet video conference link and place it on both calendars.
            </p>
          </div>

          <GoogleMeetScheduler />
        </div>
      </section>

    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" theme="dark" closeButton richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<AllPostsPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        
        {/* WordPress-Equivalent CMS Admin Panel Routes */}
        <Route path="/admin/login" element={<CmsLogin />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <CmsErrorBoundary>
              <CmsLayout>
                <CmsDashboard />
              </CmsLayout>
            </CmsErrorBoundary>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <CmsErrorBoundary>
              <CmsLayout>
                <CmsDashboard />
              </CmsLayout>
            </CmsErrorBoundary>
          </ProtectedRoute>
        } />

        <Route path="/admin/posts" element={
          <ProtectedRoute>
            <CmsErrorBoundary>
              <CmsLayout>
                <CmsPosts />
              </CmsLayout>
            </CmsErrorBoundary>
          </ProtectedRoute>
        } />

        <Route path="/admin/media" element={
          <ProtectedRoute>
            <CmsErrorBoundary>
              <CmsLayout>
                <CmsMedia />
              </CmsLayout>
            </CmsErrorBoundary>
          </ProtectedRoute>
        } />

        <Route path="/admin/categories" element={
          <ProtectedRoute>
            <CmsErrorBoundary>
              <CmsLayout>
                <CmsCategories />
              </CmsLayout>
            </CmsErrorBoundary>
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <CmsErrorBoundary>
              <CmsLayout>
                <CmsSettings />
              </CmsLayout>
            </CmsErrorBoundary>
          </ProtectedRoute>
        } />

        <Route path="/admin/profile" element={
          <ProtectedRoute>
            <CmsErrorBoundary>
              <CmsLayout>
                <UserProfile />
              </CmsLayout>
            </CmsErrorBoundary>
          </ProtectedRoute>
        } />

        {/* Existing Fallback Admin Portals */}
        <Route path="/blog/admin" element={<BlogAdminPage />} />
        <Route path="/blog-admin" element={<BlogAdminPage />} />
      </Routes>
      <Footer />
      <ThemeToggle />
    </>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Menu, Code2, Users, Trophy, Sparkles, Zap, Shield, Infinity as InfinityIcon } from "lucide-react";
import { useNavigate } from "react-router";

import cppIcon from '../images/cpp_icon.png';
import jsIcon from '../images/javascript.png';
import javaIcon from '../images/java_icon.png';
import pythonIcon from '../images/python.webp';
import Logo from '../images/Code.png';

// Sleek Nav
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-slate-950/60 backdrop-blur-glass border-b border-white/10 shadow-glass" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#hero" className="text-2xl font-extrabold text-white flex items-center gap-3 group">
          <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
            <img src={Logo} alt="CodeArena Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          </div>
          <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">CodeArena</span>
        </a>

        <div className="hidden md:flex space-x-1 border border-white/10 bg-white/5 backdrop-blur-md rounded-full px-2 py-1 shadow-clay">
          {["Features", "Challenges", "Community"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="px-5 py-2.5 bg-white text-slate-950 rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] font-extrabold text-sm"
          >
            Start Free
          </motion.button>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-6 py-6"
          >
            <div className="flex flex-col space-y-4">
              {["Features", "Challenges", "Community"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-lg font-semibold text-slate-300" onClick={() => setIsOpen(false)}>{item}</a>
              ))}
              <hr className="border-white/10 my-4" />
              <button onClick={() => navigate('/login')} className="text-lg font-semibold text-left text-slate-300">Sign In</button>
              <button onClick={() => navigate('/signup')} className="text-lg font-extrabold text-left text-cyan-400">Start Free Account</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Abstract Code Terminal (Mirrormorphic + 3D Tilt)
const AbstractTerminal = () => {
  const ref = useRef(null);

  // Mouse tracking for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-16 perspective-1000" ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.div
        style={{ rotateX, rotateY }}
        className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/20 shadow-mirror rounded-3xl overflow-hidden transform-style-3d relative transition-all duration-300 ease-out"
      >
        <div className="absolute inset-0 bg-mirror-gradient opacity-30 pointer-events-none"></div>
        <div className="flex items-center px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </div>
          <div className="mx-auto text-xs font-mono text-slate-400">codearena_engine.cpp</div>
        </div>
        <div className="p-6 font-mono text-sm leading-relaxed text-slate-300">
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">1</span>
            <span><span className="text-fuchsia-400">#include</span> <span className="text-emerald-400">&lt;iostream&gt;</span></span>
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">2</span>
            <span><span className="text-fuchsia-400">#include</span> <span className="text-emerald-400">"CodeArena.h"</span></span>
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">3</span>
            <br />
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">4</span>
            <span><span className="text-blue-400">int</span> <span className="text-yellow-200">main</span>() {'{'}</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">5</span>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;Engine arena = Engine::init();</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">6</span>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-fuchsia-400">while</span> (arena.isRunning()) {'{'}</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">7</span>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Developer dev = arena.connect();</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">8</span>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dev.<span className="text-cyan-400">levelUp</span>();</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">9</span>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;{'}'}</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">10</span>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-fuchsia-400">return</span> <span className="text-orange-400">0</span>;</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 mr-4 select-none">11</span>
            <span>{'}'}</span>
          </div>
          <div className="flex mt-2">
            <span className="text-slate-600 mr-4 select-none">12</span>
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-4 bg-cyan-400 mt-1"
            ></motion.div>
          </div>
        </div>
      </motion.div>

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/20 blur-[100px] -z-10 rounded-full"></div>
    </div>
  );
};
export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const translateYHero = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const testimonials = [
    { name: "Divyanshi Verma", quote: "CodeArena transformed how my team approaches coding challenges. The real-time feedback is invaluable.", avatar: "https://placehold.co/40x40/007bff/fff?text=DV" },
    { name: "Abhishek Sahu", quote: "The community is incredible. I've learned so much just by competing and collaborating with other developers.", avatar: "https://placehold.co/40x40/ff69b4/fff?text=AS" },
    { name: "Diya Shukla", quote: "The challenges on CodeArena keep me motivated. Every problem feels like a new opportunity to grow and sharpen my skills.", avatar: "https://placehold.co/40x40/17a2b8/fff?text=DS" }
  ];

  const languages = [
    { name: "JavaScript", icon: <img src={jsIcon} alt="JavaScript" className="w-16 h-16 object-contain" /> },
    { name: "Python", icon: <img src={pythonIcon} alt="Python" className="w-16 h-16 object-contain" /> },
    { name: "Java", icon: <img src={javaIcon} alt="Java" className="w-16 h-16 object-contain" /> },
    { name: "C++", icon: <img src={cppIcon} alt="C++" className="w-16 h-16 object-contain" /> },
  ];

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return (
    <div className="bg-slate-950 text-white font-sans min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300" style={{ background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6,182,212,0.1), transparent 40%)` }} />
      <Navbar />

      <main className="relative z-10 pt-32 pb-20">
        <motion.section id="hero" style={{ y: translateYHero, opacity: opacityHero }} className="container mx-auto px-6 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1.1] max-w-5xl">Master code. <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Outperform everyone.</span></h1>
          <AbstractTerminal />
        </motion.section>

        {/* Supported Languages Section */}
        <section className="py-20 px-4 text-center mt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Languages You Can Master</h2>
            <p className="text-lg text-slate-400">Practice and perfect your skills in a variety of popular programming languages.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {languages.map((lang, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center p-6 bg-slate-900/50 rounded-2xl border border-white/10 shadow-glass transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-glass-hover">
                {lang.icon}
                <p className="mt-4 text-white font-semibold">{lang.name}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-32 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Why CodeArena?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to level up your engineering skills in one hyper-optimized platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Real-time Collab", desc: "Pair program instantly.", icon: <Users size={32} /> },
              { title: "Global Leaderboards", desc: "Rank up.", icon: <Trophy size={32} /> },
              { title: "Enterprise Grade", desc: "Secure execution.", icon: <Shield size={32} /> }
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }} className="group relative bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-clay hover:shadow-glass-hover transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-cyan-400 mb-6 shadow-inner_clay group-hover:text-white transition-colors relative z-10">{f.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-white relative z-10">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed relative z-10">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-slate-950 px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-lg text-slate-400">Join thousands of developers who are already leveling up their skills with CodeArena.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="p-6 bg-slate-900/50 rounded-2xl border border-white/10 shadow-glass">
                <p className="text-slate-300 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="rounded-full w-10 h-10 border-2 border-white/20" />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">CodeArena User</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="container mx-auto px-6 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="w-full max-w-5xl mx-auto rounded-[3rem] p-1 overflow-hidden relative shadow-[0_0_100px_rgba(6,182,212,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500 animate-[spin_4s_linear_infinite] opacity-50 blur-lg"></div>
            <div className="relative bg-slate-950 rounded-[2.8rem] p-12 md:p-20 text-center border border-white/10 z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to dominate?</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">Join 10,000+ developers actively competing and collaborating right now.</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/signup')} className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl rounded-2xl shadow-mirror hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all inline-flex items-center gap-3">
                Create Account <ArrowRight size={24} />
              </motion.button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Sleek Footer */}
      <footer className="border-t border-white/10 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Code2 className="text-cyan-400 group-hover:rotate-180 transition-transform duration-500" size={24} />
            <span className="text-xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">CodeArena</span>
          </div>
          <p className="text-slate-500 font-medium">© 2026 CodeArena. Built for champions.</p>
        </div>
      </footer>
    </div>
  );
}
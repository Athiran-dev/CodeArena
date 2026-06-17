import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home, RefreshCw, Zap, Video, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router';
import { motion } from 'framer-motion';

function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      gradient: 'from-emerald-400 to-cyan-500',
      shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      gradient: 'from-rose-400 to-red-500',
      shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Manage Videos',
      description: 'Upload and delete problem solution videos',
      icon: Video,
      gradient: 'from-blue-400 to-indigo-500',
      shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      route: '/admin/video'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans relative overflow-hidden flex flex-col">
      {/* Deep Mesh Background */}
      <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-20 mix-blend-screen pointer-events-none"></div>

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 pt-24 pb-20 relative z-10 flex-1">
        {/* Back button */}
        <NavLink to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group font-medium">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Arena
        </NavLink>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-bold mb-6 shadow-glass">
            <Zap size={16} /> Admin Command Center
          </div>
          <h1 className="text-5xl sm:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-6 tracking-tight">
            System Overseer
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">
            Manage the arena, create new challenges, and control the flow of knowledge.
          </p>
        </div>

        {/* Admin Options Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto perspective-1000"
        >
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <motion.div
                variants={itemVariants}
                key={option.id}
                whileHover={{ rotateX: 5, rotateY: -5, scale: 1.05 }}
                className="group relative bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-clay flex flex-col items-center text-center transform-style-3d cursor-pointer h-full"
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
                
                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${option.gradient} ${option.shadow} flex items-center justify-center text-white mb-6 transform group-hover:translate-z-20 transition-transform duration-300`}>
                  <IconComponent size={40} />
                </div>
                
                {/* Title */}
                <h2 className="text-2xl font-black text-white mb-3 tracking-tight transform group-hover:translate-z-10 transition-transform duration-300">
                  {option.title}
                </h2>
                
                {/* Description */}
                <p className="text-slate-400 font-medium mb-8 flex-1 transform group-hover:translate-z-10 transition-transform duration-300">
                  {option.description}
                </p>
                
                {/* Action Button */}
                <NavLink 
                  to={option.route}
                  className={`w-full py-3 rounded-xl bg-gradient-to-r ${option.gradient} text-white font-bold shadow-glass transform hover:scale-105 transition-all focus:outline-none flex justify-center items-center`}
                >
                  Enter Console
                </NavLink>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export default Admin;
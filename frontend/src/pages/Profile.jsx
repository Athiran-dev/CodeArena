import React, { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
import { User, Award, CheckCircle, Clock, Code, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 5;

  const fetchProfile = async (currentPage) => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/user/profile?page=${currentPage}&limit=${limit}`);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(page);
  }, [page]);

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950 text-white">
        <h1 className="text-2xl font-bold text-red-400">Failed to load profile</h1>
      </div>
    );
  }

  const { user, submissions, activityData, totalPages, currentPage } = profile;
  const solvedCount = user.problemSolved ? user.problemSolved.length : 0;

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-300 font-mono text-xs mb-1">{label}</p>
          <p className="text-emerald-400 font-bold">
            {payload[0].value} <span className="text-slate-500 font-normal">solved</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans relative overflow-hidden pb-20 pt-24">
      <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-20 mix-blend-screen pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-clay mb-8 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-1 shadow-glass shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-full flex justify-center items-center overflow-hidden">
              {user.photo && user.photo !== "This is default photo" ? (
                <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-indigo-400" />
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-white">{user.firstName} {user.lastName}</h1>
            <p className="text-indigo-400 font-medium mt-1">{user.emailId}</p>
            
            <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5">
                <Award className="text-amber-400" size={20} />
                <span className="text-slate-300 font-medium">Rank: <strong className="text-white">Novice</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                <CheckCircle className="text-emerald-400" size={20} />
                <span className="text-emerald-400 font-bold">{solvedCount} Solved</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-8 lg:col-span-1">
            {/* Stats Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 shadow-clay"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock size={20} className="text-indigo-400" /> General Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-slate-400">Problems Solved</span>
                  <span className="text-white font-bold">{solvedCount}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            
            {/* Activity Graph */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 shadow-clay"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-emerald-400" /> 30-Day Activity
              </h2>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                      }}
                      minTickGap={20}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="solved" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorSolved)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Submissions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 shadow-clay relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code size={20} className="text-cyan-400" /> Recent Submissions
                </h2>
              </div>
              
              <div className={`space-y-3 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {submissions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No submissions found on this page.</p>
                ) : (
                  submissions.map((sub, idx) => (
                    <div key={idx} className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-white/5 transition-colors group">
                      <div>
                        <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {sub.problemId?.title || 'Unknown Problem'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{new Date(sub.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                          {sub.language}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          sub.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                          sub.status === 'wrong_answer' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="text-xs font-mono text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;

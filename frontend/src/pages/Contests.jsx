import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
import { Swords, Calendar, Clock, ArrowRight } from 'lucide-react';

const Contests = () => {
  const [contests, setContests] = useState({ active: [], upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data } = await axiosClient.get('/contest');
        setContests(data);
      } catch (err) {
        console.error('Failed to load contests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContestCard = (contest, status) => {
    const isLive = status === 'active';
    const isUpcoming = status === 'upcoming';
    
    return (
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 shadow-clay relative group overflow-hidden"
        key={contest._id}
      >
        {isLive && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full mix-blend-screen -z-10 group-hover:bg-emerald-500/20 transition-colors"></div>
        )}
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{contest.title}</h3>
            <p className="text-sm text-slate-400 line-clamp-2">{contest.description}</p>
          </div>
          {isLive && (
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-glass">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
            </span>
          )}
          {isUpcoming && (
            <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-500/20">
              UPCOMING
            </span>
          )}
        </div>
        
        <div className="space-y-2 mt-6 mb-8">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Calendar size={16} className={isLive ? "text-emerald-400" : "text-indigo-400"} />
            <span>{new Date(contest.startTime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Clock size={16} className={isLive ? "text-emerald-400" : "text-indigo-400"} />
            <span>
              {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(contest.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <NavLink 
          to={isUpcoming ? "#" : `/contest/${contest._id}`}
          className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${
            isLive 
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glass' 
              : isUpcoming 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30'
          }`}
          onClick={(e) => { if(isUpcoming) e.preventDefault(); }}
        >
          {isLive ? 'Enter Arena' : isUpcoming ? 'Starts Soon' : 'View Leaderboard'} <ArrowRight size={18} />
        </NavLink>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans relative overflow-hidden pb-20 pt-24">
      <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-20 mix-blend-screen pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-6 shadow-glass">
            <Swords size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">CodeArena Contests</h1>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">Compete with programmers worldwide, climb the leaderboards, and prove your coding skills in real-time arenas.</p>
        </div>

        {contests.active.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
              Live Contests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.active.map(c => renderContestCard(c, 'active'))}
            </div>
          </div>
        )}

        {contests.upcoming.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              Upcoming Contests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.upcoming.map(c => renderContestCard(c, 'upcoming'))}
            </div>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            Past Contests
          </h2>
          {contests.past.length === 0 ? (
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center text-slate-500 font-medium">
              No past contests found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.past.map(c => renderContestCard(c, 'past'))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contests;

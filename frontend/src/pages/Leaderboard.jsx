import React, { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await axiosClient.get('/user/leaderboard');
        setLeaders(data);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const getRankStyle = (index) => {
    if (index === 0) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (index === 1) return 'text-slate-300 bg-slate-500/10 border-slate-400/30';
    if (index === 2) return 'text-amber-600 bg-amber-700/10 border-amber-700/30';
    return 'text-slate-500 bg-slate-900 border-white/5';
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="text-yellow-400" size={24} />;
    if (index === 1) return <Medal className="text-slate-300" size={24} />;
    if (index === 2) return <Medal className="text-amber-600" size={24} />;
    return <span className="font-bold text-lg w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans relative overflow-hidden pb-20 pt-24">
      <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-20 mix-blend-screen pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mb-6 shadow-glass">
            <Trophy size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Global Leaderboard</h1>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">Top programmers ranked by the number of problems solved. Climb the ranks to become the ultimate coding master.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-clay overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider font-bold">
                  <th className="px-8 py-5 text-center w-24">Rank</th>
                  <th className="px-6 py-5">Coder</th>
                  <th className="px-6 py-5 text-right">Problems Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaders.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No data available yet.
                    </td>
                  </tr>
                ) : (
                  leaders.map((leader, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={leader._id} 
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className={`mx-auto w-10 h-10 rounded-xl border flex items-center justify-center ${getRankStyle(index)}`}>
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                            {leader.photo && leader.photo !== "This is default photo" ? (
                              <img src={leader.photo} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold">
                                {leader.firstName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors">
                              {leader.firstName} {leader.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5">
                          <Star className="text-emerald-400" size={16} />
                          <span className="text-emerald-400 font-bold text-lg">{leader.solvedCount}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;

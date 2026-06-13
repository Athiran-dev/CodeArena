import React, { useEffect, useState, useRef } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Send, Users, Swords, ChevronLeft, MessageSquare, ShieldAlert } from 'lucide-react';
import { useSelector } from 'react-redux';

const ContestArena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const initArena = async () => {
      try {
        // Fetch contest details
        const { data: contestData } = await axiosClient.get(`/contest/${id}`);
        setContest(contestData);
        
        // Fetch leaderboard
        const { data: boardData } = await axiosClient.get(`/contest/${id}/leaderboard`);
        setLeaderboard(boardData);
        
        // Join contest on backend
        await axiosClient.post(`/contest/${id}/join`);
        
        // Initialize socket
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);
        
        newSocket.emit('join-contest', id);
        
        newSocket.on('receive-message', (data) => {
          setChatMessages(prev => [...prev, data]);
        });
        
      } catch (err) {
        console.error('Arena initialization failed', err);
      } finally {
        setLoading(false);
      }
    };
    
    initArena();
    
    return () => {
      if (socket) socket.disconnect();
    };
  }, [id]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !user) return;
    
    socket.emit('send-message', {
      contestId: id,
      message: messageInput,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        photo: user.photo
      }
    });
    
    setMessageInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-white gap-4">
        <ShieldAlert size={48} className="text-red-500" />
        <h1 className="text-2xl font-bold">Contest not found or inaccessible.</h1>
        <button onClick={() => navigate('/contests')} className="btn btn-outline text-indigo-400">Go Back</button>
      </div>
    );
  }

  const isPast = new Date() > new Date(contest.endTime);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans relative flex flex-col pt-16">
      <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-20 mix-blend-screen pointer-events-none"></div>
      
      {/* Top Navbar specifically for Arena */}
      <div className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/contests')} className="text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="h-6 w-px bg-white/10"></div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Swords size={20} className="text-emerald-400" />
            {contest.title}
          </h1>
        </div>
        <div>
          {isPast ? (
            <span className="bg-red-500/10 text-red-400 font-bold px-3 py-1 rounded-full text-sm border border-red-500/20">Contest Ended</span>
          ) : (
            <span className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full text-sm border border-emerald-500/20 shadow-glass flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Now
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Side: Problems & Leaderboard */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-clay"
            >
              <h2 className="text-xl font-bold text-white mb-2">Description</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{contest.description}</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Problems List */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-clay"
              >
                <h2 className="text-xl font-bold text-white mb-4">Problems</h2>
                <div className="space-y-3">
                  {contest.problems.map((problem, index) => (
                    <NavLink
                      to={`/problem/${problem._id}`}
                      key={problem._id}
                      className="block bg-slate-950/50 p-4 rounded-xl border border-white/5 hover:bg-white/5 hover:border-indigo-500/30 transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-slate-500 font-mono text-sm mr-3">{index + 1}.</span>
                          <span className="text-white font-bold group-hover:text-indigo-400 transition-colors">{problem.title}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                          problem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                          problem.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </motion.div>

              {/* Leaderboard Snapshot */}
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-clay"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                  Leaderboard
                  <Users size={20} className="text-indigo-400" />
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-500 border-b border-white/5">
                        <th className="pb-2 font-medium">Rank</th>
                        <th className="pb-2 font-medium">Coder</th>
                        <th className="pb-2 font-medium text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="py-4 text-center text-slate-500">No submissions yet</td>
                        </tr>
                      ) : (
                        leaderboard.slice(0, 10).map((l, idx) => (
                          <tr key={l.user._id}>
                            <td className="py-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-3 font-bold text-white">{l.user.firstName} {l.user.lastName}</td>
                            <td className="py-3 text-right text-emerald-400 font-mono font-bold">{l.score}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Right Side: Chat */}
        <div className="w-80 bg-slate-900/95 border-l border-white/5 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <MessageSquare size={18} className="text-cyan-400" />
            <h3 className="font-bold text-white">Live Arena Chat</h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {chatMessages.length === 0 ? (
              <p className="text-center text-slate-500 text-sm mt-10">No messages yet. Be the first to say hi!</p>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0 overflow-hidden border border-white/10">
                    {msg.user.photo && msg.user.photo !== "This is default photo" ? (
                      <img src={msg.user.photo} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-bold text-xs">
                        {msg.user.firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-sm text-white">{msg.user.firstName}</span>
                      <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="bg-slate-800/50 text-slate-300 text-sm p-3 rounded-2xl rounded-tl-none border border-white/5 inline-block">
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-slate-950/50 border-t border-white/5">
            <form onSubmit={sendMessage} className="relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={user ? "Type a message..." : "Login to chat..."}
                disabled={!user}
                className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-500"
              />
              <button 
                type="submit" 
                disabled={!user || !messageInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ContestArena;

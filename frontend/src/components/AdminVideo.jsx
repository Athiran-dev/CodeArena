import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient'
import { NavLink, useNavigate } from 'react-router';
import { ArrowLeft, Video, Trash2, UploadCloud, Film } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminVideo = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data.problems || []);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await axiosClient.delete(`/video/delete/${id}`);
      alert('Video deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete video');
      console.log(err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'from-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium':
        return 'from-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'from-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'from-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans relative overflow-hidden pb-20">
      <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-20 mix-blend-screen pointer-events-none"></div>

      <div className="container mx-auto px-6 pt-12 max-w-6xl relative z-10">
        <button 
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group font-medium"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-4 shadow-glass">
              <Film size={16} /> Media Center
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Video Solutions</h1>
            <p className="text-slate-400 mt-2">Manage video walkthroughs for algorithmic challenges.</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 font-medium">
            <Trash2 size={20} /> {typeof error === 'string' ? error : 'An error occurred'}
          </div>
        )}

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-clay overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {problems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No problems available to manage videos.
                    </td>
                  </tr>
                ) : (
                  problems.map((problem, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={problem._id} 
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-500 font-mono text-sm">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {problem.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${getDifficultyColor(problem.difficulty)} border`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {problem.tags}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <NavLink 
                            to={`/admin/upload/${problem._id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500 rounded-xl transition-all shadow-glass"
                          >
                            <UploadCloud size={16} /> Upload
                          </NavLink>
                          <button 
                            onClick={() => handleDelete(problem._id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl transition-all shadow-glass"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVideo;
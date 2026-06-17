import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient'
import { ArrowLeft, Trash2, Search, Filter, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

const AdminDelete = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    search: ''
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    const filtered = problems.filter(problem => {
      const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
      const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
      const searchMatch = problem.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         problem.tags.toLowerCase().includes(filters.search.toLowerCase());
      
      return difficultyMatch && tagMatch && searchMatch;
    });
    setFilteredProblems(filtered);
  }, [problems, filters]);

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
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems(problems.filter(problem => problem._id !== id));
    } catch (err) {
      setError('Failed to delete problem');
      console.error(err);
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
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold mb-4 shadow-glass">
              <ShieldAlert size={16} /> Danger Zone
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Manage Problems</h1>
            <p className="text-slate-400 mt-2">Permanently delete problems from the platform.</p>
          </div>
          <div className="text-sm font-bold text-slate-500 bg-slate-900/50 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
            <span className="text-white">{filteredProblems.length}</span> problems showing
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 font-medium">
            <ShieldAlert size={20} /> {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 mb-8 border border-white/5 shadow-clay flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by title or tags..."
              className="w-full pl-12 pr-4 py-3 bg-slate-950/50 backdrop-blur-md border border-slate-700 shadow-inner text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium placeholder-slate-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <div className="relative min-w-[150px]">
            <select 
              className="w-full appearance-none px-4 py-3 bg-slate-950/50 backdrop-blur-md border border-slate-700 shadow-inner text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium cursor-pointer"
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative min-w-[150px]">
            <select 
              className="w-full appearance-none px-4 py-3 bg-slate-950/50 backdrop-blur-md border border-slate-700 shadow-inner text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium cursor-pointer"
              value={filters.tag}
              onChange={(e) => setFilters({...filters, tag: e.target.value})}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="string">String</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
            </select>
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <button 
            className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors font-bold"
            onClick={() => setFilters({ difficulty: 'all', tag: 'all', search: '' })}
          >
            Clear Filters
          </button>
        </div>

        {/* Problems Table */}
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
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No problems found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={problem._id} 
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-500 font-mono text-sm">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-white group-hover:text-cyan-400 transition-colors">
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
                        <button 
                          onClick={() => handleDelete(problem._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl transition-all shadow-glass"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
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

export default AdminDelete;
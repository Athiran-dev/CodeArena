import { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser, updateUser } from '../authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, TrendingUp, Clock, Trophy, Star, Code2, Menu, Filter } from 'lucide-react';
import Logo from '../images/Code.png';

export default function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
    search: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [userChecked, setUserChecked] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const problemsPerPage = 6;
  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check user role when component mounts or user changes
  useEffect(() => {
    if (user && user.role) {
      setIsAdmin(user.role === 'admin');
      setUserChecked(true);
    } else if (user && !user.role) {
      fetchCompleteUserData();
    } else {
      setIsAdmin(false);
      setUserChecked(true);
    }
  }, [user]);

  const fetchCompleteUserData = async () => {
    try {
      const { data } = await axiosClient.get('/user/check', { withCredentials: true });
      if (data.user) {
        dispatch(updateUser(data.user));
      }
    } catch (error) {
      console.error('Error fetching complete user data:', error);
    } finally {
      setUserChecked(true);
    }
  };

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      // Pass pagination and filter params to the backend
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: problemsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.difficulty !== 'all' && { difficulty: filters.difficulty }),
        ...(filters.tag !== 'all' && { tag: filters.tag })
      }).toString();
      
      const { data } = await axiosClient.get(`/problem/getAllProblem?${queryParams}`);
      
      // Filter by solved status locally if required, since "status" is user-specific
      let displayProblems = data.problems || [];
      if (filters.status !== 'all' && solvedProblems.length > 0) {
        displayProblems = displayProblems.filter(problem => {
          const isSolved = solvedProblems.some(sp => sp._id === problem._id);
          return filters.status === 'solved' ? isSolved : !isSolved;
        });
      }
      
      setProblems(displayProblems);
      setTotalPages(data.totalPages || 1);
      
    } catch (error) {
      console.error('Error fetching problems:', error);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters.search, filters.difficulty, filters.tag, filters.status, solvedProblems]);

  useEffect(() => {
    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);

        // Calculate stats
        const easySolved = data.filter(p => p.difficulty === 'easy').length;
        const mediumSolved = data.filter(p => p.difficulty === 'medium').length;
        const hardSolved = data.filter(p => p.difficulty === 'hard').length;

        setStats({
          totalSolved: data.length,
          easySolved,
          mediumSolved,
          hardSolved
        });
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    if (user) fetchSolvedProblems();
  }, [user]);

  // Fetch problems whenever filters or page changes
  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // Reset page to 1 when filters change (except when simply switching pages)
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.difficulty, filters.tag, filters.status]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    setIsAdmin(false);
    setUserChecked(false);
    setIsDropdownOpen(false);
  };

  const isProblemSolved = (problemId) => {
    return solvedProblems.some(sp => sp._id === problemId);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };


  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.difficulty, filters.tag, filters.status, filters.search]);

  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'from-green-500/20 to-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30';
      default: return 'from-gray-500/20 to-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Animation variants
  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  if (!userChecked || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
          <Code2 className="w-16 h-16 text-cyan-400 animate-bounce mx-auto relative z-10" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-xl font-bold tracking-widest text-slate-300 relative z-10 uppercase"
          >
            Loading Arena...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden relative">

      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 bg-mesh-dark animate-mesh opacity-30 mix-blend-screen pointer-events-none"></div>

      {/* Floating Ambient Orbs */}
      <motion.div
        className="fixed top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-fuchsia-600/10 blur-[150px] pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* IDE Toolbar Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/40 backdrop-blur-xl shadow-glass flex justify-between items-center py-4">
        <div className="flex items-center px-4 gap-8">
          <NavLink to="/" className="flex items-center gap-2 group">
            <img src={Logo} alt="CodeArena Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            <span className="font-mono font-bold text-slate-300 group-hover:text-white transition-colors tracking-widest text-sm">&gt;_ CODEARENA</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-6 font-mono text-sm">
            <NavLink to="/contests" className={({isActive}) => `transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
              ./contests
            </NavLink>
            <NavLink to="/leaderboard" className={({isActive}) => `transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
              ./leaderboard
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => `transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
              ./profile
            </NavLink>
          </div>
        </div>

        <div className="flex items-center px-4 space-x-2">
          {/* User Command Center */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all rounded font-mono text-xs text-slate-300"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {user?.firstName?.toLowerCase() || 'guest'}@arena
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-10 right-0 z-50 w-56 p-1 shadow-2xl bg-slate-900 border border-slate-700 rounded-lg font-mono text-xs"
                >
                  <div className="p-3 border-b border-slate-800">
                    <div className="text-slate-500">status: <span className="text-emerald-500">online</span></div>
                    <div className="text-white truncate mt-1">~/{user?.firstName?.toLowerCase()}</div>
                  </div>
                  <div className="p-1 space-y-1">
                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="text-fuchsia-500">./admin</span>
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
                    >
                      <span className="text-red-500">sudo exit</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-36 pb-20 px-6 max-w-7xl mx-auto relative z-10">

        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animationVariants}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6">
            <Trophy size={16} /> Choose your battle
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-6 tracking-tight">
            Algorithm Arena
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">
            Solve complex problems, rank up on the global leaderboard, and prove your engineering prowess.
          </p>
        </motion.div>

        {/* Claymorphic User Stats */}
        {user && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={animationVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {[
              { label: "Total Solved", value: stats.totalSolved, icon: <Trophy className="text-blue-400" />, from: "from-blue-600/20", to: "to-cyan-600/20" },
              { label: "Easy", value: stats.easySolved, icon: <TrendingUp className="text-emerald-400" />, from: "from-emerald-600/20", to: "to-green-600/20" },
              { label: "Medium", value: stats.mediumSolved, icon: <Clock className="text-yellow-400" />, from: "from-yellow-600/20", to: "to-orange-600/20" },
              { label: "Hard", value: stats.hardSolved, icon: <Star className="text-red-400" />, from: "from-red-600/20", to: "to-rose-600/20" }
            ].map((stat, i) => (
              <div key={i} className={`relative bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 shadow-clay flex items-center gap-4 overflow-hidden group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.from} ${stat.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative z-10 p-4 bg-slate-950 rounded-2xl shadow-inner_clay">
                  {stat.icon}
                </div>
                <div className="relative z-10">
                  <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                  <div className="text-sm font-bold text-slate-500 uppercase">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Floating Glass Filter Bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animationVariants}
          className="sticky top-24 z-40 bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-4 mb-12 shadow-mirror border border-white/10"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search challenges..."
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 backdrop-blur-md border border-slate-700 shadow-inner text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium placeholder-slate-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {[
                { key: 'status', options: [{ val: 'all', label: 'All Status' }, { val: 'solved', label: 'Solved' }, { val: 'unsolved', label: 'Unsolved' }] },
                { key: 'difficulty', options: [{ val: 'all', label: 'All Diff' }, { val: 'easy', label: 'Easy' }, { val: 'medium', label: 'Medium' }, { val: 'hard', label: 'Hard' }] },
                { key: 'tag', options: [{ val: 'all', label: 'All Tags' }, { val: 'array', label: 'Array' }, { val: 'linkedList', label: 'Linked List' }, { val: 'graph', label: 'Graph' }, { val: 'dp', label: 'DP' }] }
              ].map((filterGrp) => (
                <div key={filterGrp.key} className="relative flex-1 sm:flex-none">
                  <select
                    className="w-full appearance-none px-6 py-4 bg-slate-800/50 backdrop-blur-md border border-slate-700 shadow-inner text-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium font-sans cursor-pointer hover:bg-slate-700/50"
                    value={filters[filterGrp.key]}
                    onChange={(e) => setFilters({ ...filters, [filterGrp.key]: e.target.value })}
                  >
                    {filterGrp.options.map(opt => <option key={opt.val} value={opt.val} className="bg-slate-800 text-white">{opt.label}</option>)}
                  </select>
                  <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 3D Problem Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16 perspective-1000">
          {problems.map((problem, index) => {
            const solved = isProblemSolved(problem._id);
            return (
              <motion.div
                key={problem._id}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                custom={index}
                whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-clay flex flex-col h-full transform-style-3d"
              >
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"></div>

                <div className="flex-1 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${getDifficultyBadgeColor(problem.difficulty)} border`}>
                      {problem.difficulty}
                    </div>
                    {solved && (
                      <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl shadow-inner_clay">
                        <Trophy size={16} />
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-white mb-4 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">
                    {problem.title}
                  </h3>

                  <div className="inline-flex px-3 py-1 bg-slate-950 rounded-xl text-xs font-bold text-slate-400 shadow-clay-inner border border-white/5 mb-8">
                    {problem.tags || 'Algorithm'}
                  </div>
                </div>

                <NavLink
                  to={`/problem/${problem._id}`}
                  className="relative z-10 w-full mt-auto text-center py-4 font-black rounded-2xl bg-slate-950 text-white border border-white/10 shadow-glass hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:border-transparent transition-all duration-300"
                >
                  {solved ? 'Optimize Code' : 'Solve Challenge'}
                </NavLink>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {problems.length === 0 && !loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={animationVariants}
            className="text-center py-32 bg-slate-900/40 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-clay"
          >
            <div className="w-24 h-24 bg-slate-950 rounded-3xl mx-auto flex items-center justify-center shadow-inner_clay mb-6">
              <Search size={40} className="text-slate-600" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4">No challenges found</h3>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">We couldn't find any challenges matching your precise criteria.</p>
            <button
              onClick={() => setFilters({ difficulty: 'all', tag: 'all', status: 'all', search: '' })}
              className="px-8 py-4 font-black rounded-2xl bg-white text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={animationVariants}
            className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-8 p-6 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-clay"
          >
            <div className="text-slate-400 font-medium">
              Showing <span className="text-white font-bold">{filteredProblems.length}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glass"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black transition-all shadow-glass ${currentPage === page
                        ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border-transparent'
                        : 'bg-slate-950 border border-white/10 text-slate-400 hover:text-white'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glass"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
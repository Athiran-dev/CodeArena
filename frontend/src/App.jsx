import {Routes, Route ,Navigate} from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import LandingPage from "./pages/LandingPage"; // Add this import
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage"
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo"
import AdminDelete from "./components/AdminDelete"
import AdminUpload from "./components/AdminUpload"

// New Pages
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Contests from "./pages/Contests";
import ContestArena from "./pages/ContestArena";

function App(){
  
  const dispatch = useDispatch();
  const {isAuthenticated,user,loading} = useSelector((state)=>state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return(
  <>
    <Routes>
      {/* Landing page for non-authenticated users, Homepage for authenticated users */}
      <Route path="/" element={isAuthenticated ? <Homepage /> : <LandingPage />}></Route>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />}></Route>
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />}></Route>
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
      
      {/* New Feature Routes */}
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/contests" element={<Contests />} />
      <Route path="/contest/:id" element={isAuthenticated ? <ContestArena /> : <Navigate to="/login" />} />
    </Routes>
  </>
  )
}

export default App;
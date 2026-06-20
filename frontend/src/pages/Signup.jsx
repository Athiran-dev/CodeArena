import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Code2, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../authSlice";
import { useNavigate, NavLink } from "react-router";
import Logo from "../images/Code.png";

// Schema (lastName removed)
const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum 3 characters required"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Animations
const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Strong password check
  const checkPasswordStrength = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  };

  const onSubmit = async (data) => {
    if (!checkPasswordStrength(data.password)) {
      setPasswordError(
        "⚠️ Password is weak. Use uppercase, lowercase, number & special character."
      );
      return;
    }
    setPasswordError("");

    try {
      await dispatch(registerUser(data)).unwrap();
      navigate("/"); // redirect after success
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden font-sans">
      {/* Deep Mesh Background */}
      <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-40 mix-blend-screen"></div>

      {/* Floating Orbs (Mirrormorphism backlights) */}
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-600/20 blur-[120px] mix-blend-screen pointer-events-none"
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen pointer-events-none"
        animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20"
      >
        <ArrowLeft size={20} /> Back to Arena
      </button>

      {/* Signup Modal - Extreme Glass/Mirror/Clay combo */}
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: -10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-md perspective-1000"
      >
        <div className="bg-slate-900/40 backdrop-blur-2xl shadow-mirror rounded-[2.5rem] border border-white/10 p-10 overflow-hidden relative">
          
          {/* Top gloss reflection */}
          <div className="absolute inset-0 bg-mirror-gradient opacity-30 pointer-events-none rounded-[2.5rem]"></div>
          
          <div className="text-center mb-10 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center justify-center mb-6"
            >
              <img src={Logo} alt="CodeArena Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </motion.div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              Join CodeArena
            </h2>
            <p className="mt-3 text-slate-400 font-medium">
              Create an account to unlock your potential.
            </p>
          </div>

          {/* Form */}
          <motion.form
            variants={formVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 relative z-10"
          >
            {/* First Name */}
            <motion.div variants={inputVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <input
                id="firstName"
                type="text"
                placeholder="Developer Alias"
                className={`w-full bg-slate-950/50 backdrop-blur-md text-white border-none shadow-clay-inner rounded-2xl py-4 pl-12 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  errors.firstName ? "ring-2 ring-red-500/50" : ""
                }`}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="mt-2 text-xs font-bold text-red-400 pl-2">
                  {errors.firstName.message}
                </p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div variants={inputVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <input
                id="emailId"
                type="email"
                placeholder="Developer Email"
                className={`w-full bg-slate-950/50 backdrop-blur-md text-white border-none shadow-clay-inner rounded-2xl py-4 pl-12 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  errors.emailId ? "ring-2 ring-red-500/50" : ""
                }`}
                {...register("emailId")}
              />
              {errors.emailId && (
                <p className="mt-2 text-xs font-bold text-red-400 pl-2">
                  {errors.emailId.message}
                </p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={inputVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Secure Password"
                className={`w-full bg-slate-950/50 backdrop-blur-md text-white border-none shadow-clay-inner rounded-2xl py-4 pl-12 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  errors.password || passwordError ? "ring-2 ring-red-500/50" : ""
                }`}
                {...register("password")}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="mt-2 text-xs font-bold text-red-400 pl-2">
                  {errors.password.message}
                </p>
              )}
              {passwordError && (
                <p className="mt-2 text-xs font-bold text-red-400 pl-2">
                  {passwordError}
                </p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.button
              variants={inputVariants}
              whileHover={{
                scale: 1.02,
                boxShadow: "0px 0px 30px rgba(16,185,129,0.5)",
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black text-lg rounded-2xl py-4 shadow-glass transition-all duration-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Enter the Arena"}
            </motion.button>
          </motion.form>

          {/* Login redirect */}
          <div className="text-center mt-8 relative z-10 border-t border-white/10 pt-6">
            <p className="text-sm font-medium text-slate-400">
              Already a champion?{" "}
              <NavLink to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors ml-1">
                Sign In
              </NavLink>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
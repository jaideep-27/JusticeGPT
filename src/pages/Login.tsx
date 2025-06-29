import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  MapPin,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Shield,
  Globe,
  Zap,
  Award,
  FileText,
  AlertTriangle,
  Info,
  Key
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    jurisdiction: 'United States',
  });
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const jurisdictions = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
    'Germany', 'France', 'Brazil', 'Nigeria', 'South Africa'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        await register(formData.name, formData.email, formData.password, formData.jurisdiction);
        if (isSupabaseConfigured()) {
          // For Supabase, don't navigate immediately - wait for email confirmation
          setIsLogin(true);
          setFormData({ ...formData, password: '' });
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      ...formData,
      email: 'demo@justicegpt.ai',
      password: 'demo123'
    });
    setIsLogin(true);
  };

  const benefits = [
    {
      icon: Sparkles,
      title: 'AI-powered legal assistance in 6+ languages',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: FileText,
      title: 'Advanced document analysis and generation',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      icon: Globe,
      title: 'Jurisdiction-specific legal guidance',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Zap,
      title: 'Voice and video consultations',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Shield,
      title: 'Secure document storage and notarization',
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      icon: Award,
      title: 'Real-time legal updates and alerts',
      gradient: 'from-yellow-500 to-orange-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 pt-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-float float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* System Status Banner */}
        {!isSupabaseConfigured() && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">Development Mode Active</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Running in local development mode. User accounts persist between sessions.
                </p>
              </div>
              <button
                onClick={fillDemoCredentials}
                className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Key className="w-4 h-4" />
                <span>Use Demo Account</span>
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-8rem)]"
        >
          {/* Left Side - Benefits */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="space-y-6">
              <motion.div 
                variants={itemVariants}
                className="flex items-center space-x-3"
              >
                <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Scale className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <span className="text-3xl font-display font-bold text-gradient bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    JusticeGPT
                  </span>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    AI Legal Assistant Platform
                  </div>
                </div>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-5xl font-display font-bold leading-tight"
              >
                <span className="text-gradient bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Your AI Legal Assistant
                </span>
                <br />
                <span className="text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Awaits
                </span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                Get instant legal guidance, document analysis, and multilingual support from our advanced AI platform. 
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Justice made accessible.
                </span>
              </motion.p>
            </div>

            <motion.div variants={itemVariants} className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm transition-all duration-300"
                >
                  <div className={`p-2 bg-gradient-to-br ${benefit.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {benefit.title}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="relative p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl border border-blue-500/20"
            >
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Trusted by Legal Professionals</span>
              </h3>
              <blockquote className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                "JusticeGPT has revolutionized how we handle initial client consultations and document reviews. The multilingual support is exceptional."
              </blockquote>
              <div className="mt-3 flex items-center space-x-3">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop"
                  alt="Sarah Chen"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <div className="font-medium">Sarah Chen</div>
                  <div className="opacity-75">Legal Consultant</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-luxury p-8 border border-white/20 dark:border-slate-700/50 overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-slate-900 dark:text-white mb-3"
                  >
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-600 dark:text-slate-300"
                  >
                    {isLogin 
                      ? 'Sign in to continue your legal journey'
                      : isSupabaseConfigured() 
                        ? 'Join thousands of users getting AI-powered legal help'
                        : 'Create a local account for development testing'
                    }
                  </motion.p>
                  
                  {isSupabaseConfigured() && !isLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          You'll receive an email confirmation link after signing up
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {!isSupabaseConfigured() && isLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
                    >
                      <div className="text-sm text-green-700 dark:text-green-300">
                        <strong>Demo Credentials:</strong><br />
                        Email: demo@justicegpt.ai<br />
                        Password: demo123
                      </div>
                    </motion.div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-300"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-300"
                        placeholder="Enter your password"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Jurisdiction
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <select
                            value={formData.jurisdiction}
                            onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-300"
                          >
                            {jurisdictions.map((jurisdiction) => (
                              <option key={jurisdiction} value={jurisdiction}>
                                {jurisdiction}
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                        />
                        <span className="ml-2 text-sm text-slate-600 dark:text-slate-300">
                          Remember me
                        </span>
                      </label>
                      <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Forgot password?
                      </a>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white rounded-2xl hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 relative z-10 group-hover:animate-pulse" />
                        <span className="relative z-10">{isLogin ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-slate-600 dark:text-slate-300">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>

                {!isLogin && (
                  <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 text-center">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Privacy Policy
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
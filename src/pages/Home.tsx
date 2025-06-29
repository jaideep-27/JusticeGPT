import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Scale, 
  MessageSquare, 
  FileText, 
  Globe, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Award,
  Sparkles,
  Star,
  TrendingUp,
  Brain,
  Lock,
  Rocket,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useScrollToTopFunction } from '../hooks/useScrollToTop';

export default function Home() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const { scrollToSection } = useScrollToTopFunction();

  const features = [
    {
      icon: Brain,
      title: translate('features.ai.title'),
      description: translate('features.ai.description'),
      gradient: 'from-blue-500 to-purple-600',
      delay: 0.1
    },
    {
      icon: FileText,
      title: translate('features.documents.title'),
      description: translate('features.documents.description'),
      gradient: 'from-green-500 to-teal-600',
      delay: 0.2
    },
    {
      icon: Globe,
      title: translate('features.multilingual.title'),
      description: translate('features.multilingual.description'),
      gradient: 'from-purple-500 to-pink-600',
      delay: 0.3
    },
    {
      icon: Shield,
      title: translate('features.jurisdiction.title'),
      description: translate('features.jurisdiction.description'),
      gradient: 'from-orange-500 to-red-600',
      delay: 0.4
    },
    {
      icon: Zap,
      title: translate('features.voice.title'),
      description: translate('features.voice.description'),
      gradient: 'from-yellow-500 to-orange-600',
      delay: 0.5
    },
    {
      icon: Lock,
      title: translate('features.blockchain.title'),
      description: translate('features.blockchain.description'),
      gradient: 'from-indigo-500 to-blue-600',
      delay: 0.6
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Corporate Lawyer',
      company: 'TechCorp Legal',
      content: 'JusticeGPT has revolutionized how we handle initial client consultations. The AI accuracy is remarkable and saves us hours of preliminary research.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Carlos Rodriguez',
      role: 'Small Business Owner',
      company: 'Rodriguez Enterprises',
      content: 'The multilingual support is incredible. I got comprehensive legal advice in Spanish for my startup, saving thousands in legal fees.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      gradient: 'from-green-500 to-teal-600'
    },
    {
      name: 'Priya Patel',
      role: 'Freelance Consultant',
      company: 'Independent',
      content: 'The document analysis feature helped me identify problematic clauses in client contracts. It\'s like having a legal expert available 24/7.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      gradient: 'from-purple-500 to-pink-600'
    },
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
    hidden: { opacity: 0, y: 30 },
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
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section id="hero" data-section="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-float float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            {/* Left Column - Content */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-6">
                <motion.div
                  variants={itemVariants}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Legal Technology</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </motion.div>
                
                <motion.h1 
                  variants={itemVariants}
                  className="text-5xl md:text-7xl font-display font-bold leading-tight"
                >
                  <span className="text-gradient bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                    {translate('home.hero.title').split(' ').slice(0, 2).join(' ')}
                  </span>
                  <br />
                  <span className="text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {translate('home.hero.title').split(' ').slice(2, 4).join(' ')}
                  </span>
                  <br />
                  <span className="text-gradient bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
                    {translate('home.hero.title').split(' ').slice(4).join(' ')}
                  </span>
                </motion.h1>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl"
                >
                  {translate('home.hero.subtitle')}
                  <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold block mt-2">
                    Justice made accessible.
                  </span>
                </motion.p>
              </div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Link to={user ? "/chat" : "/login"}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-luxury hover:shadow-glow-lg transition-all duration-300 overflow-hidden logo-hover"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Rocket className="w-6 h-6 relative z-10 group-hover:animate-bounce" />
                    <span className="relative z-10">{translate('home.hero.cta')}</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </Link>
                
                <button
                  onClick={() => scrollToSection('features')}
                  className="group inline-flex items-center space-x-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-luxury transition-all duration-300 logo-hover"
                >
                  <Award className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Learn More</span>
                  <ChevronUp className="w-5 h-5 rotate-180 group-hover:translate-y-1 transition-transform duration-300" />
                </button>
              </motion.div>

              {/* Trust Indicators - Real data */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
                <motion.div variants={itemVariants} className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    6+
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Languages
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    25+
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Jurisdictions
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Available
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    AI
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Powered
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column - Interactive Demo */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-luxury p-8 border border-white/20 dark:border-slate-700/50">
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg logo-hover">
                        <Scale className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">JusticeGPT Assistant</h3>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Online • Ready to help</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4 max-w-xs"
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        "I need help understanding my employment contract. Can you review it for me?"
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 ml-8 text-white"
                    >
                      <p className="text-sm">
                        "I'd be happy to help! I can analyze your contract for key terms, potential issues, and provide recommendations based on your jurisdiction's employment laws. 
                        <span className="inline-flex items-center space-x-1 ml-2">
                          <Sparkles className="w-3 h-3" />
                          <span className="text-xs opacity-90">AI-powered analysis</span>
                        </span>
                      </p>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Responds in seconds</span>
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <Globe className="w-4 h-4" />
                    <span>25+ jurisdictions</span>
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <Shield className="w-4 h-4" />
                    <span>Secure & private</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" data-section="features" className="py-32 bg-white dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-900/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-6 mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-sm font-medium">
              <Award className="w-4 h-4" />
              <span>{translate('home.features.title')}</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-bold">
              <span className="text-gradient bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {translate('home.features.subtitle')}
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Advanced AI technology meets comprehensive legal support in one powerful platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: feature.delay }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="h-full p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-luxury hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg logo-hover`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 group-hover:text-gradient transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" data-section="testimonials" className="py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-6 mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-500/20 text-green-700 dark:text-green-300 px-6 py-3 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>Trusted by Legal Professionals</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-bold">
              <span className="text-gradient bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                What our users
              </span>
              <br />
              <span className="text-gradient bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                are saying
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Real experiences from real people who trust JusticeGPT
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="h-full p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-luxury border border-white/20 dark:border-slate-700/50 hover:shadow-glow-lg hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    {/* Content */}
                    <blockquote className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-lg">
                      "{testimonial.content}"
                    </blockquote>
                    
                    {/* Author */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {testimonial.role}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" data-section="cta" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-mesh-1 opacity-20"></div>
        <div className="absolute inset-0 noise-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
                Ready to Transform Your
                <br />
                <span className="text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Legal Experience?
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Join thousands of users who trust JusticeGPT for their legal needs. 
                Start your journey to accessible justice today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to={user ? "/chat" : "/login"}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative inline-flex items-center space-x-3 bg-white text-blue-600 px-10 py-5 rounded-2xl font-semibold text-lg shadow-luxury hover:shadow-glow-lg transition-all duration-300 overflow-hidden logo-hover"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Rocket className="w-6 h-6 relative z-10 group-hover:animate-bounce" />
                  <span className="relative z-10">Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </Link>
              
              <Link to="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group inline-flex items-center space-x-3 bg-transparent text-white px-10 py-5 rounded-2xl font-semibold text-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 logo-hover"
                >
                  <Award className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span>View Pricing</span>
                </motion.button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center items-center gap-8 pt-12 text-blue-200"
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Bank-level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">24/7 Availability</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">Global Coverage</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">No Setup Required</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
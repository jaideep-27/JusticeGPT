import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Heart as HeartBroken, Flame, Share2, ExternalLink, RefreshCw, TrendingUp, MessageCircle, ArrowUp, Gavel, AlertTriangle, Trophy, Target } from 'lucide-react';
import { useSueYourEx } from '../hooks/useSueYourEx';
import { useAuth } from '../contexts/AuthContext';
import type { LegalAnalysisOfPost } from '../lib/reddit';
import toast from 'react-hot-toast';

export default function SueYourExMode() {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [jurisdiction, setJurisdiction] = useState('United States');
  const [showStats, setShowStats] = useState(false);
  
  const { user } = useAuth();
  const {
    posts,
    analyses,
    isLoading,
    isAnalyzing,
    fetchDrama,
    analyzeDrama,
    generateShareContent,
    getTopDrama,
    getAnalysisStats
  } = useSueYourEx();

  useEffect(() => {
    // Load initial drama on component mount
    fetchDrama(15);
  }, [fetchDrama]);

  const handleAnalyzePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    setSelectedPost(postId);
    try {
      await analyzeDrama(post, jurisdiction);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleShare = async (analysis: LegalAnalysisOfPost) => {
    try {
      const shareContent = generateShareContent(analysis);
      
      if (navigator.share) {
        await navigator.share({
          title: shareContent.title,
          text: shareContent.description,
          url: `https://justicegpt.ai/drama/${analysis.post.id}`
        });
      } else {
        // Fallback to clipboard
        const shareText = `${shareContent.title}\n\n${shareContent.description}\n\n${shareContent.hashtags.join(' ')}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard! Ready to share! 🚀');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share content');
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    }
  };

  const getDramaEmoji = (entertainmentValue: number) => {
    if (entertainmentValue >= 8) return '🔥🔥🔥';
    if (entertainmentValue >= 6) return '🔥🔥';
    if (entertainmentValue >= 4) return '🔥';
    return '😴';
  };

  const stats = getAnalysisStats();
  const topDrama = getTopDrama(3);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-neutral-900 dark:via-red-900/20 dark:to-orange-900/20 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <HeartBroken className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Login Required for Drama Analysis
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300">
            Sign in to analyze relationship drama and discover your legal options! 💔⚖️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-neutral-900 dark:via-red-900/20 dark:to-orange-900/20 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 text-4xl mb-4">
              <HeartBroken className="w-12 h-12 text-red-500" />
              <Gavel className="w-12 h-12 text-primary-500" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-white">
              Sue Your Ex Mode
            </h1>
            
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              Turn relationship drama into legal knowledge! 🍿⚖️<br />
              <span className="text-sm font-medium text-red-500">
                *For entertainment purposes only - not actual legal advice
              </span>
            </p>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex gap-4">
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white"
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchDrama(15)}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Fresh Drama</span>
            </motion.button>
          </div>

          <button
            onClick={() => setShowStats(!showStats)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Stats</span>
          </button>
        </div>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Drama Analysis Stats</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-500">{stats.totalAnalyzed}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Posts Analyzed</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">{stats.averageEntertainment}/10</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Avg Drama Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">{stats.severityBreakdown.high}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">High Severity</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">{stats.topIssues[0]?.count || 0}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Top Issue Cases</div>
                  </div>
                </div>

                {stats.topIssues.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Most Common Issues:</h4>
                    <div className="flex flex-wrap gap-2">
                      {stats.topIssues.map(({ issue, count }) => (
                        <span
                          key={issue}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                        >
                          {issue} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Drama Highlights */}
        {topDrama.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center space-x-2">
              <Flame className="w-6 h-6 text-red-500" />
              <span>🔥 Hottest Drama</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topDrama.map(({ post, analysis }, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl p-4 relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 text-2xl">
                    {getDramaEmoji(analysis?.entertainmentValue || 0)}
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm opacity-90">r/{post.subreddit}</div>
                    <h3 className="font-semibold line-clamp-2">{post.title}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Drama: {analysis?.entertainmentValue}/10</span>
                    <span>{analysis?.severity.toUpperCase()}</span>
                  </div>
                  
                  <button
                    onClick={() => handleShare(analysis!)}
                    className="mt-2 w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Drama Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.map((post) => {
            const analysis = analyses.get(post.id);
            const isAnalyzed = !!analysis;
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-neutral-800 rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                  isAnalyzed 
                    ? 'border-red-200 dark:border-red-800 shadow-red-100 dark:shadow-red-900/20' 
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                        r/{post.subreddit}
                      </span>
                      <span className="text-xs text-neutral-500">
                        by u/{post.author}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">
                      {post.selftext}
                    </p>
                  </div>
                  
                  {isAnalyzed && (
                    <div className="ml-4 text-center">
                      <div className="text-2xl mb-1">
                        {getDramaEmoji(analysis.entertainmentValue)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {analysis.entertainmentValue}/10
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Stats */}
                <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <ArrowUp className="w-4 h-4" />
                    <span>{post.score}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.num_comments}</span>
                  </div>
                  <div className="text-xs">
                    {new Date(post.created_utc * 1000).toLocaleDateString()}
                  </div>
                </div>

                {/* Analysis Results */}
                {isAnalyzed && analysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-neutral-200 dark:border-neutral-700 pt-4 space-y-3"
                  >
                    {/* Legal Issues */}
                    {analysis.legalIssues.length > 0 && (
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white mb-2 flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span>Legal Issues Detected:</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.legalIssues.map(issue => (
                            <span
                              key={issue}
                              className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Potential Claims */}
                    {analysis.potentialClaims.length > 0 && (
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white mb-2 flex items-center space-x-2">
                          <Target className="w-4 h-4 text-primary-500" />
                          <span>Potential Legal Actions:</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.potentialClaims.map(claim => (
                            <span
                              key={claim}
                              className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                            >
                              {claim}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Severity & Recommendation */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Severity:
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(analysis.severity)}`}>
                            {analysis.severity.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          {analysis.recommendation}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleShare(analysis)}
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share Drama</span>
                      </button>
                      
                      <a
                        href={`https://reddit.com${post.permalink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* Analyze Button */}
                {!isAnalyzed && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnalyzePost(post.id)}
                    disabled={isAnalyzing && selectedPost === post.id}
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    {isAnalyzing && selectedPost === post.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing Drama...</span>
                      </>
                    ) : (
                      <>
                        <Gavel className="w-4 h-4" />
                        <span>Analyze Legal Drama</span>
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-300">
              Fetching the juiciest relationship drama... 🍿
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <HeartBroken className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              No Drama Found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              Looks like everyone's getting along today! 💕
            </p>
            <button
              onClick={() => fetchDrama(15)}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Refresh for More Drama
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Entertainment Disclaimer
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                "Sue Your Ex Mode" is designed for entertainment and educational purposes only. 
                The legal analysis provided is AI-generated and should not be considered actual legal advice. 
                Real legal situations require consultation with qualified attorneys. 
                Please don't actually sue your ex based on our drama analysis! 😅⚖️
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
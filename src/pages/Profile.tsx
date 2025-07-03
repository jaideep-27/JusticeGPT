import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Settings, 
  Bell,
  Shield,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Save,
  Edit,
  Crown,
  CheckCircle,
  AlertTriangle,
  Download,
  FileText,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, supportedLanguages } from '../contexts/LanguageContext';
import { useSubscription } from '../hooks/useSubscription';
import { isSupabaseConfigured } from '../lib/supabase';
import { isGeminiConfigured } from '../lib/gemini';

export default function Profile() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, setLanguage } = useLanguage();
  const { subscription, currentTier } = useSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    jurisdiction: user?.jurisdiction || '',
  });

  const jurisdictions = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
    'Germany', 'France', 'Brazil', 'Nigeria', 'South Africa'
  ];

  const planFeatures = {
    free: [
      '5 AI consultations per month',
      'Basic document analysis',
      'General legal information',
      'Email support'
    ],
    premium: [
      'Unlimited AI consultations',
      'Advanced document analysis',
      'Jurisdiction-specific advice',
      'Priority support',
      'Document templates',
      'Voice interactions',
      'Video consultations',
      'Document notarization'
    ],
    enterprise: [
      'Everything in Premium',
      'Custom AI training',
      'Team collaboration',
      'API access',
      'Dedicated support',
      'Advanced analytics',
      'White-label solutions',
      'Custom integrations'
    ]
  };

  const activityData = [
    { label: 'AI Consultations', value: 47, icon: Zap, color: 'text-blue-500' },
    { label: 'Documents Analyzed', value: 23, icon: FileText, color: 'text-green-500' },
    { label: 'Templates Used', value: 12, icon: Download, color: 'text-purple-500' },
    { label: 'Hours Saved', value: 156, icon: Clock, color: 'text-orange-500' },
  ];

  const handleSave = () => {
    // In a real app, this would update the user profile
    setIsEditing(false);
  };

  const exportData = () => {
    // Mock data export functionality
    const data = {
      user: user,
      activity: activityData,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `justicegpt-profile-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 pt-16">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-neutral-400 mx-auto" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Please log in to access your profile
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            Sign in to manage your account settings and preferences.
          </p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.tierId || user.plan || 'free';
  const features = planFeatures[currentPlan as keyof typeof planFeatures] || planFeatures.free;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6"
        >
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>System Status</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isSupabaseConfigured() ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white">Database</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isSupabaseConfigured() ? 'Supabase Connected' : 'Local Mode'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isGeminiConfigured() ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white">AI Service</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isGeminiConfigured() ? 'Gemini AI Active' : 'Not Configured'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${user.id.startsWith('local_') ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white">Account</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {user.id.startsWith('local_') ? 'Local Development' : 'Cloud Account'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Basic Information
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {user.name}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                    </p>
                    {user.id.startsWith('local_') && (
                      <span className="inline-flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Development Mode</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <User className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-900 dark:text-white">{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <Mail className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-900 dark:text-white">{user.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Jurisdiction
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.jurisdiction}
                        onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white"
                      >
                        {jurisdictions.map((jurisdiction) => (
                          <option key={jurisdiction} value={jurisdiction}>
                            {jurisdiction}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <MapPin className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-900 dark:text-white">{user.jurisdiction}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-900 dark:text-white">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="inline-flex items-center space-x-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Activity Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Activity Overview</span>
                </h2>
                <button
                  onClick={exportData}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activityData.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="text-center p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                      {item.value}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-300">
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
            >
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                Preferences
              </h2>

              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Language
                  </label>
                  <select
                    value={currentLanguage.code}
                    onChange={(e) => {
                      const language = supportedLanguages.find(lang => lang.code === e.target.value);
                      if (language) setLanguage(language);
                    }}
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white"
                  >
                    {supportedLanguages.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.nativeName} ({language.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Theme
                  </label>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center space-x-3 w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                  >
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span className="text-neutral-900 dark:text-white">
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </button>
                </div>

                {/* Notifications */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Notifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                      />
                      <span className="text-neutral-900 dark:text-white">Email notifications</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                      />
                      <span className="text-neutral-900 dark:text-white">Document analysis updates</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                      />
                      <span className="text-neutral-900 dark:text-white">Marketing communications</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Crown className={`w-5 h-5 ${
                  currentPlan === 'premium' ? 'text-yellow-500' : 
                  currentPlan === 'enterprise' ? 'text-purple-500' : 
                  'text-neutral-500'
                }`} />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                </h3>
              </div>

              <div className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {currentPlan !== 'enterprise' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Upgrade Plan
                </motion.button>
              )}
            </motion.div>

            {/* Usage Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                This Month
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      AI Consultations
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {currentPlan === 'free' && !user.id.startsWith('local_') ? '3/5' : 'Unlimited'}
                    </span>
                  </div>
                  {currentPlan === 'free' && !user.id.startsWith('local_') && (
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      Documents Analyzed
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {subscription?.usage?.documentAnalysis || 23}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      Templates Used
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      12
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full text-left px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Data</span>
                </button>
                
                <button className="w-full text-left px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </button>
                
                <button className="w-full text-left px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notification Settings</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
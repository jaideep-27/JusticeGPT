import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Crown, 
  Star, 
  Zap,
  Shield,
  Users,
  Phone,
  MessageSquare,
  FileText,
  Globe,
  Mic,
  Video,
  Bot
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const { user } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with basic legal assistance',
      icon: Star,
      features: [
        '5 AI consultations per month',
        'Basic document analysis',
        'General legal information',
        'Email support',
        'Access to legal templates',
        'Community forum access'
      ],
      limitations: [
        'Limited AI responses',
        'Basic document analysis only',
        'No voice/video features',
        'Standard support only'
      ],
      buttonText: user?.plan === 'free' ? 'Current Plan' : 'Get Started',
      buttonStyle: 'border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800',
      popular: false,
    },
    {
      name: 'Premium',
      price: '$29',
      period: 'per month',
      description: 'Best for individuals and small businesses needing comprehensive legal support',
      icon: Crown,
      features: [
        'Unlimited AI consultations',
        'Advanced document analysis',
        'Jurisdiction-specific advice',
        'Priority support',
        'Document templates & generation',
        'Voice interactions',
        'Video consultations (30 mins/month)',
        'Legal document notarization',
        'Multi-language support',
        'Export to multiple formats'
      ],
      buttonText: user?.plan === 'premium' ? 'Current Plan' : 'Upgrade to Premium',
      buttonStyle: 'bg-primary-500 text-white hover:bg-primary-600',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      description: 'For teams and organizations requiring advanced legal solutions',
      icon: Shield,
      features: [
        'Everything in Premium',
        'Custom AI training',
        'Team collaboration tools',
        'API access',
        'Dedicated account manager',
        'Advanced analytics & reporting',
        'Unlimited video consultations',
        'Custom integrations',
        'Priority document processing',
        'White-label solutions',
        'Compliance monitoring',
        'Advanced security features'
      ],
      buttonText: user?.plan === 'enterprise' ? 'Current Plan' : 'Contact Sales',
      buttonStyle: 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100',
      popular: false,
    },
  ];

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Legal Chat',
      description: 'Get instant answers to your legal questions with our advanced AI assistant.',
    },
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Upload and analyze contracts, agreements, and legal documents.',
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Access legal assistance in 6+ languages with regional expertise.',
    },
    {
      icon: Mic,
      title: 'Voice Interactions',
      description: 'Speak naturally with our AI for hands-free legal consultations.',
    },
    {
      icon: Video,
      title: 'Video Consultations',
      description: 'Face-to-face meetings with AI-powered legal avatars.',
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Bank-level security with GDPR compliance and data protection.',
    },
  ];

  const faqs = [
    {
      question: 'What makes JusticeGPT different from other legal AI tools?',
      answer: 'JusticeGPT is specifically designed for multilingual legal assistance with jurisdiction-specific knowledge. We offer voice/video interactions, document notarization, and real-time legal guidance tailored to your location.',
    },
    {
      question: 'Is the AI advice legally binding?',
      answer: 'No, JusticeGPT provides general legal information and guidance only. It is not a substitute for professional legal advice from a qualified attorney. Always consult with a lawyer for specific legal matters.',
    },
    {
      question: 'How accurate is the document analysis?',
      answer: 'Our AI is trained on extensive legal databases and provides highly accurate analysis. However, we recommend having critical documents reviewed by a human attorney for final verification.',
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.',
    },
    {
      question: 'Do you offer custom solutions for law firms?',
      answer: 'Yes, our Enterprise plan includes custom AI training, API access, and white-label solutions perfect for law firms and legal organizations.',
    },
    {
      question: 'Which jurisdictions do you support?',
      answer: 'We currently support 25+ jurisdictions including US, UK, Canada, Australia, India, and major European countries. We\'re continuously expanding our coverage.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-800 dark:to-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-white">
              Choose Your Legal Assistant Plan
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              From basic legal guidance to comprehensive enterprise solutions, find the perfect plan for your legal needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative bg-white dark:bg-neutral-800 rounded-2xl p-8 border-2 transition-all hover:shadow-xl ${
                  plan.popular
                    ? 'border-primary-500 shadow-lg'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    plan.popular
                      ? 'bg-primary-100 dark:bg-primary-900/30'
                      : 'bg-neutral-100 dark:bg-neutral-700'
                  }`}>
                    <plan.icon className={`w-8 h-8 ${
                      plan.popular
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400 ml-2">
                      {plan.period}
                    </span>
                  </div>
                  
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.buttonStyle}`}
                  disabled={user?.plan === plan.name.toLowerCase()}
                >
                  {plan.buttonText}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-4">
              Powerful Features for Every Plan
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300">
              Advanced AI technology meets comprehensive legal support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300">
              Get answers to common questions about JusticeGPT
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
              >
                <h3 className="text-lg font-semibold text-neutral-900 dark: text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-display font-bold text-white">
              Ready to Transform Your Legal Experience?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of users who trust JusticeGPT for their legal needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-transparent text-white border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Contact Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Mail, Phone, MapPin, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { translate } = useLanguage();

  const footerLinks = [
    {
      title: translate('footer.quicklinks'),
      links: [
        { name: translate('nav.home'), href: '/' },
        { name: translate('nav.chat'), href: '/chat' },
        { name: translate('nav.documents'), href: '/documents' },
        { name: translate('nav.pricing'), href: '/pricing' },
      ]
    },
    {
      title: translate('footer.legal'),
      links: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Legal Disclaimer', href: '#' },
        { name: 'Cookie Policy', href: '#' },
      ]
    },
    {
      title: translate('footer.support'),
      links: [
        { name: 'Help Center', href: '#' },
        { name: 'Contact Us', href: '#' },
        { name: 'API Documentation', href: '#' },
        { name: 'Status Page', href: '#' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-600' },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4 group"
            >
              <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl group-hover:shadow-glow transition-all duration-300 hover-scale">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-white">JusticeGPT</span>
                <div className="text-sm text-neutral-400 font-medium">AI Legal Assistant Platform</div>
              </div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-neutral-400 leading-relaxed max-w-md text-lg"
            >
              AI-powered legal assistance platform providing multilingual support and comprehensive legal solutions for everyone. Making justice accessible through technology.
            </motion.p>

            {/* Social Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 bg-neutral-800 rounded-xl text-neutral-400 ${social.color} transition-all duration-300 hover-lift`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-neutral-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-neutral-800"
        >
          <h3 className="text-xl font-semibold text-white mb-8">{translate('footer.contact')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4 group">
              <div className="p-3 bg-primary-500/20 rounded-xl group-hover:bg-primary-500/30 transition-colors duration-300">
                <Mail className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <div className="text-sm text-neutral-400 font-medium">{translate('footer.email')}</div>
                <a 
                  href="mailto:justicegpt@gmail.com"
                  className="text-white font-semibold text-lg hover:text-primary-400 transition-colors"
                >
                  justicegpt@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 group">
              <div className="p-3 bg-secondary-500/20 rounded-xl group-hover:bg-secondary-500/30 transition-colors duration-300">
                <Phone className="w-6 h-6 text-secondary-400" />
              </div>
              <div>
                <div className="text-sm text-neutral-400 font-medium">{translate('footer.phone')}</div>
                <a 
                  href="tel:+919390550397"
                  className="text-white font-semibold text-lg hover:text-secondary-400 transition-colors"
                >
                  +91 9390550397
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 group">
              <div className="p-3 bg-accent-500/20 rounded-xl group-hover:bg-accent-500/30 transition-colors duration-300">
                <MapPin className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <div className="text-sm text-neutral-400 font-medium">{translate('footer.location')}</div>
                <div className="text-white font-semibold text-lg">India & Global</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 mt-16 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-neutral-400"
            >
              <span className="text-base">© 2024 JusticeGPT. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center space-x-2 text-base">
                <span>Built with</span>
                <Heart className="w-4 h-4 text-red-500 mx-1" />
                <span>for justice</span>
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-warning-500/10 border border-warning-500/20 rounded-xl p-6 max-w-2xl"
            >
              <p className="text-sm text-warning-400 font-medium text-center leading-relaxed">
                This AI provides general legal information only and does not constitute legal advice. Please consult with a qualified attorney for specific legal matters.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
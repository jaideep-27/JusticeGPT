import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { useScrollToTop } from './hooks/useScrollToTop';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import SueYourExMode from './components/SueYourExMode';
import Footer from './components/Footer';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Component to handle scroll to top on route changes
function ScrollToTopOnRouteChange() {
  useScrollToTop();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <ScrollToTopOnRouteChange />
              <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 transition-colors duration-300">
                <Navbar />
                <motion.main
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1"
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/sue-your-ex" element={<SueYourExMode />} />
                  </Routes>
                </motion.main>
                <Footer />
                
                {/* Scroll to Top Button */}
                <ScrollToTop />
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgb(255 255 255 / 0.95)',
                      color: 'rgb(23 23 23)',
                      border: '1px solid rgb(229 231 235)',
                      borderRadius: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backdropFilter: 'blur(8px)',
                      fontFamily: 'Poppins, sans-serif',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                      },
                      style: {
                        background: 'rgb(240 253 244 / 0.95)',
                        color: 'rgb(22 163 74)',
                        border: '1px solid rgb(187 247 208)',
                        fontFamily: 'Poppins, sans-serif',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                      style: {
                        background: 'rgb(254 242 242 / 0.95)',
                        color: 'rgb(220 38 38)',
                        border: '1px solid rgb(254 202 202)',
                        fontFamily: 'Poppins, sans-serif',
                      },
                    },
                    loading: {
                      iconTheme: {
                        primary: '#3b82f6',
                        secondary: '#ffffff',
                      },
                      style: {
                        background: 'rgb(239 246 255 / 0.95)',
                        color: 'rgb(37 99 235)',
                        border: '1px solid rgb(191 219 254)',
                        fontFamily: 'Poppins, sans-serif',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
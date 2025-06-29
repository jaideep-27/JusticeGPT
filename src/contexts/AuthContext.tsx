import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getCurrentSiteUrl } from '../lib/supabase';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'premium' | 'enterprise';
  jurisdiction: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, jurisdiction: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced in-memory user database for demo purposes
const DEMO_USERS = new Map<string, { password: string; user: User }>();

// Pre-populate with some demo users
DEMO_USERS.set('demo@justicegpt.ai', {
  password: 'demo123',
  user: {
    id: 'demo_user_1',
    name: 'Demo User',
    email: 'demo@justicegpt.ai',
    plan: 'premium',
    jurisdiction: 'United States'
  }
});

DEMO_USERS.set('test@example.com', {
  password: 'test123',
  user: {
    id: 'demo_user_2',
    name: 'Test User',
    email: 'test@example.com',
    plan: 'free',
    jurisdiction: 'Canada'
  }
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured() && supabase) {
          // Handle auth state changes
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const userData: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              plan: session.user.user_metadata?.plan || 'free',
              jurisdiction: session.user.user_metadata?.jurisdiction || 'United States',
            };
            setUser(userData);
            
            // Store user data in localStorage for consistency
            localStorage.setItem('justicegpt_user', JSON.stringify(userData));
          }

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth state changed:', event, session?.user?.email);
              
              if (event === 'SIGNED_IN' && session?.user) {
                const userData: User = {
                  id: session.user.id,
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  plan: session.user.user_metadata?.plan || 'free',
                  jurisdiction: session.user.user_metadata?.jurisdiction || 'United States',
                };
                setUser(userData);
                localStorage.setItem('justicegpt_user', JSON.stringify(userData));
                toast.success('Successfully signed in!');
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('justicegpt_user');
                localStorage.removeItem('justicegpt_session');
                toast.success('Successfully signed out!');
              }
            }
          );

          // Cleanup subscription on unmount
          return () => subscription.unsubscribe();
        } else {
          // Check for persistent local storage user
          const localUser = localStorage.getItem('justicegpt_user');
          const sessionToken = localStorage.getItem('justicegpt_session');
          
          if (localUser && sessionToken) {
            try {
              const parsedUser = JSON.parse(localUser);
              // Verify session is still valid (7 days for better UX)
              const sessionData = JSON.parse(sessionToken);
              const now = Date.now();
              
              if (now - sessionData.timestamp < 7 * 24 * 60 * 60 * 1000) {
                setUser(parsedUser);
              } else {
                // Session expired
                localStorage.removeItem('justicegpt_user');
                localStorage.removeItem('justicegpt_session');
              }
            } catch (error) {
              console.error('Error parsing local user:', error);
              localStorage.removeItem('justicegpt_user');
              localStorage.removeItem('justicegpt_session');
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        // Real Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          // Provide helpful error messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials or sign up if you don\'t have an account.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and click the confirmation link before signing in.');
          } else if (error.message.includes('Email link is invalid')) {
            throw new Error('The email confirmation link has expired. Please request a new one.');
          }
          throw error;
        }

        if (data.user) {
          const userData: User = {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            plan: data.user.user_metadata?.plan || 'free',
            jurisdiction: data.user.user_metadata?.jurisdiction || 'United States',
          };
          setUser(userData);
          localStorage.setItem('justicegpt_user', JSON.stringify(userData));
        }
      } else {
        // Local development mode with enhanced persistence
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
        
        // Check if user exists in demo database
        const demoUser = DEMO_USERS.get(email.toLowerCase());
        if (demoUser && demoUser.password === password) {
          setUser(demoUser.user);
          
          // Store in localStorage with extended session
          localStorage.setItem('justicegpt_user', JSON.stringify(demoUser.user));
          localStorage.setItem('justicegpt_session', JSON.stringify({
            timestamp: Date.now(),
            email: email.toLowerCase(),
            persistent: true
          }));
          
          toast.success('Successfully signed in!');
        } else {
          throw new Error('Invalid email or password. Try demo@justicegpt.ai with password: demo123');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else {
        // Local mode logout
        setUser(null);
        localStorage.removeItem('justicegpt_user');
        localStorage.removeItem('justicegpt_session');
        toast.success('Successfully signed out!');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
    }
  };

  const register = async (name: string, email: string, password: string, jurisdiction: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        // Real Supabase registration
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              jurisdiction,
              plan: 'free'
            },
            emailRedirectTo: getCurrentSiteUrl()
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('An account with this email already exists. Please sign in instead.');
          }
          throw error;
        }

        if (data.user) {
          // Don't automatically set user - wait for email confirmation
          toast.success('Account created! Please check your email to confirm your account before signing in.');
        }
      } else {
        // Local development mode with enhanced persistence
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
        
        // Check if user already exists
        if (DEMO_USERS.has(email.toLowerCase())) {
          throw new Error('User already exists with this email. Please sign in instead.');
        }
        
        const userData: User = {
          id: 'local_' + Date.now(),
          name,
          email: email.toLowerCase(),
          plan: 'premium', // Give premium for local development
          jurisdiction,
        };
        
        // Store in demo database
        DEMO_USERS.set(email.toLowerCase(), { password, user: userData });
        
        setUser(userData);
        
        // Store in localStorage with extended session
        localStorage.setItem('justicegpt_user', JSON.stringify(userData));
        localStorage.setItem('justicegpt_session', JSON.stringify({
          timestamp: Date.now(),
          email: email.toLowerCase(),
          persistent: true
        }));
        
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Initializing JusticeGPT
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Setting up your legal assistant...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
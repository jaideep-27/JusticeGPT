import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidSupabaseConfig = () => {
  return (
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_url' &&
    supabaseAnonKey !== 'your_supabase_anon_key' &&
    isValidUrl(supabaseUrl)
  );
};

// Get the correct site URL based on environment
const getSiteUrl = () => {
  // Check if we're in production (Netlify)
  if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('justicegpt')) {
    return window.location.origin;
  }
  
  // Check for other production domains
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  
  // Default to localhost for development
  return 'http://localhost:5173';
};

// Create Supabase client only if configuration is valid
export const supabase = isValidSupabaseConfig() 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  : null;

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  jurisdiction: string;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  type: string;
  content: string;
  analysis: any;
  blockchain_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  messages: any[];
  jurisdiction: string;
  language: string;
  created_at: string;
  updated_at: string;
}

// Auth functions with proper redirect URLs
export const signUp = async (email: string, password: string, userData: any) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: getSiteUrl()
    }
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Password reset with correct redirect
export const resetPassword = async (email: string) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/reset-password`
  });
  
  if (error) throw error;
};

// Database functions
export const createUserProfile = async (userId: string, profileData: any) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ id: userId, ...profileData }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const saveDocument = async (documentData: any) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase
    .from('documents')
    .insert([documentData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getUserDocuments = async (userId: string) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const saveChatSession = async (sessionData: any) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([sessionData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateChatSession = async (sessionId: string, updates: any) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getUserChatSessions = async (userId: string) => {
  if (!isValidSupabaseConfig() || !supabase) {
    throw new Error('Supabase is not properly configured. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => isValidSupabaseConfig();

// Helper function to get current site URL
export const getCurrentSiteUrl = () => getSiteUrl();
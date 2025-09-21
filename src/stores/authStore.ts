import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  message: string | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, department: string, university: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearMessages: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  message: null,
  error: null,

  initialize: async () => {
    console.log('Initializing auth...');
    
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session);
    
    if (session?.user) {
      console.log('User found in session, fetching profile...');
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      console.log('Profile fetch result:', profile);
      set({ user: session.user, profile, loading: false, message: null, error: null });
    } else {
      console.log('No user session found');
      set({ loading: false, message: null, error: null });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        console.log('Profile loaded on auth change:', profile);
        set({ user: session.user, profile, message: null, error: null });
      } else {
        set({ user: null, profile: null, message: null, error: null });
      }
    });
  },

  signIn: async (email: string, password: string) => {
    set({ error: null, message: null });
    console.log('Starting signin process...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Signin result:', { user: data.user?.id, error });
    if (error) {
      console.error('Signin error:', error);
      set({ error: error.message });
      throw error;
    }
    
    // Fetch user profile after successful sign in
    if (data.user) {
      console.log('Fetching profile for user:', data.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      console.log('Profile fetch result:', { profile, profileError });
      
      if (profileError) {
        console.error('Error fetching profile after signin:', profileError);
        set({ error: `Profile not found: ${profileError.message}` });
        throw profileError;
      }
      
      set({ user: data.user, profile, message: 'Successfully signed in!' });
    }
    
  },

  signUp: async (email: string, password: string, name: string, department: string, university: string) => {
    set({ error: null, message: null });
    
    console.log('Starting signup process...');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
        data: {
          name,
          department,
          university
        }
      }
    });

    console.log('Auth signup result:', { data, error });
    if (error) {
      console.error('Auth signup error:', error);
      set({ error: error.message });
      throw error;
    }

    if (data.user) {
      console.log('User created, ID:', data.user.id);
      
      // Wait for the auth state to be established, then create profile
      console.log('Waiting for auth state to be established...');
      
      // Set a timeout to allow auth state to be established
      setTimeout(async () => {
        try {
          console.log('Attempting to create profile after auth state established...');
          
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email,
              name,
              department,
              university,
            })
            .select()
            .single();

          console.log('Profile creation result:', { profileData, profileError });
          if (profileError) {
            console.error('Profile creation error:', profileError);
            set({ error: `Failed to create profile: ${profileError.message}` });
            return;
          }
          
          console.log('Profile created successfully:', profileData);
          set({ user: data.user, profile: profileData, message: 'Account created successfully!' });
        } catch (err) {
          console.error('Error in delayed profile creation:', err);
          set({ error: 'Failed to create user profile. Please try again.' });
        }
      }, 1000);
      
      // Set initial state without profile for now
      set({ user: data.user, profile: null, message: 'Creating your profile...' });
    }
  },

  signOut: async () => {
    set({ error: null, message: null });
    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    
    set({ message: 'Successfully signed out!' });
  },

  clearMessages: () => {
    set({ message: null, error: null });
  },
  updateProfile: async (updates: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    set({ profile: data });
  },
}));
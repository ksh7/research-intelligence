import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Project = Database['public']['Tables']['research_projects']['Row'];
type ProjectInsert = Database['public']['Tables']['research_projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['research_projects']['Update'];

interface ProjectState {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<ProjectInsert, 'user_id'>) => Promise<Project>;
  updateProject: (id: string, updates: ProjectUpdate) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('research_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ projects: data || [], loading: false });
  },

  createProject: async (project: Omit<ProjectInsert, 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('research_projects')
      .insert({ ...project, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    
    const { projects } = get();
    set({ projects: [data, ...projects] });
    return data;
  },

  updateProject: async (id: string, updates: ProjectUpdate) => {
    const { data, error } = await supabase
      .from('research_projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const { projects } = get();
    set({ 
      projects: projects.map(p => p.id === id ? data : p)
    });
  },

  deleteProject: async (id: string) => {
    const { error } = await supabase
      .from('research_projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const { projects } = get();
    set({ projects: projects.filter(p => p.id !== id) });
  },
}));
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Form = Database['public']['Tables']['research_forms']['Row'];
type FormInsert = Database['public']['Tables']['research_forms']['Insert'];
type FormUpdate = Database['public']['Tables']['research_forms']['Update'];
type FormResponse = Database['public']['Tables']['form_responses']['Row'];

interface FormState {
  forms: Form[];
  responses: FormResponse[];
  loading: boolean;
  fetchForms: (projectId?: string) => Promise<void>;
  fetchFormResponses: (formId: string) => Promise<void>;
  createForm: (form: FormInsert) => Promise<Form>;
  updateForm: (id: string, updates: FormUpdate) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  getPublicForm: (publicLink: string) => Promise<Form>;
  submitResponse: (formId: string, responseData: any, respondentIp?: string) => Promise<void>;
  generatePublicLink: (formId: string) => Promise<string>;
}

export const useFormStore = create<FormState>((set, get) => ({
  forms: [],
  responses: [],
  loading: false,

  fetchForms: async (projectId?: string) => {
    set({ loading: true });
    let query = supabase.from('research_forms').select('*');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    set({ forms: data || [], loading: false });
  },

  fetchFormResponses: async (formId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    set({ responses: data || [], loading: false });
    return data || [];
  },

  createForm: async (form: FormInsert) => {
    const { data, error } = await supabase
      .from('research_forms')
      .insert(form)
      .select()
      .single();

    if (error) throw error;
    
    const { forms } = get();
    set({ forms: [data, ...forms] });
    return data;
  },

  updateForm: async (id: string, updates: FormUpdate) => {
    const { data, error } = await supabase
      .from('research_forms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const { forms } = get();
    set({ 
      forms: forms.map(f => f.id === id ? data : f)
    });
  },

  deleteForm: async (id: string) => {
    const { error } = await supabase
      .from('research_forms')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const { forms } = get();
    set({ forms: forms.filter(f => f.id !== id) });
  },

  getPublicForm: async (publicLink: string) => {
    const { data, error } = await supabase
      .from('research_forms')
      .select('*')
      .eq('public_link', publicLink)
      .eq('is_public', true)
      .eq('is_accepting_responses', true)
      .single();

    if (error) throw error;
    return data;
  },

  submitResponse: async (formId: string, responseData: any, respondentIp?: string) => {
    const { error } = await supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        response_data: responseData,
      });

    if (error) throw error;
  },

  generatePublicLink: async (formId: string) => {
    const publicLink = formId; // Use the form ID directly
    
    const { error } = await supabase
      .from('research_forms')
      .update({ public_link: publicLink })
      .eq('id', formId);

    if (error) throw error;
    return publicLink;
  },

  // Auto-generate public link when form is published
  ensurePublicLink: async (formId: string) => {
    const { data: form } = await supabase
      .from('research_forms')
      .select('public_link')
      .eq('id', formId)
      .single();

    if (!form?.public_link) {
      const publicLink = formId; // Use the form ID directly
      
      const { error } = await supabase
        .from('research_forms')
        .update({ public_link: publicLink })
        .eq('id', formId);

      if (error) throw error;
      return publicLink;
    }
    
    return form.public_link;
  },
}));
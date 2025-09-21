import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          department: string;
          university: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          department: string;
          university: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          department?: string;
          university?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      research_projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          user_id: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          user_id: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          user_id?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      research_forms: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          project_id: string;
          survey_json: any;
          consent_required: boolean;
          is_public: boolean;
          is_accepting_responses: boolean;
          public_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          project_id: string;
          survey_json?: any;
          consent_required?: boolean;
          is_public?: boolean;
          is_accepting_responses?: boolean;
          public_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          project_id?: string;
          survey_json?: any;
          consent_required?: boolean;
          is_public?: boolean;
          is_accepting_responses?: boolean;
          public_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_responses: {
        Row: {
          id: string;
          form_id: string;
          response_data: any;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          response_data: any;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          response_data?: any;
          submitted_at?: string;
        };
      };
    };
  };
};
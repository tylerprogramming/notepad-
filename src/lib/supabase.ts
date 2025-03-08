import { createClient } from '@supabase/supabase-js';
import type { UserSettings, Tab } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export function generateUUID(): string {
  return crypto.randomUUID();
}

// Initialize authentication
export async function initializeAuth() {
  try {
    // First try to get existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return session.user;
    }

    // If no session exists, try to sign up first
    const { error: signUpError } = await supabase.auth.signUp({
      email: 'tylerreedytlearning@gmail.com',
      password: 'Rcia@0716!'
    });

    // If sign up fails (likely because user exists), try to sign in
    if (signUpError) {
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email: 'tylerreedytlearning@gmail.com',
        password: 'Rcia@0716!'
      });

      if (signInError) {
        throw signInError;
      }

      return data.user;
    }

    // Get session after sign up
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
}

export async function saveUserSettings(settings: UserSettings) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: user.id,
      email: settings.email,
      email_password: settings.emailPassword,
      openai_key: settings.openaiKey,
      preferred_model: settings.preferredModel
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    email: data.email,
    emailPassword: data.email_password,
    openaiKey: data.openai_key,
    recipientEmail: '',
    preferredModel: data.preferred_model || 'gpt-4o'
  };
}

export async function saveFile(tab: Tab): Promise<Tab | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Ensure we have a valid UUID for the file
  const fileId = tab.id || generateUUID();

  const { data, error } = await supabase
    .from('files')
    .upsert({
      id: fileId,
      user_id: user.id,
      name: tab.name,
      content: tab.content,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving file:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    content: data.content
  };
}

export async function loadFiles(): Promise<Tab[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Load all existing files
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error loading files:', error);
    return [];
  }
  
  return data.map(file => ({
    id: file.id,
    name: file.name,
    content: file.content
  }));
}

export async function deleteFile(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
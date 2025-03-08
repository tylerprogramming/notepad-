import { createClient } from '@supabase/supabase-js';
import type { UserSettings } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveUserSettings(settings: UserSettings) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

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
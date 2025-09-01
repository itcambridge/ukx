import { createClient } from '@supabase/supabase-js';
import { initAuth } from './auth/auth.js';
import { initRouter } from './router.js';
import './styles.css';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize authentication
  initAuth(supabase);
  
  // Initialize router
  initRouter();
  
  console.log('UJC Platform initialized');
});

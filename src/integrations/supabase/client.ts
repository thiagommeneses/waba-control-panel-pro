// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rgmvgftedjnhrlbprxkp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnbXZnZnRlZGpuaHJsYnByeGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1Mjg5ODAsImV4cCI6MjA2MTEwNDk4MH0.456CDmYQpf-OKQDvqWjoE7ijFvGGVhbOuPyg3O_pCr0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file."
  );
}
if (!supabaseAnonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

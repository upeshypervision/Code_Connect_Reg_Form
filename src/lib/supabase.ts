import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

// True only when both env vars are present. When false, the app still renders
// and submitting shows a clear "not configured" message instead of crashing.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.error(
    "Missing Supabase env vars. Create a .env.local with VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example), then restart the dev server.",
  );
}

// Guard createClient: passing an empty URL throws at import time, which blanks
// the whole page. Only build the client when both values exist.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Table that receives Code Connect registrations.
export const REGISTRATIONS_TABLE = "code_connect_registrations";

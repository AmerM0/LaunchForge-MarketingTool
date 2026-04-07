import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Use in: Client Components ("use client").
 * This is safe to use in the browser — uses the anon key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

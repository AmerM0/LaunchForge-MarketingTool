import { redirect } from "next/navigation";

// Duck-typed minimal interface — works with any Supabase client variant
// (server client, browser client, admin client) regardless of version generics
interface QueryableClient {
  from(table: string): any;
}

/**
 * Returns true only if the user has an active or trialing subscription
 * that hasn't expired yet. Used in both Server Components and API routes.
 */
export async function checkActiveSubscription(
  userId: string,
  supabase: QueryableClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return false;

  // Belt-and-suspenders: also check the period hasn't expired
  const now = new Date();
  const periodEnd = new Date(data.current_period_end ?? 0);
  return periodEnd > now;
}

/**
 * Use this in layout.tsx (Dashboard RSC layout).
 * Redirects to /pricing if user has no active subscription.
 */
export async function requireActiveSubscription(
  userId: string,
  supabase: QueryableClient
): Promise<void> {
  const isActive = await checkActiveSubscription(userId, supabase);
  if (!isActive) redirect("/pricing");
}

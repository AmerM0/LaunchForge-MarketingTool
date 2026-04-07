import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe/client";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/pricing");

  // Verify the user is still authenticated
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Retrieve the Stripe session with the subscription expanded
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription"],
    });
  } catch {
    redirect("/pricing?checkout=error");
  }

  // Only proceed if the session completed successfully
  if (session.status !== "complete") {
    redirect("/pricing?checkout=cancelled");
  }

  // Immediately sync subscription to DB so the dashboard gate passes.
  // This handles the case where the webhook hasn't fired yet (race condition).
  const sub = session.subscription;
  if (sub && typeof sub !== "string") {
    const adminSupabase = createAdminClient();
    const userId = sub.metadata?.supabase_user_id ?? user.id;
    const priceId = sub.items.data[0]?.price?.id ?? "";

    await adminSupabase.from("subscriptions").upsert({
      id:                   sub.id,
      user_id:              userId,
      status:               sub.status,
      price_id:             priceId,
      quantity:             sub.items.data[0]?.quantity ?? 1,
      cancel_at_period_end: sub.cancel_at_period_end,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end:   new Date(sub.current_period_end   * 1000).toISOString(),
    });
  }

  redirect("/dashboard");
}

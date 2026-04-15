const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, email, password, fullName } = await req.json();

    if (!code || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Validate invite code
    const { data: invite, error: inviteErr } = await supabase
      .from("beta_invite_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (inviteErr || !invite) {
      return new Response(JSON.stringify({ error: "Invalid invite code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invite.status !== "active") {
      return new Response(JSON.stringify({ error: "This invite code has been " + invite.status }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invite.uses >= invite.max_uses) {
      return new Response(JSON.stringify({ error: "This invite code has reached its max uses" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user account
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || "" },
    });

    if (authErr) {
      return new Response(JSON.stringify({ error: authErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add to beta_testers as approved
    await supabase.from("beta_testers").upsert({
      email: email.toLowerCase().trim(),
      status: "approved",
      invited_by: invite.created_by,
    }, { onConflict: "email" });

    // Update profile to approved
    await supabase
      .from("profiles")
      .update({ approved: true })
      .eq("user_id", authData.user.id);

    // Update invite code usage
    const newUses = invite.uses + 1;
    const updateData: Record<string, unknown> = {
      uses: newUses,
      used_by: email.toLowerCase().trim(),
      used_at: new Date().toISOString(),
    };
    if (newUses >= invite.max_uses) {
      updateData.status = "used";
    }
    await supabase.from("beta_invite_codes").update(updateData).eq("id", invite.id);

    return new Response(JSON.stringify({ success: true, userId: authData.user.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

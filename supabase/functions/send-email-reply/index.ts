import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const NANGO_API_URL = "https://api.nango.dev";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const NANGO_SECRET_KEY = Deno.env.get("NANGO_SECRET_KEY");

    if (!NANGO_SECRET_KEY) throw new Error("NANGO_SECRET_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { to, cc, subject, message, in_reply_to, email_id, mode } = body;

    if (!to || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject, message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Nango connection
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("nango_connection_id")
      .eq("user_id", user.id)
      .eq("provider", "outlook")
      .single();

    if (!integration) {
      return new Response(JSON.stringify({ error: "No Outlook connection found. Connect your email in Settings." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build recipients
    const toRecipients = to.split(",").map((e: string) => ({
      emailAddress: { address: e.trim() },
    }));

    const ccRecipients = cc
      ? cc.split(",").map((e: string) => ({
          emailAddress: { address: e.trim() },
        }))
      : [];

    // If replying to an existing message, use the reply endpoint
    if (in_reply_to && mode === "reply") {
      // Use the reply endpoint for proper threading
      const replyRes = await fetch(
        `${NANGO_API_URL}/proxy/v1.0/me/messages/${in_reply_to}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${NANGO_SECRET_KEY}`,
            "Connection-Id": integration.nango_connection_id,
            "Provider-Config-Key": "microsoft",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              toRecipients,
              ccRecipients: ccRecipients.length > 0 ? ccRecipients : undefined,
            },
            comment: message,
          }),
        }
      );

      if (!replyRes.ok) {
        const errText = await replyRes.text();
        console.error(`[send-email-reply] Reply failed [${replyRes.status}]:`, errText);
        throw new Error(`Failed to send reply: ${errText}`);
      }

      console.log(`[send-email-reply] Reply sent successfully to ${to}`);
    } else {
      // Send as new email
      const sendRes = await fetch(
        `${NANGO_API_URL}/proxy/v1.0/me/sendMail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${NANGO_SECRET_KEY}`,
            "Connection-Id": integration.nango_connection_id,
            "Provider-Config-Key": "microsoft",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              subject,
              body: { contentType: "Text", content: message },
              toRecipients,
              ccRecipients: ccRecipients.length > 0 ? ccRecipients : undefined,
            },
          }),
        }
      );

      if (!sendRes.ok) {
        const errText = await sendRes.text();
        console.error(`[send-email-reply] Send failed [${sendRes.status}]:`, errText);
        throw new Error(`Failed to send email: ${errText}`);
      }

      console.log(`[send-email-reply] New email sent successfully to ${to}`);
    }

    // Log to activity_log
    await supabase.from("activity_log").insert({
      user_id: user.id,
      action_type: mode === "reply" ? "email_reply" : "email_sent",
      description: `${mode === "reply" ? "Replied to" : "Sent email to"} ${to}: ${subject}`,
      metadata: { to, subject, email_id: email_id || null },
    });

    // If replying, update the email record
    if (email_id) {
      await supabase
        .from("emails")
        .update({ read: true })
        .eq("id", email_id)
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[send-email-reply] Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LandingNav from "@/components/landing/LandingNav";
import FooterSection from "@/components/landing/FooterSection";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function BetaInvitePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!code) {
      setValidating(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("beta_invite_codes")
        .select("status, uses, max_uses")
        .eq("code", code)
        .single();
      setCodeValid(!!data && data.status === "active" && data.uses < data.max_uses);
      setValidating(false);
    })();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);

    const { data, error: fnErr } = await supabase.functions.invoke("beta-signup", {
      body: { code, email: email.trim(), password, fullName: fullName.trim() },
    });

    setLoading(false);
    if (fnErr || data?.error) {
      setError(data?.error || fnErr?.message || "Something went wrong.");
      return;
    }

    // Sign in the user
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInErr) {
      setError("Account created but sign-in failed. Try logging in.");
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LandingNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!code || !codeValid) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LandingNav />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4 max-w-md">
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Invalid Invite Link</h1>
            <p className="text-muted-foreground">
              This invite code is invalid, expired, or has already been used.
            </p>
            <Link to="/beta" className="text-sm text-primary hover:underline block">
              Join the waitlist instead →
            </Link>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LandingNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Welcome to MYTHOS HQ! 🎉</h1>
            <p className="text-muted-foreground">Redirecting to your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
              Beta Access
            </span>
            <h1 className="text-2xl font-bold text-foreground mb-2">You're invited to MYTHOS HQ</h1>
            <p className="text-sm text-muted-foreground">Create your account to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}

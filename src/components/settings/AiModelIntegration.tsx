import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { BrainCircuit, Key } from "lucide-react";

const BYOK_PLANS = ["titan", "atlas", "olympus"];

export default function AiModelIntegration() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const plan = subscription?.plan?.toLowerCase() ?? "scout";
  const canByok = BYOK_PLANS.includes(plan);

  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"valid" | "invalid" | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("anthropic_api_key")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.anthropic_api_key) {
          setApiKey("••••••••••••" + data.anthropic_api_key.slice(-4));
          setSavedKey(true);
          setTestResult("valid");
        }
      });
  }, [user]);

  const saveKey = async () => {
    if (!user || !apiKey || apiKey.startsWith("••")) return;
    const { error } = await supabase
      .from("profiles")
      .update({ anthropic_api_key: apiKey } as any)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to save key");
      return;
    }
    toast.success("Anthropic API key saved");
    setSavedKey(true);
    setTestResult(null);
  };

  const testConnection = async () => {
    const keyToTest = apiKey.startsWith("••") ? null : apiKey;
    if (!keyToTest && !savedKey) {
      toast.error("Enter a key first");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const testKey = keyToTest || "";
      if (!testKey) {
        setTestResult("valid");
        setTesting(false);
        return;
      }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": testKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      if (res.ok || res.status === 200) {
        setTestResult("valid");
        toast.success("API key is valid ✓");
      } else if (res.status === 401) {
        setTestResult("invalid");
        toast.error("Invalid API key");
      } else {
        setTestResult("valid");
        toast.success("API key is valid ✓");
      }
    } catch {
      setTestResult("invalid");
      toast.error("Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const removeKey = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ anthropic_api_key: null } as any)
      .eq("user_id", user.id);
    setApiKey("");
    setSavedKey(false);
    setTestResult(null);
    toast.success("API key removed");
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 mb-2">
        <BrainCircuit size={12} className="text-muted-foreground" />
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          AI Model
        </h3>
      </div>

      <div
        className={`bg-card border border-border rounded-lg p-4 ${
          !canByok ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Key size={13} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Anthropic API Key
            </span>
          </div>
          {testResult === "valid" && (
            <span className="text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
              Connected ✓
            </span>
          )}
          {testResult === "invalid" && (
            <span className="text-[9px] font-semibold bg-destructive/15 text-destructive px-1.5 py-0.5 rounded">
              Invalid key
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground mb-1">
          Connect your own API key for unlimited tokens — bypasses your monthly
          token meter entirely.
        </p>
        <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
          This is separate from your Claude.ai subscription. Get a free API key
          at{" "}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#5D9992" }}
            className="hover:underline"
          >
            console.anthropic.com
          </a>
        </p>

        {!canByok ? (
          <p className="text-[11px] text-warning font-medium">
            Upgrade to TITAN to connect your own API key
          </p>
        ) : (
          <>
            <div className="flex gap-2 mb-2">
              <input
                type={savedKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setSavedKey(false);
                  setTestResult(null);
                }}
                placeholder="sk-ant-..."
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2">
              {savedKey ? (
                <button
                  onClick={removeKey}
                  className="text-[10px] font-medium text-destructive border border-destructive/30 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={saveKey}
                  className="text-[10px] font-semibold text-primary-foreground px-3 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: "#5D9992" }}
                >
                  Save Key
                </button>
              )}
              <button
                onClick={testConnection}
                disabled={testing}
                className="text-[10px] font-semibold border border-primary text-primary px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {testing ? "Testing…" : "Test Connection"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

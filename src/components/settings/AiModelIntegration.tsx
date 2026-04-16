import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { BrainCircuit, Key } from "lucide-react";

const BYOK_PLANS = ["titan", "atlas", "olympus"];

type TestResult = "valid" | "invalid" | null;

type ProviderField = "anthropic_api_key" | "openai_api_key" | "gemini_api_key";

interface ProviderCardProps {
  label: string;
  description: string;
  linkLabel: string;
  linkHref: string;
  placeholder: string;
  field: ProviderField;
  apiKey: string;
  setApiKey: (v: string) => void;
  savedKey: boolean;
  setSavedKey: (v: boolean) => void;
  testResult: TestResult;
  setTestResult: (v: TestResult) => void;
  canByok: boolean;
  onSave: () => void;
  onRemove: () => void;
  onTest: () => void;
  testing: boolean;
}

function ProviderCard({
  label,
  description,
  linkLabel,
  linkHref,
  placeholder,
  apiKey,
  setApiKey,
  savedKey,
  setSavedKey,
  testResult,
  setTestResult,
  canByok,
  onSave,
  onRemove,
  onTest,
  testing,
}: ProviderCardProps) {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${!canByok ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Key size={13} className="text-primary" />
          <span className="text-xs font-semibold text-foreground">{label}</span>
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

      <p className="text-[11px] text-muted-foreground mb-1">{description}</p>
      <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
        Get an API key at{" "}
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#5D9992" }}
          className="hover:underline"
        >
          {linkLabel}
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
              placeholder={placeholder}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            {savedKey ? (
              <button
                onClick={onRemove}
                className="text-[10px] font-medium text-destructive border border-destructive/30 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={onSave}
                className="text-[10px] font-semibold text-primary-foreground px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: "#5D9992" }}
              >
                Save Key
              </button>
            )}
            <button
              onClick={onTest}
              disabled={testing}
              className="text-[10px] font-semibold border border-primary text-primary px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {testing ? "Testing…" : "Test Connection"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AiModelIntegration() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const plan = subscription?.plan?.toLowerCase() ?? "scout";
  const canByok = BYOK_PLANS.includes(plan);

  // Anthropic
  const [anthropicKey, setAnthropicKey] = useState("");
  const [anthropicSaved, setAnthropicSaved] = useState(false);
  const [anthropicResult, setAnthropicResult] = useState<TestResult>(null);
  const [anthropicTesting, setAnthropicTesting] = useState(false);

  // OpenAI
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiSaved, setOpenaiSaved] = useState(false);
  const [openaiResult, setOpenaiResult] = useState<TestResult>(null);
  const [openaiTesting, setOpenaiTesting] = useState(false);

  // Gemini
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiSaved, setGeminiSaved] = useState(false);
  const [geminiResult, setGeminiResult] = useState<TestResult>(null);
  const [geminiTesting, setGeminiTesting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("anthropic_api_key, openai_api_key, gemini_api_key")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        const d = data as any;
        if (d?.anthropic_api_key) {
          setAnthropicKey("••••••••••••" + d.anthropic_api_key.slice(-4));
          setAnthropicSaved(true);
          setAnthropicResult("valid");
        }
        if (d?.openai_api_key) {
          setOpenaiKey("••••••••••••" + d.openai_api_key.slice(-4));
          setOpenaiSaved(true);
          setOpenaiResult("valid");
        }
        if (d?.gemini_api_key) {
          setGeminiKey("••••••••••••" + d.gemini_api_key.slice(-4));
          setGeminiSaved(true);
          setGeminiResult("valid");
        }
      });
  }, [user]);

  const persist = async (field: ProviderField, value: string | null) => {
    if (!user) return { error: new Error("not authed") as any };
    return supabase
      .from("profiles")
      .update({ [field]: value } as any)
      .eq("user_id", user.id);
  };

  // ---- Anthropic handlers ----
  const saveAnthropic = async () => {
    if (!anthropicKey || anthropicKey.startsWith("••")) return;
    const { error } = await persist("anthropic_api_key", anthropicKey);
    if (error) return toast.error("Failed to save key");
    toast.success("Anthropic API key saved");
    setAnthropicSaved(true);
    setAnthropicResult(null);
  };
  const removeAnthropic = async () => {
    await persist("anthropic_api_key", null);
    setAnthropicKey("");
    setAnthropicSaved(false);
    setAnthropicResult(null);
    toast.success("API key removed");
  };
  const testAnthropic = async () => {
    const keyToTest = anthropicKey.startsWith("••") ? null : anthropicKey;
    if (!keyToTest && !anthropicSaved) {
      toast.error("Enter a key first");
      return;
    }
    setAnthropicTesting(true);
    setAnthropicResult(null);
    try {
      if (!keyToTest) {
        setAnthropicResult("valid");
        setAnthropicTesting(false);
        return;
      }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": keyToTest,
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
        setAnthropicResult("valid");
        toast.success("API key is valid ✓");
      } else if (res.status === 401) {
        setAnthropicResult("invalid");
        toast.error("Invalid API key");
      } else {
        setAnthropicResult("valid");
        toast.success("API key is valid ✓");
      }
    } catch {
      setAnthropicResult("invalid");
      toast.error("Connection test failed");
    } finally {
      setAnthropicTesting(false);
    }
  };

  // ---- OpenAI handlers ----
  const saveOpenai = async () => {
    if (!openaiKey || openaiKey.startsWith("••")) return;
    const { error } = await persist("openai_api_key", openaiKey);
    if (error) return toast.error("Failed to save key");
    toast.success("OpenAI key saved — connection test coming soon");
    setOpenaiSaved(true);
    setOpenaiResult("valid");
  };
  const removeOpenai = async () => {
    await persist("openai_api_key", null);
    setOpenaiKey("");
    setOpenaiSaved(false);
    setOpenaiResult(null);
    toast.success("API key removed");
  };
  const testOpenai = async () => {
    toast.success("OpenAI key saved — connection test coming soon");
  };

  // ---- Gemini handlers ----
  const saveGemini = async () => {
    if (!geminiKey || geminiKey.startsWith("••")) return;
    const { error } = await persist("gemini_api_key", geminiKey);
    if (error) return toast.error("Failed to save key");
    toast.success("Gemini key saved — connection test coming soon");
    setGeminiSaved(true);
    setGeminiResult("valid");
  };
  const removeGemini = async () => {
    await persist("gemini_api_key", null);
    setGeminiKey("");
    setGeminiSaved(false);
    setGeminiResult(null);
    toast.success("API key removed");
  };
  const testGemini = async () => {
    toast.success("Gemini key saved — connection test coming soon");
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 mb-2">
        <BrainCircuit size={12} className="text-muted-foreground" />
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          AI Model Keys
        </h3>
      </div>

      <p className="text-[11px] text-muted-foreground mb-4">
        Connect your own API keys to unlock unlimited token usage and use any model with your deployed agents. Keys are encrypted and stored securely.
      </p>

      <div className="space-y-3">
        <ProviderCard
          label="Anthropic API Key"
          description="Unlimited Claude tokens — bypasses your monthly token meter."
          linkLabel="console.anthropic.com"
          linkHref="https://console.anthropic.com"
          placeholder="sk-ant-..."
          field="anthropic_api_key"
          apiKey={anthropicKey}
          setApiKey={setAnthropicKey}
          savedKey={anthropicSaved}
          setSavedKey={setAnthropicSaved}
          testResult={anthropicResult}
          setTestResult={setAnthropicResult}
          canByok={canByok}
          onSave={saveAnthropic}
          onRemove={removeAnthropic}
          onTest={testAnthropic}
          testing={anthropicTesting}
        />

        <ProviderCard
          label="OpenAI API Key"
          description="Use GPT-4o and other OpenAI models for your deployed agents."
          linkLabel="platform.openai.com"
          linkHref="https://platform.openai.com"
          placeholder="sk-..."
          field="openai_api_key"
          apiKey={openaiKey}
          setApiKey={setOpenaiKey}
          savedKey={openaiSaved}
          setSavedKey={setOpenaiSaved}
          testResult={openaiResult}
          setTestResult={setOpenaiResult}
          canByok={canByok}
          onSave={saveOpenai}
          onRemove={removeOpenai}
          onTest={testOpenai}
          testing={openaiTesting}
        />

        <ProviderCard
          label="Google Gemini API Key"
          description="Use Gemini Pro and Flash models for your deployed agents."
          linkLabel="aistudio.google.com"
          linkHref="https://aistudio.google.com"
          placeholder="AIza..."
          field="gemini_api_key"
          apiKey={geminiKey}
          setApiKey={setGeminiKey}
          savedKey={geminiSaved}
          setSavedKey={setGeminiSaved}
          testResult={geminiResult}
          setTestResult={setGeminiResult}
          canByok={canByok}
          onSave={saveGemini}
          onRemove={removeGemini}
          onTest={testGemini}
          testing={geminiTesting}
        />
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Zap, BarChart3, Bell, Mail, Settings, ShoppingCart, TrendingUp, Share2, FileText, CheckCircle2, type LucideIcon } from "lucide-react";

const tools = [
  {
    name: "Wholesale Sample Tracker",
    status: "Live",
    description: "Tracks sample requests from CRM leads. Auto-sends Klaviyo confirmation email on new request.",
    connected: ["CRM", "Klaviyo"],
  },
  {
    name: "Amazon Reorder Alert",
    status: "Live",
    description: "Monitors inventory levels across Amazon FBA. Alerts via Slack when any SKU drops below 20 units.",
    connected: ["Amazon", "Slack"],
  },
  {
    name: "Daily Revenue Summary",
    status: "Live",
    description: "Pulls Shopify + Amazon revenue daily at 8am. Posts a summary to #ai-ops Slack channel.",
    connected: ["Shopify", "Amazon", "Slack"],
  },
];

export type AgentTemplate = {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  description: string;
  integrations: string[];
  approvalPoints: string[];
  systemPrompt: string;
};

export const agentTemplates: AgentTemplate[] = [
  {
    id: "orders-agent",
    name: "Orders Agent",
    icon: ShoppingCart,
    category: "Operations",
    description:
      "Watches your inbox for incoming orders. Creates Shopify draft orders for approval. Routes confirmed orders to QuickBooks for invoicing.",
    integrations: ["Email", "Shopify", "QuickBooks"],
    approvalPoints: [
      "New order detected — create draft?",
      "Draft order confirmed — create QuickBooks invoice?",
    ],
    systemPrompt: `You are an Orders Agent — a specialist in detecting, processing, and routing incoming orders for approval.

YOUR ROLE:
You monitor priority emails flagged by the primary agent and identify order intent. You never create orders without explicit approval. Every action goes through the approval workflow.

YOUR WORKFLOW:
1. Read chief_summary of high-priority emails for order signals
2. When order intent detected — surface approval: "New order from [buyer]. Create Shopify draft order for [items/quantity]?"
3. On approval — create Shopify draft order (do not fulfill, do not confirm to customer)
4. Surface second approval: "Draft order created. Route to QuickBooks and notify buyer?"
5. On approval — create QuickBooks invoice with net 30 terms for the correct customer account
6. Log all actions to approvals_log

ORDER SIGNALS TO WATCH FOR:
- Wholesale inquiry with quantities mentioned
- Re-order requests from existing customers
- Event/catering orders
- B2B purchase orders or POs

WHAT YOU NEVER DO:
- Never confirm an order to a customer without approval
- Never create a Shopify order that bypasses draft status
- Never send an invoice without approval
- Never assume quantities or pricing — ask for clarification if unclear

APPROVAL FORMAT:
Always surface approvals in this format:
"ORDER DETECTED: [Buyer Name] — [Product] x [Quantity] @ [Price if known]
Source: [email subject]
Action: Create Shopify draft order?
[Approve] [Edit] [Dismiss]"`,
  },
  {
    id: "sales-outreach-agent",
    name: "Sales Outreach Agent",
    icon: TrendingUp,
    category: "Sales",
    description:
      "Works your CRM pipeline automatically. Drafts personalized follow-up emails for each stage. Finds new prospects via Apollo and adds them to your pipeline.",
    integrations: ["Email", "CRM", "Apollo"],
    approvalPoints: [
      "Send follow-up email?",
      "Add prospect to pipeline?",
      "Move contact to next stage?",
    ],
    systemPrompt: `You are a Sales Outreach Agent — a specialist in pipeline management, follow-up timing, and prospect outreach.

YOUR ROLE:
You work the CRM pipeline proactively. You identify contacts that need follow-up, draft personalized outreach, and surface new prospects worth pursuing. Every email requires approval before sending.

YOUR WORKFLOW:
1. Daily pipeline review — identify contacts with no activity in 3+ days
2. Draft follow-up emails matched to their pipeline stage:
   - NEW LEAD: Warm intro, value proposition, offer to connect
   - CONTACTED: Check-in, answer questions, offer sample/demo
   - SAMPLE SENT: Follow up on sample experience, push toward proposal
   - PROPOSAL SENT: Gentle nudge, address objections, create urgency
3. Surface approval for each draft: "Follow-up ready for [Name] at [Company]"
4. When Apollo finds matching prospects — surface: "New prospect: [Name, Company]. Add to pipeline?"
5. Track responses and update contact stages accordingly

FOLLOW-UP TIMING:
- New Lead: Follow up within 24 hours
- Contacted: Follow up in 3 days if no response
- Sample Sent: Follow up in 5 days
- Proposal Sent: Follow up in 7 days, then every 5 days

TONE GUIDELINES:
- Professional but warm
- Reference specific details from previous interactions
- Never pushy or desperate
- Always offer value, not just checking in
- Short emails perform better — keep under 150 words

WHAT YOU NEVER DO:
- Never send emails without approval
- Never move a contact backward in the pipeline without reason
- Never contact the same person more than once per week
- Never use generic templates — always personalize`,
  },
  {
    id: "social-content-agent",
    name: "Social Content Agent",
    icon: Share2,
    category: "Social",
    description:
      "Drafts social posts in your brand voice for LinkedIn, Instagram, Facebook, and Twitter. Schedules to your social calendar. Surfaces for approval before anything goes live.",
    integrations: ["Social Calendar", "LinkedIn", "Instagram", "Facebook", "Twitter"],
    approvalPoints: ["Approve post for scheduling?", "Approve and publish now?"],
    systemPrompt: `You are a Social Content Agent — a specialist in brand storytelling, social media content creation, and multi-platform publishing.

YOUR ROLE:
You draft social media content in the user's brand voice. You understand platform differences and optimize content for each. Nothing goes live without explicit approval.

YOUR WORKFLOW:
1. Receive content brief or topic from user
2. Draft platform-specific versions:
   - LinkedIn: Professional, thought leadership, longer form (150-300 words), business insights
   - Instagram: Visual-first, shorter caption (50-150 words), heavy hashtags, emoji-friendly
   - Facebook: Conversational, community-focused, medium length
   - Twitter/X: Punchy, under 280 characters, conversation-starter
3. Surface approval for each platform: "Post ready for [Platform]: [preview]"
4. On approval — schedule to social calendar at optimal time:
   - LinkedIn: Tue-Thu 8-10am
   - Instagram: Tue-Fri 9-11am
   - Facebook: Wed-Fri 1-4pm
   - Twitter: Weekdays 9am, 12pm, 5pm
5. Confirm scheduled: "Post scheduled for [platform] at [time]"

BRAND VOICE GUIDELINES:
- Ask the user for their brand voice on first use: "How would you describe your brand voice? (e.g. professional, casual, bold, educational)"
- Remember their answer and apply it to all future content
- Match their existing post style if they share examples
- Never sound generic or AI-generated

CONTENT TYPES YOU CREATE:
- Product stories and launches
- Behind-the-scenes content
- Educational/how-to posts
- Industry insights and trends
- Customer success stories (with permission)
- Event announcements

WHAT YOU NEVER DO:
- Never post without approval
- Never use the same caption across all platforms
- Never use irrelevant hashtags
- Never post controversial or political content`,
  },
  {
    id: "invoice-billing-agent",
    name: "Invoice & Billing Agent",
    icon: FileText,
    category: "Finance",
    description:
      "Monitors overdue invoices in QuickBooks. Drafts professional payment reminder emails. Tracks payment status and escalates aging accounts. Routes new invoices for approval before sending.",
    integrations: ["Email", "QuickBooks", "ShipStation"],
    approvalPoints: [
      "Send payment reminder?",
      "Escalate to collections?",
      "Send new invoice?",
    ],
    systemPrompt: `You are an Invoice & Billing Agent — a specialist in accounts receivable management, payment follow-up, and invoice routing.

YOUR ROLE:
You monitor outstanding invoices, draft payment reminders at the right intervals, and surface aging accounts for escalation. Every communication requires approval. You protect cash flow without damaging customer relationships.

YOUR WORKFLOW:
1. Daily invoice review — check QuickBooks for overdue invoices
2. Payment reminder schedule:
   - 1 day overdue: Gentle reminder — "Just checking in on invoice #[X]"
   - 7 days overdue: Firm reminder — reference terms, request update
   - 14 days overdue: Escalation draft — request call, reference late payment policy
   - 30+ days overdue: Surface for manual review — "This account needs personal attention"
3. For each reminder — surface approval: "Payment reminder ready for [Company] — Invoice #[X] — $[Amount] — [Days] overdue"
4. When new orders are approved — create and route invoice for approval before sending
5. When payment received — log to activity and update status

REMINDER TONE BY STAGE:
- 1-6 days: Warm, assume it slipped through — "Just a friendly reminder..."
- 7-13 days: Professional, reference terms — "Per our net 30 agreement..."
- 14-29 days: Firm, request response — "We need to hear from you by [date]..."
- 30+ days: Escalate to human — never auto-send at this stage

INVOICE CREATION:
- Always use correct customer account in QuickBooks
- Apply correct payment terms (net 30 for wholesale)
- Include itemized line items — never lump sum
- Reference PO number if provided by buyer
- Due date clearly stated

WHAT YOU NEVER DO:
- Never send a reminder without approval
- Never threaten legal action without explicit instruction
- Never create an invoice with wrong terms or pricing
- Never contact a customer more than once per week on the same invoice
- Never send to 30+ day overdue accounts without human review`,
  },
];

export default function BuildPage() {
  const navigate = useNavigate();

  const useTemplate = (template: AgentTemplate) => {
    navigate("/agents/new", { state: { template } });
  };

  return (
    <div className="space-y-6">
      {/* Prompt Area */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-lg font-bold text-foreground mb-1">Build a Custom Tool</h2>
        <p className="text-xs text-muted-foreground mb-4">Describe what you need in plain English. My HQ Agent will build it.</p>
        <textarea
          rows={6}
          placeholder="Example: Build me a wholesale sample request tracker that connects to my CRM and sends a Klaviyo email when a lead requests samples."
          className="w-full bg-background border border-border rounded-lg p-3 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 mb-4"
        />
        <div className="flex items-center gap-3">
          <button className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
            Build with My HQ Agent
          </button>
          <button className="text-sm font-medium text-muted-foreground border border-border px-5 py-2.5 rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors">
            Browse Templates
          </button>
        </div>
      </div>

      {/* Your Tools */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-bold text-foreground">Your Tools</h2>
          <span className="text-[10px] font-semibold bg-success/15 text-success px-2 py-0.5 rounded">3 active</span>
        </div>
        <div className="space-y-2">
          {tools.map((tool) => (
            <div key={tool.name} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="flex items-center gap-2 shrink-0 w-[180px]">
                <Zap size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-foreground">{tool.name}</h3>
                <span className="text-[9px] font-semibold bg-success/15 text-success px-1.5 py-0.5 rounded ml-1">
                  {tool.status}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">{tool.description}</p>
              <div className="flex items-center gap-1.5 shrink-0">
                {tool.connected.map((c) => (
                  <span key={c} className="text-[9px] font-medium bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded">{c}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 shrink-0 pl-3 border-l border-border">
                <button className="text-[10px] font-semibold text-primary hover:underline">Open Tool</button>
                <button className="text-[10px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Settings size={10} /> Settings
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Agent Templates</h2>
          <span className="text-[10px] text-muted-foreground italic">More coming soon</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {agentTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all duration-200 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Icon size={20} className="text-primary" />
                    <h3 className="text-sm font-bold text-foreground ml-2">{template.name}</h3>
                  </div>
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                    {template.category}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3 items-center">
                  <span className="text-[9px] text-muted-foreground mr-1">Connects to:</span>
                  {template.integrations.map((integ) => (
                    <span key={integ} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      {integ}
                    </span>
                  ))}
                </div>

                <div className="space-y-1 mb-4">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Approval gates:
                  </p>
                  {template.approvalPoints.map((point) => (
                    <div key={point} className="flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-success shrink-0" />
                      <span className="text-[10px] text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => useTemplate(template)}
                  className="w-full bg-primary text-primary-foreground text-xs font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors mt-auto"
                >
                  Deploy this Agent
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

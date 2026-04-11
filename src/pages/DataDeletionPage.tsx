import LandingNav from "@/components/landing/LandingNav";
import FooterSection from "@/components/landing/FooterSection";

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-3xl font-bold mb-2">Data Deletion Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Effective Date: April 11, 2026</p>

          <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Your Right to Delete</h2>
              <p>You have the right to request deletion of your personal data at any time. When you delete your MYTHOS HQ account, we will remove your personal information from our systems in accordance with this policy and applicable laws.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">How to Delete Your Data</h2>
              <p className="mb-3">You can request data deletion in two ways:</p>
              <div className="space-y-3">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-foreground font-medium mb-1">Self-Service</p>
                  <p>Navigate to <span className="text-foreground font-medium">Settings → Account → Delete Account</span> in your MYTHOS HQ dashboard. Follow the confirmation steps to permanently delete your account and associated data.</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-foreground font-medium mb-1">Email Request</p>
                  <p>Send a deletion request to <a href="mailto:privacy@mythoshq.io" className="text-primary hover:underline">privacy@mythoshq.io</a> from the email address associated with your account. We will verify your identity and process the request within 30 days.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">What Gets Deleted</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your account profile and credentials</li>
                <li>All content you created (posts, drafts, campaigns)</li>
                <li>AI agent configurations and conversation history</li>
                <li>Contact lists and CRM data</li>
                <li>Connected integration tokens and settings</li>
                <li>Usage analytics tied to your account</li>
                <li>Team memberships and permissions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">What We Retain</h2>
              <p className="mb-2">Certain data may be retained after account deletion as required by law or for legitimate business purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Financial transaction records (required for tax and accounting compliance)</li>
                <li>Anonymized, aggregated analytics data that cannot identify you</li>
                <li>Records required to comply with legal obligations or resolve disputes</li>
                <li>Data in encrypted backups (automatically purged within 90 days)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Third-Party Data</h2>
              <p>When you connect third-party services (Gmail, Shopify, Slack, etc.), data synced from those services is deleted from MYTHOS HQ upon account deletion. However, we cannot delete data stored by those third-party services — you must contact them directly to request deletion from their systems.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Deletion Timeline</h2>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-card border-b border-border">
                      <th className="text-left px-4 py-2.5 text-foreground font-semibold">Data Type</th>
                      <th className="text-left px-4 py-2.5 text-foreground font-semibold">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr><td className="px-4 py-2.5">Account profile & credentials</td><td className="px-4 py-2.5">Immediate</td></tr>
                    <tr><td className="px-4 py-2.5">Content, agents, conversations</td><td className="px-4 py-2.5">Within 24 hours</td></tr>
                    <tr><td className="px-4 py-2.5">Integration tokens</td><td className="px-4 py-2.5">Immediate (revoked)</td></tr>
                    <tr><td className="px-4 py-2.5">Usage analytics</td><td className="px-4 py-2.5">Within 7 days</td></tr>
                    <tr><td className="px-4 py-2.5">Encrypted backups</td><td className="px-4 py-2.5">Within 90 days</td></tr>
                    <tr><td className="px-4 py-2.5">Financial records</td><td className="px-4 py-2.5">Retained per legal requirements</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Confirmation</h2>
              <p>After your data has been deleted, you will receive a confirmation email at your registered email address. If you do not receive confirmation within 30 days of your request, please contact us.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Contact</h2>
              <p>For questions about data deletion or to submit a request, contact us at <a href="mailto:privacy@mythoshq.io" className="text-primary hover:underline">privacy@mythoshq.io</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}

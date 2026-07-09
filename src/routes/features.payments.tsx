import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { CreditCard, Banknote, ShieldAlert, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/features/payments")({
  head: () =>
    getSeoTags({
      title: "Gym Payment & Billing Software | RepOne",
      description:
        "Approve, track, and manage member payments without spreadsheets or WhatsApp screenshots.",
      path: "/features/payments",
      schema: schemaHelpers.faq([
        {
          question: "How do members pay for their plans?",
          answer: "Members can select online payment options like Razorpay or log bank transfer transactions directly in their portal for manual approval.",
        },
      ]),
    }),
  component: PaymentsFeaturePage,
});

function PaymentsFeaturePage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Billing Automation</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Gym Payment & <br />
            <span className="italic text-[#BEFF00]">Billing Software.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Reconcile payments dynamically. Protect your gym's recurring revenue stream by replacing manual bank audits and tracking spreadsheets.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center my-16">
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold">Secure recurring gym collections</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Manual bank transfer checks are slow and prone to audit mistakes. RepOne streamlines billing with instant digital receipts, payment status tracking, and receipt verification pipelines.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Integrated Razorpay payment gateways.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Manual UTR number verification log.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Instant PDF invoice downloads for member tax filing.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Automated Billing Pipeline</h4>
                <p className="text-xs text-muted-foreground mt-1">Generate invoices and reconcile payments in one unified accounting ledger.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Visual Verification Console</h4>
                <p className="text-xs text-muted-foreground mt-1">Staff approve, reject, or request changes on receipt uploads in a single click.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Unpaid Check-In Alerts</h4>
                <p className="text-xs text-muted-foreground mt-1">If a member attempts to check in with outstanding bills, reception staff receive immediate screen cues.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-16 border-t border-border pt-12">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
          >
            Book a Gym Billing Demo Call
          </Link>
        </footer>
      </div>
    </MarketingLayout>
  );
}

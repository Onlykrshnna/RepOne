import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { ShieldCheck, UserCheck, Trash2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/features/membership-management")({
  head: () =>
    getSeoTags({
      title: "Gym Membership Management Software | RepOne",
      description:
        "Automate membership tracking, renewals, and plans in one dashboard.",
      path: "/features/membership-management",
      schema: schemaHelpers.faq([
        {
          question: "Can members freeze their memberships?",
          answer: "Yes, membership statuses can be paused or suspended directly by administrators on the dashboard settings.",
        },
      ]),
    }),
  component: MembershipManagementPage,
});

function MembershipManagementPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Member Operations</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Gym Membership <br />
            <span className="italic text-[#BEFF00]">Management Software.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            From registration on-boarding to profile updates, manage active counts, duration tiers, couples memberships, and renewals automatically.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center my-16">
          <div className="bg-card border border-border p-8 rounded-2xl space-y-6 order-last md:order-first">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Flexible Access Rules</h4>
                <p className="text-xs text-muted-foreground mt-1">Restrict access automatically when packages expire or freeze accounts without database latency.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Member Profiles Portal</h4>
                <p className="text-xs text-muted-foreground mt-1">Allow members to view active plans, remaining days, payment history, and attendance records.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Onboarding Forms</h4>
                <p className="text-xs text-muted-foreground mt-1">Capture member agreements and health waivers during online signup.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold">Simplify member administration</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Stop manually tracking renewals on spreadsheets. RepOne keeps a clean history of every member's active plan status, remaining check-ins, and invoice records.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Automated alerts when memberships are close to expiry.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Custom tier setup (1 Month, 3 Months, Annual, Couples).</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Bulk importing tool for rapid client data transition.</span>
              </li>
            </ul>
          </div>
        </div>

        <footer className="text-center mt-16 border-t border-border pt-12">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
          >
            Schedule a Demo Call
          </Link>
        </footer>
      </div>
    </MarketingLayout>
  );
}

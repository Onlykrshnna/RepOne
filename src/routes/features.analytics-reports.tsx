import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { LayoutDashboard, TrendingUp, BarChart3, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/features/analytics-reports")({
  head: () =>
    getSeoTags({
      title: "Gym Analytics & Reports Dashboard | RepOne",
      description:
        "Revenue, retention, attendance, and growth analytics for gym owners.",
      path: "/features/analytics-reports",
      schema: schemaHelpers.faq([
        {
          question: "Can I export data from the dashboard?",
          answer: "Yes. All financial lists, member tables, and attendance sheets can be exported as Excel/CSV sheets for tax and accounting auditing.",
        },
      ]),
    }),
  component: AnalyticsFeaturePage,
});

function AnalyticsFeaturePage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Business Intelligence</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Gym Analytics & <br />
            <span className="italic text-[#BEFF00]">Reports Dashboard.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Obtain immediate visibility over monthly recurring revenue, customer churn trends, trainer splits, and capacity utilization.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center my-16">
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold">Data-driven business control</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Gut feeling is not enough to optimize a gym's expansion. RepOne organizes raw attendance logs, member profiles, and check-in updates into interactive visual reports.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Track active monthly recurring revenue (MRR) dynamically.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Predict churn risk through check-in volume alerts.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Monitor trainer hours and class booking fill rates.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Live Attendance Feed</h4>
                <p className="text-xs text-muted-foreground mt-1">See active hourly check-ins mapped visually to optimize staff schedules.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Revenue Forecasting</h4>
                <p className="text-xs text-muted-foreground mt-1">Estimate upcoming subscription renewal revenue automatically based on database logs.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">One-Click CSV Export</h4>
                <p className="text-xs text-muted-foreground mt-1">Download raw tabular sheets for custom reporting or sharing with accounting partners.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-16 border-t border-border pt-12">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
          >
            Request a Free Demo Call
          </Link>
        </footer>
      </div>
    </MarketingLayout>
  );
}

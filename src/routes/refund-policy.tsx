import { createFileRoute } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";

export const Route = createFileRoute("/refund-policy")({
  head: () =>
    getSeoTags({
      title: "Refund Policy | RepOne",
      description: "Read our cancellation policy and fee refund parameters for RepOne software subscriptions.",
      path: "/refund-policy",
    }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[700px] mx-auto px-6 font-sans">
        <header className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">Refund Policy</h1>
          <p className="text-muted-foreground text-xs">Last Updated: July 9, 2026</p>
        </header>

        <article className="prose dark:prose-invert text-xs leading-relaxed space-y-6 text-muted-foreground">
          <p className="text-foreground">
            We want you to be completely satisfied with RepOne. Read our subscription cancellation and refund policies below.
          </p>

          <h3 className="font-display text-base font-bold text-foreground mt-8">1. Free Setup</h3>
          <p>
            RepOne offers a free onboarding setup where you can build your portal configurations, verify integrations, and test check-ins before paying.
          </p>

          <h3 className="font-display text-base font-bold text-foreground mt-8">2. Monthly Subscriptions</h3>
          <p>
            Subscriptions are billed on a recurring monthly cycle. We do not issue partial refunds for mid-month plan cancelations; your access remains active until the end of the billing period.
          </p>

          <h3 className="font-display text-base font-bold text-foreground mt-8">3. Technical Downtime</h3>
          <p>
            If a major platform error or downtime prevents basic access log tracking for more than 48 consecutive hours, contact hello@repone.co to request account billing credits.
          </p>
        </article>
      </div>
    </MarketingLayout>
  );
}

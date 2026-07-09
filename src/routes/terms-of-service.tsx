import { createFileRoute } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";

export const Route = createFileRoute("/terms-of-service")({
  head: () =>
    getSeoTags({
      title: "Terms of Service | RepOne",
      description: "Read the terms, rules, and billing conditions for operating your gym using the RepOne system.",
      path: "/terms-of-service",
    }),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <MarketingLayout>
      <div className="max-w-[700px] mx-auto px-6 font-sans">
        <header className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-xs">Last Updated: July 9, 2026</p>
        </header>

        <article className="prose dark:prose-invert text-xs leading-relaxed space-y-6 text-muted-foreground">
          <p className="text-foreground">
            By signing up or deploying the RepOne operating system for your fitness facility, you agree to these service conditions.
          </p>

          <h3 className="font-display text-base font-bold text-foreground mt-8">1. License & Subdomains</h3>
          <p>
            We grant you a non-exclusive, revocable license to utilize the RepOne admin dashboard and member portal. Custom domain allocations remain valid for the duration of your active subscription.
          </p>

          <h3 className="font-display text-base font-bold text-foreground mt-8">2. Account Management & Compliance</h3>
          <p>
            You are responsible for ensuring that all member logs, waivers, and transaction records comply with regional regulations.
          </p>

          <h3 className="font-display text-base font-bold text-foreground mt-8">3. Fees & Cancelation</h3>
          <p>
            Subscription fees are charged monthly. You can upgrade, downgrade, or cancel your active plan at any time. Cancelations will suspend white-label services at the end of the billing period.
          </p>
        </article>
      </div>
    </MarketingLayout>
  );
}

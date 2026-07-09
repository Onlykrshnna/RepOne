import { createFileRoute } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    getSeoTags({
      title: "Privacy Policy | RepOne",
      description: "Learn how we collect, store, and protect your gym business and member data at RepOne.",
      path: "/privacy-policy",
    }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[700px] mx-auto px-6 font-sans">
        <header className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-xs">Last Updated: July 9, 2026</p>
        </header>

        <article className="prose dark:prose-invert text-xs leading-relaxed space-y-6 text-muted-foreground">
          <p className="text-foreground">
            At RepOne (powered by WebForge), we prioritize the privacy and security of your gym business data and your members' personal information.
          </p>

          <h3 className="font-display text-base font-bold text-foreground mt-8">1. Information We Collect</h3>
          <p>
            We collect profile parameters (names, emails, active membership details, check-in records) and transaction metadata necessary to run your gym portal operations.
          </p>

          <h3 className="font-display text-base font-bold text-foreground mt-8">2. How Data is Handled</h3>
          <p>
            Your database tables are hosted on secure Postgres servers (Supabase) with strict RLS (Row Level Security) configurations. We do not sell or share business information with third-party advertising networks.
          </p>

          <h3 className="font-display text-base font-bold text-foreground mt-8">3. Cookies</h3>
          <p>
            We use technical cookies to store active portal session keys. No tracking cookies are injected on your custom white-labeled member portal routes.
          </p>
        </article>
      </div>
    </MarketingLayout>
  );
}

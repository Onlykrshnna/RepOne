import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { useAuth } from "@/lib/auth-context";
import { tiers } from "@/constants";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () =>
    getSeoTags({
      title: "Pricing | RepOne Gym Management Software",
      description:
        "Transparent pricing for gyms of every size. No hidden fees. See plans and book a demo.",
      path: "/pricing",
      schema: schemaHelpers.pricing(tiers),
    }),
  component: PricingPage,
});

function PricingPage() {
  const { session, isLoading } = useAuth();

  return (
    <MarketingLayout>
      <header className="text-center max-w-3xl mx-auto px-6 mb-16">
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Gym Management <br />
          <span className="italic text-[#BEFF00] dark:text-[#BEFF00]">Software Pricing.</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Transparent, flat-rate pricing designed for fitness business owners. No hidden transaction fees. Scale your features as your member base grows.
        </p>
      </header>

      <section className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => {
            const isFeatured = tier.featured;
            return (
              <div
                key={tier.name}
                className={`flex flex-col p-8 rounded-2xl transition-all duration-300 border ${
                  isFeatured
                    ? "bg-[#BEFF00] text-[#080809] border-transparent shadow-xl shadow-[#BEFF00]/10 scale-105 relative z-10"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {isFeatured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                
                <h3 className="font-display text-2xl font-bold mb-2">{tier.name}</h3>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="font-display text-4xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className={`text-xs uppercase font-sans font-semibold ${isFeatured ? "text-[#080809]/60" : "text-muted-foreground"}`}>
                      /{tier.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isFeatured ? "text-[#080809]" : "text-primary"}`} />
                      <span className="text-sm font-sans leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.name === "Enterprise" ? (
                  <Link
                    to="/demo"
                    className={`block w-full text-center py-4 rounded-xl transition-colors font-bold uppercase text-[11px] tracking-widest ${
                      isFeatured
                        ? "bg-[#080809] text-[#BEFF00] hover:bg-white hover:text-[#080809]"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    Book Demo
                  </Link>
                ) : (
                  <Link
                    to={session ? "/dashboard" : "/signup"}
                    className={`block w-full text-center py-4 rounded-xl transition-colors font-bold uppercase text-[11px] tracking-widest ${
                      isFeatured
                        ? "bg-[#080809] text-[#BEFF00] hover:bg-white hover:text-[#080809]"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {isLoading ? "Loading..." : session ? "Go to Dashboard" : tier.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Frequently Asked Questions Section for FAQPage schema */}
      <section className="max-w-3xl mx-auto px-6 mt-32">
        <h2 className="font-display text-3xl font-bold text-center mb-12">Pricing FAQ</h2>
        <div className="space-y-6">
          <div className="border border-border rounded-xl p-6 bg-card">
            <h4 className="font-sans font-bold text-base mb-2">Are there any setup fees?</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">No. Setting up your RepOne profile and importing your member records is completely free.</p>
          </div>
          <div className="border border-border rounded-xl p-6 bg-card">
            <h4 className="font-sans font-bold text-base mb-2">Can I switch plans later?</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">Yes, you can upgrade or downgrade your plan at any time based on your current active member count.</p>
          </div>
          <div className="border border-border rounded-xl p-6 bg-card">
            <h4 className="font-sans font-bold text-base mb-2">Do you charge transaction fees on payments?</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">No. Unlike other platforms, RepOne does not charge transaction convenience fees on manual transfer checks or external collections.</p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

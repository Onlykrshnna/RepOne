import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/compare/repone-vs-zenplanner")({
  head: () =>
    getSeoTags({
      title: "RepOne vs Zen Planner: Gym Software Comparison",
      description:
        "Compare RepOne and Zen Planner side by side. See why RepOne is the preferred Zen Planner alternative.",
      path: "/compare/repone-vs-zenplanner",
    }),
  component: ZenPlannerComparePage,
});

function ZenPlannerComparePage() {
  return (
    <MarketingLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Competitor Audits</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Zen Planner <br />
            <span className="italic text-[#BEFF00]">Alternative.</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Zen Planner offers gym database tools, but its member portal designs feel outdated, and mobile check-in flows require dedicated scanner configurations.
          </p>
        </header>

        <section className="space-y-8 my-12">
          <h3 className="font-display text-2xl font-bold">The RepOne Advantage</h3>
          
          <div className="space-y-4">
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">1. Modern User Experience</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Zen Planner's portal layouts look outdated. RepOne features a modern, dark-mode-compatible UI built on clean typography and micro-animations.
              </p>
            </div>
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">2. Easy Mobile QR Scan Code</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Zen Planner relies on keyfobs or physical barcode readers. RepOne uses a secure, contactless camera scanner on the member's smartphone.
              </p>
            </div>
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">3. Flexible Branding Layouts</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                RepOne allows complete color, font, logo, and layout overrides. Zen Planner restricts portal branding changes.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-8 my-16">
          <h3 className="font-display text-xl font-bold text-center mb-8">Side-by-Side Comparison</h3>
          <div className="grid grid-cols-3 text-center text-xs font-semibold border-b border-border pb-4">
            <div className="text-left text-muted-foreground">Feature</div>
            <div className="text-primary font-bold">RepOne</div>
            <div className="text-muted-foreground">Zen Planner</div>
          </div>
          
          <div className="divide-y divide-border">
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">UX Design System</div>
              <div className="text-emerald-500 font-bold">Modern (Tailwind)</div>
              <div className="text-red-500 font-bold">Outdated UI</div>
            </div>
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">contactless Phone Check-In</div>
              <div className="text-emerald-500 font-bold"><Check className="w-4 h-4 inline" /> Yes</div>
              <div className="text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</div>
            </div>
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">Subdomain White-Labeling</div>
              <div className="text-emerald-500 font-bold"><Check className="w-4 h-4 inline" /> Yes</div>
              <div className="text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</div>
            </div>
          </div>
        </section>

        <footer className="text-center mt-12 pt-8 border-t border-border">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
          >
            Switch to RepOne Today
          </Link>
        </footer>
      </div>
    </MarketingLayout>
  );
}

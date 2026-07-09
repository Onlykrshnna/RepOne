import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { Check, X, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/compare/repone-vs-mindbody")({
  head: () =>
    getSeoTags({
      title: "RepOne vs Mindbody: Which Gym Software Is Right for You?",
      description:
        "Compare pricing, features, and ease of use between RepOne and Mindbody. Discover why RepOne is the preferred Mindbody alternative.",
      path: "/compare/repone-vs-mindbody",
    }),
  component: MindbodyComparePage,
});

function MindbodyComparePage() {
  return (
    <MarketingLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Competitor Audits</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Mindbody <br />
            <span className="italic text-[#BEFF00]">Alternative.</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Mindbody is a major industry incumbent, but high pricing, complex interfaces, and hidden transaction convenience fees leave many gym owners searching for a modern alternative.
          </p>
        </header>

        <section className="space-y-8 my-12">
          <h3 className="font-display text-2xl font-bold">Key Differences</h3>
          
          <div className="space-y-4">
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">1. Transparent Pricing vs Hidden Fees</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Mindbody plans start high and escalate with hidden transaction fees, add-on features, and platform convenience surcharges. RepOne offers simple, flat-rate pricing tiers based purely on active member volume.
              </p>
            </div>
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">2. Portal Branding</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Mindbody routes your members to their consumer-facing directory, cross-promoting competitors. RepOne is 100% white-labeled, ensuring members only interact with your custom logos, colors, and domains.
              </p>
            </div>
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">3. Lightweight Attendance Tracking</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Mindbody requires physical gate software and scanner terminal installations. RepOne runs a contactless 2-second QR scan interface on members' own smartphones.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-8 my-16">
          <h3 className="font-display text-xl font-bold text-center mb-8">Side-by-Side Comparison</h3>
          <div className="grid grid-cols-3 text-center text-xs font-semibold border-b border-border pb-4">
            <div className="text-left text-muted-foreground">Feature</div>
            <div className="text-primary font-bold">RepOne</div>
            <div className="text-muted-foreground">Mindbody</div>
          </div>
          
          <div className="divide-y divide-border">
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">Flat Monthly Subscription</div>
              <div className="text-emerald-500 font-bold"><Check className="w-4 h-4 inline" /> Yes</div>
              <div className="text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</div>
            </div>
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">White-Labeled Subdomain</div>
              <div className="text-emerald-500 font-bold"><Check className="w-4 h-4 inline" /> Yes</div>
              <div className="text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</div>
            </div>
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">No-Hardware QR Attendance</div>
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

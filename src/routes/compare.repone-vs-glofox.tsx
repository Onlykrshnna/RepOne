import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/compare/repone-vs-glofox")({
  head: () =>
    getSeoTags({
      title: "RepOne vs Glofox: Find the Best Gym Management System",
      description:
        "See how RepOne compares to Glofox on pricing, branding, and support. Find out why RepOne is the preferred Glofox alternative.",
      path: "/compare/repone-vs-glofox",
    }),
  component: GlofoxComparePage,
});

function GlofoxComparePage() {
  return (
    <MarketingLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Competitor Audits</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Glofox <br />
            <span className="italic text-[#BEFF00]">Alternative.</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Glofox provides gym software, but long contract commitments, complex setups, and lack of flexible payment workflows make it difficult for independent fitness business owners to grow.
          </p>
        </header>

        <section className="space-y-8 my-12">
          <h3 className="font-display text-2xl font-bold">Why Gym Owners Choose RepOne Over Glofox</h3>
          
          <div className="space-y-4">
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">1. No Annual Contracts</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Glofox frequently locks gyms into annual contracts with complex cancellation policies. RepOne offers flexible monthly subscriptions that you can pause or cancel at any time.
              </p>
            </div>
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">2. Localized Payment Workflows</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                RepOne is optimized for flexible collection models, featuring automated receipt logging and manual UTR confirmations alongside standard online payment gateways.
              </p>
            </div>
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">3. Responsive Platform Speed</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Glofox dashboard interfaces can feel heavy and slow. RepOne is built on TanStack's high-speed routing engine and lightning-fast database layouts.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-8 my-16">
          <h3 className="font-display text-xl font-bold text-center mb-8">Side-by-Side Comparison</h3>
          <div className="grid grid-cols-3 text-center text-xs font-semibold border-b border-border pb-4">
            <div className="text-left text-muted-foreground">Feature</div>
            <div className="text-primary font-bold">RepOne</div>
            <div className="text-muted-foreground">Glofox</div>
          </div>
          
          <div className="divide-y divide-border">
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">Contract Terms</div>
              <div className="text-emerald-500 font-bold">Flexible Monthly</div>
              <div className="text-red-500 font-bold">Annual Lock-In</div>
            </div>
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">Localized Payment Audit</div>
              <div className="text-emerald-500 font-bold"><Check className="w-4 h-4 inline" /> Yes</div>
              <div className="text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</div>
            </div>
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">100% White-Label Portal</div>
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
            Book a Free Demo Call
          </Link>
        </footer>

        <div className="border-t border-border pt-12 mt-12 mb-8 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-4">Compare Alternatives</span>
          <div className="flex justify-center gap-6 flex-wrap text-xs">
            <Link to="/compare/repone-vs-mindbody" className="text-primary hover:underline font-semibold">RepOne vs Mindbody &rarr;</Link>
            <Link to="/compare/repone-vs-zenplanner" className="text-primary hover:underline font-semibold">RepOne vs Zen Planner &rarr;</Link>
            <Link to="/compare/repone-vs-excel-whatsapp" className="text-primary hover:underline font-semibold">Spreadsheets vs RepOne &rarr;</Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

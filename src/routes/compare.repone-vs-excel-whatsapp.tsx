import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { X, Check } from "lucide-react";

export const Route = createFileRoute("/compare/repone-vs-excel-whatsapp")({
  head: () =>
    getSeoTags({
      title: "Still Running Your Gym on Excel and WhatsApp? | RepOne",
      description:
        "See what you're losing by managing your gym manually on spreadsheets and WhatsApp screenshots — and how RepOne fixes it.",
      path: "/compare/repone-vs-excel-whatsapp",
    }),
  component: ManualComparePage,
});

function ManualComparePage() {
  return (
    <MarketingLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Digitizing Operations</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Still Running Your Gym on <br />
            <span className="italic text-[#BEFF00]">Excel and WhatsApp?</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            It starts simple, but manual tracking leaks revenue, wastes staff hours, and frustrates members. See what you gain by digitizing your operations.
          </p>
        </header>

        <section className="space-y-8 my-12">
          <h3 className="font-display text-2xl font-bold">The Real Cost of Spreadsheet Tracking</h3>
          
          <div className="space-y-4">
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">1. Lost Revenue on Expiry Dates</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Staff can't crosscheck spreadsheets during busy hours. Expired members keep training for weeks, costing gyms thousands of Rupees in uncollected renewals.
              </p>
            </div>
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">2. Receipt Reconciliation Waste</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Checking WhatsApp chat histories for payment screenshots and matching bank transfers manually wastes hours of administration time weekly.
              </p>
            </div>
            <div className="border border-border p-6 rounded-xl bg-card">
              <h4 className="font-sans font-bold text-base mb-2">3. Unchecked Access Security</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Biometric failures or keyfob shares make attendance audits unreliable. RepOne's contactless QR scanning logs check-ins accurately.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-8 my-16">
          <h3 className="font-display text-xl font-bold text-center mb-8">Manual Systems vs RepOne</h3>
          <div className="grid grid-cols-3 text-center text-xs font-semibold border-b border-border pb-4">
            <div className="text-left text-muted-foreground">Logistics</div>
            <div className="text-primary font-bold">RepOne</div>
            <div className="text-muted-foreground">Excel & WhatsApp</div>
          </div>
          
          <div className="divide-y divide-border">
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">Automatic Expiry Locks</div>
              <div className="text-emerald-500 font-bold"><Check className="w-4 h-4 inline" /> Yes</div>
              <div className="text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</div>
            </div>
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">Digital Verification Pipeline</div>
              <div className="text-emerald-500 font-bold"><Check className="w-4 h-4 inline" /> Yes</div>
              <div className="text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</div>
            </div>
            <div className="grid grid-cols-3 py-4 text-xs">
              <div className="text-left font-medium">Real-Time Attendance Feed</div>
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
            Request a Free Digitization Walkthrough
          </Link>
        </footer>

        <div className="border-t border-border pt-12 mt-12 mb-8 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-4">Compare Alternatives</span>
          <div className="flex justify-center gap-6 flex-wrap text-xs">
            <Link to="/compare/repone-vs-mindbody" className="text-primary hover:underline font-semibold">RepOne vs Mindbody &rarr;</Link>
            <Link to="/compare/repone-vs-glofox" className="text-primary hover:underline font-semibold">RepOne vs Glofox &rarr;</Link>
            <Link to="/compare/repone-vs-zenplanner" className="text-primary hover:underline font-semibold">RepOne vs Zen Planner &rarr;</Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

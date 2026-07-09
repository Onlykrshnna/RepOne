import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { GitCompare, CheckCircle2, X } from "lucide-react";

export const Route = createFileRoute("/compare/")({
  head: () =>
    getSeoTags({
      title: "RepOne vs Mindbody, Glofox, & Zen Planner | RepOne",
      description:
        "Compare RepOne with Mindbody, Glofox, and Zen Planner to see which gym software fits your business. Transparent pricing, modern UX.",
      path: "/compare",
    }),
  component: CompareIndexPage,
});

const comparisonCards = [
  {
    title: "RepOne vs Mindbody",
    description: "Looking for a Mindbody alternative? Compare pricing structures, user experience, and transaction fee policies.",
    href: "/compare/repone-vs-mindbody",
  },
  {
    title: "RepOne vs Glofox",
    description: "Compare RepOne with Glofox side-by-side to review branding customizations and check-in support tools.",
    href: "/compare/repone-vs-glofox",
  },
  {
    title: "RepOne vs Zen Planner",
    description: "Find out how Zen Planner matches up against RepOne in tracking member attendance and billing reports.",
    href: "/compare/repone-vs-zenplanner",
  },
  {
    title: "Excel & WhatsApp vs RepOne",
    description: "Discover the hidden revenue leaks and time cost of running a fitness business on manual spreadsheets.",
    href: "/compare/repone-vs-excel-whatsapp",
  },
];

function CompareIndexPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Alternative Audits</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Compare Gym <br />
            <span className="italic text-[#BEFF00]">Management Software.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Finding the right operating system is critical to running a high-retention fitness business. See how RepOne compares to industry incumbents.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 my-12">
          {comparisonCards.map((card) => (
            <div key={card.title} className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div>
                <GitCompare className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-xs leading-normal mb-6">{card.description}</p>
              </div>
              <Link
                to={card.href}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                View Side-By-Side Comparison &rarr;
              </Link>
            </div>
          ))}
        </div>

        <section className="bg-card border border-border rounded-2xl p-8 my-16">
          <h3 className="font-display text-2xl font-bold text-center mb-8">At A Glance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 font-bold uppercase text-muted-foreground">Feature</th>
                  <th className="py-3 px-4 font-bold uppercase text-primary">RepOne</th>
                  <th className="py-3 px-4 font-bold uppercase text-muted-foreground">Incumbents</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-semibold">Flat-Rate Pricing (No hidden fees)</td>
                  <td className="py-3 px-4 text-emerald-500 font-bold"><CheckCircle2 className="w-4 h-4 inline" /> Yes</td>
                  <td className="py-3 px-4 text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-semibold">contactless 2-Second QR Scanner</td>
                  <td className="py-3 px-4 text-emerald-500 font-bold"><CheckCircle2 className="w-4 h-4 inline" /> Yes</td>
                  <td className="py-3 px-4 text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-semibold">100% White-Label Branding</td>
                  <td className="py-3 px-4 text-emerald-500 font-bold"><CheckCircle2 className="w-4 h-4 inline" /> Yes</td>
                  <td className="py-3 px-4 text-red-500 font-bold"><X className="w-4 h-4 inline" /> No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { LayoutDashboard, Users2, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/for-gym-chains")({
  head: () =>
    getSeoTags({
      title: "Enterprise Gym Software for Chains | RepOne",
      description:
        "Scale your fitness business with multi-location management, unified analytics, and enterprise controls.",
      path: "/for-gym-chains",
    }),
  component: ForGymChainsPage,
});

function ForGymChainsPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Multi-Location Brands</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Enterprise Gym Software <br />
            <span className="italic text-[#BEFF00]">built for Chains.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Unify multiple fitness centers under a single administrative umbrella. Access consolidated billing sheets, cross-location member permissions, and global analytics.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 my-16">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            <h3 className="font-display text-lg font-bold">Consolidated Dashboard</h3>
            <p className="text-muted-foreground text-xs leading-normal">
              Compare branch performance, revenue collections, and check-in volumes from one single analytics dashboard.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <Users2 className="w-8 h-8 text-primary" />
            <h3 className="font-display text-lg font-bold">Cross-Branch Check-Ins</h3>
            <p className="text-muted-foreground text-xs leading-normal">
              Members scan the entry QR at any of your physical gym locations, instantly logging cross-branch check-in approvals.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <Shield className="w-8 h-8 text-primary" />
            <h3 className="font-display text-lg font-bold">Enterprise Governance</h3>
            <p className="text-muted-foreground text-xs leading-normal">
              Establish role-based access permissions, log audit trails, and restrict database edit rights per staff member.
            </p>
          </div>
        </div>

        <section className="bg-card border border-border p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 my-16">
          <div>
            <h4 className="font-display text-xl font-bold mb-2">Ready to scale your gym brand?</h4>
            <p className="text-muted-foreground text-xs leading-normal max-w-md">Find out how RepOne's multi-tenant architecture powers fitness chains across regions.</p>
          </div>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-6 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest gap-2"
          >
            Request Enterprise Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </MarketingLayout>
  );
}

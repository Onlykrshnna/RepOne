import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { ShieldCheck, Dumbbell, Receipt, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/for-gym-owners")({
  head: () =>
    getSeoTags({
      title: "Gym Software Built for Gym Owners | RepOne",
      description:
        "Everything an independent gym owner needs to digitize operations — in one platform.",
      path: "/for-gym-owners",
    }),
  component: ForGymOwnersPage,
});

function ForGymOwnersPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Independent Gyms</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Gym Management Software <br />
            <span className="italic text-[#BEFF00]">for Small Businesses.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            RepOne provides absolute control over daily gym logistics, billing audits, member directories, and trainer timetables. Made to grow your single or double location business.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 my-16">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <Dumbbell className="w-8 h-8 text-primary" />
            <h3 className="font-display text-lg font-bold">Simplify Check-Ins</h3>
            <p className="text-muted-foreground text-xs leading-normal">
              Place a single QR scan sheet at your entrance counter. Verified members check in on their own phones instantly. No front desk queues.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <Receipt className="w-8 h-8 text-primary" />
            <h3 className="font-display text-lg font-bold">Control Billing Cycles</h3>
            <p className="text-muted-foreground text-xs leading-normal">
              Let RepOne flag expiring accounts and process subscription payments, keeping your collections unified in one central billing dashboard.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h3 className="font-display text-lg font-bold">Waiver & Profile Safeguards</h3>
            <p className="text-muted-foreground text-xs leading-normal">
              Capture health waivers and onboarding parameters during client setup, storing records securely under profile logs.
            </p>
          </div>
        </div>

        <section className="bg-card border border-border p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 my-16">
          <div>
            <h4 className="font-display text-xl font-bold mb-2">Ready to digitize your front desk?</h4>
            <p className="text-muted-foreground text-xs leading-normal max-w-md">Join hundreds of independent gym operators who cut their admin workload in half using RepOne.</p>
          </div>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-6 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest gap-2"
          >
            Book Free Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <div className="border-t border-border pt-12 mt-12 mb-16 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-4">Explore Solutions</span>
          <div className="flex justify-center gap-6 flex-wrap text-xs">
            <Link to="/for-boutique-studios" className="text-primary hover:underline font-semibold">Boutique Fitness Studios &rarr;</Link>
            <Link to="/for-gym-chains" className="text-primary hover:underline font-semibold">Enterprise Gym Chains &rarr;</Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

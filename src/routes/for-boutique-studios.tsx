import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { Calendar, Users, Sliders, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/for-boutique-studios")({
  head: () =>
    getSeoTags({
      title: "Software for Boutique Fitness Studios | RepOne",
      description:
        "Purpose-built for yoga, HIIT, Pilates, and CrossFit studios. Automate bookings and class capacities.",
      path: "/for-boutique-studios",
    }),
  component: ForBoutiqueStudiosPage,
});

function ForBoutiqueStudiosPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Boutique & Class-Based Studios</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Fitness Studio <br />
            <span className="italic text-[#BEFF00]">Management Software.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            RepOne is tailored for class-based boutique fitness studios. Manage yoga, Pilates, HIIT, strength training, and boxing schedules, allowing members to book classes or register on waitlists.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 my-16">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <Calendar className="w-8 h-8 text-primary" />
            <h3 className="font-display text-lg font-bold">Class Scheduling</h3>
            <p className="text-muted-foreground text-xs leading-normal">
              Publish structured timetables dynamically. Prevent over-booking by capping class capacity thresholds.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <Users className="w-8 h-8 text-primary" />
            <h3 className="font-display text-lg font-bold">Waitlist Automation</h3>
            <p className="text-muted-foreground text-xs leading-normal">
              If a class fills up, members can join a waitlist. RepOne dynamically promotes members if a registered spot opens up.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <Sliders className="w-8 h-8 text-primary" />
            <h3 className="font-display text-lg font-bold">Trainer Allocations</h3>
            <p className="text-muted-foreground text-xs leading-normal">
              Assign specific coaches or trainers to individual classes, showing their timetables and tracking client feedback logs.
            </p>
          </div>
        </div>

        <section className="bg-card border border-border p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 my-16">
          <div>
            <h4 className="font-display text-xl font-bold mb-2">Maximize class attendance</h4>
            <p className="text-muted-foreground text-xs leading-normal max-w-md">See how RepOne simplifies group class reservations, waitlists, and coach payouts.</p>
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
            <Link to="/for-gym-owners" className="text-primary hover:underline font-semibold">Independent Gym Owners &rarr;</Link>
            <Link to="/for-gym-chains" className="text-primary hover:underline font-semibold">Enterprise Gym Chains &rarr;</Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

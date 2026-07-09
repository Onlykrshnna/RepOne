import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { Heart, Target, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () =>
    getSeoTags({
      title: "About WebForge and the RepOne Platform Mission",
      description:
        "Learn about the mission behind RepOne — built by WebForge to automate gym administration and operations.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Our Story</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            About <br />
            <span className="italic text-[#BEFF00]">RepOne.</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            RepOne was conceived by WebForge with a single goal: to build a premium, frictionless operating system for independent gym owners and boutique fitness studios.
          </p>
        </header>

        <section className="space-y-12 my-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Target className="w-8 h-8 text-primary" />
              <h4 className="font-bold text-sm">Our Mission</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                To simplify administrative workflows so that gym owners can focus on what matters most: training and building communities.
              </p>
            </div>
            <div className="space-y-3">
              <Lightbulb className="w-8 h-8 text-primary" />
              <h4 className="font-bold text-sm">Our Philosophy</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                We believe that gym software should be simple, lightning-fast, and completely brand-customizable to reflect the gym's unique identity.
              </p>
            </div>
            <div className="space-y-3">
              <Heart className="w-8 h-8 text-primary" />
              <h4 className="font-bold text-sm">Our Integrity</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                No contracts, transparent pricing, and zero transaction fees on your manual check collections or online transactions.
              </p>
            </div>
          </div>
        </section>

        <footer className="text-center mt-16 pt-8 border-t border-border">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
          >
            Learn More in a Demo Call
          </Link>
        </footer>
      </div>
    </MarketingLayout>
  );
}

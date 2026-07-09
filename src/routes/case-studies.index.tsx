import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { caseStudies } from "@/content/case-studies";
import { ArrowRight, Trophy } from "lucide-react";

export const Route = createFileRoute("/case-studies/")({
  head: () =>
    getSeoTags({
      title: "B2B Gym Operations Case Studies & Results | RepOne",
      description:
        "Explore how gyms and fitness centers modernized check-ins, automated payments, and reduced churn with RepOne.",
      path: "/case-studies",
    }),
  component: CaseStudiesIndexPage,
});

function CaseStudiesIndexPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Customer Success</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Gym Owner <br />
            <span className="italic text-[#BEFF00]">Case Studies.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Real success stories from fitness facility managers and studio owners who digitized workflows and optimized client retentions.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 my-12">
          {caseStudies.map((study) => (
            <article key={study.slug} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-300">
              <div>
                <img
                  src={study.featured_image}
                  alt={study.title}
                  className="w-full h-48 object-cover border-b border-border"
                />
                <div className="p-6 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary text-[9px] font-bold uppercase tracking-widest">
                    <Trophy className="w-3 h-3" /> {study.metrics}
                  </div>
                  <h3 className="font-display text-lg font-bold leading-tight">{study.title}</h3>
                  <p className="text-muted-foreground text-xs leading-normal">{study.meta_description}</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link
                  to="/case-studies/$slug"
                  params={{ slug: study.slug }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  Read Case Study <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}

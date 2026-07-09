import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { caseStudies } from "@/content/case-studies";
import { Calendar, User, ArrowLeft, Star, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: ({ params }) => {
    const study = caseStudies.find((s) => s.slug === params.slug);
    if (!study) {
      throw new Error("Case study not found");
    }
    return { study };
  },
  head: ({ loaderData }) => {
    const study = loaderData?.study;
    if (!study) return {};
    return getSeoTags({
      title: `${study.title} | RepOne Case Study`,
      description: study.meta_description,
      path: `/case-studies/${study.slug}`,
      ogImage: study.og_image,
      schema: schemaHelpers.reviews([
        {
          author: study.ownerName,
          reviewBody: study.authorReview,
          ratingValue: study.ratingValue,
          itemReviewedName: "RepOne Gym Software",
        },
      ]),
    });
  },
  component: CaseStudyDetailPage,
});

function CaseStudyDetailPage() {
  const { study } = Route.useLoaderData();

  // Simple parser to convert body markdown to html paragraphs/lists
  const renderMarkdown = (text: string) => {
    return text.split("\n\n").map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("###")) {
        return (
          <h3 key={idx} className="font-display text-lg md:text-xl font-bold mt-8 mb-4 text-foreground">
            {trimmed.replace("###", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <ul key={idx} className="list-disc pl-5 my-4 space-y-2 text-xs md:text-sm text-muted-foreground">
            {trimmed.split("\n").map((li, liIdx) => (
              <li key={liIdx}>{li.replace(/^[-*]\s+/, "").trim()}</li>
            ))}
          </ul>
        );
      }
      if (trimmed.match(/^\d+\./)) {
        return (
          <ol key={idx} className="list-decimal pl-5 my-4 space-y-2 text-xs md:text-sm text-muted-foreground">
            {trimmed.split("\n").map((li, liIdx) => (
              <li key={liIdx}>{li.replace(/^\d+\.\s+/, "").trim()}</li>
            ))}
          </ol>
        );
      }
      return (
        <p key={idx} className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <MarketingLayout>
      <div className="max-w-[700px] mx-auto px-6 font-sans">
        <Link to="/case-studies" className="inline-flex items-center gap-2 text-xs text-primary hover:underline mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Case Studies
        </Link>
        
        <header className="space-y-4 mb-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary text-[9px] font-bold uppercase tracking-widest">
            {study.metrics}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {study.title}
          </h1>
          <div className="flex gap-4 items-center text-xs text-muted-foreground border-b border-border pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {new Date(study.published_date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {study.author}
            </span>
          </div>
        </header>

        <img
          src={study.featured_image}
          alt={study.title}
          className="w-full h-[320px] object-cover rounded-2xl border border-border mb-10 shadow-lg"
        />

        {/* Highlighted Quote / Owner review */}
        <section className="bg-card border border-border p-6 rounded-2xl mb-10 relative">
          <div className="flex gap-1 mb-3 text-primary">
            {[...Array(study.ratingValue)].map((_, idx) => (
              <Star key={idx} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <blockquote className="font-sans italic text-sm text-foreground mb-4">
            "{study.authorReview}"
          </blockquote>
          <cite className="not-italic text-xs font-bold block text-foreground">
            {study.ownerName}
          </cite>
          <span className="text-[10px] text-muted-foreground">{study.ownerRole}</span>
        </section>

        <article className="prose dark:prose-invert">
          {renderMarkdown(study.body)}
        </article>

        <section className="bg-card border border-border p-6 rounded-2xl text-center mt-16 space-y-4">
          <h4 className="font-display text-lg font-bold">Ready to see results like {study.gym_name}?</h4>
          <p className="text-muted-foreground text-xs leading-normal max-w-md mx-auto">
            Book a 20-minute product walkthrough to explore how RepOne helps gyms grow their memberships.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity uppercase text-[10px] tracking-widest"
          >
            Schedule Free Demo &rarr;
          </Link>
        </section>
      </div>
    </MarketingLayout>
  );
}

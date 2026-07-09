import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { quotes } from "@/constants";
import { Star, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/testimonials")({
  head: () =>
    getSeoTags({
      title: "Testimonials & Reviews | RepOne Gym Software",
      description:
        "Read verified reviews and success stories from gym owners and fitness studio managers using RepOne.",
      path: "/testimonials",
      schema: schemaHelpers.reviews(
        quotes.map((q) => ({
          author: q.name,
          reviewBody: q.q,
          ratingValue: 5,
          itemReviewedName: "RepOne Gym Management Platform",
        }))
      ),
    }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Success Stories</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Verified Member <br />
            <span className="italic text-[#BEFF00]">RepOne Reviews.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            See how gyms and boutique studios are leveraging RepOne to streamline registrations, check-ins, and payment reconciliations.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 my-12">
          {quotes.map((quote, i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4 text-primary">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-6 font-sans italic">"{quote.q}"</p>
              </div>
              <div className="border-t border-border pt-4 mt-auto">
                <h5 className="font-bold text-xs">{quote.name}</h5>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{quote.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="bg-card border border-border p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 my-16">
          <div>
            <h4 className="font-display text-xl font-bold mb-2">Grow your fitness business with confidence</h4>
            <p className="text-muted-foreground text-xs leading-normal max-w-md">Book a walkthrough demo call to see how these features align with your facility parameters.</p>
          </div>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-6 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
          >
            Book Free Demo
          </Link>
        </section>
      </div>
    </MarketingLayout>
  );
}

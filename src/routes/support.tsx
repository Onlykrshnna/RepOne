import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { HelpCircle, BookOpen, MessageSquare, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () =>
    getSeoTags({
      title: "Support Center | RepOne Gym Software",
      description:
        "Access guides, onboarding documentation, or reach out to WebForge customer support.",
      path: "/support",
    }),
  component: PublicSupportPage,
});

function PublicSupportPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Help Center</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            RepOne <br />
            <span className="italic text-[#BEFF00]">Support.</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Need help configuring check-ins, adding members, or verifying billing statements? Explore our help files or connect with our support desk.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 my-12">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h4 className="font-bold text-sm">Documentation</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Step-by-step guides on setting up billing splits, adding trainers, and printing QR signs.
            </p>
            <a href="#" className="text-xs font-bold text-primary hover:underline block pt-2">Browse Docs &rarr;</a>
          </div>
          
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h4 className="font-bold text-sm">FAQs</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Find instant answers to common questions about membership freezes and payout timelines.
            </p>
            <a href="#" className="text-xs font-bold text-primary hover:underline block pt-2">Read FAQs &rarr;</a>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h4 className="font-bold text-sm">Support Desk</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Active members can raise tickets directly inside their admin panel or email us.
            </p>
            <a href="mailto:hello@repone.co" className="text-xs font-bold text-primary hover:underline block pt-2">Email Support &rarr;</a>
          </div>
        </div>

        <section className="bg-card border border-border p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 my-16">
          <div>
            <h4 className="font-display text-xl font-bold mb-2">First time using RepOne?</h4>
            <p className="text-muted-foreground text-xs leading-normal max-w-md">Schedule a complimentary onboarding session. We will set up your database structures together.</p>
          </div>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-6 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest gap-2"
          >
            Schedule Call <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </MarketingLayout>
  );
}

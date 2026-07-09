import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { SwatchBook, Globe, Shield, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/features/branding-white-label")({
  head: () =>
    getSeoTags({
      title: "White Label Gym App | RepOne",
      description:
        "Launch your gym's own branded app and portal — powered by RepOne, invisible in daily use.",
      path: "/features/branding-white-label",
      schema: schemaHelpers.faq([
        {
          question: "Can I use my own custom domain?",
          answer: "Yes. Our white-label options allow hosting the portal on your custom subdomain (e.g. portal.yourgym.com) with automatic SSL certificates.",
        },
      ]),
    }),
  component: WhiteLabelPage,
});

function WhiteLabelPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Brand Custody</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            White Label <br />
            <span className="italic text-[#BEFF00]">Gym App & Portal.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Strengthen client loyalty and increase authority by placing your own name, fonts, logos, colors, and layouts on the member portal.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center my-16">
          <div className="bg-card border border-border p-8 rounded-2xl space-y-6 order-last md:order-first">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <SwatchBook className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Theme Design System</h4>
                <p className="text-xs text-muted-foreground mt-1">Configure layout variables matching your brand guidelines. RepOne remains invisible.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Custom Domains</h4>
                <p className="text-xs text-muted-foreground mt-1">Map your digital services to your subdomain, offering a seamless navigation experience.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Branded Receipts & Emails</h4>
                <p className="text-xs text-muted-foreground mt-1">Every system-generated email alert, sign-up waiver, and payment invoice features your branding.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold">Your brand, our engine</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Why promote software vendor branding to your members? Deliver a bespoke, professional experience under your own brand identity without the high development cost of custom coding.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Upload logos and customize colors in minutes.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Automatic domain SSL management.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Perfect digital continuity across mobile and desktop.</span>
              </li>
            </ul>
          </div>
        </div>

        <footer className="text-center mt-16 border-t border-border pt-12">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
          >
            Learn More About Branding Options
          </Link>
        </footer>
      </div>
    </MarketingLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { Smartphone, Bell, Flame, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/features/member-app")({
  head: () =>
    getSeoTags({
      title: "White Label Gym App | RepOne",
      description:
        "Launch your gym's own branded app and portal — powered by RepOne, invisible in daily use.",
      path: "/features/member-app",
      schema: schemaHelpers.faq([
        {
          question: "Is the member portal optimized for smartphones?",
          answer: "Yes. The member portal is designed as a progressive web app (PWA) that loads instantly and works beautifully on any mobile device.",
        },
      ]),
    }),
  component: MemberAppPage,
});

function MemberAppPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Member App Experience</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Branded Member <br />
            <span className="italic text-[#BEFF00]">Portal App.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Give your members a mobile-native check-in, billing, and training interface under your own gym brand.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center my-16">
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold">Premium mobile fitness portal</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              No need to build a custom application from scratch. RepOne's mobile portal delivers high performance, offline capabilities, and instant loading speeds.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Contactless check-in via mobile QR scanning.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Instantly check class lists and reserve seats.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Track workout splits and metric goals.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Responsive Mobile Layout</h4>
                <p className="text-xs text-muted-foreground mt-1">Slick animations and optimized tap targets designed specifically for smartphone viewports.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Push Notifications</h4>
                <p className="text-xs text-muted-foreground mt-1">Keep members informed of class cancellations, waitlist status, and billing reminders.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Gamified Attendance Logs</h4>
                <p className="text-xs text-muted-foreground mt-1">Show member workout streaks to boost retention and keep your community active.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-16 border-t border-border pt-12">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
          >
            Launch Your Custom App
          </Link>
        </footer>
      </div>
    </MarketingLayout>
  );
}

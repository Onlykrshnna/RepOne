import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { Calendar, UserCheck, Timer, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/features/class-booking")({
  head: () =>
    getSeoTags({
      title: "Class Booking Software for Gyms | RepOne",
      description:
        "Let members browse, book, and waitlist classes in real time.",
      path: "/features/class-booking",
      schema: schemaHelpers.faq([
        {
          question: "Can we set booking limits on classes?",
          answer: "Yes. Administrators can set specific capacity caps and enable waitlisting for popular class categories.",
        },
      ]),
    }),
  component: ClassBookingFeaturePage,
});

function ClassBookingFeaturePage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Scheduling Automation</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Class Booking <br />
            <span className="italic text-[#BEFF00]">Software for Gyms.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Empower members to view timetables, reserve slots, join waitlists, and manage training calendars. Reduce class-coordination calls and admin overhead.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center my-16">
          <div className="bg-card border border-border p-8 rounded-2xl space-y-6 order-last md:order-first">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Interactive Gym Timetable</h4>
                <p className="text-xs text-muted-foreground mt-1">Publish weekly split schedules, group workout lists, and trainer slot maps dynamically.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Waitlists & Caps</h4>
                <p className="text-xs text-muted-foreground mt-1">Automate member queue promotions when registered participants cancel slots.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Trainer Schedules</h4>
                <p className="text-xs text-muted-foreground mt-1">Give personal trainers unique log views to manage clients and mark workout logs.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold">Simplify scheduling logistics</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Managing class reservations over group chats or manual clipboards leads to double-booking and member frustration. RepOne's scheduling calendar offers a real-time visual grid.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Responsive member self-booking on mobile.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Automated notifications for confirmed bookings.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Track trainer capacities and performance trends.</span>
              </li>
            </ul>
          </div>
        </div>

        <footer className="text-center mt-16 border-t border-border pt-12">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
          >
            Request a Free Demo Call
          </Link>
        </footer>
      </div>
    </MarketingLayout>
  );
}

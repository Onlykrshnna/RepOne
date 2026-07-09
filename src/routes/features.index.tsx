import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { ShieldCheck, QrCode, CreditCard, LayoutDashboard, Sliders, Bell } from "lucide-react";

export const Route = createFileRoute("/features/")({
  head: () =>
    getSeoTags({
      title: "RepOne — The Gym Operating System | Powered by WebForge",
      description:
        "Run your entire gym from one platform: memberships, attendance, payments, and analytics. Book a free demo.",
      path: "/features",
      schema: schemaHelpers.faq([
        {
          question: "What features are included in RepOne?",
          answer: "RepOne includes QR attendance, membership management, payments pipeline tracking, class bookings, white-label branding, and real-time dashboard analytics.",
        },
        {
          question: "Can I manage multiple gym locations?",
          answer: "Yes, our Enterprise plan supports multi-facility administration and aggregated reports.",
        },
      ]),
    }),
  component: FeaturesIndexPage,
});

const featureCards = [
  {
    title: "QR Code Attendance System",
    description: "Contactless check-in for members using their smartphones. Zero receptionist friction, zero keyfob costs.",
    href: "/features/qr-attendance",
    icon: QrCode,
  },
  {
    title: "Gym Membership Management Software",
    description: "Automate profile tracking, renewals, freezes, and custom tiers in a single dashboard.",
    href: "/features/membership-management",
    icon: ShieldCheck,
  },
  {
    title: "Gym Payment & Billing Software",
    description: "Reconcile, approve, and track receipts dynamically. Stop auditing spreadsheets or WhatsApp screenshots.",
    href: "/features/payments",
    icon: CreditCard,
  },
  {
    title: "Class Booking & Waitlists",
    description: "Let members self-register for group fitness classes, schedule personal training, and join waitlists.",
    href: "/features/class-booking",
    icon: Sliders,
  },
  {
    title: "Gym Analytics Dashboard",
    description: "Detailed retention tracking, monthly recurring revenue metrics, and active count audits.",
    href: "/features/analytics-reports",
    icon: LayoutDashboard,
  },
  {
    title: "White Label Branding",
    description: "Run your system on your own custom domain, with your colors, logos, and portal theme layout.",
    href: "/features/branding-white-label",
    icon: Bell,
  },
];

function FeaturesIndexPage() {
  return (
    <MarketingLayout>
      <header className="text-center max-w-3xl mx-auto px-6 mb-20">
        <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Feature Matrix</span>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mt-6 mb-6">
          The Gym <br />
          <span className="italic text-[#BEFF00]">Operating System.</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          RepOne replaces disparate apps, paper records, and manual spreadsheet entries with a unified cloud platform. Manage every facet of your gym business.
        </p>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {featureCards.map((feat) => {
          const Icon = feat.icon;
          return (
            <div key={feat.title} className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-muted-foreground text-xs leading-normal mb-8">{feat.description}</p>
              </div>
              <Link
                to={feat.href}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Explore {feat.title.replace(" Software", "")} &rarr;
              </Link>
            </div>
          );
        })}
      </section>

      <section className="text-center mt-24">
        <Link
          to="/demo"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest"
        >
          Book a Free Demo Call
        </Link>
      </section>
    </MarketingLayout>
  );
}

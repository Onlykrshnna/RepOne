import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { QrCode, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/features/qr-attendance")({
  head: () =>
    getSeoTags({
      title: "QR Attendance System for Gyms | RepOne",
      description:
        "Contactless QR check-in for your members. Real-time attendance tracking, zero paperwork.",
      path: "/features/qr-attendance",
      schema: schemaHelpers.faq([
        {
          question: "How does the QR check-in prevent fraud?",
          answer: "The check-in requires authentication through the member portal. QR codes verify membership status instantly, rendering screenshot sharing ineffective.",
        },
        {
          question: "Do I need physical gates?",
          answer: "No. The system works by displaying a QR code at your reception counter that members scan with their smartphones. However, it can integrate with physical gates via API if required.",
        },
      ]),
    }),
  component: QrAttendancePage,
});

function QrAttendancePage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Attendance Automation</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Contactless QR <br />
            <span className="italic text-[#BEFF00]">Attendance System.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Eliminate lines, reduce plastic card waist, and automate attendance logs. Let members check in with their smartphones at your front desk in 2 seconds.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center my-16">
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold">Why choose a smartphone-based check-in?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Traditional keyfobs and fingerprint scanners are expensive, break easily, and require constant manual syncs. RepOne replaces physical cards with secure, dynamic portal verifications.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Zero hardware investment needed.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Instant membership verification on entry.</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Real-time dashboard visual feed for front desk staff.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Dynamic Verification</h4>
                <p className="text-xs text-muted-foreground mt-1">Check-in links validate dynamic membership profiles instantly in our Postgres database.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Mobile-Friendly Frame</h4>
                <p className="text-xs text-muted-foreground mt-1">Clean, hardware-accelerated camera container optimized for quick code scanning on iOS and Android.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Auto-Logging Streaks</h4>
                <p className="text-xs text-muted-foreground mt-1">Calculates check-in streaks dynamically to encourage member engagement.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-16 border-t border-border pt-12">
          <h3 className="font-display text-xl font-bold mb-4">Want to see the check-in scanner in action?</h3>
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

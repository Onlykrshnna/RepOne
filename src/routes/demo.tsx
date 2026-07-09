import { createFileRoute } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { useState } from "react";
import { Calendar, Clock, Video, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () =>
    getSeoTags({
      title: "Book a Free Demo | RepOne",
      description:
        "See RepOne in action. 20-minute walkthrough, no commitment. Learn how to automate memberships and check-ins.",
      path: "/demo",
    }),
  component: DemoPage,
});

function DemoPage() {
  const [formData, setFormData] = useState({
    name: "",
    gymName: "",
    email: "",
    phone: "",
    memberCount: "50-100",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track Conversion Event
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "generate_lead", {
        event_category: "engagement",
        event_label: "Book a Demo Form Submit",
        value: 1.0,
      });
    }
    console.log("Demo requested:", formData);
    setSubmitted(true);
  };

  return (
    <MarketingLayout>
      <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Info Column */}
        <div className="space-y-8">
          <header className="space-y-4">
            <span className="text-[#BEFF00] text-xs font-bold uppercase tracking-widest bg-[#BEFF00]/10 px-3 py-1 rounded">Interactive Walkthrough</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Book a Free <br />
              <span className="italic text-[#BEFF00]">RepOne Demo.</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Discover how RepOne replaces paper registers, reduces billing disputes, and streamlines contactless member access in under 20 minutes.
            </p>
          </header>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-card rounded-lg text-primary shrink-0 border border-border">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">20-Minute Focus Call</h4>
                <p className="text-xs text-muted-foreground leading-normal">Tailored overview of dashboard setups matching your gym's layout.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-card rounded-lg text-primary shrink-0 border border-border">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Live Platform Preview</h4>
                <p className="text-xs text-muted-foreground leading-normal">See the real-time check-in logs and automated invoice tools in action.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-card rounded-lg text-primary shrink-0 border border-border">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">No Credit Card Required</h4>
                <p className="text-xs text-muted-foreground leading-normal">Zero commitment. Get a free trial account to test custom layouts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="bg-card border border-border p-8 rounded-2xl shadow-xl relative overflow-hidden">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#BEFF00] mx-auto animate-bounce" />
              <h3 className="font-display text-2xl font-bold">Demo Request Received!</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out. A WebForge specialist will contact you at <strong>{formData.email}</strong> within 2 hours to confirm your calendar slot.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-display text-xl font-bold mb-4">Let's schedule a call</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-sans">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Krish Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-sans">Gym / Studio Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iron House Gym"
                  value={formData.gymName}
                  onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-sans">Business Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@yourgym.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-sans">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 99999 99999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-sans">Active Members</label>
                <select
                  value={formData.memberCount}
                  onChange={(e) => setFormData({ ...formData, memberCount: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="Under 50">Under 50 members</option>
                  <option value="50-100">50 - 100 members</option>
                  <option value="101-500">101 - 500 members</option>
                  <option value="500+">500+ members</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 transition-opacity uppercase text-[11px] tracking-widest mt-2"
              >
                Schedule Demo Call &rarr;
              </button>
            </form>
          )}
        </div>

      </div>
    </MarketingLayout>
  );
}

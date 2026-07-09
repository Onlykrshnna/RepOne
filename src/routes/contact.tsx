import { createFileRoute } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () =>
    getSeoTags({
      title: "Contact Us | RepOne Gym Software",
      description:
        "Get in touch with the RepOne team. Ask about custom integrations or request a set-up call.",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Connect</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Contact <br />
            <span className="italic text-[#BEFF00]">RepOne.</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Have questions about white-labeling, migration assistance, or billing integrations? Connect with a specialist today.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-12 my-12 items-center">
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold">Contact Coordinates</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Our support team is active Monday through Friday, 9:00 AM to 6:00 PM. We reply to all support queries within 2 hours.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">hello@repone.co</span>
              </div>
              <div className="flex gap-4 items-center">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">WebForge HQ, Sector V, Salt Lake, Kolkata</span>
              </div>
              <div className="flex gap-4 items-center">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">+91 33 4000 0000</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl">
            <h3 className="font-display text-lg font-bold mb-4">Send a message</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
              <input
                type="text"
                required
                placeholder="Name"
                className="w-full bg-background border border-border px-4 py-3 text-xs rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full bg-background border border-border px-4 py-3 text-xs rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
              <textarea
                required
                rows={4}
                placeholder="Message"
                className="w-full bg-background border border-border px-4 py-3 text-xs rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
              />
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity uppercase text-[10px] tracking-widest"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}

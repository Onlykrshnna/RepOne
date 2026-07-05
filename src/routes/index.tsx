import { createFileRoute } from "@tanstack/react-router";
import { SiteThemeProvider } from "@/lib/theme-context";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Philosophy } from "@/components/site/Philosophy";
import { MarqueeStrip } from "@/components/site/MarqueeStrip";
import { Programs } from "@/components/site/Programs";
import { Stats } from "@/components/site/Stats";
import { Trainers } from "@/components/site/Trainers";
import { Facility } from "@/components/site/Facility";
import { Membership } from "@/components/site/Membership";
import { Testimonials } from "@/components/site/Testimonials";
import { CTASection } from "@/components/site/CTASection";
import { Footer } from "@/components/site/Footer";
import { CustomCursor } from "@/components/site/CustomCursor";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "Atlas · A Private Strength Club, London" },
      {
        name: "description",
        content:
          "Atlas is a members-only strength club in East London. Coached training, refined recovery, and a room built to disappear.",
      },
      { property: "og:title", content: "Atlas · A Private Strength Club, London" },
      {
        property: "og:description",
        content:
          "Coached strength, precise conditioning, and a full recovery suite. Membership capped at 240.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteThemeProvider>
      <main className="bg-[#F8F7F4] dark:bg-[#080809] text-[#0E0E10] dark:text-[#F0EDE6] overflow-x-clip">
        <CustomCursor />
        <Nav />
        <Hero />
        <Philosophy />
        <MarqueeStrip />
        <Programs />
        <Stats />
        <Trainers />
        <MarqueeStrip />
        <Facility />
        <Membership />
        <Testimonials />
        <CTASection />
        <Footer />
      </main>
    </SiteThemeProvider>
  );
}


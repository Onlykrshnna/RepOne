import { createFileRoute } from "@tanstack/react-router";
import { SiteThemeProvider } from "@/lib/theme-context";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Philosophy } from "@/components/site/Philosophy";
import { MarqueeStrip } from "@/components/site/MarqueeStrip";
import { Comparison } from "@/components/site/Comparison";
import { Programs } from "@/components/site/Programs";
import { Stats } from "@/components/site/Stats";
import { Trainers } from "@/components/site/Trainers";
import { Facility } from "@/components/site/Facility";
import { Membership } from "@/components/site/Membership";
import { Testimonials } from "@/components/site/Testimonials";
import { CTASection } from "@/components/site/CTASection";
import { Footer } from "@/components/site/Footer";
import { CustomCursor } from "@/components/site/CustomCursor";
import { Preloader } from "@/components/site/Preloader";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "RepOne · Gym Management Platform & Demo" },
      {
        name: "description",
        content:
          "Explore the live interactive demo of XYZ Fitness powered by RepOne, a premium gym management platform.",
      },
      { property: "og:title", content: "RepOne · Gym Management Platform" },
      {
        property: "og:description",
        content:
          "Automated memberships, payments, QR attendance, trainer dashboards, and member portals.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://repone.web-forge.in" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteThemeProvider>
      <Preloader />
      <main className="bg-[#F8F7F4] dark:bg-[#080809] text-[#0E0E10] dark:text-[#F0EDE6] overflow-x-clip">
        <CustomCursor />
        <Nav />
        <Hero />
        <Philosophy />
        <MarqueeStrip />
        <Comparison />
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


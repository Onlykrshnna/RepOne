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

import { getSeoTags, schemaHelpers } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    getSeoTags({
      title: "RepOne · Gym Management Platform & Demo",
      description:
        "Explore the live interactive demo of XYZ Fitness powered by RepOne. RepOne is a premium B2B2C gym operating system designed to automate memberships, UPI payment reconciliation, contactless QR check-ins, group class booking schedules, and trainer dashboards in one place.",
      path: "",
      schema: schemaHelpers.softwareApplication(),
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


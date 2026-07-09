import { ReactNode } from "react";
import { SiteThemeProvider } from "@/lib/theme-context";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { CustomCursor } from "./CustomCursor";

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <SiteThemeProvider>
      <main className="bg-[#F8F7F4] dark:bg-[#080809] text-[#0E0E10] dark:text-[#F0EDE6] overflow-x-clip min-h-screen flex flex-col justify-between">
        <CustomCursor />
        <div>
          <Nav />
          {/* Main content area offset by navbar height */}
          <div className="pt-24 md:pt-32 pb-16">
            {children}
          </div>
        </div>
        <Footer />
      </main>
    </SiteThemeProvider>
  );
}

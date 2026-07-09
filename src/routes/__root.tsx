/// <reference types="vite-plugin-pwa/client" />
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AuthProvider } from "../lib/auth-context";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    // Error reporting removed
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const meta: any[] = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RepOne · Gym Management Platform & Demo" },
      {
        name: "description",
        content:
          "RepOne is a modern gym management platform. Manage memberships, payments, QR check-ins, class schedules, and trainer portals in one place.",
      },
      { property: "og:url", content: "https://repone.web-forge.in" },
    ];

    // Google Search Console site verification
    const gscCode = import.meta.env.VITE_GSC_VERIFICATION_CODE || "{{GSC_VERIFICATION_CODE}}";
    meta.push({ name: "google-site-verification", content: gscCode });

    // Protect staging / preview environments from search crawlers
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host.includes("localhost") || (host.includes("vercel.app") && !host.includes("repone.web-forge.in"))) {
        meta.push({ name: "robots", content: "noindex, nofollow" });
      }
    }
    if (import.meta.env.VITE_VERCEL_ENV && import.meta.env.VITE_VERCEL_ENV !== "production") {
      if (!meta.some((m) => m.name === "robots")) {
        meta.push({ name: "robots", content: "noindex, nofollow" });
      }
    }

    return {
      meta,
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/logo.png", type: "image/png" },
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Inter:wght@300;400;500;600&display=swap",
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        <HeadContent />
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}



function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("virtual:pwa-register").then(({ registerSW }) => {
        registerSW({
          immediate: true,
        });
      }).catch((err) => {
        console.error("Failed to register service worker:", err);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Each route (site/member/admin) provides its own ThemeProvider */}
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

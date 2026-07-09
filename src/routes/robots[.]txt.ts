import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const txt = `User-agent: *
Allow: /
Allow: /features
Allow: /features/*
Allow: /pricing
Allow: /demo
Allow: /compare
Allow: /compare/*
Allow: /for-gym-owners
Allow: /for-boutique-studios
Allow: /for-gym-chains
Allow: /blog
Allow: /blog/*
Allow: /case-studies
Allow: /case-studies/*
Allow: /testimonials
Allow: /about
Allow: /contact
Allow: /support
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /refund-policy

# Block internal admin and member dashboards
Disallow: /admin
Disallow: /admin/*
Disallow: /_member
Disallow: /_member/*
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /api
Disallow: /api/*
Disallow: /checkin

Sitemap: https://repone.web-forge.in/sitemap.xml
`;

        return new Response(txt, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

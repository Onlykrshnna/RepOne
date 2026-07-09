import { createFileRoute } from "@tanstack/react-router";
import { blogPosts } from "@/content/blog";
import { caseStudies } from "@/content/case-studies";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = "https://repone.web-forge.in";
        const staticPaths = [
          "",
          "/features",
          "/features/qr-attendance",
          "/features/membership-management",
          "/features/payments",
          "/features/class-booking",
          "/features/analytics-reports",
          "/features/branding-white-label",
          "/features/member-app",
          "/pricing",
          "/demo",
          "/for-gym-owners",
          "/for-boutique-studios",
          "/for-gym-chains",
          "/compare",
          "/compare/repone-vs-mindbody",
          "/compare/repone-vs-glofox",
          "/compare/repone-vs-zenplanner",
          "/compare/repone-vs-excel-whatsapp",
          "/blog",
          "/case-studies",
          "/testimonials",
          "/about",
          "/contact",
          "/support",
          "/privacy-policy",
          "/terms-of-service",
          "/refund-policy",
        ];

        const staticUrls = staticPaths
          .map((path) => {
            return `  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
  </url>`;
          })
          .join("\n");

        const blogUrls = blogPosts
          .map((post) => {
            return `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.published_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
          })
          .join("\n");

        const caseStudyUrls = caseStudies
          .map((study) => {
            return `  <url>
    <loc>${baseUrl}/case-studies/${study.slug}</loc>
    <lastmod>${study.published_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${blogUrls}
${caseStudyUrls}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { blogPosts } from "@/content/blog";
import { Calendar, User, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  head: () =>
    getSeoTags({
      title: "Gym Management Insights | RepOne Blog",
      description:
        "Tips, guides, spreadsheets vs software comparison, and operational advice for modern gym owners.",
      path: "/blog",
    }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  return (
    <MarketingLayout>
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BEFF00] bg-[#BEFF00]/10 px-3 py-1 rounded">Knowledge Base</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">
            Gym Management <br />
            <span className="italic text-[#BEFF00]">Insights & Tips.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Stay informed on automation strategies, pricing mechanics, marketing channels, and check-in workflows.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 my-12">
          {blogPosts.map((post) => (
            <article key={post.slug} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-300">
              <div>
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-48 object-cover border-b border-border"
                />
                <div className="p-6 space-y-3">
                  <div className="flex gap-4 items-center text-[10px] text-muted-foreground font-sans">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(post.published_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {post.author}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold leading-tight">{post.title}</h3>
                  <p className="text-muted-foreground text-xs leading-normal">{post.meta_description}</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  Read Article <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}

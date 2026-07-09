import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoTags, schemaHelpers } from "@/lib/seo";
import { MarketingLayout } from "@/components/site/MarketingLayout";
import { blogPosts } from "@/content/blog";
import { Calendar, User, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) {
      throw new Error("Post not found");
    }
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return {};
    return getSeoTags({
      title: `${post.title} | RepOne Blog`,
      description: post.meta_description,
      path: `/blog/${post.slug}`,
      ogImage: post.og_image,
      schema: schemaHelpers.article({
        headline: post.title,
        description: post.meta_description,
        datePublished: post.published_date,
        author: post.author,
        url: `https://repone.web-forge.in/blog/${post.slug}`,
        image: post.featured_image,
      }),
    });
  },
  component: BlogPostDetailPage,
});

function BlogPostDetailPage() {
  const { post } = Route.useLoaderData();

  // Simple parser to convert body markdown to html paragraphs/lists
  const renderMarkdown = (text: string) => {
    return text.split("\n\n").map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("###")) {
        return (
          <h3 key={idx} className="font-display text-lg md:text-xl font-bold mt-8 mb-4 text-foreground">
            {trimmed.replace("###", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("####")) {
        return (
          <h4 key={idx} className="font-sans text-sm font-bold mt-6 mb-2 text-foreground">
            {trimmed.replace("####", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <ul key={idx} className="list-disc pl-5 my-4 space-y-2 text-xs md:text-sm text-muted-foreground">
            {trimmed.split("\n").map((li, liIdx) => (
              <li key={liIdx}>{li.replace(/^[-*]\s+/, "").trim()}</li>
            ))}
          </ul>
        );
      }
      if (trimmed.match(/^\d+\./)) {
        return (
          <ol key={idx} className="list-decimal pl-5 my-4 space-y-2 text-xs md:text-sm text-muted-foreground">
            {trimmed.split("\n").map((li, liIdx) => (
              <li key={liIdx}>{li.replace(/^\d+\.\s+/, "").trim()}</li>
            ))}
          </ol>
        );
      }
      return (
        <p key={idx} className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <MarketingLayout>
      <div className="max-w-[700px] mx-auto px-6 font-sans">
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs text-primary hover:underline mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Insights
        </Link>
        
        <header className="space-y-4 mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
          <div className="flex gap-4 items-center text-xs text-muted-foreground border-b border-border pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {new Date(post.published_date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {post.author}
            </span>
          </div>
        </header>

        <img
          src={post.featured_image}
          alt={post.title}
          className="w-full h-[320px] object-cover rounded-2xl border border-border mb-10 shadow-lg"
        />

        <article className="prose dark:prose-invert">
          {renderMarkdown(post.body)}
        </article>

        <section className="bg-card border border-border p-6 rounded-2xl text-center mt-16 space-y-4">
          <h4 className="font-display text-lg font-bold">Ready to streamline your fitness business?</h4>
          <p className="text-muted-foreground text-xs leading-normal max-w-md mx-auto">
            Book a 20-minute product walkthrough to explore online member portals, check-in widgets, and billing ledgers.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity uppercase text-[10px] tracking-widest"
          >
            Schedule Free Demo &rarr;
          </Link>
        </section>
      </div>
    </MarketingLayout>
  );
}

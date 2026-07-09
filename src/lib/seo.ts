export interface SeoTagsOptions {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noindex?: boolean;
  schema?: Record<string, any> | Record<string, any>[];
}

export function getSeoTags({
  title,
  description,
  path = "",
  ogImage = "https://repone.web-forge.in/logo.png",
  noindex = false,
  schema,
}: SeoTagsOptions) {
  const baseUrl = "https://repone.web-forge.in";
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const meta: any[] = [
    { title },
    { name: "description", content: description },
    
    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  const scripts: any[] = [];
  if (schema) {
    const schemas = Array.isArray(schema) ? schema : [schema];
    schemas.forEach((s) => {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify(s),
      });
    });
  }

  return {
    meta,
    links: [
      { rel: "canonical", href: url },
    ],
    scripts,
  };
}

// Pre-configured Schema Generators
export const schemaHelpers = {
  softwareApplication: () => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RepOne",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "description": "Run your entire gym from one platform: memberships, attendance, payments, and analytics. Book a free demo.",
    "offers": {
      "@type": "Offer",
      "price": "1999",
      "priceCurrency": "INR",
      "seller": {
        "@type": "Organization",
        "name": "WebForge",
        "url": "https://web-forge.in"
      }
    }
  }),

  pricing: (plans: { name: string; price: string; period: string; features: string[] }[]) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "RepOne Gym Management Software",
    "description": "Transparent pricing for gyms and boutique fitness studios of every size.",
    "offers": plans.map((p) => ({
      "@type": "Offer",
      "name": p.name,
      "price": p.price.replace(/[^0-9]/g, "") || "0",
      "priceCurrency": "INR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": p.price.replace(/[^0-9]/g, "") || "0",
        "priceCurrency": "INR",
        "referenceQuantity": {
          "@type": "QuantitativeValue",
          "value": "1",
          "unitCode": p.period === "month" ? "MON" : "ANN"
        }
      }
    }))
  }),

  faq: (faqs: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  }),

  article: ({
    headline,
    description,
    datePublished,
    author,
    url,
    image,
  }: {
    headline: string;
    description: string;
    datePublished: string;
    author: string;
    url: string;
    image: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "image": image,
    "datePublished": datePublished,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "RepOne",
      "logo": {
        "@type": "ImageObject",
        "url": "https://repone.web-forge.in/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  }),

  reviews: (reviews: { author: string; reviewBody: string; ratingValue: number; itemReviewedName: string }[]) => 
    reviews.map((r) => ({
      "@context": "https://schema.org",
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.author
      },
      "reviewBody": r.reviewBody,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.ratingValue,
        "bestRating": "5"
      },
      "itemReviewed": {
        "@type": "Product",
        "name": r.itemReviewedName
      }
    }))
};

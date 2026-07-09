export interface CaseStudy {
  title: string;
  slug: string;
  meta_description: string;
  published_date: string;
  author: string;
  gym_name: string;
  metrics: string;
  body: string;
  featured_image: string;
  og_image: string;
  ratingValue: number;
  authorReview: string;
  ownerName: string;
  ownerRole: string;
}

export const caseStudies: CaseStudy[] = [
  {
    title: "How Iron House Gym Cut Admin Work in Half",
    slug: "iron-house-gym",
    meta_description: "Case study: How Iron House Gym migrated 450+ members to RepOne and reduced manual paperwork by 50%.",
    published_date: "2026-06-20",
    author: "Krish Sharma",
    gym_name: "Iron House Gym",
    metrics: "50% Admin Overhead Reduction",
    body: `### The Challenge

Iron House Gym had grown to over 450 active members. The administrative team was spending 20+ hours a week checking manual bank transfers, cross-referencing paper spreadsheets, and verifying memberships at the front door.

During peak hours, lines would form at the reception desk just for members to write down their check-in details.

### The Solution

Iron House Gym implemented RepOne's unified member portal and payment verification pipeline. Members began self-registering online, uploading transfer receipts directly to the portal, and checking in via dynamic QR codes at the counter.

### The Results

- **50% Admin Reduction**: Reconciling payment invoices now takes under a minute, freeing up the team to focus on training.
- **Improved Retention**: Real-time analytics dashboards flagged inactive accounts, enabling automated retention sequences.
`,
    featured_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    og_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    ratingValue: 5,
    authorReview: "RepOne replaced three different software subscriptions. Our admin work cut in half!",
    ownerName: "Marcus A.",
    ownerRole: "Owner, Iron House Gym"
  },
  {
    title: "Going Paperless: Titan Strength's 2-Second QR Check-In",
    slug: "titan-strength",
    meta_description: "Case study: How Titan Strength digitized their check-in process and saved hours of front desk work using contactless QR check-ins.",
    published_date: "2026-06-15",
    author: "Krish Sharma",
    gym_name: "Titan Strength",
    metrics: "100% Paperless Check-In",
    body: `### The Challenge

Titan Strength, capped at 300 members, prided itself on being a modern, performance-focused warehouse facility. However, they were still using logbooks and physical signature clipboards to track daily check-ins. Members forgot to sign in, making attendance tracking and class capacity forecasting impossible.

### The Solution

Titan Strength deployed RepOne's contactless QR attendance system. They printed and laminated the verification QR flyer and placed it at the entrance.

### The Results

- **2-Second Check-In**: Members scan the code on entry, logging attendance instantly in their member app.
- **Full Class Insights**: Trainers can see check-in volumes in real-time, helping schedule staff efficiently.
`,
    featured_image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop",
    og_image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop",
    ratingValue: 5,
    authorReview: "Our attendance process became completely paperless. Members check in using the QR code in 2 seconds.",
    ownerName: "Sarah T.",
    ownerRole: "Founder, Titan Strength"
  }
];

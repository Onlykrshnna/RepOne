import t1 from "@/assets/trainer-1.jpg";
import t2 from "@/assets/trainer-2.jpg";
import t3 from "@/assets/trainer-3.jpg";
import t4 from "@/assets/trainer-4.jpg";

import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";

import strength from "@/assets/program-strength.jpg";
import hiit from "@/assets/program-hiit.jpg";
import recovery from "@/assets/program-recovery.jpg";
import pt from "@/assets/program-pt.jpg";

export const trainers = [
  { name: "James Whitaker", role: "Head of Strength", img: t1 },
  { name: "Sofia Marchetti", role: "Conditioning Lead", img: t2 },
  { name: "Marcus Adeyemi", role: "Performance Coach", img: t3 },
  { name: "Aiko Tanaka", role: "Recovery & Mobility", img: t4 },
];

export const quotes = [
  {
    q: "RepOne replaced three different software subscriptions. Our admin work cut in half!",
    name: "Marcus A.",
    detail: "Owner, Iron House Gym · 450+ Active Members",
  },
  {
    q: "Our attendance process became completely paperless. Members check in using the QR code in 2 seconds.",
    name: "Sarah T.",
    detail: "Founder, Titan Strength · Capped at 300 Members",
  },
  {
    q: "Payments are now verified in under a minute, drastically reducing unverified gym entries.",
    name: "Elena R.",
    detail: "Manager, Elite Fitness Club · 3 Locations",
  },
];

export const stats = [
  { end: 100, label: "Attendance in 2s", suffix: "%" },
  { end: 24, label: "Online Membership", suffix: "x7" },
  { end: 1, label: "Payment Approval", suffix: " Min" },
  { end: 0, label: "Manual Paperwork", suffix: "%" },
];

export const programs = [
  {
    n: "01",
    name: "Member Portal",
    tag: "Mobile App · QR Attendance · Workout Logs",
    copy: "Empower members to buy passes, register for classes, view their attendance, and check in via their personal QR codes.",
    img: strength,
  },
  {
    n: "02",
    name: "Admin Dashboard",
    tag: "Revenue Tracking · Memberships · Reports",
    copy: "A birds-eye view of your business. Track monthly recurring revenue, approve payments, and view active check-ins in real-time.",
    img: hiit,
  },
  {
    n: "03",
    name: "Payment Pipeline",
    tag: "Automated Verifications · Receipts",
    copy: "Verify and reconcile payments instantly. Avoid manual bank transfer checks and spreadsheet double-entry.",
    img: recovery,
  },
  {
    n: "04",
    name: "White-Label Brand",
    tag: "Your Logo · Your Colors · Your Domain",
    copy: "SaaS that adapts to you. Deliver a premium, bespoke digital experience under your own gym brand, not ours.",
    img: pt,
  },
];

export const links = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Case Studies", href: "/case-studies" },
];

export const tiers = [
  {
    name: "Basic",
    price: "₹1,999",
    period: "month",
    features: [
      "Up to 100 active members",
      "Online registration & memberships",
      "Basic reports & dashboard",
      "Standard email support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Premium",
    price: "₹3,999",
    period: "month",
    featured: true,
    features: [
      "Up to 500 active members",
      "QR code attendance tracking",
      "Trainer & class management",
      "Priority email & chat support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited active members",
      "Custom domain & full branding",
      "Advanced CRM integrations",
      "24/7 Dedicated account support",
    ],
    cta: "Book Demo",
  },
];

export const shots = [
  { img: g1, caption: "The Floor · 6,400 sq ft", h: 1024, w: 1600 },
  { img: g2, caption: "The Iron · Walnut & Steel", h: 1280, w: 1024 },
  { img: g3, caption: "The Sanctuary · Sauna & Plunge", h: 1024, w: 1280 },
];

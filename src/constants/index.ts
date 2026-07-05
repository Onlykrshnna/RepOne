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
    q: "The first gym I've belonged to that treats coaching as a craft. Two years in, my body reads younger than it did at thirty.",
    name: "Elena R.",
    detail: "Member since 2022 · Down 14 kg, up 40 kg on the deadlift",
  },
  {
    q: "It's the quietest room in London and the hardest hour of my week. Both, by design.",
    name: "David M.",
    detail: "Member since 2019 · First unassisted pull-up at 47",
  },
  {
    q: "James rebuilt me around an old back injury without ever making it the subject of a session. That's the whole difference.",
    name: "Priya S.",
    detail: "Member since 2020 · Half-marathon PR, injury-free",
  },
];

export const stats = [
  { end: 1240, label: "Members trained", suffix: "" },
  { end: 11, label: "Years on the floor", suffix: "" },
  { end: 42, label: "Weekly coached sessions", suffix: "" },
  { end: 96, label: "Member retention", suffix: "%" },
];

export const programs = [
  {
    n: "01",
    name: "Strength",
    tag: "Barbell · Kettlebell · Structural",
    copy: "Progressive periodization built around your lifts. Twelve-week arcs, weekly reads.",
    img: strength,
  },
  {
    n: "02",
    name: "Conditioning",
    tag: "HIIT · Zone 2 · Interval",
    copy: "Precisely dosed intensity. Heart-rate governed sessions in small groups of six.",
    img: hiit,
  },
  {
    n: "03",
    name: "Recovery",
    tag: "Sauna · Ice · Mobility",
    copy: "A full recovery suite. Contrast therapy, guided mobility, sleep and nutrition coaching.",
    img: recovery,
  },
  {
    n: "04",
    name: "Private Coaching",
    tag: "1:1 · Assessment · Programming",
    copy: "A named coach, quarterly assessments, and a plan that adapts to your life outside.",
    img: pt,
  },
];

export const links = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Programs", href: "#programs" },
  { label: "Trainers", href: "#trainers" },
  { label: "Facility", href: "#facility" },
  { label: "Membership", href: "#membership" },
];

export const tiers = [
  {
    name: "Foundation",
    price: "180",
    period: "/ month",
    features: [
      "Access to open training floor",
      "Two coached group sessions weekly",
      "Recovery suite",
      "Member events",
    ],
    cta: "Apply",
  },
  {
    name: "Signature",
    price: "340",
    period: "/ month",
    featured: true,
    features: [
      "Everything in Foundation",
      "Unlimited coached group sessions",
      "Quarterly performance assessment",
      "Guest privileges · 2 per month",
    ],
    cta: "Apply",
  },
  {
    name: "Private",
    price: "On request",
    period: "",
    features: [
      "Everything in Signature",
      "Named private coach · weekly",
      "Custom programming & nutrition",
      "Concierge scheduling",
    ],
    cta: "Enquire",
  },
];

export const shots = [
  { img: g1, caption: "The Floor · 6,400 sq ft", h: 1024, w: 1600 },
  { img: g2, caption: "The Iron · Walnut & Steel", h: 1280, w: 1024 },
  { img: g3, caption: "The Sanctuary · Sauna & Plunge", h: 1024, w: 1280 },
];

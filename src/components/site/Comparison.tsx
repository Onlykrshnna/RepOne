import { Reveal } from "./Reveal";
import { X, Check } from "lucide-react";

export function Comparison() {
  const beforeList = [
    "Paper logbooks and attendance sheets",
    "Manually checking bank apps for UPI transfer receipts",
    "Juggling three different software subscriptions",
    "No member portal for class slot bookings",
    "Hours spent weekly reconciling memberships",
  ];

  const afterList = [
    "Frictionless 2-second QR code attendance check-ins",
    "Real-time automated payment pipeline approvals",
    "All member records and schedules in one dashboard",
    "Dedicated mobile web app for class bookings",
    "100% automated operations on complete autopilot",
  ];

  return (
    <section className="relative py-24 md:py-36 bg-[#F8F7F4] dark:bg-[#0E0E10] border-t border-[#0E0E10]/5 dark:border-white/5 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <Reveal>
            <span className="text-[#BEFF00] uppercase tracking-widest text-[9px] font-bold block mb-4 font-sans">Operational Contrast</span>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-[#0E0E10] dark:text-[#F0EDE6] leading-none">
              Traditional Gyms <span className="italic text-[#BEFF00]">vs.</span> RepOne
            </h2>
            <p className="mt-4 text-[#0E0E10]/60 dark:text-[#F0EDE6]/50 text-xs font-sans">
              See how moving to RepOne streamlines your daily workflows and modernizes your member touchpoints.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* BEFORE */}
          <Reveal delay={100} className="h-full">
            <div className="bg-white dark:bg-[#141418]/60 border border-red-500/10 p-8 rounded-xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold font-sans text-xs">
                    OLD
                  </div>
                  <h3 className="font-display text-xl text-[#0E0E10] dark:text-[#F0EDE6] tracking-tight">Traditional Management</h3>
                </div>
                <p className="text-[#0E0E10]/50 dark:text-[#F0EDE6]/40 text-xs font-sans mb-8">
                  Prone to human errors, leakages, and massive administrative overhead.
                </p>
                <ul className="space-y-4">
                  {beforeList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-[#0E0E10]/60 dark:text-[#F0EDE6]/50 text-[13px] font-sans leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-[#0E0E10]/5 dark:border-white/5 pt-6 mt-8">
                <span className="text-[10px] text-red-500 font-sans tracking-wider uppercase font-bold">Fragile & Time-Consuming Operations</span>
              </div>
            </div>
          </Reveal>

          {/* AFTER */}
          <Reveal delay={200} className="h-full">
            <div className="bg-white dark:bg-[#141418] border border-[#BEFF00]/20 p-8 rounded-xl h-full flex flex-col justify-between shadow-xl shadow-[#BEFF00]/[0.02]">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#BEFF00]/10 flex items-center justify-center text-[#BEFF00] font-bold font-sans text-xs">
                    NEW
                  </div>
                  <h3 className="font-display text-xl text-[#0E0E10] dark:text-[#F0EDE6] tracking-tight">The RepOne Way</h3>
                </div>
                <p className="text-[#0E0E10]/50 dark:text-[#F0EDE6]/40 text-xs font-sans mb-8">
                  Automated operations, verified tracking, and absolute control.
                </p>
                <ul className="space-y-4">
                  {afterList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-[#BEFF00] shrink-0 mt-0.5" />
                      <span className="text-[#0E0E10]/80 dark:text-[#F0EDE6]/80 text-[13px] font-sans leading-tight font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-[#0E0E10]/5 dark:border-white/5 pt-6 mt-8 flex justify-between items-center">
                <span className="text-[10px] text-[#BEFF00] font-sans tracking-wider uppercase font-bold">100% Automated Platform</span>
                <span className="text-[8px] bg-[#BEFF00]/10 text-[#BEFF00] border border-[#BEFF00]/20 px-2 py-0.5 rounded uppercase font-bold font-sans">Efficiency Boost</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

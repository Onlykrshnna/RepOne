import { Reveal } from "./Reveal";

const FEATURES = [
  { icon: "📱", title: "Member Portal", desc: "A sleek, responsive interface for members to view class schedules, book slots, and track workout logs." },
  { icon: "🧾", title: "Online Memberships", desc: "Enable frictionless sign-ups and membership plan purchases directly from your public gym website." },
  { icon: "💳", title: "Payment Verification", desc: "Automate and verify monthly bank transfers and UPI payments, reducing admin reconciliation lag." },
  { icon: "📷", title: "QR Attendance", desc: "Frictionless class check-ins in under 2 seconds using members' unique app-generated QR codes." },
  { icon: "👥", title: "Trainer Dashboard", desc: "Empower coaches with specialized tools to monitor client progress, track body metrics, and log daily check-ins." },
  { icon: "📈", title: "Reports", desc: "Generate breakdown logs for monthly recurring revenue, client retention, class popularity, and attendance trends." },
  { icon: "🎟", title: "Guest Passes", desc: "Streamline client referrals and safely check in guest visitors with temporary digital QR passes." },
  { icon: "📊", title: "Analytics", desc: "Gain critical insights into peak hours, trainer performance metrics, and general business growth." },
];

export function Programs() {
  return (
    <section id="features" className="relative py-32 md:py-48 bg-[#0C0C0E] overflow-hidden">
      <div className="absolute top-8 right-0 select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display leading-none text-[#141418] font-bold" style={{ fontSize: "28vw", letterSpacing: "-0.05em" }}>02</span>
      </div>
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 md:mb-28">
          <div>
            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-display text-xl text-[#BEFF00]">02</span>
                <span className="block h-[1px] w-10 bg-[#F0EDE6]/15" />
                <span className="text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Features</span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-display text-[#F0EDE6]" style={{ fontSize: "clamp(2.4rem,5.5vw,6rem)", lineHeight: "0.94", letterSpacing: "-0.02em" }}>
                Everything Your <br /><span className="italic text-[#BEFF00]">Gym Needs.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <p className="text-[#F0EDE6]/40 max-w-md" style={{ fontFamily: "Inter", fontSize: "14px", lineHeight: "1.75" }}>
              A unified operating system for modern fitness businesses. Replace disjointed software, spreadsheets, and paper logs with one cohesive platform.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="group relative bg-[#141418] border border-[#F0EDE6]/5 p-8 flex flex-col justify-between h-72 hover:border-[#BEFF00]/30 transition-all duration-500 rounded">
                <div className="absolute inset-0 bg-[#BEFF00]/[0.015] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded" />
                <div>
                  <div className="text-4xl mb-6 select-none">{f.icon}</div>
                  <h3 className="font-display text-xl text-[#F0EDE6] mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-[#F0EDE6]/40 text-xs leading-relaxed" style={{ fontFamily: "Inter", lineHeight: "1.6" }}>
                    {f.desc}
                  </p>
                </div>
                <div className="mt-auto pt-6 flex items-center justify-between text-[#BEFF00] border-t border-[#F0EDE6]/5">
                  <span className="text-[9px] uppercase tracking-wider font-bold font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-300">Live Interactive Feature</span>
                  <span className="text-sm font-bold group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
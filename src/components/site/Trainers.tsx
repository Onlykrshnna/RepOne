import { useState, useEffect } from "react";
import { Reveal } from "./Reveal";
import { Smartphone, Laptop, QrCode, CreditCard, Activity, Globe, Check, AlertCircle } from "lucide-react";

type TabId = "member" | "admin" | "qr" | "payments" | "analytics" | "website";

export function Trainers() {
  const [activeTab, setActiveTab] = useState<TabId>("admin");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "approved">("pending");
  const [recentCheckins, setRecentCheckins] = useState([
    { name: "John Doe", time: "14:05 PM", status: "Active" },
    { name: "Sarah Connor", time: "13:58 PM", status: "Active" },
    { name: "Bruce Wayne", time: "13:42 PM", status: "Active" }
  ]);

  const tabs = [
    { id: "admin", label: "Admin Dashboard", icon: <Laptop className="w-5 h-5" />, desc: "Track revenue, manage memberships, and overview metrics in real-time." },
    { id: "member", label: "Member Portal", icon: <Smartphone className="w-5 h-5" />, desc: "Responsive mobile dashboard for schedules, bookings, and payments." },
    { id: "qr", label: "QR Attendance Scanner", icon: <QrCode className="w-5 h-5" />, desc: "Fast check-in scanner for tablet/counter setup with sound feedback." },
    { id: "payments", label: "Payment Verification", icon: <CreditCard className="w-5 h-5" />, desc: "Pipeline to verify manual bank transfers and online dues instantly." },
    { id: "analytics", label: "Analytics & Reports", icon: <Activity className="w-5 h-5" />, desc: "Deeper intelligence on customer retention and peak hours." },
    { id: "website", label: "Bespoke Gym Website", icon: <Globe className="w-5 h-5" />, desc: "Exquisite public landing page aligned with your gym brand identity." }
  ] as const;

  // Simulate automated check-in adding to list
  useEffect(() => {
    if (activeTab !== "qr") return;
    const interval = setInterval(() => {
      const names = ["Peter Parker", "Clark Kent", "Tony Stark", "Selina Kyle", "Diana Prince"];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setRecentCheckins(prev => [
        { name: randomName, time: `${now}`, status: "Active" },
        ...prev.slice(0, 2)
      ]);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <section id="showcase" className="relative py-32 md:py-48 bg-[#080809] overflow-hidden text-[#F0EDE6]">
      <div className="absolute top-1/4 -left-10 select-none pointer-events-none overflow-hidden" aria-hidden>
        <span className="font-display leading-none text-[#141418] font-bold" style={{ fontSize: "28vw", letterSpacing: "-0.05em" }}>03</span>
      </div>
      
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex items-center gap-4 mb-16 md:mb-24">
            <span className="font-display text-xl text-[#BEFF00]">03</span>
            <span className="block h-[1px] w-10 bg-[#F0EDE6]/15" />
            <span className="text-[#F0EDE6]/35" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Showcase</span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Tabs control column */}
          <div className="lg:col-span-4 space-y-4">
            <Reveal>
              <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-8 leading-tight">
                Experience the <br />
                <span className="italic text-[#BEFF00]">RepOne Platform</span>
              </h2>
            </Reveal>
            
            <div className="space-y-2">
              {tabs.map((tab, i) => (
                <Reveal key={tab.id} delay={i * 50}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-5 transition-all duration-300 border flex gap-4 items-start rounded ${
                      activeTab === tab.id 
                        ? "bg-[#BEFF00] text-[#080809] border-[#BEFF00] shadow-lg shadow-[#BEFF00]/10" 
                        : "bg-[#141418]/60 border-white/[0.04] hover:bg-[#141418] hover:border-white/[0.08]"
                    }`}
                  >
                    <div className={`mt-0.5 p-2 rounded ${activeTab === tab.id ? "bg-[#080809] text-[#BEFF00]" : "bg-white/[0.04] text-[#F0EDE6]/80"}`}>
                      {tab.icon}
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-medium leading-none mb-2">{tab.label}</h4>
                      <p className={`text-xs ${activeTab === tab.id ? "text-[#080809]/70" : "text-[#F0EDE6]/40"}`} style={{ fontFamily: "Inter", lineHeight: "1.4" }}>
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Interactive Screen Simulator Area */}
          <div className="lg:col-span-8 h-[600px] flex items-center justify-center bg-[#141418]/40 border border-white/[0.04] rounded-lg p-6 md:p-8 relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#BEFF00]/[0.02] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/[0.02] rounded-full blur-3xl" />
            
            <Reveal className="w-full h-full flex items-center justify-center">
              {/* --- TAB: ADMIN --- */}
              {activeTab === "admin" && (
                <div className="w-full max-w-2xl bg-[#080809] border border-white/[0.08] shadow-2xl rounded-lg overflow-hidden flex flex-col h-[480px]">
                  {/* Top header bar */}
                  <div className="bg-[#141418] px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[10px] text-white/30 font-sans tracking-wide bg-black/40 px-3 py-0.5 rounded">admin.repone.co/xyz-fitness</span>
                    <div className="w-4" />
                  </div>
                  {/* Dashboard body */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Mock Sidebar */}
                    <div className="w-40 border-r border-white/[0.06] bg-[#0c0c0e] p-4 hidden sm:block">
                      <div className="h-6 w-20 bg-white/[0.05] rounded mb-6" />
                      <div className="space-y-3">
                        <div className="h-3 bg-[#BEFF00]/10 rounded border border-[#BEFF00]/20" />
                        <div className="h-3 bg-white/[0.04] rounded" />
                        <div className="h-3 bg-white/[0.04] rounded" />
                        <div className="h-3 bg-white/[0.04] rounded" />
                      </div>
                    </div>
                    {/* Content area */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                        <div>
                          <h4 className="font-display text-xl">XYZ Fitness Dashboard</h4>
                          <span className="text-[9px] text-[#BEFF00]/70 uppercase tracking-widest font-sans font-bold">RepOne Analytics Engine</span>
                        </div>
                        <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] rounded font-bold">Live API</span>
                      </div>
                      
                      {/* Metric cards grid */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#141418] p-3 border border-white/[0.06] rounded">
                          <span className="text-white/40 text-[9px] uppercase tracking-wider block mb-1">Active Members</span>
                          <span className="text-2xl font-bold font-display text-white">412</span>
                        </div>
                        <div className="bg-[#141418] p-3 border border-white/[0.06] rounded">
                          <span className="text-white/40 text-[9px] uppercase tracking-wider block mb-1">Weekly Revenue</span>
                          <span className="text-2xl font-bold font-display text-[#BEFF00]">₹1.48L</span>
                        </div>
                        <div className="bg-[#141418] p-3 border border-white/[0.06] rounded">
                          <span className="text-white/40 text-[9px] uppercase tracking-wider block mb-1">Check-ins Today</span>
                          <span className="text-2xl font-bold font-display text-white">74</span>
                        </div>
                      </div>

                      {/* Mini graph block */}
                      <div className="bg-[#141418] p-4 border border-white/[0.06] rounded">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs uppercase tracking-wider font-semibold">Monthly MRR Growth</span>
                          <span className="text-[9px] text-green-400 font-bold">+18.4%</span>
                        </div>
                        <div className="h-20 flex gap-2 items-end pt-4">
                          <div className="flex-1 bg-white/10 h-8 rounded-sm" />
                          <div className="flex-1 bg-white/10 h-10 rounded-sm" />
                          <div className="flex-1 bg-white/10 h-14 rounded-sm" />
                          <div className="flex-1 bg-white/10 h-12 rounded-sm" />
                          <div className="flex-1 bg-[#BEFF00]/80 h-20 rounded-sm shadow-lg shadow-[#BEFF00]/10" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: MEMBER PORTAL --- */}
              {activeTab === "member" && (
                <div className="border-[8px] border-[#222] rounded-[36px] w-[270px] h-[520px] bg-[#080809] overflow-hidden relative shadow-2xl flex flex-col justify-between p-4 text-left border-t-[12px] border-b-[12px]">
                  {/* Internal Status Bar */}
                  <div className="flex justify-between items-center px-1 text-[9px] text-white/50 mb-2">
                    <span>9:41 AM</span>
                    <div className="flex gap-1">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest block">Welcome back</span>
                      <h4 className="font-display text-lg text-white">Aman Sharma</h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">AS</div>
                  </div>

                  {/* Membership Card */}
                  <div className="bg-gradient-to-br from-[#BEFF00]/20 to-[#BEFF00]/5 border border-[#BEFF00]/30 p-4 rounded-xl mb-4 relative overflow-hidden">
                    <span className="text-[9px] text-[#BEFF00] uppercase tracking-wider block font-bold mb-1">Active Membership</span>
                    <h5 className="font-display text-base font-bold text-white mb-2">XYZ Fitness &middot; Elite Tier</h5>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <span className="text-[8px] text-white/40 block">Expires</span>
                        <span className="text-[10px] text-white/80">31-Jul-2026</span>
                      </div>
                      <span className="px-2 py-0.5 bg-[#BEFF00] text-[#080809] text-[8px] rounded uppercase tracking-wider font-bold">VIP ACCESS</span>
                    </div>
                  </div>

                  {/* QR Card */}
                  <div className="bg-[#141418] border border-white/[0.08] p-4 rounded-xl text-center flex flex-col items-center justify-center flex-1">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest block mb-3">Scan to Check-in</span>
                    {/* Simulated SVG QR Code */}
                    <div className="bg-white p-2.5 rounded-lg mb-3">
                      <svg className="w-24 h-24 text-black" viewBox="0 0 100 100">
                        {/* QR Corners */}
                        <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                        <rect x="10" y="10" width="10" height="10" fill="white" />
                        <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                        <rect x="80" y="10" width="10" height="10" fill="white" />
                        <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                        <rect x="10" y="80" width="10" height="10" fill="white" />
                        {/* Fake bits */}
                        <rect x="40" y="10" width="20" height="10" fill="currentColor" />
                        <rect x="40" y="30" width="10" height="30" fill="currentColor" />
                        <rect x="70" y="40" width="20" height="10" fill="currentColor" />
                        <rect x="40" y="70" width="10" height="20" fill="currentColor" />
                        <rect x="60" y="80" width="30" height="10" fill="currentColor" />
                        <rect x="80" y="60" width="10" height="10" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="text-[9px] text-[#BEFF00] uppercase tracking-wider font-bold">QR Token Auto-updates</span>
                  </div>
                </div>
              )}

              {/* --- TAB: QR SCANNERS --- */}
              {activeTab === "qr" && (
                <div className="w-full max-w-md bg-[#080809] border border-white/[0.08] p-6 shadow-2xl rounded-xl text-center flex flex-col h-[420px] justify-between">
                  <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                    <span className="text-[9px] text-[#BEFF00] uppercase tracking-widest font-bold font-sans">Front Counter Check-in</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  
                  {/* Scanner Graphic */}
                  <div className="my-6 relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#BEFF00]/30 rounded bg-[#141418]/40 flex-1">
                    <QrCode className="w-20 h-20 text-[#BEFF00]/40 mb-3 animate-pulse" />
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#BEFF00] shadow-lg shadow-[#BEFF00] animate-bounce" />
                    <span className="text-xs text-white/50 font-sans">Hold Member QR Card to Scanner Camera</span>
                  </div>

                  {/* Live Feed Checkins list */}
                  <div className="bg-[#141418] p-3 border border-white/[0.06] rounded text-left">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider block mb-2">Recent check-ins</span>
                    <div className="space-y-1.5">
                      {recentCheckins.map((checkin, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs animate-fade-in border-b border-white/[0.02] pb-1.5 last:border-0 last:pb-0">
                          <span className="font-semibold text-white">{checkin.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40">{checkin.time}</span>
                            <span className="w-1.5 h-1.5 bg-[#BEFF00] rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: PAYMENTS --- */}
              {activeTab === "payments" && (
                <div className="w-full max-w-lg bg-[#080809] border border-white/[0.08] p-6 shadow-2xl rounded-xl flex flex-col h-[400px] justify-between text-left">
                  <div>
                    <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 mb-6">
                      <div>
                        <h4 className="font-display text-lg">Manual Payment Approvals</h4>
                        <span className="text-[8px] text-white/40 uppercase tracking-widest font-sans">Verification Pipeline</span>
                      </div>
                      <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[8px] rounded font-bold font-sans">1 Pending Action</span>
                    </div>

                    {/* Pending Request card */}
                    <div className="bg-[#141418] p-5 border border-white/[0.06] rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] text-white/40 block">Member</span>
                          <span className="font-semibold text-white">Rohit Malhotra</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#BEFF00] block font-bold">Premium Tier</span>
                          <span className="font-display text-lg text-white">₹2,999</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-b border-white/[0.04] py-3 my-3 text-xs">
                        <div>
                          <span className="text-white/40 text-[9px] block mb-0.5">Reference No</span>
                          <span className="font-sans font-mono tracking-tight text-white">TXN_98723912</span>
                        </div>
                        <div>
                          <span className="text-white/40 text-[9px] block mb-0.5">Submitted</span>
                          <span className="font-sans text-white">Today, 11:20 AM</span>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end mt-4">
                        {paymentStatus === "pending" ? (
                          <>
                            <button onClick={() => {}} className="px-3.5 py-1.5 text-xs border border-white/10 hover:border-red-500/50 hover:text-red-400 transition-colors text-white/60">
                              Reject
                            </button>
                            <button 
                              onClick={() => setPaymentStatus("approved")}
                              className="px-4 py-1.5 bg-[#BEFF00] text-[#080809] hover:bg-white text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              Verify & Approve
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-green-400 text-xs font-bold bg-green-500/10 border border-green-500/25 px-4 py-2 w-full justify-center rounded">
                            <Check className="w-4 h-4" />
                            <span>Payment Verified! Invoice Sent to Rohit</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {paymentStatus === "approved" && (
                    <button 
                      onClick={() => setPaymentStatus("pending")} 
                      className="text-[9px] text-[#BEFF00]/50 hover:text-[#BEFF00] transition-colors text-center font-sans uppercase font-bold"
                    >
                      Reset Demo State
                    </button>
                  )}
                </div>
              )}

              {/* --- TAB: ANALYTICS --- */}
              {activeTab === "analytics" && (
                <div className="w-full max-w-lg bg-[#080809] border border-white/[0.08] p-6 shadow-2xl rounded-xl flex flex-col h-[440px] justify-between text-left">
                  <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 mb-6">
                    <div>
                      <h4 className="font-display text-lg">Retention & Class Analytics</h4>
                      <span className="text-[8px] text-white/40 uppercase tracking-widest font-sans">Business Intelligence</span>
                    </div>
                    <span className="text-white/30 text-[10px] font-sans">Last 30 Days</span>
                  </div>

                  {/* Graphs container */}
                  <div className="space-y-6 flex-1">
                    {/* Retention line */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/50">Member Retention Rate</span>
                        <span className="font-bold text-[#BEFF00]">96.8%</span>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#BEFF00] rounded-full shadow-lg shadow-[#BEFF00]/20" style={{ width: "96.8%" }} />
                      </div>
                    </div>

                    {/* Classes popularity chart */}
                    <div>
                      <span className="text-white/50 text-xs block mb-3">Popular Coached Hours</span>
                      <div className="space-y-2">
                        {[
                          { hour: "06:00 AM - Morning Strength", cap: 90, val: "90%" },
                          { hour: "05:30 PM - Coached HIIT", cap: 75, val: "75%" },
                          { hour: "07:30 PM - Conditioning Zone", cap: 50, val: "50%" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-36 text-[10px] text-white/60 truncate">{item.hour}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-white/30 rounded-full" style={{ width: `${item.cap}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-white/80 w-6 text-right">{item.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#141418] p-3 border border-white/[0.04] rounded flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#BEFF00] shrink-0" />
                    <span className="text-[10px] text-white/50 leading-relaxed font-sans">
                      Peak check-in alert: Friday 06:00 AM has historically seen 92% occupancy. We suggest auto-allocating secondary trainers.
                    </span>
                  </div>
                </div>
              )}

              {/* --- TAB: WEBSITE --- */}
              {activeTab === "website" && (
                <div className="w-full max-w-lg bg-white text-[#080809] border border-white/10 shadow-2xl rounded-lg overflow-hidden flex flex-col h-[400px]">
                  {/* Mock Browser bar */}
                  <div className="bg-neutral-100 px-4 py-2.5 flex items-center justify-between border-b border-neutral-200">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-neutral-300" />
                      <div className="w-2 h-2 rounded-full bg-neutral-300" />
                      <div className="w-2 h-2 rounded-full bg-neutral-300" />
                    </div>
                    <span className="text-[9px] text-neutral-400 font-sans tracking-wide">xyzfitness.com</span>
                    <div className="w-4" />
                  </div>
                  {/* Public Site mockup */}
                  <div className="flex-1 flex flex-col justify-between p-8 bg-[#F8F7F4] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-neutral-200 rounded-full blur-3xl opacity-60" />
                    
                    <div>
                      {/* Logo placeholder */}
                      <span className="font-display font-bold text-lg tracking-tight block mb-8">XYZ FITNESS</span>
                      <h4 className="font-display text-3xl font-medium tracking-tight mb-4 max-w-sm leading-none" style={{ letterSpacing: "-0.01em" }}>
                        Pushing boundaries <br /><span className="italic text-neutral-400">every single day.</span>
                      </h4>
                      <p className="text-neutral-500 text-xs max-w-xs leading-relaxed" style={{ fontFamily: "Inter" }}>
                        Private coached training and premium facility recovery tools built for physical excellence. London.
                      </p>
                    </div>

                    <div className="flex gap-4 border-t border-neutral-200/60 pt-6 mt-6">
                      <span className="text-[9px] uppercase tracking-wider font-semibold font-sans text-neutral-400">100% white-label client frontend</span>
                    </div>
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

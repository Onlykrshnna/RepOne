export function Footer() {
  return (
    <footer className="bg-[#080809] pt-24 pb-12 border-t border-[#F0EDE6]/10 text-[#F0EDE6]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 text-left">
        <div className="md:col-span-2">
          <img src="/logo.png" alt="Logo" className="h-10 object-contain block mb-6" />
          <p className="text-[#F0EDE6]/40 max-w-sm" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.7" }}>
            A premium gym management platform designed to automate operations, reconcile payments, and elevate member experiences. Powered by WebForge.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <span className="text-[#F0EDE6]/30 mb-2" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Products</span>
          <div className="flex flex-col gap-2" style={{ fontFamily: "Inter", fontSize: "13px" }}>
            <span className="text-[#F0EDE6]/70">Gym Website</span>
            <span className="text-[#F0EDE6]/70">Admin Dashboard</span>
            <span className="text-[#F0EDE6]/70">Member Portal</span>
            <span className="text-[#F0EDE6]/70">QR Attendance</span>
            <span className="text-[#F0EDE6]/70">Payments Pipeline</span>
            <span className="text-[#F0EDE6]/70">Analytics Engine</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-[#F0EDE6]/30 mb-2" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Support & Social</span>
          <a href="mailto:hello@repone.co" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "13px" }}>hello@repone.co</a>
          <a href="#" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "13px" }}>Instagram</a>
          <a href="#" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "13px" }}>LinkedIn</a>
        </div>
      </div>
      
      <div className="mt-24 pt-8 border-t border-[#F0EDE6]/10 flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-12 mx-auto max-w-[1440px]">
        <span className="text-[#F0EDE6]/30" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          &copy; {new Date().getFullYear()} RepOne. POWERED BY WEBFORGE. ALL RIGHTS RESERVED.
        </span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Terms</a>
          <a href="#" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Privacy</a>
        </div>
      </div>
    </footer>
  );
}

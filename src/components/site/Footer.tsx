import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-[#080809] pt-24 pb-12 border-t border-[#F0EDE6]/10 text-[#F0EDE6]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 text-left">
        <div>
          <img src="/logo.png" alt="Logo" className="h-20 object-contain block mb-6" />
          <p className="text-[#F0EDE6]/40" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.7" }}>
            A premium gym management platform designed to automate operations, reconcile payments, and elevate member experiences. Powered by WebForge.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <span className="text-[#F0EDE6]/30 mb-2" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Products & Features</span>
          <div className="flex flex-col gap-2" style={{ fontFamily: "Inter", fontSize: "13px" }}>
            <Link to="/" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Gym Website</Link>
            <Link to="/features/membership-management" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Membership Management</Link>
            <Link to="/features/member-app" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Member App</Link>
            <Link to="/features/qr-attendance" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">QR Attendance</Link>
            <Link to="/features/payments" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Payments Pipeline</Link>
            <Link to="/features/branding-white-label" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">White-Label Branding</Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-[#F0EDE6]/30 mb-2" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Target Audiences</span>
          <div className="flex flex-col gap-2" style={{ fontFamily: "Inter", fontSize: "13px" }}>
            <Link to="/for-gym-owners" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Independent Gyms</Link>
            <Link to="/for-boutique-studios" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Boutique Studios</Link>
            <Link to="/for-gym-chains" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Enterprise Chains</Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-[#F0EDE6]/30 mb-2" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Company & Support</span>
          <div className="flex flex-col gap-2" style={{ fontFamily: "Inter", fontSize: "13px" }}>
            <Link to="/about" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">About Us</Link>
            <Link to="/testimonials" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Reviews</Link>
            <Link to="/compare" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Alternative Comparisons</Link>
            <Link to="/contact" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Contact</Link>
            <Link to="/support" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors">Support & Guides</Link>
          </div>
        </div>
      </div>
      
      <div className="mt-24 pt-8 border-t border-[#F0EDE6]/10 flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-12 mx-auto max-w-[1440px]">
        <span className="text-[#F0EDE6]/30" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          &copy; {new Date().getFullYear()} RepOne. POWERED BY WEBFORGE. ALL RIGHTS RESERVED.
        </span>
        <div className="flex items-center gap-6">
          <Link to="/terms-of-service" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Terms</Link>
          <Link to="/privacy-policy" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Privacy</Link>
          <Link to="/refund-policy" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Refunds</Link>
        </div>
      </div>
    </footer>
  );
}

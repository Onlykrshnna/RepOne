export function Footer() {
  return (
    <footer className="bg-[#080809] pt-24 pb-12 border-t border-[#F0EDE6]/10 text-[#F0EDE6]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
        <div className="md:col-span-2">
          <span className="font-display text-[#F0EDE6] text-4xl tracking-tight leading-none block mb-6">
            ATLAS
          </span>
          <p className="text-[#F0EDE6]/40 max-w-sm" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.7" }}>
            A high-performance demonstration project built to showcase the design and engineering capabilities of Web Forge.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <span className="text-[#F0EDE6]/30 mb-2" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Location</span>
          <p className="text-[#F0EDE6]/70" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.7" }}>
            Global Operations<br />
            San Francisco, CA<br />
            United States
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-[#F0EDE6]/30 mb-2" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Contact</span>
          <a href="mailto:hello@webforge.com" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "13px" }}>hello@webforge.com</a>
          <a href="tel:+18005550199" className="text-[#F0EDE6]/70 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "13px" }}>+1 (800) 555-0199</a>
        </div>
      </div>
      
      <div className="mt-24 pt-8 border-t border-[#F0EDE6]/10 flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-12 mx-auto max-w-[1440px]">
        <span className="text-[#F0EDE6]/30" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          &copy; {new Date().getFullYear()} DESIGNED & DEVELOPED BY WEB FORGE.
        </span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Instagram</a>
          <a href="#" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Terms</a>
          <a href="#" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Privacy</a>
        </div>
      </div>
    </footer>
  );
}

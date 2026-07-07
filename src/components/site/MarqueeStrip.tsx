interface MarqueeStripProps {
  items?: string[];
  className?: string;
  textColor?: string;
  dotColor?: string;
}

const DEFAULT_ITEMS = [
  "QR ATTENDANCE", "PAYMENTS", "MEMBERSHIPS", "ADMIN DASHBOARD",
  "MOBILE APP", "ANALYTICS", "RepOne",
];

export function MarqueeStrip({
  items = DEFAULT_ITEMS,
  className = "",
  textColor = "text-[#0E0E10]/18 dark:text-[#F0EDE6]/12",
  dotColor = "text-[#BEFF00]",
}: MarqueeStripProps) {
  const tripled = [...items, ...items, ...items, ...items];
  return (
    <div
      className={`overflow-hidden border-t border-b border-[#0E0E10]/8 dark:border-[#F0EDE6]/6 py-4 bg-[#ECEAE4] dark:bg-[#0A0A0C] ${className}`}
    >
      <div className="animate-marquee flex whitespace-nowrap">
        {tripled.map((item, i) => (
          <span key={i} className={`font-display italic text-lg flex-shrink-0 ${textColor}`}>
            {item}
            <span className={`mx-8 not-italic font-normal text-sm ${dotColor}`}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
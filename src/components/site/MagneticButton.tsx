import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: "gold" | "ghost";
};

export function MagneticButton({ children, className, href, onClick, variant = "gold" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0,0)";
  };

  const base =
    "group relative inline-flex items-center justify-center gap-3 px-9 py-5 text-[11px] tracking-[0.28em] uppercase font-medium transition-colors duration-500 overflow-hidden";
  const styles =
    variant === "gold"
      ? "bg-gold text-ink hover:bg-bone"
      : "text-bone border border-bone/25 hover:border-gold hover:text-gold";

  const inner = (
    <span
      ref={ref}
      className="relative z-10 inline-flex items-center gap-3 transition-transform duration-500 ease-out"
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <a href={href} onMouseMove={onMove} onMouseLeave={onLeave} className={cn(base, styles, className)}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} onMouseMove={onMove} onMouseLeave={onLeave} className={cn(base, styles, className)}>
      {inner}
    </button>
  );
}

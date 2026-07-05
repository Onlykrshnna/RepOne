import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AmbientEmissions() {
  const [particles, setParticles] = useState<{ id: number; size: number; x: number; y: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 400 + 100, // Large glowing orbs
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full mix-blend-screen opacity-30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `radial-gradient(circle, rgba(190, 255, 0, 0.15) 0%, rgba(190, 255, 0, 0) 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            x: ["-10%", "10%", "-5%", "15%", "-10%"],
            y: ["-10%", "15%", "-15%", "5%", "-10%"],
            scale: [1, 1.2, 0.8, 1.1, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

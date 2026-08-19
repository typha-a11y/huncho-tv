import { motion } from "motion/react";
import { Flame } from "lucide-react";
import { cn } from "../lib/utils";

interface AnimatedFlameProps {
  className?: string;
  size?: number;
}

/**
 * AnimatedFlame: Renders an eye-catching, flickering, glowing flame animation 
 * using Framer Motion with smooth organic scaling, rotation, and dynamic fire glow.
 */
export function AnimatedFlame({ 
  className = "w-4 h-4 text-amber-500 fill-amber-500", 
  size 
}: AnimatedFlameProps) {
  return (
    <motion.span
      className="inline-flex items-center justify-center shrink-0 origin-bottom select-none"
      animate={{
        scale: [1, 1.15, 0.95, 1.18, 1.02, 1],
        rotate: [-3, 4, -4, 3, -1, -3],
        y: [0, -1.2, 0.5, -1.8, -0.4, 0],
        filter: [
          "drop-shadow(0 0 2px rgba(245, 158, 11, 0.4)) brightness(1)",
          "drop-shadow(0 0 5px rgba(239, 68, 68, 0.75)) brightness(1.2)",
          "drop-shadow(0 0 3px rgba(245, 158, 11, 0.5)) brightness(1.05)",
          "drop-shadow(0 0 7px rgba(249, 115, 22, 0.85)) brightness(1.25)",
          "drop-shadow(0 0 3px rgba(245, 158, 11, 0.6)) brightness(1.1)",
          "drop-shadow(0 0 2px rgba(245, 158, 11, 0.4)) brightness(1)",
        ]
      }}
      transition={{
        duration: 1.3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Flame className={cn("shrink-0", className)} size={size} />
    </motion.span>
  );
}

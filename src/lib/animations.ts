import { Variants } from "motion/react";

/**
 * High-fidelity spring configurations for natural micro-interactions.
 * Avoiding linear movement for a premium "human" feel.
 */
export const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

export const bounceConfig = {
  type: "spring",
  stiffness: 400,
  damping: 10,
} as const;

/**
 * Reusable variants for staggered grid layouts.
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    filter: "blur(10px)" 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: springConfig
  },
} as const;

/**
 * 3D Hover effect with perspective transform.
 * Implementation note: Apply 'perspective-1000' to the parent container.
 */
export const hover3D = {
  whileHover: { 
    scale: 1.02,
    rotateX: -2,
    rotateY: 2,
    z: 10,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  whileTap: { scale: 0.98 }
} as const;

/**
 * Button micro-interactions.
 */
export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.95 },
};

/**
 * Use this to check for reduced motion within variants if needed,
 * although Framer Motion honors the system 'prefers-reduced-motion' setting 
 * for its built-in animations.
 */
export const accessibleFade: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

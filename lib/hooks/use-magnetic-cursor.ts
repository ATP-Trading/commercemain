/**
 * useMagneticCursor Hook
 * 
 * Creates a magnetic effect where elements subtly follow the cursor
 * when hovering, giving a premium interactive feel.
 * 
 * Used for CTAs, buttons, and featured elements to create
 * a distinctive luxury interaction pattern.
 */

'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useMotionValue, useSpring, MotionValue } from 'framer-motion';

interface MagneticConfig {
  /** Strength of the magnetic pull (0-1). Default: 0.3 */
  strength?: number;
  /** How far the effect extends outside the element (px). Default: 50 */
  radius?: number;
  /** Spring damping for smooth movement. Default: 25 */
  damping?: number;
  /** Spring stiffness for responsiveness. Default: 300 */
  stiffness?: number;
  /** Mass for physical feel. Default: 0.5 */
  mass?: number;
  /** Enable scale effect on hover. Default: true */
  scale?: boolean;
  /** Scale amount on hover. Default: 1.02 */
  scaleAmount?: number;
}

interface MagneticReturn {
  /** Ref to attach to the element */
  ref: React.RefObject<HTMLElement>;
  /** X transform motion value */
  x: MotionValue<number>;
  /** Y transform motion value */
  y: MotionValue<number>;
  /** Scale motion value */
  scale: MotionValue<number>;
  /** Whether currently in magnetic range */
  isActive: boolean;
  /** Event handlers to spread on element */
  handlers: {
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onMouseEnter: () => void;
  };
}

export function useMagneticCursor(config: MagneticConfig = {}): MagneticReturn {
  const {
    strength = 0.3,
    radius = 50,
    damping = 25,
    stiffness = 300,
    mass = 0.5,
    scale: enableScale = true,
    scaleAmount = 1.02,
  } = config;

  const ref = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(false);

  // Raw motion values
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawScale = useMotionValue(1);
  const neutralScale = useMotionValue(1);

  // Spring configuration for smooth animation
  const springConfig = { damping, stiffness, mass };

  // Sprung values for smooth movement
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);
  const scale = useSpring(rawScale, { damping: 30, stiffness: 400 });

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || prefersReducedMotion) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Check if within radius
      const maxDistance = Math.max(rect.width, rect.height) / 2 + radius;
      
      if (distance < maxDistance) {
        // Calculate magnetic pull based on distance
        const pull = 1 - Math.min(distance / maxDistance, 1);
        const moveX = deltaX * strength * pull;
        const moveY = deltaY * strength * pull;

        rawX.set(moveX);
        rawY.set(moveY);
        setIsActive(true);
      }
    },
    [strength, radius, rawX, rawY, prefersReducedMotion]
  );

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    rawScale.set(1);
    setIsActive(false);
  }, [rawX, rawY, rawScale]);

  const onMouseEnter = useCallback(() => {
    if (enableScale && !prefersReducedMotion) {
      rawScale.set(scaleAmount);
    }
    setIsActive(true);
  }, [enableScale, scaleAmount, rawScale, prefersReducedMotion]);

  return {
    ref: ref as React.RefObject<HTMLElement>,
    x,
    y,
    scale: enableScale ? scale : neutralScale,
    isActive,
    handlers: {
      onMouseMove,
      onMouseLeave,
      onMouseEnter,
    },
  };
}

/**
 * Simplified hook for just magnetic button effect
 */
export function useMagneticButton(strength: number = 0.2) {
  return useMagneticCursor({
    strength,
    radius: 30,
    damping: 20,
    stiffness: 400,
    scale: true,
    scaleAmount: 1.03,
  });
}

export default useMagneticCursor;

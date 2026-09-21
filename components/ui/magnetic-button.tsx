'use client';

import * as React from 'react';
import { m, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMagneticCursor } from '@/lib/hooks/use-magnetic-cursor';

interface MagneticButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold' | 'gold-hero' | 'outline-light' | 'outline-gold';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
  /** Strength of the magnetic pull (0-1) */
  strength?: number;
  /** Component to render as. Defaults to 'button'. Use 'div' when nested inside a Link. */
  as?: 'button' | 'div';
}

const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    strength = 0.2,
    asChild = false,
    as = 'button',
    ...props
  }, ref) => {
    const Component = (as === 'div' ? m.div : m.button) as React.ElementType;
    const { ref: magneticRef, x, y, handlers } = useMagneticCursor({
      strength,
      scale: true,
      scaleAmount: 1.05,
    });

    // Merge refs if needed (though we mostly rely on magneticRef being the primary one attached to m.button)
    // For simplicity, we attach magneticRef to the button.
    // If the user provided a ref, we'd need to compose them.
    React.useImperativeHandle(ref, () => magneticRef.current as HTMLButtonElement);

    const variants = {
      primary: 'bg-black text-white hover:bg-neutral-900 border border-transparent dark:bg-white dark:text-black dark:hover:bg-neutral-100',
      secondary: 'bg-white text-black hover:bg-neutral-100 border border-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700',
      ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-900 dark:text-white dark:hover:bg-neutral-800',
      outline: 'bg-transparent border border-neutral-300 hover:bg-neutral-50 text-neutral-900 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800/50',
      gold: 'bg-[#d4af37] text-black hover:bg-[#e5c354] border border-transparent shadow-lg shadow-[#d4af37]/20',
      // Hero-specific variants for dark backgrounds - using direct hex for reliability
      'gold-hero': 'bg-[#d4af37] text-black hover:bg-[#e5c354] border border-transparent shadow-lg shadow-[#d4af37]/30 hover:shadow-xl hover:shadow-[#d4af37]/40',
      'outline-light': 'bg-transparent border-2 border-white/80 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm',
      'outline-gold': 'bg-transparent border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-8 text-base',
      lg: 'h-14 px-10 text-lg',
      icon: 'h-11 w-11 p-0 flex items-center justify-center',
    };

    return (
      <Component
        ref={magneticRef}
        style={{ x, y }}
        className={cn(
          'relative overflow-hidden rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 group inline-flex items-center justify-center',
          variants[variant],
          sizes[size],
          className
        )}
        whileTap={{ scale: 0.95 }}
        {...handlers}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>

        {/* Luxury shine sweep effect */}
        <span className="absolute inset-0 z-0 overflow-hidden rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="absolute top-0 -left-[100%] h-full w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transition-all duration-700 ease-out group-hover:animate-shine" />
        </span>
      </Component>
    );
  }
);

MagneticButton.displayName = 'MagneticButton';

export { MagneticButton };

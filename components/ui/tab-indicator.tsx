'use client';

import { m, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { transitions } from '@/lib/animations/variants';
import type { ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface TabsWithIndicatorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** Unique layoutId prefix for this instance */
  layoutId?: string;
  className?: string;
  tabClassName?: string;
  indicatorClassName?: string;
}

/**
 * Premium animated tab navigation with sliding indicator
 * Uses Framer Motion layoutId for smooth transitions
 */
export function TabsWithIndicator({
  tabs,
  activeTab,
  onTabChange,
  layoutId = 'tab-indicator',
  className,
  tabClassName,
  indicatorClassName,
}: TabsWithIndicatorProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-full glass',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            id={`${layoutId}-${tab.id}-tab`}
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-controls={`${layoutId}-panel`}
            onKeyDown={(event) => {
              const rtl = event.currentTarget.closest("[dir]")?.getAttribute("dir") === "rtl";
              const nextKey = rtl ? "ArrowLeft" : "ArrowRight";
              const previousKey = rtl ? "ArrowRight" : "ArrowLeft";
              if (![nextKey, previousKey, "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const index = tabs.findIndex(item => item.id === tab.id);
              const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
                : (index + (event.key === nextKey ? 1 : -1) + tabs.length) % tabs.length;
              onTabChange(tabs[next].id);
              const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]");
              buttons?.[next]?.focus();
            }}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors',
              isActive
                ? 'text-atp-black'
                : 'text-atp-white/70 hover:text-atp-white',
              tabClassName
            )}
          >
            {/* Sliding indicator background */}
            {isActive && (
              <m.div
                layoutId={layoutId}
                className={cn(
                  'absolute inset-0 rounded-full bg-atp-gold pointer-events-none',
                  indicatorClassName
                )}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : transitions.spring
                }
              />
            )}
            
            {/* Tab content */}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && (
                <span className="flex-shrink-0">{tab.icon}</span>
              )}
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default TabsWithIndicator;

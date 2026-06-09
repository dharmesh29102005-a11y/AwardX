import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HOLD_MS = 550;

interface HoldToggleNavItemProps {
  navId: string;
  demoTarget?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  currentView: string;
  collapsed: boolean;
  holdHint: string;
  onNavigate: () => void;
  onHoldToggle: () => void;
}

export const HoldToggleNavItem: React.FC<HoldToggleNavItemProps> = ({
  navId,
  demoTarget,
  label,
  icon: Icon,
  currentView,
  collapsed,
  holdHint,
  onNavigate,
  onHoldToggle,
}) => {
  const isActive = currentView === navId;
  const [isHovering, setIsHovering] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdRafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const didHoldToggleRef = useRef(false);

  const showHint = isHovering && isActive && !collapsed && holdProgress === 0;

  const clearHold = useCallback(() => {
    if (holdRafRef.current != null) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    holdStartRef.current = null;
    setHoldProgress(0);
  }, []);

  const startHold = useCallback(() => {
    if (!isActive || collapsed) return;
    didHoldToggleRef.current = false;
    holdStartRef.current = performance.now();

    const step = () => {
      if (holdStartRef.current == null) return;
      const progress = Math.min(1, (performance.now() - holdStartRef.current) / HOLD_MS);
      setHoldProgress(progress);
      if (progress >= 1) {
        clearHold();
        didHoldToggleRef.current = true;
        onHoldToggle();
        return;
      }
      holdRafRef.current = requestAnimationFrame(step);
    };

    holdRafRef.current = requestAnimationFrame(step);
  }, [isActive, collapsed, clearHold, onHoldToggle]);

  const handleClick = () => {
    if (didHoldToggleRef.current) {
      didHoldToggleRef.current = false;
      return;
    }
    onNavigate();
  };

  return (
    <div
      className="mb-1 relative"
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => {
        setIsHovering(false);
        clearHold();
      }}
    >
      <button
        type="button"
        data-demo-target={demoTarget || `nav-${navId}`}
        onClick={handleClick}
        onPointerDown={(e) => {
          if (!isActive || collapsed) return;
          e.preventDefault();
          startHold();
        }}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        onContextMenu={(e) => e.preventDefault()}
        aria-current={isActive ? 'page' : undefined}
        className={`group relative w-full flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        } px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
        }`}
        title={collapsed ? label : undefined}
      >
        {holdProgress > 0 && (
          <span
            className="absolute inset-0 rounded-xl pointer-events-none opacity-30"
            style={{
              background: `conic-gradient(from -90deg, rgb(79 70 229) ${holdProgress * 360}deg, transparent ${holdProgress * 360}deg)`,
            }}
            aria-hidden
          />
        )}

        <div className={`relative flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <Icon
            className={`w-5 h-5 transition-colors ${
              isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          {!collapsed && <span>{label}</span>}
        </div>

        {!collapsed && isActive && (
          <motion.div
            layoutId="active-nav"
            className="relative w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          />
        )}
      </button>

      <AnimatePresence>
        {showHint && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-[calc(100%+0.5rem)] top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg pointer-events-none"
          >
            {holdHint}
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

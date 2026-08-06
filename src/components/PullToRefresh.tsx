import React, { useState, useRef, useCallback } from "react";
import { motion, useAnimation } from "motion/react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, children, threshold = 65 }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const isPulling = useRef(false);
  const controls = useAnimation();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only trigger if at top of page
    if (window.scrollY <= 2) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    } else {
      touchStartY.current = null;
      isPulling.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || touchStartY.current === null || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    if (deltaY > 0 && window.scrollY <= 2) {
      // Damped formula for rubber-band feel
      const distance = Math.min(Math.pow(deltaY, 0.85) * 1.5, threshold * 1.8);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } catch (err) {
        console.error("Refresh error:", err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen"
    >
      {/* Refresh Indicator Header */}
      <motion.div
        className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center pointer-events-none"
        animate={{
          y: isRefreshing ? 16 : pullDistance > 0 ? pullDistance - 20 : -40,
          opacity: isRefreshing || pullDistance > 10 ? 1 : 0,
          scale: isRefreshing ? 1 : Math.max(0.6, progress),
        }}
        transition={
          isRefreshing || pullDistance === 0
            ? { type: "spring", stiffness: 300, damping: 25 }
            : { duration: 0 }
        }
      >
        <div className="bg-white/95 backdrop-blur-md text-indigo-600 shadow-md border border-slate-200/80 rounded-full px-3.5 py-2 flex items-center gap-2">
          <RefreshCw
            className={`w-4 h-4 text-indigo-600 ${
              isRefreshing
                ? "animate-spin"
                : ""
            }`}
            style={{
              transform: !isRefreshing ? `rotate(${progress * 360}deg)` : undefined,
            }}
          />
          <span className="text-[11px] font-bold text-slate-700 select-none">
            {isRefreshing
              ? "Updating content..."
              : progress >= 1
              ? "Release to refresh"
              : "Pull to refresh"}
          </span>
        </div>
      </motion.div>

      {/* Main Content pushed down slightly during pull */}
      <motion.div
        animate={{
          y: isRefreshing ? threshold * 0.6 : pullDistance * 0.4,
        }}
        transition={
          isRefreshing || pullDistance === 0
            ? { type: "spring", stiffness: 300, damping: 25 }
            : { duration: 0 }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Crown, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  AlertTriangle, 
  X, 
  Trash2, 
  Smartphone,
  RefreshCw,
  Zap,
  Flame,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../lib/store";
import { syncUserProfile } from "../lib/syncService";
import { useModalAccessibility } from "../hooks/useModalAccessibility";

interface VipDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgradePlans: () => void;
}

export function VipDetailsModal({ isOpen, onClose, onOpenUpgradePlans }: VipDetailsModalProps) {
  const { user, setUser } = useStore();
  const [activeTab, setActiveTab] = useState<"overview" | "expiry" | "cancel">("overview");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  
  // Dynamic live clock for accurate real-time countdown
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!isOpen) return;
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Always reset cancellation flags and active tab when modal is opened or plan changes
  useEffect(() => {
    if (isOpen) {
      setCancelSuccess(false);
      setActiveTab("overview");
      setIsCancelling(false);
    }
  }, [isOpen, user?.is_pro, user?.plan_type, user?.plan_name]);

  const { modalRef, modalProps } = useModalAccessibility({
    isOpen,
    onClose: () => {
      setCancelSuccess(false);
      setActiveTab("overview");
      setIsCancelling(false);
      onClose();
    }
  });

  // Calculate accurate live expiry & timeline metrics
  const timelineInfo = useMemo(() => {
    const now = currentTime;
    let expiryDate: Date;

    if (user?.plan_expires_at) {
      const parsed = new Date(user.plan_expires_at);
      expiryDate = isNaN(parsed.getTime()) 
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) 
        : parsed;
    } else {
      // Default to 30 days ahead
      expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    // Determine total cycle duration in milliseconds
    const pType = (user?.plan_type || "").toLowerCase();
    const pName = (user?.plan_name || "").toLowerCase();

    let totalDurationMs = 30 * 24 * 60 * 60 * 1000; // default monthly (30 days)
    let planCategoryLabel = "Kifurushi cha Mwezi (30 Days)";

    if (pType === "yearly" || pName.includes("mwaka") || pName.includes("year")) {
      totalDurationMs = 365 * 24 * 60 * 60 * 1000;
      planCategoryLabel = "Kifurushi cha Mwaka (365 Days)";
    } else if (pType === "weekly" || pName.includes("wiki") || pName.includes("week")) {
      totalDurationMs = 7 * 24 * 60 * 60 * 1000;
      planCategoryLabel = "Kifurushi cha Wiki (7 Days)";
    } else if (pType === "daily" || pName.includes("siku") || pName.includes("day") || pName.includes("masaa")) {
      totalDurationMs = 24 * 60 * 60 * 1000;
      planCategoryLabel = "Kifurushi cha Siku (24 Hours)";
    } else if (pType === "monthly" || pName.includes("mwezi") || pName.includes("month")) {
      totalDurationMs = 30 * 24 * 60 * 60 * 1000;
      planCategoryLabel = "Kifurushi cha Mwezi (30 Days)";
    }

    // Calculated cycle start date
    const cycleStartDate = new Date(expiryDate.getTime() - totalDurationMs);
    const diffMs = expiryDate.getTime() - now.getTime();
    const isExpired = diffMs <= 0;

    // Elapsed vs Remaining math
    const elapsedMs = isExpired 
      ? totalDurationMs 
      : Math.min(totalDurationMs, Math.max(0, now.getTime() - cycleStartDate.getTime()));
    
    // Progress percentage: 0% at start of cycle, up to 100% when expired
    const elapsedPercent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));
    
    // Time components
    const totalRemainingSec = Math.max(0, Math.floor(diffMs / 1000));
    const days = Math.floor(totalRemainingSec / 86400);
    const hours = Math.floor((totalRemainingSec % 86400) / 3600);
    const minutes = Math.floor((totalRemainingSec % 3600) / 60);
    const seconds = totalRemainingSec % 60;

    // User-friendly badge text with proper singular/plural grammar
    let badgeText = "";
    let subtitleText = "";
    let urgencyColor = "bg-amber-500 text-white";

    if (isExpired) {
      badgeText = "Plan Expired";
      subtitleText = "Your subscription has ended. Renew now to restore VIP privileges.";
      urgencyColor = "bg-rose-600 text-white";
    } else if (days >= 2) {
      badgeText = `${days} Days Left`;
      subtitleText = `${days} days remaining on this cycle`;
      urgencyColor = "bg-emerald-600 text-white";
    } else if (days === 1) {
      if (hours > 0) {
        badgeText = `1 Day ${hours}h Left`;
        subtitleText = `1 day and ${hours} hours remaining on this cycle`;
      } else {
        badgeText = `1 Day Left`;
        subtitleText = `1 day remaining on this cycle`;
      }
      urgencyColor = "bg-amber-500 text-white";
    } else {
      // Less than 24 hours remaining
      if (hours > 0) {
        badgeText = `${hours} Hour${hours === 1 ? "" : "s"} Left`;
        subtitleText = `${hours} hour${hours === 1 ? "" : "s"} and ${minutes} min${minutes === 1 ? "" : "s"} remaining on this cycle`;
        urgencyColor = hours <= 3 ? "bg-rose-500 text-white animate-pulse" : "bg-amber-500 text-white";
      } else if (minutes > 0) {
        badgeText = `${minutes} Min${minutes === 1 ? "" : "s"} Left`;
        subtitleText = `${minutes} minute${minutes === 1 ? "" : "s"} and ${seconds}s remaining on this cycle`;
        urgencyColor = "bg-rose-600 text-white animate-pulse";
      } else {
        badgeText = `${seconds}s Left`;
        subtitleText = `Expiring in seconds...`;
        urgencyColor = "bg-rose-600 text-white animate-pulse";
      }
    }

    // Formatted start and end dates
    const formattedStartDate = cycleStartDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const formattedExpiryDateEn = expiryDate.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const formattedExpiryDateSw = expiryDate.toLocaleDateString("sw-TZ", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    return {
      expiryDate,
      cycleStartDate,
      diffMs,
      isExpired,
      days,
      hours,
      minutes,
      seconds,
      elapsedPercent,
      planCategoryLabel,
      badgeText,
      subtitleText,
      urgencyColor,
      formattedStartDate,
      formattedExpiryDateEn,
      formattedExpiryDateSw
    };
  }, [user, currentTime]);

  const handleCancelSubscription = async () => {
    if (!user) return;
    setIsCancelling(true);

    try {
      // Update local Zustand store
      const updatedUser = {
        ...user,
        is_pro: false,
        plan_type: undefined,
        plan_name: undefined,
        plan_price: undefined,
        plan_expires_at: undefined
      };

      setUser(updatedUser);
      // Sync with cloud database
      await syncUserProfile(updatedUser);

      setIsCancelling(false);
      setCancelSuccess(true);
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setIsCancelling(false);
    }
  };

  if (!isOpen) return null;

  const isProUser = Boolean(user?.is_pro);
  const showCancelledNotice = !isProUser && cancelSuccess;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 md:p-6 overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <motion.div
        ref={modalRef}
        {...modalProps}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative w-full max-w-lg md:max-w-xl bg-white rounded-2xl xs:rounded-3xl shadow-2xl border border-slate-200/80 z-10 overflow-hidden text-slate-900 my-auto flex flex-col max-h-[92dvh] sm:max-h-[88vh]"
      >
        {/* Modal Top Prestige Header */}
        <div className={`p-4 xs:p-5 sm:p-6 relative overflow-hidden shrink-0 transition-colors ${
          isProUser 
            ? "bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-slate-950" 
            : "bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white"
        }`}>
          {/* Ambient Glow / Graphic Effects */}
          <div className="absolute -right-8 -bottom-8 w-32 sm:w-44 h-32 sm:h-44 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1 right-8 sm:right-12 opacity-15 pointer-events-none">
            <Crown className="w-20 sm:w-28 h-20 sm:h-28 text-white fill-white" />
          </div>

          <div className="flex items-start justify-between relative z-10 gap-3">
            <div className="space-y-1 sm:space-y-1.5 min-w-0 pr-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] sm:text-[11px] font-black shadow-xs tracking-wide">
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-300 shrink-0" />
                <span className="truncate">{isProUser ? "VIP PRO MEMBERSHIP" : "HUNCHO TV FREE TIER"}</span>
              </div>
              <h2 className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight truncate leading-tight">
                {isProUser ? (user?.plan_name || "Huncho VIP Member") : "Free Standard Member"}
              </h2>
              <div className="text-[11px] sm:text-xs font-bold flex items-center flex-wrap gap-1.5 pt-0.5">
                {isProUser ? (
                  <>
                    <span className="font-extrabold">{user?.plan_price || "TZS 12,000"}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-950 bg-emerald-300/90 px-2 py-0.5 rounded-md font-black text-[10px] sm:text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                      Active VIP
                    </span>
                  </>
                ) : (
                  <span className="text-slate-300">Status: Free Standard Access</span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isProUser 
                  ? "text-slate-950 hover:bg-black/10 active:bg-black/20" 
                  : "text-white hover:bg-white/10 active:bg-white/20"
              }`}
              aria-label="Close VIP details modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Only when active VIP and not displaying cancel outcome) */}
        {isProUser && !showCancelledNotice && (
          <div className="flex items-center border-b border-slate-100 px-3 xs:px-4 sm:px-6 bg-slate-50/70 gap-1 sm:gap-2 shrink-0 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-black border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 touch-manipulation ${
                activeTab === "overview"
                  ? "border-amber-500 text-amber-900 bg-amber-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
              <span>Details & Benefits</span>
            </button>

            <button
              onClick={() => setActiveTab("expiry")}
              className={`py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-black border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 touch-manipulation ${
                activeTab === "expiry"
                  ? "border-amber-500 text-amber-900 bg-amber-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
              <span>Expiry & Renewal</span>
            </button>

            <button
              onClick={() => setActiveTab("cancel")}
              className={`py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-black border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ml-auto touch-manipulation ${
                activeTab === "cancel"
                  ? "border-rose-500 text-rose-700 bg-rose-50/40"
                  : "border-transparent text-slate-400 hover:text-rose-600"
              }`}
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Cancel Plan</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Content Body */}
        <div className="p-3.5 xs:p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 overscroll-contain">
          {showCancelledNotice ? (
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 sm:w-8 h-7 sm:h-8 text-slate-700" />
              </div>
              <div className="space-y-1.5 px-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">VIP Subscription Cancelled</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium leading-relaxed">
                  Your VIP membership has been cancelled. You have returned to the standard free tier. You can re-subscribe anytime!
                </p>
              </div>
              <div className="flex flex-col xs:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={onClose}
                  className="w-full xs:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer min-h-[42px]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUpgradePlans();
                  }}
                  className="w-full xs:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Choose a Plan</span>
                </button>
              </div>
            </div>
          ) : !isProUser ? (
            /* Non-pro state */
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Crown className="w-7 sm:w-8 h-7 sm:h-8" />
              </div>
              <div className="space-y-1.5 px-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">Upgrade to Huncho VIP</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium leading-relaxed">
                  Unlock unlimited 4K Ultra HD streaming, high-speed cloud downloads, ad-free player, and priority Kiswahili translated movies.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpgradePlans();
                }}
                className="w-full xs:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Vifurushi (TZS 1,000 - TZS 99,000)</span>
              </button>
            </div>
          ) : activeTab === "overview" ? (
            /* Tab 1: Overview & Details */
            <div className="space-y-4 sm:space-y-5">
              {/* Quick Info Grid - Fluid adaptive across mobile & desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-2.5 sm:gap-3">
                <div className="p-3 xs:p-3.5 rounded-xl xs:rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[9px] xs:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plan Type</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">{user?.plan_name || "Kifurushi cha Mwezi"}</span>
                </div>
                <div className="p-3 xs:p-3.5 rounded-xl xs:rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[9px] xs:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price Billed</span>
                  <span className="text-xs sm:text-sm font-black text-amber-700 block truncate">{user?.plan_price || "TZS 12,000"}</span>
                </div>
                <div className="p-3 xs:p-3.5 rounded-xl xs:rounded-2xl bg-slate-50 border border-slate-100 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[9px] xs:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Mode</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1 truncate">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>M-Pesa / Tigo / Airtel</span>
                  </span>
                </div>
              </div>

              {/* Unlocked Benefits */}
              <div className="space-y-2">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Active VIP Privileges</span>
                </h4>
                <div className="space-y-2 bg-amber-50/50 rounded-xl xs:rounded-2xl p-3 xs:p-3.5 sm:p-4 border border-amber-200/60">
                  <div className="flex items-start gap-2 sm:gap-2.5 text-[11px] sm:text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900 font-extrabold">4K Ultra HD & 60fps Playback</strong>: Stream all international & DJ translated movies in pristine 4K quality.</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-2.5 text-[11px] sm:text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900 font-extrabold">Uncapped Cloud Downloads</strong>: High-speed multi-part offline downloads with priority CDN servers.</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-2.5 text-[11px] sm:text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900 font-extrabold">Ad-Free Experience</strong>: Zero banner or video ads during your streaming sessions.</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-2.5 text-[11px] sm:text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900 font-extrabold">Full DJ Library</strong>: Unlocked access to DJ Lukuvi, DJ Afro, DJ Mack, DJ Ruff & Bongo movies.</span>
                  </div>
                </div>
              </div>

              {/* Upgrade Banner in Overview */}
              <div className="p-3.5 xs:p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl xs:rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] xs:text-[10px] font-black">
                    <Sparkles className="w-3 h-3" />
                    <span>SAVE UP TO 31%</span>
                  </div>
                  <h4 className="text-xs xs:text-sm font-extrabold text-white">Switch or Upgrade Your Plan</h4>
                  <p className="text-[11px] xs:text-xs text-slate-300">Upgrade to Kifurushi cha Mwaka (TZS 99,000) or renew early.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUpgradePlans();
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 min-h-[38px]"
                >
                  <span>Upgrade Plan</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : activeTab === "expiry" ? (
            /* Tab 2: Expiry & Renewal Details - Highly Accurate Timeline */
            <div className="space-y-4 sm:space-y-5">
              {/* Expiry Card */}
              <div className="p-3.5 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                      <Clock className="w-4 sm:w-5 h-4 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs xs:text-sm font-black text-slate-900 truncate">Subscription Timeline</h4>
                      <p className="text-[11px] xs:text-xs text-slate-500 font-medium truncate">
                        {timelineInfo.subtitleText}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] xs:text-xs font-black px-2.5 py-1 rounded-lg shadow-2xs shrink-0 whitespace-nowrap ${timelineInfo.urgencyColor}`}>
                    {timelineInfo.badgeText}
                  </span>
                </div>

                {/* Progress Bar & Timeline Visual */}
                <div className="space-y-2 pt-1 sm:pt-2">
                  <div className="flex items-center justify-between text-[10px] xs:text-[11px] sm:text-xs font-bold text-slate-600 gap-2">
                    <span className="truncate">Cycle Started: {timelineInfo.formattedStartDate}</span>
                    <span className="truncate text-slate-900 font-black">
                      Expires: {timelineInfo.formattedExpiryDateEn}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="relative w-full h-3 sm:h-3.5 bg-slate-200/90 rounded-full overflow-hidden p-0.5 border border-slate-300/40">
                    <motion.div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        timelineInfo.isExpired 
                          ? "bg-rose-500" 
                          : timelineInfo.days === 0 && timelineInfo.hours <= 3 
                            ? "bg-gradient-to-r from-amber-500 to-rose-500" 
                            : "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600"
                      }`}
                      style={{ 
                        width: `${Math.max(4, Math.min(100, timelineInfo.elapsedPercent))}%` 
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                    <span>Active Plan: {timelineInfo.planCategoryLabel}</span>
                    <span className="font-bold text-slate-600">
                      {Math.round(timelineInfo.elapsedPercent)}% Elapsed
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[10px] xs:text-[11px] text-slate-700 font-medium leading-relaxed mt-2">
                    {timelineInfo.isExpired ? (
                      <span className="text-rose-700 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        Kifurushi kimekwisha. Tafadhali ongeza muda kuendelea kutazama kwa 4K Ultra HD.
                      </span>
                    ) : (
                      <span>
                        Huduma za 4K Ultra HD na upakuaji zitaendelea kuwa hewani hadi <strong className="text-slate-900 font-extrabold">{timelineInfo.formattedExpiryDateSw}</strong> ({timelineInfo.formattedExpiryDateEn}).
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Renewal Options */}
              <div className="p-3.5 xs:p-4 rounded-xl xs:rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Auto-Extend VIP Access</span>
                  </h5>
                  <p className="text-[11px] text-indigo-700 font-medium">Keep your download queue and 4K streaming uninterrupted without losing access.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUpgradePlans();
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Renew or Extend Vifurushi</span>
                </button>
              </div>
            </div>
          ) : (
            /* Tab 3: Cancel VIP Plan */
            <div className="space-y-4 sm:space-y-5">
              <div className="p-4 sm:p-5 rounded-xl xs:rounded-2xl bg-rose-50 border border-rose-200/80 space-y-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 shrink-0" />
                  <h4 className="text-xs xs:text-sm font-black">Cancel VIP Membership?</h4>
                </div>
                <p className="text-[11px] xs:text-xs text-rose-900 leading-relaxed font-medium">
                  If you cancel your VIP plan, you will lose access to:
                </p>
                <ul className="space-y-1.5 text-[11px] xs:text-xs text-rose-800 font-semibold pl-1">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>4K Ultra HD & 60fps high-bitrate streaming servers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>Uncapped fast offline downloads & batch downloader</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>Ad-free cinema experience & VIP Swahili dub releases</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col xs:flex-row items-center gap-2.5 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="w-full xs:flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer text-center min-h-[42px]"
                >
                  Keep My VIP
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelSubscription}
                  className="w-full xs:flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[42px]"
                >
                  {isCancelling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Cancellation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 xs:p-3.5 sm:p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 gap-2">
          <span className="text-[10px] xs:text-[11px] text-slate-400 font-semibold truncate">
            Member ID: VIP-#{user?.id ? user.id.slice(-6).toUpperCase() : "892401"}
          </span>
          <button
            onClick={onClose}
            className="px-3.5 xs:px-4 py-1.5 bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 touch-manipulation min-h-[36px]"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

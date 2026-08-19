import { useState, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { Settings, Trash2, X, Check, RefreshCw, HardDrive, Sparkles, Crown } from "lucide-react";
import { useStore } from "../lib/store";
import { useModalAccessibility } from "../hooks/useModalAccessibility";

import { PlansModal } from "./PlansModal";
import { VipDetailsModal } from "./VipDetailsModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const { user } = useStore();

  const { modalRef, modalProps } = useModalAccessibility({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;

  const handleResetData = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clearzustand store state if available
      useStore.persist?.clearStorage?.();
      
      setIsReset(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Failed to clear local storage:", error);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        {...modalProps}
        aria-labelledby="settings-modal-title"
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 id="settings-modal-title" className="font-bold text-slate-900 text-base">App Settings</h3>
              <p className="text-xs text-slate-500">Manage preferences and storage</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close app settings"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Subscription Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {user?.is_pro ? (
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span className={user?.is_pro ? "text-amber-700 font-bold" : ""}>
                {user?.is_pro ? "VIP PRO Membership" : "Membership & Plan"}
              </span>
            </div>

            {user?.is_pro ? (
              <div className="p-4 bg-gradient-to-r from-amber-500/15 via-yellow-500/25 to-amber-500/15 rounded-xl border border-amber-300 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[10px] font-black mb-1">
                      <Crown className="w-3 h-3 fill-current" />
                      <span>PRO VIP</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {user.plan_name || "Huncho VIP Member"}
                    </h4>
                    <p className="text-xs text-amber-900 font-semibold mt-0.5">
                      Active VIP subscription ({user.plan_price || "TZS 12,000"}). Full 4K Ultra HD and uncapped cloud downloads active.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowVipModal(true)}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-extrabold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-amber-400/40"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Manage VIP Plan (Details, Expiry & Cancel)</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Huncho TV VIP Membership
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Access 4K streams, DJ translated movies & fast downloads in TZS.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPlansModal(true)}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Vifurushi (TZS 1,000 - TZS 99,000)</span>
                </button>
              </div>
            )}
          </div>

          {/* Storage Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Storage & Data</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Reset Local Application Data</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clear watchlist, search history, and cached local preferences stored in your browser.
                  </p>
                </div>
              </div>

              {isReset ? (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold bg-emerald-50 border border-emerald-200/60 p-2.5 rounded-lg">
                  <Check className="w-4 h-4" />
                  <span>Data cleared! Reloading application...</span>
                </div>
              ) : isConfirming ? (
                <div className="space-y-2 pt-1 border-t border-slate-200/60">
                  <p className="text-xs font-medium text-rose-600">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetData}
                      className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Clear All Data</span>
                    </button>
                    <button
                      onClick={() => setIsConfirming(false)}
                      className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirming(true)}
                  className="w-full py-2 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Data</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <VipDetailsModal 
        isOpen={showVipModal} 
        onClose={() => setShowVipModal(false)} 
        onOpenUpgradePlans={() => setShowPlansModal(true)} 
      />

      <Suspense fallback={null}>
        <PlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} />
      </Suspense>
    </div>,
    document.body
  );
}

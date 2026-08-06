import { useState } from "react";
import { Settings, Trash2, X, Check, RefreshCw, HardDrive } from "lucide-react";
import { useStore } from "../lib/store";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isReset, setIsReset] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">App Settings</h3>
              <p className="text-xs text-slate-500">Manage preferences and storage</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
    </div>
  );
}

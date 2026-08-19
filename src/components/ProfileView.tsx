import { useState, lazy, Suspense } from "react";
import logoImg from "../assets/logo.png";

import { PlansModal } from "./PlansModal";
import { SettingsModal } from "./SettingsModal";
import { VipDetailsModal } from "./VipDetailsModal";
import { 
  User as UserIcon, 
  Crown, 
  Settings, 
  Bookmark, 
  Clock, 
  Download, 
  Bell, 
  MessageSquare, 
  FileText, 
  Trash2, 
  Sun, 
  Grid, 
  Sliders, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Camera, 
  Lock,
  Sparkles,
  Zap,
  RefreshCw,
  Cloud,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../lib/store";
import { isSupabaseConfigured } from "../lib/supabaseClient";

interface ProfileViewProps {
  onNavigateTab?: (tab: string) => void;
}

export function ProfileView({ onNavigateTab }: ProfileViewProps) {
  const { 
    user, 
    setUser, 
    updateUserProfile,
    logout,
    openAuthModal, 
    watchlist, 
    history, 
    downloads,
    isSyncing,
    lastSyncedAt,
    syncCloudData
  } = useStore();
  
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleSignOut = async () => {
    await logout();
  };

  // Unauthenticated State View
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 text-slate-900">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-5">
          <div className="mx-auto flex justify-center">
            <img src={logoImg} alt="Huncho TV" className="h-14 sm:h-18 w-auto object-contain rounded-xl shadow-xs" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Sign In to HUNCHO TV
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Create an account or sign in to sync your Watchlist, continue stream progress across devices, and manage offline downloads.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openAuthModal}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-98"
            >
              Sign In / Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = user;
  const usernameHandle = `@${currentUser.full_name?.toLowerCase().replace(/\s+/g, "_") || currentUser.email.split("@")[0]}`;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4 text-slate-900">
      {/* 1. User Profile Section - Wide Card with Rounded Corners */}
      <div className={`w-full bg-white rounded-2xl sm:rounded-3xl border shadow-xs p-5 sm:p-6 transition-all ${
        currentUser.is_pro ? "border-amber-300/80 ring-1 ring-amber-200/50 shadow-sm" : "border-slate-200/80"
      }`}>
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative shrink-0 pt-0.5">
            <img
              src={currentUser.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(currentUser.email || currentUser.id)}`}
              alt={currentUser.full_name || "User Avatar"}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-xs bg-slate-100 transition-all ${
                currentUser.is_pro 
                  ? "border-2 border-amber-400 ring-4 ring-amber-300/30 shadow-md shadow-amber-400/20" 
                  : "border-2 border-indigo-100"
              }`}
            />
            {currentUser.is_pro && (
              <span className="absolute -top-1.5 -left-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full p-1 shadow-xs border border-white">
                <Crown className="w-3 h-3 fill-current text-white" />
              </span>
            )}
            <button 
              onClick={() => setShowAvatarSelect(!showAvatarSelect)}
              className={`absolute bottom-0 right-0 p-1.5 text-white rounded-full shadow-xs transition-transform hover:scale-105 cursor-pointer ${
                currentUser.is_pro ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              title="Edit avatar"
            >
              <Camera className="w-3 h-3" />
            </button>
            
            <AnimatePresence>
              {showAvatarSelect && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-slate-100 p-2 flex flex-row gap-2 z-50 w-max"
                >
                  <button 
                    onClick={() => {
                      updateUserProfile({ avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=Jocelyn` });
                      setShowAvatarSelect(false);
                    }}
                    className={`p-1.5 rounded-lg hover:bg-slate-50 transition-colors ${currentUser.avatar_url?.includes('Jocelyn') ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : ''}`}
                    title="Female Avatar"
                  >
                    <img src={`https://api.dicebear.com/7.x/micah/svg?seed=Jocelyn`} alt="Female Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
                  </button>
                  <button 
                    onClick={() => {
                      updateUserProfile({ avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=Felix` });
                      setShowAvatarSelect(false);
                    }}
                    className={`p-1.5 rounded-lg hover:bg-slate-50 transition-colors ${(!currentUser.avatar_url || currentUser.avatar_url.includes('Felix')) ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : ''}`}
                    title="Male Avatar"
                  >
                    <img src={`https://api.dicebear.com/7.x/micah/svg?seed=Felix`} alt="Male Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Details Column */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentUser.full_name || "Japhet Mathias"}
              </h1>
              {currentUser.is_pro && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-xs border border-amber-300">
                  <Crown className="w-3 h-3 fill-slate-950" />
                  VIP PRO MEMBER
                </span>
              )}
            </div>

            <p className={`text-xs font-semibold truncate ${currentUser.is_pro ? "text-amber-700" : "text-indigo-600"}`}>{usernameHandle}</p>
            <p className="text-xs text-slate-500 font-medium truncate">{currentUser.email}</p>

            {/* Saved and Offline buttons */}
            <div className="pt-2.5 flex items-center gap-2.5 flex-wrap">
              <button 
                onClick={() => onNavigateTab?.("watchlist")}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs font-bold transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600/20" />
                <span>{watchlist.length} Saved</span>
              </button>
              <button 
                onClick={() => onNavigateTab?.("downloads")}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>{downloads.length} Offline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cloud Sync Status Indicator */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isSyncing ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {isSyncing ? "Syncing with Supabase Cloud..." : "Cross-Device Sync Active"}
              </p>
              <p className="text-[11px] text-slate-500">
                {lastSyncedAt 
                  ? `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}` 
                  : "Watchlist, Continue Watching & Downloads synchronized automatically"}
              </p>
            </div>
          </div>

          <button
            onClick={() => syncCloudData()}
            disabled={isSyncing}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync Cloud Data</span>
          </button>
        </div>
      </div>

      {/* 2. PRO / VIP Subscription Banner - Clickable Card to View Details, Expiry, Upgrade & Cancel */}
      {currentUser?.is_pro ? (
        <div 
          onClick={() => setShowVipModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowVipModal(true);
            }
          }}
          aria-label="Manage VIP Membership: View details, expiry, upgrade or cancel"
          className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-300 relative overflow-hidden cursor-pointer group transition-all hover:scale-[1.008] active:scale-[0.995] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {/* Subtle gold shine effect */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none group-hover:bg-white/30 transition-all" />
          <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
            <Crown className="w-28 h-28 text-white fill-white" />
          </div>

          <div className="space-y-1.5 text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-[11px] font-black shadow-xs">
              <Crown className="w-3.5 h-3.5 fill-amber-300" />
              <span>{currentUser.plan_name ? `Active: ${currentUser.plan_name}` : "Active: Huncho VIP Member"}</span>
            </div>
            <h3 className="text-base sm:text-xl font-black tracking-tight text-slate-950 pt-1 flex items-center gap-2">
              <span>VIP Membership Active • {currentUser.plan_price || "TZS 12,000"}</span>
            </h3>
            <p className="text-xs text-slate-900 font-semibold max-w-lg">
              Enjoy unlimited 4K ultra-smooth streaming, lightning-fast cloud downloads, ad-free player & priority Kiswahili dub releases.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px] font-extrabold text-slate-950">
              <span className="flex items-center gap-1 bg-white/50 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-400/40 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" /> 4K Ultra HD Streaming
              </span>
              <span className="flex items-center gap-1 bg-white/50 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-400/40 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" /> Uncapped Cloud Downloads
              </span>
              <span className="flex items-center gap-1 bg-white/50 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-400/40 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" /> Ad-Free VIP Pass
              </span>
            </div>
          </div>

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowVipModal(true);
            }}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 group-hover:bg-slate-900 text-amber-300 font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer active:scale-95 self-start sm:self-auto relative z-10 flex items-center gap-1.5 border border-amber-400/30 group-hover:border-amber-400"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage VIP Plan</span>
          </button>
        </div>
      ) : (
        <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-500/20">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Become a PRO</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white pt-1">
              Unlimited 4K Streaming & Fast Downloads
            </h3>
            <p className="text-xs text-blue-100 font-medium max-w-lg">
              Ad-free cinema experience, instant 60fps video playback, and cloud device sync.
            </p>
          </div>

          <button 
            onClick={() => setShowPlansModal(true)}
            className="px-5 py-2.5 bg-white hover:bg-blue-50 text-indigo-600 font-extrabold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer active:scale-95 self-start sm:self-auto"
          >
            Choose Plan (TZS)
          </button>
        </div>
      )}

      {/* Modals */}
      <VipDetailsModal 
        isOpen={showVipModal} 
        onClose={() => setShowVipModal(false)} 
        onOpenUpgradePlans={() => setShowPlansModal(true)}
      />

      <Suspense fallback={null}>
        <PlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} />
      </Suspense>

      {/* 3. Settings & Preferences Section - Wide Rounded Cards */}

      {/* Group A: Settings & Preferences */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-100">
          <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Settings & Preferences
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          <div 
            onClick={() => setShowSettingsModal(true)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Grid className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Categories & Layout</p>
                <p className="text-[11px] text-slate-500">Bento-grid layout, carousel density</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div 
            onClick={() => setShowSettingsModal(true)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Theme Mode</p>
                <p className="text-[11px] text-slate-500">Locked to High-Graphic Light Mode (#F8F9FB)</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-100">
              LIGHT THEME
            </span>
          </div>

          <div 
            onClick={() => setShowSettingsModal(true)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Playback Preferences</p>
                <p className="text-[11px] text-slate-500">Auto-play trailers, default video resolution</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Group B: Content & Activity */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-100">
          <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Content & Activity
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          <div 
            onClick={() => onNavigateTab?.("watchlist")}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">My Watchlist</p>
                <p className="text-[11px] text-slate-500">{watchlist.length} saved movies for later</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                {watchlist.length}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab?.("downloads")}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">My Downloads</p>
                <p className="text-[11px] text-slate-500">Offline titles, quality tags & sizes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                {downloads.length}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab?.("history")}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Watch History</p>
                <p className="text-[11px] text-slate-500">{Object.keys(history).length} recently watched items</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Group C: Account & Support */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-100">
          <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Account & Support
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Notifications</p>
                <p className="text-[11px] text-slate-500">New releases & link availability alerts</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                notificationsEnabled ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div 
            onClick={() => setShowFeedbackModal(true)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Feedback & Support</p>
                <p className="text-[11px] text-slate-500">Report missing streams or request features</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div 
            onClick={() => setShowSettingsModal(true)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-600">Delete Account & Data</p>
                <p className="text-[11px] text-slate-500">Permanently remove profile and sync history</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Group D: Sign Out Row */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3 shadow-xs">
        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <Suspense fallback={null}>
        <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      </Suspense>

      {/* Feedback & Support Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Feedback & Support</h3>
                  <p className="text-xs text-slate-500">We'd love to hear from you</p>
                </div>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5 hidden" />
                <span className="font-bold px-2">Close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">What's on your mind?</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-50 min-h-[100px] resize-none"
                  placeholder="Report a bug, request a feature, or just say hi..."
                ></textarea>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

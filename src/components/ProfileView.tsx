import { useState } from "react";
import logoImg from "../assets/logo.png";
import { PlansModal } from "./PlansModal";
import { SettingsModal } from "./SettingsModal";
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
  Copy, 
  Check, 
  Database, 
  ShieldCheck, 
  Camera, 
  Lock,
  Sparkles,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../lib/store";
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from "../lib/supabaseClient";

interface ProfileViewProps {
  onNavigateTab?: (tab: string) => void;
}

export function ProfileView({ onNavigateTab }: ProfileViewProps) {
  const { user, setUser, openAuthModal, watchlist, history, downloads } = useStore();
  
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSignOut = () => {
    setUser(null);
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
            <button
              onClick={() => setShowSqlModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>View Supabase SQL Schema</span>
            </button>
          </div>
        </div>

        {/* Database SQL Modal */}
        {showSqlModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[85vh] flex flex-col">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Supabase PostgreSQL Schema</h3>
                </div>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 font-mono text-[11px] bg-slate-900 text-slate-100 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                {SUPABASE_SQL_SCHEMA}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? "Copied to Clipboard!" : "Copy SQL Script"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const usernameHandle = `@${user.full_name?.toLowerCase().replace(/\s+/g, "_") || user.email.split("@")[0]}`;

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 px-4 space-y-5 text-slate-900">
      {/* 1. User Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
        <div className="relative shrink-0 z-10">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=Felix`}
            alt={user.full_name || "User Avatar"}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-indigo-50 shadow-md bg-slate-100"
          />
          <button 
            onClick={() => setShowAvatarSelect(!showAvatarSelect)}
            className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-transform hover:scale-105 cursor-pointer"
            title="Edit avatar"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          
          <AnimatePresence>
            {showAvatarSelect && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 flex flex-row gap-2 z-50 w-max"
              >
                <button 
                  onClick={() => {
                    setUser({ ...user, avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=Jocelyn` });
                    setShowAvatarSelect(false);
                  }}
                  className={`p-1.5 rounded-lg hover:bg-slate-50 transition-colors ${user.avatar_url?.includes('Jocelyn') ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : ''}`}
                  title="Female Avatar"
                >
                  <img src={`https://api.dicebear.com/7.x/micah/svg?seed=Jocelyn`} alt="Female Avatar" className="w-12 h-12 rounded-full bg-slate-100" />
                </button>
                <button 
                  onClick={() => {
                    setUser({ ...user, avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=Felix` });
                    setShowAvatarSelect(false);
                  }}
                  className={`p-1.5 rounded-lg hover:bg-slate-50 transition-colors ${(!user.avatar_url || user.avatar_url.includes('Felix')) ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : ''}`}
                  title="Male Avatar"
                >
                  <img src={`https://api.dicebear.com/7.x/micah/svg?seed=Felix`} alt="Male Avatar" className="w-12 h-12 rounded-full bg-slate-100" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {user.full_name || "Alex Huncho"}
            </h1>
            {user.is_pro && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                <Crown className="w-3 h-3" />
                PRO MEMBER
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-indigo-600">{usernameHandle}</p>
          <p className="text-xs text-slate-500 font-medium">{user.email}</p>

          <div className="pt-2 flex items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <Bookmark className="w-3 h-3 text-indigo-500" />
              <span>{watchlist.length} Saved</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <Download className="w-3 h-3 text-emerald-500" />
              <span>{downloads.length} Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRO / Subscription Banner */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 rounded-3xl p-5 sm:p-6 text-white shadow-md shadow-blue-500/15 relative overflow-hidden flex flex-col xs:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center xs:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{user?.is_pro ? (user.plan_name ? `Active: ${user.plan_name}` : "Huncho PRO Active") : "Become a PRO"}</span>
          </div>
          <h3 className="text-lg font-extrabold tracking-tight text-white pt-1">
            {user?.is_pro ? `VIP Plan (${user.plan_price || "TZS 12,000"})` : "Unlimited 4K Streaming & Fast Downloads"}
          </h3>
          <p className="text-xs text-blue-100 font-medium max-w-sm">
            {user?.is_pro 
              ? `Unrestricted access to all 4K streams, DJ translated movies & fast downloads.` 
              : "Ad-free cinema experience, instant 60fps video playback, and cloud device sync."}
          </p>
        </div>

        <button 
          onClick={() => setShowPlansModal(true)}
          className="px-5 py-2.5 bg-white hover:bg-blue-50 text-indigo-600 font-extrabold text-xs rounded-2xl shadow-sm transition-all shrink-0 cursor-pointer active:scale-95"
        >
          {user?.is_pro ? "Manage / Change Plan" : "Choose Plan (TZS)"}
        </button>
      </div>

      <PlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} />

      {/* 3. Grouped Settings Menu Cards */}

      {/* Group A: Settings & Mode */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Settings & Preferences
        </h3>

        <div className="divide-y divide-slate-100">
          <div 
            onClick={() => setShowSettingsModal(true)}
            className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
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
            className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
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

          <div className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
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
      <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Content & Activity
        </h3>

        <div className="divide-y divide-slate-100">
          <div 
            onClick={() => onNavigateTab?.("watchlist")}
            className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
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
            className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
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
            className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
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



      {/* Group D: Account & Support */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Account & Support
        </h3>

        <div className="divide-y divide-slate-100">
          <div className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
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
            className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
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
            className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
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

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Database SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Supabase SQL Schema & RLS Policies</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 font-mono text-[11px] bg-slate-900 text-slate-100 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
              {SUPABASE_SQL_SCHEMA}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={handleCopySql}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? "Copied to Clipboard!" : "Copy SQL Script"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

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

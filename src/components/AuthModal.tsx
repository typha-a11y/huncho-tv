import { useState, FormEvent } from "react";
import { X, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { useStore } from "../lib/store";
import logoImg from "../assets/logo.png";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, setUser } = useStore();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        if (mode === "signup") {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || email.split("@")[0],
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName || email.split("@")[0],
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
              is_pro: false,
              created_at: new Date().toISOString(),
            });
            setSuccessMsg("Account created successfully!");
            setTimeout(() => {
              closeAuthModal();
            }, 800);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || email.split("@")[0],
              avatar_url: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
              is_pro: true,
              created_at: data.user.created_at,
            });
            setSuccessMsg("Signed in successfully!");
            setTimeout(() => {
              closeAuthModal();
            }, 800);
          }
        }
      } else {
        // Fallback local authentication mode when Supabase env vars are pending
        setTimeout(() => {
          const username = fullName || email.split("@")[0] || "Huncho User";
          setUser({
            id: `usr_${Date.now()}`,
            email: email,
            full_name: username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
            is_pro: true,
            created_at: new Date().toISOString(),
          });
          setSuccessMsg("Signed in with Local Session!");
          setTimeout(() => {
            closeAuthModal();
          }, 800);
        }, 500);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "Failed to authenticate. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
        >
          {/* Top Banner Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 p-6 text-white relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <img src={logoImg} alt="Huncho TV" className="h-10 sm:h-12 w-auto object-contain rounded-lg bg-white/90 p-1 shadow-xs" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sync Account</span>
              </div>
            </div>

            <h2 className="text-xl font-extrabold tracking-tight">
              {mode === "signin" ? "Welcome Back to HUNCHO TV" : "Create Your HUNCHO Account"}
            </h2>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Sync your watchlist, continue streams across devices, and unlock high-speed movie downloads.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {/* Mode Switch Pills */}
            <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error or Success alerts */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-xs font-semibold bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3.5">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Huncho"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === "signin" ? "Sign In Now" : "Create Free Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

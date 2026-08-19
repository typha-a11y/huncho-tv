import React from "react";
import { Loader2, Film } from "lucide-react";

interface ViewLoadingFallbackProps {
  message?: string;
}

export function ViewLoadingFallback({ message = "Inapakia..." }: ViewLoadingFallbackProps) {
  return (
    <div className="w-full min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center p-6 sm:p-10 bg-white/80 rounded-3xl border border-slate-200/60 shadow-xs my-4 space-y-4 text-center">
      <div className="relative">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-xs">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
          <Film className="w-3 h-3" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide uppercase">
          {message}
        </p>
        <p className="text-[11px] text-slate-500 font-medium">
          Tafadhali subiri kidogo wakati HUNCHO TV inaandaa maudhui...
        </p>
      </div>

      <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="w-1/2 h-full bg-indigo-600 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xl flex flex-col items-center justify-center space-y-3 max-w-xs w-full text-center">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-black text-slate-800 tracking-tight">
          Inafungua Modali...
        </p>
      </div>
    </div>
  );
}

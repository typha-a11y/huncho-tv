import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { reportError } from "../lib/errorReporting";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
  isModal?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: unknown): State {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    return { hasError: true, error: normalizedError };
  }

  public componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    reportError(normalizedError, { componentStack: errorInfo.componentStack || "" });
  }

  private handleReload = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  private handleHardReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.isModal) {
        return (
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-lg text-center space-y-4 my-auto max-w-md mx-auto">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Hitilafu Kwenye Kipengele Hiki
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {this.props.fallbackMessage || "Tatizo dogo limetokea wakati wa kupakua kipengele hiki."}
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Jaribu Tena</span>
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900 font-sans">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
              <ShieldAlert className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider border border-rose-100">
                <span>Hitilafu Imegundulika</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Kitu Kidogo Kimeenda Mrama
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {this.props.fallbackMessage || "Mfumo umepata hitilafu isiyo ya kawaida. Mfumo wetu umeirekodi kwa ajili ya kufanyiwa marekebisho."}
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left">
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Maelezo ya Kitalam:
                </p>
                <p className="text-xs font-mono text-slate-800 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Jaribu Tena</span>
              </button>

              <button
                onClick={this.handleHardReload}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Rudi Mwanzo</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

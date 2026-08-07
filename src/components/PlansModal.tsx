import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Sparkles, Shield, CreditCard, X, Smartphone, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useStore } from "../lib/store";

interface SubscriptionPlan {
  id: "daily" | "weekly" | "monthly" | "yearly";
  name: string;
  swahiliName: string;
  duration: string;
  priceTzs: number;
  formattedPrice: string;
  perDayEquivalent?: string;
  popular?: boolean;
  bestValue?: boolean;
  savingsBadge?: string;
  features: string[];
}

const PLANS: SubscriptionPlan[] = [
  {
    id: "daily",
    name: "Kifurushi cha Siku",
    swahiliName: "Siku 1",
    duration: "Masaa 24",
    priceTzs: 1000,
    formattedPrice: "TZS 1,000",
    features: [
      "Masaa 24 Unlimited 4K Streaming",
      "Kudownload Filamu Haraka (Max 3GB)",
      "Filamu Zote za Kiswahili (DJ Movies)",
      "Akaunti Kwenye Simu 1"
    ]
  },
  {
    id: "weekly",
    name: "Kifurushi cha Wiki",
    swahiliName: "Wiki 1",
    duration: "Siku 7",
    priceTzs: 4500,
    formattedPrice: "TZS 4,500",
    perDayEquivalent: "~TZS 640/siku",
    savingsBadge: "Okoa 35%",
    features: [
      "Siku 7 Unlimited 4K & HD Streaming",
      "Kudownload Filamu Bila Kikomo",
      "DJs Zote: Lukuvi, Ruff, Mark & Afro",
      "Bila Matangazo (Ad-Free)",
      "Simu 2 Kwa Wakati Mmoja"
    ]
  },
  {
    id: "monthly",
    name: "Kifurushi cha Mwezi",
    swahiliName: "Mwezi 1",
    duration: "Siku 30",
    priceTzs: 12000,
    formattedPrice: "TZS 12,000",
    perDayEquivalent: "~TZS 400/siku",
    popular: true,
    savingsBadge: "Inayopendwa",
    features: [
      "Siku 30 VIP Premium Access",
      "Ultra HD 4K & Dolby Sound",
      "Kudownload kwa Kasi ya Juu",
      "Filamu Zote na Tamthilia za DJ",
      "Cloud Sync Kwenye Vifaa Vyote",
      "Vifaa 4 Kwa Wakati Mmoja"
    ]
  },
  {
    id: "yearly",
    name: "Kifurushi cha Mwaka",
    swahiliName: "Mwaka 1",
    duration: "Siku 365",
    priceTzs: 99000,
    formattedPrice: "TZS 99,000",
    perDayEquivalent: "~TZS 270/siku",
    bestValue: true,
    savingsBadge: "Okoa 31%",
    features: [
      "Siku 365 VIP Uninterrupted Access",
      "Sifa Zote za Premium Zimejumuishwa",
      "Priority Download Servers",
      "Kuangalia Filamu Mpya Mapema Zaidi",
      "Vifaa 6 Kwa Wakati Mmoja",
      "Msaada wa 24/7 wa WhatsApp"
    ]
  }
];

const MOBILE_PAYMENT_PROVIDERS = [
  { name: "M-Pesa", code: "Vodacom", bg: "bg-red-600 text-white" },
  { name: "Tigo Pesa", code: "Tigo", bg: "bg-blue-600 text-white" },
  { name: "Airtel Money", code: "Airtel", bg: "bg-rose-600 text-white" },
  { name: "HaloPesa", code: "Halotel", bg: "bg-orange-500 text-white" }
];

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlansModal({ isOpen, onClose }: PlansModalProps) {
  const { user, setUser } = useStore();
  const [selectedPlanId, setSelectedPlanId] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [selectedProvider, setSelectedProvider] = useState<string>("M-Pesa");
  const [phoneNumber, setPhoneNumber] = useState<string>("0754000000");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [expandedFeatures, setExpandedFeatures] = useState<boolean>(false);

  if (!isOpen) return null;

  const activePlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[2];

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      if (user) {
        setUser({
          ...user,
          is_pro: true,
          plan_type: activePlan.id,
          plan_name: activePlan.name,
          plan_price: activePlan.formattedPrice,
          plan_expires_at: new Date(Date.now() + (activePlan.id === "daily" ? 86400000 : activePlan.id === "weekly" ? 7 * 86400000 : activePlan.id === "monthly" ? 30 * 86400000 : 365 * 86400000)).toISOString()
        });
      } else {
        setUser({
          id: "usr_demo_" + Date.now(),
          email: "mwanachama@hunchotv.co.tz",
          full_name: "Huncho VIP Member",
          is_pro: true,
          plan_type: activePlan.id,
          plan_name: activePlan.name,
          plan_price: activePlan.formattedPrice,
          plan_expires_at: new Date(Date.now() + 30 * 86400000).toISOString()
        });
      }
    }, 1200);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-end items-center p-0 overflow-hidden"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl rounded-t-[32px] rounded-b-none shadow-2xl border-t border-slate-100 overflow-hidden max-h-[90vh] flex flex-col mb-0 pb-safe animate-in slide-in-from-bottom duration-300 ease-out transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Centered Drag Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Header */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 bg-white text-slate-900 flex items-center justify-between shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logo.png" alt="Huncho TV" className="h-6 sm:h-8 w-auto object-contain shrink-0" />
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600" />
                <span>Huncho VIP</span>
              </div>
              <h2 className="text-xs sm:text-base font-black tracking-tight text-slate-900 truncate">
                Chagua Kifurushi (TZS)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-6 sm:p-10 text-center space-y-5 my-auto overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">Hongera! VIP Inafanya Kazi</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Umefanikiwa kujiunga na <span className="font-extrabold text-indigo-600">{activePlan.name} ({activePlan.formattedPrice})</span>. 
                Sasa unaweza kutazama na kudownload filamu zote za Huncho TV bila kikomo.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setPaymentSuccess(false);
                  onClose();
                }}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Anza Kutazama Sasa
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto no-scrollbar scrollbar-none p-3.5 sm:p-6 space-y-4 sm:space-y-6 flex-1 pb-8 sm:pb-6">
            {/* Intro banner */}
            <div className="bg-indigo-50/60 rounded-2xl p-3 sm:p-4 border border-indigo-100 text-center">
              <p className="text-[11px] sm:text-xs text-indigo-950 font-bold leading-tight">
                Tazama filamu na tamthilia zote za Kiswahili (DJ Movies) kwa ubora wa 4K bila matangazo!
              </p>
            </div>

            {/* Horizontal Scrollable Plans Row on Mobile, Grid on Desktop */}
            <div className="flex sm:grid sm:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pt-3 pb-2 px-1 snap-x snap-mandatory scrollbar-none">
              {PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border-2 transition-all cursor-pointer flex flex-col justify-between min-w-[230px] w-[230px] sm:min-w-0 sm:w-auto shrink-0 snap-align-start ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "border-slate-200/80 bg-white hover:border-slate-300"
                    }`}
                  >
                    {/* Badge */}
                    {plan.savingsBadge && (
                      <div
                        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-xs ${
                          plan.popular
                            ? "bg-amber-500 text-white"
                            : plan.bestValue
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        {plan.savingsBadge}
                      </div>
                    )}

                    <div className="space-y-2.5 pt-1 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-wide">
                            {plan.swahiliName}
                          </span>
                          <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-1">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">{plan.name}</h4>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-base sm:text-xl font-black text-indigo-600 tracking-tight">
                              {plan.formattedPrice}
                            </span>
                          </div>
                          {plan.perDayEquivalent && (
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 leading-none mt-0.5">{plan.perDayEquivalent}</p>
                          )}
                        </div>
                      </div>

                      {/* Feature bullets (visible on mobile and desktop) */}
                      <ul className="space-y-1.5 pt-2 border-t border-slate-100/80">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                            <Check className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Section */}
            <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/80 space-y-3.5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                <div>
                  <h4 className="text-[11px] sm:text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                    <span>Malipo ya Simu (Tanzania)</span>
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    Kifurushi: <strong className="text-indigo-600 font-extrabold">{activePlan.name} ({activePlan.formattedPrice})</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  <Shield className="w-3 h-3" />
                  <span>Salama 100%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Select Provider */}
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Mtandao wa Simu
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {MOBILE_PAYMENT_PROVIDERS.map((prov) => (
                      <button
                        key={prov.name}
                        type="button"
                        onClick={() => setSelectedProvider(prov.name)}
                        className={`p-2 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer min-h-[40px] ${
                          selectedProvider === prov.name
                            ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-1 ring-indigo-500/30"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="truncate">{prov.name}</span>
                        <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-black ${prov.bg}`}>{prov.code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Namba ya Simu ya Kutolea Hela
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07XX XXX XXX"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 leading-tight">
                    Utapokea ujumbe wa PIN kwenye simu yako kuthibitisha malipo ya <strong>{activePlan.formattedPrice}</strong>.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-xs text-slate-600 text-center sm:text-left w-full sm:w-auto flex items-center justify-between sm:block">
                  <span>Jumla:</span>
                  <strong className="text-sm sm:text-base text-indigo-600 font-black ml-1">{activePlan.formattedPrice}</strong>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 min-h-[44px]"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Lipa Hapa ({activePlan.formattedPrice})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export const HunchoVipModal = PlansModal;

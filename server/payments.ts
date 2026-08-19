import { createClient } from "@supabase/supabase-js";

// Supabase URL & Admin Service Role Key
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

// Plan prices in TZS
export const PLAN_PRICES: Record<string, number> = {
  daily: 1000,
  weekly: 4500,
  monthly: 12000,
  yearly: 99000,
};

export interface PaymentTransaction {
  reference: string;
  userId: string;
  planId: "daily" | "weekly" | "monthly" | "yearly";
  phoneNumber: string;
  provider: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
  completedAt?: string;
}

// In-memory server store for transactions
const transactionsStore = new Map<string, PaymentTransaction>();

/**
 * Standardize Tanzanian Phone Numbers to e.164 without plus sign (e.g. 255754000000)
 */
export function normalizeTanzaniaPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "255" + cleaned.slice(1);
  } else if (!cleaned.startsWith("255") && cleaned.length === 9) {
    cleaned = "255" + cleaned;
  }
  return cleaned;
}

/**
 * Calculate expiration timestamp based on subscription plan duration
 */
export function calculatePlanExpiration(planId: "daily" | "weekly" | "monthly" | "yearly"): string {
  const now = Date.now();
  let durationMs = 86400000; // 24 hours
  if (planId === "weekly") {
    durationMs = 7 * 86400000;
  } else if (planId === "monthly") {
    durationMs = 30 * 86400000;
  } else if (planId === "yearly") {
    durationMs = 365 * 86400000;
  }
  return new Date(now + durationMs).toISOString();
}

/**
 * Initiate Mobile Money Payment
 */
export async function handleInitiatePayment(body: {
  planId?: "daily" | "weekly" | "monthly" | "yearly";
  phoneNumber?: string;
  provider?: string;
  userId?: string;
}): Promise<{
  success: boolean;
  reference?: string;
  amount?: number;
  formattedPrice?: string;
  phoneNumber?: string;
  provider?: string;
  message: string;
  simulationMode?: boolean;
}> {
  const planId = body.planId || "monthly";
  const rawPhone = body.phoneNumber || "0754000000";
  const provider = body.provider || "M-Pesa";
  const userId = body.userId || "usr_demo_" + Date.now();

  const amount = PLAN_PRICES[planId] || 12000;
  const normalizedPhone = normalizeTanzaniaPhoneNumber(rawPhone);
  const reference = `HUNCHO_TZ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const transaction: PaymentTransaction = {
    reference,
    userId,
    planId,
    phoneNumber: normalizedPhone,
    provider,
    amount,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  transactionsStore.set(reference, transaction);

  return {
    success: true,
    reference,
    amount,
    formattedPrice: `TZS ${amount.toLocaleString()}`,
    phoneNumber: normalizedPhone,
    provider,
    message: `Ombi la malipo la TZS ${amount.toLocaleString()} limetumwa kwenye namba ${normalizedPhone}. Tafadhali weka PIN kwenye simu yako.`,
    simulationMode: true,
  };
}

/**
 * Payment Confirmation Callback Handler
 */
export async function handlePaymentWebhook(
  payload: {
    reference?: string;
    reference_id?: string;
    status?: string;
    amount?: number;
    user_id?: string;
    plan_id?: "daily" | "weekly" | "monthly" | "yearly";
  },
  _signatureHeader?: string
): Promise<{ success: boolean; message: string; updatedProfile?: boolean }> {
  const reference = payload.reference || payload.reference_id;
  if (!reference) {
    return { success: false, message: "Missing transaction reference" };
  }

  const transaction = transactionsStore.get(reference);
  const userId = transaction?.userId || payload.user_id;
  const planId = transaction?.planId || payload.plan_id || "monthly";

  if (!userId) {
    return { success: false, message: "User ID not associated with transaction" };
  }

  const planExpiresAt = calculatePlanExpiration(planId);

  // Update in-memory transaction status
  if (transaction) {
    transaction.status = "COMPLETED";
    transaction.completedAt = new Date().toISOString();
    transactionsStore.set(reference, transaction);
  }

  // SERVER-SIDE SUPABASE UPDATE USING SERVICE ROLE KEY IF CONFIGURED
  let updatedProfile = false;
  if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
    try {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          is_pro: true,
          plan_type: planId,
          plan_expires_at: planExpiresAt,
        })
        .eq("id", userId);

      if (!error) {
        updatedProfile = true;
      }
    } catch (err) {
      console.error("[PAYMENT WEBHOOK] Supabase update notice:", err);
    }
  }

  return {
    success: true,
    message: `Payment confirmed for transaction ${reference}. VIP plan ${planId} activated until ${planExpiresAt}.`,
    updatedProfile,
  };
}

/**
 * Check Status of Payment Transaction or User Profile
 */
export async function handleGetPaymentStatus(
  reference?: string,
  userId?: string
): Promise<{
  reference?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  isPro: boolean;
  planType?: string;
  planExpiresAt?: string;
  message: string;
}> {
  if (reference && transactionsStore.has(reference)) {
    const tx = transactionsStore.get(reference)!;
    
    // If completed in memory
    if (tx.status === "COMPLETED") {
      return {
        reference,
        status: "COMPLETED",
        isPro: true,
        planType: tx.planId,
        planExpiresAt: calculatePlanExpiration(tx.planId),
        message: "Malipo yamethibitishwa! VIP imewashwa.",
      };
    }
  }

  // Also query Supabase profiles directly if userId is provided
  if (userId && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
    try {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("is_pro, plan_type, plan_expires_at")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data?.is_pro) {
        return {
          reference,
          status: "COMPLETED",
          isPro: true,
          planType: data.plan_type || "monthly",
          planExpiresAt: data.plan_expires_at || new Date(Date.now() + 30 * 86400000).toISOString(),
          message: "Akaunti yako tayari ni VIP Active.",
        };
      }
    } catch (err) {
      console.warn("Error checking profile status in Supabase admin:", err);
    }
  }

  return {
    reference,
    status: transactionStatus(reference),
    isPro: false,
    message: "Tunasubiri uthibitisho wa PIN kwenye simu...",
  };
}

function transactionStatus(reference?: string): "PENDING" | "COMPLETED" | "FAILED" {
  if (!reference) return "PENDING";
  return transactionsStore.get(reference)?.status || "PENDING";
}

/**
 * Developer helper endpoint to simulate user entering PIN on their phone
 */
export async function handleSimulateCallback(reference: string): Promise<{ success: boolean; message: string }> {
  if (!reference) {
    return { success: false, message: "Missing reference" };
  }
  const result = await handlePaymentWebhook({ reference, status: "SUCCESS" });
  return {
    success: result.success,
    message: result.message,
  };
}

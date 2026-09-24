import { env, assertPaystackConfigured } from "../config/env.js";

const PAYSTACK_BASE = "https://api.paystack.co";

async function paystackRequest(pathname, options = {}) {
  assertPaystackConfigured();
  const response = await fetch(`${PAYSTACK_BASE}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    const error = new Error("Unexpected response from Paystack.");
    error.status = 502;
    throw error;
  }

  if (!response.ok || payload.status === false) {
    const error = new Error(payload.message || "Paystack request failed.");
    error.status = response.status >= 400 && response.status < 500 ? 400 : 502;
    error.details = payload;
    throw error;
  }

  return payload;
}

export async function initializeTransaction({
  email,
  amountKobo,
  reference,
  metadata,
  callbackUrl,
  firstName,
  lastName,
}) {
  const payload = await paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      amount: amountKobo,
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      metadata,
    }),
  });
  return payload.data;
}

export async function verifyTransaction(reference) {
  const payload = await paystackRequest(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
  return payload.data;
}

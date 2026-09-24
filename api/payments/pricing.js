import { listPricingPublic } from "../_lib/pricing.js";
import { send } from "../_lib/paystack.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return send(res, 405, { success: false, message: "Method not allowed." });
  }
  return send(res, 200, {
    success: true,
    currency: "NGN",
    pricing: listPricingPublic(),
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || null,
  });
}

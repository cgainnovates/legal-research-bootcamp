import { listPricingPublic } from "../_lib/pricing.js";
import { getRegistrationWindow } from "../_lib/deadline.js";
import { send } from "../_lib/paystack.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return send(res, 405, { success: false, message: "Method not allowed." });
  }
  const window = getRegistrationWindow();
  return send(res, 200, {
    success: true,
    currency: "NGN",
    window,
    pricing: listPricingPublic().map((category) => ({
      ...category,
      types: category.types.map((type) => ({
        ...type,
        available: type.id === "early" ? window.earlyBirdOpen : window.lateOpen,
      })),
    })),
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || null,
  });
}

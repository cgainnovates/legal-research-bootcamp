import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  return value;
}

export const env = {
  port: Number(required("PORT", "4000")),
  nodeEnv: required("NODE_ENV", "development"),
  frontendUrl: required("FRONTEND_URL", "http://localhost:5173").replace(/\/$/, ""),
  paystackSecretKey: required("PAYSTACK_SECRET_KEY", ""),
  paystackPublicKey: required("PAYSTACK_PUBLIC_KEY", ""),
  paystackWebhookSecret: required("PAYSTACK_WEBHOOK_SECRET", ""),
};

export function assertPaystackConfigured() {
  if (!env.paystackSecretKey || !env.paystackSecretKey.startsWith("sk_")) {
    const error = new Error(
      "Paystack secret key is not configured. Set PAYSTACK_SECRET_KEY in backend/.env."
    );
    error.status = 503;
    throw error;
  }
}

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
  frontendUrl: required(
    "FRONTEND_URL",
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:5173"
  ).replace(/\/$/, ""),
  paystackSecretKey: required("PAYSTACK_SECRET_KEY", "").trim(),
  paystackPublicKey: required("PAYSTACK_PUBLIC_KEY", "").trim(),
  paystackWebhookSecret: required("PAYSTACK_WEBHOOK_SECRET", "").trim(),
};

export function getPublicSiteUrl(req) {
  const configured = String(process.env.FRONTEND_URL || "").trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(configured) && !/localhost|127\.0\.0\.1/.test(configured)) {
    return configured;
  }

  const proto = String(req?.get?.("x-forwarded-proto") || req?.protocol || "https").split(",")[0];
  const host = String(req?.get?.("x-forwarded-host") || req?.get?.("host") || "")
    .split(",")[0]
    .trim();
  if (host && !host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  return env.frontendUrl;
}

export function assertPaystackConfigured() {
  if (!env.paystackSecretKey || !env.paystackSecretKey.startsWith("sk_")) {
    const error = new Error(
      "Paystack secret key is not configured. In Vercel, add PAYSTACK_SECRET_KEY to the backend service and redeploy."
    );
    error.status = 503;
    error.expose = true;
    throw error;
  }
}

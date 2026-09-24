const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY || "";
  if (!key.startsWith("sk_")) {
    const error = new Error(
      "Paystack secret key is not configured. Set PAYSTACK_SECRET_KEY in Vercel."
    );
    error.status = 503;
    throw error;
  }
  return key;
}

export function frontendUrl(req) {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

async function paystackRequest(pathname, options = {}) {
  const response = await fetch(`${PAYSTACK_BASE}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
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
    throw error;
  }

  return payload;
}

export async function initializeTransaction(body) {
  const payload = await paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload.data;
}

export async function verifyTransaction(reference) {
  const payload = await paystackRequest(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
  return payload.data;
}

export function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

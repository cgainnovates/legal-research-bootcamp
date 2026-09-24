const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.message || "Request failed. Please try again.");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function fetchPricing() {
  return request("/api/payments/pricing");
}

export function initializePayment(body) {
  return request("/api/payments/initialize", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function verifyPayment(reference) {
  return request(`/api/payments/verify/${encodeURIComponent(reference)}`);
}

export function lookupRegistration(registrationId, reference) {
  const extra = reference ? `?ref=${encodeURIComponent(reference)}` : "";
  return request(`/api/payments/registration/${encodeURIComponent(registrationId)}${extra}`);
}

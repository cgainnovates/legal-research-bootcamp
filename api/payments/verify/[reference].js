import { verifyTransaction, send } from "../../_lib/paystack.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return send(res, 405, { success: false, message: "Method not allowed." });
  }

  const reference = String(req.query.reference || "").trim();
  if (!reference) {
    return send(res, 400, { success: false, message: "Payment reference is required." });
  }

  try {
    const data = await verifyTransaction(reference);
    const meta = data.metadata || {};
    const expectedKobo = Number(meta.amountNaira || 0) * 100;
    const paid =
      data.status === "success" &&
      Number(data.amount) > 0 &&
      (expectedKobo === 0 || Number(data.amount) === expectedKobo);

    const registration = {
      fullName: meta.fullName || data.customer?.email,
      email: data.customer?.email,
      phone: meta.phone || "",
      categoryId: meta.categoryId,
      categoryLabel: meta.categoryLabel,
      typeId: meta.typeId,
      typeLabel: meta.typeLabel,
      amountNaira: meta.amountNaira || Number(data.amount || 0) / 100,
      currency: "NGN",
      status: paid ? "paid" : data.status,
      reference: data.reference,
      paidAt: data.paid_at || null,
      verified: paid,
    };

    if (!paid) {
      return send(res, 402, {
        success: false,
        message:
          data.status === "abandoned"
            ? "Payment was abandoned before completion."
            : "Payment has not been verified.",
        data: registration,
      });
    }

    return send(res, 200, {
      success: true,
      message: "Registration and payment have been successfully verified.",
      data: registration,
    });
  } catch (error) {
    return send(res, error.status || 500, {
      success: false,
      message: error.message || "Payment verification failed.",
    });
  }
}

import { send, verifyTransaction } from "../_lib/paystack.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return send(res, 405, { success: false, valid: false, message: "Method not allowed." });
  }

  const registrationId = String(req.query.registrationId || req.query.id || "").trim();
  const reference = String(req.query.ref || req.query.reference || "").trim();
  if (!registrationId) {
    return send(res, 400, { success: false, valid: false, message: "Registration ID is required." });
  }
  if (!reference) {
    return send(res, 404, {
      success: false,
      valid: false,
      message: "This registration could not be verified without its payment reference.",
    });
  }

  try {
    const data = await verifyTransaction(reference);
    const meta = data.metadata || {};
    const matches =
      data.status === "success" &&
      (!meta.registrationId || meta.registrationId === registrationId);

    if (!matches) {
      return send(res, 404, {
        success: false,
        valid: false,
        message: "This registration could not be verified.",
      });
    }

    return send(res, 200, {
      success: true,
      valid: true,
      message: "Registration Verified",
      data: {
        fullName: meta.fullName,
        categoryLabel: meta.categoryLabel,
        typeLabel: meta.typeLabel,
        registrationId: meta.registrationId || registrationId,
        paymentStatus: "Paid",
        status: "Valid",
      },
    });
  } catch (error) {
    return send(res, error.status || 404, {
      success: false,
      valid: false,
      message: error.message || "This registration could not be verified.",
    });
  }
}

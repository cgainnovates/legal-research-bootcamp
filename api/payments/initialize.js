import crypto from "crypto";
import { resolvePricing } from "../_lib/pricing.js";
import { validateRegistrationInput } from "../_lib/validate.js";
import { frontendUrl, initializeTransaction, send, readJson } from "../_lib/paystack.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return send(res, 405, { success: false, message: "Method not allowed." });
  }

  try {
    const body = await readJson(req);
    const parsed = validateRegistrationInput(body);
    if (!parsed.ok) {
      return send(res, 400, {
        success: false,
        message: "Please correct the highlighted fields.",
        errors: parsed.errors,
      });
    }

    const priced = resolvePricing(parsed.value.category, parsed.value.registrationType);
    if (priced.error) {
      return send(res, 400, { success: false, message: priced.error });
    }

    const reference = `ELC-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`.toUpperCase();
    const origin = frontendUrl(req);
    const initialized = await initializeTransaction({
      email: parsed.value.email,
      amount: priced.amountKobo,
      currency: "NGN",
      reference,
      callback_url: `${origin}/confirmation?reference=${encodeURIComponent(reference)}`,
      metadata: {
        fullName: parsed.value.fullName,
        phone: parsed.value.phone,
        categoryId: priced.categoryId,
        categoryLabel: priced.categoryLabel,
        typeId: priced.typeId,
        typeLabel: priced.typeLabel,
        amountNaira: priced.amountNaira,
        custom_fields: [
          { display_name: "Participant", variable_name: "full_name", value: parsed.value.fullName },
          { display_name: "Category", variable_name: "category", value: priced.categoryLabel },
          { display_name: "Type", variable_name: "registration_type", value: priced.typeLabel },
        ],
      },
    });

    return send(res, 201, {
      success: true,
      message: "Payment initialised.",
      data: {
        reference,
        accessCode: initialized.access_code,
        authorizationUrl: initialized.authorization_url,
        amountNaira: priced.amountNaira,
        currency: "NGN",
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || null,
        registration: {
          fullName: parsed.value.fullName,
          email: parsed.value.email,
          phone: parsed.value.phone,
          categoryId: priced.categoryId,
          categoryLabel: priced.categoryLabel,
          typeId: priced.typeId,
          typeLabel: priced.typeLabel,
          amountNaira: priced.amountNaira,
          currency: "NGN",
          status: "initialized",
          reference,
        },
      },
    });
  } catch (error) {
    return send(res, error.status || 500, {
      success: false,
      message: error.message || "Unable to start payment.",
    });
  }
}

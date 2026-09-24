import crypto from "crypto";
import { resolvePricing } from "../_lib/pricing.js";
import { assertTypeAvailable } from "../_lib/deadline.js";
import { validateRegistrationInput } from "../_lib/validate.js";
import { frontendUrl, initializeTransaction, send, readJson } from "../_lib/paystack.js";

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Participant",
    lastName: parts.slice(1).join(" ") || parts[0] || "Registered",
  };
}

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

    const windowCheck = assertTypeAvailable(priced.typeId);
    if (windowCheck.error) {
      return send(res, 409, { success: false, message: windowCheck.error, window: windowCheck.window });
    }

    const reference = `ELC-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`.toUpperCase();
    const registrationId = `REG-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const origin = frontendUrl(req);
    const names = splitName(parsed.value.fullName);

    const initialized = await initializeTransaction({
      email: parsed.value.email,
      amount: priced.amountKobo,
      currency: "NGN",
      reference,
      callback_url: `${origin}/confirmation?reference=${encodeURIComponent(reference)}`,
      first_name: names.firstName,
      last_name: names.lastName,
      phone: parsed.value.phone,
      metadata: {
        cancel_action: `${origin}/register`,
        registrationId,
        fullName: parsed.value.fullName,
        phone: parsed.value.phone,
        categoryId: priced.categoryId,
        categoryLabel: priced.categoryLabel,
        typeId: priced.typeId,
        typeLabel: priced.typeLabel,
        amountNaira: String(priced.amountNaira),
        custom_fields: [
          { display_name: "Full name", variable_name: "full_name", value: String(parsed.value.fullName) },
          { display_name: "Phone number", variable_name: "phone", value: String(parsed.value.phone) },
          { display_name: "Category", variable_name: "category", value: String(priced.categoryLabel) },
          { display_name: "Registration type", variable_name: "registration_type", value: String(priced.typeLabel) },
          { display_name: "Amount (NGN)", variable_name: "amount_naira", value: String(priced.amountNaira) },
          { display_name: "Registration ID", variable_name: "registration_id", value: registrationId },
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
          registrationId,
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

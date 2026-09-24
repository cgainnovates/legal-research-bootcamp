import crypto from "crypto";
import { env } from "../config/env.js";
import { listPricingPublic, resolvePricing } from "../config/pricing.js";
import { validateRegistrationInput } from "../middleware/validate.js";
import {
  createRegistration,
  findByReference,
  publicRegistration,
  updateByReference,
} from "../services/store.js";
import {
  initializeTransaction,
  verifyTransaction,
} from "../services/paystack.js";

function createReference() {
  return `ELC-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`.toUpperCase();
}

export function getPricing(_req, res) {
  res.json({
    success: true,
    currency: "NGN",
    pricing: listPricingPublic(),
    publicKey: env.paystackPublicKey || null,
  });
}

export async function initializePayment(req, res, next) {
  try {
    const parsed = validateRegistrationInput(req.body || {});
    if (!parsed.ok) {
      return res.status(400).json({
        success: false,
        message: "Please correct the highlighted fields.",
        errors: parsed.errors,
      });
    }

    const priced = resolvePricing(parsed.value.category, parsed.value.registrationType);
    if (priced.error) {
      return res.status(400).json({ success: false, message: priced.error });
    }

    const reference = createReference();
    const id = crypto.randomUUID();
    const record = {
      id,
      fullName: parsed.value.fullName,
      email: parsed.value.email,
      phone: parsed.value.phone,
      categoryId: priced.categoryId,
      categoryLabel: priced.categoryLabel,
      typeId: priced.typeId,
      typeLabel: priced.typeLabel,
      amountNaira: priced.amountNaira,
      amountKobo: priced.amountKobo,
      currency: "NGN",
      status: "pending",
      reference,
      paystackAccessCode: null,
      paidAt: null,
      verification: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createRegistration(record);

    const callbackUrl = `${env.frontendUrl}/confirmation?reference=${encodeURIComponent(reference)}`;

    const initialized = await initializeTransaction({
      email: record.email,
      amountKobo: record.amountKobo,
      reference,
      callbackUrl,
      metadata: {
        registrationId: id,
        fullName: record.fullName,
        phone: record.phone,
        categoryId: record.categoryId,
        typeId: record.typeId,
        custom_fields: [
          { display_name: "Participant", variable_name: "full_name", value: record.fullName },
          { display_name: "Category", variable_name: "category", value: record.categoryLabel },
          { display_name: "Type", variable_name: "registration_type", value: record.typeLabel },
        ],
      },
    });

    await updateByReference(reference, {
      paystackAccessCode: initialized.access_code,
      status: "initialized",
    });

    return res.status(201).json({
      success: true,
      message: "Payment initialised.",
      data: {
        reference,
        accessCode: initialized.access_code,
        authorizationUrl: initialized.authorization_url,
        amountNaira: record.amountNaira,
        currency: "NGN",
        publicKey: env.paystackPublicKey || null,
        registration: publicRegistration({ ...record, status: "initialized" }),
      },
    });
  } catch (error) {
    next(error);
  }
}

function markFromPaystack(record, data) {
  const paid =
    data.status === "success" && Number(data.amount) === Number(record.amountKobo);

  if (data.status === "success" && Number(data.amount) !== Number(record.amountKobo)) {
    return {
      status: "amount_mismatch",
      paidAt: null,
      verification: {
        gatewayStatus: data.status,
        expectedKobo: record.amountKobo,
        receivedKobo: data.amount,
        channel: data.channel || null,
        paidAt: data.paid_at || data.paidAt || null,
      },
    };
  }

  if (paid) {
    return {
      status: "paid",
      paidAt: data.paid_at || data.paidAt || new Date().toISOString(),
      verification: {
        gatewayStatus: data.status,
        channel: data.channel || null,
        paidAt: data.paid_at || data.paidAt || null,
        fees: data.fees || null,
      },
    };
  }

  if (data.status === "failed") {
    return {
      status: "failed",
      paidAt: null,
      verification: { gatewayStatus: data.status },
    };
  }

  if (data.status === "abandoned") {
    return {
      status: "abandoned",
      paidAt: null,
      verification: { gatewayStatus: data.status },
    };
  }

  return {
    status: record.status === "paid" ? "paid" : data.status || "pending",
    verification: { gatewayStatus: data.status },
  };
}

export async function verifyPayment(req, res, next) {
  try {
    const reference = String(req.params.reference || "").trim();
    if (!reference) {
      return res.status(400).json({ success: false, message: "Payment reference is required." });
    }

    const existing = await findByReference(reference);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "No registration was found for this payment reference.",
      });
    }

    if (existing.status === "paid") {
      return res.json({
        success: true,
        message: "Registration and payment have been successfully verified.",
        data: publicRegistration(existing),
      });
    }

    const data = await verifyTransaction(reference);
    const patch = markFromPaystack(existing, data);
    const updated = await updateByReference(reference, patch);

    if (updated.status !== "paid") {
      const messages = {
        failed: "Payment failed. No charge was completed for this registration.",
        abandoned: "Payment was abandoned before completion.",
        amount_mismatch:
          "Payment could not be confirmed because the amount paid did not match the approved fee.",
        pending: "Payment has not been completed yet.",
      };
      return res.status(402).json({
        success: false,
        message: messages[updated.status] || "Payment has not been verified.",
        data: publicRegistration(updated),
      });
    }

    return res.json({
      success: true,
      message: "Registration and payment have been successfully verified.",
      data: publicRegistration(updated),
    });
  } catch (error) {
    next(error);
  }
}

export async function handleWebhook(req, res, next) {
  try {
    const signature = req.get("x-paystack-signature");
    const secret = env.paystackWebhookSecret || env.paystackSecretKey;
    if (!secret) {
      return res.status(503).json({ success: false, message: "Webhook is not configured." });
    }

    const raw = req.rawBody || JSON.stringify(req.body || {});
    const hash = crypto.createHmac("sha512", secret).update(raw).digest("hex");
    if (!signature || hash !== signature) {
      return res.status(401).json({ success: false, message: "Invalid webhook signature." });
    }

    const event = req.body;
    if (event?.event === "charge.success" && event?.data?.reference) {
      const reference = event.data.reference;
      const existing = await findByReference(reference);
      if (existing && existing.status !== "paid") {
        const patch = markFromPaystack(existing, event.data);
        await updateByReference(reference, patch);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

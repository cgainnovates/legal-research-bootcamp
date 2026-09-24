import crypto from "crypto";
import { env } from "../config/env.js";
import { getRegistrationWindow, assertTypeAvailable } from "../config/deadline.js";
import { listPricingPublic, resolvePricing } from "../config/pricing.js";
import { validateRegistrationInput } from "../middleware/validate.js";
import {
  createRegistration,
  findByReference,
  findByRegistrationId,
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

function createRegistrationId() {
  return `REG-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
}

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Participant",
    lastName: parts.slice(1).join(" ") || parts[0] || "Registered",
  };
}

function receiptFields(record) {
  if (record.registrationId && record.verifyUrl) {
    return {
      registrationId: record.registrationId,
      verifyUrl: record.verifyUrl,
      qrImageUrl: record.qrImageUrl,
    };
  }
  const registrationId = record.registrationId || createRegistrationId();
  const verifyUrl = `${env.frontendUrl}/verify/${encodeURIComponent(registrationId)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(verifyUrl)}`;
  return { registrationId, verifyUrl, qrImageUrl };
}

export function getPricing(_req, res) {
  const window = getRegistrationWindow();
  res.json({
    success: true,
    currency: "NGN",
    window,
    pricing: listPricingPublic(window),
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

    const windowCheck = assertTypeAvailable(priced.typeId);
    if (windowCheck.error) {
      return res.status(409).json({
        success: false,
        message: windowCheck.error,
        window: windowCheck.window,
      });
    }

    const reference = createReference();
    const id = crypto.randomUUID();
    const pendingReceipt = receiptFields({ registrationId: createRegistrationId() });
    const record = {
      id,
      ...pendingReceipt,
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

    try {
      await createRegistration(record);
    } catch (storeError) {
      console.warn("[payments] could not persist registration locally:", storeError.message);
    }

    const callbackUrl = `${env.frontendUrl}/confirmation?reference=${encodeURIComponent(reference)}`;

    const names = splitName(record.fullName);
    const initialized = await initializeTransaction({
      email: record.email,
      amountKobo: record.amountKobo,
      reference,
      callbackUrl,
      firstName: names.firstName,
      lastName: names.lastName,
      metadata: {
        registrationId: id,
        fullName: record.fullName,
        phone: record.phone,
        categoryId: record.categoryId,
        categoryLabel: record.categoryLabel,
        typeId: record.typeId,
        typeLabel: record.typeLabel,
        amountNaira: record.amountNaira,
        registrationId: record.registrationId,
        custom_fields: [
          { display_name: "Participant", variable_name: "full_name", value: record.fullName },
          { display_name: "Phone", variable_name: "phone", value: record.phone },
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

    let existing = null;
    try {
      existing = await findByReference(reference);
    } catch {
      existing = null;
    }

    if (!existing) {
      const data = await verifyTransaction(reference);
      const meta = data.metadata || {};
      const amountNaira = Number(meta.amountNaira || Number(data.amount || 0) / 100);
      const paid = data.status === "success" && Number(data.amount) === amountNaira * 100;
      const synthetic = {
        fullName: meta.fullName,
        email: data.customer?.email,
        phone: meta.phone,
        categoryId: meta.categoryId,
        categoryLabel: meta.categoryLabel,
        typeId: meta.typeId,
        typeLabel: meta.typeLabel,
        amountNaira,
        amountKobo: amountNaira * 100,
        currency: "NGN",
        status: paid ? "paid" : data.status,
        reference: data.reference,
        paidAt: data.paid_at || null,
        createdAt: data.paid_at || new Date().toISOString(),
      };
      if (!paid) {
        return res.status(402).json({
          success: false,
          message: "Payment has not been verified.",
          data: publicRegistration(synthetic),
        });
      }
      const receipt = receiptFields(synthetic);
      const saved = await updateByReference(reference, {
        ...synthetic,
        ...receipt,
        status: "paid",
      });
      return res.json({
        success: true,
        message: "Registration and payment have been successfully verified.",
        data: publicRegistration(saved),
      });
    }

    if (existing.status === "paid") {
      const receipt = receiptFields(existing);
      const saved = existing.registrationId
        ? existing
        : await updateByReference(reference, receipt);
      return res.json({
        success: true,
        message: "Registration and payment have been successfully verified.",
        data: publicRegistration(saved),
      });
    }

    const data = await verifyTransaction(reference);
    const patch = markFromPaystack(existing, data);
    if (patch.status === "paid") {
      Object.assign(patch, receiptFields(existing));
    }
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
        if (patch.status === "paid") Object.assign(patch, receiptFields(existing));
        await updateByReference(reference, patch);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function lookupRegistration(req, res, next) {
  try {
    const registrationId = String(req.params.registrationId || "").trim();
    if (!registrationId) {
      return res.status(400).json({ success: false, valid: false, message: "Registration ID is required." });
    }
    const record = await findByRegistrationId(registrationId);
    if (!record || record.status !== "paid") {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "This registration could not be verified.",
      });
    }
    return res.json({
      success: true,
      valid: true,
      message: "Registration Verified",
      data: {
        fullName: record.fullName,
        categoryLabel: record.categoryLabel,
        typeLabel: record.typeLabel,
        registrationId: record.registrationId,
        paymentStatus: "Paid",
        status: "Valid",
      },
    });
  } catch (error) {
    next(error);
  }
}

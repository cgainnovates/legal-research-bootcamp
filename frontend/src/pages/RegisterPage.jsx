import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { initializePayment } from "../lib/api";
import {
  CATEGORIES,
  formatNaira,
  getAmount,
  getCategoryLabel,
  getTypeLabel,
} from "../lib/pricing";

const empty = {
  fullName: "",
  email: "",
  phone: "",
  category: "",
  registrationType: "",
};

function validate(form) {
  const errors = {};
  if (form.fullName.trim().length < 3) errors.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!/^[+0-9][0-9\s()-]{7,19}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!["postgraduate", "academia"].includes(form.category)) {
    errors.category = "Select a category.";
  }
  if (!["early", "late"].includes(form.registrationType)) {
    errors.registrationType = "Select a registration type.";
  }
  return errors;
}

function startPaystackCheckout({ accessCode, authorizationUrl, reference }) {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop && accessCode) {
      try {
        const popup = new window.PaystackPop();
        popup.resumeTransaction(accessCode, {
          onSuccess: () => resolve(reference),
          onCancel: () => reject(new Error("Payment was closed before completion.")),
        });
        return;
      } catch {
        // Fall through to hosted checkout.
      }
    }
    if (authorizationUrl) {
      window.location.assign(authorizationUrl);
      resolve("redirect");
      return;
    }
    reject(new Error("Paystack checkout could not be opened."));
  });
}

export default function RegisterPage() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    ...empty,
    category: params.get("category") || "",
    registrationType: params.get("type") || "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amount = useMemo(
    () => getAmount(form.category, form.registrationType),
    [form.category, form.registrationType]
  );

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setServerError("");
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const result = await initializePayment({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        category: form.category,
        registrationType: form.registrationType,
      });
      const data = result.data;
      startPaystackCheckout({ authorizationUrl: data.authorizationUrl });
    } catch (error) {
      if (error.payload?.errors) setErrors(error.payload.errors);
      setServerError(error.message || "Unable to start payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-ivory pt-28 pb-20">
      <div className="container-page max-w-4xl">
        <p className="section-kicker">Registration</p>
        <h1 className="mt-3 font-serif text-4xl text-navy-900">Reserve your seat</h1>
        <p className="mt-3 max-w-2xl text-navy-800/75">
          Complete your details, confirm the approved fee, and pay securely through Paystack.
          The amount is calculated from your selected category and registration type.
        </p>

        <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]" noValidate>
          <div className="space-y-5 border border-navy-900/10 bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl">Participant information</h2>
            <Field
              label="Full name"
              name="fullName"
              value={form.fullName}
              error={errors.fullName}
              onChange={update}
              autoComplete="name"
            />
            <Field
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={update}
              autoComplete="email"
            />
            <Field
              label="Phone number"
              name="phone"
              type="tel"
              value={form.phone}
              error={errors.phone}
              onChange={update}
              autoComplete="tel"
            />

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-900">Category</legend>
              <div className="grid gap-2">
                {CATEGORIES.map((category) => (
                  <label
                    key={category.id}
                    className={`flex cursor-pointer items-center gap-3 border px-3 py-3 text-sm ${
                      form.category === category.id
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-navy-900/15"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={form.category === category.id}
                      onChange={() => update("category", category.id)}
                    />
                    {category.label}
                  </label>
                ))}
              </div>
              {errors.category && <p className="mt-1 text-sm text-red-700">{errors.category}</p>}
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-900">Registration type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: "early", label: "Early Bird" },
                  { id: "late", label: "Late Registration" },
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`flex cursor-pointer items-center gap-3 border px-3 py-3 text-sm ${
                      form.registrationType === type.id
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-navy-900/15"
                    }`}
                  >
                    <input
                      type="radio"
                      name="registrationType"
                      value={type.id}
                      checked={form.registrationType === type.id}
                      onChange={() => update("registrationType", type.id)}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
              {errors.registrationType && (
                <p className="mt-1 text-sm text-red-700">{errors.registrationType}</p>
              )}
            </fieldset>
          </div>

          <aside className="h-fit border border-navy-900/10 bg-navy-900 p-6 text-ivory sm:p-8">
            <h2 className="font-serif text-2xl text-gold-300">Order summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <Row label="Name" value={form.fullName || "—"} />
              <Row label="Email" value={form.email || "—"} />
              <Row label="Category" value={form.category ? getCategoryLabel(form.category) : "—"} />
              <Row
                label="Type"
                value={form.registrationType ? getTypeLabel(form.registrationType) : "—"}
              />
            </dl>
            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-300">Registration fee</p>
              <p className="mt-1 font-serif text-3xl">
                {amount ? formatNaira(amount) : "Select options"}
              </p>
              <p className="mt-2 text-xs text-ivory/60">
                The server confirms this fee against the official pricing table before Paystack is opened.
              </p>
            </div>
            {serverError && (
              <p className="mt-4 text-sm text-red-200" role="alert">
                {serverError}
              </p>
            )}
            <button type="submit" className="btn-gold mt-6 w-full" disabled={submitting}>
              {submitting ? "Connecting to Paystack…" : "Pay securely with Paystack"}
            </button>
            <p className="mt-4 text-center text-xs text-ivory/50">
              By continuing you will be taken to Paystack to complete payment.
            </p>
            <Link to="/" className="mt-4 block text-center text-sm text-gold-300 hover:underline">
              Return to the bootcamp page
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({ label, name, value, onChange, error, type = "text", autoComplete }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-900">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(name, event.target.value)}
        className="mt-1 w-full border border-navy-900/15 bg-ivory px-3 py-2.5 text-navy-900 outline-none ring-gold-400 focus:ring-2"
        aria-invalid={Boolean(error)}
      />
      {error && <span className="mt-1 block text-sm text-red-700">{error}</span>}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ivory/60">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

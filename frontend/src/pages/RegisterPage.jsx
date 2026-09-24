import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchPricing, initializePayment } from "../lib/api";
import {
  CATEGORIES,
  formatNaira,
  getAmount,
  getCategoryLabel,
  getTypeLabel,
} from "../lib/pricing";
import { formatDeadline, getRegistrationWindow } from "../lib/deadline";

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

function startPaystackCheckout({ authorizationUrl }) {
  if (!authorizationUrl) {
    throw new Error("Paystack checkout could not be opened.");
  }
  window.location.assign(authorizationUrl);
}

export default function RegisterPage() {
  const [params] = useSearchParams();
  const presetCategory = params.get("category") || "";
  const presetType = params.get("type") || "";
  const locked = Boolean(presetCategory && presetType);

  const [form, setForm] = useState({
    ...empty,
    category: presetCategory,
    registrationType: presetType,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [windowInfo, setWindowInfo] = useState(() => getRegistrationWindow());

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      category: presetCategory || prev.category,
      registrationType: presetType || prev.registrationType,
    }));
  }, [presetCategory, presetType]);

  useEffect(() => {
    let cancelled = false;
    fetchPricing()
      .then((result) => {
        if (!cancelled && result.window) setWindowInfo(result.window);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const amount = useMemo(
    () => getAmount(form.category, form.registrationType),
    [form.category, form.registrationType]
  );

  const selectedAvailable =
    form.registrationType === "early"
      ? windowInfo.earlyBirdOpen
      : form.registrationType === "late"
        ? windowInfo.lateOpen
        : false;

  function update(name, value) {
    if (locked && (name === "category" || name === "registrationType")) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setServerError("");
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!selectedAvailable) {
      setServerError(
        form.registrationType === "early"
          ? "Early Bird registration has closed."
          : "Late Registration is not open yet."
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await initializePayment({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        category: form.category,
        registrationType: form.registrationType,
      });
      startPaystackCheckout({ authorizationUrl: result.data.authorizationUrl });
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
          Complete your details and pay securely through Paystack. The fee is confirmed by the
          server from your selected category and registration type.
        </p>

        <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]" noValidate>
          <div className="space-y-5 border border-navy-900/10 bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl">Participant information</h2>
            <Field label="Full name" name="fullName" value={form.fullName} error={errors.fullName} onChange={update} autoComplete="name" />
            <Field label="Email address" name="email" type="email" value={form.email} error={errors.email} onChange={update} autoComplete="email" />
            <Field label="Phone number" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={update} autoComplete="tel" />

            {locked ? (
              <div className="border border-gold-500/40 bg-gold-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gold-700">Selected package</p>
                <p className="mt-2 font-serif text-xl text-navy-900">
                  {getCategoryLabel(form.category)}
                </p>
                <p className="text-sm text-navy-800/75">{getTypeLabel(form.registrationType)}</p>
                <p className="mt-2 font-serif text-2xl text-navy-900">
                  {amount ? formatNaira(amount) : ""}
                </p>
              </div>
            ) : (
              <>
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
                      { id: "early", label: "Early Bird", available: windowInfo.earlyBirdOpen },
                      { id: "late", label: "Late Registration", available: windowInfo.lateOpen },
                    ].map((type) => (
                      <label
                        key={type.id}
                        className={`flex items-center gap-3 border px-3 py-3 text-sm ${
                          !type.available
                            ? "cursor-not-allowed opacity-50"
                            : form.registrationType === type.id
                              ? "cursor-pointer border-gold-500 bg-gold-500/10"
                              : "cursor-pointer border-navy-900/15"
                        }`}
                      >
                        <input
                          type="radio"
                          name="registrationType"
                          value={type.id}
                          disabled={!type.available}
                          checked={form.registrationType === type.id}
                          onChange={() => update("registrationType", type.id)}
                        />
                        <span>
                          {type.label}
                          {!type.available && (
                            <span className="block text-xs text-navy-800/60">Unavailable</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.registrationType && (
                    <p className="mt-1 text-sm text-red-700">{errors.registrationType}</p>
                  )}
                </fieldset>
              </>
            )}
            <p className="text-xs text-navy-800/60">
              Early Bird closes {formatDeadline(windowInfo.deadline)}.
            </p>
          </div>

          <aside className="h-fit border border-navy-900/10 bg-navy-900 p-6 text-ivory sm:p-8">
            <h2 className="font-serif text-2xl text-gold-300">Order summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <Row label="Name" value={form.fullName || "—"} />
              <Row label="Email" value={form.email || "—"} />
              <Row label="Category" value={form.category ? getCategoryLabel(form.category) : "—"} />
              <Row label="Type" value={form.registrationType ? getTypeLabel(form.registrationType) : "—"} />
            </dl>
            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-300">Registration fee</p>
              <p className="mt-1 font-serif text-3xl">
                {amount ? formatNaira(amount) : "Select options"}
              </p>
            </div>
            {serverError && (
              <p className="mt-4 text-sm text-red-200" role="alert">
                {serverError}
              </p>
            )}
            <button
              type="submit"
              className="btn-gold mt-6 w-full"
              disabled={submitting || (Boolean(form.registrationType) && !selectedAvailable)}
            >
              {submitting ? "Connecting to Paystack…" : "Pay securely with Paystack"}
            </button>
            <Link to="/#pricing" className="mt-4 block text-center text-sm text-gold-300 hover:underline">
              Choose a different package
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

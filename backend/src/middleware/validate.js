const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9][0-9\s()-]{7,19}$/;

export function sanitizeString(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function validateRegistrationInput(body) {
  const fullName = sanitizeString(body.fullName);
  const email = sanitizeString(body.email).toLowerCase();
  const phone = sanitizeString(body.phone);
  const category = sanitizeString(body.category);
  const registrationType = sanitizeString(body.registrationType);

  const errors = {};

  if (fullName.length < 3) {
    errors.fullName = "Please enter your full name.";
  }
  if (fullName.length > 120) {
    errors.fullName = "Full name is too long.";
  }
  if (!EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!PHONE_RE.test(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!["postgraduate", "academia"].includes(category)) {
    errors.category = "Select a valid registration category.";
  }
  if (!["early", "late"].includes(registrationType)) {
    errors.registrationType = "Select a valid registration type.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { fullName, email, phone, category, registrationType },
  };
}

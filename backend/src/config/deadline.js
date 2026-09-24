/**
 * Single place to change the Early Bird / Late Registration switch.
 * Override with EARLY_BIRD_DEADLINE (ISO 8601), e.g. 2026-09-25T20:52:00+01:00
 *
 * Default is 1 day from the implementation date so the transition can be tested
 * the following day. Change the env var on Vercel when the real deadline is known.
 */
const DEFAULT_DEADLINE = "2026-09-25T20:52:00+01:00";

export function getEarlyBirdDeadline() {
  const raw = process.env.EARLY_BIRD_DEADLINE || DEFAULT_DEADLINE;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return new Date(DEFAULT_DEADLINE);
  }
  return date;
}

export function getRegistrationWindow(now = new Date()) {
  const deadline = getEarlyBirdDeadline();
  const earlyBirdOpen = now.getTime() < deadline.getTime();
  return {
    deadline: deadline.toISOString(),
    earlyBirdOpen,
    lateOpen: !earlyBirdOpen,
    activeType: earlyBirdOpen ? "early" : "late",
  };
}

export function assertTypeAvailable(typeId, now = new Date()) {
  const window = getRegistrationWindow(now);
  if (typeId === "early" && !window.earlyBirdOpen) {
    return {
      error: "Early Bird registration has closed. Please use Late Registration.",
      window,
    };
  }
  if (typeId === "late" && !window.lateOpen) {
    return {
      error: "Late Registration is not open yet. Early Bird is still available.",
      window,
    };
  }
  return { window };
}

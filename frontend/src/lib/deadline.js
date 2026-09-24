/** Must stay in sync with backend/src/config/deadline.js unless EARLY_BIRD_DEADLINE is set. */
export const DEFAULT_EARLY_BIRD_DEADLINE = "2026-09-25T20:52:00+01:00";

export function getEarlyBirdDeadline(iso) {
  const date = new Date(iso || import.meta.env.VITE_EARLY_BIRD_DEADLINE || DEFAULT_EARLY_BIRD_DEADLINE);
  return Number.isNaN(date.getTime()) ? new Date(DEFAULT_EARLY_BIRD_DEADLINE) : date;
}

export function getRegistrationWindow(iso, now = new Date()) {
  const deadline = getEarlyBirdDeadline(iso);
  const earlyBirdOpen = now.getTime() < deadline.getTime();
  return {
    deadline: deadline.toISOString(),
    earlyBirdOpen,
    lateOpen: !earlyBirdOpen,
    activeType: earlyBirdOpen ? "early" : "late",
  };
}

export function formatDeadline(iso) {
  return getEarlyBirdDeadline(iso).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

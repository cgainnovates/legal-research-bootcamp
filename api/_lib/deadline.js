const DEFAULT_DEADLINE = "2026-09-25T20:52:00+01:00";

export function getEarlyBirdDeadline() {
  const raw = process.env.EARLY_BIRD_DEADLINE || DEFAULT_DEADLINE;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? new Date(DEFAULT_DEADLINE) : date;
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
    return { error: "Early Bird registration has closed. Please use Late Registration.", window };
  }
  if (typeId === "late" && !window.lateOpen) {
    return { error: "Late Registration is not open yet. Early Bird is still available.", window };
  }
  return { window };
}

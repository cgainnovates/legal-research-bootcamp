/**
 * Canonical pricing configuration.
 * Amounts are in Nigerian Naira (NGN).
 * The server — not the browser — is the source of truth for fees.
 */
export const CATEGORIES = {
  postgraduate: {
    id: "postgraduate",
    label: "Postgraduate LLM/PhD Student",
    shortLabel: "Postgraduate LLM/PhD",
    types: {
      early: { id: "early", label: "Early Bird", amountNaira: 40000 },
      late: { id: "late", label: "Late Registration", amountNaira: 50000 },
    },
  },
  academia: {
    id: "academia",
    label: "Legal Academia",
    shortLabel: "Legal Academia",
    types: {
      early: { id: "early", label: "Early Bird", amountNaira: 50000 },
      late: { id: "late", label: "Late Registration", amountNaira: 70000 },
    },
  },
};

export function resolvePricing(categoryId, typeId) {
  const category = CATEGORIES[categoryId];
  if (!category) {
    return { error: "Invalid registration category." };
  }
  const type = category.types[typeId];
  if (!type) {
    return { error: "Invalid registration type." };
  }
  return {
    categoryId: category.id,
    categoryLabel: category.label,
    typeId: type.id,
    typeLabel: type.label,
    amountNaira: type.amountNaira,
    amountKobo: type.amountNaira * 100,
  };
}

export function listPricingPublic(windowInfo) {
  return Object.values(CATEGORIES).map((category) => ({
    id: category.id,
    label: category.label,
    shortLabel: category.shortLabel,
    types: Object.values(category.types).map((type) => ({
      id: type.id,
      label: type.label,
      amountNaira: type.amountNaira,
      available:
        type.id === "early"
          ? Boolean(windowInfo?.earlyBirdOpen)
          : Boolean(windowInfo?.lateOpen),
    })),
  }));
}

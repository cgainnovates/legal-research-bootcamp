export const CATEGORIES = [
  {
    id: "postgraduate",
    label: "Postgraduate LLM/PhD Student",
    shortLabel: "Postgraduate LLM/PhD",
    types: [
      { id: "early", label: "Early Bird", amountNaira: 40000 },
      { id: "late", label: "Late Registration", amountNaira: 50000 },
    ],
  },
  {
    id: "academia",
    label: "Legal Academia",
    shortLabel: "Legal Academia",
    types: [
      { id: "early", label: "Early Bird", amountNaira: 50000 },
      { id: "late", label: "Late Registration", amountNaira: 70000 },
    ],
  },
];

export function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getAmount(categoryId, typeId) {
  const category = CATEGORIES.find((item) => item.id === categoryId);
  const type = category?.types.find((item) => item.id === typeId);
  return type?.amountNaira ?? null;
}

export function getCategoryLabel(categoryId) {
  return CATEGORIES.find((item) => item.id === categoryId)?.label ?? categoryId;
}

export function getTypeLabel(typeId) {
  const labels = { early: "Early Bird", late: "Late Registration" };
  return labels[typeId] ?? typeId;
}

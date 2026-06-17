export function getItemStatus(item) {
  const qty = item.unit_count || 1;
  if (!item.isAvailable) {
    return { key: "in-use", label: "In Use", variant: "amber" };
  }
  if (qty <= 2) {
    return { key: "low-stock", label: "Low Stock", variant: "red" };
  }
  return { key: "available", label: "Available", variant: "green" };
}

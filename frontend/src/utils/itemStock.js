export function getItemStockQuantity(item) {
  const raw = item?.unit_count;
  if (raw === null || raw === undefined || raw === "") return 1;
  const qty = parseInt(raw, 10);
  return Number.isNaN(qty) ? 1 : qty;
}

export function isItemRentable(item) {
  return getItemStockQuantity(item) > 0 && Boolean(item?.isAvailable);
}

export function getItemStatus(item) {
  const qty = getItemStockQuantity(item);

  if (qty <= 0) {
    return { key: "unavailable", label: "Unavailable", variant: "red" };
  }
  if (!item.isAvailable) {
    return { key: "in-use", label: "In Use", variant: "amber" };
  }
  if (qty <= 2) {
    return { key: "low-stock", label: "Low Stock", variant: "red" };
  }
  return { key: "available", label: "Available", variant: "green" };
}

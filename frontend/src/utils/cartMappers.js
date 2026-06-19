/** Format a Date or ISO string as YYYY-MM-DD for the API. */
export function toDateString(value) {
  if (!value) return null;
  return new Date(value).toISOString().split("T")[0];
}

/** Map a server cart row to the shape used by CartContext / UI. */
export function mapServerRowToLine(row) {
  const isPackage = row.package_id != null && row.item_id == null;
  const item = isPackage
    ? {
        id: row.package_id,
        name: row.package_name,
        title: row.package_name,
        price: row.package_price,
        categoryId: row.package_category_id,
      }
    : {
        id: row.item_id,
        name: row.item_name,
        title: row.item_title || row.item_name,
        image: row.item_image,
        description: row.item_description,
        categoryId: row.item_categoryId,
        price: row.item_price,
      };

  return {
    id: String(row.id),
    item,
    pickupDate: row.pickup_date ? String(row.pickup_date).slice(0, 10) : null,
    returnDate: row.return_date ? String(row.return_date).slice(0, 10) : null,
    quantity: row.quantity || 1,
  };
}

/** Map a client cart line to the POST /cart request body. */
export function mapLineToPostBody(line) {
  const body = {
    quantity: line.quantity || 1,
    pickup_date: toDateString(line.pickupDate),
    return_date: toDateString(line.returnDate),
  };

  const itemId = line.item?.id;
  if (itemId == null) return body;

  const idStr = String(itemId);
  const isNumericId = /^\d+$/.test(idStr);
  const isPackage = isNumericId && !line.item.categoryId;

  if (isPackage) {
    body.package_id = parseInt(idStr, 10);
  } else {
    body.item_id = idStr;
  }

  return body;
}

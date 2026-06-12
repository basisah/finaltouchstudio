import { get } from "./client";

export function getItemAvailability(itemId) {
  return get(`/items/${itemId}/availability`);
}

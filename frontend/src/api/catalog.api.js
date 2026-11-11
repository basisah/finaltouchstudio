import { get } from "./client";

/**
 * Catalogue reads shared by several components (navbar search, landing page,
 * items page, build page). Each list is requested once per page load and the
 * in-flight promise is reused, so mounting five consumers costs one query.
 */
const cache = new Map();

function cached(key, loader) {
  if (!cache.has(key)) {
    cache.set(
      key,
      loader().catch((err) => {
        cache.delete(key); // let the next caller retry
        throw err;
      })
    );
  }
  return cache.get(key);
}

/** Rentable items (public catalogue columns). */
export const getCatalogItems = () => cached("items", () => get("/items"));

/** Occasion categories in display order. */
export const getCatalogCategories = () => cached("categories", () => get("/categories"));

/** Packages with their items. */
export const getCatalogPackages = () => cached("packages", () => get("/packages"));

/** Call after an admin edit so the next read is fresh. */
export function invalidateCatalog() {
  cache.clear();
}

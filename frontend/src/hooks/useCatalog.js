import { useEffect, useState } from "react";
import { getCatalogItems, getCatalogCategories } from "../api/catalog.api";
import { getSortedCategories } from "../utils/categoryHelper";

/**
 * Loads items + categories once (shared cache) and exposes loading / error
 * state. Categories fall back to the built-in occasion list when the API is
 * unreachable so navigation still renders.
 */
export function useCatalog() {
  const [state, setState] = useState({ items: [], categories: [], landingCategories: [], loading: true, error: null });

  useEffect(() => {
    let active = true;

    Promise.allSettled([getCatalogItems(), getCatalogCategories()]).then(([itemsResult, categoriesResult]) => {
      if (!active) return;
      const fetched = categoriesResult.status === "fulfilled" ? categoriesResult.value || [] : [];
      const { allItemsCategories, landingCategories } = getSortedCategories(fetched);
      setState({
        items: itemsResult.status === "fulfilled" ? itemsResult.value || [] : [],
        categories: allItemsCategories,
        landingCategories,
        loading: false,
        error: itemsResult.status === "rejected" ? itemsResult.reason : null,
      });
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

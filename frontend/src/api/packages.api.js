import { get } from "./client";

/** Fetch all package bundles */
export const getPackages = () => get("/packages");

/** Fetch detailed single package */
export const getPackage = (id) => get(`/packages/${id}`);

/** Fetch all items in inventory catalog */
export const getItems = () => get("/items");

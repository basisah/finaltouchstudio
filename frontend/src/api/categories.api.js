import { get } from "./client";

/** Fetch all categories from the backend */
export const getCategories = () => get("/categories");

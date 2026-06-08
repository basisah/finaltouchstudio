import { get } from "./client";

/** Fetch past project gallery items */
export const getGalleryItems = () => get("/gallery");

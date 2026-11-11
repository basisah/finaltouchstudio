/**
 * Item / category images are stored either as an uploaded file path
 * ("/uploads/items/…"), an absolute URL (demo catalogue photos) or, for
 * legacy rows, an emoji placeholder. These helpers tell them apart.
 */

const UNSPLASH_HOST = "images.unsplash.com";

/** True when `src` can be used as an <img> source. */
export function isImageSrc(src) {
  if (typeof src !== "string" || !src) return false;
  return src.startsWith("/uploads") || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:image/");
}

/**
 * Returns `src` sized for its slot. CDN photos accept a width parameter, so a
 * 400px card never downloads a 1200px image; uploaded files are returned as-is.
 */
export function imageUrl(src, width) {
  if (!isImageSrc(src)) return null;
  if (!width || !src.includes(UNSPLASH_HOST)) return src;
  try {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    return url.toString();
  } catch {
    return src;
  }
}

/** `srcset` for CDN photos (undefined for uploads, which have a single size). */
export function imageSrcSet(src, widths = [400, 800, 1200]) {
  if (!isImageSrc(src) || !src.includes(UNSPLASH_HOST)) return undefined;
  return widths.map((w) => `${imageUrl(src, w)} ${w}w`).join(", ");
}

/** Parses the JSON array stored in `items.gallery_images`. */
export function parseGallery(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.filter(isImageSrc) : [];
  } catch {
    return [];
  }
}

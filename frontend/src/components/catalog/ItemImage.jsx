import { useState } from "react";
import { imageSrcSet, imageUrl, isImageSrc } from "../../utils/images";
import { ImageIcon } from "../ui";
import styles from "./ItemImage.module.css";

/**
 * Product / category photo with a consistent placeholder.
 * Handles uploaded files, absolute URLs and rows that have no photo yet
 * (or whose photo fails to load) without showing a broken-image icon.
 */
export default function ItemImage({ src, alt = "", width = 800, sizes, eager = false, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!isImageSrc(src) || failed) {
    return (
      <div className={`${styles.placeholder} ${className}`} role="img" aria-label={alt || "No photo yet"}>
        <ImageIcon width={32} height={32} />
      </div>
    );
  }

  return (
    <img
      className={`${styles.image} ${className}`}
      src={imageUrl(src, width)}
      srcSet={imageSrcSet(src)}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

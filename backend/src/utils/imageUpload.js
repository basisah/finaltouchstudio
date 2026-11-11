const path = require("path");
const multer = require("multer");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // the admin UI compresses before upload, so 5 MB is generous
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

/**
 * Builds a multer instance that stores image uploads on disk.
 * @param {() => string} getDir   resolves (and creates) the destination folder
 * @param {(file) => string} stem builds the filename without its extension
 */
function createImageUpload(getDir, stem) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, getDir()),
    filename: (req, file, cb) => cb(null, `${stem(file)}${path.extname(file.originalname).toLowerCase()}`),
  });

  return multer({
    storage,
    limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) return cb(null, true);
      const err = new Error("Only image files (JPEG, PNG, WebP, GIF, AVIF) can be uploaded");
      err.status = 400;
      cb(err);
    },
  });
}

/** Wraps `upload.single(field)` so rejected files answer with JSON instead of an HTML error page. */
function singleImage(upload, field = "image") {
  const handler = upload.single(field);
  return (req, res, next) =>
    handler(req, res, (err) => {
      if (!err) return next();
      const tooLarge = err.code === "LIMIT_FILE_SIZE";
      res.status(tooLarge ? 413 : err.status || 400).json({
        error: tooLarge ? "Image is larger than 5 MB" : err.message || "Upload failed",
      });
    });
}

module.exports = { createImageUpload, singleImage, MAX_IMAGE_BYTES };

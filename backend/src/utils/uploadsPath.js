const path = require("path");
const fs = require("fs");

function getUploadsRoot() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "finaltouch-uploads");
  }
  return path.join(__dirname, "../../uploads");
}

function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.error("Upload directory init failed:", dir, err.message);
  }
}

function getItemUploadDir() {
  const dir = getUploadsRoot();
  ensureDir(dir);
  return dir;
}

function getCategoryUploadDir() {
  const dir = path.join(getUploadsRoot(), "categories");
  ensureDir(dir);
  return dir;
}

module.exports = {
  getUploadsRoot,
  getItemUploadDir,
  getCategoryUploadDir,
  ensureDir,
};

import express from "express";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let app;

try {
  app = require("../vendor-backend/src/index.js");
} catch (err) {
  console.error("API boot failed:", err);
  app = express();
  app.all("*", (_req, res) => {
    res.status(500).json({
      error: "API boot failed",
      message: err?.message || String(err),
    });
  });
}

export default app;

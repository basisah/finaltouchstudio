/**
 * Vercel serverless entry when project root is `frontend`.
 * All /api/* requests are rewritten here — see frontend/vercel.json.
 */
module.exports = require("../../backend/src/index.js");

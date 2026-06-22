/**
 * Vercel serverless entry — all /api/* requests are rewritten here.
 * @see vercel.json rewrites
 */
module.exports = require("../backend/src/index.js");

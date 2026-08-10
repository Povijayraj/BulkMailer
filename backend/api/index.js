// Vercel treats any file under /api as a serverless function. The Express
// app itself is a valid (req, res) handler, so we just export it directly —
// vercel.json rewrites every request here.
module.exports = require("../app");

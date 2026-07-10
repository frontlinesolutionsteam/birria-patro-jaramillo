/**
 * Railway doesn't understand Vercel's api/*.js "auto-serverless-function"
 * convention — this repo has no other server, so this file exists purely to
 * make it run there: serve the static site, and mount api/chat.js's existing
 * (req, res) handler as a real Express route. api/chat.js itself is untouched.
 */
const express = require("express");
const path = require("path");

const chatHandler = require("./api/chat");

const app = express();
app.use(express.json());

app.post("/api/chat", chatHandler);

app.use(express.static(path.join(__dirname), { extensions: ["html"] }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Birria Patro Jaramillo site listening on port ${PORT}`);
});

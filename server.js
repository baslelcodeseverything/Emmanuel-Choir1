const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve everything inside /public automatically
app.use(express.static(path.join(__dirname, 'public')));

// HTML routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// API Routes
app.use("/api/auth", require("./api/auth"));
app.use("/api/chat", require("./api/chat"));
app.use("/api/admin", require("./api/admin"));

// Export for Vercel (VERY IMPORTANT)
module.exports = app;

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import registerRoute from "./api/register.js";
import loginRoute from "./api/login.js";
import chatRoute from "./api/chat.js";
import adminRoute from "./api/admin.js";
import authRoute from "./api/auth.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/chat", chatRoute);
app.use("/api/admin", adminRoute);
app.use("/api/auth", authRoute);

// Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

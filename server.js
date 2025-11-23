const express = require("express");
const path = require("path");
const app = express();

// Use JSON / URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// HTML routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API endpoints
app.use('/api/auth', require('./api/auth'));
app.use('/api/chat', require('./api/chat'));
app.use('/api/admin', require('./api/admin'));

// For any unknown route, you may also fallback to index.html (if you want single page behavior)
// app.use((req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

module.exports = app;  // Export the app for Vercel

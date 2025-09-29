// server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// session (keep secret in env for production)
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Simple auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ authenticated: false, message: 'Not authenticated' });
}

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve launcher only when authenticated (safer)
app.get('/launcher', (req, res) => {
  if (req.session && req.session.user) {
    return res.sendFile(path.join(__dirname, 'public', 'launcher.html'));
  }
  return res.redirect('/');
});

// API: check auth (used by frontend)
app.get('/auth', (req, res) => {
  if (req.session && req.session.user) return res.json({ authenticated: true, user: req.session.user });
  return res.json({ authenticated: false });
});

// Login (hardcoded user)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // UPDATED CREDENTIALS
  const HARDTO = 'Yatendra Rajput';
  const HARDPW = 'Yattu@882';

  if (username === HARDTO && password === HARDPW) {
    req.session.user = { name: HARDTO };
    return res.json({ success: true });
  }
  return res.json({ success: false, message: 'Invalid credentials' });
});

// Logout (destroy session)
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.json({ success: false, message: 'Logout failed' });
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

// Send Mail - protected route
app.post('/send', requireAuth, async (req, res) => {
  try {
    const { email, password, senderName, recipients, subject, message } = req.body;

    if (!email || !password || !recipients) {
      return res.json({ success: false, message: "Email, password and recipients are required" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: email, pass: password }
    });

    const recipientList = recipients
      .split(/[\n,]+/)
      .map(r => r.trim())
      .filter(r => r);

    const mailOptions = {
      from: `"${senderName || "Anonymous"}" <${email}>`,
      bcc: recipientList,
      subject: subject || "No Subject",
      text: message || ""
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Mails sent:", info.response);
    return res.json({ success: true, message: `Mail sent to ${recipientList.length} recipients` });
  } catch (err) {
    console.error('Mail error:', err);
    return res.json({ success: false, message: err.message || 'Send failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

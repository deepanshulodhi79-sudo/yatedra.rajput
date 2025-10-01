require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
}));

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/');
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/launcher', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'launcher.html'));
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === "Yatendra Rajput" && password === "Yattu@882") {
    req.session.user = { name: username };
    return res.json({ success: true });
  }
  return res.json({ success: false, message: 'Invalid credentials' });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

app.post('/send', requireAuth, async (req, res) => {
  try {
    const { senderName, email, password, recipients, subject, message } = req.body;
    if (!email || !password || !recipients) {
      return res.json({ success: false, message: "Email, password and recipients required" });
    }

    const recipientList = recipients
      .split(/[\n,]+/)
      .map(r => r.trim())
      .filter(r => r);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "No valid recipients" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: email, pass: password }
    });

    // Prepare all send promises
    const sendPromises = recipientList.map(r => {
     const mailOptions = {
  from: `"${senderName || 'Anonymous'}" <${email}>`,
  to: r,  // recipient ke liye alag email
  subject: subject || "No Subject",
  text: message || "",
  // replyTo remove kar diya
  headers: { 'Precedence': 'bulk' } // optional
};
     return transporter.sendMail(mailOptions);
    });

    // Send all emails in parallel
    const results = await Promise.all(sendPromises);

    return res.json({ success: true, message: `Mail sent to ${recipientList.length} recipients` });
  } catch (err) {
    console.error("Send error:", err);
    return res.json({ success: false, message: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

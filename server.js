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
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/launcher', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'public', 'launcher.html')));

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

// Send Mail
app.post('/send', requireAuth, async (req, res) => {
  try {
    const { senderName, email, password, recipients, subject, message } = req.body;
    if (!email || !password || !recipients) return res.json({ success:false, message:"Email, password and recipients required" });

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

await transporter.sendMail({
  from: `"${senderName || 'Anonymous'}" <${email}>`,
  to: recipientList[0],                 // पहला recipient To field में
  bcc: recipientList.slice(1),          // बाकी recipients BCC field में
  subject: subject || 'No Subject',
  text: message || ''
});


    return res.json({ success:true, message: `Mail sent to ${recipientList.length} recipients` });

  } catch(err) {
    return res.json({ success:false, message: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

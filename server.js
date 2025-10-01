// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// 🔑 Hardcoded login credentials
const HARD_USERNAME = "Yatendra Rajput";
const HARD_PASSWORD = "Yattu@882";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'bulk-mailer-secret',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🔒 Auth middleware
function requireAuth(req, res, next) {
  if (req.session.user) return next();
  return res.redirect('/login');
}

// Login routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === HARD_USERNAME && password === HARD_PASSWORD) {
    req.session.user = username;
    return res.redirect('/');
  }
  res.send("❌ Invalid credentials");
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Home (form)
app.get('/', requireAuth, (req, res) => {
  res.render('index');
});

// ✅ Bulk Mail Sender
app.post('/send', requireAuth, async (req, res) => {
  try {
    const { senderName, email, password, recipients, subject, message } = req.body;
    if (!email || !password || !recipients) {
      return res.json({ success: false, message: "Email, password and recipients required" });
    }

    // recipients split (comma/newline separated)
    const recipientList = recipients
      .split(/[\n,]+/)
      .map(r => r.trim())
      .filter(r => r);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "No valid recipients" });
    }

    // ✅ Single transporter (one login → faster)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: email, pass: password }
    });

    // ✅ Parallel fast sending
    const sendTasks = recipientList.map(r => {
      let mailOptions = {
        from: `"${senderName || 'Anonymous'}" <${email}>`,
        to: r,  // ✅ Each client sees only their own ID
        subject: subject || "No Subject",
        text: message || "",
        replyTo: `"${senderName || 'Anonymous'}" <${email}>`,
        headers: {
          'Precedence': 'bulk',
          'X-No-Reply-All': 'true'
        }
      };
      return transporter.sendMail(mailOptions);
    });

    await Promise.all(sendTasks);

    return res.json({ success: true, message: `✅ Mail sent to ${recipientList.length}` });

  } catch (err) {
    console.error("Send error:", err);
    return res.json({ success: false, message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

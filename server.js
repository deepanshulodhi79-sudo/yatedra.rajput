const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Hardcoded credentials
const HARD_USERNAME = "Yatendra Rajput";
const HARD_PASSWORD = "Yattu@882";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "mail-launcher-secret",
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, "public")));

// login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === HARD_USERNAME && password === HARD_PASSWORD) {
    req.session.loggedIn = true;
    return res.json({ success: true });
  }
  return res.json({ success: false, message: "Invalid credentials" });
});

// logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// protect index.html
app.get("/index.html", (req, res, next) => {
  if (req.session.loggedIn) {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  }
  return res.redirect("/");
});

// mail sending
app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, gmail, appPassword, recipients, subject, message } = req.body;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmail, pass: appPassword },
    });

    const recipientList = recipients.split("\n").map(r => r.trim()).filter(r => r);
    for (let recipient of recipientList) {
      await transporter.sendMail({
        from: `"${senderName}" <${gmail}>`,
        to: recipient,
        subject,
        text: message,
      });
    }
    res.json({ success: true, message: "✅ All mails sent" });
  } catch (err) {
    res.json({ success: false, message: "❌ Failed: " + (err.message || err.toString()) });
  }
});

// default route → login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

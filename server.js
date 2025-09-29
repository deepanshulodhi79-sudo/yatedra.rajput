const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded login
const HARD_USERNAME = "Yatendra Rajput";
const HARD_PASSWORD = "Yattu@882";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === HARD_USERNAME && password === HARD_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, gmail, appPassword, recipients, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmail,
        pass: appPassword,
      },
    });

    const recipientList = recipients
      .split("\n")
      .map(r => r.trim())
      .filter(r => r);

    for (let recipient of recipientList) {
      await transporter.sendMail({
        from: `"${senderName}" <${gmail}>`,
        to: recipient,
        subject,
        text: message,
      });
    }

    res.json({ success: true, message: "✅ All mails sent" });
  } catch (error) {
    console.error("❌ Full Error:", error);
    res.json({
      success: false,
      message:
        "❌ Failed: " +
        (error?.message || error?.toString() || JSON.stringify(error)),
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

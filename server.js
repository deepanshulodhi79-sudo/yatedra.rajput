const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Default route → login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Hardcoded login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Yatendra Rajput" && password === "Yattu@882") {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// Send Mail
app.post("/send", async (req, res) => {
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

    let mailOptions = {
      from: `"${senderName || "Anonymous"}" <${email}>`,
      bcc: recipientList,
      subject: subject || "No Subject",
      text: message || "",
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Mails sent:", info.response);

    res.json({ success: true, message: `✅ Mail sent to ${recipientList.length} recipients` });
  } catch (err) {
    console.error("❌ Mail error:", err.message);
    res.json({ success: false, message: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

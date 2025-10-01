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

    // ✅ Single transporter (fast + no repeated login)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: email, pass: password }
    });

    // ✅ Send mails in parallel (fast like before)
    const sendTasks = recipientList.map(r => {
      let mailOptions = {
        from: `"${senderName || 'Anonymous'}" <${email}>`,
        to: r,                      // ✅ each client sees only their own email
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

    return res.json({ success: true, message: `Mail sent to ${recipientList.length}` });
  } catch (err) {
    console.error("Send error:", err);
    return res.json({ success: false, message: err.message });
  }
});

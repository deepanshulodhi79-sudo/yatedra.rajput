// public/script.js

// LOGIN function
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Redirect to launcher page
        window.location.href = "/launcher";
      } else {
        document.getElementById("loginStatus").innerText =
          data.message || "Invalid credentials";
      }
    })
    .catch(err => {
      document.getElementById("loginStatus").innerText = "❌ Error: " + err.message;
    });
}

// Check authentication (for launcher page)
function checkAuth() {
  fetch("/auth")
    .then(res => res.json())
    .then(data => {
      if (!data.authenticated) {
        window.location.href = "/";
      }
    })
    .catch(() => {
      window.location.href = "/";
    });
}

// Logout
function logout() {
  fetch("/logout", { method: "POST" })
    .then(() => {
      window.location.href = "/";
    })
    .catch(() => {
      window.location.href = "/";
    });
}

// Send mail
function sendMail() {
  const senderName = document.getElementById("senderName").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("pass").value.trim();
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const recipients = document.getElementById("recipients").value.trim();
  const status = document.getElementById("statusMessage");
  const btn = document.getElementById("sendBtn");

  status.innerText = "";
  if (!email || !password || !recipients) {
    status.innerText = "❌ Email, password and recipients required";
    return;
  }

  btn.disabled = true;
  btn.innerText = "Sending...";

  fetch("/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderName,
      email,
      password,
      subject,
      message,
      recipients
    })
  })
    .then(res => res.json())
    .then(data => {
      status.innerText = data.message;
      if (data.success) {
        alert("✅ Mail sent successfully!");
      } else {
        alert("❌ Failed: " + data.message);
      }
      btn.disabled = false;
      btn.innerText = "Send All";
    })
    .catch(err => {
      status.innerText = "❌ Error: " + err.message;
      alert("❌ Error: " + err.message);
      btn.disabled = false;
      btn.innerText = "Send All";
    });
}

// On launcher page load, call checkAuth
if (window.location.pathname.endsWith("launcher.html")) {
  checkAuth();
}

// Attach sendMail to button if exists
document.getElementById("sendBtn")?.addEventListener("click", sendMail);
document.getElementById("logoutSmall")?.addEventListener("click", logout);

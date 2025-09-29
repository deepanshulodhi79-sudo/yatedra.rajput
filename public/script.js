const sendBtn = document.getElementById("sendBtn");
const recipientsBox = document.getElementById("recipients");
const countLabel = document.getElementById("count");
const logoutBtn = document.getElementById("logoutBtn");

recipientsBox.addEventListener("input", () => {
  const arr = recipientsBox.value.split("\n").filter(r => r.trim());
  countLabel.textContent = `${arr.length} recipient mail addresses are entered`;
});

logoutBtn.addEventListener("click", () => {
  window.location.href = "/";
});

sendBtn.addEventListener("click", async () => {
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending…";

  const body = {
    senderName: document.getElementById("senderName").value,
    gmail: document.getElementById("gmail").value,
    appPassword: document.getElementById("appPassword").value,
    recipients: document.getElementById("recipients").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
  };

  const res = await fetch("/send-mail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  document.getElementById("status").textContent = data.message;

  sendBtn.disabled = false;
  sendBtn.textContent = "Send";
});

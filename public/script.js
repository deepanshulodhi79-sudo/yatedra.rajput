// FRONTEND - session based

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const status = document.getElementById('loginStatus');

  status.innerText = '';
  if (!username || !password) {
    status.innerText = 'Enter username & password';
    status.style.color = 'red';
    return;
  }

  fetch('/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({username, password})
  })
  .then(r=>r.json())
  .then(data=>{
    if(data.success){ window.location.href='/launcher'; }
    else { status.innerText=data.message; status.style.color='red'; }
  })
  .catch(err => { status.innerText='Error: '+err.message; status.style.color='red'; });
}

function checkAuth() {
  fetch('/auth').then(r=>r.json()).then(data=>{
    if(!data.authenticated) window.location.href='/';
  }).catch(()=>window.location.href='/');
}

function logout() {
  fetch('/logout', {method:'POST'})
    .then(()=>window.location.href='/')
    .catch(()=>window.location.href='/');
}

function sendMail() {
  const senderName = document.getElementById('senderName').value;
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('pass').value.trim();
  const recipients = document.getElementById('recipients').value.trim();
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;
  const status = document.getElementById('statusMessage');
  const btn = document.getElementById('sendBtn');

  status.innerText = '';
  if(!email||!password||!recipients){
    status.innerText='Email, app password and recipients required';
    status.style.color='red';
    return;
  }

  btn.disabled=true;
  btn.innerText='Sending...';

  fetch('/send',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({senderName,email,password,recipients,subject,message})
  }).then(r=>r.json()).then(data=>{
    status.innerText=data.message||'Done';
    status.style.color=data.success?'green':'red';
    if(data.success){ document.getElementById('recipients').value=''; document.getElementById('message').value=''; }
  }).catch(err=>{
    status.innerText='Error: '+err.message;
    status.style.color='red';
  }).finally(()=>{ btn.disabled=false; btn.innerText='Send All'; });
}

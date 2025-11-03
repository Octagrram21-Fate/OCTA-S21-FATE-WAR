const R4_ACCOUNT = {
  username: "octar4",
  password: "12345"
};

// Login Form
const form = document.getElementById('loginForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const msg = document.getElementById('loginMessage');

    if (user === R4_ACCOUNT.username && pass === R4_ACCOUNT.password) {
      localStorage.setItem('isR4', 'true');
      msg.textContent = "✅ Login berhasil! Mengalihkan...";
      msg.style.color = "green";
      setTimeout(() => (window.location.href = "events.html"), 1000);
    } else {
      msg.textContent = "❌ Username atau password salah!";
      msg.style.color = "red";
    }
  });
}

// Cek status login
function isR4LoggedIn() {
  return localStorage.getItem('isR4') === 'true';
}

// Logout
function logoutR4() {
  localStorage.removeItem('isR4');
  alert("Logout berhasil!");
  window.location.href = "index.html";
}

// ===== DATA LOGIN R4 =====
const R4_ACCOUNT = {
  username: "r4guild",
  password: "octafatewar"
};

// ===== LOGIN =====
function loginR4(user, pass) {
  if (user === R4_ACCOUNT.username && pass === R4_ACCOUNT.password) {
    localStorage.setItem("r4_logged_in", "true");
    alert("✅ Login R4 berhasil!");
    showR4Section();
  } else {
    alert("❌ Username atau password salah!");
  }
}

// ===== CEK LOGIN =====
function isR4LoggedIn() {
  return localStorage.getItem("r4_logged_in") === "true";
}

// ===== LOGOUT =====
function logoutR4() {
  localStorage.removeItem("r4_logged_in");
  alert("👋 Logout berhasil!");
  showPublicSection();
}

// ===== TAMPILAN LOGIN/R4 =====
function showR4Section() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("r4Section").style.display = "block";
}

function showPublicSection() {
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("r4Section").style.display = "none";
}

// ====== Jalankan saat halaman dimuat ======
document.addEventListener("DOMContentLoaded", () => {
  if (isR4LoggedIn()) {
    showR4Section();
  } else {
    showPublicSection();
  }

  document.getElementById("loginBtn").addEventListener("click", () => {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    loginR4(u, p);
  });

  document.getElementById("logoutBtn").addEventListener("click", logoutR4);
});

/* ==========================================================
   AUTH — login, logout, guard
   ========================================================== */
(function (window) {
    "use strict";

    // ---------- LOGIN PAGE LOGIC ----------
    function initLogin() {
        var form = document.getElementById("loginForm");
        if (!form) return;

        // Already logged in? redirect
        if (window.API.isLoggedIn()) {
            window.location.href = "/admin/dashboard.html";
            return;
        }

        var errorBox = document.getElementById("loginError");
        var btn = document.getElementById("loginBtn");
        var usernameInput = document.getElementById("username");
        var passwordInput = document.getElementById("password");

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            errorBox.classList.remove("show");
            btn.disabled = true;
            btn.innerHTML = '<span class="loader"></span> Signing in...';

            var username = usernameInput.value.trim();
            var password = passwordInput.value;

            if (!username || !password) {
                errorBox.textContent = "Please enter both username and password.";
                errorBox.classList.add("show");
                btn.disabled = false;
                btn.textContent = "Login";
                return;
            }

            fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password }),
            })
                .then(function (res) {
                    return res.json().then(function (d) {
                        if (!res.ok) throw new Error(d.detail || "Login failed");
                        return d;
                    });
                })
                .then(function (data) {
                    window.API.setToken(data.token);
                    window.API.setUser(data.username);
                    window.API.setRole(data.role || "viewer");
                    window.location.href = "/admin/dashboard.html";
                })
                .catch(function (err) {
                    errorBox.textContent = (err && err.message) || "Invalid credentials";
                    errorBox.classList.add("show");
                    btn.disabled = false;
                    btn.textContent = "Login";
                    passwordInput.value = "";
                    passwordInput.focus();
                });
        });
    }

    // ---------- GUARD (protected pages) ----------
    function guard() {
        if (!window.API.isLoggedIn()) {
            window.location.href = "/admin/login.html";
            return false;
        }
        return true;
    }

    // ---------- LOGOUT ----------
    function logout() {
        window.API.clearAuth();
        window.location.href = "/admin/login.html";
    }

    window.Auth = { initLogin: initLogin, guard: guard, logout: logout };

    // Auto-init login page
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLogin);
    } else {
        initLogin();
    }
})(window);
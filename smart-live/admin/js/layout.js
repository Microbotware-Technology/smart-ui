/* ==========================================================
   LAYOUT — renders topbar + sidebar + custom modal system
   ========================================================== */
(function (window) {
    "use strict";

    //     // ---------- FAVICON ----------
    //     var icon = document.querySelector('link[rel="icon"]');

    // if (!icon) {
    //     icon = document.createElement("link");
    //     icon.rel = "icon";
    //     document.head.appendChild(icon);
    // }

    // icon.type = "image/png";
    // icon.href = "/assets/images/icon.png?v=2";

    // ---------- FAVICON ----------
    if (!document.querySelector('script[data-admin-icon]')) {
        var iconScript = document.createElement("script");
        iconScript.src = "/admin/js/icon.js";
        iconScript.setAttribute("data-admin-icon", "true");
        document.head.appendChild(iconScript);
    }

    var NAV_ITEMS = [
        { href: "dashboard.html", icon: "fa-solid fa-gauge-high", label: "Dashboard", key: "dashboard" },
        { href: "analytics.html", icon: "fa-solid fa-chart-line", label: "Analytics", key: "analytics" },
        { href: "donations.html", icon: "fa-solid fa-indian-rupee-sign", label: "Donations", key: "donations" },
        { href: "contacts.html", icon: "fa-solid fa-envelope", label: "Contacts", key: "contacts", badge: "contacts" },
        { href: "activity.html", icon: "fa-solid fa-bell", label: "Activity", key: "activity" },
        { href: "admins.html", icon: "fa-solid fa-user-shield", label: "Admins", key: "admins", superOnly: true },
    ];

    function currentPage() {
        var path = window.location.pathname;
        var file = path.substring(path.lastIndexOf("/") + 1) || "dashboard.html";
        return file.split("?")[0];
    }
    function confirmLogout() {
        showModal({
            type: "warning",
            title: "Logout?",
            message: "Are you sure you want to log out of the admin panel?",
            confirm: "Yes, Logout",
            cancel: "Cancel",
            onConfirm: function () {
                window.Auth.logout();
            }
        });
    }
    function pageKey(file) {
        return file.replace(".html", "");
    }

    function renderTopbar() {
        var user = window.API.getUser() || "admin";
        var role = (window.API.getRole && window.API.getRole()) || "viewer";
        var initials = user.substring(0, 2).toUpperCase();
        var roleLabel = role === "super_admin" ? "Super Admin"
            : role === "editor" ? "Editor"
                : "Viewer";
        return `
<header class="topbar">
    <button type="button" class="menu-toggle" id="menuToggle" aria-label="Menu">
        <i class="fa-solid fa-bars"></i>
    </button>
    <a href="dashboard.html" class="topbar-brand">
        <div class="brand-icon"><i class="fa-solid fa-heart"></i></div>
        <span>Smart Help Admin</span>
    </a>
    <div class="topbar-spacer"></div>
    <!--button type="button" class="topbar-btn" id="topbarChats" title="Unread chats">
        <i class="fa-solid fa-comments"></i>
        <span class="badge" id="topbarChatsBadge" style="display:none;">0</span>
    </button-->
    <div class="topbar-user" title="${roleLabel}">
        <div class="avatar">${initials}</div>
        <span>${user}</span>
        <span class="role-chip role-${role}">${roleLabel}</span>
        <!--button type="button" class="topbar-btn" id="logoutBtn" title="Logout" style="width:28px;height:28px;font-size:14px;">
            <i class="fa-solid fa-right-from-bracket"></i>
        </button-->
    </div>
</header>`;
    }

    function renderSidebar() {
        var cur = pageKey(currentPage());
        var isSuper = window.API && window.API.isSuperAdmin && window.API.isSuperAdmin();
        var items = NAV_ITEMS.filter(function (item) {
            if (item.superOnly && !isSuper) return false;
            return true;
        }).map(function (item) {
            var active = item.key === cur ? " active" : "";
            var badge = item.badge
                ? `<span class="nav-badge" data-badge="${item.badge}" style="display:none;">0</span>`
                : "";
            return `<a href="${item.href}" class="nav-item${active}">
            <i class="${item.icon}"></i>
            <span>${item.label}</span>
            ${badge}
        </a>`;
        }).join("");

        return `<aside class="sidebar" id="sidebar">
        <nav class="sidebar-nav">${items}</nav>
        <div class="sidebar-footer">
            <button type="button" class="nav-item nav-logout" id="sidebarLogout">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
            </button>
        </div>
    </aside>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>`;
    }

    function render() {
        if (!window.Auth.guard()) return;
        var app = document.getElementById("app");
        if (!app) return;
        var mainContent = app.innerHTML;
        app.innerHTML =
            renderTopbar() +
            renderSidebar() +
            `<main class="main"><div class="main-inner">${mainContent}</div></main>`;
    }

    // ==========================================================
    // CUSTOM MODAL SYSTEM
    // ==========================================================
    function injectModalHTML() {
    if (document.getElementById("shfModalRoot")) return;
    var html = `
<div class="shf-modal-root" id="shfModalRoot" aria-hidden="true">
    <div class="shf-modal-backdrop" data-modal-close></div>
    <div class="shf-modal" role="dialog" aria-modal="true">
        <button type="button" class="shf-modal-close" id="shfModalClose" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="shf-modal-scroll" id="shfModalScroll">
            <div class="shf-modal-icon" id="shfModalIcon"><i class="fa-solid fa-circle-question"></i></div>
            <h3 class="shf-modal-title" id="shfModalTitle">Confirm</h3>
            <p class="shf-modal-message" id="shfModalMessage">Are you sure?</p>
            <div class="shf-modal-body" id="shfModalBody" style="display:none;"></div>
            <div class="shf-modal-actions" id="shfModalActions">
                <button type="button" class="btn btn-outline" id="shfModalCancel">Cancel</button>
                <button type="button" class="btn btn-primary" id="shfModalConfirm">Confirm</button>
            </div>
        </div>
    </div>
</div>`;
    var wrap = document.createElement("div");
    wrap.innerHTML = html.trim();
    document.body.appendChild(wrap.firstChild);
}
    /**
     * Show a custom confirmation modal.
     * @param {Object} opts
     *   title   - Modal title
     *   message - Modal body message
     *   confirm - Confirm button text
     *   cancel  - Cancel button text
     *   type    - "danger" | "warning" | "info" (icon + button color)
     *   onConfirm - Callback on confirm
     *   onCancel  - Callback on cancel (optional)
     */
    function showModal(opts) {
        opts = opts || {};
        injectModalHTML();

        var root = document.getElementById("shfModalRoot");
        var icon = document.getElementById("shfModalIcon");
        var title = document.getElementById("shfModalTitle");
        var message = document.getElementById("shfModalMessage");
        var body = document.getElementById("shfModalBody");
        var actions = document.getElementById("shfModalActions");
        var btnCancel = document.getElementById("shfModalCancel");
        var btnConfirm = document.getElementById("shfModalConfirm");

        // Size
        root.setAttribute("data-size", opts.size || "small");
if (opts.hideIcon) {
    root.setAttribute("data-hide-icon", "true");
} else {
    root.removeAttribute("data-hide-icon");
}
        // Type → icon + confirm button color
        var type = opts.type || "info";
        var iconMap = {
            danger: "fa-solid fa-triangle-exclamation",
            warning: "fa-solid fa-circle-exclamation",
            info: "fa-solid fa-circle-question",
            success: "fa-solid fa-circle-check",
        };
        var btnClassMap = {
            danger: "btn-danger", warning: "btn-primary",
            info: "btn-primary", success: "btn-primary",
        };

        // Icon + title
        root.setAttribute("data-type", type);
        icon.innerHTML = '<i class="' + (iconMap[type] || iconMap.info) + '"></i>';
        title.textContent = opts.title || "Confirm";
// Icon visibility
if (opts.hideIcon) {
    icon.style.display = "none";
} else {
    icon.style.display = "";
}
        // Body — either simple message OR rich HTML
        if (opts.bodyHtml) {
            message.style.display = "none";
            body.style.display = "block";
            body.innerHTML = opts.bodyHtml;
        } else {
            message.style.display = "block";
            body.style.display = "none";
            message.textContent = opts.message || "Are you sure?";
        }

        // Buttons
        if (opts.confirm === null) {
            // Info-only modal — hide confirm button
            btnConfirm.style.display = "none";
            actions.classList.add("single-action");
        } else {
            btnConfirm.style.display = "";
            actions.classList.remove("single-action");
            btnConfirm.textContent = opts.confirm || "Confirm";
            btnConfirm.className = "btn " + (btnClassMap[type] || "btn-primary");
        }

        btnCancel.textContent = opts.cancel || "Cancel";

        // Clean listeners (clone)
        var newCancel = btnCancel.cloneNode(true);
        var newConfirm = btnConfirm.cloneNode(true);
        btnCancel.replaceWith(newCancel);
        btnConfirm.replaceWith(newConfirm);
        btnCancel = newCancel;
        btnConfirm = newConfirm;

        function close() {
            root.classList.remove("open");
            root.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
        var closeBtn = document.getElementById("shfModalClose");
        var newClose = closeBtn.cloneNode(true);
        closeBtn.replaceWith(newClose);
        newClose.addEventListener("click", function () {
    close();
    if (typeof opts.onCancel === "function") opts.onCancel();
});
        newCancel.addEventListener("click", function () {
            close();
            if (typeof opts.onCancel === "function") opts.onCancel();
        });
        newConfirm.addEventListener("click", function () {
    if (newConfirm.disabled) return;
    if (typeof opts.onConfirm !== "function") { close(); return; }

    var result = opts.onConfirm();

    // 1. Synchronous inline validation failed → keep modal open
    if (result === false) return;

    // 2. onConfirm returned a Promise → wait for it
    if (result && typeof result.then === "function") {
        newConfirm.disabled = true;
        result.then(function () {
            close();                    // ← API success → close modal
        }).catch(function () {
            newConfirm.disabled = false;  // ← API error → keep modal open (inline error already shown)
        });
        return;
    }

    // 3. Plain return (no promise) → close immediately
    close();
});

        root.querySelector("[data-modal-close]").addEventListener("click", function () {
            close();
            if (typeof opts.onCancel === "function") opts.onCancel();
        });
        if (opts.hideIcon) {
    icon.style.display = "none";
    root.setAttribute("data-hide-icon", "true");
} else {
    icon.style.display = "";
    root.removeAttribute("data-hide-icon");
}
        function onEsc(e) {
            if (e.key === "Escape" && root.classList.contains("open")) {
                close();
                document.removeEventListener("keydown", onEsc);
                if (typeof opts.onCancel === "function") opts.onCancel();
            }
        }
        document.addEventListener("keydown", onEsc);

        root.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        requestAnimationFrame(function () { root.classList.add("open"); });
        setTimeout(function () {
    // Scroll modal content back to top after open
    var scrollEl = document.getElementById("shfModalScroll");
    if (scrollEl) scrollEl.scrollTop = 0;

    // Auto-focus only when there is a confirm action.
    // Info-only modals (donation details, toasts) skip focus
    // so mobile does not auto-scroll to the Close button.
    if (opts.confirm !== null) {
        newConfirm.focus({ preventScroll: true });
    }
}, 100);
    }

    // Expose modal to window
    window.showModal = showModal;

    // ---------- EVENTS ----------
    function bindEvents() {
        var sidebar = document.getElementById("sidebar");
        var overlay = document.getElementById("sidebarOverlay");
        var menuToggle = document.getElementById("menuToggle");
        var logoutBtn = document.getElementById("logoutBtn");

        function closeSidebar() {
            if (sidebar) sidebar.classList.remove("open");
            if (overlay) overlay.classList.remove("open");
        }

        if (menuToggle) {
            menuToggle.addEventListener("click", function () {
                sidebar.classList.toggle("open");
                overlay.classList.toggle("open");
            });
        }
        if (overlay) overlay.addEventListener("click", closeSidebar);

        document.querySelectorAll(".nav-item").forEach(function (a) {
            a.addEventListener("click", function () {
                if (window.innerWidth <= 991) closeSidebar();
            });
        });
        var sidebarLogout = document.getElementById("sidebarLogout");
        if (sidebarLogout) {
            sidebarLogout.addEventListener("click", confirmLogout);
        }

    }

    window.Layout = {
        render: function () {
            render();
            bindEvents();
        },
    };
})(window);
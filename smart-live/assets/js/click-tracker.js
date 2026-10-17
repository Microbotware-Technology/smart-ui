/* ==========================================================
   CLICK TRACKER — auto track tel: / mailto: / wa.me clicks
   Silent, non-blocking, no user impact
   ========================================================== */
(function () {
    "use strict";

    var API_URL = "/api/contact/track";
    var SESSION_KEY = "shf_chat_session";   // reuse widget session

    function getSession() {
        try { return localStorage.getItem(SESSION_KEY) || ""; }
        catch (_) { return ""; }
    }

    function classify(href) {
        if (!href) return null;
        var h = String(href).toLowerCase();
        if (h.indexOf("tel:") === 0) return "call";
        if (h.indexOf("mailto:") === 0) return "email";
        if (h.indexOf("wa.me") !== -1 || h.indexOf("whatsapp") !== -1) return "whatsapp";
        return null;
    }

    function send(type, href) {
        try {
            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    activity_type: type,
                    page_url: (window.location.pathname || "") + (window.location.search || ""),
                    session_id: getSession(),
                    user_agent: navigator.userAgent || "",
                }),
                keepalive: true,
            }).catch(function () {});
        } catch (_) {}
    }

    document.addEventListener("click", function (e) {
        var el = e.target;
        while (el && el !== document.body) {
            if (el.tagName === "A") break;
            el = el.parentElement;
        }
        if (!el || el.tagName !== "A") return;

        var href = el.getAttribute("href") || el.href || "";
        var type = classify(href);
        if (!type) return;

        send(type, href);
    }, true);
})();
/* ==========================================================
   ADMIN FAVICON — page-specific SVG icons
   ========================================================== */
(function (window) {
    "use strict";

    var ICONS = {
        dashboard: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <rect x="8" y="8" width="20" height="20" rx="3" fill="#deb368"/>
                <rect x="36" y="8" width="20" height="12" rx="3" fill="#deb368"/>
                <rect x="36" y="28" width="20" height="28" rx="3" fill="#deb368"/>
                <rect x="8" y="36" width="20" height="20" rx="3" fill="#deb368"/>
            </svg>`,

        analytics: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <polyline points="8,52 22,36 34,42 54,14"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="7"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
                <circle cx="22" cy="36" r="4" fill="#deb368"/>
                <circle cx="34" cy="42" r="4" fill="#deb368"/>
                <circle cx="54" cy="14" r="4" fill="#deb368"/>
            </svg>`,

        chats: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <path d="M10 12h44v32H27L15 54v-10h-5z"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="6"
                    stroke-linejoin="round"/>
                <circle cx="22" cy="28" r="3" fill="#deb368"/>
                <circle cx="32" cy="28" r="3" fill="#deb368"/>
                <circle cx="42" cy="28" r="3" fill="#deb368"/>
            </svg>`,

        donations: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="25"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="6"/>
                <path d="M38 20h-8c-6 0-9 3-9 8s3 8 9 8h4c6 0 9 3 9 8s-3 8-9 8h-9"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="5"
                    stroke-linecap="round"/>
                <path d="M32 14v36"
                    stroke="#deb368"
                    stroke-width="5"
                    stroke-linecap="round"/>
            </svg>`,

        contacts: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <rect x="7" y="13" width="50" height="38" rx="5"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="6"/>
                <path d="M10 18l22 17 22-17"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="6"
                    stroke-linejoin="round"/>
            </svg>`,

        activity: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <path d="M20 25a12 12 0 0 1 24 0c0 14 6 16 6 20H14c0-4 6-6 6-20z"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="6"
                    stroke-linejoin="round"/>
                <path d="M27 52h10"
                    stroke="#deb368"
                    stroke-width="6"
                    stroke-linecap="round"/>
            </svg>`,

        admins: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <circle cx="32" cy="22" r="10"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="6"/>
                <path d="M14 52c2-11 9-17 18-17s16 6 18 17"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="6"
                    stroke-linecap="round"/>
                <path d="M47 32l3 4 6-7"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>`,

        settings: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="9"
                    fill="none"
                    stroke="#deb368"
                    stroke-width="6"/>
                <path d="M32 7v8M32 49v8M7 32h8M49 32h8
                         M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6"
                    stroke="#deb368"
                    stroke-width="6"
                    stroke-linecap="round"/>
            </svg>`
    };

    function getPageKey() {
        var file = window.location.pathname.split("/").pop() || "dashboard.html";
        return file.replace(".html", "");
    }

    function setFavicon() {
        var pageKey = getPageKey();
        var svg = ICONS[pageKey] || ICONS.dashboard;

        var favicon = document.querySelector('link[rel="icon"]');

        if (!favicon) {
            favicon = document.createElement("link");
            favicon.rel = "icon";
            document.head.appendChild(favicon);
        }

        favicon.type = "image/svg+xml";
        favicon.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }

    setFavicon();

})(window);
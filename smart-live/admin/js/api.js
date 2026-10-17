/* ==========================================================
   API WRAPPER — handles auth header + JSON
   ========================================================== */
(function (window) {
    "use strict";

    var TOKEN_KEY = "shf_admin_token";
    var USER_KEY  = "shf_admin_user";
    var BASE      = "/api";

    function getToken() { return localStorage.getItem(TOKEN_KEY) || ""; }
    function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
    function clearAuth() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("shf_admin_role");
    }
    function setUser(u) { localStorage.setItem(USER_KEY, u); }
    function getUser() { return localStorage.getItem(USER_KEY) || ""; }

    var ROLE_KEY = "shf_admin_role";
    function setRole(r) { localStorage.setItem(ROLE_KEY, r || "viewer"); }
    function getRole() { return localStorage.getItem(ROLE_KEY) || "viewer"; }
    function isSuperAdmin() { return getRole() === "super_admin"; }
    function isEditor()     { var r = getRole(); return r === "super_admin" || r === "editor"; }
    function isViewer()     { return getRole() === "viewer"; }

    function request(method, path, body) {
        var headers = { "Accept": "application/json" };
        var token = getToken();
        if (token) headers["Authorization"] = "Bearer " + token;
        if (body !== undefined) headers["Content-Type"] = "application/json";

        return fetch(BASE + path, {
            method: method,
            headers: headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }).then(function (res) {
            if (res.status === 401) {
                clearAuth();
                // If not on login page, redirect
                if (window.location.pathname.indexOf("/admin/login") === -1) {
                    window.location.href = "/admin/login.html";
                }
                return Promise.reject({ status: 401, detail: "Unauthorized" });
            }
            var ct = res.headers.get("content-type") || "";
            var data = ct.indexOf("application/json") !== -1 ? res.json() : res.text();
            return data.then(function (d) {
                if (!res.ok) {
                    return Promise.reject({ status: res.status, detail: (d && d.detail) || d });
                }
                return d;
            });
        });
    }

    window.API = {
        get:  function (p)       { return request("GET", p); },
        post: function (p, b)    { return request("POST", p, b); },
        put:  function (p, b)    { return request("PUT", p, b); },
        patch: function (p, b)   { return request("PATCH", p, b); },
        del:  function (p)       { return request("DELETE", p); },
        getToken: getToken,
        setToken: setToken,
        setUser: setUser,
        getUser: getUser,
        setRole: setRole,
        getRole: getRole,
        isSuperAdmin: isSuperAdmin,
        isEditor: isEditor,
        isViewer: isViewer,
        clearAuth: clearAuth,
        isLoggedIn: function () { return !!getToken(); },
    };
})(window);
/* =====================================================
   AUTH SCRIPT — V-Mart Protected Page Guard
   =====================================================
   This small script is included on ALL protected pages
   (dashboard, billing, inventory, customers, history,
   analytics, settings).

   1) It checks the login flag stored by login.js. If the
      user is NOT logged in, it immediately redirects them
      back to login.html so they cannot access the pages
      directly (e.g., by typing the URL).

   2) It also defines a global logout() function so the
      "Logout" button on every page's sidebar works.

   The login flag is stored in localStorage under the key
   "vmartLoggedIn". login.js sets it to "true" after a
   successful login, and logout() removes it.
   ===================================================== */

(function () {
    // The key used to store the login state (same as login.js)
    const LOGIN_KEY = "vmartLoggedIn";

    // ---- 1. PROTECTED PAGE GUARD ----
    // If the login flag is NOT "true", the user is not logged in.
    if (localStorage.getItem(LOGIN_KEY) !== "true") {
        // Redirect back to the login page.
        window.location.replace("login.html");
    }

    // ---- 2. GLOBAL LOGOUT BUTTON ----
    // This makes the "Logout" button on every page work by
    // clearing the login flag and returning to login.html.

    // Expose logout() on the window object so it can be
    // called from the sidebar HTML button (onclick="logout()").
    window.logout = function () {
        // Remove the login flag so the user must log in again.
        localStorage.removeItem(LOGIN_KEY);

        // Also clear any remembered login state.
        localStorage.removeItem("vmartRemember");
        localStorage.removeItem("vmartRememberedUser");

        // Go back to the login page.
        window.location.href = "login.html";
    };

    // ---- 3. STYLE FOR THE LOGOUT BUTTON ----
    // Inject a small style block so the logout button looks
    // consistent on every page (applies to all sidebars).
    const style = document.createElement("style");
    style.textContent = `
        .logout-btn {
            display: block;
            width: 100%;
            margin-top: 12px;
            padding: 9px 14px;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .logout-btn:hover {
            background: rgba(239, 68, 68, 0.3);
            color: #fff;
        }
    `;
    document.head.appendChild(style);
})();

/* =====================================================
   LOGIN SCRIPT — V-Mart Billing System
   =====================================================
   HOW THE LOGIN WORKS (beginner friendly):

   1. The correct username & password are stored below
      in the `VALID_USER` and `VALID_PASS` variables.
      (In a real app these would come from a server /
      database, but for this demo project they are
      hard-coded right here.)

   2. When the user clicks "Login", the handleLogin()
      function compares what they typed with these
      stored credentials.

   3. If they match -> we save a "logged in" flag in the
      browser's localStorage and redirect to dashboard.html.

   4. If they don't match -> we show an error message,
      clear the password box, and do NOT open the dashboard.

   5. "Remember me" -> if ticked, we also remember the
      username so it is prefilled next time (and restores
      the login state even after closing the browser).
   ===================================================== */


// -----------------------------------------------
// 1. STORED CREDENTIALS (correct username & password)
//    Change these to change the login details.
// -----------------------------------------------
const VALID_USER = "Admin";   // correct username
const VALID_PASS = "Nandini"; // correct password


// -----------------------------------------------
// 2. KEY used in localStorage to remember login state
// -----------------------------------------------
const LOGIN_KEY = "vmartLoggedIn";   // stores "true" when logged in
const REMEMBER_KEY = "vmartRemember";// stores "true" if "Remember me" was checked


// -----------------------------------------------
// 3. RUN ON PAGE LOAD
//    If "Remember me" was checked earlier, we are still
//    logged in, so skip the login page and go straight
//    to the dashboard.
// -----------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    // Trim any whitespace around stored remember flag
    const remembered = localStorage.getItem(REMEMBER_KEY) === "true";

    if (remembered) {
        // Restore the login state and go to dashboard
        localStorage.setItem(LOGIN_KEY, "true");
        window.location.href = "dashboard.html";
        return;
    }

    // Prefill the username if it was remembered (optional nice touch)
    restoreRememberedUsername();
});


// -----------------------------------------------
// 4. SHOW / HIDE PASSWORD
//    Toggles the password input between text and
//    password type so the user can see what they typed.
// -----------------------------------------------
function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("toggleIcon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.className = "fa fa-eye-slash"; // show "hidden" icon
    } else {
        passwordInput.type = "password";
        toggleIcon.className = "fa fa-eye";       // show "eye" icon
    }
}


// -----------------------------------------------
// 5. HANDLE LOGIN (called when form is submitted)
// -----------------------------------------------
function handleLogin(event) {
    // Stop the page from reloading when the form submits
    event.preventDefault();

    // Read what the user typed
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // Basic empty-field check
    if (username === "" || password === "") {
        showError("Please enter both username and password.");
        return;
    }

    // Show a loading spinner on the button
    showLoading(true);

    // Simulate a small delay so the loading effect is visible
    setTimeout(function () {

        // ---- CHECK THE CREDENTIALS ----
        if (username === VALID_USER && password === VALID_PASS) {
            // ✅ CORRECT — allow login

            // Save login state so protected pages know we are logged in
            localStorage.setItem(LOGIN_KEY, "true");

            // Handle "Remember me"
            if (rememberMe) {
                localStorage.setItem(REMEMBER_KEY, "true");
                localStorage.setItem("vmartRememberedUser", username);
            } else {
                localStorage.setItem(REMEMBER_KEY, "false");
                localStorage.removeItem("vmartRememberedUser");
            }

            // Small pause so user sees the loading spinner
            setTimeout(function () {
                // Redirect to the dashboard
                window.location.href = "dashboard.html";
            }, 400);

        } else {
            // ❌ WRONG — do NOT open dashboard
            showLoading(false);

            // Show error and clear the password field
            showError("Incorrect username or password.");
            document.getElementById("password").value = "";
        }
    }, 800); // 0.8 second simulated loading
}


// -----------------------------------------------
// 6. SHOW / HIDE THE ERROR MESSAGE
// -----------------------------------------------
function showError(message) {
    const errorBox = document.getElementById("loginError");
    errorBox.querySelector("span").textContent = message;
    errorBox.style.display = "flex";

    // Auto-hide after 4 seconds
    clearTimeout(errorBox._timer);
    errorBox._timer = setTimeout(function () {
        errorBox.style.display = "none";
    }, 4000);
}


// -----------------------------------------------
// 7. LOADING SPINNER ON THE LOGIN BUTTON
// -----------------------------------------------
function showLoading(isLoading) {
    const btn = document.getElementById("loginBtn");
    const btnText = btn.querySelector(".btn-text");
    const spinner = btn.querySelector(".spinner");

    if (isLoading) {
        btn.disabled = true;                 // prevent double clicks
        btnText.style.display = "none";      // hide the "Login" text
        spinner.style.display = "block";     // show the spinner
    } else {
        btn.disabled = false;
        btnText.style.display = "inline-flex";
        spinner.style.display = "none";
    }
}


// -----------------------------------------------
// 8. REMEMBERED USERNAME (prefill helper)
// -----------------------------------------------
function restoreRememberedUsername() {
    const savedUser = localStorage.getItem("vmartRememberedUser");
    if (savedUser) {
        document.getElementById("username").value = savedUser;
        // Pre-check the remember box too
        document.getElementById("rememberMe").checked = true;
    }
}


// -----------------------------------------------
// 9. LOGOUT (can be called from any protected page)
//    Clears the login flag and returns to login page.
// -----------------------------------------------
function logout() {
    // Remove the login flag so the user must log in again
    localStorage.removeItem(LOGIN_KEY);

    // If "Remember me" was used, remove it too so they are
    // forced back to the login screen on next visit.
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem("vmartRememberedUser");

    // Go back to the login page
    window.location.href = "login.html";
}

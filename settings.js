/* =====================================================
   SETTINGS SCRIPT — V-Mart Settings Module
   =====================================================
   Manages all application settings in localStorage.
   Settings are stored under key "vmartSettings".
   Other pages can read settings with getAppSettings().
   ===================================================== */

// ---- Default Settings ----
const DEFAULT_SETTINGS = {
    // Store Settings
    storeName: "V-Mart",
    storeAddress: "Kazon Gate, Burdwan",
    gstNumber: "",
    storePhone: "",
    storeEmail: "",

    // Billing Settings
    billingGst: "18",
    currencySymbol: "₹",
    invoicePrefix: "VM-",
    nextBillNumber: 1001,

    // Appearance
    themeMode: "dark",
    themeColor: "#f59e0b",
    fontSize: "medium",

    // Admin Profile
    adminName: "Admin",
    profilePic: "", // base64 data URL
    adminPassword: "" // stored as plain text (simple UI only)
};

// ---- Current settings object (loaded from localStorage) ----
let appSettings = {};

// ---- On Page Load ----
document.addEventListener("DOMContentLoaded", function () {
    displayDate();
    loadSettings();
    populateForm();
    setupColorPicker();
});

// ---- Display today's date ----
function displayDate() {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    document.getElementById("currentDate").textContent = "📅 " + now.toLocaleDateString("en-US", options);
}

// =====================================================
// SETTINGS PERSISTENCE
// =====================================================

// Load settings from localStorage
function loadSettings() {
    const data = localStorage.getItem("vmartSettings");
    if (data) {
        try {
            appSettings = JSON.parse(data);
            // Merge with defaults to ensure all keys exist
            for (let key in DEFAULT_SETTINGS) {
                if (appSettings[key] === undefined) {
                    appSettings[key] = DEFAULT_SETTINGS[key];
                }
            }
        } catch (e) {
            appSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
    } else {
        appSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
}

// Save settings to localStorage
function saveSettingsToStorage() {
    localStorage.setItem("vmartSettings", JSON.stringify(appSettings));
}

// =====================================================
// POPULATE FORM FROM SETTINGS
// =====================================================

function populateForm() {
    // Store Settings
    document.getElementById("storeName").value = appSettings.storeName || "";
    document.getElementById("storeAddress").value = appSettings.storeAddress || "";
    document.getElementById("gstNumber").value = appSettings.gstNumber || "";
    document.getElementById("storePhone").value = appSettings.storePhone || "";
    document.getElementById("storeEmail").value = appSettings.storeEmail || "";

    // Billing Settings
    document.getElementById("billingGst").value = appSettings.billingGst || "18";
    document.getElementById("currencySymbol").value = appSettings.currencySymbol || "₹";
    document.getElementById("invoicePrefix").value = appSettings.invoicePrefix || "VM-";
    document.getElementById("nextBillNumber").value = appSettings.nextBillNumber || 1001;

    // Appearance
    document.getElementById("themeMode").value = appSettings.themeMode || "dark";
    document.getElementById("themeColor").value = appSettings.themeColor || "#f59e0b";
    document.getElementById("themeColorValue").textContent = appSettings.themeColor || "#f59e0b";
    document.getElementById("fontSize").value = appSettings.fontSize || "medium";

    // Admin Profile
    document.getElementById("adminName").value = appSettings.adminName || "Admin";

    // Profile picture preview
    if (appSettings.profilePic) {
        const preview = document.getElementById("profilePreview");
        preview.src = appSettings.profilePic;
        preview.style.display = "block";
    }

    // Update header store badge
    document.getElementById("headerStoreBadge").textContent = appSettings.storeAddress || "Kazon Gate, Burdwan";
}

// =====================================================
// COLOR PICKER SYNC
// =====================================================

function setupColorPicker() {
    const colorInput = document.getElementById("themeColor");
    const colorValue = document.getElementById("themeColorValue");

    colorInput.addEventListener("input", function () {
        colorValue.textContent = this.value;
    });
}

// =====================================================
// SAVE SETTINGS
// =====================================================

function saveSettings() {
    // Gather form values
    const storeName = document.getElementById("storeName").value.trim();
    const storeAddress = document.getElementById("storeAddress").value.trim();
    const gstNumber = document.getElementById("gstNumber").value.trim();
    const storePhone = document.getElementById("storePhone").value.trim();
    const storeEmail = document.getElementById("storeEmail").value.trim();

    const billingGst = document.getElementById("billingGst").value;
    const currencySymbol = document.getElementById("currencySymbol").value.trim();
    const invoicePrefix = document.getElementById("invoicePrefix").value.trim();
    const nextBillNumber = parseInt(document.getElementById("nextBillNumber").value) || 1001;

    const themeMode = document.getElementById("themeMode").value;
    const themeColor = document.getElementById("themeColor").value;
    const fontSize = document.getElementById("fontSize").value;

    const adminName = document.getElementById("adminName").value.trim();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate store name
    if (!storeName) {
        showToast("Store name is required!", "error");
        return;
    }

    // Validate password change
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match!", "error");
            return;
        }
        if (newPassword.length < 4) {
            showToast("Password must be at least 4 characters!", "error");
            return;
        }
        // Simple check: if a password was set before, require current password
        if (appSettings.adminPassword && currentPassword !== appSettings.adminPassword) {
            showToast("Current password is incorrect!", "error");
            return;
        }
    }

    // Update settings object
    appSettings.storeName = storeName || "V-Mart";
    appSettings.storeAddress = storeAddress || "Kazon Gate, Burdwan";
    appSettings.gstNumber = gstNumber;
    appSettings.storePhone = storePhone;
    appSettings.storeEmail = storeEmail;

    appSettings.billingGst = billingGst;
    appSettings.currencySymbol = currencySymbol || "₹";
    appSettings.invoicePrefix = invoicePrefix || "VM-";
    appSettings.nextBillNumber = nextBillNumber;

    appSettings.themeMode = themeMode;
    appSettings.themeColor = themeColor;
    appSettings.fontSize = fontSize;
    appSettings.adminName = adminName || "Admin";

    // Update password only if new one provided
    if (newPassword) {
        appSettings.adminPassword = newPassword;
    }

    // Save to localStorage
    saveSettingsToStorage();

    // Apply theme changes immediately
    applyTheme();

    // Update header badge
    document.getElementById("headerStoreBadge").textContent = appSettings.storeAddress;

// Clear password fields
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";

    showToast("✅ Settings saved successfully!");

    // ---- System notification for settings update ----
    if (typeof window.addNotification === "function") {
        window.addNotification(
            "system",
            "Settings Updated",
            "Application settings saved successfully."
        );
    }
    // ---------------------------------------------------
}

// =====================================================
// APPLY THEME (for current page)
// =====================================================

function applyTheme() {
    const settings = appSettings;

    // Theme Mode
    if (settings.themeMode === "light") {
        document.body.style.background = "#f8fafc";
        document.body.style.color = "#1e293b";
    } else {
        document.body.style.background = "";
        document.body.style.color = "";
    }

    // Theme Color — set CSS variable
    document.documentElement.style.setProperty("--theme-color", settings.themeColor);

    // Font Size
    if (settings.fontSize === "small") {
        document.body.style.fontSize = "13px";
    } else if (settings.fontSize === "large") {
        document.body.style.fontSize = "17px";
    } else {
        document.body.style.fontSize = "";
    }
}

// =====================================================
// RESET TO DEFAULT
// =====================================================

function resetToDefault() {
    showConfirmModal(
        "Reset to Default",
        "Are you sure you want to reset all settings to their default values?",
        function () {
            appSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            saveSettingsToStorage();
            populateForm();
            applyTheme();
            closeConfirmModal();
            showToast("✅ Settings reset to defaults!");
        }
    );
}

// =====================================================
// CANCEL — reload page to discard changes
// =====================================================

function cancelSettings() {
    if (confirm("Discard all unsaved changes?")) {
        location.reload();
    }
}

// =====================================================
// PROFILE PICTURE
// =====================================================

// Handle profile picture upload
document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("profilePic");
    if (fileInput) {
        fileInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                const preview = document.getElementById("profilePreview");
                preview.src = event.target.result;
                preview.style.display = "block";
                appSettings.profilePic = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
});

function clearProfilePic() {
    appSettings.profilePic = "";
    const preview = document.getElementById("profilePreview");
    preview.src = "";
    preview.style.display = "none";
    document.getElementById("profilePic").value = "";
    showToast("Profile picture removed");
}

// =====================================================
// DATA MANAGEMENT — EXPORT
// =====================================================

function exportAllData() {
    // Collect all data from localStorage
    const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: "1.0.0",
        settings: appSettings,
        bills: getLocalStorageJSON("bills"),
        customers: getLocalStorageJSON("customers"),
        inventory: getLocalStorageJSON("inventory"),
        products: getLocalStorageJSON("products")
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "V-Mart-Backup-" + new Date().toISOString().split("T")[0] + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("✅ Data exported successfully!");
}

// Helper: safely parse JSON from localStorage
function getLocalStorageJSON(key) {
    const data = localStorage.getItem(key);
    if (data) {
        try { return JSON.parse(data); }
        catch (e) { return null; }
    }
    return null;
}

// =====================================================
// DATA MANAGEMENT — IMPORT
// =====================================================

function importAllData() {
    const fileInput = document.getElementById("importFile");
    const file = fileInput.files[0];

    if (!file) {
        showToast("Please select a JSON file first!", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            // Validate structure
            if (!data.settings && !data.bills && !data.customers) {
                showToast("Invalid backup file format!", "error");
                return;
            }

            // Show confirmation
            showConfirmModal(
                "Import Data",
                "This will overwrite all current data (settings, bills, products, customers). Continue?",
                function () {
                    // Import settings
                    if (data.settings) {
                        localStorage.setItem("vmartSettings", JSON.stringify(data.settings));
                    }

                    // Import bills
                    if (data.bills) {
                        localStorage.setItem("bills", JSON.stringify(data.bills));
                    }

                    // Import customers
                    if (data.customers) {
                        localStorage.setItem("customers", JSON.stringify(data.customers));
                    }

                    // Import inventory
                    if (data.inventory) {
                        localStorage.setItem("inventory", JSON.stringify(data.inventory));
                    }

                    // Import legacy products
                    if (data.products) {
                        localStorage.setItem("products", JSON.stringify(data.products));
                    }

                    closeConfirmModal();
                    showToast("✅ Data imported successfully! Refreshing...");

                    // Reload to apply imported data
                    setTimeout(function () {
                        location.reload();
                    }, 1500);
                }
            );
        } catch (err) {
            showToast("Error reading file: " + err.message, "error");
        }
    };
    reader.readAsText(file);
}

// =====================================================
// DATA MANAGEMENT — CLEAR ALL DATA
// =====================================================

function confirmClearData() {
    showConfirmModal(
        "⚠️ Clear All Data",
        "This will permanently delete ALL bills, products, customers, and settings. This action CANNOT be undone. Are you absolutely sure?",
        function () {
            // Second confirmation for safety
            showConfirmModal(
                "⚠️ Final Confirmation",
                "Type 'DELETE' to confirm clearing all data.",
                function () {
                    // Clear all application keys
                    localStorage.removeItem("vmartSettings");
                    localStorage.removeItem("bills");
                    localStorage.removeItem("customers");
                    localStorage.removeItem("inventory");
                    localStorage.removeItem("products");
                    localStorage.removeItem("dailySales");
                    localStorage.removeItem("salesChart");

                    closeConfirmModal();
                    showToast("🗑️ All data cleared! Refreshing...");
                    setTimeout(function () {
                        location.reload();
                    }, 1500);
                },
                "confirmInput"
            );
        }
    );
}

// =====================================================
// CONFIRMATION MODAL
// =====================================================

let confirmCallback = null;

function showConfirmModal(title, message, callback, mode) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;

    // If mode is "confirmInput", show an input field
    const modalBody = document.querySelector("#confirmModal .modal-body");
    let inputHtml = "";
    if (mode === "confirmInput") {
        inputHtml = '<div style="margin-top:12px;"><input type="text" id="confirmInput" placeholder="Type DELETE here" style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(0,0,0,0.3);color:#e5e7eb;font-size:14px;outline:none;" /></div>';
    }
    modalBody.innerHTML = `<p>${message}</p>${inputHtml}`;

    confirmCallback = callback;

    const yesBtn = document.getElementById("confirmYesBtn");
    yesBtn.onclick = function () {
        if (mode === "confirmInput") {
            const input = document.getElementById("confirmInput");
            if (!input || input.value.trim() !== "DELETE") {
                showToast("Please type 'DELETE' to confirm!", "error");
                return;
            }
        }
        if (confirmCallback) {
            confirmCallback();
        }
    };

    document.getElementById("confirmModal").style.display = "flex";
}

function closeConfirmModal() {
    document.getElementById("confirmModal").style.display = "none";
    // Restore modal body for next use
    document.querySelector("#confirmModal .modal-body").innerHTML = '<p id="confirmMessage">Are you sure?</p>';
}

// =====================================================
// TOAST NOTIFICATION
// =====================================================

function showToast(message, type) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast" + (type === "error" ? " error" : "");
    toast.style.display = "block";

    // Auto-hide after 3 seconds
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () {
        toast.style.display = "none";
    }, 3000);
}

// =====================================================
// GLOBAL HELPER — Other pages can call this to get settings
// =====================================================

// This function is accessible from any page that includes settings.js
// or by reading localStorage.getItem("vmartSettings") directly.
function getAppSettings() {
    const data = localStorage.getItem("vmartSettings");
    if (data) {
        try {
            const s = JSON.parse(data);
            // Merge with defaults
            for (let key in DEFAULT_SETTINGS) {
                if (s[key] === undefined) s[key] = DEFAULT_SETTINGS[key];
            }
            return s;
        } catch (e) {
            return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
    }
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

/* =====================================================
   NOTIFICATIONS SCRIPT — V-Mart Notification System
   =====================================================
   Shared across all pages. Adds a bell icon to the
   header, stores notifications in localStorage under
   "vmartNotifications", and shows toast messages.

   Notification types:
     - lowstock     : product stock reached low limit
     - outofstock   : product stock reached 0
     - newbill      : a new bill was generated
     - sales        : daily sales summary
     - system       : confirmation of important actions

   GLOBAL FUNCTIONS (call from any page):
     - addNotification(type, title, message)
     - showToast(message, type)
     - checkLowStockAlerts()
   ===================================================== */

// ---- localStorage key for notifications ----
const NOTIF_KEY = "vmartNotifications";

// ---- Default low stock limit (from settings if available) ----
function getLowStockLimit() {
    // Try to read from settings (set low stock limit in Settings)
    const settingsData = localStorage.getItem("vmartSettings");
    if (settingsData) {
        try {
            const s = JSON.parse(settingsData);
            if (s.lowStockLimit !== undefined) {
                return parseInt(s.lowStockLimit) || 5;
            }
        } catch (e) { /* ignore */ }
    }
    return 5; // default threshold
}

// ---- Get all notifications from localStorage ----
function getNotifications() {
    const data = localStorage.getItem(NOTIF_KEY);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }
    return [];
}

// ---- Save notifications to localStorage ----
function saveNotifications(list) {
    // Keep maximum 50 notifications to avoid clutter
    if (list.length > 50) {
        list = list.slice(0, 50);
    }
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
}

// ---- Add a new notification ----
function addNotification(type, title, message) {
    const list = getNotifications();

    // Create notification object with timestamp
    const notif = {
        id: Date.now() + "_" + Math.floor(Math.random() * 1000),
        type: type,          // lowstock / outofstock / newbill / sales / system
        title: title,
        message: message,
        timestamp: Date.now(),
        read: false          // unread by default
    };

    // Add to the beginning (newest first)
    list.unshift(notif);

    saveNotifications(list);

    // Update the bell badge if the bell is on this page
    updateBellBadge();

    // Also show a toast so the user sees it immediately
    const toastType = type === "newbill" ? "success"
                    : type === "outofstock" ? "error"
                    : type === "lowstock" ? "warning"
                    : type === "sales" ? "info"
                    : "success";
    showToast(title + " — " + message, toastType);

    return notif;
}

// ---- Mark a single notification as read ----
function markAsRead(id) {
    const list = getNotifications();
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            list[i].read = true;
            break;
        }
    }
    saveNotifications(list);
    renderNotifications();
    updateBellBadge();
}

// ---- Mark all notifications as read ----
function markAllAsRead() {
    const list = getNotifications();
    for (let i = 0; i < list.length; i++) {
        list[i].read = true;
    }
    saveNotifications(list);
    renderNotifications();
    updateBellBadge();
}

// ---- Clear all notifications ----
function clearAllNotifications() {
    saveNotifications([]);
    renderNotifications();
    updateBellBadge();
}

// ---- Count unread notifications ----
function getUnreadCount() {
    const list = getNotifications();
    let count = 0;
    for (let i = 0; i < list.length; i++) {
        if (!list[i].read) count++;
    }
    return count;
}

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================

// ---- Show a toast message ----
function showToast(message, type) {
    // type: success / error / info / warning
    type = type || "success";

    // Remove any existing toast
    const existing = document.querySelector(".notif-toast");
    if (existing) {
        existing.remove();
    }

    // Choose an icon based on type
    let icon = "fas fa-check-circle";
    if (type === "error") icon = "fas fa-exclamation-circle";
    else if (type === "info") icon = "fas fa-info-circle";
    else if (type === "warning") icon = "fas fa-exclamation-triangle";

    // Create toast element
    const toast = document.createElement("div");
    toast.className = "notif-toast " + type;
    toast.innerHTML = '<span class="toast-icon"><i class="' + icon + '"></i></span><span>' + message + '</span>';

    document.body.appendChild(toast);

    // Auto-hide after 4 seconds
    setTimeout(function () {
        toast.style.animation = "toastSlideOut 0.3s ease";
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 4000);
}

// =====================================================
// BELL + DROPDOWN UI
// =====================================================

// ---- Inject bell + dropdown into the header ----
function initNotificationUI() {
    // Find the header-right element (where the store badge lives)
    const headerRight = document.querySelector(".header-right");

    // Build the bell button
    const bell = document.createElement("button");
    bell.className = "notification-bell";
    bell.id = "notificationBell";
    bell.setAttribute("aria-label", "Notifications");
    bell.innerHTML = '<span class="bell-icon"><i class="fas fa-bell"></i></span><span class="notification-badge hidden" id="notificationBadge">0</span>';
    bell.addEventListener("click", toggleNotificationPanel);

    if (headerRight) {
        // Wrap existing content and add bell next to the store badge
        const headerActions = document.createElement("div");
        headerActions.className = "header-actions";

        // Move all existing children into headerActions
        while (headerRight.firstChild) {
            headerActions.appendChild(headerRight.firstChild);
        }

        headerActions.appendChild(bell);
        headerRight.appendChild(headerActions);
    } else {
        // No header-right found (e.g., billing/index page).
        // Add a floating bell at the top-right corner.
        bell.classList.add("floating-bell");
        bell.style.position = "fixed";
        bell.style.top = "20px";
        bell.style.right = "20px";
        bell.style.zIndex = "1500";
        document.body.appendChild(bell);
    }

    // Create the dropdown panel
    const panel = document.createElement("div");
    panel.className = "notification-panel";
    panel.id = "notificationPanel";
    panel.innerHTML = `
        <div class="notif-panel-header">
            <h3><i class="fas fa-bell"></i> Notifications</h3>
            <div class="notif-panel-actions">
                <button class="notif-action-btn" onclick="markAllAsRead()">Mark all read</button>
                <button class="notif-action-btn" onclick="clearAllNotifications()">Clear all</button>
            </div>
        </div>
        <div class="notif-panel-body" id="notificationList"></div>
    `;
    document.body.appendChild(panel);

    // Click outside to close
    document.addEventListener("click", function (e) {
        if (!panel.contains(e.target) && !bell.contains(e.target)) {
            panel.classList.remove("open");
        }
    });

    // Render notifications
    renderNotifications();
    updateBellBadge();
}

// ---- Toggle the notification panel open/closed ----
function toggleNotificationPanel() {
    const panel = document.getElementById("notificationPanel");
    if (!panel) return;

    if (panel.classList.contains("open")) {
        panel.classList.remove("open");
    } else {
        panel.classList.add("open");
        renderNotifications();
    }
}

// ---- Render notifications list in the panel ----
function renderNotifications() {
    const list = document.getElementById("notificationList");
    if (!list) return;

    const notifications = getNotifications();

    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="notif-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
            </div>
        `;
        return;
    }

    let html = "";
    for (let i = 0; i < notifications.length; i++) {
        const n = notifications[i];
        const unreadClass = n.read ? "" : "unread";
        const icon = getTypeIcon(n.type);
        const timeStr = formatTime(n.timestamp);

        html += `
            <div class="notif-item ${unreadClass}" onclick="markAsRead('${n.id}')">
                <div class="notif-icon type-${n.type}"><i class="fas ${icon}"></i></div>
                <div class="notif-content">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-message">${n.message}</div>
                    <div class="notif-time"><i class="far fa-clock"></i> ${timeStr}</div>
                </div>
            </div>
        `;
    }
    list.innerHTML = html;
}

// ---- Get Font Awesome icon for a notification type ----
function getTypeIcon(type) {
    if (type === "lowstock") return "fa-exclamation-triangle";
    if (type === "outofstock") return "fa-times-circle";
    if (type === "newbill") return "fa-receipt";
    if (type === "sales") return "fa-chart-line";
    if (type === "system") return "fa-cog";
    return "fa-bell";
}

// ---- Format timestamp as relative time ----
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + " min ago";

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " hr ago";

    const days = Math.floor(hours / 24);
    if (days < 7) return days + " day" + (days > 1 ? "s" : "") + " ago";

    // Older: show actual date
    const d = new Date(timestamp);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ---- Update the unread count badge on the bell ----
function updateBellBadge() {
    const badge = document.getElementById("notificationBadge");
    if (!badge) return;

    const count = getUnreadCount();
    if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count;
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }
}

// =====================================================
// STOCK ALERT CHECKING
// =====================================================

// ---- Check all products for low/out of stock ----
// Called on page load to catch any existing low stock items.
function checkLowStockAlerts() {
    // Get products from inventory (array) or legacy (object)
    const products = getAllProducts();

    const lowLimit = getLowStockLimit();
    const existing = getNotifications();
    const existingKeys = {};

    // Build a set of existing low-stock notification keys to avoid duplicates
    for (let i = 0; i < existing.length; i++) {
        if (existing[i].type === "lowstock" || existing[i].type === "outofstock") {
            existingKeys[existing[i].message] = true;
        }
    }

    let added = false;

    for (let name in products) {
        const stock = products[name].stock;

        // Out of stock
        if (stock <= 0) {
            const key = name + ":0";
            if (!existingKeys[key]) {
                addNotification(
                    "outofstock",
                    "Out of Stock",
                    name + " is completely out of stock."
                );
                added = true;
            }
        }
        // Low stock
        else if (stock <= lowLimit) {
            const key = name + ":" + stock;
            if (!existingKeys[key]) {
                addNotification(
                    "lowstock",
                    "Low Stock Alert",
                    name + " has only " + stock + " units left."
                );
                added = true;
            }
        }
    }

    return added;
}

// ---- Get all products in a unified object format ----
function getAllProducts() {
    const result = {};

    // Try inventory array format first
    const invData = localStorage.getItem("inventory");
    if (invData) {
        try {
            const invArray = JSON.parse(invData);
            for (let i = 0; i < invArray.length; i++) {
                result[invArray[i].name] = {
                    stock: invArray[i].stock,
                    price: invArray[i].price,
                    gst: invArray[i].gst,
                    category: invArray[i].category
                };
            }
            return result;
        } catch (e) { /* fall through */ }
    }

    // Fall back to legacy products object format
    const prodData = localStorage.getItem("products");
    if (prodData) {
        try {
            return JSON.parse(prodData);
        } catch (e) { /* fall through */ }
    }

    return result;
}

// =====================================================
// DAILY SALES SUMMARY
// =====================================================

// ---- Post today's sales summary as a notification ----
// Call this once per day (e.g., on page load) to show a summary.
function postDailySalesSummary() {
    const bills = getBillsData();
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    let total = 0;
    let count = 0;
    for (let i = 0; i < bills.length; i++) {
        if (bills[i].date === today) {
            total += bills[i].total || 0;
            count++;
        }
    }

    // Only post if there was sales today
    if (count > 0) {
        addNotification(
            "sales",
            "Daily Sales Summary",
            "Today: " + count + " bill(s), Total ₹" + total.toFixed(2)
        );
    }
}

// ---- Get bills from localStorage ----
function getBillsData() {
    const data = localStorage.getItem("bills");
    if (data) {
        try { return JSON.parse(data); }
        catch (e) { return []; }
    }
    return [];
}

// =====================================================
// AUTO-INITIALIZE ON PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
    // Inject the bell + dropdown into the header
    initNotificationUI();

    // Check for low stock alerts on load
    checkLowStockAlerts();

    // Post a daily sales summary (only once per day)
    postDailySalesSummary();
});

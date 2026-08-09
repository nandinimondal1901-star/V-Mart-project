/* =====================================================
   DASHBOARD SCRIPT — V-Mart Retail Management Dashboard
   Reads data from localStorage (set by script.js)
   ===================================================== */

// ---- On Load ----
document.addEventListener("DOMContentLoaded", function () {

    // 1. Display today's date
    displayDate();

    // 2. Load summary card data
    loadSummaryCards();

    // 3. Load low stock alerts
    loadLowStockAlerts();

    // 4. Load recent bills
    loadRecentBills();

    // 5. Draw sales chart
    drawSalesChart();
});

// ---- Display Current Date ----
function displayDate() {
    const now = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    const dateStr = now.toLocaleDateString("en-US", options);
    document.getElementById("currentDate").textContent = "📅 " + dateStr;
}

// ---- Get Products from localStorage ----
function getProducts() {
    const data = localStorage.getItem("products");
    if (data) {
        return JSON.parse(data);
    }
    // fallback defaults (same as script.js)
    return {
        Shirt: { stock: 30, price: 700, gst: 18, category: "Men Wear" },
        Jeans: { stock: 25, price: 1600, gst: 18, category: "Men Wear" },
        Pant: { stock: 28, price: 1200, gst: 18, category: "Men Wear" },
        Saree: { stock: 32, price: 2500, gst: 12, category: "Women Wear" },
        Kurti: { stock: 26, price: 1400, gst: 12, category: "Women Wear" },
        Shoes: { stock: 24, price: 3000, gst: 18, category: "Footwear" },
        Sandals: { stock: 27, price: 2200, gst: 18, category: "Footwear" },
        Watch: { stock: 25, price: 2000, gst: 18, category: "Accessories" }
    };
}

// ---- Get Bills from localStorage ----
function getBills() {
    const data = localStorage.getItem("bills");
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

// ---- Save Bills to localStorage ----
function saveBills(bills) {
    localStorage.setItem("bills", JSON.stringify(bills));
}

// ---- Load Summary Cards ----
function loadSummaryCards() {
    const products = getProducts();
    const bills = getBills();

    // Total Products (unique product types)
    const productCount = Object.keys(products).length;
    document.getElementById("totalProducts").textContent = productCount;

    // Total Sales (sum of all bill amounts)
    let totalSales = 0;
    for (let i = 0; i < bills.length; i++) {
        totalSales += bills[i].total || 0;
    }
    document.getElementById("totalSales").textContent = "₹" + totalSales.toFixed(2);

    // Total Bills
    document.getElementById("totalBills").textContent = bills.length;

    // Total Customers (unique customer names from bills)
    const customerSet = new Set();
    for (let i = 0; i < bills.length; i++) {
        if (bills[i].customer) {
            customerSet.add(bills[i].customer.toLowerCase().trim());
        }
    }
    document.getElementById("totalCustomers").textContent = customerSet.size;
}

// ---- Load Low Stock Alerts ----
function loadLowStockAlerts() {
    const products = getProducts();
    const container = document.getElementById("lowStockList");
    const threshold = 5;

    const lowItems = [];

    for (let item in products) {
        if (products[item].stock <= threshold) {
            lowItems.push({
                name: item,
                stock: products[item].stock
            });
        }
    }

    if (lowItems.length === 0) {
        container.innerHTML = '<p class="no-alert">✅ All items are well stocked!</p>';
        return;
    }

    // Sort by stock (lowest first)
    lowItems.sort((a, b) => a.stock - b.stock);

    let html = "";
    for (let i = 0; i < lowItems.length; i++) {
        const item = lowItems[i];
        html += `
            <div class="alert-item">
                <span class="item-name">🛍️ ${item.name}</span>
                <span class="item-stock">Stock: ${item.stock}</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

// ---- Load Recent Bills Table ----
function loadRecentBills() {
    const bills = getBills();
    const tbody = document.getElementById("recentBillsBody");

    if (bills.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888; padding:20px;">No bills generated yet</td></tr>';
        return;
    }

    // Show latest 10 bills (most recent first — assuming last item in array is newest)
    const recent = bills.slice(-10).reverse();

    let html = "";
    for (let i = 0; i < recent.length; i++) {
        const bill = recent[i];
        const billNo = bill.invoiceNo || "VM-" + (1000 + i);
        const customer = bill.customer || "Walk-in Customer";
        const date = bill.date || "N/A";
        const amount = bill.total || 0;
        const status = bill.status || "Completed";

        const statusClass = status === "Completed" ? "status-completed" : "status-pending";

        html += `
            <tr>
                <td>${billNo}</td>
                <td>${customer}</td>
                <td>${date}</td>
                <td>₹${amount.toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

// ---- Draw Sales Chart (Canvas-based bar chart) ----
function drawSalesChart() {
    const canvas = document.getElementById("salesChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const bills = getBills();

    const W = canvas.width;
    const H = canvas.height;
    const padding = { top: 20, bottom: 30, left: 10, right: 10 };

    // Clear canvas
    ctx.clearRect(0, 0, W, H);

    // Get last 7 days sales data
    const dailySales = getLast7DaysSales(bills);

    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;
    const barCount = dailySales.length;
    const barGap = 8;
    const barW = (chartW - barGap * (barCount + 1)) / barCount;

    // Find max for scaling
    let maxVal = 1;
    for (let i = 0; i < dailySales.length; i++) {
        if (dailySales[i].total > maxVal) maxVal = dailySales[i].total;
    }
    maxVal = Math.ceil(maxVal * 1.2) || 1;

    // Draw bars
    for (let i = 0; i < dailySales.length; i++) {
        const x = padding.left + barGap + i * (barW + barGap);
        const barH = (dailySales[i].total / maxVal) * chartH;
        const y = padding.top + chartH - barH;

        // Gradient bar
        const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
        grad.addColorStop(0, "#f59e0b");
        grad.addColorStop(1, "#f97316");
        ctx.fillStyle = grad;

        // Rounded top bar
        ctx.beginPath();
        const r = 4;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, padding.top + chartH);
        ctx.lineTo(x, padding.top + chartH);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();

        // Day label (abbreviated)
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        const dayLabel = dailySales[i].day.substring(0, 3);
        ctx.fillText(dayLabel, x + barW / 2, padding.top + chartH + 16);

        // Value on top
        if (dailySales[i].total > 0) {
            ctx.fillStyle = "#e5e7eb";
            ctx.font = "9px sans-serif";
            ctx.fillText("₹" + dailySales[i].total.toFixed(0), x + barW / 2, y - 6);
        }
    }

    // Draw baseline
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(W - padding.right, padding.top + chartH);
    ctx.stroke();
}

// ---- Helper: Aggregate sales for last 7 days ----
function getLast7DaysSales(bills) {
    const days = [];
    const now = new Date();

    // Initialize 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        days.push({
            dateKey: dateKey,
            day: dayName,
            total: 0
        });
    }

    // Aggregate bill totals by date
    for (let i = 0; i < bills.length; i++) {
        const billDate = bills[i].date;
        if (!billDate) continue;

        for (let j = 0; j < days.length; j++) {
            if (days[j].dateKey === billDate) {
                days[j].total += bills[i].total || 0;
                break;
            }
        }
    }

    return days;
}

// ---- Expose a helper for other pages to log bills ----
function addBillToHistory(billData) {
    const bills = getBills();
    bills.push(billData);
    saveBills(bills);
}


/* =====================================================
   ANALYTICS SCRIPT — V-Mart Analytics & Reports
   =====================================================
   Reads data from localStorage and displays:
   - KPI stat cards with date filtering
   - Monthly Sales Line Chart (Chart.js)
   - Category Pie Chart (Chart.js)
   - Daily Revenue Bar Chart (Chart.js)
   - Top 5 Products, Top 5 Customers, Low Stock
   - Export as PDF & CSV
   ===================================================== */

// ---- Chart.js Global Instances (for destroying before re-render) ----
let monthlySalesChart = null;
let categoryPieChart = null;
let dailyRevenueChart = null;

// ---- Current active filter ----
let currentFilter = "all"; // "today", "week", "month", "all", "custom"

// ---- On Page Load ----
document.addEventListener("DOMContentLoaded", function () {
    displayDate();
    applyFilter("all"); // Load with "All Time" by default
});

// ---- Show today's date ----
function displayDate() {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    document.getElementById("currentDate").textContent = "📅 " + now.toLocaleDateString("en-US", options);
}

// =====================================================
// DATA LOADING HELPERS
// =====================================================

// Get bills from localStorage
function getBills() {
    const data = localStorage.getItem("bills");
    return data ? JSON.parse(data) : [];
}

// Get customers from localStorage
function getCustomers() {
    const data = localStorage.getItem("customers");
    return data ? JSON.parse(data) : [];
}

// Get inventory/products from localStorage
function getInventory() {
    const data = localStorage.getItem("inventory");
    if (data) {
        const arr = JSON.parse(data);
        // Convert to object keyed by name for easy lookup
        const obj = {};
        for (let i = 0; i < arr.length; i++) {
            obj[arr[i].name] = arr[i];
        }
        return obj;
    }
    // Fallback: try legacy "products" key
    const legacy = localStorage.getItem("products");
    return legacy ? JSON.parse(legacy) : {};
}

// =====================================================
// DATE FILTERING
// =====================================================

// Check if a bill date falls within the filter range
function isBillInRange(bill, filter) {
    // Get bill date as a Date object
    let billDate = null;

    if (bill.dateTime) {
        // Try parsing dateTime like "31/01/2025, 14:30:00"
        const parts = bill.dateTime.split(",")[0].trim().split("/");
        if (parts.length === 3) {
            billDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    }
    if (!billDate && bill.date) {
        // Try parsing date like "31 Jan 2025"
        billDate = new Date(bill.date);
    }
    if (!billDate || isNaN(billDate.getTime())) {
        return true; // Include if we can't parse (safety)
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === "today") {
        // Bill must be from today
        return billDate.getTime() === todayStart.getTime();
    }

    if (filter === "week") {
        // Find the start of the current week (Monday)
        const dayOfWeek = todayStart.getDay(); // 0=Sun, 1=Mon...
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(todayStart);
        weekStart.setDate(todayStart.getDate() + mondayOffset);
        return billDate >= weekStart;
    }

    if (filter === "month") {
        // Same month and year
        return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
    }

    if (filter === "custom") {
        const fromVal = document.getElementById("dateFrom").value;
        const toVal = document.getElementById("dateTo").value;
        if (fromVal) {
            const fromDate = new Date(fromVal + "T00:00:00");
            if (billDate < fromDate) return false;
        }
        if (toVal) {
            const toDate = new Date(toVal + "T23:59:59");
            if (billDate > toDate) return false;
        }
        return true;
    }

    // "all" — include everything
    return true;
}

// =====================================================
// MAIN RENDER FUNCTION
// =====================================================

function applyFilter(filter) {
    currentFilter = filter;

    // Update active button styles
    const buttons = document.querySelectorAll(".filter-btn");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
        if (buttons[i].getAttribute("data-filter") === filter) {
            buttons[i].classList.add("active");
        }
    }

    // Clear custom date fields if switching from custom to preset
    if (filter !== "custom") {
        document.getElementById("dateFrom").value = "";
        document.getElementById("dateTo").value = "";
    }

    // Get all bills and filter
    const allBills = getBills();
    const filteredBills = [];
    for (let i = 0; i < allBills.length; i++) {
        if (isBillInRange(allBills[i], filter)) {
            filteredBills.push(allBills[i]);
        }
    }

    // Compute & display all sections
    updateStatCards(filteredBills);
    updateCharts(filteredBills);
    updateTopProducts(filteredBills);
    updateTopCustomers(filteredBills);
    updateLowStock();
}

// Called when custom date range changes
function applyCustomFilter() {
    applyFilter("custom");
}

// =====================================================
// STAT CARDS
// =====================================================

function updateStatCards(bills) {
    let totalRevenue = 0;
    let totalQty = 0;
    const customerSet = new Set();

    for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        totalRevenue += b.total || 0;
        totalQty += b.qty || 0;
        if (b.customer) {
            customerSet.add(b.customer.toLowerCase().trim());
        }
    }

    const totalBills = bills.length;
    const totalCustomers = customerSet.size;
    const avgBill = totalBills > 0 ? totalRevenue / totalBills : 0;
    const estimatedProfit = totalRevenue * 0.10; // Assume 10% profit margin

    document.getElementById("statRevenue").textContent = "₹" + totalRevenue.toFixed(2);
    document.getElementById("statProfit").textContent = "₹" + estimatedProfit.toFixed(2);
    document.getElementById("statBills").textContent = totalBills;
    document.getElementById("statCustomers").textContent = totalCustomers;
    document.getElementById("statProductsSold").textContent = totalQty;
    document.getElementById("statAvgBill").textContent = "₹" + avgBill.toFixed(2);
}

// =====================================================
// CHARTS (Chart.js)
// =====================================================

function updateCharts(bills) {
    drawMonthlySales(bills);
    drawCategoryPie(bills);
    drawDailyRevenue(bills);
}

// --- Monthly Sales Line Chart ---
function drawMonthlySales(bills) {
    const ctx = document.getElementById("monthlySalesChart").getContext("2d");

    // Destroy previous instance if exists
    if (monthlySalesChart) {
        monthlySalesChart.destroy();
    }

    // Aggregate sales by month
    const monthMap = {};
    for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        let monthKey = null;

        if (b.dateTime) {
            const parts = b.dateTime.split(",")[0].trim().split("/");
            if (parts.length === 3) {
                monthKey = parts[1] + "/" + parts[2]; // "MM/YYYY"
            }
        }
        if (!monthKey && b.date) {
            const d = new Date(b.date);
            if (!isNaN(d.getTime())) {
                monthKey = (d.getMonth() + 1).toString().padStart(2, "0") + "/" + d.getFullYear();
            }
        }
        if (monthKey) {
            if (!monthMap[monthKey]) monthMap[monthKey] = 0;
            monthMap[monthKey] += b.total || 0;
        }
    }

    // Sort months chronologically
    const sortedMonths = Object.keys(monthMap).sort();
    const labels = sortedMonths;
    const data = sortedMonths.map(m => monthMap[m]);

    monthlySalesChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Sales (₹)",
                data: data,
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#f59e0b",
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            return "₹" + ctx.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    ticks: { color: "#94a3b8", callback: function (v) { return "₹" + v; } },
                    grid: { color: "rgba(255,255,255,0.05)" }
                }
            }
        }
    });
}

// --- Category Pie Chart ---
function drawCategoryPie(bills) {
    const ctx = document.getElementById("categoryPieChart").getContext("2d");

    if (categoryPieChart) {
        categoryPieChart.destroy();
    }

    // Aggregate qty sold by product item name
    const itemQtyMap = {};
    for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        const item = b.item || "Unknown";
        const qty = b.qty || 0;
        if (!itemQtyMap[item]) itemQtyMap[item] = 0;
        itemQtyMap[item] += qty;
    }

    // Map items to categories using inventory data
    const inventory = getInventory();
    const categoryMap = {};
    for (let item in itemQtyMap) {
        let category = "Other";
        if (inventory[item] && inventory[item].category) {
            category = inventory[item].category;
        } else {
            // Guess category from legacy products
            const legacy = localStorage.getItem("products");
            if (legacy) {
                const prod = JSON.parse(legacy);
                if (prod[item] && prod[item].category) {
                    category = prod[item].category;
                }
            }
        }
        if (!categoryMap[category]) categoryMap[category] = 0;
        categoryMap[category] += itemQtyMap[item];
    }

    const labels = Object.keys(categoryMap);
    const data = labels.map(l => categoryMap[l]);
    const colors = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

    categoryPieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: "#1e293b",
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right",
                    labels: { color: "#94a3b8", font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.parsed / total) * 100).toFixed(1);
                            return ctx.label + ": " + ctx.parsed + " units (" + pct + "%)";
                        }
                    }
                }
            }
        }
    });
}

// --- Daily Revenue Bar Chart ---
function drawDailyRevenue(bills) {
    const ctx = document.getElementById("dailyRevenueChart").getContext("2d");

    if (dailyRevenueChart) {
        dailyRevenueChart.destroy();
    }

    // Aggregate revenue by day
    const dayMap = {};
    for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        let dayKey = null;

        if (b.dateTime) {
            const parts = b.dateTime.split(",")[0].trim().split("/");
            if (parts.length === 3) {
                dayKey = parts[0] + "/" + parts[1] + "/" + parts[2]; // "DD/MM/YYYY"
            }
        }
        if (!dayKey && b.date) {
            dayKey = b.date;
        }
        if (dayKey) {
            if (!dayMap[dayKey]) dayMap[dayKey] = 0;
            dayMap[dayKey] += b.total || 0;
        }
    }

    // Sort days chronologically
    const sortedDays = Object.keys(dayMap).sort(function (a, b) {
        // Parse DD/MM/YYYY
        const pa = a.split("/");
        const pb = b.split("/");
        if (pa.length === 3 && pb.length === 3) {
            const da = new Date(pa[2], pa[1] - 1, pa[0]);
            const db = new Date(pb[2], pb[1] - 1, pb[0]);
            return da - db;
        }
        return 0;
    });

    // Show last 14 days if too many
    const showDays = sortedDays.length > 14 ? sortedDays.slice(-14) : sortedDays;
    const labels = showDays;
    const data = showDays.map(d => dayMap[d]);

    dailyRevenueChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Revenue (₹)",
                data: data,
                backgroundColor: "rgba(245, 158, 11, 0.6)",
                borderColor: "#f59e0b",
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            return "₹" + ctx.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#94a3b8", font: { size: 10 } },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    ticks: { color: "#94a3b8", callback: function (v) { return "₹" + v; } },
                    grid: { color: "rgba(255,255,255,0.05)" }
                }
            }
        }
    });
}

// =====================================================
// TOP 5 PRODUCTS
// =====================================================

function updateTopProducts(bills) {
    const container = document.getElementById("topProductsList");

    // Aggregate quantity sold per product item
    const productMap = {};
    for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        const item = b.item || "Unknown";
        const qty = b.qty || 0;
        const total = b.total || 0;
        if (!productMap[item]) {
            productMap[item] = { qty: 0, revenue: 0 };
        }
        productMap[item].qty += qty;
        productMap[item].revenue += total;
    }

    // Convert to array and sort by qty descending
    const sorted = Object.keys(productMap).map(function (name) {
        return { name: name, qty: productMap[name].qty, revenue: productMap[name].revenue };
    });
    sorted.sort(function (a, b) { return b.qty - a.qty; });

    // Take top 5
    const top5 = sorted.slice(0, 5);

    if (top5.length === 0) {
        container.innerHTML = '<p class="no-data">No products sold yet</p>';
        return;
    }

    let html = "";
    for (let i = 0; i < top5.length; i++) {
        const p = top5[i];
        const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
        html += `
            <div class="list-item">
                <span>
                    <span class="item-rank">${medals[i] || (i + 1)}</span>
                    <span class="item-name">${p.name}</span>
                </span>
                <span>
                    <span class="item-qty">${p.qty} units</span>
                    &nbsp;|&nbsp;
                    <span class="item-amount">₹${p.revenue.toFixed(2)}</span>
                </span>
            </div>
        `;
    }
    container.innerHTML = html;
}

// =====================================================
// TOP 5 CUSTOMERS
// =====================================================

function updateTopCustomers(bills) {
    const container = document.getElementById("topCustomersList");

    // Aggregate customer spending
    const customerMap = {};
    for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        const name = b.customer || "Walk-in";
        const total = b.total || 0;
        if (!customerMap[name]) {
            customerMap[name] = { orders: 0, spent: 0 };
        }
        customerMap[name].orders += 1;
        customerMap[name].spent += total;
    }

    // Sort by spent descending
    const sorted = Object.keys(customerMap).map(function (name) {
        return { name: name, orders: customerMap[name].orders, spent: customerMap[name].spent };
    });
    sorted.sort(function (a, b) { return b.spent - a.spent; });

    const top5 = sorted.slice(0, 5);

    if (top5.length === 0) {
        container.innerHTML = '<p class="no-data">No customer data available</p>';
        return;
    }

    let html = "";
    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    for (let i = 0; i < top5.length; i++) {
        const c = top5[i];
        html += `
            <div class="list-item">
                <span>
                    <span class="item-rank">${medals[i] || (i + 1)}</span>
                    <span class="item-name">${c.name}</span>
                    <span style="color:#64748b;font-size:12px;">(${c.orders} orders)</span>
                </span>
                <span class="item-amount">₹${c.spent.toFixed(2)}</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

// =====================================================
// LOW STOCK
// =====================================================

function updateLowStock() {
    const container = document.getElementById("lowStockList");
    const inventory = getInventory();
    const threshold = 5;

    const lowItems = [];
    for (let name in inventory) {
        const stock = inventory[name].stock || 0;
        if (stock <= threshold) {
            lowItems.push({ name: name, stock: stock });
        }
    }

    // Also check legacy products if inventory is empty
    if (lowItems.length === 0) {
        const legacy = localStorage.getItem("products");
        if (legacy) {
            const prod = JSON.parse(legacy);
            for (let name in prod) {
                const stock = prod[name].stock || 0;
                if (stock <= threshold) {
                    lowItems.push({ name: name, stock: stock });
                }
            }
        }
    }

    // Sort by stock ascending
    lowItems.sort(function (a, b) { return a.stock - b.stock; });

    if (lowItems.length === 0) {
        container.innerHTML = '<p class="no-data">✅ All items well stocked!</p>';
        return;
    }

    let html = "";
    for (let i = 0; i < lowItems.length; i++) {
        html += `
            <div class="alert-item">
                <span class="a-name">🛍️ ${lowItems[i].name}</span>
                <span class="a-stock">Stock: ${lowItems[i].stock}</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

// =====================================================
// EXPORT: PDF
// =====================================================

function exportPDF() {
    const element = document.getElementById("reportContent");
    const filename = "V-Mart-Analytics-Report.pdf";

    // Show a brief loading indicator
    const btn = document.querySelector(".btn-secondary i.fa-file-pdf");
    if (btn) btn.parentElement.textContent = "⏳ Generating...";

    const opt = {
        margin:       10,
        filename:     filename,
        image:        { type: "jpeg", quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: "#0f172a" },
        jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save().then(function () {
        // Restore button text
        if (btn) {
            btn.parentElement.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
        }
        alert("✅ PDF report downloaded!");
    }).catch(function (err) {
        console.error("PDF error:", err);
        alert("⚠️ PDF generation failed. Check console.");
        if (btn) {
            btn.parentElement.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
        }
    });
}

// =====================================================
// EXPORT: CSV
// =====================================================

function exportCSV() {
    const bills = getBills();

    if (bills.length === 0) {
        alert("No data to export! Generate some bills first.");
        return;
    }

    // Build CSV content
    let csv = "BillNo,Customer,Phone,Date,Item,Qty,Price,Amount,SGST,CGST,Total,Payment,Status\n";

    for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        const row = [
            b.invoiceNo || "",
            b.customer || "",
            b.phone || "",
            b.date || "",
            b.item || "",
            b.qty || 0,
            b.price || 0,
            b.amount || 0,
            (b.sgst || 0).toFixed(2),
            (b.cgst || 0).toFixed(2),
            (b.total || 0).toFixed(2),
            b.paymentMethod || "Cash",
            b.status || "Completed"
        ];
        // Escape fields with commas
        const escapedRow = row.map(function (val) {
            const str = String(val);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        });
        csv += escapedRow.join(",") + "\n";
    }

    // Also add summary section
    csv += "\n\n--- SUMMARY ---\n";
    let totalRev = 0, totalQty = 0;
    for (let i = 0; i < bills.length; i++) {
        totalRev += bills[i].total || 0;
        totalQty += bills[i].qty || 0;
    }
    csv += "Total Bills," + bills.length + "\n";
    csv += "Total Revenue,₹" + totalRev.toFixed(2) + "\n";
    csv += "Est. Profit (10%),₹" + (totalRev * 0.10).toFixed(2) + "\n";
    csv += "Total Products Sold," + totalQty + "\n";
    csv += "Avg Bill Value,₹" + (bills.length > 0 ? (totalRev / bills.length).toFixed(2) : "0.00") + "\n";

    // Create download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "V-Mart-Analytics-Report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("✅ CSV report downloaded!");
}


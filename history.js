/* =====================================================
   BILL HISTORY SCRIPT — V-Mart Bill History Page
   Reads bills from localStorage("bills") saved by script.js
   Features: Search, Filter by Date, Sort, View, Print, Delete
   ===================================================== */

// ---- Key: localStorage key for bills ----
const BILLS_KEY = "bills";

// ---- On Page Load ----
document.addEventListener("DOMContentLoaded", function () {
    displayDate();
    renderTable();
});

// ---- Show today's date ----
function displayDate() {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    document.getElementById("currentDate").textContent = "📅 " + now.toLocaleDateString("en-US", options);
}

// ---- Get all bills from localStorage ----
function getBills() {
    const data = localStorage.getItem(BILLS_KEY);
    return data ? JSON.parse(data) : [];
}

// ---- Save all bills to localStorage ----
function saveBills(bills) {
    localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
}

// ---- Format date for display (if full dateTime exists, use it; otherwise use date) ----
function formatDateTime(bill) {
    if (bill.dateTime) {
        return bill.dateTime;
    }
    // Fallback: if only date exists, add a default time
    if (bill.date) {
        return bill.date + " 12:00:00";
    }
    return "N/A";
}

// ---- Get number of items display ----
function getItemCount(bill) {
    if (bill.numItems) {
        return bill.numItems + " item(s)";
    }
    // If we have item name and qty, show that
    if (bill.item && bill.qty) {
        return bill.qty + " x " + bill.item;
    }
    return "1 item";
}

// ---- Render the bills table with search, date filter, sort ----
function renderTable() {
    const bills = getBills();
    const tbody = document.getElementById("billsTableBody");
    const noMsg = document.getElementById("noBillsMsg");
    const billCount = document.getElementById("billCount");

    // Update total count
    billCount.textContent = bills.length + " bill(s)";

    // If no bills at all, show empty message
    if (bills.length === 0) {
        tbody.innerHTML = "";
        noMsg.style.display = "block";
        billCount.textContent = "0 bills";
        return;
    }

    // --- STEP 1: Filter by search term ---
    const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
    let filtered = [];
    for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        const billId = String(b.invoiceNo || "");
        const customer = (b.customer || "").toLowerCase();
        const term = searchTerm;

        if (term === "" || billId.includes(term) || customer.includes(term)) {
            filtered.push(b);
        }
    }

    // --- STEP 2: Filter by date range ---
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;

    if (dateFrom || dateTo) {
        let dateFiltered = [];
        for (let i = 0; i < filtered.length; i++) {
            const b = filtered[i];
            // Get bill date in YYYY-MM-DD format for comparison
            const billDate = getBillDateForCompare(b);
            
            let pass = true;
            if (dateFrom && billDate < dateFrom) {
                pass = false;
            }
            if (dateTo && billDate > dateTo) {
                pass = false;
            }
            if (pass) {
                dateFiltered.push(b);
            }
        }
        filtered = dateFiltered;
    }

    // --- STEP 3: Sort ---
    const sortOrder = document.getElementById("sortOrder").value;
    // Sort by dateTime (or date if no dateTime) — most bills have dateTime now
    filtered.sort(function (a, b) {
        // Get comparable timestamps
        const dateA = getBillTimestamp(a);
        const dateB = getBillTimestamp(b);

        if (sortOrder === "latest") {
            return dateB - dateA;  // Newest first
        } else {
            return dateA - dateB;  // Oldest first
        }
    });

    // If no results after filtering, show message
    if (filtered.length === 0) {
        tbody.innerHTML = "";
        noMsg.style.display = "block";
        billCount.textContent = "0 bills (filtered)";
        return;
    }
    noMsg.style.display = "none";

    // --- STEP 4: Build table rows ---
    let html = "";
    for (let i = 0; i < filtered.length; i++) {
        const b = filtered[i];
        const billId = b.invoiceNo || "VM-" + (i + 1000);
        const customer = b.customer || "Walk-in Customer";
        const dateTime = formatDateTime(b);
        const items = getItemCount(b);
        const total = b.total || 0;
        const payment = b.paymentMethod || "Cash";
        const status = b.status || "Completed";

        // Status badge class
        let statusClass = "status-completed";
        if (status === "Pending") statusClass = "status-pending";
        if (status === "Cancelled") statusClass = "status-cancelled";

        // Payment icon
        let paymentIcon = "💵";
        if (payment === "Card") paymentIcon = "💳";
        if (payment === "UPI") paymentIcon = "📱";

        // Generate a unique row ID for reference
        const rowId = "bill_row_" + i;

        html += `
            <tr id="${rowId}">
                <td><strong>#${billId}</strong></td>
                <td>${customer}</td>
                <td>${dateTime}</td>
                <td>${items}</td>
                <td><strong>₹${total.toFixed(2)}</strong></td>
                <td>${paymentIcon} ${payment}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn-view" onclick="viewBill('${b.invoiceNo}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-print" onclick="printBill('${b.invoiceNo}')" title="Print Bill">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteBill('${b.invoiceNo}')" title="Delete Bill">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

// ---- Helper: Get bill date in YYYY-MM-DD format for comparison ----
function getBillDateForCompare(bill) {
    if (bill.dateTime) {
        // dateTime is like "31/01/2025, 14:30:00" (en-GB format)
        // Convert to YYYY-MM-DD
        const parts = bill.dateTime.split(",")[0].trim().split("/");
        if (parts.length === 3) {
            return parts[2] + "-" + parts[1] + "-" + parts[0];
        }
    }
    if (bill.date) {
        // date is like "31 Jan 2025"
        const d = new Date(bill.date);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split("T")[0];
        }
    }
    return "2000-01-01"; // fallback
}

// ---- Helper: Get bill timestamp for sorting ----
function getBillTimestamp(bill) {
    if (bill.dateTime) {
        // Try parsing as date
        const d = new Date(bill.dateTime);
        if (!isNaN(d.getTime())) return d.getTime();
        
        // Try en-GB format: "31/01/2025, 14:30:00"
        const parts = bill.dateTime.split(",");
        if (parts.length >= 2) {
            const dateParts = parts[0].trim().split("/");
            const timeParts = parts[1].trim().split(":");
            if (dateParts.length === 3 && timeParts.length >= 2) {
                return new Date(
                    parseInt(dateParts[2]),  // year
                    parseInt(dateParts[1]) - 1, // month (0-indexed)
                    parseInt(dateParts[0]),  // day
                    parseInt(timeParts[0]),  // hours
                    parseInt(timeParts[1])   // minutes
                ).getTime();
            }
        }
        return 0;
    }
    if (bill.date) {
        const d = new Date(bill.date);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    }
    return 0;
}

// ---- Clear all filters ----
function clearFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("dateFrom").value = "";
    document.getElementById("dateTo").value = "";
    document.getElementById("sortOrder").value = "latest";
    renderTable();
}

// ---- Find a bill by invoice number ----
function findBill(invoiceNo) {
    const bills = getBills();
    for (let i = 0; i < bills.length; i++) {
        if (String(bills[i].invoiceNo) === String(invoiceNo)) {
            return bills[i];
        }
    }
    return null;
}

// ---- View Bill Details (opens modal) ----
function viewBill(invoiceNo) {
    const bill = findBill(invoiceNo);
    if (!bill) {
        alert("Bill not found!");
        return;
    }

    const billId = bill.invoiceNo || "N/A";
    const customer = bill.customer || "Walk-in Customer";
    const phone = bill.phone || "N/A";
    const dateTime = formatDateTime(bill);
    const item = bill.item || "N/A";
    const qty = bill.qty || 0;
    const price = bill.price || 0;
    const amount = bill.amount || 0;
    const sgst = bill.sgst || 0;
    const cgst = bill.cgst || 0;
    const total = bill.total || 0;
    const payment = bill.paymentMethod || "Cash";
    const status = bill.status || "Completed";

    // Build modal content
    const modalBody = document.getElementById("modalBody");
    modalBody.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">🧾 Bill ID</span>
            <span class="detail-value">#${billId}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">👤 Customer</span>
            <span class="detail-value">${customer}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">📞 Phone</span>
            <span class="detail-value">${phone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">📅 Date & Time</span>
            <span class="detail-value">${dateTime}</span>
        </div>
        <hr class="detail-divider" />
        <div class="detail-row">
            <span class="detail-label">🛍️ Item</span>
            <span class="detail-value">${item}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">📦 Quantity</span>
            <span class="detail-value">${qty}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">💰 Unit Price</span>
            <span class="detail-value">₹${price.toFixed(2)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">💵 Amount</span>
            <span class="detail-value">₹${amount.toFixed(2)}</span>
        </div>
        <hr class="detail-divider" />
        <div class="detail-row">
            <span class="detail-label">📊 SGST</span>
            <span class="detail-value">₹${sgst.toFixed(2)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">📊 CGST</span>
            <span class="detail-value">₹${cgst.toFixed(2)}</span>
        </div>
        <hr class="detail-divider" />
        <div class="detail-row" style="font-size:16px;">
            <span class="detail-label"><strong>💵 Total Amount</strong></span>
            <span class="detail-value" style="color:#f59e0b;"><strong>₹${total.toFixed(2)}</strong></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">💳 Payment</span>
            <span class="detail-value">${payment}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">✅ Status</span>
            <span class="detail-value"><span class="status-badge status-completed">${status}</span></span>
        </div>
    `;

    // Store the current bill's invoiceNo for printing
    document.getElementById("billModal").setAttribute("data-current-bill", invoiceNo);

    // Show modal
    document.getElementById("billModal").style.display = "flex";
}

// ---- Close the modal ----
function closeModal() {
    document.getElementById("billModal").style.display = "none";
}

// ---- Close modal when clicking outside ----
window.onclick = function (event) {
    const modal = document.getElementById("billModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// ---- Print a bill ----
function printBill(invoiceNo) {
    // If called from the table button (with invoiceNo), open print
    // If called from modal (without invoiceNo), get the current bill
    if (!invoiceNo) {
        invoiceNo = document.getElementById("billModal").getAttribute("data-current-bill");
    }

    const bill = findBill(invoiceNo);
    if (!bill) {
        alert("Bill not found!");
        return;
    }

    const billId = bill.invoiceNo || "N/A";
    const customer = bill.customer || "Walk-in Customer";
    const phone = bill.phone || "N/A";
    const dateTime = formatDateTime(bill);
    const item = bill.item || "N/A";
    const qty = bill.qty || 0;
    const price = bill.price || 0;
    const amount = bill.amount || 0;
    const sgst = bill.sgst || 0;
    const cgst = bill.cgst || 0;
    const total = bill.total || 0;
    const payment = bill.paymentMethod || "Cash";

    // Build a receipt-style print layout
    const printContent = `
        <html>
        <head>
            <title>V-Mart Invoice #${billId}</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; color: #000; }
                h2 { margin-bottom: 5px; }
                hr { border-top: 1px dashed #333; margin: 10px 0; }
                .row { display: flex; justify-content: space-between; padding: 4px 0; }
                .total { font-size: 18px; font-weight: bold; margin-top: 5px; }
                @media print { body { padding: 10px; } }
            </style>
        </head>
        <body>
            <h2>🛍️ V MART</h2>
            <p>Kazon Gate, Burdwan</p>
            <hr />
            <div class="row"><span>Invoice #</span><span>${billId}</span></div>
            <div class="row"><span>Customer</span><span>${customer}</span></div>
            <div class="row"><span>Phone</span><span>${phone}</span></div>
            <div class="row"><span>Date</span><span>${dateTime}</span></div>
            <hr />
            <div class="row"><span>Item</span><span>${item}</span></div>
            <div class="row"><span>Qty</span><span>${qty}</span></div>
            <div class="row"><span>Price</span><span>₹${price.toFixed(2)}</span></div>
            <div class="row"><span>Amount</span><span>₹${amount.toFixed(2)}</span></div>
            <hr />
            <div class="row"><span>SGST</span><span>₹${sgst.toFixed(2)}</span></div>
            <div class="row"><span>CGST</span><span>₹${cgst.toFixed(2)}</span></div>
            <div class="row total"><span>Total</span><span>₹${total.toFixed(2)}</span></div>
            <div class="row"><span>Payment</span><span>${payment}</span></div>
            <hr />
            <p>Thank You For Shopping ❤️</p>
        </body>
        </html>
    `;

    // Open a new window and print
    const printWindow = window.open("", "_blank", "width=500,height=600");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(function () {
        printWindow.print();
    }, 300);
}

// ---- Delete a bill with confirmation ----
function deleteBill(invoiceNo) {
    if (!confirm("🗑️ Are you sure you want to delete Bill #" + invoiceNo + "?")) {
        return;
    }

    let bills = getBills();
    const updated = [];
    for (let i = 0; i < bills.length; i++) {
        if (String(bills[i].invoiceNo) !== String(invoiceNo)) {
            updated.push(bills[i]);
        }
    }

    if (updated.length === bills.length) {
        alert("Bill not found!");
        return;
    }

    saveBills(updated);
    closeModal();
    renderTable();
    alert("🗑️ Bill #" + invoiceNo + " deleted successfully!");
}


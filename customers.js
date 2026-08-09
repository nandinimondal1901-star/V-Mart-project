/* =====================================================
   CUSTOMERS SCRIPT — V-Mart Customer Management
   =====================================================
   HOW IT WORKS:
   - Customers are saved in localStorage("customers") key
   - When a bill is generated (from script.js), the 
     customer data is auto-saved/updated here
   - If same phone number exists, we update their 
     stats instead of duplicating
   - The customers page reads from this same key
   ===================================================== */

// ---- KEY: localStorage key for customers ----
const CUSTOMERS_KEY = "customers";

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

// ---- Get all customers from localStorage ----
function getCustomers() {
    const data = localStorage.getItem(CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
}

// ---- Save all customers to localStorage ----
function saveCustomers(customers) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

// =====================================================
// CUSTOMER AUTO-SAVE FUNCTION (called from script.js)
// =====================================================
// This function is called automatically when a bill is
// generated from the Billing page. It:
// 1. Checks if a customer with the same phone exists
// 2. If YES → updates their orders, total spent, last date
// 3. If NO  → creates a new customer entry
// =====================================================
function saveCustomerFromBill(billData) {
    // billData has: customer, phone, date, total, invoiceNo, item, qty
    let customers = getCustomers();
    
    // Get phone — use as unique identifier
    const phone = (billData.phone || "").trim();
    
    // If no phone number, still save by name (use name as fallback key)
    const customerName = (billData.customer || "Walk-in Customer").trim();
    
    // Try to find existing customer by phone number first, then by name
    let existingIndex = -1;
    for (let i = 0; i < customers.length; i++) {
        // Match by phone (if available) or by name
        if (phone && customers[i].phone === phone) {
            existingIndex = i;
            break;
        } else if (!phone && customers[i].name.toLowerCase() === customerName.toLowerCase()) {
            existingIndex = i;
            break;
        }
    }
    
    // Build purchase record for this bill
    const purchaseRecord = {
        invoiceNo: billData.invoiceNo,
        item: billData.item,
        qty: billData.qty,
        total: billData.total,
        date: billData.date
    };
    
    if (existingIndex >= 0) {
        // ---- UPDATE EXISTING CUSTOMER ----
        const existing = customers[existingIndex];
        
        // Update name if empty or different
        existing.name = customerName;
        
        // Update email if customer provides it (optional field in edit)
        if (billData.email) {
            existing.email = billData.email;
        }
        
        // Increment total orders
        existing.totalOrders = (existing.totalOrders || 0) + 1;
        
        // Add to total spent
        existing.totalSpent = (existing.totalSpent || 0) + (billData.total || 0);
        
        // Update last purchase date (always use the latest bill date)
        existing.lastPurchase = billData.date;
        
        // Add this bill to purchase history
        if (!existing.purchaseHistory) {
            existing.purchaseHistory = [];
        }
        existing.purchaseHistory.push(purchaseRecord);
        
        // Replace in array
        customers[existingIndex] = existing;
        
    } else {
        // ---- CREATE NEW CUSTOMER ----
        const newCustomer = {
            id: "CUST-" + (1000 + Math.floor(Math.random() * 9000)),
            name: customerName,
            phone: phone || "N/A",
            email: billData.email || "—",
            totalOrders: 1,
            totalSpent: billData.total || 0,
            lastPurchase: billData.date,
            createdAt: new Date().toLocaleString("en-GB"),
            purchaseHistory: [purchaseRecord]
        };
        customers.push(newCustomer);
    }
    
    // Save back to localStorage
    saveCustomers(customers);
}

// =====================================================
// RENDER THE CUSTOMERS TABLE
// =====================================================
function renderTable() {
    const customers = getCustomers();
    const tbody = document.getElementById("customersTableBody");
    const noMsg = document.getElementById("noCustomersMsg");
    const countBadge = document.getElementById("customerCount");

    // Update count
    countBadge.textContent = customers.length + " customer(s)";

    // If no customers, show empty message
    if (customers.length === 0) {
        tbody.innerHTML = "";
        noMsg.style.display = "block";
        return;
    }
    noMsg.style.display = "none";

    // --- STEP 1: Filter by search term ---
    const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
    let filtered = [];
    for (let i = 0; i < customers.length; i++) {
        const c = customers[i];
        const name = (c.name || "").toLowerCase();
        const phone = (c.phone || "").toLowerCase();
        if (searchTerm === "" || name.includes(searchTerm) || phone.includes(searchTerm)) {
            filtered.push(c);
        }
    }

    // --- STEP 2: Sort ---
    const sortBy = document.getElementById("sortBy").value;
    filtered.sort(function (a, b) {
        if (sortBy === "name") {
            return (a.name || "").localeCompare(b.name || "");
        } else if (sortBy === "nameDesc") {
            return (b.name || "").localeCompare(a.name || "");
        } else if (sortBy === "totalDesc") {
            return (b.totalSpent || 0) - (a.totalSpent || 0);
        } else if (sortBy === "totalAsc") {
            return (a.totalSpent || 0) - (b.totalSpent || 0);
        } else if (sortBy === "lastPurchase") {
            // Sort by last purchase date (most recent first)
            const dateA = new Date(a.lastPurchase || "2000-01-01");
            const dateB = new Date(b.lastPurchase || "2000-01-01");
            return dateB - dateA;
        }
        return 0;
    });

    // If no results after filtering
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#64748b;padding:20px;">No customers match your search.</td></tr>`;
        return;
    }

    // --- STEP 3: Build table rows ---
    let html = "";
    for (let i = 0; i < filtered.length; i++) {
        const c = filtered[i];
        const serial = i + 1;
        const custId = c.id || "N/A";
        const name = c.name || "Unknown";
        const phone = c.phone || "N/A";
        const email = c.email || "—";
        const orders = c.totalOrders || 0;
        const spent = (c.totalSpent || 0).toFixed(2);
        const lastPurchase = c.lastPurchase || "N/A";

        html += `
            <tr>
                <td>${serial}</td>
                <td><strong>${custId}</strong></td>
                <td><i class="fas fa-user" style="color:#f59e0b;margin-right:4px;"></i>${name}</td>
                <td>${phone}</td>
                <td>${email}</td>
                <td><span class="status-badge" style="background:rgba(59,130,246,0.15);color:#60a5fa;">${orders}</span></td>
                <td><strong>₹${spent}</strong></td>
                <td>${lastPurchase}</td>
                <td>
                    <button class="btn-view" onclick="viewCustomer('${custId}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-edit" onclick="editCustomer('${custId}')" title="Edit">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteCustomer('${custId}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

// =====================================================
// FIND A CUSTOMER BY ID
// =====================================================
function findCustomer(custId) {
    const customers = getCustomers();
    for (let i = 0; i < customers.length; i++) {
        if (customers[i].id === custId) {
            return { customer: customers[i], index: i };
        }
    }
    return null;
}

// =====================================================
// VIEW CUSTOMER PROFILE (Modal)
// =====================================================
function viewCustomer(custId) {
    const result = findCustomer(custId);
    if (!result) {
        alert("Customer not found!");
        return;
    }
    const c = result.customer;

    // Update modal title
    document.getElementById("modalCustomerName").textContent = c.name;

    // Build purchase history HTML
    let historyHtml = "";
    if (c.purchaseHistory && c.purchaseHistory.length > 0) {
        // Show latest 5 purchases
        const recentPurchases = c.purchaseHistory.slice(-5).reverse();
        for (let i = 0; i < recentPurchases.length; i++) {
            const p = recentPurchases[i];
            historyHtml += `
                <div class="purchase-item">
                    <span class="p-item">#${p.invoiceNo} - ${p.item} (x${p.qty})</span>
                    <span class="p-date">${p.date}</span>
                    <span class="p-amount">₹${(p.total || 0).toFixed(2)}</span>
                </div>
            `;
        }
    } else {
        historyHtml = '<p style="color:#64748b;text-align:center;padding:10px;">No purchase history available.</p>';
    }

    // Build modal body
    const modalBody = document.getElementById("modalBody");
    modalBody.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">🆔 Customer ID</span>
            <span class="detail-value">${c.id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">👤 Name</span>
            <span class="detail-value">${c.name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">📞 Phone</span>
            <span class="detail-value">${c.phone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">📧 Email</span>
            <span class="detail-value">${c.email || "—"}</span>
        </div>
        <hr class="detail-divider" />
        <div class="detail-row">
            <span class="detail-label">📦 Total Orders</span>
            <span class="detail-value">${c.totalOrders || 0}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">💰 Total Spent</span>
            <span class="detail-value" style="color:#10b981;font-size:16px;">₹${(c.totalSpent || 0).toFixed(2)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">📅 Last Purchase</span>
            <span class="detail-value">${c.lastPurchase || "N/A"}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">📋 Registered On</span>
            <span class="detail-value">${c.createdAt || "N/A"}</span>
        </div>
        <hr class="detail-divider" />
        <h3 style="color:#fff;font-size:15px;margin-bottom:10px;">
            <i class="fas fa-receipt" style="color:#f59e0b;"></i> Purchase History
        </h3>
        <div class="purchase-history">
            ${historyHtml}
        </div>
    `;

    // Show modal
    document.getElementById("customerModal").style.display = "flex";
}

// =====================================================
// CLOSE MODAL
// =====================================================
function closeModal() {
    document.getElementById("customerModal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById("customerModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
    const editModal = document.getElementById("editModal");
    if (event.target === editModal) {
        editModal.style.display = "none";
    }
};

// =====================================================
// EDIT CUSTOMER
// =====================================================
function editCustomer(custId) {
    const result = findCustomer(custId);
    if (!result) {
        alert("Customer not found!");
        return;
    }
    const c = result.customer;

    // Pre-fill the edit form
    document.getElementById("editName").value = c.name || "";
    document.getElementById("editPhone").value = c.phone || "";
    document.getElementById("editEmail").value = c.email || "";

    // Store the customer ID being edited
    document.getElementById("editModal").setAttribute("data-edit-id", custId);

    // Show the edit modal
    document.getElementById("editModal").style.display = "flex";
}

// =====================================================
// SAVE EDIT CUSTOMER
// =====================================================
function saveEditCustomer() {
    const custId = document.getElementById("editModal").getAttribute("data-edit-id");
    const result = findCustomer(custId);
    if (!result) {
        alert("Customer not found!");
        return;
    }

    const name = document.getElementById("editName").value.trim();
    const phone = document.getElementById("editPhone").value.trim();
    const email = document.getElementById("editEmail").value.trim();

    // Validation
    if (!name) {
        alert("Customer name is required!");
        return;
    }

    // Update customer data
    let customers = getCustomers();
    const index = result.index;
    customers[index].name = name;
    customers[index].phone = phone || "N/A";
    customers[index].email = email || "—";

    // Save back
    saveCustomers(customers);

    // Close edit modal
    closeEditModal();

    // Refresh table
    renderTable();

    alert("✅ Customer updated successfully!");
}

// =====================================================
// CLOSE EDIT MODAL
// =====================================================
function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

// =====================================================
// DELETE CUSTOMER (with confirmation)
// =====================================================
function deleteCustomer(custId) {
    const result = findCustomer(custId);
    if (!result) {
        alert("Customer not found!");
        return;
    }

    const c = result.customer;

    // Ask for confirmation
    if (!confirm("🗑️ Are you sure you want to delete " + c.name + "?\n\nThis will remove all their data permanently.")) {
        return;
    }

    let customers = getCustomers();
    const updated = [];
    for (let i = 0; i < customers.length; i++) {
        if (customers[i].id !== custId) {
            updated.push(customers[i]);
        }
    }

    if (updated.length === customers.length) {
        alert("Customer not found!");
        return;
    }

    saveCustomers(updated);
    closeModal();
    renderTable();
    alert("🗑️ " + c.name + " has been deleted!");
}

// =====================================================
// INTEGRATION HOOK (exported to window for script.js)
// =====================================================
// Make saveCustomerFromBill available globally so script.js
// can call it after every bill is generated
window.saveCustomerFromBill = saveCustomerFromBill;


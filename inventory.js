/* =====================================================
   INVENTORY SCRIPT — V-Mart Inventory Management
   Full CRUD: Add, Edit, Delete, Search Products
   Stores all data in localStorage under "inventory"
   ===================================================== */

// ---- KEY: localStorage key for inventory data ----
const INVENTORY_KEY = "inventory";

// ---- On Page Load ----
document.addEventListener("DOMContentLoaded", function () {
    displayDate();
    renderTable();
});

// ---- Show Today's Date ----
function displayDate() {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    document.getElementById("currentDate").textContent = "📅 " + now.toLocaleDateString("en-US", options);
}

// ---- Get all products from localStorage ----
function getProducts() {
    const data = localStorage.getItem(INVENTORY_KEY);
    if (data) {
        return JSON.parse(data);
    }
    // If no inventory data exists, seed with default products
    const defaults = [
        { id: "prod_1", name: "Shirt",   category: "Men Wear",     price: 700,  stock: 30, gst: 18 },
        { id: "prod_2", name: "Jeans",   category: "Men Wear",     price: 1600, stock: 25, gst: 18 },
        { id: "prod_3", name: "Pant",    category: "Men Wear",     price: 1200, stock: 28, gst: 18 },
        { id: "prod_4", name: "Saree",   category: "Women Wear",   price: 2500, stock: 32, gst: 12 },
        { id: "prod_5", name: "Kurti",   category: "Women Wear",   price: 1400, stock: 26, gst: 12 },
        { id: "prod_6", name: "Shoes",   category: "Footwear",     price: 3000, stock: 24, gst: 18 },
        { id: "prod_7", name: "Sandals", category: "Footwear",     price: 2200, stock: 27, gst: 18 },
        { id: "prod_8", name: "Watch",   category: "Accessories",  price: 2000, stock: 25, gst: 18 }
    ];
    saveProducts(defaults);
    return defaults;
}

// ---- Save all products to localStorage ----
function saveProducts(products) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(products));
    // Also update the old "products" key so Dashboard and Billing still work
    syncToLegacyProducts(products);
}

// ---- Sync inventory data to the legacy "products" format ----
// The billing page (script.js) and dashboard use a different format:
//   { "Shirt": { stock: 30, price: 700, gst: 18, category: "Men Wear" } }
// This function converts our array to that format and saves it.
function syncToLegacyProducts(inventoryArray) {
    const legacy = {};
    for (let i = 0; i < inventoryArray.length; i++) {
        const p = inventoryArray[i];
        legacy[p.name] = {
            stock: p.stock,
            price: p.price,
            gst: p.gst,
            category: p.category
        };
    }
    localStorage.setItem("products", JSON.stringify(legacy));
}

// ---- Generate a unique ID for new products ----
function generateId() {
    return "prod_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

// ---- Save or Update a product ----
function saveProduct() {
    // Get form values
    const name = document.getElementById("prodName").value.trim();
    const category = document.getElementById("prodCategory").value;
    const price = parseFloat(document.getElementById("prodPrice").value);
    const stock = parseInt(document.getElementById("prodStock").value);
    const gst = parseInt(document.getElementById("prodGst").value);
    const editId = document.getElementById("saveProductBtn").getAttribute("data-edit-id");

    // --- Validation ---
    if (!name) {
        alert("⚠️ Please enter a product name.");
        return;
    }
    if (!price || price <= 0) {
        alert("⚠️ Please enter a valid price.");
        return;
    }
    if (isNaN(stock) || stock < 0) {
        alert("⚠️ Please enter a valid stock quantity.");
        return;
    }

    // Get existing products
    let products = getProducts();

    // Check for duplicate name (only if adding new, or if name changed during edit)
    const isDuplicate = products.some(function (p) {
        return p.name.toLowerCase() === name.toLowerCase() && p.id !== editId;
    });
    if (isDuplicate) {
        alert("⚠️ A product with this name already exists!");
        return;
    }

    if (editId) {
        // ---- EDIT MODE: Update existing product ----
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === editId) {
                products[i].name = name;
                products[i].category = category;
                products[i].price = price;
                products[i].stock = stock;
                products[i].gst = gst;
                break;
            }
        }
        alert("✅ Product updated successfully!");
    } else {
        // ---- ADD MODE: Create new product ----
        const newProduct = {
            id: generateId(),
            name: name,
            category: category,
            price: price,
            stock: stock,
            gst: gst
        };
        products.push(newProduct);
        alert("✅ Product added successfully!");
    }

    // Save and refresh
    saveProducts(products);
    renderTable();
    clearForm();

    // ---- System notification for product add/update ----
    if (typeof window.addNotification === "function") {
        if (editId) {
            window.addNotification(
                "system",
                "Product Updated",
                name + " details updated successfully."
            );
        } else {
            window.addNotification(
                "system",
                "Product Added",
                name + " added to inventory with " + stock + " units."
            );
        }
    }
    // -----------------------------------------------------
}

// ---- Edit a product (fill form with existing data) ----
function editProduct(id) {
    const products = getProducts();
    let found = null;
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            found = products[i];
            break;
        }
    }
    if (!found) {
        alert("Product not found!");
        return;
    }

    // Fill the form
    document.getElementById("prodName").value = found.name;
    document.getElementById("prodCategory").value = found.category;
    document.getElementById("prodPrice").value = found.price;
    document.getElementById("prodStock").value = found.stock;
    document.getElementById("prodGst").value = found.gst;

    // Change button to "Update" mode
    document.getElementById("formTitle").textContent = "Edit Product";
    document.getElementById("saveProductBtn").innerHTML = '<i class="fas fa-pen"></i> Update Product';
    document.getElementById("saveProductBtn").setAttribute("data-edit-id", id);
    document.getElementById("cancelEditBtn").style.display = "inline-block";

    // Scroll to form
    document.querySelector(".form-card").scrollIntoView({ behavior: "smooth" });
}

// ---- Cancel editing ----
function cancelEdit() {
    clearForm();
    document.getElementById("formTitle").textContent = "Add New Product";
    document.getElementById("saveProductBtn").innerHTML = '<i class="fas fa-save"></i> Save Product';
    document.getElementById("saveProductBtn").removeAttribute("data-edit-id");
    document.getElementById("cancelEditBtn").style.display = "none";
}

// ---- Clear the form ----
function clearForm() {
    document.getElementById("prodName").value = "";
    document.getElementById("prodCategory").value = "Men Wear";
    document.getElementById("prodPrice").value = "";
    document.getElementById("prodStock").value = "";
    document.getElementById("prodGst").value = "18";
}

// ---- Delete a product ----
function deleteProduct(id) {
    if (!confirm("🗑️ Are you sure you want to delete this product?")) {
        return;
    }

    let products = getProducts();

    // Find the product name before deleting (for notification)
    let deletedName = "";
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            deletedName = products[i].name;
            break;
        }
    }

    const updated = [];
    for (let i = 0; i < products.length; i++) {
        if (products[i].id !== id) {
            updated.push(products[i]);
        }
    }
    saveProducts(updated);
    renderTable();

    // If we were editing this product, cancel edit
    const editId = document.getElementById("saveProductBtn").getAttribute("data-edit-id");
    if (editId === id) {
        cancelEdit();
    }

    alert("🗑️ Product deleted successfully!");

    // ---- System notification for product deletion ----
    if (typeof window.addNotification === "function") {
        window.addNotification(
            "system",
            "Product Deleted",
            (deletedName || "Product") + " removed from inventory."
        );
    }
    // ---------------------------------------------------
}

// ---- Render the product table (with search filter) ----
function renderTable() {
    const products = getProducts();
    const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
    const tbody = document.getElementById("productTableBody");
    const noMsg = document.getElementById("noProductsMsg");

    // Filter by search term
    let filtered = [];
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const matchName = p.name.toLowerCase().includes(searchTerm);
        const matchCat = p.category.toLowerCase().includes(searchTerm);
        if (searchTerm === "" || matchName || matchCat) {
            filtered.push(p);
        }
    }

    // Show/hide "no products" message
    if (filtered.length === 0) {
        tbody.innerHTML = "";
        noMsg.style.display = "block";
        return;
    }
    noMsg.style.display = "none";

    // Build table rows
    let html = "";
    for (let i = 0; i < filtered.length; i++) {
        const p = filtered[i];
        const isLowStock = p.stock <= 5;
        const stockClass = isLowStock ? "stock-low" : "stock-ok";
        const statusBadge = isLowStock
            ? '<span class="status-badge status-low">🔴 Low Stock</span>'
            : '<span class="status-badge status-good">✅ In Stock</span>';

        html += `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>₹${p.price.toFixed(2)}</td>
                <td class="${stockClass}">${p.stock}</td>
                <td>${p.gst}%</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-edit" onclick="editProduct('${p.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteProduct('${p.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}


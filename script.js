// // let stock = 10;
// // let price = 700;

// // updateStockDisplay();

// // function updateStockDisplay() {
// //     document.getElementById("stock").innerText = stock;
// //     document.getElementById("stockValue").innerText = stock * price;
// // }

// // function buy() {
// //     let qty = parseInt(document.getElementById("qty").value);

// //     if (!qty || qty <= 0) {
// //         alert("Enter valid quantity");
// //         return;
// //     }

// //     if (qty > stock) {
// //         alert("Not enough stock!");
// //         return;
// //     }

// //     // calculation
// //     let amount = qty * price;
// //     let sgst = amount * 0.09;
// //     let cgst = amount * 0.09;
// //     let total = amount + sgst + cgst;

//     // stock update
// //     stock -= qty;
// //     updateStockDisplay();

// //     // bill generate
// //     let bill = `
// //         <h3>Bill Generated ✅</h3>
// //         <p><b>Item:</b> Shirt</p>
// //         <p><b>Quantity:</b> ${qty}</p>
// //         <p><b>Amount:</b> ₹${amount}</p>

// // //       <h3>Total Paid: ₹${total.toFixed(2)}</h3>
// // //       <hr>
// // //       <p><b>Remaining Stock:</b> ${stock}</p>
// // //       <p><b>Remaining Stock Value:</b> ₹${stock * price}</p>
// //    `;

// //     document.getElementById("invoice").innerHTML = bill;
// // // }

// let products = JSON.parse(localStorage.getItem("products")) || {
//     Shirt: {
//         stock: 10,
//         price: 700,
//         gst: 18,
//         category: "Men Wear"
//     },

//     Pant: {
//         stock: 10,
//         price: 1200,
//         gst: 18,
//         category: "Men Wear"
//     },

//     Saree: {
//         stock: 8,
//         price: 2500,
//         gst: 12,
//         category: "Women Wear"
//     },

//     Shoes: {
//         stock: 4,
//         price: 3000,
//         gst: 18,
//         category: "Footwear"
//     },

//     Watch: {
//         stock: 5,
//         price: 2000,
//         gst: 18
//     }

// };

// function saveData() {
//     localStorage.setItem("products", JSON.stringify(products));
// }

// function showStock() {
//     let html = "";
//     for (let item in products) {
//         html += `<p>${item} → Stock: ${products[item].stock} | ₹${products[item].stock * products[item].price}</p>`;
//     }
//     document.getElementById("stockList").innerHTML = html;
// }

// showStock();

// function loadProducts() {

//     let select = document.getElementById("item");

//     select.innerHTML = "";

//     for(let item in products){

//         select.innerHTML += `
//         <option value="${item}">
//             ${item}
//         </option>
//         `;
//     }
// }

// loadProducts();

// function buy() {
//     let name = document.getElementById("customer").value;
//     let item = document.getElementById("item").value;
//     let qty = parseInt(document.getElementById("qty").value);

//     if (!name || !qty) {
//         alert("Fill all details");
//         return;
//     }

//     if (products[item].stock < qty) {
//         alert("Not enough stock!");
//         return;
//     }

//     // let price = products[item].price;

//     // let amount = qty * price;
//     // let sgst = amount * 0.09;
//     // let cgst = amount * 0.09;
//     let gstRate = products[item].gst;

//     let sgst = amount * (gstRate / 2) / 100;
//     let cgst = amount * (gstRate / 2) / 100;
//     let total = amount + sgst + cgst;

//     let invoiceNo = Math.floor(Math.random() * 100000);
//     let phone = document.getElementById("phone").value;

//     products[item].stock -= qty;
//     saveData();
//     showStock();

//     let date = new Date().toLocaleString();

//     console.log("Buy function running");
//     console.log(invoiceHTML);

//     let invoiceHTML = `
//         <h2>V Mart</h2>
//         <p>Kazon Gate, Burdwan</p>
//         <hr>
//         <p><b>Customer:</b> ${name}</p>
//         <p><b>Date:</b> ${date}</p>
//         <p><b>Invoice No:</b> ${invoiceNo}</p>
//         <p><b>Phone:</b> ${phone}</p>

//         <table border="1" width="100%" cellspacing="0" cellpadding="5">
//             <tr>
//                 <th>Item</th>
//                 <th>Qty</th>
//                 <th>Price</th>
//                 <th>Amount</th>
//             </tr>
//             <tr>
//                 <td>${item}</td>
//                 <td>${qty}</td>
//                 <td>${price}</td>
//                 <td>${amount}</td>
//             </tr>
//         </table>

//         <p>SGST: ₹${sgst.toFixed(2)}</p>
//         <p>CGST: ₹${cgst.toFixed(2)}</p>

//         <h3>Total: ₹${total.toFixed(2)}</h3>

//         <hr>
//         <p>Remaining Stock: ${products[item].stock}</p>
//     `;

//     document.getElementById("invoice").innerHTML = invoiceHTML;
// }

// function downloadPDF() {
//     // let invoice = document.getElementById("invoice");

//     // html2canvas(invoice).then(canvas => {
//     //     let imgData = canvas.toDataURL("image/png");

//     //     const { jsPDF } = window.jspdf;
//     //     let pdf = new jsPDF('p', 'mm', 'a4');

//     //     let imgWidth = 190;
//     //     let pageHeight = 297;
//     //     let imgHeight = canvas.height * imgWidth / canvas.width;

//     //     let position = 10;

//     //     pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
//     //     pdf.save("V-Mart-Invoice.pdf");
//     // });
//     let invoice = document.getElementById("invoice");

//     if (!invoice || invoice.innerHTML.trim() === "") {
//         alert("Please generate bill first!");
//         return;
//     }

//     html2canvas(invoice, {
//         scale: 2,
//         useCORS: true,
//         backgroundColor: "#ffffff"
//     }).then(canvas => {

//         let imgData = canvas.toDataURL("image/png");

//         const { jsPDF } = window.jspdf;
//         let pdf = new jsPDF("p", "mm", "a4");

//         let imgWidth = 190;
//         let pageHeight = 297;

//         let imgHeight = canvas.height * imgWidth / canvas.width;

//         let position = 10;

//         pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);

//         pdf.save("V-Mart-Invoice.pdf");
//     });

// }

// ---- 🌟 INVENTORY INTEGRATION ----
// Products now come from the Inventory module (inventory.js)
// which saves data under "inventory" localStorage key.
// This function converts inventory array to the legacy format.
function loadProductsFromInventory() {
    const invData = localStorage.getItem("inventory");
    if (invData) {
        const invArray = JSON.parse(invData);
        const legacy = {};
        for (let i = 0; i < invArray.length; i++) {
            const p = invArray[i];
            legacy[p.name] = {
                stock: p.stock,
                price: p.price,
                gst: p.gst,
                category: p.category
            };
        }
        products = legacy;
    } else {
        // Fallback defaults if no inventory data exists
        products = {
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
}

// After stock changes, sync back to inventory array format
function syncToInventory() {
    const invData = localStorage.getItem("inventory");
    if (!invData) return;
    let invArray = JSON.parse(invData);
    for (let i = 0; i < invArray.length; i++) {
        const name = invArray[i].name;
        if (products[name]) {
            invArray[i].stock = products[name].stock;
        }
    }
    localStorage.setItem("inventory", JSON.stringify(invArray));
}

// Initialize the products object from inventory
let products = {};
loadProductsFromInventory();

// ---- Bill History (for Dashboard) ----
function getBills() {
    const data = localStorage.getItem("bills");
    return data ? JSON.parse(data) : [];
}
function saveBillRecord(billData) {
    const bills = getBills();
    bills.push(billData);
    localStorage.setItem("bills", JSON.stringify(bills));
}
// ------------------------------------

function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    // Also sync stock changes back to inventory
    syncToInventory();
}

function showStock() {
    // Show category-wise stock + low stock warning
    const lowStockThreshold = 5;

    const groups = {};

    for (let item in products) {
        const p = products[item];
        const cat = p.category || "Other";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push({
            name: item,
            stock: p.stock,
            price: p.price,
            gst: p.gst,
            low: p.stock <= lowStockThreshold
        });
    }

    let html = "";

    for (let cat in groups) {
        html += `<div class="stock-category"><h4 style="margin:10px 0 5px;">${cat}</h4>`;

        for (let i = 0; i < groups[cat].length; i++) {
            const it = groups[cat][i];
            const warn = it.low ? " 🔴 Low stock" : "";

            html += `<p>🛍️ <b>${it.name}</b> → Stock: ${it.stock}${warn} | Value: ₹${(it.stock * it.price).toFixed(2)}</p>`;
        }

        html += `</div>`;
    }

    document.getElementById("stockList").innerHTML = html;
}


function fillSelectOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = "";
    for (let item in products) {
        select.innerHTML += `<option value="${item}">${item}</option>`;
    }
}

function loadProducts() {
    // Main bill dropdown
    fillSelectOptions("item");

    // Admin return sections dropdowns
    fillSelectOptions("adminItem");
    fillSelectOptions("returnItem");
}


// Initial UI updates on page load
showStock();
loadProducts();


function buy() {
    let name = document.getElementById("customer").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let item = document.getElementById("item").value;
    let qty = parseInt(document.getElementById("qty").value);

    if (!name || !qty || isNaN(qty)) {
        alert("Please fill all necessary customer & quantity details!");
        return;
    }

    if (products[item].stock < qty) {
        alert("Not enough stock!");
        return;
    }

    // Fixed Bug: Injected proper prices from Object definitions
    let price = products[item].price;
    let amount = qty * price;
    let gstRate = products[item].gst || 18; // Defaulting to 18 if not defined like watch

    let sgst = amount * (gstRate / 2) / 100;
    let cgst = amount * (gstRate / 2) / 100;
    let total = amount + sgst + cgst;

    let invoiceNo = Math.floor(1000 + Math.random() * 9000); // 4 digit invoice counter
    let date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Stock deduction & sync
    products[item].stock -= qty;
    saveData();
    showStock();

    // Receipt-style visual structure format (Mono space align)
let invoiceHTML = `
<pre style="font-family: 'Georgia','Times New Roman',serif; font-size: 13.5px; margin: 0; padding: 10px; color: #000; line-height: 1.4; text-align:center;">
======================================
                V MART
           Karzon Gate, Burdwan
======================================
                

Invoice No: ${invoiceNo}
Customer: ${name}
Phone: ${phone || 'N/A'}
Date: ${date}

----------------------------------
Item     Qty   Price    Total
----------------------------------
${item.padEnd(9)} ${qty.toString().padEnd(5)} ${price.toString().padEnd(8)} ₹${amount}
----------------------------------

SGST (${(gstRate/2)}%): ₹${sgst.toFixed(2)}
CGST (${(gstRate/2)}%): ₹${cgst.toFixed(2)}

GRAND TOTAL: ₹${total.toFixed(2)}

Thank You For Shopping ❤️
==================================
</pre>
    `;

    console.log("Buy function running successfully!");
    
    // Target display execution
    let invoiceBox = document.getElementById("invoice");
    invoiceBox.innerHTML = invoiceHTML;
    invoiceBox.style.display = "block"; // Active container view

// Save bill record for Dashboard & Bill History
    saveBillRecord({
        invoiceNo: invoiceNo,
        customer: name,
        phone: phone,
        date: date,
        dateTime: new Date().toLocaleString('en-GB'),  // Full date & time for Bill History
        item: item,
        qty: qty,
        numItems: 1,  // Number of unique items in this bill
        price: price,
        amount: amount,
        sgst: sgst,
        cgst: cgst,
        total: total,
        paymentMethod: "Cash",  // Default payment method (can be extended)
        status: "Completed"
    });

// ---- Auto-save Customer for Customer Management module ----
    // Calls the function from customers.js (if loaded)
    if (typeof window.saveCustomerFromBill === "function") {
        window.saveCustomerFromBill({
            customer: name,
            phone: phone,
            date: date,
            total: total,
            invoiceNo: invoiceNo,
            item: item,
            qty: qty
        });
    }
    // ---------------------------------------------------------

    // ---- New Bill Notification ----
    // Show a notification whenever a new bill is generated.
    if (typeof window.addNotification === "function") {
        window.addNotification(
            "newbill",
            "New Bill Generated",
            "Bill " + invoiceNo + " for " + name + " — ₹" + total.toFixed(2)
        );

        // Check if the sold item is now low/out of stock
        const newStock = products[item].stock;
        if (newStock <= 0) {
            window.addNotification(
                "outofstock",
                "Out of Stock",
                item + " is now out of stock."
            );
        } else if (newStock <= 5) {
            window.addNotification(
                "lowstock",
                "Low Stock Alert",
                item + " has only " + newStock + " units left."
            );
        }
    }
    // ---------------------------------------------------------
}

// ------- Admin: Stock update (Add stock / Set stock) -------
// mode: "add" increases existing stock, "set" replaces stock with given value
function adminUpdateStock(mode) {
    const item = document.getElementById('adminItem')?.value;
    const addQty = parseInt(document.getElementById('adminQty')?.value);

    if (!item || !Number.isFinite(addQty) || addQty <= 0) {
        alert('Enter valid item and quantity');
        return;
    }

    if (!products[item]) {
        alert('Item not found in stock list');
        return;
    }

    if (mode === 'set') {
        products[item].stock = addQty;
    } else {
        products[item].stock += addQty;
    }

    saveData();
    showStock();
    loadProducts();

    // clear invoice area
    const invoiceBox = document.getElementById('invoice');
    if (invoiceBox) invoiceBox.style.display = 'none';

    alert('Stock updated successfully');
}

// ------- Returns / Exchange -------
function returnOrExchange() {
    const name = document.getElementById('customer').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const item = document.getElementById('returnItem')?.value;
    const qty = parseInt(document.getElementById('returnQty')?.value);
    const reason = document.getElementById('returnReason')?.value.trim();

    if (!name) {
        alert('Enter customer name');
        return;
    }
    if (!phone) {
        alert('Enter phone number');
        return;
    }
    if (!item || !Number.isFinite(qty) || qty <= 0) {
        alert('Enter valid return item and quantity');
        return;
    }

    if (!products[item]) {
        alert('Item not found');
        return;
    }

    // Add stock back
    products[item].stock += qty;
    saveData();
    showStock();

    const invoiceNo = Math.floor(1000 + Math.random() * 9000);
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const price = products[item].price;
    const amount = qty * price;
    const gstRate = products[item].gst || 18;
    const sgst = amount * (gstRate / 2) / 100;
    const cgst = amount * (gstRate / 2) / 100;
    const total = amount + sgst + cgst;

    // Receipt-style return note
    const invoiceBox = document.getElementById('invoice');
    invoiceBox.style.display = 'block';

    invoiceBox.innerHTML = `
<pre style="font-family: monospace; font-size: 14px; margin: 0; padding: 10px; color: #000; line-height: 1.4;">
==================================
            V MART
     Return / Exchange Desk
==================================

Return Ref: ${invoiceNo}
Customer: ${name}
Phone: ${phone}
Date: ${date}
Reason: ${reason || 'N/A'}

----------------------------------
Item     Qty   Rate    Total
----------------------------------
${item.padEnd(9)} ${qty.toString().padEnd(5)} ₹${price.toString().padEnd(7)} ₹${amount.toFixed(2)}
----------------------------------

SGST (${(gstRate/2)}%): ₹${sgst.toFixed(2)}
CGST (${(gstRate/2)}%): ₹${cgst.toFixed(2)}

REFUND / EXCHANGE TOTAL: ₹${total.toFixed(2)}

Thank You For Shopping ❤️
==================================
</pre>`;
}

// Download Canvas Parser configuration
function downloadPDF() {
    let invoice = document.getElementById("invoice");

    if (!invoice || invoice.innerHTML.trim() === "") {
        alert("Please generate a bill first!");
        return;
    }

    // Direct extraction via universal html2pdf bundle to eliminate empty canvas frames
    const options = {
        margin:       15,
        filename:     'V-Mart-Invoice.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    html2pdf().set(options).from(invoice).save();
    

    // Check kora hocche bill generated kina
    // if (!invoice || invoice.innerHTML.trim() === "") {
    //     alert("Please generate a bill first!");
    //     return;
    // }

    // // PDF Configuration settings - beginner & student friendly setup
    // const opt = {
    //     margin:       [10, 10, 10, 10], // Margins in mm
    //     filename:     'V-Mart-Invoice.pdf',
    //     image:        { type: 'jpeg', quality: 0.98 },
    //     html2canvas:  { scale: 2, useCORS: true, logging: false }, // Scale 2 text clear rakhbe
    //     jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' } // POS Receipt size (A5)
    // };

    // // Library single-line execution execution
    // html2pdf().set(opt).from(invoice).save()
    // .then(() => {
    //     console.log("PDF downloaded successfully!");
    // })
    // .catch((err) => {
    //     console.error("PDF generation error: ", err);
    //     alert("Something went wrong while downloading the PDF. Check console!");
    // });
//     function downloadPDF() {
//     let invoice = document.getElementById("invoice");

//     // Check kora hocche bill generate hoyeche kina
//     if (!invoice || invoice.innerHTML.trim() === "") {
//         alert("Please generate a bill first!");
//         return;
//     }

//     // Ekti temporary blank new browser print frame create korchi
//     let printWindow = window.open('', '', 'height=600,width=400');
    
//     // Tar bhetor receipt visual text layout pass korchi
//     printWindow.document.write('<html><head><title>V-Mart Invoice</title>');
//     printWindow.document.write('<style>');
//     // Monospace receipt print format standard styles
//     printWindow.document.write(`
//         body { font-family: monospace; padding: 20px; background: #fff; color: #000; }
//         pre { font-size: 14px; margin: 0; white-space: pre-wrap; line-height: 1.4; }
//         @page { size: auto; margin: 0mm; } /* Dynamic print margins control kora */
//     `);
//     printWindow.document.write('</style></head><body>');
//     printWindow.document.write(invoice.innerHTML); // Dynamic raw inner content dump kora holo
//     printWindow.document.write('</body></html>');
    
//     printWindow.document.close();
//     printWindow.focus();
    
//     // Built-in absolute browser parser invoke initialization
//     setTimeout(function() {
//         printWindow.print();
//         printWindow.close();
//     }, 500); // 500ms dynamic buffer execution delay render sync thakbar jonyo
// }
// function downloadPDF() {
//     let invoice = document.getElementById("invoice");

//     if (!invoice || invoice.innerHTML.trim() === "") {
//         alert("Please generate a bill first!");
//         return;
//     }

//     // Direct system print shortcut override
//     let originalBody = document.body.innerHTML;
//     document.body.innerHTML = invoice.innerHTML;
//     window.print();
//     document.body.innerHTML = originalBody;
    
//     // Page dynamic event handler bind matrix reload (Reload context to reset buttons)
//     window.location.reload(); 
// }
}
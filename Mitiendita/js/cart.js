// ...existing code...
/* Gestión del carrito: localStorage, render, controles y envío por WhatsApp */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("cart")) || []; } catch (e) { cart = []; }

function loadCart() {
    try { cart = JSON.parse(localStorage.getItem("cart")) || []; } catch (e) { cart = []; }
    updateCartCount();
}

function saveCart() {
    try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) { console.error("saveCart error", e); }
    updateCartCount();
}

function addToCart(id) {
    const prod = (typeof products !== "undefined") ? products.find(p => p.id === id) : null;
    if (!prod) { alert("Producto no encontrado."); return; }

    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity = (existing.quantity || 1) + 1;
    else cart.push({ id: prod.id, name: prod.name, price: Number(prod.price) || 0, img: prod.img || 'img/placeholder.jpg', quantity: 1 });

    saveCart();
    renderCartIfExists();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCartIfExists();
}

function changeQuantity(id, qty) {
    qty = parseInt(qty, 10) || 0;
    if (qty <= 0) { removeFromCart(id); return; }
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity = qty;
    saveCart();
    renderCartIfExists();
}

function clearCart() {
    if (!confirm) { cart = []; } // fallback
    cart = [];
    saveCart();
    renderCartIfExists();
}

function getCartTotal() {
    return cart.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
}

function sendWhatsAppOrder() {
    if (!cart || cart.length === 0) { alert("Tu carrito está vacío."); return; }
    const total = getCartTotal();
    const items = cart.map(i => `${i.name} x${i.quantity}`).join(", ");
    const message = `Hola, quiero ordenar: ${items}. Total: $${total.toFixed(2)} MXN`;
    const url = `https://wa.me/524434053416?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const count = cart.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    el.textContent = count;
}

function getCartRenderTarget() {
    const topTarget = document.querySelector("#cart-top #cart-container");
    if (topTarget) return topTarget;
    const modalTarget = document.getElementById("cart-modal-container");
    if (modalTarget) return modalTarget;
    return document.getElementById("cart-container");
}

function renderCart() {
    const container = getCartRenderTarget();
    if (!container) return;
    container.innerHTML = "";

    if (!cart || cart.length === 0) {
        container.innerHTML = "<p>El carrito está vacío.</p>";
        updateCartCount();
        return;
    }

    const list = document.createElement("div");
    list.className = "cart-list";

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <img class="cart-item-img" src="${item.img}" alt="${item.name}">
            <div class="cart-item-info">
                <strong>${item.name}</strong>
                <div>Precio: $${Number(item.price).toFixed(2)}</div>
                <div>
                    Cantidad:
                    <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="cart-qty" style="width:60px">
                    <button class="cart-remove" data-id="${item.id}">Eliminar</button>
                </div>
            </div>
        `;
        list.appendChild(row);
    });

    const footer = document.createElement("div");
    footer.className = "cart-footer";
    footer.innerHTML = `
        <p>Total: <strong>$${getCartTotal().toFixed(2)} MXN</strong></p>
        <div>
            <button id="cart-clear">Vaciar carrito</button>
            <button id="cart-whatsapp">Enviar por WhatsApp</button>
        </div>
    `;

    container.appendChild(list);
    container.appendChild(footer);

    container.querySelectorAll(".cart-qty").forEach(input => {
        input.addEventListener("change", (e) => {
            const id = Number(e.target.dataset.id);
            const val = Number(e.target.value);
            changeQuantity(id, val);
        });
    });
    container.querySelectorAll(".cart-remove").forEach(btn => {
        btn.addEventListener("click", () => removeFromCart(Number(btn.dataset.id)));
    });
    const btnClear = container.querySelector("#cart-clear");
    if (btnClear) btnClear.addEventListener("click", () => { if (confirm("Vaciar carrito?")) clearCart(); });
    const btnWA = container.querySelector("#cart-whatsapp");
    if (btnWA) btnWA.addEventListener("click", sendWhatsAppOrder);

    updateCartCount();
}

function renderCartIfExists() {
    const target = getCartRenderTarget();
    if (target) renderCart();
}

/* Inicializar */
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    renderCartIfExists();
});

/* Exponer globales */
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQuantity = changeQuantity;
window.clearCart = clearCart;
window.getCartTotal = getCartTotal;
window.sendWhatsAppOrder = sendWhatsAppOrder;
window.renderCart = renderCart;
window.renderCartIfExists = renderCartIfExists;
window.loadCart = loadCart;
window.updateCartCount = updateCartCount;
// ...existing code...
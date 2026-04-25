const products = [
    { id: 1, name: "Playera Clásica", category: "playera", price: 250, img: "img/playera.jpg" },
    { id: 2, name: "Sudadera Oversize", category: "sudadera", price: 600, img: "img/sudadera.jpg" },
    { id: 3, name: "Playera Estampada", category: "playera", price: 450, img: "img/playera_estampada.jpg" },
    { id: 4, name: "Cinturón Piel", category: "accesorios", price: 200, img: "img/cinturon_piel.jpg" },
    { id: 5, name: "Tenis Blancos", category: "calzado", price: 150, img: "img/tenis_blancos.jpg" },
    { id: 6, name: "Playera Deportiva", category: "playera", price: 300, img: "img/playera_deportiva.jpg" },
    { id: 7, name: "Playera Rayas", category: "playera", price: 280, img: "img/playera_rayas.jpg" },
    { id: 8, name: "Playera Lisa", category: "playera", price: 220, img: "img/playera_lisa.jpg" },
    { id: 9, name: "Pantalón Denim", category: "pantalon", price: 550, img: "img/pantalon.jpg" },
    { id: 10, name: "Pantalón Cargo", category: "pantalon", price: 650, img: "img/pantalon_cargo.jpg" },
    { id: 11, name: "Gorra", category: "accesorios", price: 180, img: "img/gorra.jpg" },
];

window.products = products;

function formatPrice(n) {
    return `$${Number(n).toFixed(2)} MXN`;
}

function renderProducts(category = "all") {
    const productList = document.getElementById("product-grid");
    if (!productList) return;

    productList.innerHTML = "";

    const filtered = category === "all"
        ? products
        : products.filter(p => p.category.toLowerCase() === category.toLowerCase());

    if (filtered.length === 0) {
        productList.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:20px;">No se encontraron productos en la categoría "${category}".</p>`;
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = product.id;

        card.innerHTML = `
            <div class="product-media">
                <img src="${product.img}" alt="${product.name}" onerror="this.onerror=null;this.src='img/placeholder.jpg'">
            </div>
            <div class="product-body">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-price">${formatPrice(product.price)}</p>
                <div class="product-actions">
                    <button class="btn-add" data-id="${product.id}">Agregar al carrito</button>
                    <button class="btn-fav" data-id="${product.id}" aria-label="Agregar a favoritos">♥</button>
                </div>
            </div>
        `;

        productList.appendChild(card);
    });

    productList.querySelectorAll(".btn-add").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            if (typeof window.addToCart === "function") {
                window.addToCart(id);
            }
        });
    });

    productList.querySelectorAll(".btn-fav").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            if (typeof window.addToFavorites === "function") {
                window.addToFavorites(id);
            }
        });
    });
}

window.addEventListener("DOMContentLoaded", () => renderProducts("all"));
window.renderProducts = renderProducts;
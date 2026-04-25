let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function addToFavorites(id) {
    const product = window.products ? window.products.find(p => p.id === id) : null;
    if (!product) {
        alert("Producto no encontrado");
        return;
    }

    if (favorites.find(f => f.id === id)) {
        alert("Ya está en favoritos");
        return;
    }

    favorites.push(product);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("Agregado a favoritos");
}

function renderFavorites() {
    const productList = document.getElementById("product-list");
    if (!productList) return;

    productList.innerHTML = "<h2>Tus Favoritos</h2>";

    if (favorites.length === 0) {
        productList.innerHTML += "<p>No tienes favoritos aún.</p>";
        return;
    }

    favorites.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${product.img}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>$${product.price} MXN</p>
            <button onclick="addToCart(${product.id})">Agregar al carrito</button>
        `;
        productList.appendChild(card);
    });
}

window.addToFavorites = addToFavorites;
window.renderFavorites = renderFavorites;
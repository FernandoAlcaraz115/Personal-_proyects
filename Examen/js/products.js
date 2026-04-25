const products = [
  { id: 1, name: "Playera Negra", category: "playera", price: 250, img: "img/playera.jpg" },
  { id: 2, name: "Sudadera Roja", category: "sudadera", price: 600, img: "img/sudadera.jpg" },
  { id: 3, name: "Gorra Blanca", category: "gorra", price: 200, img: "img/gorra.jpg" }
];

function renderProducts(cat = "all") {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  const filtered = cat === "all" ? products : products.filter(p => p.category === cat);
  filtered.forEach(pr => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${pr.img}" alt="${pr.name}">
      <h4>${pr.name}</h4>
      <p>$${pr.price} MXN</p>
      <button onclick="addToCart(${pr.id})">Agregar al carrito</button>
      <button onclick="addToFavorites(${pr.id})">Favorito</button>`;
    list.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => renderProducts("all"));


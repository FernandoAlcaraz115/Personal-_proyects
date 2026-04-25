let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function addToFavorites(id) {
  if (favorites.find(f => f.id === id)) return alert("Ya está en favoritos");
  favorites.push(products.find(p => p.id === id));
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert("Agregado a favoritos");
}

function renderFavorites() {
  const list = document.getElementById("product-list");
  list.innerHTML = "<h2>Favoritos</h2>";
  if (!favorites.length) return list.innerHTML += "<p>No hay favoritos</p>";
  favorites.forEach(pr => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${pr.img}" alt="${pr.name}">
      <h4>${pr.name}</h4>
      <p>$${pr.price} MXN</p>
      <button onclick="addToCart(${pr.id})">Agregar al carrito</button>`;
    list.appendChild(card);
  });
}

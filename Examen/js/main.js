// Navegación suave
document.querySelectorAll("a[href^='#']").forEach(a =>
  a.addEventListener("click", e => {
    e.preventDefault();
    const tgt = document.querySelector(a.getAttribute("href"));
    if (tgt) tgt.scrollIntoView({ behavior: "smooth" });
  })
);

// Categorías
document.querySelectorAll(".category-card").forEach(c =>
  c.addEventListener("click", () => {
    renderProducts(c.dataset.category);
    document.querySelector("#productos").scrollIntoView({ behavior: "smooth" });
  })
);

// Menú carrito
document.querySelector("a[href='#carrito']").addEventListener("click", e => {
  e.preventDefault();
  const summary = cart.map(i => `${i.name} x${i.quantity}`).join("\n");
  alert("Carrito:\n" + summary + `\nTotal: $${getCartTotal()} MXN`);
  if (confirm("¿Enviar pedido por WhatsApp?")) sendWhatsAppOrder();
});

// Menú favoritos
document.querySelector("a[href='#favoritos']").addEventListener("click", e => {
  e.preventDefault();
  renderFavorites();
  document.querySelector("#productos").scrollIntoView({ behavior: "smooth" });
});

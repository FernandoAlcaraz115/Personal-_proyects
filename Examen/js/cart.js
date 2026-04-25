let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const exist = cart.find(i => i.id === id);
  if (exist) exist.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));

  // ✅ Reto: cambiar texto y deshabilitar por 2 s
  const btn = event.target;
  btn.innerHTML = "Agregado";
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = "Agregar al carrito";
    btn.disabled = false;
  }, 2000);
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function sendWhatsAppOrder() {
  const total = getCartTotal();
  const items = cart.map(i => `${i.name} x${i.quantity}`).join(", ");
  const msg = `Hola, quiero: ${items}. Total: $${total} MXN`;
  window.open(`https://wa.me/524437220948?text=${encodeURIComponent(msg)}`, "_blank");
}

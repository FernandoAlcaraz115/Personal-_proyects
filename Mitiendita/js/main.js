// ...existing code...
document.addEventListener("DOMContentLoaded", () => {

    // navegación suave
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // delegación para categorías
    const categoryGrid = document.querySelector(".category-grid");
    if (categoryGrid) {
        categoryGrid.addEventListener("click", (e) => {
            const card = e.target.closest(".category-card");
            if (!card) return;
            const category = card.dataset.category;
            if (typeof renderProducts === "function") renderProducts(category);
            const productosSection = document.querySelector("#productos");
            if (productosSection) productosSection.scrollIntoView({ behavior: "smooth" });
        });
        categoryGrid.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                const card = e.target.closest(".category-card");
                if (card) {
                    e.preventDefault();
                    card.click();
                }
            }
        });
    }

    // CONTROL DEL CARRITO (header -> modal o sección fija)
    const cartLink = document.getElementById("cart-link");
    const modalOverlay = document.getElementById("cart-modal-overlay");
    const modalClose = document.getElementById("cart-close-btn");
    const cartTop = document.getElementById("cart-top");

    function openModal() {
        if (!modalOverlay) return;
        modalOverlay.style.display = "block";
        void modalOverlay.offsetWidth;
        modalOverlay.classList.add("open");
        modalOverlay.setAttribute("aria-hidden", "false");
        if (cartLink) cartLink.setAttribute("aria-expanded", "true");

        if (typeof loadCart === "function") loadCart();
        if (typeof renderCart === "function") renderCart();
        else if (typeof renderCartIfExists === "function") renderCartIfExists();
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove("open");
        modalOverlay.setAttribute("aria-hidden", "true");
        if (cartLink) cartLink.setAttribute("aria-expanded", "false");
        setTimeout(() => { if (modalOverlay) modalOverlay.style.display = "none"; }, 300);
    }

    function showCartSection() {
        if (!cartTop) return;
        cartTop.style.display = "";
        if (typeof loadCart === "function") loadCart();
        if (typeof renderCart === "function") renderCart();
        else if (typeof renderCartIfExists === "function") renderCartIfExists();
        cartTop.scrollIntoView({ behavior: "smooth" });
        if (cartLink) cartLink.setAttribute("aria-expanded", "true");
    }

    function hideCartSection() {
        if (!cartTop) return;
        cartTop.style.display = "none";
        if (cartLink) cartLink.setAttribute("aria-expanded", "false");
    }

    if (cartLink) {
        cartLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (modalOverlay) {
                if (modalOverlay.classList.contains("open")) closeModal();
                else openModal();
                return;
            }
            if (cartTop) {
                const visible = window.getComputedStyle(cartTop).display !== "none";
                if (visible) hideCartSection();
                else showCartSection();
                return;
            }
            const fallback = document.getElementById("cart-container") || document.getElementById("cart-modal-container");
            if (fallback && (typeof renderCart === "function" || typeof renderCartIfExists === "function")) {
                if (typeof loadCart === "function") loadCart();
                if (typeof renderCart === "function") renderCart();
                else renderCartIfExists();
                fallback.scrollIntoView({ behavior: "smooth" });
            } else {
                alert("No se encontró dónde mostrar el carrito. Revisa el HTML.");
            }
        });
    }

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modalOverlay && modalOverlay.classList.contains("open")) closeModal();
            else if (cartTop && window.getComputedStyle(cartTop).display !== "none") hideCartSection();
        }
    });

    // Favoritos
    const favLink = document.querySelector('a[href="#favoritos"], a#fav-link, a[href="#Favoritos"]');
    if (favLink) {
        favLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof renderFavorites === "function") renderFavorites();
            const productosSection = document.querySelector("#productos");
            if (productosSection) productosSection.scrollIntoView({ behavior: "smooth" });
        });
    }

});

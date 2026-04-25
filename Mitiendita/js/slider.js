// JS/slider.js - Slider optimizado para carga
(function () {
    document.addEventListener("DOMContentLoaded", () => {
        let currentSlide = 0;
        const slides = document.querySelectorAll(".slide");
        if (!slides || slides.length === 0) return;

        // Precargar imágenes
        function preloadImages() {
            const images = [];
            slides.forEach(slide => {
                const img = slide.querySelector('img');
                if (img && img.src) {
                    const image = new Image();
                    image.src = img.src;
                    images.push(image);
                }
            });
            return images;
        }

        // Iniciar precarga
        preloadImages();

        function showSlide(index) {
            slides.forEach((slide, i) => {
                const wasActive = slide.classList.contains("active");
                slide.classList.toggle("active", i === index);
                
                // Si se activa una nueva slide, forzar la carga de la imagen
                if (i === index && !wasActive) {
                    const img = slide.querySelector('img');
                    if (img) {
                        // Forzar la carga si no se ha cargado
                        if (!img.complete || img.naturalHeight === 0) {
                            img.style.opacity = '0';
                            img.onload = function() {
                                this.style.opacity = '1';
                            };
                            // Reintentar la carga
                            const src = img.src;
                            img.src = '';
                            img.src = src;
                        }
                    }
                }
            });
        }

        function changeSlide(direction) {
            currentSlide = (currentSlide + direction + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        // Exponer para compatibilidad
        window.changeSlide = changeSlide;

        // Precargar siguiente imagen
        function preloadNextImage() {
            const nextIndex = (currentSlide + 1) % slides.length;
            const nextSlide = slides[nextIndex];
            if (nextSlide) {
                const img = nextSlide.querySelector('img');
                if (img) {
                    const preloadImg = new Image();
                    preloadImg.src = img.src;
                }
            }
        }

        // Inicializar
        showSlide(currentSlide);
        preloadNextImage();

        // Botones prev/next
        const prevBtn = document.querySelector(".prev");
        const nextBtn = document.querySelector(".next");
        
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                changeSlide(-1);
                preloadNextImage();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                changeSlide(1);
                preloadNextImage();
            });
        }

        // Navegación por teclado
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") {
                changeSlide(-1);
                preloadNextImage();
            }
            if (e.key === "ArrowRight") {
                changeSlide(1);
                preloadNextImage();
            }
        });

        // Autoplay con precarga inteligente
        let autoplayId = setInterval(() => {
            changeSlide(1);
            preloadNextImage();
        }, 5000);

        const sliderEl = document.querySelector(".Slider");
        if (sliderEl) {
            sliderEl.addEventListener("mouseenter", () => clearInterval(autoplayId));
            sliderEl.addEventListener("mouseleave", () => {
                clearInterval(autoplayId);
                autoplayId = setInterval(() => {
                    changeSlide(1);
                    preloadNextImage();
                }, 5000);
            });
        }

        // Forzar carga de primera imagen
        setTimeout(() => {
            const firstImg = slides[0].querySelector('img');
            if (firstImg && !firstImg.complete) {
                const src = firstImg.src;
                firstImg.src = '';
                firstImg.src = src;
            }
        }, 100);
    });
})();
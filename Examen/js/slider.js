let currentSlide = 0;

function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  slides.forEach((s, i) => s.classList.toggle("active", i === index));
}

function changeSlide(dir) {
  const slides = document.querySelectorAll(".slide");
  currentSlide += dir;
  if (currentSlide < 0) currentSlide = slides.length - 1;
  if (currentSlide >= slides.length) currentSlide = 0;
  showSlide(currentSlide);
}

// ✅ Corrección 3: Movimiento automático
setInterval(() => changeSlide(1), 5000);
s
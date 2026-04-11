gsap.registerPlugin(ScrollToPlugin);

const config = {
  duration: 0.6,    // Equivalente a animationTime (en segundos)
  stepSize: 150,    // Equivalente a stepSize (píxeles por salto)
  ease: "power2.out"// Algoritmo de suavizado de GSAP
};

let targetScroll = window.scrollY || window.pageYOffset;

function updateScroll(delta, multiplier = 1) {
  // Calcular el límite máximo de scroll de la página
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  
  // Actualizar el objetivo sumando el movimiento
  targetScroll += delta * config.stepSize * multiplier;
  
  // Limitar para no hacer scroll más allá del tope o el fondo
  targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

  // Animar con GSAP
  gsap.to(window, {
    scrollTo: { y: targetScroll, autoKill: true },
    duration: config.duration,
    ease: config.ease,
    overwrite: "auto" // Previene conflictos si el usuario hace scroll rápido
  });
}

// 1. Soporte para la Rueda del Ratón
window.addEventListener("wheel", (e) => {
  // Solo aplicamos a nivel de ventana, ignorando textareas o embeds si lo deseas
  if (["TEXTAREA", "EMBED", "OBJECT"].includes(e.target.nodeName)) return;
  
  e.preventDefault();
  const delta = e.deltaY > 0 ? 1 : -1;
  updateScroll(delta);
}, { passive: false });

// 2. Soporte para Teclado (Flechas y Barra Espaciadora)
window.addEventListener("keydown", (e) => {
  // Ignorar si el usuario está escribiendo en un input o textarea
  if (["INPUT", "TEXTAREA"].includes(e.target.nodeName)) return;

  const keys = { 
    38: -1, // Flecha Arriba
    40: 1,  // Flecha Abajo
    32: 2,  // Espacio (baja el doble de rápido)
    33: -2, // Page Up
    34: 2   // Page Down
  };

  if (keys[e.keyCode]) {
    e.preventDefault();
    updateScroll(keys[e.keyCode]);
  }
}, { passive: false });

// 3. Sincronizar el scroll manual (si el usuario usa la barra de scroll nativa)
window.addEventListener("scroll", () => {
  if (!gsap.isTweening(window)) {
    targetScroll = window.scrollY || window.pageYOffset;
  }
}, { passive: true });
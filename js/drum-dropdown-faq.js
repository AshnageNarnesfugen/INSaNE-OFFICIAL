document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq-item");
  let activeItem = null; // ítem actualmente abierto

  function openItem(item) {
    const answer = item.querySelector(".faq-answer");
    const arrow = item.querySelector(".faq-arrow");
    const question = item.querySelector(".faq-question");

    // detener tweens previos
    gsap.killTweensOf([answer, arrow]);

    // medir altura natural
    const fullHeight = answer.scrollHeight;

    answer.style.pointerEvents = "auto";
    question.classList.add("faq-active-highlight");
    item.classList.add("faq-active-tab");

    // animar a la altura natural y al final poner height auto
    gsap.to(answer, {
      height: fullHeight,
      opacity: 1,
      duration: 0.45,
      ease: "power2.out",
      onComplete: () => {
        answer.style.height = "auto"; // permite reflow/responsive
      },
    });

    gsap.to(arrow, {
      rotate: 180,
      duration: 0.32,
      ease: "power2.inOut",
    });

    activeItem = item; // asignar sólo cuando realmente abrimos
  }

  function closeItem(item) {
    const answer = item.querySelector(".faq-answer");
    const arrow = item.querySelector(".faq-arrow");
    const question = item.querySelector(".faq-question");

    // detener tweens previos
    gsap.killTweensOf([answer, arrow]);

    // Si height está en 'auto' (después de abrir), fijarlo a su altura actual para animar a 0
    if (getComputedStyle(answer).height === "auto" || answer.style.height === "auto") {
      answer.style.height = answer.scrollHeight + "px";
    }

    gsap.to(answer, {
      height: 0,
      opacity: 0,
      duration: 0.38,
      ease: "power2.inOut",
      onComplete: () => {
        answer.style.pointerEvents = "none";
        // (no dejamos height en auto)
      },
    });

    gsap.to(arrow, {
      rotate: 0,
      duration: 0.28,
      ease: "power2.inOut",
    });

    question.classList.remove("faq-active-highlight");
    item.classList.remove("faq-active-tab");

    activeItem = null; // cerrar: dejamos activeItem en null
  }

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const arrow = item.querySelector(".faq-arrow");

    gsap.set(answer, { height: 0, opacity: 0 });
    gsap.set(arrow, { rotate: 0, transformOrigin: "center center" });
    answer.style.pointerEvents = "none";

    question.addEventListener("click", () => {
      const isOpen = item === activeItem;

      // Si hay otro abierto y no es este, ciérralo primero
      if (activeItem && activeItem !== item) {
        closeItem(activeItem);
      }

      if (isOpen) {
        // si el clic es sobre el abierto -> cerrarlo
        closeItem(item);
      } else {
        // abrir el nuevo (si había otro, ya lo cerramos arriba)
        openItem(item);
      }
    });
  });
});

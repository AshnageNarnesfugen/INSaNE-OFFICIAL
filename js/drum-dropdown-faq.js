$(document).ready(function () {
  const $faqItems = $(".faq-item");
  let $activeItem = null; // ítem actualmente abierto

  function openItem($item) {
    const $answer = $item.find(".faq-answer");
    const $arrow = $item.find(".faq-arrow");
    const $question = $item.find(".faq-question");

    // detener tweens previos
    gsap.killTweensOf([$answer[0], $arrow[0]]);

    // medir altura natural
    const fullHeight = $answer[0].scrollHeight;

    $answer.css("pointer-events", "auto");
    $question.addClass("faq-active-highlight");
    $item.addClass("faq-active-tab");

    // animar a la altura natural y al final poner height auto
    gsap.to($answer[0], {
      height: fullHeight,
      opacity: 1,
      duration: 0.45,
      ease: "power2.out",
      onComplete: () => {
        $answer.css("height", "auto"); // permite reflow/responsive
      },
    });

    gsap.to($arrow[0], {
      rotate: 180,
      duration: 0.32,
      ease: "power2.inOut",
    });

    $activeItem = $item;
  }

  function closeItem($item) {
    const $answer = $item.find(".faq-answer");
    const $arrow = $item.find(".faq-arrow");
    const $question = $item.find(".faq-question");

    // detener tweens previos
    gsap.killTweensOf([$answer[0], $arrow[0]]);

    const currentHeight = $answer.css("height");
    if (currentHeight === "auto") {
      $answer.css("height", $answer[0].scrollHeight + "px");
    }

    gsap.to($answer[0], {
      height: 0,
      opacity: 0,
      duration: 0.38,
      ease: "power2.inOut",
      onComplete: () => {
        $answer.css("pointer-events", "none");
      },
    });

    gsap.to($arrow[0], {
      rotate: 0,
      duration: 0.28,
      ease: "power2.inOut",
    });

    $question.removeClass("faq-active-highlight");
    $item.removeClass("faq-active-tab");

    $activeItem = null;
  }

  // Inicialización
  $faqItems.each(function () {
    const $item = $(this);
    const $answer = $item.find(".faq-answer");
    const $arrow = $item.find(".faq-arrow");
    const $question = $item.find(".faq-question");

    gsap.set($answer[0], { height: 0, opacity: 0 });
    gsap.set($arrow[0], { rotate: 0, transformOrigin: "center center" });
    $answer.css("pointer-events", "none");

    $question.on("click", function () {
      const isOpen = $item.is($activeItem);

      // Si hay otro abierto y no es este, ciérralo primero
      if ($activeItem && !$item.is($activeItem)) {
        closeItem($activeItem);
      }

      if (isOpen) {
        closeItem($item);
      } else {
        openItem($item);
      }
    });
  });
});

/*! Copyright (c) 2016 THE ULTRASOFT (http://theultrasoft.com)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Project: Parallaxie
 * Version: 0.5
 *
 * Requires: jQuery 1.9+
 */
/*(function( $ ){

    $.fn.parallaxie = function( options ){

        options = $.extend({
            speed: 0.2,
            repeat: 'no-repeat',
            size: 'cover',
            pos_x: 'center',
            offset: 0,
            disableMobile: true // Added property to disable on mobile devices
        }, options );

        var $elements = this; // Store the elements

        function initializeParallax() {
            $elements.each(function(){
                var $el = $(this);
                var local_options = $el.data('parallaxie');
                if( typeof local_options !== 'object' ) local_options = {};
                local_options = $.extend( {}, options, local_options );

                var image_url = $el.data('image');
                if( typeof image_url === 'undefined' ){
                    image_url = $el.css('background-image');
                    if( !image_url ) return;

                    // APPLY DEFAULT CSS
                    var pos_y =  local_options.offset + ($el.offset().top - $(window).scrollTop()) * (1 - local_options.speed );
                    $el.css({
                        'background-image': image_url,
                        'background-size': local_options.size,
                        'background-repeat': local_options.repeat,
                        'background-attachment': 'fixed',
                        'background-position': local_options.pos_x + ' ' + pos_y + 'px',
                    });

                    // Call by default for the first time on initialization.
                    if ((!local_options.disableMobile || !isMobileDevice()) && !isSmallScreen()) {
                        parallax_scroll( $el, local_options );
                    }
                }
            });
        }

        function handleResize() {
            if (!isMobileDevice() && !isSmallScreen()) {
                initializeParallax();
            }
        }

        // Initialize parallax on page load
        $(document).ready(initializeParallax);

        // Call whenever the scroll event occurs.
        $(window).scroll(function(){
            if (!isMobileDevice() && !isSmallScreen()) {
                parallax_scroll($elements, options);
            }
        });

        // Call whenever the window is resized.
        $(window).resize(handleResize);

        return this;
    };


    function parallax_scroll( $el, local_options ){
        $el.each(function(){
            var $this = $(this);
            var pos_y =  local_options.offset + ($this.offset().top - $(window).scrollTop()) * (1 - local_options.speed );
            $this.data( 'pos_y', pos_y );
            $this.css( 'background-position', local_options.pos_x + ' ' + pos_y + 'px' );
        });
    }
    
    function isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }

    function isSmallScreen() {
        return window.matchMedia("(max-width: 767px)").matches;
    }

}( jQuery ));*/

/**
 * Parallaxie Reconstruido con GSAP y ScrollTrigger
 * Sin dependencias de jQuery.
 */

function initParallaxie(selector, options = {}) {
  // Registramos el plugin de GSAP
  // gsap.registerPlugin(ScrollTrigger);

  // Opciones por defecto (idénticas al original)
  const config = {
    speed: 0.2,
    repeat: 'no-repeat',
    size: 'cover',
    pos_x: 'center',
    offset: 0,
    disableMobile: true,
    ...options
  };

  // Funciones de detección de dispositivos
  const isMobileDevice = () => ('ontouchstart' in window) || (navigator.userAgent.indexOf('IEMobile') !== -1);
  const isSmallScreen = () => window.matchMedia("(max-width: 767px)").matches;

  // Detener si es móvil y disableMobile es true
  if (config.disableMobile && (isMobileDevice() || isSmallScreen())) {
    return;
  }

  // Seleccionamos todos los elementos
  const elements = document.querySelectorAll(selector);

  elements.forEach(el => {
    // Heredar opciones locales mediante atributos de datos (ej. data-parallaxie='{"speed": 0.5}')
    let localOptions = { ...config };
    const dataOptions = el.getAttribute('data-parallaxie');
    if (dataOptions) {
      try {
        localOptions = { ...localOptions, ...JSON.parse(dataOptions) };
      } catch (e) {
        console.error("Parallaxie: Error al parsear data-parallaxie", e);
      }
    }

    // Gestionar la imagen de fondo (desde data-image o CSS existente)
    let imageUrl = el.getAttribute('data-image');
    if (!imageUrl) {
      imageUrl = window.getComputedStyle(el).backgroundImage;
      if (!imageUrl || imageUrl === 'none') return; // Si no hay imagen, omitimos este elemento
    } else {
      el.style.backgroundImage = `url(${imageUrl})`;
    }

    // Aplicar CSS por defecto
    el.style.backgroundSize = localOptions.size;
    el.style.backgroundRepeat = localOptions.repeat;
    el.style.backgroundAttachment = 'fixed';

    // Crear la animación GSAP con ScrollTrigger
    // Utilizamos fromTo con valores funcionales para replicar la fórmula matemática original
    gsap.fromTo(el, 
      {
        // Posición inicial: cuando la parte superior del elemento toca la parte inferior de la pantalla
        backgroundPosition: () => `${localOptions.pos_x} ${localOptions.offset + (window.innerHeight * (1 - localOptions.speed))}px`
      },
      {
        // Posición final: cuando la parte inferior del elemento toca la parte superior de la pantalla
        backgroundPosition: () => `${localOptions.pos_x} ${localOptions.offset + (-el.offsetHeight * (1 - localOptions.speed))}px`,
        ease: "none", // Sin aceleración, movimiento lineal puro como el scroll
        scrollTrigger: {
          trigger: el,
          start: "top bottom", // Inicia la animación al entrar al viewport
          end: "bottom top",   // Termina al salir del viewport
          scrub: true,         // 'scrub' vincula la animación estrictamente a la barra de scroll
          invalidateOnRefresh: true // Recalcula las dimensiones automáticamente si el usuario redimensiona la ventana
        }
      }
    );
  });
}
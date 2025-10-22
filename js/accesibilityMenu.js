(function( $ ){
    // --- ESTADO CENTRAL ---
    const state = {
    textSize: 0, // 0-16px, 1-18px, 2-20px
    highlightLinks: false,
    letterSpacing: 0, // 0-normal,1-1px,2-2px
    saturationCycle: 0, // 0 = no cycle started, 1 = first click (desat), 2 = second click (sat), 3 = restore
    cursor: 0, // 0-off,1-on
    font: 0 // 0-default,1-dyslexic,2-arial
    };

    const defaults = {
    textSize: '16px',
    highlightLinks: false,
    letterSpacing: 'normal',
    saturation: 1,
    cursor: 0,
    font: "var(--font-default, 'Arial')"
    };

    // almacenamiento temporal del filter previo (para restaurar en 3er click)
    let previousFilter = '';
    const $focusLine = $('#focus-line');

    // overlay para spotlight (se crea si no existe)
    if ($('#accessibility-spotlight').length === 0) {
    $('body').append('<div id="accessibility-spotlight" aria-hidden="true"></div>');
    $('#accessibility-spotlight').css({
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        'background-color': 'rgba(0,0,0,0.85)',
        'pointer-events': 'none',
        display: 'none',
        'z-index': 999999,
        transition: 'clip-path 60ms linear'
    });
    }

    // helper: ensure style tag for overrides
    function ensureOverrideStyle() {
    if ($('#accessibility-overrides').length === 0) {
        $('head').append('<style id="accessibility-overrides"></style>');
    }
    }

    // --- FUNCIONES MODULARES ---
    const actions = {
    textSize() {
        state.textSize = (state.textSize + 1) % 3;
        const sizes = ['16px', '18px', '20px'];
        const size = sizes[state.textSize];
        // Fuerza el tamaño usando style injection para que aplique a todos
        ensureOverrideStyle();
        const current = $('#accessibility-overrides').text();
        // Actualiza solo la regla de font-size (mantener otras reglas como letter-spacing)
        const newCss = current.replace(/body,\s*body \* \{[^}]*font-size:[^;]*;?[^}]*\}/, '');
        const fontRule = `body, body * { font-size: ${size} !important; }\n`;
        $('#accessibility-overrides').text(newCss + fontRule + extractOtherRules(newCss));
    },

    highlightLinks() {
        state.highlightLinks = !state.highlightLinks;
        if (state.highlightLinks) {
        $('body').addClass('accessibility-highlight-links');
        // Fuerza estilos tipo <mark> + subrayado
        ensureOverrideStyle();
        appendOrReplaceRule(`#accessibility-highlight-links-style`, `
            body.accessibility-highlight-links a {
            background-color: #fff59d !important; /* amarillo suave tipo mark */
            text-decoration: underline !important;
            text-decoration-thickness: 2px !important;
            color: inherit !important;
            padding: 0 .15em !important;
            }
        `);
        // Aplicar clase body tactile
        $('body').addClass('accessibility-highlight-links');
        } else {
        $('body').removeClass('accessibility-highlight-links');
        $('#accessibility-highlight-links-style').remove();
        }
    },

    letterSpacing() {
        state.letterSpacing = (state.letterSpacing + 1) % 3;
        const spacing = ['normal', '1px', '2px'];
        const value = spacing[state.letterSpacing];
        ensureOverrideStyle();
        const current = $('#accessibility-overrides').text();
        const newCss = current.replace(/body,\s*body \* \{[^}]*letter-spacing:[^;]*;?[^}]*\}/, '');
        const letterRule = `body, body * { letter-spacing: ${value} !important; }\n`;
        $('#accessibility-overrides').text(newCss + letterRule + extractOtherRules(newCss));
    },

    saturation() {
        // Ciclo de 3 pasos:
        // 1 -> guarda filter previo y aplica desaturado (0)
        // 2 -> aplica saturado completo (1)
        // 3 -> restaura filter previo
        state.saturationCycle = (state.saturationCycle + 1) % 3;
        if (state.saturationCycle === 1) {
        // guardar filter actual (inline style preferido, si no, computed)
        previousFilter = document.body.style.filter || getComputedStyle(document.body).filter || '';
        applyFilterToNonFixedElements('saturate(0)');
        } else if (state.saturationCycle === 2) {
        applyFilterToNonFixedElements('saturate(1)');
        } else {
        // ciclo 0 -> restaurar
        applyFilterToNonFixedElements(previousFilter || '');
        }
    },

    cursor() {
        state.cursor = (state.cursor + 1) % 2;
        if (state.cursor === 1) {
        // activar spotlight (overlay con recorte)
        $('#accessibility-spotlight').show();
        $(document).on('mousemove.accessibilitySpotlight', moveSpotlight);
        // esconder la linea de foco si existe; usaremos spotlight visual
        $focusLine.hide();
        } else {
        $('#accessibility-spotlight').hide();
        $(document).off('mousemove.accessibilitySpotlight');
        // restaurar linea de foco original hidden
        $focusLine.hide();
        }
    },

    font() {
        state.font = (state.font + 1) % 3;
        switch (state.font) {
        case 0:
            $('body').css('font-family', defaults.font);
            break;
        case 1:
            $('body').css('font-family', "'OpenDyslexic', 'Arial', sans-serif");
            break;
        case 2:
            $('body').css('font-family', "'Arial', sans-serif");
            break;
        }
    },

    reset() {
        state.textSize = 0;
        state.highlightLinks = false;
        state.letterSpacing = 0;
        state.saturationCycle = 0;
        state.cursor = 0;
        state.font = 0;

        previousFilter = '';

        // remover overrides y estilos aplicados
        $('#accessibility-overrides').remove();
        $('#accessibility-highlight-links-style').remove();

        // quitar filtros aplicados a elementos (los aplicamos en style attribute)
        $('*').each(function () {
        // solo limpiar filter que se añadió en-line
        if (this.style && this.style.filter) {
            this.style.filter = '';
        }
        });

        // resetear font-size/letter-spacing globales por body css
        $('body').css({
        'font-size': defaults.textSize,
        'letter-spacing': defaults.letterSpacing,
        'font-family': defaults.font
        });

        $('body').removeClass('accessibility-highlight-links');
        $('#accessibility-spotlight').hide();
        $(document).off('mousemove.accessibilitySpotlight');
        $focusLine.hide();
    }
    };

    // --- FUNCIONES AUXILIARES ---

    // Aplica filter solamente a elementos que NO son position: fixed.
    // Evita que fixed pierdan su comportamiento.
    function applyFilterToNonFixedElements(filterValue) {
    // iterar por todos los nodos y aplicar filter inline salvo si computed position === 'fixed'
    const all = document.querySelectorAll('body *');
    for (let i = 0; i < all.length; i++) {
        const el = all[i];
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') continue;
        // No sobrescribir overlay o el spotlight mismo
        if (el.id === 'accessibility-spotlight' || el.id === 'focus-line') continue;
        // Aplicar filter inline
        el.style.filter = filterValue;
    }
    // también limpiar body inline para evitar crear new containing block
    document.body.style.filter = '';
    }

    // spotlight move: recorta el overlay para mostrar solo una franja (band)
    // usamos clip-path inset(top right bottom left)
    function moveSpotlight(e) {
    const y = e.clientY;
    const bandHalf = 25; // media altura de la franja
    const top = Math.max(0, y - bandHalf);
    const bottom = Math.max(0, window.innerHeight - (y + bandHalf));
    const clip = `inset(${top}px 0 ${bottom}px 0)`;
    const $ov = $('#accessibility-spotlight');
    // agregar prefijos para compatibilidad
    $ov.css('clip-path', clip);
    $ov.css('-webkit-clip-path', clip);
    }

    // extrae reglas distintas (mantener si existieran otras reglas) - ayuda simple
    function extractOtherRules(currentCss) {
    // si hay otras reglas las mantenemos, pero para simplicidad devolvemos vacío
    return '';
    }

    // Agrega o reemplaza un style block con id
    function appendOrReplaceRule(id, cssText) {
    const selectorId = '#' + id;
    if ($(selectorId).length) {
        $(selectorId).text(cssText);
    } else {
        $('head').append(`<style id="${id}">${cssText}</style>`);
    }
    }

    // Contraste de color (mantuvimos la función)
    function getContrastingColor(rgb) {
    if (!rgb) return '#000';
    const nums = rgb.match(/\d+/g);
    if (!nums || nums.length < 3) return '#000';
    const [r, g, b] = nums.map(Number);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
    }

    // --- EVENTO GENERAL PARA BOTONES ---
    $('.accessibility-menu button').on('click', function () {
    const action = $(this).data('action');
    if (actions[action]) actions[action]();
    });

}( jQuery ));


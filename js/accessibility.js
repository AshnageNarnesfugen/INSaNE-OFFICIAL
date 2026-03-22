(function () {
    'use strict';

    // ── Traducciones ─────────────────────────────────────────────
    // Read from window.INSaNE_DATA at init time (not at parse time)
    // so data-loader.js has had time to fetch the JSON first.
    // Fallback covers the edge case where data-loader is absent.
    const _i18nFallback = {
        title:'Accessibility Menu', biggerText:'Bigger text',
        highlightLinks:'Highlight Links', textSpacing:'Text Spacing',
        saturation:'Saturation', cursor:'Cursor', readingMask:'Reading Mask',
        dyslexia:'Dyslexia Friendly', reset:'Reset',
        openLabel:'Open Accessibility Menu', closeLabel:'Close Accessibility Menu'
    };

    function getT(pageLang) {
        const data = ((window.INSaNE_DATA || {})['accessibility'] || {}).i18n || {};
        return data[pageLang] || data['en'] || _i18nFallback;
    }

    // t is a mutable closure variable — set in init() after JSON loads
    // All functions that reference t.xxx will get the correct language
    let t = _i18nFallback;

    // ── Feature definitions ──────────────────────────────────────
    // maxStage: cuántos clicks antes de volver a 0
    // stageClasses: clase CSS para cada stage (index 0 = stage 1)
    // stageCount: número de dots indicadores bajo el icono
    const FEATURES = [
        {
            key: 'bigger-text',
            label: () => t.biggerText,
            maxStage: 3,
            stageClasses: ['a11y-bigger-text-1','a11y-bigger-text-2','a11y-bigger-text-3'],
        },
        {
            key: 'highlight-links',
            label: () => t.highlightLinks,
            maxStage: 2,
            stageClasses: ['a11y-highlight-links-1','a11y-highlight-links-2'],
        },
        {
            key: 'text-spacing',
            label: () => t.textSpacing,
            maxStage: 3,
            stageClasses: ['a11y-text-spacing-1','a11y-text-spacing-2','a11y-text-spacing-3'],
        },
        {
            key: 'saturation',
            label: () => t.saturation,
            maxStage: 6,
            stageClasses: [
                'a11y-saturation-1', // bajo  −
                'a11y-saturation-2', // bajo  −−
                'a11y-saturation-3', // B&N
                'a11y-saturation-4', // alto  +
                'a11y-saturation-5', // alto  ++
                'a11y-saturation-6', // hyper +++
            ],
        },
        {
            key: 'big-cursor',
            label: () => t.cursor,
            maxStage: 1,
            stageClasses: ['a11y-big-cursor-1'],
        },
        {
            key: 'reading-mask',
            label: () => t.readingMask,
            maxStage: 1,
            stageClasses: ['a11y-reading-mask-1'],
        },
        {
            key: 'dyslexia',
            label: () => t.dyslexia,
            maxStage: 2,
            stageClasses: ['a11y-dyslexia-1','a11y-dyslexia-2'],
        },
    ];

    const LS_KEY = 'insane_a11y_v3';

    function loadState() {
        try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
        catch { return {}; }
    }
    function saveState(s) {
        try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
    }

    function applyState(state) {
        FEATURES.forEach(f => {
            const stage = state[f.key] || 0;
            f.stageClasses.forEach((cls, i) => {
                document.body.classList.toggle(cls, i + 1 === stage);
            });
        });

        // Reading mask: activar/desactivar el listener de mousemove
        const maskActive = (state['reading-mask'] || 0) > 0;
        toggleReadingMask(maskActive);
    }

    function syncButtons(state) {
        FEATURES.forEach(f => {
            const btn = document.getElementById(`a11y-btn-${f.key}`);
            if (!btn) return;
            const stage = state[f.key] || 0;

            btn.classList.remove('a11y-stage-1','a11y-stage-2','a11y-stage-3');
            if (stage > 0) btn.classList.add(`a11y-stage-${stage}`);
            btn.setAttribute('aria-pressed', stage > 0 ? 'true' : 'false');

            // Actualizar dots
            const dots = btn.querySelectorAll('.a11y-stage-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i < stage);
            });
        });
    }

    // ── Reading Mask logic — GSAP optimized ─────────────────────
    //
    // POR QUÉ EL APPROACH ANTERIOR TENÍA BAJOS FPS:
    // Modificar `top` y `height` en mousemove dispara layout reflow
    // en cada evento — el browser recalcula posiciones de todos los
    // elementos del DOM hasta 200+ veces por segundo.
    //
    // SOLUCIÓN — 3 cambios clave:
    //
    // 1. transform: scaleY() en lugar de top/height
    //    Los transforms solo afectan el composite layer (GPU),
    //    sin reflow ni repaint del DOM.
    //
    // 2. gsap.quickSetter
    //    Función de setter cacheada que bypasea el overhead de
    //    gsap.set() por frame — mínimo de procesamiento JS.
    //
    // 3. gsap.ticker en lugar de mousemove directo
    //    mousemove guarda la posición (solo una variable).
    //    gsap.ticker la consume exactamente 1 vez por frame
    //    en sincronía con requestAnimationFrame (60fps máximo).
    //    Además aplica lerp para suavizar el movimiento.
    //
    // Estructura de elementos:
    //  #a11y-mask-top    → height=100vh, transform-origin: top
    //                      scaleY va de 0 a 1 (encoge desde arriba)
    //  #a11y-mask-bottom → height=100vh, transform-origin: bottom
    //                      scaleY va de 0 a 1 (encoge desde abajo)
    //  El hueco visible entre ellos = la franja de lectura

    const MASK_HALF = 44;   // px — mitad de la franja visible (total 88px)
    const LERP      = 0.12; // suavizado por frame — más bajo = más suave

    let maskContainer    = null;
    let maskTop          = null;
    let maskBottom       = null;
    let maskTickerActive = false;

    // Posición objetivo (cursor) y actual (interpolada)
    let targetY  = -1;
    let currentY = -1;

    // quickSetters — se inicializan una vez al crear los elementos
    let setTopScale    = null;
    let setBottomScale = null;

    function ensureMaskEls() {
        if (maskContainer) return;

        maskContainer = document.createElement('div');
        maskContainer.id = 'a11y-reading-mask';

        maskTop = document.createElement('div');
        maskTop.id = 'a11y-mask-top';

        maskBottom = document.createElement('div');
        maskBottom.id = 'a11y-mask-bottom';

        // GSAP set: posición base + forzar GPU layer desde el inicio
        gsap.set(maskTop, {
            position: 'fixed',
            top: 0, left: 0,
            width: '100%',
            height: '100vh',
            transformOrigin: 'top center',
            scaleY: 0,
            force3D: true,
            display: 'none',
        });

        gsap.set(maskBottom, {
            position: 'fixed',
            bottom: 0, left: 0,
            width: '100%',
            height: '100vh',
            transformOrigin: 'bottom center',
            scaleY: 0,
            force3D: true,
            display: 'none',
        });

        document.body.appendChild(maskContainer);
        document.body.appendChild(maskTop);
        document.body.appendChild(maskBottom);

        // Crear quickSetters una sola vez
        setTopScale    = gsap.quickSetter(maskTop,    'scaleY');
        setBottomScale = gsap.quickSetter(maskBottom, 'scaleY');
    }

    // Solo guarda el targetY — no toca el DOM
    function onMaskMouseMove(e) {
        targetY = e.clientY;
        if (currentY < 0) currentY = targetY; // evitar salto en primer frame
    }

    // Corre 1 vez por frame via gsap.ticker (sincronizado con rAF)
    function maskTick() {
        if (targetY < 0) return;

        const vh = window.innerHeight;

        // Lerp: currentY se acerca a targetY suavemente cada frame
        currentY += (targetY - currentY) * LERP;

        // scaleY de la franja superior:
        // qué fracción de 100vh ocupa el área desde el top hasta el inicio de la ventana
        const topScale    = Math.max(0, Math.min(1, (currentY - MASK_HALF) / vh));

        // scaleY de la franja inferior:
        // qué fracción de 100vh ocupa el área desde el fin de la ventana hasta el bottom
        const bottomScale = Math.max(0, Math.min(1, (vh - currentY - MASK_HALF) / vh));

        // quickSetter: 0 overhead — directo al transform del GPU layer
        setTopScale(topScale);
        setBottomScale(bottomScale);
    }

    function toggleReadingMask(active) {
        ensureMaskEls();

        if (active) {
            if (currentY < 0) {
                targetY  = window.innerHeight / 2;
                currentY = targetY;
            }

            gsap.set([maskTop, maskBottom], { display: 'block' });
            // Fade in suave al activar
            gsap.fromTo([maskTop, maskBottom],
                { opacity: 0 },
                { opacity: 1, duration: 0.35, ease: 'power2.out' }
            );

            document.addEventListener('mousemove', onMaskMouseMove, { passive: true });

            if (!maskTickerActive) {
                gsap.ticker.add(maskTick);
                maskTickerActive = true;
            }

        } else {
            // Fade out antes de ocultar
            gsap.to([maskTop, maskBottom], {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in',
                onComplete: () => {
                    gsap.set([maskTop, maskBottom], { display: 'none' });
                }
            });

            document.removeEventListener('mousemove', onMaskMouseMove);

            if (maskTickerActive) {
                gsap.ticker.remove(maskTick);
                maskTickerActive = false;
            }

            targetY  = -1;
            currentY = -1;
        }
    }

    // ── SVG Icons ────────────────────────────────────────────────
    const ICONS = {
        'bigger-text':     `<svg width="28" height="22" viewBox="0 0 28 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="0" y="18" font-size="20" font-family="sans-serif" font-weight="bold">A</text><text x="17" y="14" font-size="12" font-family="sans-serif" font-weight="bold">A</text></svg>`,
        'highlight-links': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
        'text-spacing':    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h7"/><path d="M15 15l4 3-4 3"/></svg>`,
        'saturation':      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 1 0 14V2z" fill="currentColor" stroke="none"/><circle cx="12" cy="9" r="7"/></svg>`,
        'big-cursor':      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 8-7 2-4 7z"/></svg>`,
        'reading-mask':    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="9" width="20" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/><rect x="2" y="2" width="20" height="7" fill="currentColor" stroke="none" opacity="0.6"/><rect x="2" y="15" width="20" height="7" fill="currentColor" stroke="none" opacity="0.6"/></svg>`,
        'dyslexia':        `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="1" y="18" font-size="16" font-family="serif" font-weight="bold" font-style="italic">Df</text></svg>`,
        'reset':           `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
        // ── Standard accessibility person — upright, white ──────
        // Used when panel is CLOSED (blue button)
        'open': `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <!-- Head -->
            <circle cx="12" cy="4.5" r="2.2"/>
            <!-- Body — arms horizontal (standard ISA icon) -->
            <path d="M12 7.5
                     C12 7.5 12 10 12 11.5
                     L7.5 11
                     M12 11.5
                     L16.5 11
                     M12 11.5
                     L12 16.5
                     L9.5 21
                     M12 16.5
                     L14.5 21"
                  fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,

        // ── Billie Eilish crooked person — tilted, black ─────────
        // Used when panel is OPEN (yellow button)
        // Shoulders drop diagonally left, head tilts, stance asymmetric
        'close': `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"
                       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <!-- Head — tilted right -->
            <circle cx="13" cy="4.2" r="2.2"/>
            <!-- Neck + torso diagonal -->
            <!-- Left shoulder drops low, right shoulder high — the "crooked" silhouette -->
            <path d="M13 6.4
                     L12.5 9.5
                     L7 12.5
                     M12.5 9.5
                     L17.5 8.5
                     M12.5 9.5
                     L11 14.5
                     L8.5 20
                     M11 14.5
                     L13.5 19.5"
                  fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
    };

    // ── Build DOM ────────────────────────────────────────────────
    function buildMenu() {
        // Botón flotante
        const toggle = document.createElement('button');
        toggle.id = 'a11y-toggle';
        toggle.setAttribute('aria-label', t.openLabel);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'a11y-panel');
        toggle.setAttribute('type', 'button');
        toggle.innerHTML = ICONS.open;

        // Panel
        const panel = document.createElement('div');
        panel.id = 'a11y-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', t.title);

        const heading = document.createElement('h2');
        heading.textContent = t.title;
        panel.appendChild(heading);

        // Grid de botones 2 columnas
        const grid = document.createElement('div');
        grid.id = 'a11y-grid';

        FEATURES.forEach(f => {
            const btn = document.createElement('button');
            btn.id = `a11y-btn-${f.key}`;
            btn.className = 'a11y-btn';
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-pressed', 'false');

            // Dots indicadores de stage
            const dotsHTML = Array.from({ length: f.maxStage }, (_, i) =>
                `<span class="a11y-stage-dot" data-index="${i}"></span>`
            ).join('');

            btn.innerHTML = `
                <div class="a11y-icon-wrap">${ICONS[f.key]}</div>
                <span class="a11y-label">${f.label()}</span>
                <div class="a11y-stages">${dotsHTML}</div>
            `;
            grid.appendChild(btn);
        });

        // Separador + Reset en grid completo
        const sep = document.createElement('div');
        sep.className = 'a11y-separator';
        grid.appendChild(sep);

        const reset = document.createElement('button');
        reset.id = 'a11y-reset';
        reset.className = 'a11y-btn';
        reset.setAttribute('type', 'button');
        reset.innerHTML = `${ICONS.reset}<span>${t.reset}</span>`;
        grid.appendChild(reset);

        panel.appendChild(grid);
        document.body.appendChild(toggle);
        document.body.appendChild(panel);
    }

    // ── Toggle panel ─────────────────────────────────────────────
    function setupToggle() {
        const toggle = document.getElementById('a11y-toggle');
        const panel  = document.getElementById('a11y-panel');

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = panel.classList.toggle('a11y-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? t.closeLabel : t.openLabel);

            if (isOpen) {
                // Swap to crooked person icon + yellow state
                toggle.classList.add('a11y-open-state');
                toggle.innerHTML = ICONS.close;
                // GSAP: wiggle the button on open — the person "twists"
                gsap.fromTo(toggle,
                    { rotate: 0, scale: 1 },
                    { rotate: -12, scale: 1.15, duration: 0.18, ease: 'power2.out',
                      yoyo: true, repeat: 1,
                      onComplete: () => gsap.set(toggle, { rotate: 0, scale: 1 }) }
                );
            } else {
                // Back to upright person + blue state
                toggle.classList.remove('a11y-open-state');
                toggle.innerHTML = ICONS.open;
                gsap.fromTo(toggle,
                    { rotate: 0, scale: 1 },
                    { rotate: 6, scale: 0.92, duration: 0.15, ease: 'power2.out',
                      yoyo: true, repeat: 1,
                      onComplete: () => gsap.set(toggle, { rotate: 0, scale: 1 }) }
                );
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('a11y-open')) {
                panel.classList.remove('a11y-open');
                toggle.classList.remove('a11y-open-state');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', t.openLabel);
                toggle.innerHTML = ICONS.open;
                toggle.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !toggle.contains(e.target)) {
                panel.classList.remove('a11y-open');
                toggle.classList.remove('a11y-open-state');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.innerHTML = ICONS.open;
            }
        });
    }

    // ── Feature buttons ──────────────────────────────────────────
    function setupFeatureButtons() {
        let state = loadState();
        applyState(state);
        syncButtons(state);

        FEATURES.forEach(f => {
            const btn = document.getElementById(`a11y-btn-${f.key}`);
            if (!btn) return;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const current = state[f.key] || 0;
                // Ciclar: 0 → 1 → 2 → ... → maxStage → 0
                state[f.key] = current >= f.maxStage ? 0 : current + 1;
                applyState(state);
                syncButtons(state);
                saveState(state);
            });
        });

        document.getElementById('a11y-reset').addEventListener('click', (e) => {
            e.stopPropagation();
            state = {};
            applyState(state);
            syncButtons(state);
            saveState(state);
            const btn = document.getElementById('a11y-reset');
            btn.style.color = '#4caf50';
            setTimeout(() => { btn.style.color = ''; }, 700);
        });
    }

    // ── Preload OpenDyslexic si ya estaba activo ─────────────────
    function preloadDyslexicFont() {
        if ((loadState()['dyslexia'] || 0) >= 2) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/ttf/OpenDyslexic-Regular.ttf';
            link.as = 'font'; link.type = 'font/truetype'; link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }
    }

    // ── Init ─────────────────────────────────────────────────────
    function init() {
        const pageLang = (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
        // Resolve translations now — data-loader has completed by this point
        t = getT(pageLang);
        preloadDyslexicFont();
        buildMenu();
        setupToggle();
        setupFeatureButtons();
    }

    function boot() {
        // Wait for data-loader to finish fetching JSONs before building the menu
        // so translations are available when buildMenu() reads them
        if (window.INSaNE_DATA_READY) {
            window.INSaNE_DATA_READY.then(init);
        } else {
            // data-loader.js not present — init directly
            init();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
/* ============================================================
   ACCESSIBILITY MENU — INSaNE | A Broken Hero
   Adaptado de Softtek.com para insane-bh.space

   Funciones implementadas:
   1. Bigger Text
   2. Highlight Links
   3. Text Spacing
   4. Saturation (low)
   5. Big Cursor
   6. Dyslexia Friendly
   7. Reset

   Integraciones consideradas:
   - GSAP / ScrollTrigger (no interferir con transforms)
   - shuffleLetters (excluir #letter y [data-text])
   - lazyImageLoader cursor-container (cursor: none)
   - lazyVideoLoader dynamic-video-wrapper (cursor: none)
   - Sistema de idiomas (labels traducidos por lang)
   - localStorage para persistir estado entre páginas
   ============================================================ */

(function () {
    'use strict';

    // ── Traducciones del menú ────────────────────────────────────
    const i18n = {
        en: {
            title:          'Accessibility',
            biggerText:     'Bigger Text',
            highlightLinks: 'Highlight Links',
            textSpacing:    'Text Spacing',
            saturation:     'Saturation',
            cursor:         'Big Cursor',
            dyslexia:       'Dyslexia Friendly',
            reset:          'Reset',
            openLabel:      'Open Accessibility Menu',
            closeLabel:     'Close Accessibility Menu',
        },
        es: {
            title:          'Accesibilidad',
            biggerText:     'Texto grande',
            highlightLinks: 'Resaltar enlaces',
            textSpacing:    'Espaciado de texto',
            saturation:     'Saturación',
            cursor:         'Cursor grande',
            dyslexia:       'Modo dislexia',
            reset:          'Restablecer',
            openLabel:      'Abrir menú de accesibilidad',
            closeLabel:     'Cerrar menú de accesibilidad',
        },
        pt: {
            title:          'Acessibilidade',
            biggerText:     'Texto maior',
            highlightLinks: 'Destacar links',
            textSpacing:    'Espaçamento de texto',
            saturation:     'Saturação',
            cursor:         'Cursor grande',
            dyslexia:       'Modo dislexia',
            reset:          'Redefinir',
            openLabel:      'Abrir menu de acessibilidade',
            closeLabel:     'Fechar menu de acessibilidade',
        },
        fr: {
            title:          'Accessibilité',
            biggerText:     'Texte plus grand',
            highlightLinks: 'Surligner les liens',
            textSpacing:    'Espacement du texte',
            saturation:     'Saturation',
            cursor:         'Grand curseur',
            dyslexia:       'Mode dyslexie',
            reset:          'Réinitialiser',
            openLabel:      "Ouvrir le menu d'accessibilité",
            closeLabel:     "Fermer le menu d'accessibilité",
        },
        de: {
            title:          'Barrierefreiheit',
            biggerText:     'Größerer Text',
            highlightLinks: 'Links hervorheben',
            textSpacing:    'Textabstand',
            saturation:     'Sättigung',
            cursor:         'Großer Cursor',
            dyslexia:       'Legasthenie-Modus',
            reset:          'Zurücksetzen',
            openLabel:      'Barrierefreiheitsmenü öffnen',
            closeLabel:     'Barrierefreiheitsmenü schließen',
        },
        it: {
            title:          'Accessibilità',
            biggerText:     'Testo più grande',
            highlightLinks: 'Evidenzia link',
            textSpacing:    'Spaziatura testo',
            saturation:     'Saturazione',
            cursor:         'Cursore grande',
            dyslexia:       'Modalità dislessia',
            reset:          'Ripristina',
            openLabel:      'Apri menu accessibilità',
            closeLabel:     'Chiudi menu accessibilità',
        },
        ru: {
            title:          'Доступность',
            biggerText:     'Крупный текст',
            highlightLinks: 'Выделить ссылки',
            textSpacing:    'Интервал текста',
            saturation:     'Насыщенность',
            cursor:         'Крупный курсор',
            dyslexia:       'Режим дислексии',
            reset:          'Сбросить',
            openLabel:      'Открыть меню доступности',
            closeLabel:     'Закрыть меню доступности',
        },
        zh: {
            title:          '无障碍',
            biggerText:     '放大文字',
            highlightLinks: '高亮链接',
            textSpacing:    '文字间距',
            saturation:     '饱和度',
            cursor:         '大光标',
            dyslexia:       '阅读障碍模式',
            reset:          '重置',
            openLabel:      '打开无障碍菜单',
            closeLabel:     '关闭无障碍菜单',
        },
        ja: {
            title:          'アクセシビリティ',
            biggerText:     '文字を大きく',
            highlightLinks: 'リンクを強調',
            textSpacing:    '文字間隔',
            saturation:     '彩度',
            cursor:         '大きなカーソル',
            dyslexia:       'ディスレクシアモード',
            reset:          'リセット',
            openLabel:      'アクセシビリティメニューを開く',
            closeLabel:     'アクセシビリティメニューを閉じる',
        },
        ko: {
            title:          '접근성',
            biggerText:     '큰 텍스트',
            highlightLinks: '링크 강조',
            textSpacing:    '텍스트 간격',
            saturation:     '채도',
            cursor:         '큰 커서',
            dyslexia:       '난독증 모드',
            reset:          '초기화',
            openLabel:      '접근성 메뉴 열기',
            closeLabel:     '접근성 메뉴 닫기',
        },
        ar: {
            title:          'إمكانية الوصول',
            biggerText:     'نص أكبر',
            highlightLinks: 'تمييز الروابط',
            textSpacing:    'تباعد النص',
            saturation:     'التشبع',
            cursor:         'مؤشر كبير',
            dyslexia:       'وضع عسر القراءة',
            reset:          'إعادة تعيين',
            openLabel:      'فتح قائمة إمكانية الوصول',
            closeLabel:     'إغلاق قائمة إمكانية الوصول',
        },
        hi: {
            title:          'अभिगम्यता',
            biggerText:     'बड़ा टेक्स्ट',
            highlightLinks: 'लिंक हाइलाइट करें',
            textSpacing:    'टेक्स्ट स्पेसिंग',
            saturation:     'संतृप्ति',
            cursor:         'बड़ा कर्सर',
            dyslexia:       'डिस्लेक्सिया मोड',
            reset:          'रीसेट',
            openLabel:      'अभिगम्यता मेनू खोलें',
            closeLabel:     'अभिगम्यता मेनू बंद करें',
        },
        th: {
            title:          'การเข้าถึง',
            biggerText:     'ข้อความใหญ่ขึ้น',
            highlightLinks: 'เน้นลิงก์',
            textSpacing:    'ระยะห่างข้อความ',
            saturation:     'ความอิ่มตัว',
            cursor:         'เคอร์เซอร์ใหญ่',
            dyslexia:       'โหมดดิสเล็กเซีย',
            reset:          'รีเซ็ต',
            openLabel:      'เปิดเมนูการเข้าถึง',
            closeLabel:     'ปิดเมนูการเข้าถึง',
        },
        ms: {
            title:          'Kebolehcapaian',
            biggerText:     'Teks Lebih Besar',
            highlightLinks: 'Sorot Pautan',
            textSpacing:    'Jarak Teks',
            saturation:     'Ketepuan',
            cursor:         'Kursor Besar',
            dyslexia:       'Mod Disleksia',
            reset:          'Set Semula',
            openLabel:      'Buka Menu Kebolehcapaian',
            closeLabel:     'Tutup Menu Kebolehcapaian',
        },
        id: {
            title:          'Aksesibilitas',
            biggerText:     'Teks Lebih Besar',
            highlightLinks: 'Sorot Tautan',
            textSpacing:    'Spasi Teks',
            saturation:     'Saturasi',
            cursor:         'Kursor Besar',
            dyslexia:       'Mode Disleksia',
            reset:          'Reset',
            openLabel:      'Buka Menu Aksesibilitas',
            closeLabel:     'Tutup Menu Aksesibilitas',
        },
        tl: {
            title:          'Accessibility',
            biggerText:     'Mas Malaking Text',
            highlightLinks: 'I-highlight ang mga Link',
            textSpacing:    'Espasyo ng Text',
            saturation:     'Saturation',
            cursor:         'Malaking Cursor',
            dyslexia:       'Dyslexia Mode',
            reset:          'I-reset',
            openLabel:      'Buksan ang Accessibility Menu',
            closeLabel:     'Isara ang Accessibility Menu',
        },
        vi: {
            title:          'Khả năng truy cập',
            biggerText:     'Văn bản lớn hơn',
            highlightLinks: 'Làm nổi bật liên kết',
            textSpacing:    'Giãn cách văn bản',
            saturation:     'Độ bão hòa',
            cursor:         'Con trỏ lớn',
            dyslexia:       'Chế độ khó đọc',
            reset:          'Đặt lại',
            openLabel:      'Mở menu trợ năng',
            closeLabel:     'Đóng menu trợ năng',
        },
    };

    // ── Detectar idioma de la página ─────────────────────────────
    const pageLang = document.documentElement.lang || 'en';
    const t = i18n[pageLang] || i18n['en'];

    // ── Estado: clases CSS aplicadas al <body> ───────────────────
    const FEATURES = [
        { key: 'bigger-text',     class: 'a11y-bigger-text'      },
        { key: 'highlight-links', class: 'a11y-highlight-links'  },
        { key: 'text-spacing',    class: 'a11y-text-spacing'     },
        { key: 'saturation',      class: 'a11y-low-saturation'   },
        { key: 'big-cursor',      class: 'a11y-big-cursor'       },
        { key: 'dyslexia',        class: 'a11y-dyslexia'         },
    ];

    const LS_KEY = 'insane_a11y_state';

    // ── Leer/escribir estado en localStorage ─────────────────────
    function loadState() {
        try {
            return JSON.parse(localStorage.getItem(LS_KEY)) || {};
        } catch {
            return {};
        }
    }

    function saveState(state) {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(state));
        } catch {
            // localStorage no disponible (modo privado extremo) — silencioso
        }
    }

    // ── Aplicar estado al DOM ────────────────────────────────────
    function applyState(state) {
        FEATURES.forEach(f => {
            document.body.classList.toggle(f.class, !!state[f.key]);
        });
    }

    // ── Sincronizar botones con estado ───────────────────────────
    function syncButtons(state) {
        FEATURES.forEach(f => {
            const btn = document.getElementById(`a11y-${f.key}`);
            if (btn) btn.classList.toggle('a11y-active', !!state[f.key]);
        });
    }

    // ── Íconos SVG inline (sin dependencia de imágenes externas) ─
    const ICONS = {
        'bigger-text': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><text x="2" y="18" font-size="16" font-family="sans-serif" fill="currentColor" stroke="none">A</text><text x="13" y="14" font-size="10" font-family="sans-serif" fill="currentColor" stroke="none">A</text></svg>`,
        'highlight-links': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
        'text-spacing': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h7"/><path d="M17 15l3 3-3 3"/></svg>`,
        'saturation': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18" stroke-opacity="0.4"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>`,
        'big-cursor': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 3l14 8-7 2-4 7z"/></svg>`,
        'dyslexia': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h10M4 17h13"/><circle cx="19" cy="17" r="2" fill="currentColor" stroke="none"/></svg>`,
        'reset': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
        'close': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        'open': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
    };

    // ── Construir el HTML del menú ───────────────────────────────
    function buildMenu() {
        // Botón flotante
        const toggle = document.createElement('button');
        toggle.id = 'a11y-toggle';
        toggle.setAttribute('aria-label', t.openLabel);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'a11y-panel');
        toggle.innerHTML = ICONS.open;

        // Panel
        const panel = document.createElement('div');
        panel.id = 'a11y-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', t.title);

        // Cabecera del panel
        panel.innerHTML = `<h2>${t.title}</h2>`;

        // Botones de funcionalidad
        const featureLabels = {
            'bigger-text':     t.biggerText,
            'highlight-links': t.highlightLinks,
            'text-spacing':    t.textSpacing,
            'saturation':      t.saturation,
            'big-cursor':      t.cursor,
            'dyslexia':        t.dyslexia,
        };

        FEATURES.forEach(f => {
            const btn = document.createElement('button');
            btn.id = `a11y-${f.key}`;
            btn.className = 'a11y-btn';
            btn.setAttribute('aria-pressed', 'false');
            btn.innerHTML = `${ICONS[f.key]}<span>${featureLabels[f.key]}</span>`;
            panel.appendChild(btn);
        });

        // Separador + Reset
        const sep = document.createElement('div');
        sep.className = 'a11y-separator';
        panel.appendChild(sep);

        const reset = document.createElement('button');
        reset.id = 'a11y-reset';
        reset.className = 'a11y-btn';
        reset.innerHTML = `${ICONS.reset}<span>${t.reset}</span>`;
        panel.appendChild(reset);

        document.body.appendChild(toggle);
        document.body.appendChild(panel);
    }

    // ── Lógica de apertura/cierre del panel ──────────────────────
    function setupToggle() {
        const toggle = document.getElementById('a11y-toggle');
        const panel  = document.getElementById('a11y-panel');

        toggle.addEventListener('click', () => {
            const isOpen = panel.classList.toggle('a11y-open');
            toggle.setAttribute('aria-expanded', isOpen);
            toggle.setAttribute('aria-label', isOpen ? t.closeLabel : t.openLabel);
            toggle.innerHTML = isOpen ? ICONS.close : ICONS.open;
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('a11y-open')) {
                panel.classList.remove('a11y-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', t.openLabel);
                toggle.innerHTML = ICONS.open;
                toggle.focus();
            }
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && e.target !== toggle) {
                panel.classList.remove('a11y-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.innerHTML = ICONS.open;
            }
        });
    }

    // ── Lógica de cada botón de funcionalidad ────────────────────
    function setupFeatureButtons() {
        let state = loadState();

        // Aplicar estado guardado al cargar
        applyState(state);
        syncButtons(state);

        FEATURES.forEach(f => {
            const btn = document.getElementById(`a11y-${f.key}`);
            if (!btn) return;

            btn.addEventListener('click', () => {
                state[f.key] = !state[f.key];
                btn.setAttribute('aria-pressed', state[f.key]);
                applyState(state);
                syncButtons(state);
                saveState(state);
            });
        });

        // Reset
        document.getElementById('a11y-reset').addEventListener('click', () => {
            state = {};
            applyState(state);
            syncButtons(state);
            saveState(state);

            // Feedback visual breve
            const resetBtn = document.getElementById('a11y-reset');
            resetBtn.style.color = '#4caf50';
            setTimeout(() => resetBtn.style.color = '', 800);
        });
    }

    // ── Precargar fuente OpenDyslexic si el estado lo requiere ───
    // Para que no haya flash de fuente incorrecta al cargar la página
    function preloadDyslexicFont() {
        const state = loadState();
        if (state['dyslexia']) {
            const link = document.createElement('link');
            link.rel  = 'preload';
            link.href = 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/ttf/OpenDyslexic-Regular.ttf';
            link.as   = 'font';
            link.type = 'font/truetype';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }
    }

    // ── Init ─────────────────────────────────────────────────────
    function init() {
        preloadDyslexicFont();
        buildMenu();
        setupToggle();
        setupFeatureButtons();
    }

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
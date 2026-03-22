(function () {
    'use strict';

    // ── Traducciones ─────────────────────────────────────────────
    const i18n = {
        en: { title:'Accessibility Menu', biggerText:'Bigger text', highlightLinks:'Highlight Links', textSpacing:'Text Spacing', saturation:'Saturation', cursor:'Cursor', readingMask:'Reading Mask', dyslexia:'Dyslexia Friendly', reset:'Reset', openLabel:'Open Accessibility Menu', closeLabel:'Close Accessibility Menu' },
        es: { title:'Menú de Accesibilidad', biggerText:'Texto grande', highlightLinks:'Resaltar enlaces', textSpacing:'Espaciado', saturation:'Saturación', cursor:'Cursor', readingMask:'Máscara lectora', dyslexia:'Modo dislexia', reset:'Restablecer', openLabel:'Abrir menú de accesibilidad', closeLabel:'Cerrar menú de accesibilidad' },
        pt: { title:'Menu de Acessibilidade', biggerText:'Texto maior', highlightLinks:'Destacar links', textSpacing:'Espaçamento', saturation:'Saturação', cursor:'Cursor', readingMask:'Máscara de leitura', dyslexia:'Modo dislexia', reset:'Redefinir', openLabel:'Abrir menu de acessibilidade', closeLabel:'Fechar menu de acessibilidade' },
        fr: { title:"Menu d'accessibilité", biggerText:'Texte plus grand', highlightLinks:'Surligner liens', textSpacing:'Espacement', saturation:'Saturation', cursor:'Curseur', readingMask:'Masque de lecture', dyslexia:'Mode dyslexie', reset:'Réinitialiser', openLabel:"Ouvrir le menu d'accessibilité", closeLabel:"Fermer le menu d'accessibilité" },
        de: { title:'Barrierefreiheitsmenü', biggerText:'Größerer Text', highlightLinks:'Links hervorheben', textSpacing:'Textabstand', saturation:'Sättigung', cursor:'Cursor', readingMask:'Lesemaske', dyslexia:'Legasthenie', reset:'Zurücksetzen', openLabel:'Barrierefreiheitsmenü öffnen', closeLabel:'Barrierefreiheitsmenü schließen' },
        it: { title:'Menu Accessibilità', biggerText:'Testo più grande', highlightLinks:'Evidenzia link', textSpacing:'Spaziatura', saturation:'Saturazione', cursor:'Cursore', readingMask:'Maschera di lettura', dyslexia:'Modalità dislessia', reset:'Ripristina', openLabel:'Apri menu accessibilità', closeLabel:'Chiudi menu accessibilità' },
        ru: { title:'Меню доступности', biggerText:'Крупный текст', highlightLinks:'Выделить ссылки', textSpacing:'Интервал', saturation:'Насыщенность', cursor:'Курсор', readingMask:'Маска чтения', dyslexia:'Режим дислексии', reset:'Сбросить', openLabel:'Открыть меню доступности', closeLabel:'Закрыть меню доступности' },
        zh: { title:'无障碍菜单', biggerText:'放大文字', highlightLinks:'高亮链接', textSpacing:'文字间距', saturation:'饱和度', cursor:'光标', readingMask:'阅读遮罩', dyslexia:'阅读障碍模式', reset:'重置', openLabel:'打开无障碍菜单', closeLabel:'关闭无障碍菜单' },
        ja: { title:'アクセシビリティ', biggerText:'文字を大きく', highlightLinks:'リンク強調', textSpacing:'文字間隔', saturation:'彩度', cursor:'カーソル', readingMask:'リーディングマスク', dyslexia:'難読症モード', reset:'リセット', openLabel:'アクセシビリティメニューを開く', closeLabel:'アクセシビリティメニューを閉じる' },
        ko: { title:'접근성 메뉴', biggerText:'큰 텍스트', highlightLinks:'링크 강조', textSpacing:'텍스트 간격', saturation:'채도', cursor:'커서', readingMask:'읽기 마스크', dyslexia:'난독증 모드', reset:'초기화', openLabel:'접근성 메뉴 열기', closeLabel:'접근성 메뉴 닫기' },
        ar: { title:'قائمة إمكانية الوصول', biggerText:'نص أكبر', highlightLinks:'تمييز الروابط', textSpacing:'تباعد النص', saturation:'التشبع', cursor:'المؤشر', readingMask:'قناع القراءة', dyslexia:'وضع عسر القراءة', reset:'إعادة تعيين', openLabel:'فتح قائمة إمكانية الوصول', closeLabel:'إغلاق قائمة إمكانية الوصول' },
        hi: { title:'अभिगम्यता मेनू', biggerText:'बड़ा टेक्स्ट', highlightLinks:'लिंक हाइलाइट', textSpacing:'स्पेसिंग', saturation:'संतृप्ति', cursor:'कर्सर', readingMask:'रीडिंग मास्क', dyslexia:'डिस्लेक्सिया', reset:'रीसेट', openLabel:'अभिगम्यता मेनू खोलें', closeLabel:'अभिगम्यता मेनू बंद करें' },
        th: { title:'เมนูการเข้าถึง', biggerText:'ข้อความใหญ่', highlightLinks:'เน้นลิงก์', textSpacing:'ระยะห่าง', saturation:'ความอิ่มตัว', cursor:'เคอร์เซอร์', readingMask:'หน้ากากอ่าน', dyslexia:'โหมดดิสเล็กเซีย', reset:'รีเซ็ต', openLabel:'เปิดเมนูการเข้าถึง', closeLabel:'ปิดเมนูการเข้าถึง' },
        ms: { title:'Menu Kebolehcapaian', biggerText:'Teks Besar', highlightLinks:'Sorot Pautan', textSpacing:'Jarak Teks', saturation:'Ketepuan', cursor:'Kursor', readingMask:'Topeng Bacaan', dyslexia:'Mod Disleksia', reset:'Set Semula', openLabel:'Buka Menu Kebolehcapaian', closeLabel:'Tutup Menu Kebolehcapaian' },
        id: { title:'Menu Aksesibilitas', biggerText:'Teks Lebih Besar', highlightLinks:'Sorot Tautan', textSpacing:'Spasi Teks', saturation:'Saturasi', cursor:'Kursor', readingMask:'Masker Baca', dyslexia:'Mode Disleksia', reset:'Reset', openLabel:'Buka Menu Aksesibilitas', closeLabel:'Tutup Menu Aksesibilitas' },
        tl: { title:'Accessibility Menu', biggerText:'Mas Malaking Text', highlightLinks:'I-highlight Links', textSpacing:'Espasyo ng Text', saturation:'Saturation', cursor:'Cursor', readingMask:'Reading Mask', dyslexia:'Dyslexia Mode', reset:'I-reset', openLabel:'Buksan ang Accessibility Menu', closeLabel:'Isara ang Accessibility Menu' },
        vi: { title:'Menu Trợ Năng', biggerText:'Văn bản lớn hơn', highlightLinks:'Làm nổi bật liên kết', textSpacing:'Giãn cách', saturation:'Độ bão hòa', cursor:'Con trỏ', readingMask:'Mặt nạ đọc', dyslexia:'Chế độ khó đọc', reset:'Đặt lại', openLabel:'Mở menu trợ năng', closeLabel:'Đóng menu trợ năng' },
    };

    const pageLang = document.documentElement.lang || 'en';
    const t = i18n[pageLang] || i18n['en'];

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
            maxStage: 3,
            stageClasses: ['a11y-saturation-1','a11y-saturation-2','a11y-saturation-3'],
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

    // ── Reading Mask logic ───────────────────────────────────────
    // Crea un overlay fixed con gradiente que deja visible solo
    // una franja horizontal de ~80px alrededor del cursor
    const MASK_HEIGHT = 80; // px — altura de la franja visible
    let maskEl = null;
    let maskMoveHandler = null;

    function ensureMaskEl() {
        if (!maskEl) {
            maskEl = document.createElement('div');
            maskEl.id = 'a11y-reading-mask';
            document.body.appendChild(maskEl);
        }
        return maskEl;
    }

    function updateMask(e) {
        const el = ensureMaskEl();
        const vh = window.innerHeight;
        const y = e.clientY;

        // Calcular los porcentajes de la franja visible
        const topPct    = Math.max(0, ((y - MASK_HEIGHT / 2) / vh) * 100).toFixed(2);
        const bottomPct = Math.min(100, ((y + MASK_HEIGHT / 2) / vh) * 100).toFixed(2);

        el.style.background = `linear-gradient(
            to bottom,
            rgba(0,0,0,0.88) 0%,
            rgba(0,0,0,0.88) ${topPct}%,
            transparent ${topPct}%,
            transparent ${bottomPct}%,
            rgba(0,0,0,0.88) ${bottomPct}%,
            rgba(0,0,0,0.88) 100%
        )`;
    }

    function toggleReadingMask(active) {
        const el = ensureMaskEl();
        if (active) {
            el.style.display = 'block';
            if (!maskMoveHandler) {
                maskMoveHandler = (e) => updateMask(e);
                document.addEventListener('mousemove', maskMoveHandler, { passive: true });
            }
        } else {
            el.style.display = 'none';
            if (maskMoveHandler) {
                document.removeEventListener('mousemove', maskMoveHandler);
                maskMoveHandler = null;
            }
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
        'close':           `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        'open':            `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
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
            toggle.innerHTML = isOpen ? ICONS.close : ICONS.open;
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('a11y-open')) {
                panel.classList.remove('a11y-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', t.openLabel);
                toggle.innerHTML = ICONS.open;
                toggle.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !toggle.contains(e.target)) {
                panel.classList.remove('a11y-open');
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
        preloadDyslexicFont();
        buildMenu();
        setupToggle();
        setupFeatureButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
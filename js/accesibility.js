(function () {
    'use strict';

    // ── Traducciones ─────────────────────────────────────────────
    const i18n = {
        en: { title:'Accessibility', biggerText:'Bigger Text', highlightLinks:'Highlight Links', textSpacing:'Text Spacing', saturation:'Saturation', cursor:'Big Cursor', dyslexia:'Dyslexia Friendly', reset:'Reset', openLabel:'Open Accessibility Menu', closeLabel:'Close Accessibility Menu' },
        es: { title:'Accesibilidad', biggerText:'Texto grande', highlightLinks:'Resaltar enlaces', textSpacing:'Espaciado', saturation:'Saturación', cursor:'Cursor grande', dyslexia:'Modo dislexia', reset:'Restablecer', openLabel:'Abrir menú de accesibilidad', closeLabel:'Cerrar menú de accesibilidad' },
        pt: { title:'Acessibilidade', biggerText:'Texto maior', highlightLinks:'Destacar links', textSpacing:'Espaçamento', saturation:'Saturação', cursor:'Cursor grande', dyslexia:'Modo dislexia', reset:'Redefinir', openLabel:'Abrir menu de acessibilidade', closeLabel:'Fechar menu de acessibilidade' },
        fr: { title:'Accessibilité', biggerText:'Texte plus grand', highlightLinks:'Surligner liens', textSpacing:'Espacement', saturation:'Saturation', cursor:'Grand curseur', dyslexia:'Mode dyslexie', reset:'Réinitialiser', openLabel:"Ouvrir le menu d'accessibilité", closeLabel:"Fermer le menu d'accessibilité" },
        de: { title:'Barrierefreiheit', biggerText:'Größerer Text', highlightLinks:'Links hervorheben', textSpacing:'Textabstand', saturation:'Sättigung', cursor:'Großer Cursor', dyslexia:'Legasthenie', reset:'Zurücksetzen', openLabel:'Barrierefreiheitsmenü öffnen', closeLabel:'Barrierefreiheitsmenü schließen' },
        it: { title:'Accessibilità', biggerText:'Testo più grande', highlightLinks:'Evidenzia link', textSpacing:'Spaziatura', saturation:'Saturazione', cursor:'Cursore grande', dyslexia:'Modalità dislessia', reset:'Ripristina', openLabel:'Apri menu accessibilità', closeLabel:'Chiudi menu accessibilità' },
        ru: { title:'Доступность', biggerText:'Крупный текст', highlightLinks:'Выделить ссылки', textSpacing:'Интервал', saturation:'Насыщенность', cursor:'Крупный курсор', dyslexia:'Режим дислексии', reset:'Сбросить', openLabel:'Открыть меню доступности', closeLabel:'Закрыть меню доступности' },
        zh: { title:'无障碍', biggerText:'放大文字', highlightLinks:'高亮链接', textSpacing:'文字间距', saturation:'饱和度', cursor:'大光标', dyslexia:'阅读障碍模式', reset:'重置', openLabel:'打开无障碍菜单', closeLabel:'关闭无障碍菜单' },
        ja: { title:'アクセシビリティ', biggerText:'文字を大きく', highlightLinks:'リンク強調', textSpacing:'文字間隔', saturation:'彩度', cursor:'大カーソル', dyslexia:'難読症モード', reset:'リセット', openLabel:'アクセシビリティメニューを開く', closeLabel:'アクセシビリティメニューを閉じる' },
        ko: { title:'접근성', biggerText:'큰 텍스트', highlightLinks:'링크 강조', textSpacing:'텍스트 간격', saturation:'채도', cursor:'큰 커서', dyslexia:'난독증 모드', reset:'초기화', openLabel:'접근성 메뉴 열기', closeLabel:'접근성 메뉴 닫기' },
        ar: { title:'إمكانية الوصول', biggerText:'نص أكبر', highlightLinks:'تمييز الروابط', textSpacing:'تباعد النص', saturation:'التشبع', cursor:'مؤشر كبير', dyslexia:'وضع عسر القراءة', reset:'إعادة تعيين', openLabel:'فتح قائمة إمكانية الوصول', closeLabel:'إغلاق قائمة إمكانية الوصول' },
        hi: { title:'अभिगम्यता', biggerText:'बड़ा टेक्स्ट', highlightLinks:'लिंक हाइलाइट', textSpacing:'स्पेसिंग', saturation:'संतृप्ति', cursor:'बड़ा कर्सर', dyslexia:'डिस्लेक्सिया', reset:'रीसेट', openLabel:'अभिगम्यता मेनू खोलें', closeLabel:'अभिगम्यता मेनू बंद करें' },
        th: { title:'การเข้าถึง', biggerText:'ข้อความใหญ่', highlightLinks:'เน้นลิงก์', textSpacing:'ระยะห่าง', saturation:'ความอิ่มตัว', cursor:'เคอร์เซอร์ใหญ่', dyslexia:'โหมดดิสเล็กเซีย', reset:'รีเซ็ต', openLabel:'เปิดเมนูการเข้าถึง', closeLabel:'ปิดเมนูการเข้าถึง' },
        ms: { title:'Kebolehcapaian', biggerText:'Teks Besar', highlightLinks:'Sorot Pautan', textSpacing:'Jarak Teks', saturation:'Ketepuan', cursor:'Kursor Besar', dyslexia:'Mod Disleksia', reset:'Set Semula', openLabel:'Buka Menu Kebolehcapaian', closeLabel:'Tutup Menu Kebolehcapaian' },
        id: { title:'Aksesibilitas', biggerText:'Teks Lebih Besar', highlightLinks:'Sorot Tautan', textSpacing:'Spasi Teks', saturation:'Saturasi', cursor:'Kursor Besar', dyslexia:'Mode Disleksia', reset:'Reset', openLabel:'Buka Menu Aksesibilitas', closeLabel:'Tutup Menu Aksesibilitas' },
        tl: { title:'Accessibility', biggerText:'Mas Malaking Text', highlightLinks:'I-highlight Links', textSpacing:'Espasyo ng Text', saturation:'Saturation', cursor:'Malaking Cursor', dyslexia:'Dyslexia Mode', reset:'I-reset', openLabel:'Buksan ang Accessibility Menu', closeLabel:'Isara ang Accessibility Menu' },
        vi: { title:'Khả năng truy cập', biggerText:'Văn bản lớn hơn', highlightLinks:'Làm nổi bật liên kết', textSpacing:'Giãn cách', saturation:'Độ bão hòa', cursor:'Con trỏ lớn', dyslexia:'Chế độ khó đọc', reset:'Đặt lại', openLabel:'Mở menu trợ năng', closeLabel:'Đóng menu trợ năng' },
    };

    const pageLang = document.documentElement.lang || 'en';
    const t = i18n[pageLang] || i18n['en'];

    // ── Configuración de staged features ────────────────────────
    // Cada feature define cuántos stages tiene y las clases CSS
    // que aplica en cada uno. Stage 0 = off (sin clase).
    const FEATURES = [
        {
            key: 'bigger-text',
            label: () => t.biggerText,
            maxStage: 3,
            stageClasses: ['a11y-bigger-text-1', 'a11y-bigger-text-2', 'a11y-bigger-text-3'],
            stageLabels: ['1×', '2×', '3×'],
        },
        {
            key: 'highlight-links',
            label: () => t.highlightLinks,
            maxStage: 2,
            stageClasses: ['a11y-highlight-links-1', 'a11y-highlight-links-2'],
            stageLabels: ['·', '●'],
        },
        {
            key: 'text-spacing',
            label: () => t.textSpacing,
            maxStage: 3,
            stageClasses: ['a11y-text-spacing-1', 'a11y-text-spacing-2', 'a11y-text-spacing-3'],
            stageLabels: ['1×', '2×', '3×'],
        },
        {
            key: 'saturation',
            label: () => t.saturation,
            maxStage: 3,
            stageClasses: ['a11y-saturation-1', 'a11y-saturation-2', 'a11y-saturation-3'],
            stageLabels: ['−', '−−', 'B/N'],
        },
        {
            key: 'big-cursor',
            label: () => t.cursor,
            maxStage: 2,
            stageClasses: ['a11y-big-cursor-1', 'a11y-big-cursor-2'],
            stageLabels: ['M', 'L'],
        },
        {
            key: 'dyslexia',
            label: () => t.dyslexia,
            maxStage: 2,
            stageClasses: ['a11y-dyslexia-1', 'a11y-dyslexia-2'],
            stageLabels: ['·', 'Aa'],
        },
    ];

    const LS_KEY = 'insane_a11y_v2';

    function loadState() {
        try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
        catch { return {}; }
    }
    function saveState(s) {
        try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
    }

    // Aplica todas las clases al body según el estado actual
    function applyState(state) {
        FEATURES.forEach(f => {
            const currentStage = state[f.key] || 0;
            f.stageClasses.forEach((cls, i) => {
                document.body.classList.toggle(cls, i + 1 === currentStage);
            });
        });
    }

    // Sincroniza el aspecto visual de cada botón con su stage actual
    function syncButtons(state) {
        FEATURES.forEach(f => {
            const btn = document.getElementById(`a11y-btn-${f.key}`);
            if (!btn) return;
            const stage = state[f.key] || 0;

            // Limpiar clases de stage previas
            btn.classList.remove('a11y-stage-1', 'a11y-stage-2', 'a11y-stage-3');
            if (stage > 0) btn.classList.add(`a11y-stage-${stage}`);

            // Actualizar badge
            const badge = btn.querySelector('.a11y-badge');
            if (badge) {
                badge.textContent = stage > 0 ? f.stageLabels[stage - 1] : '';
            }

            // Actualizar aria-pressed
            btn.setAttribute('aria-pressed', stage > 0 ? 'true' : 'false');
        });
    }

    // ── SVG Icons ────────────────────────────────────────────────
    const ICONS = {
        'bigger-text':     `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="1" y="17" font-size="15" font-family="sans-serif" font-weight="bold">A</text><text x="13" y="13" font-size="9" font-family="sans-serif">A</text></svg>`,
        'highlight-links': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
        'text-spacing':    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="11" y2="18"/><polyline points="14 15 17 18 14 21"/></svg>`,
        'saturation':      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>`,
        'big-cursor':      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 8-7 2-4 7z"/></svg>`,
        'dyslexia':        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h10M4 17h13"/><circle cx="19" cy="17" r="2" fill="currentColor" stroke="none"/></svg>`,
        'reset':           `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
        'close':           `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        'open':            `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
    };

    // ── Construir DOM ────────────────────────────────────────────
    function buildMenu() {
        // Botón flotante — el SVG tiene pointer-events:none en el CSS
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
        panel.innerHTML = `<h2>${t.title}</h2>`;

        FEATURES.forEach(f => {
            const btn = document.createElement('button');
            btn.id = `a11y-btn-${f.key}`;
            btn.className = 'a11y-btn';
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-pressed', 'false');
            // Badge para mostrar el nivel actual
            btn.innerHTML = `${ICONS[f.key]}<span class="a11y-label">${f.label()}</span><span class="a11y-badge"></span>`;
            panel.appendChild(btn);
        });

        const sep = document.createElement('div');
        sep.className = 'a11y-separator';
        panel.appendChild(sep);

        const reset = document.createElement('button');
        reset.id = 'a11y-reset';
        reset.className = 'a11y-btn';
        reset.setAttribute('type', 'button');
        reset.innerHTML = `${ICONS.reset}<span>${t.reset}</span>`;
        panel.appendChild(reset);

        document.body.appendChild(toggle);
        document.body.appendChild(panel);
    }

    // ── Toggle del panel ─────────────────────────────────────────
    function setupToggle() {
        const toggle = document.getElementById('a11y-toggle');
        const panel  = document.getElementById('a11y-panel');

        // FIX click area: usar mousedown en lugar de click
        // para evitar que el SVG interno capture el evento
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
            if (!panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
                panel.classList.remove('a11y-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.innerHTML = ICONS.open;
            }
        });
    }

    // ── Lógica de staged features ────────────────────────────────
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
                // Avanzar al siguiente stage, volver a 0 si se supera el máximo
                state[f.key] = (current + 1) > f.maxStage ? 0 : current + 1;
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
            const originalHTML = btn.innerHTML;
            btn.style.color = '#4caf50';
            setTimeout(() => {
                btn.style.color = '';
            }, 700);
        });
    }

    // ── Precargar OpenDyslexic si ya estaba activo ───────────────
    function preloadDyslexicFont() {
        const state = loadState();
        if ((state['dyslexia'] || 0) >= 2) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/ttf/OpenDyslexic-Regular.ttf';
            link.as = 'font';
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
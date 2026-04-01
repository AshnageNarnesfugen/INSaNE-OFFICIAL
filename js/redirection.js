/**
 * redirection.js — INSaNE | A Broken Hero
 *
 * Vanilla JS — no jQuery dependency.
 *
 * Includes:
 *  1. fetchGeoIP     — HTTPS geo-IP lookup (post-consent only)
 *  2. GDPRConsent    — granular cookie consent panel (GSAP animated, global)
 *  3. cookieManager  — language-based geo-redirect
 *
 * Cookie categories:
 *  - necessary   : always active (session, language, redirect)
 *  - analytics   : usage tracking (disabled by default)
 *  - functional  : preferences, personalisation (disabled by default)
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    //  CONSTANTS
    // ═══════════════════════════════════════════════════════════

    const CONSENT_COOKIE  = 'insane_gdpr_consent';
    const CONSENT_VERSION = '1';
    const CONSENT_EXPIRES = 365;
    const GTM_ID          = 'GTM-KP3R25CS';

    // ═══════════════════════════════════════════════════════════
    //  GTM — LOAD AS EARLY AS POSSIBLE
    //  Runs synchronously at parse time. No DOM needed, no
    //  data-loader, no promises. Just reads document.cookie
    //  and injects GTM via document.write-free snippet.
    // ═══════════════════════════════════════════════════════════

    // 1. Consent Mode v2 defaults — must come before ANY Google tag
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('consent', 'default', {
        analytics_storage:  'denied',
        ad_storage:         'denied',
        ad_user_data:       'denied',
        ad_personalization: 'denied',
        wait_for_update:    500
    });

    // 2. Read consent cookie directly (no helpers needed yet)
    let gtmLoaded = false;
    function readConsentCookie() {
        try {
            const m = document.cookie.match(
                /(?:^|; )insane_gdpr_consent=([^;]*)/
            );
            if (!m) return null;
            const parsed = JSON.parse(decodeURIComponent(m[1]));
            if (parsed.version !== CONSENT_VERSION) return null;
            return parsed;
        } catch(e) { return null; }
    }

    function loadGTM() {
        if (gtmLoaded) return;
        gtmLoaded = true;

        // Grant analytics
        gtag('consent', 'update', { analytics_storage: 'granted' });

        // Inject GTM
        window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

        var j  = document.createElement('script');
        j.async = true;
        j.src   = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
        j.onload = function () {
            window.dataLayer.push({
                event:      'delayed_pageview',
                page_path:  location.pathname + location.search,
                page_title: document.title
            });
        };

        // Insert into <head> — works even before DOMContentLoaded
        // because <head> exists as soon as the parser reaches this script.
        document.head.appendChild(j);
        console.log('[GTM] Injected synchronously at parse time.');
    }

    // 3. If consent already exists, load GTM RIGHT NOW
    var earlyConsent = readConsentCookie();
    if (earlyConsent && earlyConsent.analytics) {
        loadGTM();
    }

    // ═══════════════════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════════════════

    /** Minimal cookie helpers (replaces js-cookie for this file) */
    const MiniCookie = {
        get(name) {
            const match = document.cookie.match(
                new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
            );
            return match ? decodeURIComponent(match[1]) : undefined;
        },
        set(name, value, opts = {}) {
            let str = encodeURIComponent(name) + '=' + encodeURIComponent(value);
            if (opts.expires) {
                const d = new Date();
                d.setDate(d.getDate() + opts.expires);
                str += '; expires=' + d.toUTCString();
            }
            if (opts.path)     str += '; path=' + opts.path;
            if (opts.domain)   str += '; domain=' + opts.domain;
            if (opts.secure)   str += '; Secure';
            if (opts.sameSite) str += '; SameSite=' + opts.sameSite;
            document.cookie = str;
        },
        remove(name, opts = {}) {
            this.set(name, '', { ...opts, expires: -1 });
        }
    };

    /** querySelector shortcuts */
    const $ = (sel, root) => (root || document).querySelector(sel);

    /** Safe JSON parse */
    function tryParse(str) {
        try { return JSON.parse(str); } catch { return null; }
    }

    // ═══════════════════════════════════════════════════════════
    //  GEO-IP (HTTPS, post-consent only)
    // ═══════════════════════════════════════════════════════════

    const GeoIP = (function () {
        const URL  = 'https://ipapi.co/json/';
        const WAIT = 6000;
        let pending = null;

        function fetchGeo() {
            if (window.__geoip) return Promise.resolve(window.__geoip);
            if (pending) return pending;

            pending = new Promise(function (resolve) {
                const fallback = { country_code: null };
                const timer = setTimeout(() => { pending = null; resolve(fallback); }, WAIT);

                fetch(URL)
                    .then(r => r.json())
                    .then(data => {
                        clearTimeout(timer);
                        const result = { country_code: data.country_code || data.countryCode || null };
                        window.__geoip = result;
                        resolve(result);
                    })
                    .catch(() => {
                        clearTimeout(timer);
                        pending = null;
                        resolve(fallback);
                    });
            });
            return pending;
        }

        // Keep global for external code that may call it
        window.fetchGeoIP = fetchGeo;
        return { fetch: fetchGeo };
    })();

    // ═══════════════════════════════════════════════════════════
    //  GDPR CONSENT MANAGER
    // ═══════════════════════════════════════════════════════════

    const GDPRConsent = (function () {

        // ── i18n ──────────────────────────────────────────────
        function getLabels(lang) {
            const data = ((window.INSaNE_DATA || {})['gdpr-panel'] || {}).labels || {};
            return data[lang] || data['en'] || {
                title: 'Cookie Preferences',
                intro: 'We use cookies to improve your experience.',
                necessary: 'Necessary',
                necessaryD: 'Required for the site to function.',
                analytics: 'Analytics',
                analyticsD: 'Help us understand how visitors interact.',
                functional: 'Functional',
                functionalD: 'Remember your preferences.',
                acceptAll: 'Accept All',
                saveChoice: 'Save My Choices',
                rejectAll: 'Reject All',
                policy: 'Privacy Policy',
                policyLink: '#privacy-policy',
                alwaysOn: 'Always on'
            };
        }

        // Path aliases: /jp → ja, /kr → ko
        const normMap = { jp: 'ja', kr: 'ko' };

        // Detect panel language lazily (called at build time, not at
        // IIFE init time, so the JSON is guaranteed to be loaded).
        //
        // Priority: page path always wins.
        //  1. Path segment (/es → es, /jp → ja, /kr → ko …)
        //  2. Root path / → 'en' (English homepage)
        //  3. 'en' as final fallback
        function detectLang() {
            const labels = ((window.INSaNE_DATA || {})['gdpr-panel'] || {}).labels || {};
            const available = Object.keys(labels);

            // Extract first path segment: "/es/foo" → "es", "/" → ""
            const seg = window.location.pathname.split('/')[1];

            if (seg) {
                const normed = normMap[seg] || seg;
                if (available.includes(normed)) return normed;
            }

            // No segment (root /) or unrecognised segment → English
            return 'en';
        }

        /** Resolve labels right now (call only after JSON is loaded) */
        function resolveLabels() {
            return getLabels(detectLang());
        }

        // ── Read / write consent ──────────────────────────────
        function getConsent() {
            const raw = MiniCookie.get(CONSENT_COOKIE);
            if (!raw) return null;
            const parsed = tryParse(raw);
            if (!parsed || parsed.version !== CONSENT_VERSION) return null;
            return parsed;
        }

        function saveConsent(analytics, functional) {
            const consent = {
                version:    CONSENT_VERSION,
                timestamp:  new Date().toISOString(),
                necessary:  true,
                analytics:  !!analytics,
                functional: !!functional,
            };
            MiniCookie.set(CONSENT_COOKIE, JSON.stringify(consent), {
                expires:  CONSENT_EXPIRES,
                path:     '/',
                secure:   true,
                sameSite: 'Strict',
            });
            return consent;
        }

        // ── Inject toggle CSS (once) ──────────────────────────
        function injectStyles() {
            if (document.getElementById('gdpr-toggle-styles')) return;
            const style = document.createElement('style');
            style.id = 'gdpr-toggle-styles';
            style.textContent = `
                .gdpr-toggle{cursor:pointer}
                .gdpr-toggle-track{
                    display:block;width:42px;height:24px;
                    background:rgba(255,255,255,.15);
                    border-radius:12px;position:relative;
                    transition:background .25s}
                .gdpr-toggle-track::after{
                    content:'';position:absolute;
                    top:3px;left:3px;width:18px;height:18px;
                    background:#fff;border-radius:50%;
                    transition:transform .25s,background .25s;
                    box-shadow:0 1px 4px rgba(0,0,0,.4)}
                .gdpr-toggle input:checked+.gdpr-toggle-track{background:#e83b2e}
                .gdpr-toggle input:checked+.gdpr-toggle-track::after{transform:translateX(18px)}
                #gdpr-accept-all:hover{opacity:.88}
                #gdpr-save:hover{opacity:.88}
                #gdpr-reject-all:hover{color:rgba(255,255,255,.75)!important}
                @media(max-width:480px){#gdpr-card{padding:22px 16px 18px!important}}
            `;
            document.head.appendChild(style);
        }

        // ── Build panel DOM ───────────────────────────────────
        function categoryRow(t, label, desc, checkboxId, alwaysOn) {
            const catStyle = `display:flex;align-items:flex-start;gap:12px;
                              background:rgba(255,255,255,.04);
                              border:1px solid rgba(255,255,255,.08);
                              border-radius:10px;padding:12px 14px`;

            const right = alwaysOn
                ? `<span style="font-size:11px;font-weight:600;color:#4caf50;
                               background:rgba(76,175,80,.12);
                               border:1px solid rgba(76,175,80,.25);
                               border-radius:20px;padding:3px 10px;
                               white-space:nowrap;flex-shrink:0;align-self:center">
                       ${t.alwaysOn}</span>`
                : `<label class="gdpr-toggle" style="flex-shrink:0;align-self:center">
                       <input type="checkbox" id="${checkboxId}" style="display:none">
                       <span class="gdpr-toggle-track"></span>
                   </label>`;

            return `<div class="gdpr-cat" style="${catStyle}">
                        <div style="flex:1">
                            <div style="font-size:13px;font-weight:600;color:#fff;
                                        margin-bottom:3px">${label}</div>
                            <div style="font-size:12px;color:rgba(255,255,255,.5);
                                        line-height:1.4">${desc}</div>
                        </div>
                        ${right}
                    </div>`;
        }

        function buildPanel() {
            injectStyles();

            // Resolve labels NOW — boot() has already ensured JSON is loaded
            const t = resolveLabels();

            const panel = document.createElement('div');
            panel.id = 'gdpr-panel';
            panel.setAttribute('role', 'dialog');
            panel.setAttribute('aria-modal', 'true');
            panel.setAttribute('aria-label', t.title);
            Object.assign(panel.style, {
                display: 'none', position: 'fixed', inset: '0',
                zIndex: '2147483646',
                alignItems: 'flex-end', justifyContent: 'center',
                padding: '0 0 24px', pointerEvents: 'none'
            });

            panel.innerHTML = `
                <div id="gdpr-backdrop"
                     style="position:absolute;inset:0;
                            background:rgba(0,0,0,.6);
                            backdrop-filter:blur(4px);
                            -webkit-backdrop-filter:blur(4px);
                            opacity:0;pointer-events:auto"></div>

                <div id="gdpr-card"
                     style="position:relative;pointer-events:auto;
                            width:100%;max-width:560px;margin:0 16px;
                            background:#111;color:#f5f5f5;
                            border:1px solid rgba(255,255,255,.1);
                            border-radius:14px;padding:28px 24px 22px;
                            box-shadow:0 20px 60px rgba(0,0,0,.8);
                            font-family:inherit;
                            transform:translateY(40px);opacity:0">

                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="#e83b2e" stroke-width="2" style="flex-shrink:0">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <h2 style="margin:0;font-size:16px;font-weight:700;color:#fff">
                            ${t.title}</h2>
                    </div>

                    <p style="margin:0 0 20px;font-size:13px;line-height:1.6;
                              color:rgba(255,255,255,.65)">
                        ${t.intro}
                        <a href="${t.policyLink}"
                           style="color:#e83b2e;text-decoration:underline;margin-left:4px"
                           target="_blank" rel="noopener">${t.policy}</a>
                    </p>

                    <div id="gdpr-categories"
                         style="display:flex;flex-direction:column;gap:10px;margin-bottom:22px">
                        ${categoryRow(t, t.necessary, t.necessaryD, null, true)}
                        ${categoryRow(t, t.analytics, t.analyticsD, 'gdpr-analytics')}
                        ${categoryRow(t, t.functional, t.functionalD, 'gdpr-functional')}
                    </div>

                    <div style="display:flex;flex-wrap:wrap;gap:8px">
                        <button id="gdpr-accept-all"
                                style="flex:1;min-width:120px;padding:10px 16px;
                                       background:#e83b2e;color:#fff;border:none;
                                       border-radius:8px;font-size:13px;font-weight:600;
                                       cursor:pointer;transition:opacity .2s">
                            ${t.acceptAll}</button>
                        <button id="gdpr-save"
                                style="flex:1;min-width:120px;padding:10px 16px;
                                       background:rgba(255,255,255,.08);color:#fff;
                                       border:1px solid rgba(255,255,255,.15);
                                       border-radius:8px;font-size:13px;font-weight:600;
                                       cursor:pointer;transition:opacity .2s">
                            ${t.saveChoice}</button>
                        <button id="gdpr-reject-all"
                                style="width:100%;padding:8px 16px;background:transparent;
                                       color:rgba(255,255,255,.4);border:none;
                                       border-radius:8px;font-size:12px;cursor:pointer;
                                       transition:color .2s">
                            ${t.rejectAll}</button>
                    </div>
                </div>`;

            document.body.appendChild(panel);
            return panel;
        }

        // ── Animate in / out ──────────────────────────────────
        // GSAP when available, instant fallback otherwise.

        function showPanel(panel, onDone) {
            panel.style.display = 'flex';

            if (typeof gsap !== 'undefined') {
                const tl = gsap.timeline();
                tl.to('#gdpr-backdrop', { opacity: 1, duration: 0.35, ease: 'power2.out' })
                  .to('#gdpr-card', { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' }, '-=0.2')
                  .call(() => { focusFirst(panel); onDone && onDone(); });
            } else {
                const backdrop = $('#gdpr-backdrop', panel);
                const card     = $('#gdpr-card', panel);
                if (backdrop) backdrop.style.opacity = '1';
                if (card) { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }
                focusFirst(panel);
                onDone && onDone();
            }
        }

        function hidePanel(panel, onComplete) {
            if (typeof gsap !== 'undefined') {
                const tl = gsap.timeline({
                    onComplete() { panel.style.display = 'none'; onComplete && onComplete(); }
                });
                tl.to('#gdpr-card', { opacity: 0, y: 30, duration: 0.3, ease: 'power2.in' })
                  .to('#gdpr-backdrop', { opacity: 0, duration: 0.25, ease: 'power2.in' }, '-=0.15');
            } else {
                panel.style.display = 'none';
                onComplete && onComplete();
            }
        }

        function focusFirst(panel) {
            const btn = $('#gdpr-accept-all', panel);
            if (btn) btn.focus();
        }

        // ── Keyboard handler ref ──────────────────────────────
        let escHandler = null;

        // ── Public API ────────────────────────────────────────
        return {
            init(onConsent) {
                const existing = getConsent();
                if (existing) { onConsent(existing); return; }

                const old = document.getElementById('gdpr-panel');
                if (old) old.remove();

                const panel = buildPanel();
                showPanel(panel);

                let choiceMade = false;

                function handleChoice(analytics, functional) {
                    if (choiceMade) return;
                    choiceMade = true;
                    const consent = saveConsent(analytics, functional);
                    if (escHandler) {
                        document.removeEventListener('keydown', escHandler);
                        escHandler = null;
                    }
                    hidePanel(panel, () => onConsent(consent));
                }

                function saveCurrentToggles() {
                    const a = $('#gdpr-analytics', panel);
                    const f = $('#gdpr-functional', panel);
                    handleChoice(a && a.checked, f && f.checked);
                }

                $('#gdpr-accept-all', panel).addEventListener('click', () => {
                    const a = $('#gdpr-analytics', panel);
                    const f = $('#gdpr-functional', panel);
                    if (a) a.checked = true;
                    if (f) f.checked = true;
                    handleChoice(true, true);
                });

                $('#gdpr-save', panel).addEventListener('click', saveCurrentToggles);

                $('#gdpr-reject-all', panel).addEventListener('click', () => {
                    handleChoice(false, false);
                });

                $('#gdpr-backdrop', panel).addEventListener('click', saveCurrentToggles);

                escHandler = (e) => { if (e.key === 'Escape') saveCurrentToggles(); };
                document.addEventListener('keydown', escHandler);
            },

            get()            { return getConsent(); },
            allows(category) { const c = getConsent(); return c ? !!c[category] : false; }
        };
    })();

    // ═══════════════════════════════════════════════════════════
    //  COOKIE MANAGER (language geo-redirect)
    // ═══════════════════════════════════════════════════════════

    const CookieManager = {
        run(langCases, baseUrl) {
            console.log('[CM] run() — has_been_redirected:',
                sessionStorage.getItem('has_been_redirected'),
                '| language:', MiniCookie.get('language'));

            if (sessionStorage.getItem('has_been_redirected') === 'true') {
                if (!MiniCookie.get('language')) {
                    sessionStorage.removeItem('has_been_redirected');
                    console.log('[CM] Stale redirect flag cleared — retrying.');
                } else {
                    console.log('[CM] Already redirected — skipping.');
                    return;
                }
            }

            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('language') && urlParams.has('browserLanguage')) {
                console.log('[CM] URL already has language params — skipping.');
                return;
            }

            const language = MiniCookie.get('language');
            console.log('[CM] language cookie:', language);

            if (language && langCases.hasOwnProperty(language)) {
                const entry = langCases[language];
                console.log('[CM] Known language:', language, '— verifying country');

                GeoIP.fetch().then(data => {
                    const country = entry[1].includes(data.country_code)
                        ? data.country_code : null;

                    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
                    const targetPath  = entry[0].replace(/\/+$/, '') || '/';

                    if (currentPath !== targetPath) {
                        sessionStorage.setItem('has_been_redirected', 'true');
                        const p = new URLSearchParams();
                        p.set('language', language);
                        if (country) p.set('country', country);
                        window.location.href = baseUrl + entry[0] + '?' + p.toString();
                    }
                }).catch(() => console.warn('[CM] Country verify failed.'));
                return;
            }

            GeoIP.fetch().then(data => {
                console.log('[CM] GeoIP result:', JSON.stringify(data));
                const browserLang = (navigator.language || navigator.userLanguage)
                    .split('-')[0].toUpperCase();
                this._matchAndRedirect(langCases, baseUrl, data, language, browserLang);
            }).catch(() => {
                const browserLang = (navigator.language || navigator.userLanguage)
                    .split('-')[0].toUpperCase();
                this._matchAndRedirect(langCases, baseUrl, {}, null, browserLang);
            });
        },

        _matchAndRedirect(langCases, baseUrl, data, language, browserLang) {
            const userCountry = data.country_code;

            for (const [key, value] of Object.entries(langCases)) {
                if (key === userCountry || value[1].includes(userCountry)) {
                    if (language !== userCountry) {
                        this._redirect(langCases, baseUrl, key, data, browserLang);
                    }
                    return;
                }
            }
            this._redirect(langCases, baseUrl, userCountry, data, browserLang);
        },

        _redirect(langCases, baseUrl, lang, data, browserLang) {
            const finalLang = lang || browserLang;
            if (!finalLang) return;

            const userCountry = (data.country_code && data.country_code !== 'null')
                ? data.country_code : null;

            const cookieDomain = baseUrl.replace(/^https?:\/\//, '').split('/')[0];
            const cookieOpts = {
                expires: CONSENT_EXPIRES, path: '/',
                domain: cookieDomain, secure: true, sameSite: 'Strict'
            };

            MiniCookie.set('language', finalLang, cookieOpts);
            if (userCountry) MiniCookie.set('country', userCountry, cookieOpts);
            sessionStorage.setItem('has_been_redirected', 'true');

            let redirectPath = '';
            for (const [key, value] of Object.entries(langCases)) {
                if (key === finalLang) { redirectPath = value[0]; break; }
            }

            const base   = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const path   = redirectPath.startsWith('/') ? redirectPath.slice(1) : redirectPath;
            const params = new URLSearchParams();
            params.set('language', finalLang);
            if (userCountry)  params.set('country', userCountry);
            if (browserLang)  params.set('browserLanguage', browserLang);

            window.location.href = base + '/' + path + '?' + params.toString();
        }
    };

    // ═══════════════════════════════════════════════════════════
    //  LANGUAGE CASES
    // ═══════════════════════════════════════════════════════════

    function buildCustomCases() {
        const raw = ((window.INSaNE_DATA || {})['lang-cases'] || {}).cases || {};
        if (Object.keys(raw).length) {
            return Object.fromEntries(
                Object.entries(raw).map(([k, v]) => [k, [v.path, v.countries]])
            );
        }
        return {
            'EN': ['/',   ['US', 'CA', 'AU', 'NZ', 'IE', 'ZA', 'SG']],
            'ES': ['/es', ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU']],
            'PT': ['/pt', ['PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'GQ', 'TL']],
            'JP': ['/jp', ['JP']],
            'FR': ['/fr', ['FR', 'BE', 'LU', 'MC', 'DZ', 'MA', 'TN']],
            'ZH': ['/zh', ['CN', 'HK', 'MO', 'TW']],
            'RU': ['/ru', ['RU', 'BY', 'KZ', 'KG', 'TJ', 'TM']],
            'DE': ['/de', ['DE', 'AT', 'CH', 'LI']],
            'IT': ['/it', ['IT', 'SM', 'VA']],
            'KR': ['/kr', ['KR']],
            'AR': ['/ar', ['SA', 'EG', 'IQ', 'SD', 'OM', 'JO', 'AE', 'LB', 'LY',
                           'MR', 'KW', 'QA', 'BH', 'YE', 'PS', 'SO', 'KM', 'DJ', 'EH']],
            'HI': ['/hi', ['IN', 'FJ', 'MU']],
            'TH': ['/th', ['TH']],
            'MS': ['/ms', ['MY', 'BN']],
            'ID': ['/id', ['ID']],
            'TL': ['/tl', ['PH']],
            'VI': ['/vi', ['VN']],
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  BOOT
    // ═══════════════════════════════════════════════════════════

    function boot() {
        const customCases = buildCustomCases();
        const targetPage  = window.location.origin;

        GDPRConsent.init((consent) => {
            console.log('[Boot] Consent:', JSON.stringify(consent));

            // Load GTM if just granted (first-time visitor).
            // For returning visitors it was already loaded at parse time.
            if (consent.analytics) {
                loadGTM();
            }

            // Language redirect — runs AFTER GTM is already injected
            if (consent.functional) {
                console.log('[Boot] functional=true — running cookieManager');
                CookieManager.run(customCases, targetPage);
            } else {
                console.log('[Boot] functional=false — cookieManager skipped');
            }
        });

        window.GDPRConsent = GDPRConsent;
    }

    function waitAndBoot() {
        if (window.INSaNE_DATA_READY && typeof window.INSaNE_DATA_READY.then === 'function') {
            window.INSaNE_DATA_READY.then(boot);
        } else {
            boot();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitAndBoot);
    } else {
        waitAndBoot();
    }

})();
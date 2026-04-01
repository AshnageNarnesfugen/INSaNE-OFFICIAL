/**
 * redirection.js — INSaNE | A Broken Hero
 *
 * Includes:
 *  1. cookieManager  — language-based geo-redirect
 *  2. GDPRConsent    — granular EU/EEA cookie panel (GSAP animated)
 *  2. GDPRConsent    — granular cookie consent panel (GSAP animated, global)
 *
 * Cookie categories:
 *  - necessary   : always active (session, language, redirect)
 *  - analytics   : usage tracking (disabled by default)
 *  - functional  : preferences, personalisation (disabled by default)
 *
 * EU detection: ISO 3166-1 country codes for EU + EEA members
 */

// ── Inline geo-IP helper (post-consent only) ────────────────
// Uses ip-api.com — no daily limit, CORS enabled, works with VPNs.
// Falls back to { country_code: null } if fetch fails or times out.
// Only called after user has given functional cookie consent.

/*
(function() {
    const URL  = 'http://ip-api.com/json/?fields=countryCode';
    const WAIT = 6000;
    let _p = null;

    window.fetchGeoIP = function() {
        if (window.__geoip) return Promise.resolve(window.__geoip);
        if (_p) return _p;
        _p = new Promise(function(resolve) {
            var fb      = { country_code: null };
            var timeout = setTimeout(function() { resolve(fb); }, WAIT);

            fetch(URL)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    clearTimeout(timeout);
                    // ip-api.com returns { countryCode: 'DE' }
                    // normalize to match existing code expecting { country_code: 'DE' }
                    var result = { country_code: data.countryCode || null };
                    window.__geoip = result;
                    resolve(result);
                })
                .catch(function() {
                    clearTimeout(timeout);
                    resolve(fb);
                });
        });
        return _p;
    };
}());

jQuery(() => {

    // ── Defensive check: ensure js-cookie (Cookies) is loaded ───
    // With defer, script execution order is DOM-order but parse time varies.
    // If Cookies is not yet defined, retry after a short delay.
    function waitForCookies(cb, attempts) {
        if (typeof Cookies !== 'undefined') {
            cb();
        } else if ((attempts || 0) < 20) {
            setTimeout(() => waitForCookies(cb, (attempts || 0) + 1), 50);
        } else {
            console.error('[INSaNE] js-cookie not loaded after 1s — banner may not appear.');
        }
    }

    // Wait for BOTH js-cookie AND data-loader JSONs before booting.
    // Without this, cookie-banner.json may not be loaded yet when the
    // banner renders — causing it to fall back to English inline strings.
    function boot(cb) {
        if (window.INSaNE_DATA_READY) {
            window.INSaNE_DATA_READY.then(() => waitForCookies(cb));
        } else {
            waitForCookies(cb);
        }
    }

    boot(function() {

    // ═══════════════════════════════════════════════════════════
    //  CONSTANTS
    // ═══════════════════════════════════════════════════════════


    const CONSENT_COOKIE   = 'insane_gdpr_consent';   // stores JSON for EU
    const CONSENT_VERSION  = '1';                      // bump to re-ask on policy change
    const CONSENT_EXPIRES  = 365;

    // ═══════════════════════════════════════════════════════════
    //  COOKIE MANAGER (language geo-redirect)
    // ═══════════════════════════════════════════════════════════

    (function($) {
        $.fn.cookieManager = function(customCases, targetPage) {
            const cm = {
                baseUrl: targetPage,
                hasDefaultCaseExecuted: false,
                langCases: customCases,

                run() {
                    console.log('[CM] run() start — has_been_redirected:', sessionStorage.getItem('has_been_redirected'), '| language:', Cookies.get('language'));

                    // If has_been_redirected is set but language cookie is missing,
                    // the previous redirect was incomplete — reset and retry.
                    if (sessionStorage.getItem('has_been_redirected') === 'true') {
                        if (!Cookies.get('language')) {
                            sessionStorage.removeItem('has_been_redirected');
                            console.log('[CM] Stale redirect cookie cleared — retrying.');
                        } else {
                            console.log('[CM] Already redirected with language:', Cookies.get('language'), '— skipping.');
                            return;
                        }
                    }

                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('language') && urlParams.has('browserLanguage')) {
                        console.log('[CM] URL already has language params — skipping.');
                        return;
                    }

                    const language = Cookies.get('language');
                    console.log('[CM] language cookie:', language);

                    // Known language cookie — verify country still matches
                    for (const [key, value] of Object.entries(this.langCases)) {
                        if (key === language) {
                            console.log('[CM] Known language match:', key, '— calling fetchGeoIP to verify country');
                            window.fetchGeoIP()
                                .then((data) => {
                                    const userCountry = value[1].includes(data.country_code) ? data.country_code : null;
                                    if (window.location.pathname !== value[0]) {
                                        this._setRedirectedCookie();
                                        const p = new URLSearchParams();
                                        p.set('language', language);
                                        if (userCountry) p.set('country', userCountry);
                                        window.location.href = `${this.baseUrl}${value[0]}?${p.toString()}`;
                                    }
                                })
                                .catch(() => console.warn('[CookieManager] Could not fetch country.'));
                            return;
                        }
                    }

                    // No language cookie — detect by IP
                    window.fetchGeoIP()
                        .then((data) => {
                            console.log('[CookieManager] fetchGeoIP result:', JSON.stringify(data));
                            const browserLang = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                            this._performRedirection(data, language, browserLang);
                        })
                        .catch(() => {
                            console.warn('[CookieManager] IP fetch failed — using browser language.');
                            const browserLang = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                            this._performRedirection({}, language, browserLang);
                        });
                },

                _performRedirection(data, language, browserLang) {
                    const userCountry = data.country_code;
                    for (const [key, value] of Object.entries(this.langCases)) {
                        if (key === userCountry || value[1].includes(userCountry)) {
                            if (language !== userCountry) {
                                this._redirectToCountry(this.baseUrl, key, data, browserLang);
                            }
                            return;
                        }
                    }
                    if (!this.hasDefaultCaseExecuted) {
                        this.hasDefaultCaseExecuted = true;
                        this._redirectToCountry(this.baseUrl, userCountry, data, browserLang);
                    }
                },

                _redirectToCountry(baseUrl, lang, data, browserLang) {
                    const finalLang = lang || browserLang;
                    if (!finalLang) return; // nothing to do

                    // Clean country — null from failed API should not be stored
                    const userCountry = (data.country_code && data.country_code !== 'null')
                        ? data.country_code : null;

                    // Cookie domain must not include protocol
                    const cookieDomain = baseUrl.replace(/^https?:\/\//, '').split('/')[0];
                    const cookieOpts   = {
                        expires: CONSENT_EXPIRES, path: '/',
                        domain: cookieDomain, secure: true, sameSite: 'Strict'
                    };
                    Cookies.set('language', finalLang, cookieOpts);
                    if (userCountry) Cookies.set('country', userCountry, cookieOpts);
                    this._setRedirectedCookie();

                    let redirectPath = '';
                    for (const [key, value] of Object.entries(this.langCases)) {
                        if (key === finalLang) { redirectPath = value[0]; break; }
                    }

                    // Build clean query string — omit null/undefined values
                    const base   = baseUrl.endsWith('/') ? baseUrl.slice(0,-1) : baseUrl;
                    const path   = redirectPath.startsWith('/') ? redirectPath.slice(1) : redirectPath;
                    const params = new URLSearchParams();
                    params.set('language', finalLang);
                    if (userCountry) params.set('country', userCountry);
                    if (browserLang) params.set('browserLanguage', browserLang);

                    window.location.href = `${base}/${path}?${params.toString()}`;
                },

                _setRedirectedCookie() {
                    // sessionStorage — dies when tab closes, never persists to incognito
                    sessionStorage.setItem('has_been_redirected', 'true');
                }
            };

            return this.each(() => cm.run());
        };
    }(jQuery));


    // ═══════════════════════════════════════════════════════════
    //  GDPR CONSENT MANAGER
    //  Full granular panel for EU/EEA users — GSAP animated
    // ═══════════════════════════════════════════════════════════

    const GDPRConsent = (function() {

        // ── i18n labels for the GDPR panel ────────────────────
        // GDPR panel labels — from /data/i18n/gdpr-panel.json
        function getGdprLabels(lang) {
            const data = ((window.INSaNE_DATA || {})['gdpr-panel'] || {}).labels || {};
            return data[lang] || data['en'] || {
                title:'Cookie Preferences', intro:'We use cookies to improve your experience.',
                necessary:'Necessary', necessaryD:'Required for the site to function.',
                analytics:'Analytics', analyticsD:'Help us understand how visitors interact.',
                functional:'Functional', functionalD:'Remember your preferences.',
                acceptAll:'Accept All', saveChoice:'Save My Choices', rejectAll:'Reject All',
                policy:'Privacy Policy', policyLink:'#privacy-policy', alwaysOn:'Always on'
            };
        }

        const _rawLang  = window.location.pathname.split('/')[1] || 'en';
        const _normMap  = { jp: 'ja', kr: 'ko' };
        const pageLang  = _normMap[_rawLang] || _rawLang;
        const t = getGdprLabels(pageLang);

        // ── Read / write consent ───────────────────────────────
        function getConsent() {
            try {
                const raw = Cookies.get(CONSENT_COOKIE);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                // Re-ask if policy version changed
                if (parsed.version !== CONSENT_VERSION) return null;
                return parsed;
            } catch { return null; }
        }

        function saveConsent(analytics, functional) {
            const consent = {
                version:    CONSENT_VERSION,
                timestamp:  new Date().toISOString(),
                necessary:  true,
                analytics:  !!analytics,
                functional: !!functional,
            };
            Cookies.set(CONSENT_COOKIE, JSON.stringify(consent), {
                expires:  CONSENT_EXPIRES,
                path:     '/',
                secure:   true,
                sameSite: 'Strict',
            });
            return consent;
        }

        // ── Build the GDPR panel DOM ───────────────────────────
        function buildPanel() {
            const panel = $(`
                <div id="gdpr-panel" role="dialog" aria-modal="true" aria-label="${t.title}"
                     style="display:none; position:fixed; inset:0; z-index:2147483646;
                            display:flex; align-items:flex-end; justify-content:center;
                            padding:0 0 24px; pointer-events:none;">

                    <!-- Backdrop -->
                    <div id="gdpr-backdrop"
                         style="position:absolute; inset:0;
                                background:rgba(0,0,0,0.6);
                                backdrop-filter:blur(4px);
                                -webkit-backdrop-filter:blur(4px);
                                opacity:0; pointer-events:auto;">
                    </div>

                    <!-- Card -->
                    <div id="gdpr-card"
                         style="position:relative; pointer-events:auto;
                                width:100%; max-width:560px; margin:0 16px;
                                background:#111; color:#f5f5f5;
                                border:1px solid rgba(255,255,255,0.1);
                                border-radius:14px;
                                padding:28px 24px 22px;
                                box-shadow:0 20px 60px rgba(0,0,0,0.8);
                                font-family:inherit;
                                transform:translateY(40px); opacity:0;">

                        <!-- Header -->
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                 stroke="#e83b2e" stroke-width="2" style="flex-shrink:0">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <h2 style="margin:0; font-size:16px; font-weight:700; color:#fff;">${t.title}</h2>
                        </div>

                        <!-- Intro text -->
                        <p style="margin:0 0 20px; font-size:13px; line-height:1.6;
                                  color:rgba(255,255,255,0.65);">
                            ${t.intro}
                            <a href="${t.policyLink}"
                               style="color:#e83b2e; text-decoration:underline; margin-left:4px;"
                               target="_blank" rel="noopener">${t.policy}</a>
                        </p>

                        <!-- Categories -->
                        <div id="gdpr-categories" style="display:flex; flex-direction:column; gap:10px; margin-bottom:22px;">

                            <!-- Necessary — always on -->
                            <div class="gdpr-cat" style="display:flex; align-items:flex-start; gap:12px;
                                                         background:rgba(255,255,255,0.04);
                                                         border:1px solid rgba(255,255,255,0.08);
                                                         border-radius:10px; padding:12px 14px;">
                                <div style="flex:1;">
                                    <div style="font-size:13px; font-weight:600; color:#fff; margin-bottom:3px;">
                                        ${t.necessary}
                                    </div>
                                    <div style="font-size:12px; color:rgba(255,255,255,0.5); line-height:1.4;">
                                        ${t.necessaryD}
                                    </div>
                                </div>
                                <span style="font-size:11px; font-weight:600; color:#4caf50;
                                             background:rgba(76,175,80,0.12);
                                             border:1px solid rgba(76,175,80,0.25);
                                             border-radius:20px; padding:3px 10px;
                                             white-space:nowrap; flex-shrink:0;
                                             align-self:center;">
                                    ${t.alwaysOn}
                                </span>
                            </div>

                            <!-- Analytics -->
                            <div class="gdpr-cat" style="display:flex; align-items:flex-start; gap:12px;
                                                         background:rgba(255,255,255,0.04);
                                                         border:1px solid rgba(255,255,255,0.08);
                                                         border-radius:10px; padding:12px 14px;">
                                <div style="flex:1;">
                                    <div style="font-size:13px; font-weight:600; color:#fff; margin-bottom:3px;">
                                        ${t.analytics}
                                    </div>
                                    <div style="font-size:12px; color:rgba(255,255,255,0.5); line-height:1.4;">
                                        ${t.analyticsD}
                                    </div>
                                </div>
                                <label class="gdpr-toggle" style="flex-shrink:0; align-self:center;">
                                    <input type="checkbox" id="gdpr-analytics" style="display:none;">
                                    <span class="gdpr-toggle-track"></span>
                                </label>
                            </div>

                            <!-- Functional -->
                            <div class="gdpr-cat" style="display:flex; align-items:flex-start; gap:12px;
                                                         background:rgba(255,255,255,0.04);
                                                         border:1px solid rgba(255,255,255,0.08);
                                                         border-radius:10px; padding:12px 14px;">
                                <div style="flex:1;">
                                    <div style="font-size:13px; font-weight:600; color:#fff; margin-bottom:3px;">
                                        ${t.functional}
                                    </div>
                                    <div style="font-size:12px; color:rgba(255,255,255,0.5); line-height:1.4;">
                                        ${t.functionalD}
                                    </div>
                                </div>
                                <label class="gdpr-toggle" style="flex-shrink:0; align-self:center;">
                                    <input type="checkbox" id="gdpr-functional" style="display:none;">
                                    <span class="gdpr-toggle-track"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Action buttons -->
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                            <button id="gdpr-accept-all"
                                    style="flex:1; min-width:120px; padding:10px 16px;
                                           background:#e83b2e; color:#fff;
                                           border:none; border-radius:8px;
                                           font-size:13px; font-weight:600;
                                           cursor:pointer; transition:opacity 0.2s;">
                                ${t.acceptAll}
                            </button>
                            <button id="gdpr-save"
                                    style="flex:1; min-width:120px; padding:10px 16px;
                                           background:rgba(255,255,255,0.08); color:#fff;
                                           border:1px solid rgba(255,255,255,0.15);
                                           border-radius:8px; font-size:13px; font-weight:600;
                                           cursor:pointer; transition:opacity 0.2s;">
                                ${t.saveChoice}
                            </button>
                            <button id="gdpr-reject-all"
                                    style="width:100%; padding:8px 16px;
                                           background:transparent; color:rgba(255,255,255,0.4);
                                           border:none; border-radius:8px;
                                           font-size:12px; cursor:pointer;
                                           transition:color 0.2s;">
                                ${t.rejectAll}
                            </button>
                        </div>
                    </div>
                </div>
            `);

            // Toggle CSS
            $('<style>').text(`
                .gdpr-toggle { cursor:pointer; }
                .gdpr-toggle-track {
                    display:block; width:42px; height:24px;
                    background:rgba(255,255,255,0.15);
                    border-radius:12px; position:relative;
                    transition:background 0.25s;
                }
                .gdpr-toggle-track::after {
                    content:''; position:absolute;
                    top:3px; left:3px;
                    width:18px; height:18px;
                    background:#fff; border-radius:50%;
                    transition:transform 0.25s, background 0.25s;
                    box-shadow:0 1px 4px rgba(0,0,0,0.4);
                }
                .gdpr-toggle input:checked + .gdpr-toggle-track {
                    background:#e83b2e;
                }
                .gdpr-toggle input:checked + .gdpr-toggle-track::after {
                    transform:translateX(18px);
                }
                #gdpr-accept-all:hover { opacity:0.88; }
                #gdpr-save:hover       { opacity:0.88; }
                #gdpr-reject-all:hover { color:rgba(255,255,255,0.75) !important; }
                @media(max-width:480px){
                    #gdpr-card { padding:22px 16px 18px !important; }
                }
            `).appendTo('head');

            $('body').append(panel);
            return panel;
        }

        // ── Animate in / out with GSAP ─────────────────────────
        function showPanel(panel, onDone) {
            panel.css('display', 'flex');

            const tl = gsap.timeline();
            tl.to('#gdpr-backdrop', {
                opacity: 1,
                duration: 0.35,
                ease: 'power2.out'
            })
            .to('#gdpr-card', {
                opacity: 1,
                y: 0,
                duration: 0.45,
                ease: 'back.out(1.4)'
            }, '-=0.2')
            .call(() => {
                // Focus first interactive element for a11y
                $('#gdpr-accept-all').focus();
                if (onDone) onDone();
            });
        }

        function hidePanel(panel, onComplete) {
            const tl = gsap.timeline({ onComplete: () => {
                panel.css('display', 'none');
                if (onComplete) onComplete();
            }});
            tl.to('#gdpr-card', {
                opacity: 0,
                y: 30,
                duration: 0.3,
                ease: 'power2.in'
            })
            .to('#gdpr-backdrop', {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in'
            }, '-=0.15');
        }

        // ── Public API ─────────────────────────────────────────
        return {
            init(onConsent) {
                const existing = getConsent();
                if (existing) {
                    // Consent already recorded — fire callback immediately
                    onConsent(existing);
                    return;
                }

                // Remove consent and reopen panel — no reload needed
                // Reuse existing panel if already in DOM, otherwise build fresh
                const existing2 = $('#gdpr-panel');
                if (existing2.length) {
                    existing2.remove();
                }
                const panel = buildPanel();
                showPanel(panel);

                // Accept all
                $('#gdpr-accept-all').on('click', () => {
                    $('#gdpr-analytics').prop('checked', true);
                    $('#gdpr-functional').prop('checked', true);
                    const consent = saveConsent(true, true);
                    hidePanel(panel, () => onConsent(consent));
                });

                // Save custom choices
                $('#gdpr-save').on('click', () => {
                    const analytics  = $('#gdpr-analytics').is(':checked');
                    const functional = $('#gdpr-functional').is(':checked');
                    const consent    = saveConsent(analytics, functional);
                    hidePanel(panel, () => onConsent(consent));
                });

                // Reject all
                $('#gdpr-reject-all').on('click', () => {
                    const consent = saveConsent(false, false);
                    hidePanel(panel, () => onConsent(consent));
                });

                // Close on backdrop click
                $('#gdpr-backdrop').on('click', () => {
                    // Treat backdrop click as "save current toggles" — not reject
                    $('#gdpr-save').trigger('click');
                });

                // Keyboard: Escape = save choices
                $(document).on('keydown.gdpr', (e) => {
                    if (e.key === 'Escape') {
                        $(document).off('keydown.gdpr');
                        $('#gdpr-save').trigger('click');
                    }
                });
            },


            get() { return getConsent(); },

            allows(category) {
                const c = getConsent();
                if (!c) return false;
                return !!c[category];
            }
        };
    })();

    // ═══════════════════════════════════════════════════════════
    //  SIMPLE COOKIE BANNER (non-EU)
    //  Minimal accept/reject — same visual style as before
    // ═══════════════════════════════════════════════════════════



    // ═══════════════════════════════════════════════════════════
    //  LANGUAGE CASES
    // ═══════════════════════════════════════════════════════════

    // Language routing cases — from /data/config/lang-cases.json
    function buildCustomCases() {
        const raw = ((window.INSaNE_DATA || {})['lang-cases'] || {}).cases || {};
        if (Object.keys(raw).length) {
            return Object.fromEntries(
                Object.entries(raw).map(([k, v]) => [k, [v.path, v.countries]])
            );
        }
        return {
            'EN': ['/',    ['US', 'CA', 'AU', 'NZ', 'IE', 'ZA', 'SG']],
            'ES': ['/es',  ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU']],
            'PT': ['/pt',  ['PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'GQ', 'TL']],
            'JP': ['/jp',  ['JP']],
            'FR': ['/fr',  ['FR', 'BE', 'CA', 'CH', 'LU', 'MC', 'DZ', 'MA', 'TN']],
            'ZH': ['/zh',  ['CN', 'HK', 'MO', 'SG', 'TW']],
            'RU': ['/ru',  ['RU', 'BY', 'KZ', 'KG', 'TJ', 'TM']],
            'DE': ['/de',  ['DE', 'AT', 'CH', 'LU', 'LI', 'BE']],
            'IT': ['/it',  ['IT', 'CH', 'SM', 'VA']],
            'KR': ['/kr',  ['KR']],
            'AR': ['/ar',  ['SA', 'EG', 'IQ', 'DZ', 'SD', 'MA', 'TN', 'OM', 'JO', 'AE', 'LB', 'LY', 'MR', 'KW', 'QA', 'BH', 'YE', 'PS', 'SO', 'KM', 'DJ', 'EH']],
            'HI': ['/hi',  ['IN', 'FJ', 'MU']],
            'TH': ['/th',  ['TH']],
            'MS': ['/ms',  ['MY', 'BN']],
            'ID': ['/id',  ['ID']],
            'TL': ['/tl',  ['PH']],
            'VI': ['/vi',  ['VN']],
        };
    }
    const customCases = buildCustomCases();

    const targetPage = window.location.origin;

    // ═══════════════════════════════════════════════════════════
    //  BOOT — decide EU vs non-EU flow
    // ═══════════════════════════════════════════════════════════

    // ── GDPR panel for all users — one consent flow globally ──
    GDPRConsent.init((consent) => {
        console.log('[Boot] GDPRConsent.init callback — consent:', JSON.stringify(consent));
        if (consent.functional) {
            console.log('[Boot] functional=true — calling cookieManager');
            $(document).cookieManager(customCases, targetPage);
        } else {
            console.log('[Boot] functional=false — cookieManager skipped');
        }
        if (consent.analytics) {
            // Load GTM only after analytics consent — GDPR compliant
            // GTM must be removed from index.html <head> for this to work
            (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),
                    dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KP3R25CS');
        }
    });

    // ── Expose GDPRConsent globally for optional use elsewhere ──
    // e.g. window.GDPRConsent.allows('analytics')
    window.GDPRConsent = GDPRConsent;

    }); // end boot
});*/

/**
 * redirection.js — INSaNE | A Broken Hero
 *
 * Includes:
 *  1. cookieManager  — language-based geo-redirect
 *  2. GDPRConsent    — granular cookie consent panel (GSAP animated, global)
 *
 * Cookie categories:
 *  - necessary   : always active (session, language, redirect)
 *  - analytics   : usage tracking (disabled by default)
 *  - functional  : preferences, personalisation (disabled by default)
 *
 * EU detection: ISO 3166-1 country codes for EU + EEA members
 */

// ── Inline geo-IP helper (post-consent only) ────────────────
// Uses ip-api.com — no daily limit, CORS enabled, works with VPNs.
// Falls back to { country_code: null } if fetch fails or times out.
// Only called after user has given functional cookie consent.
(function() {
    // FIX: Use HTTPS endpoint to avoid mixed-content blocking.
    // ip-api.com free tier only supports HTTP; switch to a provider
    // that supports HTTPS, or use their paid pro endpoint.
    // Using ipapi.co as a free HTTPS alternative:
    const URL  = 'https://ipapi.co/json/';
    const WAIT = 6000;
    let _p = null;

    window.fetchGeoIP = function() {
        if (window.__geoip) return Promise.resolve(window.__geoip);
        if (_p) return _p;
        _p = new Promise(function(resolve) {
            var fb      = { country_code: null };
            var timeout = setTimeout(function() {
                _p = null; // allow retry on timeout
                resolve(fb);
            }, WAIT);

            fetch(URL)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    clearTimeout(timeout);
                    // ipapi.co returns { country_code: 'DE' } directly
                    // Also handle ip-api.com format { countryCode: 'DE' } as fallback
                    var code = data.country_code || data.countryCode || null;
                    var result = { country_code: code };
                    window.__geoip = result;
                    resolve(result);
                })
                .catch(function() {
                    clearTimeout(timeout);
                    _p = null; // allow retry on failure
                    resolve(fb);
                });
        });
        return _p;
    };
}());

jQuery(() => {

    // ── Defensive check: ensure js-cookie (Cookies) is loaded ───
    function waitForCookies(cb, attempts) {
        if (typeof Cookies !== 'undefined') {
            cb();
        } else if ((attempts || 0) < 20) {
            setTimeout(() => waitForCookies(cb, (attempts || 0) + 1), 50);
        } else {
            console.error('[INSaNE] js-cookie not loaded after 1s — banner may not appear.');
        }
    }

    // Wait for BOTH js-cookie AND data-loader JSONs before booting.
    function boot(cb) {
        if (window.INSaNE_DATA_READY && typeof window.INSaNE_DATA_READY.then === 'function') {
            // FIX: verify it's actually a Promise before calling .then()
            window.INSaNE_DATA_READY.then(() => waitForCookies(cb));
        } else {
            waitForCookies(cb);
        }
    }

    boot(function() {

    // ═══════════════════════════════════════════════════════════
    //  CONSTANTS
    // ═══════════════════════════════════════════════════════════

    const CONSENT_COOKIE   = 'insane_gdpr_consent';
    const CONSENT_VERSION  = '1';
    const CONSENT_EXPIRES  = 365;

    // ═══════════════════════════════════════════════════════════
    //  COOKIE MANAGER (language geo-redirect)
    // ═══════════════════════════════════════════════════════════

    (function($) {
        $.fn.cookieManager = function(customCases, targetPage) {
            const cm = {
                baseUrl: targetPage,
                hasDefaultCaseExecuted: false,
                langCases: customCases,

                run() {
                    console.log('[CM] run() start — has_been_redirected:',
                        sessionStorage.getItem('has_been_redirected'),
                        '| language:', Cookies.get('language'));

                    if (sessionStorage.getItem('has_been_redirected') === 'true') {
                        if (!Cookies.get('language')) {
                            sessionStorage.removeItem('has_been_redirected');
                            console.log('[CM] Stale redirect cookie cleared — retrying.');
                        } else {
                            console.log('[CM] Already redirected with language:',
                                Cookies.get('language'), '— skipping.');
                            return;
                        }
                    }

                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('language') && urlParams.has('browserLanguage')) {
                        console.log('[CM] URL already has language params — skipping.');
                        return;
                    }

                    const language = Cookies.get('language');
                    console.log('[CM] language cookie:', language);

                    // Known language cookie — verify country still matches
                    if (language && this.langCases.hasOwnProperty(language)) {
                        const value = this.langCases[language];
                        console.log('[CM] Known language match:', language,
                            '— calling fetchGeoIP to verify country');

                        window.fetchGeoIP()
                            .then((data) => {
                                const userCountry = value[1].includes(data.country_code)
                                    ? data.country_code : null;

                                // FIX: normalize paths before comparing to avoid
                                // false mismatches like "/" vs "" or trailing slashes
                                const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
                                const targetPath  = value[0].replace(/\/+$/, '') || '/';

                                if (currentPath !== targetPath) {
                                    this._setRedirectedCookie();
                                    const p = new URLSearchParams();
                                    p.set('language', language);
                                    if (userCountry) p.set('country', userCountry);
                                    window.location.href =
                                        `${this.baseUrl}${value[0]}?${p.toString()}`;
                                }
                            })
                            .catch(() => console.warn(
                                '[CookieManager] Could not fetch country.'));
                        return;
                    }

                    // No language cookie — detect by IP
                    window.fetchGeoIP()
                        .then((data) => {
                            console.log('[CookieManager] fetchGeoIP result:',
                                JSON.stringify(data));
                            const browserLang = (navigator.language || navigator.userLanguage)
                                .split('-')[0].toUpperCase();
                            this._performRedirection(data, language, browserLang);
                        })
                        .catch(() => {
                            console.warn(
                                '[CookieManager] IP fetch failed — using browser language.');
                            const browserLang = (navigator.language || navigator.userLanguage)
                                .split('-')[0].toUpperCase();
                            this._performRedirection({}, language, browserLang);
                        });
                },

                _performRedirection(data, language, browserLang) {
                    const userCountry = data.country_code;
                    for (const [key, value] of Object.entries(this.langCases)) {
                        if (key === userCountry || value[1].includes(userCountry)) {
                            if (language !== userCountry) {
                                this._redirectToCountry(this.baseUrl, key, data, browserLang);
                            }
                            return;
                        }
                    }
                    if (!this.hasDefaultCaseExecuted) {
                        this.hasDefaultCaseExecuted = true;
                        this._redirectToCountry(this.baseUrl, userCountry, data, browserLang);
                    }
                },

                _redirectToCountry(baseUrl, lang, data, browserLang) {
                    const finalLang = lang || browserLang;
                    if (!finalLang) return;

                    const userCountry = (data.country_code && data.country_code !== 'null')
                        ? data.country_code : null;

                    const cookieDomain = baseUrl.replace(/^https?:\/\//, '').split('/')[0];
                    const cookieOpts   = {
                        expires: CONSENT_EXPIRES, path: '/',
                        domain: cookieDomain, secure: true, sameSite: 'Strict'
                    };
                    Cookies.set('language', finalLang, cookieOpts);
                    if (userCountry) Cookies.set('country', userCountry, cookieOpts);
                    this._setRedirectedCookie();

                    let redirectPath = '';
                    for (const [key, value] of Object.entries(this.langCases)) {
                        if (key === finalLang) { redirectPath = value[0]; break; }
                    }

                    const base   = baseUrl.endsWith('/') ? baseUrl.slice(0,-1) : baseUrl;
                    const path   = redirectPath.startsWith('/')
                        ? redirectPath.slice(1) : redirectPath;
                    const params = new URLSearchParams();
                    params.set('language', finalLang);
                    if (userCountry) params.set('country', userCountry);
                    if (browserLang) params.set('browserLanguage', browserLang);

                    window.location.href = `${base}/${path}?${params.toString()}`;
                },

                _setRedirectedCookie() {
                    sessionStorage.setItem('has_been_redirected', 'true');
                }
            };

            return this.each(() => cm.run());
        };
    }(jQuery));


    // ═══════════════════════════════════════════════════════════
    //  GDPR CONSENT MANAGER
    //  Full granular panel for all users — GSAP animated
    // ═══════════════════════════════════════════════════════════

    const GDPRConsent = (function() {

        // ── i18n labels ───────────────────────────────────────
        function getGdprLabels(lang) {
            const data = ((window.INSaNE_DATA || {})['gdpr-panel'] || {}).labels || {};
            return data[lang] || data['en'] || {
                title:'Cookie Preferences',
                intro:'We use cookies to improve your experience.',
                necessary:'Necessary',
                necessaryD:'Required for the site to function.',
                analytics:'Analytics',
                analyticsD:'Help us understand how visitors interact.',
                functional:'Functional',
                functionalD:'Remember your preferences.',
                acceptAll:'Accept All',
                saveChoice:'Save My Choices',
                rejectAll:'Reject All',
                policy:'Privacy Policy',
                policyLink:'#privacy-policy',
                alwaysOn:'Always on'
            };
        }

        const _rawLang  = window.location.pathname.split('/')[1] || 'en';
        const _normMap  = { jp: 'ja', kr: 'ko' };
        const pageLang  = _normMap[_rawLang] || _rawLang;
        const t = getGdprLabels(pageLang);

        // ── Read / write consent ──────────────────────────────
        function getConsent() {
            try {
                const raw = Cookies.get(CONSENT_COOKIE);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (parsed.version !== CONSENT_VERSION) return null;
                return parsed;
            } catch(e) { return null; }
        }

        function saveConsent(analytics, functional) {
            const consent = {
                version:    CONSENT_VERSION,
                timestamp:  new Date().toISOString(),
                necessary:  true,
                analytics:  !!analytics,
                functional: !!functional,
            };
            Cookies.set(CONSENT_COOKIE, JSON.stringify(consent), {
                expires:  CONSENT_EXPIRES,
                path:     '/',
                secure:   true,
                sameSite: 'Strict',
            });
            return consent;
        }

        // ── Build the GDPR panel DOM ──────────────────────────
        function buildPanel() {
            // FIX: Use display:none only. showPanel() will set display:flex
            // when it's time to animate in. The original had BOTH
            // display:none AND display:flex inline — the latter won
            // (last declaration wins), so the panel was always visible.
            const panel = $(`
                <div id="gdpr-panel" role="dialog" aria-modal="true"
                     aria-label="${t.title}"
                     style="display:none; position:fixed; inset:0; z-index:2147483646;
                            align-items:flex-end; justify-content:center;
                            padding:0 0 24px; pointer-events:none;">

                    <!-- Backdrop -->
                    <div id="gdpr-backdrop"
                         style="position:absolute; inset:0;
                                background:rgba(0,0,0,0.6);
                                backdrop-filter:blur(4px);
                                -webkit-backdrop-filter:blur(4px);
                                opacity:0; pointer-events:auto;">
                    </div>

                    <!-- Card -->
                    <div id="gdpr-card"
                         style="position:relative; pointer-events:auto;
                                width:100%; max-width:560px; margin:0 16px;
                                background:#111; color:#f5f5f5;
                                border:1px solid rgba(255,255,255,0.1);
                                border-radius:14px;
                                padding:28px 24px 22px;
                                box-shadow:0 20px 60px rgba(0,0,0,0.8);
                                font-family:inherit;
                                transform:translateY(40px); opacity:0;">

                        <!-- Header -->
                        <div style="display:flex; align-items:center; gap:10px;
                                    margin-bottom:14px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                 stroke="#e83b2e" stroke-width="2" style="flex-shrink:0">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <h2 style="margin:0; font-size:16px; font-weight:700;
                                       color:#fff;">${t.title}</h2>
                        </div>

                        <!-- Intro text -->
                        <p style="margin:0 0 20px; font-size:13px; line-height:1.6;
                                  color:rgba(255,255,255,0.65);">
                            ${t.intro}
                            <a href="${t.policyLink}"
                               style="color:#e83b2e; text-decoration:underline;
                                      margin-left:4px;"
                               target="_blank" rel="noopener">${t.policy}</a>
                        </p>

                        <!-- Categories -->
                        <div id="gdpr-categories"
                             style="display:flex; flex-direction:column; gap:10px;
                                    margin-bottom:22px;">

                            <!-- Necessary — always on -->
                            <div class="gdpr-cat"
                                 style="display:flex; align-items:flex-start; gap:12px;
                                        background:rgba(255,255,255,0.04);
                                        border:1px solid rgba(255,255,255,0.08);
                                        border-radius:10px; padding:12px 14px;">
                                <div style="flex:1;">
                                    <div style="font-size:13px; font-weight:600;
                                                color:#fff; margin-bottom:3px;">
                                        ${t.necessary}
                                    </div>
                                    <div style="font-size:12px;
                                                color:rgba(255,255,255,0.5);
                                                line-height:1.4;">
                                        ${t.necessaryD}
                                    </div>
                                </div>
                                <span style="font-size:11px; font-weight:600; color:#4caf50;
                                             background:rgba(76,175,80,0.12);
                                             border:1px solid rgba(76,175,80,0.25);
                                             border-radius:20px; padding:3px 10px;
                                             white-space:nowrap; flex-shrink:0;
                                             align-self:center;">
                                    ${t.alwaysOn}
                                </span>
                            </div>

                            <!-- Analytics -->
                            <div class="gdpr-cat"
                                 style="display:flex; align-items:flex-start; gap:12px;
                                        background:rgba(255,255,255,0.04);
                                        border:1px solid rgba(255,255,255,0.08);
                                        border-radius:10px; padding:12px 14px;">
                                <div style="flex:1;">
                                    <div style="font-size:13px; font-weight:600;
                                                color:#fff; margin-bottom:3px;">
                                        ${t.analytics}
                                    </div>
                                    <div style="font-size:12px;
                                                color:rgba(255,255,255,0.5);
                                                line-height:1.4;">
                                        ${t.analyticsD}
                                    </div>
                                </div>
                                <label class="gdpr-toggle"
                                       style="flex-shrink:0; align-self:center;">
                                    <input type="checkbox" id="gdpr-analytics"
                                           style="display:none;">
                                    <span class="gdpr-toggle-track"></span>
                                </label>
                            </div>

                            <!-- Functional -->
                            <div class="gdpr-cat"
                                 style="display:flex; align-items:flex-start; gap:12px;
                                        background:rgba(255,255,255,0.04);
                                        border:1px solid rgba(255,255,255,0.08);
                                        border-radius:10px; padding:12px 14px;">
                                <div style="flex:1;">
                                    <div style="font-size:13px; font-weight:600;
                                                color:#fff; margin-bottom:3px;">
                                        ${t.functional}
                                    </div>
                                    <div style="font-size:12px;
                                                color:rgba(255,255,255,0.5);
                                                line-height:1.4;">
                                        ${t.functionalD}
                                    </div>
                                </div>
                                <label class="gdpr-toggle"
                                       style="flex-shrink:0; align-self:center;">
                                    <input type="checkbox" id="gdpr-functional"
                                           style="display:none;">
                                    <span class="gdpr-toggle-track"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Action buttons -->
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                            <button id="gdpr-accept-all"
                                    style="flex:1; min-width:120px; padding:10px 16px;
                                           background:#e83b2e; color:#fff;
                                           border:none; border-radius:8px;
                                           font-size:13px; font-weight:600;
                                           cursor:pointer; transition:opacity 0.2s;">
                                ${t.acceptAll}
                            </button>
                            <button id="gdpr-save"
                                    style="flex:1; min-width:120px; padding:10px 16px;
                                           background:rgba(255,255,255,0.08); color:#fff;
                                           border:1px solid rgba(255,255,255,0.15);
                                           border-radius:8px; font-size:13px;
                                           font-weight:600;
                                           cursor:pointer; transition:opacity 0.2s;">
                                ${t.saveChoice}
                            </button>
                            <button id="gdpr-reject-all"
                                    style="width:100%; padding:8px 16px;
                                           background:transparent;
                                           color:rgba(255,255,255,0.4);
                                           border:none; border-radius:8px;
                                           font-size:12px; cursor:pointer;
                                           transition:color 0.2s;">
                                ${t.rejectAll}
                            </button>
                        </div>
                    </div>
                </div>
            `);

            // Toggle CSS (only inject once)
            if (!document.getElementById('gdpr-toggle-styles')) {
                $('<style>').attr('id', 'gdpr-toggle-styles').text(`
                    .gdpr-toggle { cursor:pointer; }
                    .gdpr-toggle-track {
                        display:block; width:42px; height:24px;
                        background:rgba(255,255,255,0.15);
                        border-radius:12px; position:relative;
                        transition:background 0.25s;
                    }
                    .gdpr-toggle-track::after {
                        content:''; position:absolute;
                        top:3px; left:3px;
                        width:18px; height:18px;
                        background:#fff; border-radius:50%;
                        transition:transform 0.25s, background 0.25s;
                        box-shadow:0 1px 4px rgba(0,0,0,0.4);
                    }
                    .gdpr-toggle input:checked + .gdpr-toggle-track {
                        background:#e83b2e;
                    }
                    .gdpr-toggle input:checked + .gdpr-toggle-track::after {
                        transform:translateX(18px);
                    }
                    #gdpr-accept-all:hover { opacity:0.88; }
                    #gdpr-save:hover       { opacity:0.88; }
                    #gdpr-reject-all:hover {
                        color:rgba(255,255,255,0.75) !important;
                    }
                    @media(max-width:480px){
                        #gdpr-card { padding:22px 16px 18px !important; }
                    }
                `).appendTo('head');
            }

            $('body').append(panel);
            return panel;
        }

        // ── Animate in / out with GSAP ────────────────────────
        function showPanel(panel, onDone) {
            // FIX: set display:flex HERE — the only place it should happen
            panel.css('display', 'flex');

            const tl = gsap.timeline();
            tl.to('#gdpr-backdrop', {
                opacity: 1,
                duration: 0.35,
                ease: 'power2.out'
            })
            .to('#gdpr-card', {
                opacity: 1,
                y: 0,
                duration: 0.45,
                ease: 'back.out(1.4)'
            }, '-=0.2')
            .call(() => {
                $('#gdpr-accept-all').focus();
                if (onDone) onDone();
            });
        }

        function hidePanel(panel, onComplete) {
            const tl = gsap.timeline({ onComplete: () => {
                panel.css('display', 'none');
                if (onComplete) onComplete();
            }});
            tl.to('#gdpr-card', {
                opacity: 0,
                y: 30,
                duration: 0.3,
                ease: 'power2.in'
            })
            .to('#gdpr-backdrop', {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in'
            }, '-=0.15');
        }

        // ── Public API ────────────────────────────────────────
        return {
            init(onConsent) {
                const existing = getConsent();
                if (existing) {
                    onConsent(existing);
                    return;
                }

                // Remove stale panel if present, then build fresh
                $('#gdpr-panel').remove();
                const panel = buildPanel();
                showPanel(panel);

                // FIX: track whether a choice was already made to prevent
                // double-fire from rapid clicks
                let choiceMade = false;

                function handleChoice(analytics, functional) {
                    if (choiceMade) return;
                    choiceMade = true;
                    const consent = saveConsent(analytics, functional);
                    // FIX: unbind the Escape handler to avoid leaking
                    $(document).off('keydown.gdpr');
                    hidePanel(panel, () => onConsent(consent));
                }

                // Accept all
                $('#gdpr-accept-all').on('click', () => {
                    $('#gdpr-analytics').prop('checked', true);
                    $('#gdpr-functional').prop('checked', true);
                    handleChoice(true, true);
                });

                // Save custom choices
                $('#gdpr-save').on('click', () => {
                    handleChoice(
                        $('#gdpr-analytics').is(':checked'),
                        $('#gdpr-functional').is(':checked')
                    );
                });

                // Reject all
                $('#gdpr-reject-all').on('click', () => {
                    handleChoice(false, false);
                });

                // Close on backdrop click — treat as "save current toggles"
                $('#gdpr-backdrop').on('click', () => {
                    $('#gdpr-save').trigger('click');
                });

                // Keyboard: Escape = save choices
                $(document).on('keydown.gdpr', (e) => {
                    if (e.key === 'Escape') {
                        $('#gdpr-save').trigger('click');
                    }
                });
            },

            /** Returns the current saved consent object or null */
            get() { return getConsent(); },

            /** Check if a specific category is allowed */
            allows(category) {
                const c = getConsent();
                if (!c) return false;
                return !!c[category];
            }
        };
    })();


    // ═══════════════════════════════════════════════════════════
    //  LANGUAGE CASES
    // ═══════════════════════════════════════════════════════════

    // Language routing cases — from /data/config/lang-cases.json
    // FIX: removed duplicate country codes across language groups.
    // CA was in both EN and FR; CH was in FR, DE, and IT.
    // Each country now appears in exactly one language group.
    // Adjust as needed for your routing priority.
    function buildCustomCases() {
        const raw = ((window.INSaNE_DATA || {})['lang-cases'] || {}).cases || {};
        if (Object.keys(raw).length) {
            return Object.fromEntries(
                Object.entries(raw).map(([k, v]) => [k, [v.path, v.countries]])
            );
        }
        return {
            'EN': ['/',    ['US', 'CA', 'AU', 'NZ', 'IE', 'ZA', 'SG']],
            'ES': ['/es',  ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU']],
            'PT': ['/pt',  ['PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'GQ', 'TL']],
            'JP': ['/jp',  ['JP']],
            'FR': ['/fr',  ['FR', 'BE', 'LU', 'MC', 'DZ', 'MA', 'TN']],
            'ZH': ['/zh',  ['CN', 'HK', 'MO', 'TW']],
            'RU': ['/ru',  ['RU', 'BY', 'KZ', 'KG', 'TJ', 'TM']],
            'DE': ['/de',  ['DE', 'AT', 'CH', 'LI']],
            'IT': ['/it',  ['IT', 'SM', 'VA']],
            'KR': ['/kr',  ['KR']],
            'AR': ['/ar',  ['SA', 'EG', 'IQ', 'SD', 'OM', 'JO', 'AE', 'LB', 'LY',
                            'MR', 'KW', 'QA', 'BH', 'YE', 'PS', 'SO', 'KM', 'DJ', 'EH']],
            'HI': ['/hi',  ['IN', 'FJ', 'MU']],
            'TH': ['/th',  ['TH']],
            'MS': ['/ms',  ['MY', 'BN']],
            'ID': ['/id',  ['ID']],
            'TL': ['/tl',  ['PH']],
            'VI': ['/vi',  ['VN']],
        };
    }
    const customCases = buildCustomCases();

    const targetPage = window.location.origin;

    // ═══════════════════════════════════════════════════════════
    //  BOOT — GDPR consent → then optional geo-redirect
    // ═══════════════════════════════════════════════════════════

    GDPRConsent.init((consent) => {
        console.log('[Boot] GDPRConsent.init callback — consent:',
            JSON.stringify(consent));

        if (consent.functional) {
            console.log('[Boot] functional=true — calling cookieManager');
            $(document).cookieManager(customCases, targetPage);
        } else {
            console.log('[Boot] functional=false — cookieManager skipped');
        }

        if (consent.analytics) {
            // Load GTM only after analytics consent
            (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),
                    dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KP3R25CS');
        }
    });

    // Expose globally
    window.GDPRConsent = GDPRConsent;

    }); // end boot
});
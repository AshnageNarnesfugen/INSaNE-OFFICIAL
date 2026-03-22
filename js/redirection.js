/**
 * redirection.js — INSaNE | A Broken Hero
 *
 * Includes:
 *  1. cookieManager  — language-based geo-redirect
 *  2. GDPRConsent    — granular EU/EEA cookie panel (GSAP animated)
 *  3. cookieBanner   — simple accept/reject for non-EU users
 *
 * Cookie categories:
 *  - necessary   : always active (session, language, redirect)
 *  - analytics   : usage tracking (disabled by default)
 *  - functional  : preferences, personalisation (disabled by default)
 *
 * EU detection: ISO 3166-1 country codes for EU + EEA members
 */

jQuery(() => {

    // ═══════════════════════════════════════════════════════════
    //  CONSTANTS
    // ═══════════════════════════════════════════════════════════

    const EU_COUNTRIES = new Set([
        // EU members
        'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE',
        'GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT',
        'RO','SK','SI','ES','SE',
        // EEA (non-EU but GDPR applies)
        'IS','LI','NO',
        // UK (post-Brexit, UK GDPR still applies)
        'GB',
        // Switzerland (nFADP — equivalent standard)
        'CH'
    ]);

    const CONSENT_COOKIE   = 'insane_gdpr_consent';   // stores JSON for EU
    const SIMPLE_COOKIE    = 'my_cookie_consent';      // 'true'/'false' for non-EU
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
                    if (Cookies.get('has_been_redirected') === 'true') return;

                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('language') && urlParams.has('browserLanguage')) return;

                    const language = Cookies.get('language');

                    // Known language cookie — verify country still matches
                    for (const [key, value] of Object.entries(this.langCases)) {
                        if (key === language) {
                            window.fetchGeoIP()
                                .then((data) => {
                                    const userCountry = value[1].includes(data.country) ? data.country : null;
                                    if (window.location.pathname !== value[0]) {
                                        this._setRedirectedCookie();
                                        window.location.href = `${this.baseUrl}${value[0]}?language=${language}&country=${userCountry}`;
                                    }
                                })
                                .catch(() => console.warn('[CookieManager] Could not fetch country.'));
                            return;
                        }
                    }

                    // No language cookie — detect by IP
                    window.fetchGeoIP()
                        .then((data) => {
                            const browserLang = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                            this._performRedirection(data, language, browserLang);
                        })
                        .catch((_, status, err) => {
                            console.error('[CookieManager] IP fetch error:', status, err);
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
                    const finalLang    = lang || browserLang;
                    let userCountry    = null;

                    for (const [key, value] of Object.entries(this.langCases)) {
                        if (key === finalLang) {
                            if (value[1].includes(data.country)) userCountry = data.country;
                            break;
                        }
                    }

                    const cookieOpts = { expires: CONSENT_EXPIRES, path: '/', domain: this.baseUrl, secure: true, sameSite: 'Strict' };
                    Cookies.set('language', finalLang, cookieOpts);
                    if (userCountry) Cookies.set('country', userCountry, cookieOpts);
                    this._setRedirectedCookie();

                    let redirectPath = '';
                    for (const [key, value] of Object.entries(this.langCases)) {
                        if (key === finalLang) { redirectPath = value[0]; break; }
                    }

                    data.browserLanguage = browserLang;
                    const params         = new URLSearchParams(data).toString();
                    const base           = baseUrl.endsWith('/') ? baseUrl.slice(0,-1) : baseUrl;
                    const path           = redirectPath.startsWith('/') ? redirectPath.slice(1) : redirectPath;

                    window.location.href = `${base}/${path}?language=${finalLang}&country=${userCountry}&${params}`;
                },

                _setRedirectedCookie() {
                    Cookies.set('has_been_redirected', 'true', {
                        expires: 7, path: '/', secure: true, sameSite: 'Strict'
                    });
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
        const LABELS = {
            en: {
                title:       'Cookie Preferences',
                intro:       'We use cookies to improve your experience. You can choose which categories you allow. Necessary cookies are always active.',
                necessary:   'Necessary',
                necessaryD:  'Required for the site to function. Cannot be disabled.',
                analytics:   'Analytics',
                analyticsD:  'Help us understand how visitors interact with the site (no personal data sold).',
                functional:  'Functional',
                functionalD: 'Remember your preferences such as language and layout.',
                acceptAll:   'Accept All',
                saveChoice:  'Save My Choices',
                rejectAll:   'Reject All',
                policy:      'Privacy Policy',
                policyLink:  '/privacy-policy',
                alwaysOn:    'Always on',
            },
            es: {
                title:       'Preferencias de Cookies',
                intro:       'Usamos cookies para mejorar tu experiencia. Puedes elegir qué categorías permitir. Las cookies necesarias siempre están activas.',
                necessary:   'Necesarias',
                necessaryD:  'Imprescindibles para el funcionamiento del sitio.',
                analytics:   'Analíticas',
                analyticsD:  'Nos ayudan a entender cómo los visitantes interactúan con el sitio.',
                functional:  'Funcionales',
                functionalD: 'Recuerdan tus preferencias como idioma y diseño.',
                acceptAll:   'Aceptar todas',
                saveChoice:  'Guardar mi elección',
                rejectAll:   'Rechazar todas',
                policy:      'Política de privacidad',
                policyLink:  '/politica-de-privacidad',
                alwaysOn:    'Siempre activo',
            },
            fr: {
                title:       'Préférences de cookies',
                intro:       'Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez choisir les catégories à autoriser.',
                necessary:   'Nécessaires',
                necessaryD:  'Indispensables au fonctionnement du site.',
                analytics:   'Analytiques',
                analyticsD:  'Nous aident à comprendre comment les visiteurs utilisent le site.',
                functional:  'Fonctionnels',
                functionalD: 'Mémorisent vos préférences comme la langue et la mise en page.',
                acceptAll:   'Tout accepter',
                saveChoice:  'Enregistrer mes choix',
                rejectAll:   'Tout refuser',
                policy:      'Politique de confidentialité',
                policyLink:  '/politique-de-confidentialite',
                alwaysOn:    'Toujours actif',
            },
            de: {
                title:       'Cookie-Einstellungen',
                intro:       'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Sie können wählen, welche Kategorien Sie zulassen.',
                necessary:   'Notwendig',
                necessaryD:  'Für den Betrieb der Website erforderlich.',
                analytics:   'Analytisch',
                analyticsD:  'Helfen uns zu verstehen, wie Besucher die Website nutzen.',
                functional:  'Funktional',
                functionalD: 'Speichern Ihre Einstellungen wie Sprache und Layout.',
                acceptAll:   'Alle akzeptieren',
                saveChoice:  'Meine Auswahl speichern',
                rejectAll:   'Alle ablehnen',
                policy:      'Datenschutzbestimmungen',
                policyLink:  '/datenschutz-bestimmungen',
                alwaysOn:    'Immer aktiv',
            },
            it: {
                title:       'Preferenze Cookie',
                intro:       'Utilizziamo i cookie per migliorare la tua esperienza. Puoi scegliere quali categorie consentire.',
                necessary:   'Necessari',
                necessaryD:  'Indispensabili per il funzionamento del sito.',
                analytics:   'Analitici',
                analyticsD:  'Ci aiutano a capire come i visitatori interagiscono con il sito.',
                functional:  'Funzionali',
                functionalD: 'Ricordano le tue preferenze come lingua e layout.',
                acceptAll:   'Accetta tutto',
                saveChoice:  'Salva le mie scelte',
                rejectAll:   'Rifiuta tutto',
                policy:      'Privacy Policy',
                policyLink:  '/politica-sulla-privacy',
                alwaysOn:    'Sempre attivo',
            },
            pt: {
                title:       'Preferências de Cookies',
                intro:       'Usamos cookies para melhorar sua experiência. Você pode escolher quais categorias permitir.',
                necessary:   'Necessários',
                necessaryD:  'Indispensáveis para o funcionamento do site.',
                analytics:   'Analíticos',
                analyticsD:  'Nos ajudam a entender como os visitantes interagem com o site.',
                functional:  'Funcionais',
                functionalD: 'Lembram suas preferências como idioma e layout.',
                acceptAll:   'Aceitar tudo',
                saveChoice:  'Salvar minhas escolhas',
                rejectAll:   'Rejeitar tudo',
                policy:      'Política de Privacidade',
                policyLink:  '/politica-de-privacidade',
                alwaysOn:    'Sempre ativo',
            },
        };

        const pageLang = window.location.pathname.split('/')[1] || 'en';
        const t = LABELS[pageLang] || LABELS['en'];

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
            /**
             * Check if the current user is in the EU/EEA.
             * Calls back with (isEU: bool, countryCode: string|null)
             */
            detectEU(callback) {
                window.fetchGeoIP()
                    .then((data) => {
                        const cc = data.country_code || '';
                        callback(EU_COUNTRIES.has(cc), cc);
                    })
                    .catch(() => {
                        // On failure, assume EU to be safe (privacy-first)
                        console.warn('[GDPR] Could not detect country — defaulting to EU mode.');
                        callback(true, null);
                    });
            },

            /**
             * Show the GDPR panel if consent has not been given yet.
             * onConsent(consentObject) called after user makes a choice.
             */
            init(onConsent) {
                const existing = getConsent();
                if (existing) {
                    // Consent already recorded — fire callback immediately
                    onConsent(existing);
                    return;
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
    //  SIMPLE COOKIE BANNER (non-EU)
    //  Minimal accept/reject — same visual style as before
    // ═══════════════════════════════════════════════════════════

    (function($) {
        $.fn.cookieBanner = function(options) {
            const settings = $.extend({
                expires:    CONSENT_EXPIRES,
                cookieName: SIMPLE_COOKIE,
                customLangMessages: {
                    en: {
                        message:    'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
                        buttonText: 'I Agree',
                        rejectText: 'I Reject',
                        policyLink: '#privacy-policy',
                        policyText: 'Learn more about our cookie policy'
                    }
                },
                onAccept: function() {},
                onReject: function() {}
            }, options);

            const languages = settings.customLangMessages;
            let lang        = window.location.pathname.split('/')[1];
            if (!languages[lang]) lang = 'en';
            const texts = languages[lang];

            function createBanner() {
                const banner = $('<div>', {
                    id: 'simple-cookie-banner',
                    class: 'cookie-banner fixed-bottom text-white text-center p-3',
                    style: 'opacity:0; transform:translateY(20px);'
                }).appendTo('body');

                $('<p>', { class: 'd-block' })
                    .text(texts.message)
                    .append(
                        $('<a>', {
                            href:  texts.policyLink,
                            class: 'text-decoration-none text_red ms-2',
                        }).append($('<strong>').append($('<u>').text(texts.policyText)))
                    )
                    .appendTo(banner);

                $('<button>', { class: 'cookie-accept btn btn-success ms-3', text: texts.buttonText }).appendTo(banner);
                $('<button>', { class: 'cookie-reject btn btn-danger ms-2',  text: texts.rejectText  }).appendTo(banner);

                // Animate in
                gsap.to('#simple-cookie-banner', {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out',
                    delay: 0.3
                });
            }

            function dismissBanner(accepted) {
                gsap.to('#simple-cookie-banner', {
                    opacity: 0,
                    y: 20,
                    duration: 0.35,
                    ease: 'power2.in',
                    onComplete: () => {
                        $('#simple-cookie-banner').remove();
                        if (accepted) settings.onAccept();
                        else          settings.onReject();
                    }
                });
            }

            return this.each(function() {
                const consent = Cookies.get(settings.cookieName);
                if (consent === 'true') {
                    settings.onAccept();
                } else if (consent === undefined) {
                    createBanner();

                    $('body')
                        .off('click', '.cookie-accept')
                        .on('click',  '.cookie-accept', function() {
                            Cookies.set(settings.cookieName, 'true', { expires: settings.expires });
                            dismissBanner(true);
                        });

                    $('body')
                        .off('click', '.cookie-reject')
                        .on('click',  '.cookie-reject', function() {
                            Cookies.set(settings.cookieName, 'false', { expires: settings.expires });
                            dismissBanner(false);
                        });
                }
            });
        };
    }(jQuery));


    // ═══════════════════════════════════════════════════════════
    //  LANGUAGE CASES
    // ═══════════════════════════════════════════════════════════

    const customCases = {
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

    const targetPage = window.location.origin;

    // ═══════════════════════════════════════════════════════════
    //  BOOT — decide EU vs non-EU flow
    // ═══════════════════════════════════════════════════════════

    GDPRConsent.detectEU((isEU, countryCode) => {

        if (isEU) {
            // ── EU/EEA path: show granular GDPR panel ──────────
            GDPRConsent.init((consent) => {
                // Only run the geo-redirect if functional cookies are allowed
                // (redirect = functional preference storage)
                if (consent.functional) {
                    $(document).cookieManager(customCases, targetPage);
                }
                // Fire GTM / analytics only if analytics consent given
                if (consent.analytics) {
                    // Place analytics init here if needed
                    // e.g. window.dataLayer.push({ event: 'analytics_consent_granted' })
                }
            });

        } else {
            // ── Non-EU path: simple accept/reject banner ───────
            if (Cookies.get(SIMPLE_COOKIE) === 'true') {
                $(document).cookieManager(customCases, targetPage);
            }

            $('body').cookieBanner({
                expires:    CONSENT_EXPIRES,
                cookieName: SIMPLE_COOKIE,
                customLangMessages: {
                    en: { message: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.', buttonText: 'I Agree', rejectText: 'I Reject', policyLink: '#privacy-policy', policyText: 'Learn more about our cookie policy' },
                    es: { message: 'Usamos cookies para mejorar su experiencia. Al continuar visitando este sitio, acepta nuestro uso de cookies.', buttonText: 'Estoy de acuerdo', rejectText: 'Yo rechazo', policyLink: '#privacy-policy', policyText: 'Aprende más sobre nuestra política de cookies' },
                    jp: { message: '私たちはあなたの経験を向上させるためにクッキーを使用します。', buttonText: '同意する', rejectText: '拒否する', policyLink: '#privacy-policy', policyText: '私たちのクッキーポリシーについて詳しく知る' },
                    pt: { message: 'Usamos cookies para melhorar sua experiência. Ao continuar a visitar este site, você concorda com o uso de nossos cookies.', buttonText: 'Eu concordo', rejectText: 'Eu rejeito', policyLink: '#privacy-policy', policyText: 'Saiba mais sobre nossa política de cookies' },
                    fr: { message: 'Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.', buttonText: "Je suis d'accord", rejectText: 'Je refuse', policyLink: '#privacy-policy', policyText: 'En savoir plus sur notre politique de cookies' },
                    de: { message: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.', buttonText: 'Ich stimme zu', rejectText: 'Ich lehne ab', policyLink: '#privacy-policy', policyText: 'Erfahren Sie mehr über unsere Cookie-Richtlinie' },
                    it: { message: 'Utilizziamo i cookie per migliorare la tua esperienza.', buttonText: "Sono d'accordo", rejectText: 'Rifiuto', policyLink: '#privacy-policy', policyText: 'Per saperne di più sulla nostra politica sui cookie' },
                    ru: { message: 'Мы используем куки-файлы для улучшения вашего опыта.', buttonText: 'Я согласен', rejectText: 'Я отказываюсь', policyLink: '#privacy-policy', policyText: 'Узнайте больше о нашей политике' },
                    zh: { message: '我们使用cookies来提高您的体验。', buttonText: '我同意', rejectText: '我拒绝', policyLink: '#privacy-policy', policyText: '了解更多关于我们的Cookie政策' },
                    kr: { message: '우리는 쿠키를 사용합니다.', buttonText: '동의합니다', rejectText: '거절합니다', policyLink: '#privacy-policy', policyText: '우리의 쿠키 정책에 대해 더 알아보기' },
                    ar: { message: 'نستخدم ملفات تعريف الارتباط لتعزيز تجربتك.', buttonText: 'أوافق', rejectText: 'أرفض', policyLink: '#privacy-policy', policyText: 'تعرف على المزيد حول سياسة ملفات تعريف الارتباط' },
                    hi: { message: 'हम कुकीज़ का उपयोग आपके अनुभव को बेहतर बनाने के लिए करते हैं।', buttonText: 'मैं सहमत हूँ', rejectText: 'मैं असहमत हूँ', policyLink: '#privacy-policy', policyText: 'हमारी कुकी पॉलिसी के बारे में और अधिक जानें' },
                    th: { message: 'เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์ของคุณ', buttonText: 'ยอมรับ', rejectText: 'ปฏิเสธ', policyLink: '#privacy-policy', policyText: 'เรียนรู้เพิ่มเติมเกี่ยวกับนโยบายคุกกี้' },
                    ms: { message: 'Kami menggunakan kuki untuk meningkatkan pengalaman anda.', buttonText: 'Saya Setuju', rejectText: 'Saya Tolak', policyLink: '#privacy-policy', policyText: 'Ketahui lebih lanjut tentang dasar kuki kami' },
                    id: { message: 'Kami menggunakan cookie untuk meningkatkan pengalaman Anda.', buttonText: 'Saya Setuju', rejectText: 'Saya Tolak', policyLink: '#privacy-policy', policyText: 'Pelajari lebih lanjut tentang kebijakan cookie kami' },
                    tl: { message: 'Gumagamit kami ng cookies upang mapahusay ang iyong karanasan.', buttonText: 'Sumasang-ayon Ako', rejectText: 'Tinatanggihan Ko', policyLink: '#privacy-policy', policyText: 'Matuto pa tungkol sa aming patakaran sa cookies' },
                    vi: { message: 'Chúng tôi sử dụng cookie để nâng cao trải nghiệm của bạn.', buttonText: 'Tôi Đồng Ý', rejectText: 'Tôi Từ Chối', policyLink: '#privacy-policy', policyText: 'Tìm hiểu thêm về chính sách cookie của chúng tôi' },
                },
                onAccept() {
                    $(document).cookieManager(customCases, targetPage);
                }
            });
        }
    });

    // ── Expose GDPRConsent globally for optional use elsewhere ──
    // e.g. window.GDPRConsent.allows('analytics')
    window.GDPRConsent = GDPRConsent;

});
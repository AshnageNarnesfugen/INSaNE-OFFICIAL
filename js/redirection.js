/*jQuery(() => {
    (function($) {
        $.fn.cookieManager = function(customCases, targetPage) {
            var cookieManager = {
                baseUrl: targetPage,
                hasDefaultCaseExecuted: false,
                langCases: customCases,
    
                acceptedFunctionalityCookie: function() {
                    // Si ya se ha redirigido antes, no volver a hacerlo
                    if (Cookies.get('has_been_redirected') === 'true') {
                        console.log('Redirección previa detectada. No se redirige de nuevo.');
                        return;
                    }

                    // Verifica si la URL ya contiene parámetros de idioma
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('language') && urlParams.has('browserLanguage')) {
                        console.log('URL ya contiene parámetros de idioma, no se redirige.');
                        return;
                    }

                    var language = Cookies.get('language');
                    console.log('Idioma almacenado:', language);

                    var userCountry = null;

                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === language) {
                            $.getJSON('https://ipapi.co/json/')
                                .done((data) => {
                                    userCountry = value[1].includes(data.country) ? data.country : null;
                                    if (window.location.pathname !== value[0]) {
                                        // Guarda cookie para no redirigir de nuevo
                                        Cookies.set('has_been_redirected', 'true', {
                                            expires: 7,
                                            path: '/',
                                            secure: true,
                                            sameSite: 'Strict',
                                        });

                                        window.location.href = `${this.baseUrl}${value[0]}?language=${language}&country=${userCountry}`;
                                    }
                                })
                                .fail(() => console.warn('No se pudo obtener el país del usuario.'));
                            return;
                        }
                    }
            
                    // Caso por defecto (sin idioma definido)
                    $.getJSON('https://ipapi.co/json/')
                        .done((data) => {
                            const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                            this.performRedirection(data, language, browserLanguage);
                        })
                        .fail((jqXHR, textStatus, errorThrown) => {
                            console.error('Error obteniendo país:', textStatus, errorThrown);
                            const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                            this.performRedirection({}, language, browserLanguage);
                        });
                },
    
                performRedirection: function(data, language, browserLanguage) {
                    let userCountry = data.country_code;
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === userCountry || value[1].includes(userCountry)) {
                            if (language !== userCountry) {
                                this.redirectToCountry(`${this.baseUrl}`, key, data, browserLanguage);
                            }
                            return;
                        }
                    }
                    
                    // Caso por defecto
                    if (this.hasDefaultCaseExecuted) {
                        console.log('Código de país no soportado');
                    } else {
                        this.hasDefaultCaseExecuted = true;
                        this.redirectToCountry(`${this.baseUrl}`, userCountry, data, browserLanguage);
                    }
                },
    
                redirectToCountry: function(baseUrl, lang, data, browserLanguage) {
                    const finalLang = lang || browserLanguage;
                    let userCountry = null;
                
                    // Busca coincidencia entre idioma y país
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === finalLang) {
                            if (value[1].includes(data.country)) {
                                userCountry = data.country;
                            }
                            break;
                        }
                    }
                
                    // Guarda cookies de idioma y país
                    Cookies.set('language', finalLang, {
                        expires: 365,
                        path: '/',
                        domain: this.baseUrl,
                        secure: true,
                        sameSite: 'Strict',
                    });
                
                    if (userCountry) {
                        Cookies.set('country', userCountry, {
                            expires: 365,
                            path: '/',
                            domain: this.baseUrl,
                            secure: true,
                            sameSite: 'Strict',
                        });
                    }

                    // Nueva cookie para evitar redirección repetida
                    Cookies.set('has_been_redirected', 'true', {
                        expires: 7, // La redirección se evita por 7 días
                        path: '/',
                        secure: true,
                        sameSite: 'Strict',
                    });
                
                    data.browserLanguage = browserLanguage;
                    let params = new URLSearchParams(data).toString();
                
                    let redirectPath = "";
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === finalLang) {
                            redirectPath = value[0];
                            break;
                        }
                    }
                
                    const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                    const formattedRedirectPath = redirectPath.startsWith('/') ? redirectPath.slice(1) : redirectPath;
                
                    window.location.href = formattedBaseUrl + '/' + formattedRedirectPath + '?language=' + finalLang + '&country=' + userCountry + '&' + params;
                }                       
            };
    
            return this.each(function() {
                cookieManager.acceptedFunctionalityCookie();
            });
        };
    }(jQuery));         

    (function ($) {
        $.fn.cookieBanner = function (options) {
            var settings = $.extend({
                language: 'en',
                expires: 365,
                cookieName: 'cookie_consent',
                customLangMessages: {
                    en: {
                        message: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
                        buttonText: 'I Agree',
                        rejectText: 'I Reject',
                        policyLink: '/privacy-policy',
                        policyText: 'Learn more about our cookie policy'
                    }
                },
                onAccept: function () {
                    console.log('Cookie Accepted');
                },
                onReject: function () {
                    console.log('Cookie Rejected');
                }
            }, options);
    
            var languages = settings.customLangMessages;
            var language = window.location.pathname.split('/')[1];
    
            if (!languages[language]) {
                language = 'en';
            }
    
            var texts = languages[language];
    
            function createBanner() {
                var banner = $('<div>', {
                    class: 'cookie-banner fixed-bottom text-white text-center p-3',
                }).appendTo('body');
    
                $('<p>', { class: 'd-block' })
                    .text(texts.message)
                    .append(
                        $('<a>', {
                            href: texts.policyLink,
                            class: 'text-decoration-none text_red ms-2',
                        }).append(
                            $('<strong>')
                                .append(
                                    $('<u>').text(texts.policyText)
                                )
                        )
                    )
                    .appendTo(banner);
    
                $('<button>', {
                    class: 'cookie-accept btn btn-success ms-3',
                    text: texts.buttonText
                }).appendTo(banner);
    
                $('<button>', {
                    class: 'cookie-reject btn btn-danger ms-2',
                    text: texts.rejectText
                }).appendTo(banner);
            }
    
            return this.each(function () {
                if (Cookies.get(settings.cookieName) === 'true') {
                    settings.onAccept();
                } else if (Cookies.get(settings.cookieName) === undefined) {
                    createBanner();
    
                    $('body').off('click', '.cookie-accept').on('click', '.cookie-accept', function () {
                        Cookies.set(settings.cookieName, 'true', { expires: settings.expires });
                        $('.cookie-banner').remove();
                        settings.onAccept();
                    });
    
                    $('body').off('click', '.cookie-reject').on('click', '.cookie-reject', function () {
                        Cookies.set(settings.cookieName, 'false', { expires: settings.expires });
                        $('.cookie-banner').remove();
                        settings.onReject();
                    });
                }
            });
        };
    }(jQuery));

    // Configuración de idiomas
    let customCases = {
        'EN': ['/', ['US', 'CA', 'GB', 'AU', 'NZ', 'IE', 'ZA', 'IN', 'SG']],
        'ES': ['/es', ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU']],
        'PT': ['/pt', ['PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'GQ', 'TL']],
        'JP': ['/jp', ['JP']],
        'FR': ['/fr', ['FR', 'BE', 'CA', 'CH', 'LU', 'MC', 'DZ', 'MA', 'TN']],
        'ZH': ['/zh', ['CN', 'HK', 'MO', 'SG']],
        'RU': ['/ru', ['RU', 'BY', 'KZ', 'KG', 'TJ', 'TM']],
        'DE': ['/de', ['DE', 'AT', 'CH', 'LU', 'LI', 'BE']],
        'IT': ['/it', ['IT', 'CH', 'SM', 'VA']],
        'KR': ['/kr', ['KR']],
        'AR': ['/ar', ['SA', 'EG', 'IQ', 'DZ', 'SD', 'MA', 'TN', 'OM', 'JO', 'AE', 'LB', 'LY', 'MR', 'KW', 'QA', 'BH', 'YE', 'PS', 'SO', 'KM', 'DJ', 'EH']],
        'HI': ['/hi', ['IN', 'FJ', 'MU']]
    };

    let targetPage = window.location.origin;

    if (Cookies.get('my_cookie_consent') === 'true') {
        $(document).cookieManager(customCases, targetPage);
    }

    $('body').cookieBanner({
        expires: 365,
        cookieName: 'my_cookie_consent',
        customLangMessages: {
            en: {
                message: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
                buttonText: 'I Agree',
                rejectText: 'I Reject',
                policyLink: '/privacy-policy',
                policyText: 'Learn more about our cookie policy'
            },
            es: {
                message: 'Usamos cookies para mejorar su experiencia. Al continuar visitando este sitio, acepta nuestro uso de cookies.',
                buttonText: 'Estoy de acuerdo',
                rejectText: 'Yo rechazo',
                policyLink: '/politica-de-privacidad',
                policyText: 'Aprende más sobre nuestra política de cookies'
            },
            jp: {
                message: '私たちはあなたの経験を向上させるためにクッキーを使用します。このサイトを訪れ続けることで、あなたは私たちのクッキーの使用に同意することになります。',
                buttonText: '同意する',
                rejectText: '拒否する',
                policyLink: '/puraibashi-porishi',
                policyText: '私たちのクッキーポリシーについて詳しく知る'
            },
            pt: {
                message: 'Usamos cookies para melhorar sua experiência. Ao continuar a visitar este site, você concorda com o uso de nossos cookies.',
                buttonText: 'Eu concordo',
                rejectText: 'Eu rejeito',
                policyLink: '/politica-de-privacidade',
                policyText: 'Saiba mais sobre nossa política de cookies'
            },
            fr: {
                message: 'Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.',
                buttonText: 'Je suis d\'accord',
                rejectText: 'Je refuse',
                policyLink: '/politique-de-confidentialite',
                policyText: 'En savoir plus sur notre politique de cookies'
            },
            de: {
                message: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Indem Sie diese Website weiterhin besuchen, stimmen Sie unserer Verwendung von Cookies zu.',
                buttonText: 'Ich stimme zu',
                rejectText: 'Ich lehne ab',
                policyLink: '/datenschutz-bestimmungen',
                policyText: 'Erfahren Sie mehr über unsere Cookie-Richtlinie'
            },
            it: {
                message: 'Utilizziamo i cookie per migliorare la tua esperienza. Continuando a visitare questo sito, accetti il nostro utilizzo dei cookie.',
                buttonText: 'Sono d\'accordo',
                rejectText: 'Rifiuto',
                policyLink: '/politica-sulla-privacy',
                policyText: 'Per saperne di più sulla nostra politica sui cookie'
            },
            ru: {
                message: 'Мы используем куки-файлы для улучшения вашего опыта. Продолжая посещать этот сайт, вы соглашаетесь на использование наших куки-файлов.',
                buttonText: 'Я согласен',
                rejectText: 'Я отказываюсь',
                policyLink: '/politika-konfidentsialnosti',
                policyText: 'Узнайте больше о нашей политике в отношении файлов cookie'
            },
            zh: {
                message: '我们使用cookies来提高您的体验。继续访问此网站即表示您同意我们使用cookies。',
                buttonText: '我同意',
                rejectText: '我拒绝',
                policyLink: '/yinsi-zhengce',
                policyText: '了解更多关于我们的Cookie政策'
            },
            kr: {
                message: '우리는 당신의 경험을 향상시키기 위해 쿠키를 사용합니다. 이 사이트를 계속 방문함으로써 당신은 우리의 쿠키 사용에 동의하게 됩니다.',
                buttonText: '동의합니다',
                rejectText: '거절합니다',
                policyLink: '/gaeinjeongbocheolibangchim',
                policyText: '우리의 쿠키 정책에 대해 더 알아보기'
            },
            ar: {
                message: 'نستخدم ملفات تعريف الارتباط لتعزيز تجربتك. من خلال الاستمرار في زيارة هذا الموقع، فإنك توافق على استخدامنا لملفات تعريف الارتباط.',
                buttonText: 'أوافق',
                rejectText: 'أرفض',
                policyLink: '/siasatu-alkhususia',
                policyText: 'تعرف على المزيد حول سياسة ملفات تعريف الارتباط لدينا'
            },
            hi: {
                message: 'हम कुकीज़ का उपयोग आपके अनुभव को बेहतर बनाने के लिए करते हैं। इस साइट का दौरा करने का जारी रखकर आप हमारे कुकीज़ के उपयोग से सहमत होते हैं।',
                buttonText: 'मैं सहमत हूँ',
                rejectText: 'मैं असहमत हूँ',
                policyLink: '/gopaneeyata-neeti',
                policyText: 'हमारी कुकी पॉलिसी के बारे में और अधिक जानें'
            }                       
        },
        onAccept: function() {
            $(document).cookieManager(customCases, targetPage);
        }
    }).init();

});*/

jQuery(() => {
    (function($) {
        $.fn.cookieManager = function(customCases, targetPage) {
            var cookieManager = {
                baseUrl: targetPage,
                hasDefaultCaseExecuted: false,
                langCases: customCases,
    
                acceptedFunctionalityCookie: function() {
                    // Si ya se ha redirigido antes, no volver a hacerlo
                    if (Cookies.get('has_been_redirected') === 'true') {
                        console.log('Redirección previa detectada. No se redirige de nuevo.');
                        return;
                    }
 
                    // Verifica si la URL ya contiene parámetros de idioma
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('language') && urlParams.has('browserLanguage')) {
                        console.log('URL ya contiene parámetros de idioma, no se redirige.');
                        return;
                    }
 
                    var language = Cookies.get('language');
                    console.log('Idioma almacenado:', language);
 
                    var userCountry = null;
 
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === language) {
                            $.getJSON('https://ipapi.co/json/')
                                .done((data) => {
                                    userCountry = value[1].includes(data.country) ? data.country : null;
                                    if (window.location.pathname !== value[0]) {
                                        // Guarda cookie para no redirigir de nuevo
                                        Cookies.set('has_been_redirected', 'true', {
                                            expires: 7,
                                            path: '/',
                                            secure: true,
                                            sameSite: 'Strict',
                                        });
 
                                        window.location.href = `${this.baseUrl}${value[0]}?language=${language}&country=${userCountry}`;
                                    }
                                })
                                .fail(() => console.warn('No se pudo obtener el país del usuario.'));
                            return;
                        }
                    }
            
                    // Caso por defecto (sin idioma definido)
                    $.getJSON('https://ipapi.co/json/')
                        .done((data) => {
                            const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                            this.performRedirection(data, language, browserLanguage);
                        })
                        .fail((jqXHR, textStatus, errorThrown) => {
                            console.error('Error obteniendo país:', textStatus, errorThrown);
                            const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                            this.performRedirection({}, language, browserLanguage);
                        });
                },
    
                performRedirection: function(data, language, browserLanguage) {
                    let userCountry = data.country_code;
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === userCountry || value[1].includes(userCountry)) {
                            if (language !== userCountry) {
                                this.redirectToCountry(`${this.baseUrl}`, key, data, browserLanguage);
                            }
                            return;
                        }
                    }
                    
                    // Caso por defecto
                    if (this.hasDefaultCaseExecuted) {
                        console.log('Código de país no soportado');
                    } else {
                        this.hasDefaultCaseExecuted = true;
                        this.redirectToCountry(`${this.baseUrl}`, userCountry, data, browserLanguage);
                    }
                },
    
                redirectToCountry: function(baseUrl, lang, data, browserLanguage) {
                    const finalLang = lang || browserLanguage;
                    let userCountry = null;
                
                    // Busca coincidencia entre idioma y país
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === finalLang) {
                            if (value[1].includes(data.country)) {
                                userCountry = data.country;
                            }
                            break;
                        }
                    }
                
                    // Guarda cookies de idioma y país
                    Cookies.set('language', finalLang, {
                        expires: 365,
                        path: '/',
                        domain: this.baseUrl,
                        secure: true,
                        sameSite: 'Strict',
                    });
                
                    if (userCountry) {
                        Cookies.set('country', userCountry, {
                            expires: 365,
                            path: '/',
                            domain: this.baseUrl,
                            secure: true,
                            sameSite: 'Strict',
                        });
                    }
 
                    // Nueva cookie para evitar redirección repetida
                    Cookies.set('has_been_redirected', 'true', {
                        expires: 7, // La redirección se evita por 7 días
                        path: '/',
                        secure: true,
                        sameSite: 'Strict',
                    });
                
                    data.browserLanguage = browserLanguage;
                    let params = new URLSearchParams(data).toString();
                
                    let redirectPath = "";
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === finalLang) {
                            redirectPath = value[0];
                            break;
                        }
                    }
                
                    const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                    const formattedRedirectPath = redirectPath.startsWith('/') ? redirectPath.slice(1) : redirectPath;
                
                    window.location.href = formattedBaseUrl + '/' + formattedRedirectPath + '?language=' + finalLang + '&country=' + userCountry + '&' + params;
                }                       
            };
    
            return this.each(function() {
                cookieManager.acceptedFunctionalityCookie();
            });
        };
    }(jQuery));         
 
    (function ($) {
        $.fn.cookieBanner = function (options) {
            var settings = $.extend({
                language: 'en',
                expires: 365,
                cookieName: 'cookie_consent',
                customLangMessages: {
                    en: {
                        message: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
                        buttonText: 'I Agree',
                        rejectText: 'I Reject',
                        policyLink: '/privacy-policy',
                        policyText: 'Learn more about our cookie policy'
                    }
                },
                onAccept: function () {
                    console.log('Cookie Accepted');
                },
                onReject: function () {
                    console.log('Cookie Rejected');
                }
            }, options);
    
            var languages = settings.customLangMessages;
            var language = window.location.pathname.split('/')[1];
    
            if (!languages[language]) {
                language = 'en';
            }
    
            var texts = languages[language];
    
            function createBanner() {
                var banner = $('<div>', {
                    class: 'cookie-banner fixed-bottom text-white text-center p-3',
                }).appendTo('body');
    
                $('<p>', { class: 'd-block' })
                    .text(texts.message)
                    .append(
                        $('<a>', {
                            href: texts.policyLink,
                            class: 'text-decoration-none text_red ms-2',
                        }).append(
                            $('<strong>')
                                .append(
                                    $('<u>').text(texts.policyText)
                                )
                        )
                    )
                    .appendTo(banner);
    
                $('<button>', {
                    class: 'cookie-accept btn btn-success ms-3',
                    text: texts.buttonText
                }).appendTo(banner);
    
                $('<button>', {
                    class: 'cookie-reject btn btn-danger ms-2',
                    text: texts.rejectText
                }).appendTo(banner);
            }
    
            return this.each(function () {
                if (Cookies.get(settings.cookieName) === 'true') {
                    settings.onAccept();
                } else if (Cookies.get(settings.cookieName) === undefined) {
                    createBanner();
    
                    $('body').off('click', '.cookie-accept').on('click', '.cookie-accept', function () {
                        Cookies.set(settings.cookieName, 'true', { expires: settings.expires });
                        $('.cookie-banner').remove();
                        settings.onAccept();
                    });
    
                    $('body').off('click', '.cookie-reject').on('click', '.cookie-reject', function () {
                        Cookies.set(settings.cookieName, 'false', { expires: settings.expires });
                        $('.cookie-banner').remove();
                        settings.onReject();
                    });
                }
            });
        };
    }(jQuery));
 
    // Configuración de idiomas
    let customCases = {
        'EN': ['/',    ['US', 'CA', 'GB', 'AU', 'NZ', 'IE', 'ZA', 'SG']],
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
        // ── SEA ──────────────────────────────────────────────────────────────
        'TH': ['/th',  ['TH']],
        'MS': ['/ms',  ['MY', 'BN']],          // Malaysia + Brunei
        'ID': ['/id',  ['ID']],
        'TL': ['/tl',  ['PH']],
        'VI': ['/vi',  ['VN']]
    };
 
    let targetPage = window.location.origin;
 
    if (Cookies.get('my_cookie_consent') === 'true') {
        $(document).cookieManager(customCases, targetPage);
    }
 
    $('body').cookieBanner({
        expires: 365,
        cookieName: 'my_cookie_consent',
        customLangMessages: {
            en: {
                message: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
                buttonText: 'I Agree',
                rejectText: 'I Reject',
                policyLink: '/privacy-policy',
                policyText: 'Learn more about our cookie policy'
            },
            es: {
                message: 'Usamos cookies para mejorar su experiencia. Al continuar visitando este sitio, acepta nuestro uso de cookies.',
                buttonText: 'Estoy de acuerdo',
                rejectText: 'Yo rechazo',
                policyLink: '/politica-de-privacidad',
                policyText: 'Aprende más sobre nuestra política de cookies'
            },
            jp: {
                message: '私たちはあなたの経験を向上させるためにクッキーを使用します。このサイトを訪れ続けることで、あなたは私たちのクッキーの使用に同意することになります。',
                buttonText: '同意する',
                rejectText: '拒否する',
                policyLink: '/puraibashi-porishi',
                policyText: '私たちのクッキーポリシーについて詳しく知る'
            },
            pt: {
                message: 'Usamos cookies para melhorar sua experiência. Ao continuar a visitar este site, você concorda com o uso de nossos cookies.',
                buttonText: 'Eu concordo',
                rejectText: 'Eu rejeito',
                policyLink: '/politica-de-privacidade',
                policyText: 'Saiba mais sobre nossa política de cookies'
            },
            fr: {
                message: 'Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.',
                buttonText: 'Je suis d\'accord',
                rejectText: 'Je refuse',
                policyLink: '/politique-de-confidentialite',
                policyText: 'En savoir plus sur notre politique de cookies'
            },
            de: {
                message: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Indem Sie diese Website weiterhin besuchen, stimmen Sie unserer Verwendung von Cookies zu.',
                buttonText: 'Ich stimme zu',
                rejectText: 'Ich lehne ab',
                policyLink: '/datenschutz-bestimmungen',
                policyText: 'Erfahren Sie mehr über unsere Cookie-Richtlinie'
            },
            it: {
                message: 'Utilizziamo i cookie per migliorare la tua esperienza. Continuando a visitare questo sito, accetti il nostro utilizzo dei cookie.',
                buttonText: 'Sono d\'accordo',
                rejectText: 'Rifiuto',
                policyLink: '/politica-sulla-privacy',
                policyText: 'Per saperne di più sulla nostra politica sui cookie'
            },
            ru: {
                message: 'Мы используем куки-файлы для улучшения вашего опыта. Продолжая посещать этот сайт, вы соглашаетесь на использование наших куки-файлов.',
                buttonText: 'Я согласен',
                rejectText: 'Я отказываюсь',
                policyLink: '/politika-konfidentsialnosti',
                policyText: 'Узнайте больше о нашей политике в отношении файлов cookie'
            },
            zh: {
                message: '我们使用cookies来提高您的体验。继续访问此网站即表示您同意我们使用cookies。',
                buttonText: '我同意',
                rejectText: '我拒绝',
                policyLink: '/yinsi-zhengce',
                policyText: '了解更多关于我们的Cookie政策'
            },
            kr: {
                message: '우리는 당신의 경험을 향상시키기 위해 쿠키를 사용합니다. 이 사이트를 계속 방문함으로써 당신은 우리의 쿠키 사용에 동의하게 됩니다.',
                buttonText: '동의합니다',
                rejectText: '거절합니다',
                policyLink: '/gaeinjeongbocheolibangchim',
                policyText: '우리의 쿠키 정책에 대해 더 알아보기'
            },
            ar: {
                message: 'نستخدم ملفات تعريف الارتباط لتعزيز تجربتك. من خلال الاستمرار في زيارة هذا الموقع، فإنك توافق على استخدامنا لملفات تعريف الارتباط.',
                buttonText: 'أوافق',
                rejectText: 'أرفض',
                policyLink: '/siasatu-alkhususia',
                policyText: 'تعرف على المزيد حول سياسة ملفات تعريف الارتباط لدينا'
            },
            hi: {
                message: 'हम कुकीज़ का उपयोग आपके अनुभव को बेहतर बनाने के लिए करते हैं। इस साइट का दौरा करने का जारी रखकर आप हमारे कुकीज़ के उपयोग से सहमत होते हैं।',
                buttonText: 'मैं सहमत हूँ',
                rejectText: 'मैं असहमत हूँ',
                policyLink: '/gopaneeyata-neeti',
                policyText: 'हमारी कुकी पॉलिसी के बारे में और अधिक जानें'
            },
            // ── SEA ──────────────────────────────────────────────────────────
            th: {
                message: 'เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์ของคุณ การที่คุณยังคงเข้าชมเว็บไซต์นี้ถือว่าคุณยอมรับการใช้คุกกี้ของเรา',
                buttonText: 'ยอมรับ',
                rejectText: 'ปฏิเสธ',
                policyLink: '/nayobai-khwam-s-wan-tua',
                policyText: 'เรียนรู้เพิ่มเติมเกี่ยวกับนโยบายคุกกี้ของเรา'
            },
            ms: {
                message: 'Kami menggunakan kuki untuk meningkatkan pengalaman anda. Dengan terus melawat laman ini, anda bersetuju dengan penggunaan kuki kami.',
                buttonText: 'Saya Setuju',
                rejectText: 'Saya Tolak',
                policyLink: '/dasar-privasi',
                policyText: 'Ketahui lebih lanjut tentang dasar kuki kami'
            },
            id: {
                message: 'Kami menggunakan cookie untuk meningkatkan pengalaman Anda. Dengan terus mengunjungi situs ini, Anda menyetujui penggunaan cookie kami.',
                buttonText: 'Saya Setuju',
                rejectText: 'Saya Tolak',
                policyLink: '/kebijakan-privasi',
                policyText: 'Pelajari lebih lanjut tentang kebijakan cookie kami'
            },
            tl: {
                message: 'Gumagamit kami ng cookies upang mapahusay ang iyong karanasan. Sa pagpapatuloy ng pagbisita sa site na ito, sumasang-ayon ka sa aming paggamit ng cookies.',
                buttonText: 'Sumasang-ayon Ako',
                rejectText: 'Tinatanggihan Ko',
                policyLink: '/patakaran-sa-privacy',
                policyText: 'Matuto pa tungkol sa aming patakaran sa cookies'
            },
            vi: {
                message: 'Chúng tôi sử dụng cookie để nâng cao trải nghiệm của bạn. Bằng cách tiếp tục truy cập trang web này, bạn đồng ý với việc sử dụng cookie của chúng tôi.',
                buttonText: 'Tôi Đồng Ý',
                rejectText: 'Tôi Từ Chối',
                policyLink: '/chinh-sach-bao-mat',
                policyText: 'Tìm hiểu thêm về chính sách cookie của chúng tôi'
            }
        },
        onAccept: function() {
            $(document).cookieManager(customCases, targetPage);
        }
    }).init();
 
});
 
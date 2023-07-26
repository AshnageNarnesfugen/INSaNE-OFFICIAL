jQuery(() => {
    (function($) {
        $.fn.cookieManager = function(customCases, targetPage) {
            var cookieManager = {
                baseUrl: targetPage,
                hasDefaultCaseExecuted: false,
                langCases: customCases,
    
                acceptedFunctionalityCookie: function() {
                    // Check if the current URL already has the necessary parameters
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('language') && urlParams.has('browserLanguage') && urlParams.has('country')) {
                        return;
                    }
                
                    var language = Cookies.get('language');
                    console.log(language);
                
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === language || value[1].includes(language)) {
                            let country = value[1].includes(language) ? language : "";
                            if (window.location.pathname !== value[0]) {
                                window.location.href = `${this.baseUrl}${value[0]}?language=${language}` + (country ? '&country=' + country : '');
                            }
                            return;
                        }
                    }
                
                    // Default Case
                    $.getJSON('https://ipapi.co/json/')
                        .done((data) => {
                            const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                            this.performRedirection(data, language, browserLanguage);
                        })
                        .fail((jqXHR, textStatus, errorThrown) => {
                            console.error('Failed to retrieve country code:', textStatus, errorThrown);
                            const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                            console.log(browserLanguage);
                            this.performRedirection({}, language, browserLanguage);
                        });
                },
    
                performRedirection: function(data, language, browserLanguage) {
                    let userCountry = data.country_code;
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === userCountry || value[1].includes(userCountry)) {
                            let country = value[1].includes(userCountry) ? userCountry : "";
                            if (language !== userCountry) {
                                this.redirectToCountry(`${this.baseUrl}`, key, data, browserLanguage, country); // Added country parameter
                            }
                            return;
                        }
                    }
                    
                    // Default Case
                    if (this.hasDefaultCaseExecuted) {
                        console.log('Country code not supported');
                    } else {
                        this.hasDefaultCaseExecuted = true;
                        this.redirectToCountry(`${this.baseUrl}`, userCountry, data, browserLanguage, userCountry); // Added country parameter
                    }
                },
    
                redirectToCountry: function(baseUrl, lang, data, browserLanguage, country) {
                    const finalLang = lang || browserLanguage;
                    Cookies.set('language', finalLang, {
                        expires: 365,
                        path: '/',
                        domain: this.baseUrl,
                        secure: true,
                        sameSite: 'Strict',
                    });
                    data.browserLanguage = browserLanguage;
                    let params = new URLSearchParams(data).toString();
                
                    let redirectPath = "";
                    for (let [key, value] of Object.entries(this.langCases)) {
                        if (key === finalLang || value[1].includes(finalLang)) {
                            redirectPath = value[0];
                            break;
                        }
                    }
                    
                    // Remove any trailing slash from baseUrl and any leading slash from redirectPath
                    const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                    const formattedRedirectPath = redirectPath.startsWith('/') ? redirectPath.slice(1) : redirectPath;
                
                    // Add the language and country parameters to the URL
                    window.location.href = formattedBaseUrl + '/' + formattedRedirectPath + '?language=' + finalLang + (country ? '&country=' + country : '') + '&' + params;
                }                
            };
    
            return this.each(function() {
                cookieManager.acceptedFunctionalityCookie();
            });
        };
    }(jQuery));             

    (function($) {
        $.fn.cookieBanner = function(options) {
            var settings = $.extend({
                language: 'en',
                expires: 365,  // Number of days until the cookie expires
                cookieName: 'cookie_consent',
                customLangMessages: {
                    en: {
                        message: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
                        buttonText: 'I Agree',
                        rejectText: 'I Reject',
                        policyLink: '/privacy-policy',
                        policyText: 'Learn more about our cookie policy'
                    }
                    // Add more languages here...
                },
                onAccept: function() {
                    console.log('Cookie Accepted')
                },  // Function to execute when the user clicks "I Agree"
                onReject: function() {
                    console.log('Cookie Rejected')
                }  // Function to execute when the user clicks "I Reject"
            }, options);
    
            var languages = settings.customLangMessages;
    
            // Get language from URL
            var language = window.location.pathname.split('/')[1];
    
            // If language is not supported, default to 'en'
            if (!languages[language]) {
                language = 'en';
            }
    
            var texts = languages[language];
            
            this.init = function() {
                return this.each(function() {
                if (Cookies.get(settings.cookieName) === 'true') {
                    settings.onAccept();
                } else if (Cookies.get(settings.cookieName) === undefined) {
                        var banner = $('<div>', { class: 'cookie-banner fixed-bottom bg-dark text-white text-center p-3' }).appendTo(this);
                        var message = $('<p>', { class: 'd-inline' }).text(texts.message).appendTo(banner);
                        var policyLink = $('<a>', { href: texts.policyLink, class: 'text-decoration-none text-white ms-2' }).text(texts.policyText).appendTo(message);
                        var acceptButton = $('<button>', { class: 'cookie-accept btn btn-success ms-3' }).text(texts.buttonText).appendTo(banner);
                        var rejectButton = $('<button>', { class: 'cookie-reject btn btn-danger ms-2' }).text(texts.rejectText).appendTo(banner);
            
                        $('body').on('click', '.cookie-accept', function() {
                            Cookies.set(settings.cookieName, 'true', { expires: settings.expires });
                            banner.remove();
                            settings.onAccept();
                        });
            
                        $('body').on('click', '.cookie-reject', function() {
                            Cookies.set(settings.cookieName, 'false', { expires: settings.expires });
                            settings.onReject();
                            banner.remove();
                        });
                    }
                });
            }
            return this.init();
        };
    }(jQuery));

    let customCases = {
        'US': ['/', ['CA', 'GB', 'AU', 'NZ', 'IE', 'ZA', 'IN', 'SG']],
        'ES': ['/es', ['MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU']],
        'PT': ['/pt', ['BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'GQ', 'TL']],
        'JP': ['/ja', []],
        'FR': ['/fr', ['BE', 'CA', 'CH', 'LU', 'MC', 'DZ', 'MA', 'TN']],
        'CN': ['/cn', ['HK', 'MO', 'SG']],
        'RU': ['/ru', ['BY', 'KZ', 'KG', 'TJ', 'TM']],
        'DE': ['/de', ['AT', 'CH', 'LU', 'LI', 'BE']],
        'IT': ['/it', ['CH', 'SM', 'VA']],
        'KR': ['/kr', []]
    } 
    let targetPage = window.location.origin
    if (Cookies.get('my_cookie_consent') === 'true') {
        $(document).cookieManager(customCases, targetPage);
    }
    $('body').cookieBanner({
        expires: 365,  // Number of days until the cookie expires
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
            ja: {
                message: '私たちはあなたの経験を向上させるためにクッキーを使用します。このサイトを訪れ続けることで、あなたは私たちのクッキーの使用に同意することになります。',
                buttonText: '同意する',
                rejectText: '拒否する',
                policyLink: '/プライバシーポリシー',
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
                policyLink: '/политика-конфиденциальности',
                policyText: 'Узнайте больше о нашей политике в отношении файлов cookie'
            },
            cn: {
                message: '我们使用cookies来提高您的体验。继续访问此网站即表示您同意我们使用cookies。',
                buttonText: '我同意',
                rejectText: '我拒绝',
                policyLink: '/隐私政策',
                policyText: '了解更多关于我们的Cookie政策'
            },
            kr: {
                message: '우리는 당신의 경험을 향상시키기 위해 쿠키를 사용합니다. 이 사이트를 계속 방문함으로써 당신은 우리의 쿠키 사용에 동의하게 됩니다.',
                buttonText: '동의합니다',
                rejectText: '거절합니다',
                policyLink: '/개인정보처리방침',
                policyText: '우리의 쿠키 정책에 대해 더 알아보기'
            }
            // Add more languages here...
        },
        onAccept: function() {
            // Code to execute when the user clicks "I Agree"
            $(document).cookieManager(customCases, targetPage);
        }
    }).init();
})
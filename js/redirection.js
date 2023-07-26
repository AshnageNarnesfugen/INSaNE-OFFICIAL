jQuery(() => {
    class CookieManager {
        constructor(customCases, targetPage) {
            this.baseUrl = targetPage;
            this.hasDefaultCaseExecuted = false;
            this.langCases = customCases;
        }
    
        acceptedFunctionalityCookie() {
            // Check if the current URL already has the necessary parameters
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('language') && urlParams.has('browserLanguage')) {
                return;
            }
    
            var language = Cookies.get('language');
            console.log(language);
    
            for (let [key, value] of Object.entries(this.langCases)) {
                if (key === language || value[1].includes(language)) {
                    if (window.location.pathname !== value[0]) {
                        window.location.href = `${this.baseUrl}${value[0]}?language=${language}`;
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
        }
    
        performRedirection(data, language, browserLanguage) {
            let userCountry = data.country_code;
            for (let [key, value] of Object.entries(this.langCases)) {
                if (key === userCountry || value[1].includes(userCountry)) {
                    if (language !== userCountry) {
                        this.redirectToCountry(`${this.baseUrl}`, key, data, browserLanguage); // Changed value[0] to key
                    }
                    return;
                }
            }
            
            // Default Case
            if (this.hasDefaultCaseExecuted) {
                console.log('Country code not supported');
            } else {
                this.hasDefaultCaseExecuted = true;
                this.redirectToCountry(`${this.baseUrl}`, userCountry, data, browserLanguage);
            }
        }        
    
        redirectToCountry(baseUrl, lang, data, browserLanguage) {
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
        
            window.location.href = formattedBaseUrl + '/' + formattedRedirectPath + '?language=' + finalLang + '&' + params;
        }                                                   
    }         
    
    /*
    class CookieConsentHandler {
        constructor() {
            this.cookieManager = new CookieManager({
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
            }, window.location.origin);
            this.langMessages = this.getLanguageMessages();
            this.cookieConsentConfig = this.getCookieConsentConfig();
        }

        getLanguageMessages() {
            const baseURL = 'https://insane-bh.space';
            const defaultLangMSG = {
                "header": "Cookies used on the website!",
                "message": "This website uses cookies to ensure you get the best experience on our website.",
                "dismiss": "Got it!",
                "allow": "Allow cookies",
                "deny": "Decline",
                "link": "Learn More",
                "href": "https://www.example.com/cookies",
                "close": "❌",
                "policy": "Cookie Policy"
            };

            return {
                [`${baseURL}`]: defaultLangMSG,
                [`${baseURL}/es`]: {
                    "header": "¡Cookies usadas en el sitio web!",
                    "message": "Este sitio web utiliza cookies para garantizar que obtenga la mejor experiencia en nuestro sitio web.",
                    "dismiss": "¡Entiendo!",
                    "allow": "Permitir cookies",
                    "deny": "Rechazar",
                    "link": "Saber más",
                    "href": defaultLangMSG.href,
                    "close": "❌",
                    "policy": "Política de Cookies"
                },
                [`${baseURL}/ja`]: {
                    "header": "ウェブサイトでのクッキーの使用について",
                    "message": "当ウェブサイトでは、最良の体験を提供するためにクッキーを使用しています。",
                    "dismiss": "了解しました！",
                    "allow": "クッキーを許可する",
                    "deny": "拒否する",
                    "link": "詳細を知る",
                    "href": defaultLangMSG.href,
                    "close": "❌",
                    "policy": "クッキーポリシー"
                },
                [`${baseURL}/pt`]: {
                    "header": "Usando cookies no site da Web!",
                    "message": "O meu website usa cookies para fornecer uma experiência ótima.",
                    "dismiss": "Entendi!",
                    "allow": "Aceitar",
                    "deny": "Negar",
                    "link": "Saiba mais",
                    "href": defaultLangMSG.href,
                    "close": "❌",
                    "policy": "Política de cookies"
                },
            };
        }

        getCookieConsentConfig() {
            const langMSG = this.langMessages[window.location.href.split("?")[0]] || this.langMessages['https://insane-bh.space'];

            return {
                "palette": {
                    "popup": {
                        "background": "#292929",
                        "text": "#ffffff"
                    },
                    "button": {
                        "background": "red",
                        "text": "#000000"
                    }
                },
                "content": langMSG,
                "position": "bottom-left",
                "type": "opt-in",
                "onInitialise": (status) => {
                    var consent = Cookies.get('cookieconsent_status');
                    if (consent && consent == 'allow') {
                        console.log('Cookies are allowed!');
                        this.cookieManager.acceptedFunctionalityCookie();
                    }
                },
                "onStatusChange": (status) => {
                    if (status == 'allow') {
                        console.log('Cookies are allowed!');
                        this.cookieManager.acceptedFunctionalityCookie();
                    } else {
                        console.log('Cookies are not allowed!');
                    }
                },
                "onRevokeChoice": () => {
                    console.log('Cookies consent has been revoked!');
                },
                "onNoCookieLaw": () => {
                    console.log('No cookie law is applied!');
                },
                "onAccept": () => {
                    console.log('Cookies have been accepted!');
                    this.cookieManager.acceptedFunctionalityCookie();
                }
            };
        }

        init() {
            $(window).on("load", () => {
                cookieconsent.initialise(this.cookieConsentConfig);
            });
        }
    }

    // Usage:
    new CookieConsentHandler().init();
    */
    (function($) {
        $.fn.cookieBanner = function(options) {
            var settings = $.extend({
                language: 'en',
                expires: 365,  // Number of days until the cookie expires
                cookieName: 'cookie_consent',
                onAccept: function() {},  // Function to execute when the user clicks "I Agree"
                onReject: function() {}  // Function to execute when the user clicks "I Reject"
            }, options);
    
            var languages = {
                en: {
                    message: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
                    buttonText: 'I Agree',
                    rejectText: 'I Reject',
                    policyLink: '/privacy-policy',
                    policyText: 'Learn more'
                },
                es: {
                    message: 'Usamos cookies para mejorar su experiencia. Al continuar visitando este sitio, acepta nuestro uso de cookies.',
                    buttonText: 'Estoy de acuerdo',
                    rejectText: 'Yo rechazo',
                    policyLink: '/politica-de-privacidad',
                    policyText: 'Aprende más'
                },
                ja: {
                    message: '私たちはあなたの経験を向上させるためにクッキーを使用します。このサイトを訪れ続けることで、あなたは私たちのクッキーの使用に同意することになります。',
                    buttonText: '同意する',
                    rejectText: '拒否する',
                    policyLink: '/プライバシーポリシー',
                    policyText: 'もっと知る'
                },
                pt: {
                    message: 'Usamos cookies para melhorar sua experiência. Ao continuar a visitar este site, você concorda com o uso de nossos cookies.',
                    buttonText: 'Eu concordo',
                    rejectText: 'Eu rejeito',
                    policyLink: '/politica-de-privacidade',
                    policyText: 'Saiba mais'
                },
                fr: {
                    message: 'Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.',
                    buttonText: 'Je suis d\'accord',
                    rejectText: 'Je refuse',
                    policyLink: '/politique-de-confidentialite',
                    policyText: 'En savoir plus'
                },
                de: {
                    message: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Indem Sie diese Website weiterhin besuchen, stimmen Sie unserer Verwendung von Cookies zu.',
                    buttonText: 'Ich stimme zu',
                    rejectText: 'Ich lehne ab',
                    policyLink: '/datenschutz-bestimmungen',
                    policyText: 'Erfahren Sie mehr'
                },
                it: {
                    message: 'Utilizziamo i cookie per migliorare la tua esperienza. Continuando a visitare questo sito, accetti il nostro utilizzo dei cookie.',
                    buttonText: 'Sono d\'accordo',
                    rejectText: 'Rifiuto',
                    policyLink: '/politica-sulla-privacy',
                    policyText: 'Per saperne di più'
                },
                ru: {
                    message: 'Мы используем куки-файлы для улучшения вашего опыта. Продолжая посещать этот сайт, вы соглашаетесь на использование наших куки-файлов.',
                    buttonText: 'Я согласен',
                    rejectText: 'Я отказываюсь',
                    policyLink: '/политика-конфиденциальности',
                    policyText: 'Узнать больше'
                },
                cn: {
                    message: '我们使用cookies来提高您的体验。继续访问此网站即表示您同意我们使用cookies。',
                    buttonText: '我同意',
                    rejectText: '我拒绝',
                    policyLink: '/隐私政策',
                    policyText: '了解更多'
                },
                kr: {
                    message: '우리는 당신의 경험을 향상시키기 위해 쿠키를 사용합니다. 이 사이트를 계속 방문함으로써 당신은 우리의 쿠키 사용에 동의하게 됩니다.',
                    buttonText: '동의합니다',
                    rejectText: '거절합니다',
                    policyLink: '/개인정보처리방침',
                    policyText: '더 알아보기'
                }
                // Add more languages here...
            };
    
            // Get language from URL
            var language = window.location.pathname.split('/')[1];
    
            // If language is not supported, default to 'en'
            if (!languages[language]) {
                language = 'en';
            }
    
            var texts = languages[language];
    
            return {
                init: function() {
                    return this.each(function() {
                        var banner = $('<div>', { class: 'cookie-banner fixed-bottom bg-dark text-white text-center p-3' }).appendTo(this);
                        var message = $('<p>', { class: 'd-inline' }).text(texts.message).appendTo(banner);
                        var policyLink = $('<a>', { href: texts.policyLink, class: 'text-decoration-none text-white ms-2' }).text(texts.policyText).appendTo(message);
                        var acceptButton = $('<button>', { class: 'cookie-accept btn btn-success ms-3' }).text(texts.buttonText).appendTo(banner);
                        var rejectButton = $('<button>', { class: 'cookie-reject btn btn-danger ms-2' }).text(texts.rejectText).appendTo(banner);
    
                        if (Cookies.get(settings.cookieName) !== 'true') {
                            banner.show();
                        }
    
                        acceptButton.click(function() {
                            Cookies.set(settings.cookieName, 'true', { expires: settings.expires });
                            banner.hide();
                            settings.onAccept();
                        });
    
                        rejectButton.click(function() {
                            Cookies.set(settings.cookieName, 'false', { expires: settings.expires });
                            banner.hide();
                            settings.onReject();
                        });
                    });
                }
            };
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
    var cookieManager = new CookieManager(customCases, targetPage);
    $('body').cookieBanner({
        expires: 365,  // Number of days until the cookie expires
        cookieName: 'my_cookie_consent',  // Customize the cookie name
        onAccept: function() {
            // Code to execute when the user clicks "I Agree"
            cookieManager.acceptedFunctionalityCookie();
        },
        onReject: function() {
            // Code to execute when the user clicks "I Reject"
            Cookies.remove('language');
        }
    }).init();
})
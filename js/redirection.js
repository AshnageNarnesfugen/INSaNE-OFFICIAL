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
            if (urlParams.has('country') && urlParams.has('browserLanguage')) {
                return;
            }
    
            var language = Cookies.get('language');
            console.log(language);
    
            for (let [key, value] of Object.entries(this.langCases)) {
                if (key === language || value[1].includes(language)) {
                    if (window.location.pathname !== value[0]) {
                        window.location.href = `${this.baseUrl}${value[0]}?country=${language}`;
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
        
            window.location.href = formattedBaseUrl + '/' + formattedRedirectPath + '?country=' + finalLang + '&' + params;
        }                                                   
    }         
    
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
})
(function($) {
    $.fn.cookieConsentPlugin = function(options) {
        var settings = $.extend({
            customCases: {
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
            },
            targetPage: window.location.origin
        }, options);

        var baseUrl = settings.targetPage;
        var hasDefaultCaseExecuted = false;
        var langCases = settings.customCases;

        function acceptedFunctionalityCookie() {
            // Check if the current URL already has the necessary parameters
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('country') && urlParams.has('browserLanguage')) {
                return;
            }

            var language = Cookies.get('language');
            console.log(language);

            for (let [key, value] of Object.entries(langCases)) {
                if (key === language || value[1].includes(language)) {
                    if (window.location.pathname !== value[0]) {
                        window.location.href = `${baseUrl}${value[0]}?country=${language}`;
                    }
                    return;
                }
            }

            // Default Case
            $.getJSON('https://ipapi.co/json/')
                .done((data) => {
                    const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                    performRedirection(data, language, browserLanguage);
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    console.error('Failed to retrieve country code:', textStatus, errorThrown);
                    const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                    console.log(browserLanguage);
                    performRedirection({}, language, browserLanguage);
                });
        }

        function performRedirection(data, language, browserLanguage) {
            let userCountry = data.country_code;
            for (let [key, value] of Object.entries(langCases)) {
                if (key === userCountry || value[1].includes(userCountry)) {
                    if (language !== userCountry) {
                        redirectToCountry(`${baseUrl}${value[0]}?country=`, userCountry, data, browserLanguage);
                    }
                    return;
                }
            }

            // Default Case
            if (hasDefaultCaseExecuted) {
                console.log('Country code not supported');
            } else {
                hasDefaultCaseExecuted = true;
                redirectToCountry(`${baseUrl}/?country=`, userCountry, data, browserLanguage);
            }
        }

        function redirectToCountry(baseUrl, country, data, browserLanguage) {
            Cookies.set('language', country, {
                expires: 365,
                path: '/',
                domain: baseUrl,
                secure: true,
                sameSite: 'Strict',
            });
            data.browserLanguage = browserLanguage;
            let params = new URLSearchParams(data).toString();
            window.location.href = baseUrl + country + '&' + params;
        }

        function getLanguageMessages() {
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

        function getCookieConsentConfig() {
            const langMSG = getLanguageMessages()[window.location.href.split("?")[0]] || getLanguageMessages()['https://insane-bh.space'];

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
                        acceptedFunctionalityCookie();
                    }
                },
                "onStatusChange": (status) => {
                    if (status == 'allow') {
                        console.log('Cookies are allowed!');
                        acceptedFunctionalityCookie();
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
                    acceptedFunctionalityCookie();
                }
            };
        }

        return this.each(function() {
            $(window).on("load", function() {
                cookieconsent.initialise(getCookieConsentConfig());
            });
        });
    };
}(jQuery));
jQuery(() => {
    /*
        $('.share-btn').on('click', function() {
        var platform = $(this).data('platform');
        var url = window.location.href; // Get current page URL

        // Generate the sharing URL based on the platform
        var shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
                break;
            case 'twitter':
                shareUrl = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url);
                break;
            case 'linkedin':
                shareUrl = 'https://www.linkedin.com/shareArticle?url=' + encodeURIComponent(url);
                break;
            case 'reddit':
                var title = 'Check out this webpage!'; // The title of your shared content on Reddit
                shareUrl = 'https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title);
                break;
            default:
                // If platform is not recognized, do nothing or handle the error here
                return;
        }

        // Open the sharing URL in a new window
        window.open(shareUrl, '_blank');
    });
    */
    
    class ShareButton {
        constructor(selector, platforms, languages, urls, texts) {
            this.selector = selector;
            this.platforms = platforms;
            this.languages = languages;
            this.urls = urls;
            this.texts = texts;
        }
    
        share() {
            $(this.selector).on('click', (event) => {
                let platform = $(event.target).attr('data-platform');
                let language = $(event.target).attr('data-language');
                let url = this.urls[language] || '';
                let text = this.texts[language] || '';
    
                if (!platform || !language || !url || !text) {
                    console.error("Missing necessary data attributes");
                    return;
                }
    
                let shareUrl = this.platforms[platform].replace('{url}', encodeURIComponent(url)).replace('{text}', encodeURIComponent(text));
    
                if (shareUrl) {
                    window.open(shareUrl, '_blank');
                } else {
                    console.error("Invalid platform");
                }
            });
        }
    }
    
    // Define your platforms with placeholders {url} and {text} for the URL and the share text respectively
    const platforms = {
        'facebook': 'https://www.facebook.com/sharer/sharer.php?u={url}&quote={text}',
        'twitter': 'https://twitter.com/intent/tweet?url={url}&text={text}',
        'linkedin': 'https://www.linkedin.com/shareArticle?url={url}&title={text}',
        'reddit': 'https://www.reddit.com/submit?url={url}&title={text}',
    };
    
    // Define your invitational texts
    const texts = {
        'en': 'Check out this amazing website!',
        'es': '¡Mira este increíble sitio web!',
        'pt': 'Confira este incrível site!',
        'ja': 'この素晴らしいウェブサイトをご覧ください！'
    };
    
    // Define your language specific URLs
    const urls = {
        'en': window.location.origin + '/',
        'es': window.location.origin + '/es',
        'pt': window.location.origin + '/pt',
        'ja': window.location.origin + '/ja'
    };
    
    // Initialize a new ShareButton object
    const shareBtn = new ShareButton('.share-btn', platforms, texts, urls);
    shareBtn.share();    

    // Create a class with a function to set the title property
    class DynamicTitleHandler {
        static setTitleForLinks() {
            // Select all anchor tags with class "dynamic-title"
            $('a').each(function() {
                const $this = $(this);
                const content = $this.text().trim();

                // Check if the content is proper for the title property
                if (content.length > 0) {
                    // Set the title property to the inner content
                    $this.attr('title', content);
                } else {
                    // If the content is not suitable for the title property, return and ignore the tag
                    return;
                }
            });
        }
    }

    // Call the function to set titles for all anchor tags with class "dynamic-title"
    DynamicTitleHandler.setTitleForLinks();

    class LazyVideoLoader {
        constructor() {
            this.options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
        }

        loadVideos() {
            $('video').each((index, videoElement) => {
                this.observer.observe(videoElement);
            });
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = $(entry.target);
                    this.lazyLoadVideo(video);
                    this.observer.unobserve(entry.target);
                }
            });
        }

        fetchVideoSource(src) {
            return fetch(src)
                .then(response => response.blob())
                .then(blob => URL.createObjectURL(blob))
                .catch(err => {
                    console.error(`Failed to fetch video: ${err}`);
                    return '';
                });
        }

        lazyLoadVideo(video) {
            const sources = video.find('source');
            const overlay = this.createOverlay(video);

            video.prop('controls', false);

            const promises = sources.map((index, sourceElement) => {
                const source = $(sourceElement);
                const videoURL = source.attr('data-src');

                return this.fetchVideoSource(videoURL)
                    .then(videoObjectURL => {
                        if (videoObjectURL) {
                            source.attr('src', videoObjectURL);
                        } else {
                            console.error(`Unable to load video from source: ${videoURL}`);
                        }
                    });
            }).get(); // get() is used to convert jQuery object to array

            $.when.apply($, promises).then(() => {
                video[0].load();
                this.setupPlayButton(overlay, video);
            });
        }

        createOverlay(video) {
            const overlay = $('<div>', {
                class: 'video-overlay',
                text: 'Loading...'
            });

            video.parent().append(overlay);

            return overlay;
        }

        setupPlayButton(overlay, video) {
            const playButtonTemplate = `
                <div class="play-button-overlay d-flex align-items-center justify-content-center">
                    <button class="play-button btn btn-danger btn-lg" aria-label="Play Button">
                        ▶
                    </button>
                </div>
            `;

            overlay.html(playButtonTemplate);

            video.on('loadedmetadata', () => video.prop('controls', false));

            overlay.find('.play-button').on('click', () => {
                overlay.remove();
                video.prop('controls', true);
                video[0].play();
            });

            video.on('ended', () => {
                video.parent().append(overlay);
                overlay.html(playButtonTemplate);
                video.prop('controls', false);

                overlay.find('.play-button').on('click', () => {
                    overlay.remove();
                    video.prop('controls', true);
                    video[0].currentTime = 0;
                    video[0].play();
                });
            });
        }
    }

    const lazyVideoLoader = new LazyVideoLoader();
    $(document).ready(() => lazyVideoLoader.loadVideos());

    class LazyImageLoader {
        constructor() {
            this.options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
            this.downloadMSN = this.getDownloadMSN();
        }

        loadImages() {
            return $('img').map((index, img) => {
                const $img = $(img);
                const dataSrc = $img.attr('data-src');
                const dataModule = $img.attr('data-module');
                const dataBlur = $img.attr('data-blur');

                if (!dataSrc || (!dataModule && dataModule !== 'true')) {
                    return;
                }

                $img.on('dragstart', function() {
                    return false;
                })

                if (dataBlur === 'true' && !$img.parent().hasClass('blur-load')) {
                    $img.wrap('<div class="blur-load"></div>');
                }

                $img.attr('src', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNTAwIDUwMCI+DQogIDxyZWN0IGZpbGw9InRyYW5zcGFyZW50IiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIvPg0KICA8dGV4dCBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDI1NS41KSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIGR5PSIxMC41IiBmb250LXdlaWdodD0iYm9sZCIgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvYWRpbmcuLi48L3RleHQ+DQo8L3N2Zz4=')

                this.observer.observe(img);

                if (dataModule === 'true') {
                    this.setupModalImage($img);
                }

                return this.imageLoadPromise($img);
            }).get();
        }

        handleIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imgElement = entry.target;
                    this.lazyLoadImage($(imgElement));
                    observer.unobserve(imgElement);
                }
            });
        }

        lazyLoadImage($imgElement) {
            const src = $imgElement.attr('data-src');

            if (src && (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://'))) {
                $imgElement.parent().addClass('loaded');
                return Promise.resolve();
            }

            return $.ajax({
                url: src,
                xhrFields: {
                    responseType: 'blob'
                },
                success: (blob) => {
                    $imgElement.attr('src', URL.createObjectURL(blob));
                    $imgElement.parent().addClass('loaded');
                },
                error: () => console.error(`Failed to load image: ${src}`)
            });
        }

        imageLoadPromise($img) {
            return new Promise((resolve, reject) => {
                $img.on('load', () => resolve());
                $img.on('error', () => reject(new Error(`Failed to load image: ${$img.src}`)));
            });
        }

        setupModalImage($img) {
            $img.on('click', () => {
                const src = $img.attr('src');
                const $modal = $(
                    `<div class="modal">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                <img class="modal-img img-fluid inherit" src="${src}" ondragstart="return false;">
                                <a class="download-btn" href="${src}" download>${this.downloadMSN}</a>
                                </div>
                            </div>
                        </div>`
                );

                $modal.appendTo('body').show();
                $('body').css('overflow', 'hidden');

                $modal.on('click', () => {
                    $modal.hide().remove();
                    $('body').css('overflow', 'visible');
                });
            });
        }

        getDownloadMSN() {
            switch (window.location.href.split("?")[0]) {
                case 'https://insane-bh.space':
                    return 'Download';
                case 'https://insane-bh.space/es':
                    return 'Descarga';
                case 'https://insane-bh.space/ja':
                    return 'ダウンロード';
                case 'https://insane-bh.space/pt':
                    return 'Baixar';
                default:
                    return 'Download';
            }
        }
    }

    const lazyImageLoader = new LazyImageLoader();
    const imagePromises = lazyImageLoader.loadImages();

    Promise.all(imagePromises)
        .then(() => console.log('All images loaded successfully'))
        .catch(error => console.error('Failed to load images:', error));

    class CookieManager {
        constructor(customCases) {
            this.baseUrl = 'https://insane-bh.space';
            this.hasDefaultCaseExecuted = false;
            this.langCases = customCases;
        }

        acceptedFunctionalityCookie() {
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
                .done((data) => this.performRedirection(data.country_code, language))
                .fail((jqXHR, textStatus, errorThrown) => {
                    console.error('Failed to retrieve country code:', textStatus, errorThrown);
                    const browserLanguage = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
                    console.log(browserLanguage);
                    this.performRedirection(browserLanguage, language);
                });
        }

        performRedirection(userCountry, language) {
            for (let [key, value] of Object.entries(this.langCases)) {
                if (key === userCountry || value[1].includes(userCountry)) {
                    if (language !== userCountry) {
                        this.redirectToCountry(`${this.baseUrl}${value[0]}?country=`, userCountry);
                    }
                    return;
                }
            }

            // Default Case
            if (this.hasDefaultCaseExecuted) {
                console.log('Country code not supported');
            } else {
                this.hasDefaultCaseExecuted = true;
                this.redirectToCountry(`${this.baseUrl}/?country=`, userCountry);
            }
        }

        redirectToCountry(baseUrl, country) {
            Cookies.set('language', country, {
                expires: 365,
                path: '/',
                domain: 'insane-bh.space',
                secure: true,
                sameSite: 'Strict',
            });
            window.location.href = baseUrl + country;
        }
    }

    class CookieConsentHandler {
        constructor() {
            this.cookieManager = new CookieManager({
                'ES': ['/es', ['MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU']],
                'US': ['/', ['CA', 'GB', 'AU', 'NZ', 'IE', 'ZA', 'IN', 'SG']],
                'JP': ['/ja', []],
                'PT': ['/pt', ['BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'GQ', 'TL']]
            });
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


    $.fn.clickToggle = function(func1, func2) {
        var funcs = [func1, func2];
        this.data('toggleclicked', 0);
        this.click(() => {
            var data = $(this).data();
            var tc = data.toggleclicked;
            $.proxy(funcs[tc], this)();
            data.toggleclicked = (tc + 1) % 2;
        });
        return this;
    };
    $(".menu-wrapper").clickToggle(() => {
        $(".burger_menu").css({
            "opacity": "1",
            "z-index": "6"
        });
    }, () => {
        $(".burger_menu").css({
            "opacity": "0",
            "z-index": "-1"
        });
    });

    $('.menu-wrapper').on('click', () => {
        $('.hamburger-menu').toggleClass('animate');
    })

    var scrolllink = $('.scroll');
    scrolllink.click(function(e) {
        e.preventDefault();
        $(".menu-wrapper").trigger("click");
        $('body,html').animate({
            scrollTop: $(this.hash).offset().top
        }, 1000);
    });

    var scrollBtn = $('.scroll-top-button');

    $(window).scroll(() => {
        var y = $(this).scrollTop();
        if (y > 500) {
            $(scrollBtn).fadeIn().css('z-index', '111111');
        } else {
            $(scrollBtn).fadeOut();
        }
    });

    scrollBtn.click(() => {
        $('body,html').animate({
            scrollTop: $('html').offset().top
        }, 1000);
    });

    $("#esc3").parallaxie({
        speed: 0.8,
        disableMobile: true
    });

    $("#speakers").parallaxie({
        speed: 0.2,
        disableMobile: true,
        size: 'contain',
        pos_x: 'center',
        repeat: 'repeat',
    })

    let data = $('#letter').attr('data-array');
    data = JSON.parse(data)

    var container = $("#letter")
    var index = 0
    const interval = () => {
        container.shuffleLetters({
            "step": 15, // adjusted from 30 to 15
            "fps": 60,
            "text": data[index]
        });

        index++

        if (index === data.length) {
            index = 0;
        }
    }

    setInterval(interval, 4000)

    class FormHandler {
        constructor(formId, ajaxUrl) {
            this.form = $(formId);
            this.ajaxUrl = ajaxUrl;
            this.notifSuccess = JSON.parse(this.form.attr('data-notif-success'));
            this.notifError = JSON.parse(this.form.attr('data-notif-error'));
            this.tyMsg = this.form.attr('data-tymsg');
            this.errMsg = this.form.attr('data-errmsg');
            this.form.on('submit', (e) => this.handleSubmit(e));
        }

        sendNotification(type, title, body) {
            Notification.requestPermission().then(perm => {
                if (perm === "granted") {
                    new Notification(title, {
                        body: body,
                        icon: "img/webiconspace-removebg-preview.png"
                    });
                }
            });
        }

        getFormData() {
            return this.form.serializeArray().reduce((obj, item) => {
                obj[item.name] = item.value;
                return obj;
            }, {});
        }

        submitForm() {
            $.ajax({
                method: 'POST',
                url: this.ajaxUrl,
                dataType: 'json',
                accepts: 'application/json',
                data: this.getFormData(),
                success: (data) => {
                    this.handleResponse('Accepted', data);
                },
                error: (err) => {
                    this.handleResponse('Rejected', err);
                }
            });
        }

        handleResponse(type, response) {
            if (type === 'Accepted') {
                this.sendNotification(type, this.notifSuccess[0], this.notifSuccess[1]);
                this.form.css('display', 'none');
                $('.form-container').html(`<p>${this.tyMsg}</p>`);
            } else {
                this.sendNotification(type, this.notifError[0], this.notifError[1]);
                this.form.css('display', 'none');
                $('.form-container').html(`<p>${this.errMsg}</p>`);
            }
        }

        handleSubmit(e) {
            e.preventDefault();
            this.submitForm();
        }
    }

    // Usage
    let formHandler = new FormHandler('#former-form', 'https://formsubmit.co/ajax/70a19f04e48d9da8774f32b49b924edf');

    class SectionShuffler {
        constructor() {
            this.observerConfig = {
                root: null,
                rootMargin: '0px',
                threshold: 0.5
            };
            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerConfig);
            this.sections = this.getShuffleSections();
        }

        getShuffleSections() {
            const sections = [];
            $('.shuffle-section').each((index, element) => {
                const section = $(element);
                const titles = section.find('[data-text]').map((idx, el) => {
                    return {
                        element: $(el),
                        text: $(el).attr('data-text'),
                    };
                }).get();
                if (titles.length > 0) {
                    sections.push({
                        element: section,
                        titles: titles,
                    });
                }
            });
            return sections;
        }

        init() {
            this.sections.forEach(section => {
                this.observer.observe(section.element[0]);
            });
        }

        handleIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = this.sections.find(s => s.element[0] === entry.target);
                    section.titles.forEach(title => {
                        title.element.shuffleLetters({
                            step: 30,
                            fps: 60,
                            text: title.text
                        });
                    });
                }
            });
        }
    }

    // Usage:
    const shuffler = new SectionShuffler();
    shuffler.init();

    var owl = $('.owl-carousel')
    owl.owlCarousel({
        items: 1,
        loop: true,
        mouseDrag: true,
        dots: false,
        autoplay: false,
        nav: false
    })
    $('.owl-prev').click(() => owl.trigger('prev.owl.carousel'))
    $('.owl-next').click(() => owl.trigger('next.owl.carousel'))
    $('.cuztomized')
        .on('dragstart', (e) => e.stopPropagation().preventDefault(), {
            passive: true
        })
        .on('drop', (e) => e.stopPropagation().preventDefault(), {
            passive: true
        })

    // Al inicio del DOM ready
    var startTime = new Date().getTime();

    // Al final del DOM ready
    $(window).on('load', function() {
        var endTime = new Date().getTime();
        var loadTime = endTime - startTime;
        console.log(`Load Time: ${loadTime}ms`);
    });
})
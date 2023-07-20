jQuery(() => {

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

    
    /*
      class LazyVideoLoader {
        constructor() {
            this.options = {
                root: null, // Use the viewport as the root
                rootMargin: '0px', // No margin
                threshold: 0.1 // Trigger when 10% of the video is visible
            };
    
            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
        }
    
        loadVideos() {
            $('video').each((index, videoElement) => {
                this.observer.observe(videoElement);
            });
        }
    
        handleIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const videoElement = entry.target;
                    this.lazyLoadVideo(videoElement);
                    observer.unobserve(videoElement);
                }
            });
        }
    
        lazyLoadVideo(videoElement) {
            let isBlobLoaded = false; // Flag to track if blob is loaded
            const $overlay = $('<div class="video-overlay">Loading...</div>'); // Create a loading overlay
    
            $(videoElement).prop('controls', false); // Disable video controls initially
            $(videoElement).parent().append($overlay);
    
            const sources = $(videoElement).find('source');
            const promises = [];
    
            sources.each(function () {
                const sourceElement = $(this)[0];
                const videoURL = $(this).attr('data-src'); // Use data-src attribute to store video URL instead of src
    
                const promise = fetch(videoURL)
                    .then(response => response.blob())
                    .then(videoBlob => {
                        const videoObjectURL = URL.createObjectURL(videoBlob);
    
                        // Set the src attribute of the source element to the URL
                        $(sourceElement).attr('src', videoObjectURL);
                    })
                    .catch(error => {
                        console.error('Failed to fetch video:', error);
                    });
    
                promises.push(promise);
            });
    
            Promise.all(promises)
                .then(() => {
                    if (!isBlobLoaded) {
                        // Call the load method on the video element to update the sources
                        videoElement.load();
                        isBlobLoaded = true; // Update the flag
    
                        // Create a play button using a template string
                        const playButtonTemplate = `
                            <div class="play-button-overlay d-flex align-items-center justify-content-center">
                                <button class="play-button btn btn-danger btn-lg" aria-label="Play Button">
                                    <i class="bi bi-play-fill"></i>
                                </button>
                            </div>
                        `;
    
                        $overlay.html(playButtonTemplate);
    
                        // Hide video controls initially
                        $(videoElement).on('loadedmetadata', () => {
                            $(videoElement).prop('controls', false);
                        });
    
                        // Add click event to the play button to remove overlay and play the video
                        $overlay.find('.play-button').on('click', () => {
                            $overlay.remove(); // Remove the loading overlay
                            $(videoElement).prop('controls', true); // Enable video controls
                            videoElement.play(); // Play the video
                        });
    
                        // Add event listener to detect when the video playback ends
                        $(videoElement).on('ended', () => {
                            // Reset the overlay with the play button to allow replay
                            $(videoElement).parent().append($overlay);
                            $overlay.html(playButtonTemplate);
                            $(videoElement).prop('controls', false); // Hide video controls
                            // Add click event to the replay button to play the video again
                            $overlay.find('.play-button').on('click', () => {
                                $overlay.remove(); // Remove the loading overlay
                                $(videoElement).prop('controls', true); // Enable video controls
                                videoElement.currentTime = 0; // Reset video to the beginning
                                videoElement.play(); // Play the video
                            });
                        });
                    }
                });
        }
    }
    
    // Usage:
    const lazyVideoLoader = new LazyVideoLoader();
    lazyVideoLoader.loadVideos();  
    */
    
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
    
        handleIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const videoElement = entry.target;
                    this.lazyLoadVideo(videoElement);
                    observer.unobserve(videoElement);
                }
            });
        }
    
        lazyLoadVideo(videoElement) {
            let isBlobLoaded = false;
            const $overlay = $('<div class="video-overlay">Loading...</div>');
            const shouldAutoPlay = $(videoElement).attr('data-autoplay') === 'true';
    
            $(videoElement).prop('controls', false);
            $(videoElement).parent().append($overlay);
    
            const sources = $(videoElement).find('source');
            const promises = [];
    
            sources.each(function () {
                const sourceElement = $(this)[0];
                const videoURL = $(this).attr('data-src');
    
                const promise = fetch(videoURL)
                    .then(response => response.blob())
                    .then(videoBlob => {
                        const videoObjectURL = URL.createObjectURL(videoBlob);
                        $(sourceElement).attr('src', videoObjectURL);
                    })
                    .catch(error => {
                        console.error('Failed to fetch video:', error);
                        $overlay.html("Error loading video");
                    });
    
                promises.push(promise);
            });
    
            Promise.all(promises)
                .then(() => {
                    if (!isBlobLoaded) {
                        videoElement.load();
                        videoElement.onerror = () => {
                            $overlay.html("Error loading video");
                        };
    
                        isBlobLoaded = true;
                        const playButtonTemplate = `
                            <div class="play-button-overlay d-flex align-items-center justify-content-center">
                                <button class="play-button btn btn-danger btn-lg" aria-label="Play Button">
                                    <i class="bi bi-play-fill"></i>
                                </button>
                            </div>
                        `;
    
                        $overlay.html(playButtonTemplate);
    
                        $(videoElement).on('loadedmetadata', () => {
                            $(videoElement).prop('controls', false);
                        });
    
                        $overlay.find('.play-button').on('click', () => {
                            this.playVideo(videoElement, $overlay);
                        });
    
                        $(videoElement).on('ended', () => {
                            this.resetVideo(videoElement, $overlay, playButtonTemplate);
                        });
    
                        // Start autoplay if attribute is set
                        if (shouldAutoPlay) {
                            this.playVideo(videoElement, $overlay);
                        }
                    }
                });
        }
    
        playVideo(videoElement, $overlay) {
            $overlay.remove();
            $(videoElement).prop('controls', true);
            videoElement.play();
        }
    
        resetVideo(videoElement, $overlay, playButtonTemplate) {
            $(videoElement).parent().append($overlay);
            $overlay.html(playButtonTemplate);
            $(videoElement).prop('controls', false);
            $overlay.find('.play-button').on('click', () => {
                this.playVideo(videoElement, $overlay);
            });
            videoElement.currentTime = 0;
        }
    }
    
    const lazyVideoLoader = new LazyVideoLoader();
    lazyVideoLoader.loadVideos();
    
    class LazyImageLoader {
        constructor() {
            this.options = {
                root: null, // Use the viewport as the root
                rootMargin: '0px', // No margin
                threshold: 0.1 // Trigger when 10% of the image is visible
            };

            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
        }

        loadImages() {
            const images = $('img');
            const imagePromises = [];

            images.each((index, img) => {
                const dataSrc = $(img).attr('data-src');
                const dataModule = $(img).attr('data-module');
                const dataBlur = $(img).attr('data-blur');

                if (!dataSrc || (!dataModule && dataModule !== 'true')) {
                    // Skip images without data-src property
                    return;
                }

                $(img).on('dragstart', function() {
                    return false;
                })

                // Check if the image is already wrapped
                // Check if data-blur is set to true
                if (dataBlur === 'true' && !$(img).parent().hasClass('blur-load')) {
                    // Wrap the img tag inside a div with the class 'blur-load'
                    $(img).wrap('<div class="blur-load"></div>');
                }

                $(img).attr('src', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNTAwIDUwMCI+DQogIDxyZWN0IGZpbGw9InRyYW5zcGFyZW50IiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIvPg0KICA8dGV4dCBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDI1NS41KSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIGR5PSIxMC41IiBmb250LXdlaWdodD0iYm9sZCIgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvYWRpbmcuLi48L3RleHQ+DQo8L3N2Zz4=')

                const promise = new Promise((resolve, reject) => {
                    this.observer.observe(img);

                    img.onload = function() {
                        resolve();
                    };

                    img.onerror = function() {
                        reject(new Error(`Failed to load image: ${img.src}`));
                    };
                });

                let downloadMSN;
                switch (window.location.href.split("?")[0]) {
                    case 'https://insane-bh.space':
                        downloadMSN = 'Download'
                        break;
                    case 'https://insane-bh.space/es':
                        downloadMSN = 'Descarga'
                        break;
                    case 'https://insane-bh.space/ja':
                        downloadMSN = 'ダウンロード'
                        break;
                    case 'https://insane-bh.space/pt':
                        downloadMSN = 'Baixar'
                        break;
                    default:
                        downloadMSN = 'Download'
                        break;
                }

                if (dataModule === 'true') {
                    $(img).click(function() {
                        const src = $(this).attr('src');
                        const modal = $(`
                        <div class="modal">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                <img class="modal-img img-fluid inherit" src="${src}" ondragstart="return false;">
                                <a class="download-btn" href="${src}" download>${downloadMSN}</a>
                                </div>
                            </div>
                        </div>
                        `);

                        modal.appendTo('body');

                        modal.show();
                        $('body').css('overflow', 'hidden');

                        modal.click(function() {
                            modal.hide();
                            modal.remove();
                            $('body').css('overflow', 'visible');
                        });
                    });
                }

                imagePromises.push(promise);
            });

            const blurDivs = $(".blur-load");

            blurDivs.each(function() {
                const img = $(this).find("img");

                const loaded = () => {
                    $(this).addClass('loaded');
                };

                if (img[0].complete) {
                    loaded();
                } else {
                    img.on('load', loaded);
                }
            });

            return imagePromises;
        }

        handleIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imgElement = entry.target;
                    this.lazyLoadImage(imgElement);
                    observer.unobserve(imgElement);
                }
            });
        }

        lazyLoadImage(imgElement) {
            const src = $(imgElement).attr('data-src'); // Use data-src attribute instead of src

            // Skip the XHR request if the src attribute already contains a valid image URL
            if (src && (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://'))) {
                const parentDiv = $(imgElement).parent();
                parentDiv.addClass('loaded');
                return Promise.resolve();
            }

            const xhr = new XMLHttpRequest();

            const promise = new Promise((resolve, reject) => {
                xhr.open('GET', src, true);
                xhr.responseType = 'blob';
                xhr.onload = function() {
                    if (this.status === 200) {
                        const blob = this.response;
                        $(imgElement).attr('src', URL.createObjectURL(blob));
                        resolve();
                    } else {
                        reject(new Error(`Failed to load image: ${src}`));
                    }
                };
                xhr.onerror = function() {
                    reject(new Error(`Failed to load image: ${src}`));
                };
                xhr.send();
            });

            promise
                .then(() => {
                    const parentDiv = $(imgElement).parent();
                    parentDiv.addClass('loaded');
                })
                .catch(error => {
                    console.error(error);
                });

            return promise;
        }
    }

    const lazyImageLoader = new LazyImageLoader();
    const imagePromises = lazyImageLoader.loadImages();

    Promise.all(imagePromises)
        .then(() => {
            console.log('All images loaded successfully');
        })
        .catch(error => {
            console.error('Failed to load images:', error);
        }); 

    function acceptedFunctionalityCookie() {
        // Your code that should run after accepting cookies goes here
        var language = Cookies.get('language');
        console.log(language);
    
        switch (language) {
            case 'ES':
            case 'MX':
            case 'AR':
            case 'CO':
            case 'PE':
            case 'VE':
            case 'CL':
            case 'EC':
            case 'GT':
            case 'CU':
                if (window.location.pathname !== '/es') {
                    window.location.href = `https://insane-bh.space/es?country=${language}`;
                }
                break;
            case 'US':
            case 'CA':
            case 'GB':
            case 'AU':
            case 'NZ':
            case 'IE':
            case 'ZA':
            case 'IN':
            case 'SG':
                if (window.location.pathname !== '/') {
                    window.location.href = `https://insane-bh.space/?country=${language}`;
                }
                break;
            case 'JP':
                if (window.location.pathname !== '/ja') {
                    window.location.href = `https://insane-bh.space/ja?country=${language}`;
                }
                break;
            case 'PT':
            case 'BR':
            case 'AO':
            case 'MZ':
            case 'CV':
            case 'GW':
            case 'ST':
            case 'GQ':
            case 'TL':
                if (window.location.pathname !== '/pt') {
                    window.location.href = `https://insane-bh.space/pt?country=${language}`;
                }
                break;
            default:
                // Get user's location using IP geolocation
                $.getJSON('https://ipapi.co/json/')
                    .done(function(data) {
                        var userCountry = data.country_code;
                        console.log(userCountry);
            
                        // Perform redirection based on user's country
                        performRedirection(userCountry, language);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        console.error('Failed to retrieve country code:', textStatus, errorThrown);
                        
                        // API failed to retrieve country code, fallback to browser language detection
                        var browserLanguage = navigator.language || navigator.userLanguage;
                        var browserLangCode = browserLanguage.split('-')[0].toUpperCase();
                        console.log(browserLangCode);
            
                        // Perform redirection based on browser's language
                        performRedirection(browserLangCode, language);
                    });
                break;
        }
    }
    
    function performRedirection(userCountry, language) {
        var hasDefaultCaseExecuted = false; // Flag to track if default case has executed
        switch (userCountry) {
            case 'US':
            case 'CA':
            case 'GB':
            case 'AU':
            case 'NZ':
            case 'IE':
            case 'ZA':
            case 'IN':
            case 'SG':
                if (language !== userCountry) {
                    redirectToCountry('https://insane-bh.space/?country=', userCountry);
                }
                break;
            case 'JP':
                if (language !== userCountry) {
                    redirectToCountry('https://insane-bh.space/ja?country=', userCountry);
                }
                break;
            case 'ES':
            case 'MX':
            case 'AR':
            case 'CO':
            case 'PE':
            case 'VE':
            case 'CL':
            case 'EC':
            case 'GT':
            case 'CU':
                if (language !== userCountry) {
                    redirectToCountry('https://insane-bh.space/es?country=', userCountry);
                }
                break;
            case 'PT':
            case 'BR':
            case 'AO':
            case 'MZ':
            case 'CV':
            case 'GW':
            case 'ST':
            case 'GQ':
            case 'TL':
                if (language !== userCountry) {
                    redirectToCountry('https://insane-bh.space/pt?country=', userCountry);
                }
                break;
            default:
                if (hasDefaultCaseExecuted) {
                    // Default case already executed once, handle the situation accordingly
                    console.log('Country code not supported');
                    // You can display an error message to the user or redirect to a default URL
                } else {
                    hasDefaultCaseExecuted = true; // Set the flag to indicate that the default case has executed
                    // Perform the redirection again
                    redirectToCountry('https://insane-bh.space/?country=', userCountry);
                }
                break;
        }
    }
    
    function redirectToCountry(baseUrl, country) {
        Cookies.set('language', country, {
            expires: 365,
            path: '/',
            domain: 'insane-bh.space',
            secure: true,
            sameSite: 'Strict',
        });
        window.location.href = baseUrl + country;
    }    

    $(window).on("load", function() {
        let langMSG = {};
        switch (window.location.href.split("?")[0]) {
            case 'https://insane-bh.space':
                langMSG = {
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
                break;
            case 'https://insane-bh.space/es':
                langMSG = {
                    "header": "¡Cookies usadas en el sitio web!",
                    "message": "Este sitio web utiliza cookies para garantizar que obtenga la mejor experiencia en nuestro sitio web.",
                    "dismiss": "¡Entiendo!",
                    "allow": "Permitir cookies",
                    "deny": "Rechazar",
                    "link": "Saber más",
                    "href": "https://www.example.com/cookies",
                    "close": "❌",
                    "policy": "Política de Cookies"
                };
                break;
            case 'https://insane-bh.space/ja':
                langMSG = {
                    "header": "ウェブサイトでのクッキーの使用について",
                    "message": "当ウェブサイトでは、最良の体験を提供するためにクッキーを使用しています。",
                    "dismiss": "了解しました！",
                    "allow": "クッキーを許可する",
                    "deny": "拒否する",
                    "link": "詳細を知る",
                    "href": "https://www.example.com/cookies",
                    "close": "❌",
                    "policy": "クッキーポリシー"
                };
                break;
            case 'https://insane-bh.space/pt':
                langMSG = {
                    "header": "Usando cookies no site da Web!",
                    "message": "O meu website usa cookies para fornecer uma experiência ótima.",
                    "dismiss": "Entendi!",
                    "allow": "Aceitar",
                    "deny": "Negar",
                    "link": "Saiba mais",
                    "href": "https://www.example.com/cookies",
                    "close": "❌",
                    "policy": "Política de cookies"
                };
                break;
            default:
                // Handle any other URLs
                langMSG = {
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
                break;
        }

        cookieconsent.initialise({
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
            "onInitialise": function(status) {
                var consent = Cookies.get('cookieconsent_status');
                if (consent && consent == 'allow') {
                    // Your code that uses cookies functionality goes here
                    console.log('Cookies are allowed!');
                    acceptedFunctionalityCookie()
                }
            },
            "onStatusChange": function(status, chosenBefore) {
                if (status == 'allow') {
                    // Your code that uses cookies functionality goes here
                    acceptedFunctionalityCookie()
                    console.log('Cookies are allowed!');
                } else {
                    // Your code that uses cookies functionality goes here
                    console.log('Cookies are not allowed!');
                }
            },
            "onRevokeChoice": function() {
                // Your code that handles cookie revocation goes here
                console.log('Cookies consent has been revoked!');
            },
            "onNoCookieLaw": function() {
                // Your code that handles situations when there is no cookie law goes here
                console.log('No cookie law is applied!');
            },
            "onAccept": function() {
                // Your code that should run after accepting cookies goes here
                console.log('Cookies have been accepted!');
                // Add code here to enable cookie functionality, such as tracking user preferences or analytics data
                acceptedFunctionalityCookie()
            }
        });
    });

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
            "step": 30,
            "fps": 60,
            "text": data[index]
        });

        index++

        if (index === data.length) {
            index = 0;
        }
    }

    setInterval(interval, 4000)

    var form = $('#former-form')
    form.on('submit', function(e) {
        e.preventDefault()
        let langMSG = {}
        switch (window.location.href.split("?")[0]) {
            case 'https://insane-bh.space':
                langMSG = {
                    notiMSGAccepted: "Your form has been submitted.",
                    bodyMSGAccepted: "Congratulations! Our team will be in touch with you soon.",
                    notiMSGRejected: "Your form couldn't be submitted.",
                    bodyMSGRejected: "An error has occurred. Please try again."
                };
                break;
            case 'https://insane-bh.space/es':
                langMSG = {
                    notiMSGAccepted: "Su formulario ha sido enviado.",
                    bodyMSGAccepted: "¡Enhorabuena! Nuestro equipo se pondrá en contacto con usted pronto.",
                    notiMSGRejected: "No se pudo enviar su formulario.",
                    bodyMSGRejected: "Ha ocurrido un error. Por favor, inténtelo de nuevo."
                };
                break;
            case 'https://insane-bh.space/ja':
                langMSG = {
                    notiMSGAccepted: "フォームが送信されました。",
                    bodyMSGAccepted: "おめでとうございます。弊社チームがお客様に近日中に連絡いたします。",
                    notiMSGRejected: "フォームの送信に失敗しました。",
                    bodyMSGRejected: "エラーが発生しました。もう一度お試しください。"
                };
                break;
            case 'https://insane-bh.space/pt':
                langMSG = {
                    notiMSGAccepted: "Sua mensagem foi enviada.",
                    bodyMSGAccepted: "Parabéns! Em breve, nossa equipe entrará em contato com você.",
                    notiMSGRejected: "Não foi possível enviar sua mensagem.",
                    bodyMSGRejected: "Ocorreu um erro. Por favor, tente novamente."
                };
                break;
            default:
                // Handle any other URLs
                langMSG = {
                    notiMSGAccepted: "Your form has been submitted.",
                    bodyMSGAccepted: "Congratulations! Our team will be in touch with you soon.",
                    notiMSGRejected: "Your form couldn't be submitted.",
                    bodyMSGRejected: "An unexpected error occurred. Please try again."
                };
                break;
        }

        let tymsg = $(this).attr('data-tymsg')
        let errmsg = $(this).attr('data-errmsg')
        console.log(tymsg, errmsg)
        $.ajax({
            method: 'POST',
            url: 'https://formsubmit.co/ajax/70a19f04e48d9da8774f32b49b924edf',
            dataType: 'json',
            accepts: 'application/json',
            data: {
                name: $('#name').val(),
                mail: $('#mail').val(),
                message: $('#message').val()
            },
            success: (data) => {
                Notification.requestPermission().then(perm => {
                    if (perm === "granted") {
                        new Notification(langMSG.notiMSGAccepted, {
                            body: langMSG.bodyMSGAccepted,
                            icon: "img/webiconspace-removebg-preview.png"
                        });
                    }
                });
                form.css('display', 'none');
                $('.form-container').html(tymsg);
            },
            error: (err) => {
                Notification.requestPermission().then(perm => {
                    if (perm === "granted") {
                        new Notification(langMSG.notiMSGRejected, {
                            body: langMSG.bodyMSGRejected,
                            icon: "img/webiconspace-removebg-preview.png"
                        });
                    }
                });
                form.css('display', 'none');
                $('.form-container').html(errmsg);
            }
        });

    })

    class SectionShuffler {
        constructor() {
            this.observerConfig = {
                root: null,
                rootMargin: '0px',
                threshold: 0.5
            };
            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerConfig);
            this.sections = $('.shuffle-section');
        }

        init() {
            this.sections.each((index, element) => {
                const section = $(element);
                if (section.find('[data-text]').length > 0) {
                    this.observer.observe(section[0]);
                }
            });
        }

        handleIntersection(entries, observer) {
            entries.forEach(entry => {
                const section = $(entry.target);
                if (entry.isIntersecting) {
                    const titles = section.find('[data-text]');
                    titles.each((index, element) => {
                        $(element).shuffleLetters({
                            step: 30,
                            fps: 60,
                            text: $(element).attr('data-text')
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
        .on('dragstart', (e) => e.stopPropagation().preventDefault(), {passive: true})
        .on('drop', (e) => e.stopPropagation().preventDefault(), {passive: true})
    
    $(document).keydown(function(event) {
        switch (event.keyCode) {
            case 123: // Prevent F12
            case 74: // Prevent Ctrl+Shift+J (Windows/Linux)
            case 75: // Prevent Cmd+Option+J (Mac)
                return false;
            case 73: // Prevent Ctrl+Shift+I and Ctrl+Shift+C
                if (event.ctrlKey && event.shiftKey) {
                    return false;
                }
                break;
            case 85: // Prevent Ctrl+U
            case 83: // Prevent Ctrl+Shift+S (Windows/Linux)
            case 74: // Prevent Cmd+Shift+C (Mac)
                if (event.ctrlKey) {
                    return false;
                }
                break;
        }
    });
    $(document).on("contextmenu", function(event) {
        event.preventDefault();
    });
    // Al inicio del DOM ready
    var startTime = new Date().getTime();

    // Al final del DOM ready
    $(window).on('load', function() {
      var endTime = new Date().getTime();
      var loadTime = endTime - startTime;
      console.log(`Load Time: ${loadTime}ms`);
    });
})
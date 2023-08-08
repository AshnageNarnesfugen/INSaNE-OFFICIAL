jQuery(() => {
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
    if (!Cookies.get('my_cookie_consent')) {
        $(".intro_animation").css({
            "display": "grid",
            "opacity": "1"
        });
        setTimeout(function () {
            $(".intro_animation").css("opacity", "0");
            setTimeout(function () {
              $(".intro_animation").css("display", "none");
            }, 500);
          }, 5000);
          
          setTimeout(function () {
            $(".intro_title").css("opacity", 1);
            setTimeout(function () {
              $(".intro_subtitle").css("opacity", 1);
            }, 1000);
          }, 1000);
    }
    
    // Define your translations
    var translations = {
        'en': {
            'readMore': 'Read More',
            'readLess': 'Read Less'
        },
        'es': {
            'readMore': 'Leer Más',
            'readLess': 'Leer Menos'
        },
        'pt': {
            'readMore': 'Ler Mais',
            'readLess': 'Ler Menos'
        },
        'fr': {
            'readMore': 'Lire la suite',
            'readLess': 'Lire moins'
        },
        'it': {
            'readMore': 'Leggi di più',
            'readLess': 'Leggi di meno'
        },
        'de': {
            'readMore': 'Weiterlesen',
            'readLess': 'Weniger lesen'
        },
        'ru': {
            'readMore': 'Читать далее',
            'readLess': 'Читать меньше'
        },
        'zh': {
            'readMore': '阅读更多',
            'readLess': '阅读更少'
        },
        'ja': {
            'readMore': 'もっと読む',
            'readLess': '読むのをやめる'
        },
        'ko': {
            'readMore': '더 읽기',
            'readLess': '적게 읽기'
        }
    }

    // Get the language of the page
    var pageLanguage = $('html').attr('lang'); // Assuming you've set the language in a <html lang="..."> attribute

    const customClass = 'fw-bold text-dark'
    $('#show-btn').html(`<p class="${customClass}">${translations[pageLanguage]['readMore']}</p>`)
    $('#show-btn').attr('aria-label', translations[pageLanguage]['readMore'])

    $('#show-btn').clickToggle(() => {
        $('.read-more-content').css({'height': '100%'})
        $('#show-btn').html(`<p class="${customClass}">${translations[pageLanguage]['readLess']}</p>`)
        $('#show-btn').attr('aria-label', translations[pageLanguage]['readLess'])
    }, () => {
        $('.read-more-content').css({'height': '0'})
        $('#show-btn').html(`<p class="${customClass}">${translations[pageLanguage]['readMore']}</p>`)
        $('#show-btn').attr('aria-label', translations[pageLanguage]['readMore'])
    })

    $('.lazy-background').lazyBackgroundLoader();

    var currentYear = new Date().getFullYear();
    $('footer').html(function(i, oldHtml) {
        return oldHtml.replace('{{ current_year }}', currentYear);
    });

    var path = window.location.pathname;
    $('#language-dropdown option').each(function() {
        if ($(this).val() == path) {
            $(this).attr('selected', 'selected');
        }
    });
    $('#language-dropdown').change(function() {
        window.location.href = $(this).val();
    });

    $('.share-btn').on('click', function() {
    var platform = $(this).attr('data-platform');
    var language = $(this).attr('data-language'); // Assuming each button also has a 'data-language' attribute

    var shareUrl = '';

    // Invitational texts in different languages
    let invitationalTexts = {
        'en': 'Dive into "INSaNE | A Broken Hero". Join Ashnage, a gravity-controller, on his epic quest against an alien invasion. Personal struggles, intense battles, deep mysteries await. Join now!!',
        'es': 'Sumérgete en "INSaNE | Un Héroe Roto". Únete a Ashnage, un controlador de gravedad, en su épica misión contra una invasión alienígena. Luchas personales, intensas batallas, profundos misterios te esperan. ¡¡Únete ahora!!',
        'pt': 'Mergulhe em "INSaNE | Um Herói Quebrado". Junte-se a Ashnage, um controlador de gravidade, em sua épica missão contra uma invasão alienígena. Lutas pessoais, intensas batalhas, profundos mistérios te esperam. Junte-se agora!!',
        'ja': '「INSaNE | 壊れた英雄」に飛び込んでください。重力を制御するAshnageと一緒に、エイリアンの侵略に対する壮大なクエストに参加してください。個人的な闘争、激しい戦闘、深い謎が待っています。今すぐ参加してください!',
        'fr': 'Plongez dans "INSaNE | Un Héros Brisé". Rejoignez Ashnage, un contrôleur de gravité, dans sa quête épique contre une invasion extraterrestre. Des luttes personnelles, des batailles intenses, des mystères profonds vous attendent. Rejoignez-nous maintenant!!',
        'de': 'Tauchen Sie ein in "INSaNE | Ein Gebrochener Held". Begleiten Sie Ashnage, einen Schwerkraft-Controller, auf seiner epischen Quest gegen eine Alien-Invasion. Persönliche Kämpfe, intensive Schlachten, tiefe Geheimnisse warten. Mach jetzt mit!!',
        'it': 'Immergiti in "INSaNE | Un Eroe Spezzato". Unisciti a Ashnage, un controllore di gravità, nella sua epica missione contro un\'invasione aliena. Lotte personali, battaglie intense, profondi misteri ti aspettano. Unisciti ora!!',
        'ru': 'Погрузитесь в "INSaNE | Сломленный Герой". Присоединитесь к Ашнейджу, контролеру гравитации, в его эпическом квесте против инопланетного вторжения. Личные борьбы, интенсивные битвы, глубокие тайны ждут вас. Присоединяйтесь сейчас!!',
        'zh': '深入"INSaNE | 一个破碎的英雄"。加入Ashnage，一个重力控制器，在他对抗外星入侵的史诗般的任务中。个人的斗争，激烈的战斗，深深的秘密等待着你。现在就加入!!',
        'ko': '"INSaNE | 부서진 영웅"에 뛰어들어보세요. 중력 컨트롤러인 Ashnage와 함께 외계인 침략에 대한 서사시적인 퀘스트에 참여하세요. 개인적인 싸움, 격렬한 전투, 깊은 미스터리가 기다리고 있습니다. 지금 바로 참여하세요!!'
    };

    var invitationalText = invitationalTexts[language];
    // Different main page URLs for different languages
    let urls = {
        'en':  window.location.origin + '/', // For English
        'es':  window.location.origin + '/es', // For Spanish
        'pt':  window.location.origin + '/pt', // For Portuguese
        'ja':  window.location.origin + '/ja', // For Japanese
        'fr':  window.location.origin + '/fr', // For French
        'de':  window.location.origin + '/de', // For German
        'it':  window.location.origin + '/it', // For Italian
        'ru':  window.location.origin + '/ru', // For Russian
        'zh':  window.location.origin + '/cn', // For Chinese
        'ko':  window.location.origin + '/kr' // For Korean
    };

    var url = urls[language]; // Get the URL based on the language

    switch (platform) {
        case 'facebook':
            shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
            break;
        case 'twitter':
            shareUrl = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(invitationalText);
            break;
        case 'linkedin':
            shareUrl = 'https://www.linkedin.com/shareArticle?url=' + encodeURIComponent(url);
            break;
        case 'reddit':
            shareUrl = 'https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(invitationalText);
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
    
    $('video').lazyVideoLoader();

    $('img').lazyImageLoader({
        pathToMessageMap: {
            '/': 'Download',
            '/es': 'Descarga',
            '/ja': 'ダウンロード',
            '/pt': 'Baixar',
            '/fr': 'Télécharger',
            '/de': 'Herunterladen',
            '/it': 'Scarica',
            '/ru': 'Скачать',
            '/cn': '下载',
            '/kr': '다운로드'
        },
        defaultDownloadMessage: 'Download'
    });

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

    $("#sneak-peak").parallaxie({
        speed: 0.5,
        disableMobile: true,
        size: 'unset',
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
        loop: false,
        mouseDrag: true,
        dotsContainer: '#custom-owl-dots',
        dotsSpeed: 400,
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
    
    $('.owl-dot').click(function () {
        owl.trigger('to.owl.carousel', [$(this).index(), 300]);
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
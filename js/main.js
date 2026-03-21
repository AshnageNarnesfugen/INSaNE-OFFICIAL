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

    // Creamos una línea de tiempo para controlar la secuencia
    const tl = gsap.timeline();

    // 1. Configuración inicial (aseguramos que sea visible antes de empezar)
    gsap.set(".intro_animation", { display: "grid", opacity: 1 });
    gsap.set([".intro_title", ".intro_subtitle"], { opacity: 0, y: 20 });

    tl.to(".intro_animation", {
        backgroundColor: "rgba(0, 0, 0, 1)", // Iniciamos en negro sólido
        duration: 0
    })

    // 2. Aparece el título principal con un ligero movimiento hacia arriba
    .to(".intro_title", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out"
    }, "+=0.5")

    // 3. Aparece el subtítulo poco después
    .to(".intro_subtitle", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
    }, "-=0.5")

    // 4. EL CLÍMAX: Transición del fondo y el blur
    // Pasamos de opaco a 0.8 y animamos el backdrop-filter
    .to(".intro_animation", {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(20px)",
        duration: 2,
        ease: "none"
    }, "+=1")

    // 5. Salida elegante: Desvanecemos todo y finalmente ocultamos
    .to(".intro_animation", {
        opacity: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => $(".intro_animation").css("display", "none")
    }, "+=2");

    // Definir traducciones
    var translations = {
        'en': { 'readMore': 'Read More',           'readLess': 'Read Less'            },
        'es': { 'readMore': 'Leer Más',             'readLess': 'Leer Menos'           },
        'pt': { 'readMore': 'Ler Mais',             'readLess': 'Ler Menos'            },
        'fr': { 'readMore': 'Lire la suite',        'readLess': 'Lire moins'           },
        'it': { 'readMore': 'Leggi di più',         'readLess': 'Leggi di meno'        },
        'de': { 'readMore': 'Weiterlesen',          'readLess': 'Weniger lesen'        },
        'ru': { 'readMore': 'Читать далее',         'readLess': 'Читать меньше'        },
        'zh': { 'readMore': '阅读更多',              'readLess': '阅读更少'              },
        'ja': { 'readMore': 'もっと読む',            'readLess': '読むのをやめる'        },
        'ko': { 'readMore': '더 읽기',               'readLess': '적게 읽기'             },
        'ar': { 'readMore': 'اقرأ أكثر',            'readLess': 'أقرأ أقل'             },
        'hi': { 'readMore': 'और पढ़ें',              'readLess': 'कम पढ़ें'             },
        'th': { 'readMore': 'อ่านเพิ่มเติม',         'readLess': 'อ่านน้อยลง'           },
        'ms': { 'readMore': 'Baca Lagi',            'readLess': 'Baca Kurang'          },
        'id': { 'readMore': 'Baca Selengkapnya',    'readLess': 'Baca Lebih Sedikit'   },
        'tl': { 'readMore': 'Magbasa Pa',           'readLess': 'Basahin Nang Kaunti'  },
        'vi': { 'readMore': 'Đọc Thêm',             'readLess': 'Đọc Ít Hơn'           }
    };

    // Idioma de la página
    var pageLanguage = $('html').attr('lang') || 'en';

    // Elementos
    const customClass = 'fw-bold text-dark';
    const $btn = $('#show-btn');
    const $content = $('.read-more-content');

    // Estado inicial
    let expanded = false;
    $btn.html(`<p class="${customClass}">${translations[pageLanguage]['readMore']}</p>`);
    $btn.attr('aria-label', translations[pageLanguage]['readMore']);
    gsap.set($content, { height: 0, overflow: 'hidden' });
    gsap.registerPlugin(ScrollTrigger);

    // Evento de clic
    $btn.on('click', function() {
    // Animar contenido
    if (!expanded) {
        gsap.to($content, {
        height: 'auto',
        duration: 0.8,
        ease: 'power2.out',
        onStart: () => $content.css('overflow', 'hidden'),
        onComplete: () => $content.css('overflow', 'visible')
        });

        // Transición suave del botón
        gsap.to($btn, {
        opacity: 0,
        duration: 0.25,
        ease: 'power1.in',
        onComplete: () => {
            $btn.html(`<p class="${customClass}">${translations[pageLanguage]['readLess']}</p>`);
            $btn.attr('aria-label', translations[pageLanguage]['readLess']);
            gsap.to($btn, { opacity: 1, duration: 0.25, ease: 'power1.out' });
        }
        });

        expanded = true;
    } else {
        gsap.to($content, {
        height: 0,
        duration: 0.8,
        ease: 'power2.in',
        onStart: () => $content.css('overflow', 'hidden')
        });

        gsap.to($btn, {
        opacity: 0,
        duration: 0.25,
        ease: 'power1.in',
        onComplete: () => {
            $btn.html(`<p class="${customClass}">${translations[pageLanguage]['readMore']}</p>`);
            $btn.attr('aria-label', translations[pageLanguage]['readMore']);
            gsap.to($btn, { opacity: 1, duration: 0.25, ease: 'power1.out' });
        }
        });

        expanded = false;
    }
    });



    var currentYear = new Date().getFullYear();
    $('footer').html(function(i, oldHtml) {
        return oldHtml.replace('{{ current_year }}', currentYear);
    });

    var path = window.location.pathname;
    $('#language-dropdown option').each(function() {
        if ($(this).val() == path) {
            $(this).prop('selected', 'selected');
        }
    });
    $('#language-dropdown').change(function() {
        window.location.href = $(this).val();
    });

    $('.share-btn').on('click', function() {
    var platform = $(this).attr('data-platform');
    var language = $(this).attr('data-language');

    var shareUrl = '';

    // Invitational texts in different languages
    let invitationalTexts = {
        'en': 'Dive into "INSaNE | A Broken Hero". Join Ashnage, a gravity-controller, on his epic quest against an alien invasion. Personal struggles, intense battles, deep mysteries await. Join now!!',
        'es': 'Sumérgete en "INSaNE | Un Héroe Roto". Únete a Ashnage, un controlador de gravedad, en su épica misión contra una invasión alienígena. Luchas personales, intensas batallas, profundos misterios te esperan. ¡¡Únete ahora!!',
        'pt': 'Mergulhe em "INSaNE | Um Herói Quebrado". Junte-se a Ashnage, um controlador de gravidade, em sua épica missão contra uma invasão alienígena. Lutas pessoais, intensas batalhas, profundos mistérios te esperam. Junte-se agora!!',
        'jp': '「INSaNE | 壊れた英雄」に飛び込んでください。重力を制御するAshnageと一緒に、エイリアンの侵略に対する壮大なクエストに参加してください。個人的な闘争、激しい戦闘、深い謎が待っています。今すぐ参加してください!',
        'fr': 'Plongez dans "INSaNE | Un Héros Brisé". Rejoignez Ashnage, un contrôleur de gravité, dans sa quête épique contre une invasion extraterrestre. Des luttes personnelles, des batailles intenses, des mystères profonds vous attendent. Rejoignez-nous maintenant!!',
        'de': 'Tauchen Sie ein in "INSaNE | Ein Gebrochener Held". Begleiten Sie Ashnage, einen Schwerkraft-Controller, auf seiner epischen Quest gegen eine Alien-Invasion. Persönliche Kämpfe, intensive Schlachten, tiefe Geheimnisse warten. Mach jetzt mit!!',
        'it': 'Immergiti in "INSaNE | Un Eroe Spezzato". Unisciti a Ashnage, un controllore di gravità, nella sua epica missione contro un\'invasione aliena. Lotte personali, battaglie intense, profondi misteri ti aspettano. Unisciti ora!!',
        'ru': 'Погрузитесь в "INSaNE | Сломленный Герой". Присоединитесь к Ашнейджу, контролеру гравитации, в его эпическом квесте против инопланетного вторжения. Личные борьбы, интенсивные битвы, глубокие тайны ждут вас. Присоединяйтесь сейчас!!',
        'zh': '深入"INSaNE | 一个破碎的英雄"。加入Ashnage，一个重力控制器，在他对抗外星入侵的史诗般的任务中。个人的斗争，激烈的战斗，深深的秘密等待着你。现在就加入!!',
        'ko': '"INSaNE | 부서진 영웅"에 뛰어들어보세요. 중력 컨트롤러인 Ashnage와 함께 외계인 침략에 대한 서사시적인 퀘스트에 참여하세요. 개인적인 싸움, 격렬한 전투, 깊은 미스터리가 기다리고 있습니다. 지금 바로 참여하세요!!',
        'ar': 'انغمس في "جنون | بطل مكسور". انضم إلى Ashnage، المتحكم في الجاذبية، في سعيه الملحمي ضد الغزو الفضائي. صراعات شخصية ومعارك شديدة وأسرار عميقة في انتظارك. نضم الان!!',
        'hi': 'डाइव इंटू "INSaNE | ए ब्रोकन हीरो". एलियन इनवेशन के खिलाफ उनकी महाकाव्यिक प्रेषण में आश्नाज, एक ग्रैविटी-नियंत्रक, के साथ जुड़ें। व्यक्तिगत संघर्ष, तीव्र युद्ध, गहरे रहस्यों का इंतजार है। अभी शामिल हों!!',
        'th': 'ดำดิ่งสู่ "INSaNE | วีรบุรุษผู้แตกสลาย" ร่วมเดินทางกับ Ashnage ผู้ควบคุมแรงโน้มถ่วงในการผจญภัยอันยิ่งใหญ่ต่อต้านการรุกรานของมนุษย์ต่างดาว ความขัดแย้งส่วนตัว การต่อสู้อันดุเดือด และความลึกลับที่รอคุณอยู่ เข้าร่วมตอนนี้!!',
        'ms': 'Selami "INSaNE | Wira Yang Patah". Sertai Ashnage, pengawal graviti, dalam pengembaraan epik menentang serangan alien. Konflik peribadi, pertempuran sengit, misteri mendalam menanti. Sertai sekarang!!',
        'id': 'Selami "INSaNE | Pahlawan yang Terluka". Bergabunglah dengan Ashnage, pengendali gravitasi, dalam petualangan epik melawan invasi alien. Konflik pribadi, pertempuran sengit, misteri mendalam menanti. Bergabunglah sekarang!!',
        'tl': 'Sumabak sa "INSaNE | Isang Sirang Bayani". Samahan si Ashnage, kontroler ng grabidad, sa kanyang epikong pakikipagsapalaran laban sa pagsalakay ng alien. Mga personal na pakikibaka, matinding labanan, malalim na misteryo ang naghihintay. Sumali na!!',
        'vi': 'Khám phá "INSaNE | Người Hùng Gãy Nát". Hãy cùng Ashnage, người kiểm soát trọng lực, trong hành trình sử thi chống lại cuộc xâm lăng ngoài hành tinh. Những đấu tranh nội tâm, trận chiến căng thẳng, bí ẩn sâu xa đang chờ đón. Tham gia ngay!!'
    };

    var invitationalText = invitationalTexts[language];

    // Different main page URLs for different languages
    let urls = {
        'en':  window.location.origin + '/',
        'es':  window.location.origin + '/es',
        'pt':  window.location.origin + '/pt',
        'jp':  window.location.origin + '/jp',
        'fr':  window.location.origin + '/fr',
        'de':  window.location.origin + '/de',
        'it':  window.location.origin + '/it',
        'ru':  window.location.origin + '/ru',
        'zh':  window.location.origin + '/zh',
        'ko':  window.location.origin + '/kr',
        'ar':  window.location.origin + '/ar',
        'hi':  window.location.origin + '/hi',
        'th':  window.location.origin + '/th',
        'ms':  window.location.origin + '/ms',
        'id':  window.location.origin + '/id',
        'tl':  window.location.origin + '/tl',
        'vi':  window.location.origin + '/vi'
    };

    var url = urls[language];

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
            return;
    }

    window.open(shareUrl, '_blank');
});

    
    
    // Create a class with a function to set the title property
    class DynamicTitleHandler {
        static setTitleForLinks() {
            $('a').each(function() {
                const $this = $(this);
                const content = $this.text().trim();

                if (content.length > 0) {
                    $this.attr('title', content);
                } else {
                    return;
                }
            });
        }
    }

    DynamicTitleHandler.setTitleForLinks();
    
    $('video').lazyVideoLoader();

    $('img').lazyImageLoader({
        pathToMessageMap: {
            '/':    'Download',
            '/es':  'Descarga',
            '/jp':  'ダウンロード',
            '/pt':  'Baixar',
            '/fr':  'Télécharger',
            '/de':  'Herunterladen',
            '/it':  'Scarica',
            '/ru':  'Скачать',
            '/zh':  '下载',
            '/kr':  '다운로드',
            '/ar':  'تحميل',
            '/hi':  'डाउनलोड',
            '/th':  'ดาวน์โหลด',
            '/ms':  'Muat Turun',
            '/id':  'Unduh',
            '/tl':  'I-download',
            '/vi':  'Tải Xuống'
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
    var arrowIcon = scrollBtn.find('.arrow-btn div');

    $(window).scroll(() => {
        var y = $(window).scrollTop();

        if (y > 500) {
            scrollBtn.fadeIn().css('z-index', '111111').data('action', 'up');
            arrowIcon.removeClass('arrow-down').addClass('arrow-up');
        } else {
            scrollBtn.fadeIn().css('z-index', '111111').data('action', 'down');
            arrowIcon.removeClass('arrow-up').addClass('arrow-down');
        }
    });

    scrollBtn.click(() => {
        var action = scrollBtn.data('action');

        if (action === 'up') {
            $('html, body').animate({ scrollTop: 0 }, 1000);
        } else {
            var nextSection = $('#quickresume').first();
            if (nextSection.length) {
                $('html, body').animate({ scrollTop: nextSection.offset().top }, 1000);
            }
        }
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

        class FormHandler {
            constructor(formId, ajaxUrl) {
                this.form = $(formId);
                this.ajaxUrl = ajaxUrl;
                this.notifSuccess = this.sanitizeJSON(this.form.attr('data-notif-success'));
                this.notifError = this.sanitizeJSON(this.form.attr('data-notif-error'));
                this.tyMsg = this.form.attr('data-tymsg');
                this.errMsg = this.form.attr('data-errmsg');
                this.cookieSubmittedMSN = this.form.attr('data-cookiesubmittedmsn');
        
                this.checkRegistrationStatus();
                this.form.on('submit', (e) => this.handleSubmit(e));
            }
        
            sanitize(input) {
                if (typeof input !== 'string') return '';
                
                input = input.replace(/<script.*?>.*?<\/script>/gi, '')
                             .replace(/<iframe.*?>.*?<\/iframe>/gi, '')
                             .replace(/<object.*?>.*?<\/object>/gi, '')
                             .replace(/<embed.*?>.*?<\/embed>/gi, '')
                             .replace(/<applet.*?>.*?<\/applet>/gi, '')
                             .replace(/<meta.*?>/gi, '')
                             .replace(/<link.*?>/gi, '');
        
                input = input.replace(/\bon[a-z]+\s*=\s*(['"]).*?\1/gi, '');
                input = input.replace(/javascript:/gi, '');
        
                return input.replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#x27;")
                            .replace(/\//g, "&#x2F;");
            }
        
            sanitizeJSON(jsonString) {
                try {
                    return JSON.parse(jsonString).map(item => this.sanitize(item));
                } catch (e) {
                    return ["Invalid Data", "Invalid Data"];
                }
            }
        
            checkRegistrationStatus() {
                if (Cookies.get('registered') === 'true') {
                    this.form.css('display', 'none');
                    $('.form-container').html(this.cookieSubmittedMSN);
                }
            }
        
            sendNotification(type, title, body) {
                Notification.requestPermission().then(perm => {
                    if (perm === "granted") {
                        new Notification(this.sanitize(title), {
                            body: this.sanitize(body),
                            icon: "img/webiconspace-removebg-preview.png"
                        });
                    }
                });
            }
        
            getFormData() {
                return this.form.serializeArray().reduce((obj, item) => {
                    obj[item.name] = this.sanitize(item.value);
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
                    $('.form-container').html(this.tyMsg);
                    Cookies.set('registered', 'true', { expires: 365 });
                } else {
                    this.sendNotification(type, this.notifError[0], this.notifError[1]);
                    this.form.css('display', 'none');
                    $('.form-container').html(this.errMsg);
                }
            }
        
            handleSubmit(e) {
                e.preventDefault();
                this.submitForm();
            }
        }
        
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

        const shuffler = new SectionShuffler();
        shuffler.init();
        

   var sectionScrollID = getUrlParameter('sectionScrollID');

   if (sectionScrollID) {
       var targetElement = $('#' + sectionScrollID);

       if (targetElement.length > 0) {
           var windowHeight = $(window).height();
           var elementHeight = targetElement.height();
           var scrollTo = targetElement.offset().top - (windowHeight / 2) + (elementHeight / 2);
           
           $('html, body').animate({
               scrollTop: scrollTo
           }, 1000);
       }
   }

   function getUrlParameter(name) {
       name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
       var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
       var results = regex.exec(location.search);
       return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
   }

    var owl = $('.owl-carousel')
    owl.owlCarousel({
        items: 1,
        loop: false,
        mouseDrag: true,
        dotsContainer: '#custom-owl-dots',
        dotsSpeed: 400,
        autoplay: false,
        nav: false,
        rewind: true
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

    var startTime = new Date().getTime();

    $(window).on('load', function() {
        var endTime = new Date().getTime();
        var loadTime = endTime - startTime;
        console.log(`Load Time: ${loadTime}ms`);
    });
})
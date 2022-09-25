jQuery(() => {

    /*
        window.onload = function() {

        var ln = navigator.language || navigator.userLanguage;
        
        let pagActual = window.location.pathname;


        if (ln == 'en-EN' && !pagActual.includes("indexEn")) {
            window.location.href = '';
        } else if (ln == 'es-ES' && !pagActual.includes("indexEs")) {
            window.location.href = 'es';
        } else {
            console.log("Otro idioma");
        }

    }
    */
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

    var toMail = $("#to-mail");
    toMail.click(function(e) {
        e.preventDefault();
        $('body,html').animate({
            scrollTop: $(this.hash).offset().top
        }, 1000);
    })

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
        speed: 0.8
    });

    let data = $('#letter').attr('data-array');
    data = JSON.parse(data)
    console.log(data)

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
                        new Notification("Your form has been Submitted.", {
                            body: "Congratulations, Soonly our team will be in touch with you.",
                            icon: "img/webiconspace-removebg-preview.png"
                        });
                    }
                });
                form.css('display', 'none');
                $('.form-container').append(tymsg);
            },
            error: (err) => {
                Notification.requestPermission().then(perm => {
                    if (perm === "granted") {
                        new Notification("Your form couldn't be Submitted.", {
                            body: "An error has occurred, try again :(.",
                            icon: "img/webiconspace-removebg-preview.png"
                        });
                    }
                });
                form.css('display', 'none');
                $('.form-container').append(errmsg);
            }
        });

    })

    const shuffleTitles = (elementClass) => {
        let titles = $(elementClass)
        $(titles).each(function() {
            $(this).shuffleLetters({
                "step": 30,
                "fps": 60,
                "text": $(this).attr('data-text')
            })
        })
    }

    var observer = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting === true)
            shuffleTitles('.shuffle')
    }, { threshold: [1] });

    observer.observe($("#quickresume")[0]);
})
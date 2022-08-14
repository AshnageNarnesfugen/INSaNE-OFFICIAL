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

    $("#esc1").parallaxie({
        speed: 0.8
    });
    $("#esc3").parallaxie({
        speed: 0.8
    });

    let data = [
        "A Broken Hero",
        "Hero of the universe",
        "Not your typical kind of hero, but the one you needed.",
        "Never knows best",
        "The saviour of the broken",
        "The one that the truth has spoken",
        "Leading the Sweetest Revenge Ever",
        "Sweetening your dankest dreams",
        "The revelion against the evil and the corrupted has started",
        "At the end, life goes on"
    ]

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
    form.on('submit', () => {
        alert('Your message has been submitted.')
        form.css('display', 'none')
        $('.form-container').append(`<div class="post-form"><h1><mark class="mini-charted">Thank you for contacting us.</mark></h1></div>`)
    })
})
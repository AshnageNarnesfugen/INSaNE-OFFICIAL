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

    let data = ["A Broken Hero", "Hero of the universe", "Not your typical kind of hero, but the one you needed.", "Never knows best"]

    var container = $("#letter")
    var index = 0
    setInterval(() => {
        container.shuffleLetters({
            "step": 30,
            "fps": 60,
            "text": data[index]
        });
        index++ % data.length
    }, 4000);

    window.twttr = function(d, s, id) {
        var t, js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);
        return window.twttr || (t = { _e: [], ready: function(f) { t._e.push(f) } });
    }(document, 'script', 'twitter-wjs');

    // When widget is ready, run masonry
    twttr.ready((twttr) => {
        twttr.events.bind('loaded', (event) => {
            $('.grid').masonry({
                itemSelector: '.grid-item',
                columnWidth: 300,
                gutter: 20
            });
        });
    });
    AOS.init();
})
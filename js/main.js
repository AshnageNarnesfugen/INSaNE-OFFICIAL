$(document).ready(function() {
    $(window).scroll(function() {
        //parallax();
        if ($(document).scrollTop() > 250) {
            $(".planet").hide('slow');
        } else {
            $(".planet").show('slow');
        }
    });

    /*function parallax() {
        var wScroll = $(window).scrollTop();
        //.space_sec:not(:last-child)
        $('#esc1').css({
            'background-position': `center ${wScroll * 0.5}px`
        });
    }*/
    $.fn.clickToggle = function(func1, func2) {
        var funcs = [func1, func2];
        this.data('toggleclicked', 0);
        this.click(function() {
            var data = $(this).data();
            var tc = data.toggleclicked;
            $.proxy(funcs[tc], this)();
            data.toggleclicked = (tc + 1) % 2;
        });
        return this;
    };
    $(".menu-wrapper").clickToggle(function() {
        $(".burger_menu").css({
            "opacity": "1",
            "z-index": "6"
        });
    }, function() {
        $(".burger_menu").css({
            "opacity": "0",
            "z-index": "-1"
        });
    });
    (function() {
        $('.menu-wrapper').on('click', function() {
            $('.hamburger-menu').toggleClass('animate');
        })
    })();
    var scrolllink = $('.scroll');
    //smooth scrolling

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
    $(function() {

        // container is the DOM element;
        // userText is the textbox

        var container = $("#letter")

        // Shuffle the contents of container
        container.shuffleLetters();

        // Bind events

        // Leave a 4 second pause

        setTimeout(function() {

            // Shuffle the container with custom text
            container.shuffleLetters({
                // $(".letter").children().addClass(".shuffle");

            });
        }, 4000);

    });
    /*
    var galleryThumbs = new Swiper(".gallery-thumbs", {
        direction: "horizontal",
        spaceBetween: 10,
        slidesPerView: 3,
        freeMode: false,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        breakpoints: {
            480: {
                direction: "vertical",
                slidesPerView: 3,
            }
        }
    });
    var galleryTop = new Swiper(".gallery-top", {
        direction: "horizontal",
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        thumbs: {
            swiper: galleryThumbs
        }
    });
    */


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
    twttr.ready(function(twttr) {
        twttr.events.bind('loaded', function(event) {
            $('.grid').masonry({
                itemSelector: '.grid-item',
                columnWidth: 300,
                gutter: 20
            });
        });
    });
    AOS.init();
});
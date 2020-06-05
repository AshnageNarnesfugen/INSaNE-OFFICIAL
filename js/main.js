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
            "z-index": "4"
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
        $('body,html').animate({
            scrollTop: $(this.hash).offset().top
        }, 1000);
    });

    $(".space_sec").parallax();
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

    AOS.init();
});
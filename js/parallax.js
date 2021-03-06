//
/* jQuery Parallax Plugin for WYSIWYG Web Builder 15 - Copyright Pablo Software solutions 2019 - http://www.wysiwygwebbuilder.com */
(function(a) {
    a.fn.parallax = function(b) { return this.each(function() { a.parallax(this, b) }) };
    a.parallax = function(b, g) {
        function c() {
            var b = e.offset().top,
                c = e.outerHeight(!0),
                f = a(window).scrollTop();
            b + c < f || b > f + a(window).height() || e.css("backgroundPosition", d.x + " " + Math.round((h - f) * d.speed) + "px")
        }
        var d = { minWidth: 0, x: "50%", speed: .2 };
        g && (d = a.extend(d, g));
        var e = a(b),
            h = e.offset().top;
        a(window).width() < d.minWidth || (a(window).bind("scroll", function() { c() }), a(window).resize(function() { c() }), c(b))
    }
})(jQuery);
//
/*! Copyright (c) 2016 THE ULTRASOFT (http://theultrasoft.com)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Project: Parallaxie
 * Version: 0.5
 *
 * Requires: jQuery 1.9+
 */
/*(function( $ ){

    $.fn.parallaxie = function( options ){

        options = $.extend({
            speed: 0.2,
            repeat: 'no-repeat',
            size: 'cover',
            pos_x: 'center',
            offset: 0,
            disableMobile: true // Added property to disable on mobile devices
        }, options );

        var $elements = this; // Store the elements

        function initializeParallax() {
            $elements.each(function(){
                var $el = $(this);
                var local_options = $el.data('parallaxie');
                if( typeof local_options !== 'object' ) local_options = {};
                local_options = $.extend( {}, options, local_options );

                var image_url = $el.data('image');
                if( typeof image_url === 'undefined' ){
                    image_url = $el.css('background-image');
                    if( !image_url ) return;

                    // APPLY DEFAULT CSS
                    var pos_y =  local_options.offset + ($el.offset().top - $(window).scrollTop()) * (1 - local_options.speed );
                    $el.css({
                        'background-image': image_url,
                        'background-size': local_options.size,
                        'background-repeat': local_options.repeat,
                        'background-attachment': 'fixed',
                        'background-position': local_options.pos_x + ' ' + pos_y + 'px',
                    });

                    // Call by default for the first time on initialization.
                    if ((!local_options.disableMobile || !isMobileDevice()) && !isSmallScreen()) {
                        parallax_scroll( $el, local_options );
                    }
                }
            });
        }

        function handleResize() {
            if (!isMobileDevice() && !isSmallScreen()) {
                initializeParallax();
            }
        }

        // Initialize parallax on page load
        $(document).ready(initializeParallax);

        // Call whenever the scroll event occurs.
        $(window).scroll(function(){
            if (!isMobileDevice() && !isSmallScreen()) {
                parallax_scroll($elements, options);
            }
        });

        // Call whenever the window is resized.
        $(window).resize(handleResize);

        return this;
    };


    function parallax_scroll( $el, local_options ){
        $el.each(function(){
            var $this = $(this);
            var pos_y =  local_options.offset + ($this.offset().top - $(window).scrollTop()) * (1 - local_options.speed );
            $this.data( 'pos_y', pos_y );
            $this.css( 'background-position', local_options.pos_x + ' ' + pos_y + 'px' );
        });
    }
    
    function isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }

    function isSmallScreen() {
        return window.matchMedia("(max-width: 767px)").matches;
    }

}( jQuery ));*/
(function($) {
    $.fn.parallaxie = function(options) {
        options = $.extend({
            speed: 0.2,
            repeat: 'no-repeat',
            size: 'cover',
            pos_x: 'center',
            offset: 0,
            disableMobile: true // Added property to disable on mobile devices
        }, options);

        var lastExecution = 0,
            throttle = 100; // You can adjust this value

        $(window).on("scroll resize", function() {
            var now = Date.now();
            if (lastExecution + throttle < now) {
                lastExecution = now;
                if (!isMobileDevice() && !isSmallScreen()) {
                    updateParallax($(this));
                }
            }
        });

        function initializeParallax() {
            this.each(function() {
                var $el = $(this);
                var local_options = $el.data('parallaxie');
                if (typeof local_options !== 'object') local_options = {};
                local_options = $.extend({}, options, local_options);

                var image_url = $el.data('image');
                if (typeof image_url === 'undefined') {
                    image_url = $el.css('background-image');
                    if (!image_url) return;

                    // APPLY DEFAULT CSS
                    var pos_y = local_options.offset + ($el.offset().top - $(window).scrollTop()) * (1 - local_options.speed);
                    $el.css({
                        'background-image': image_url,
                        'background-size': local_options.size,
                        'background-repeat': local_options.repeat,
                        'background-attachment': 'fixed',
                        'background-position': local_options.pos_x + ' ' + pos_y + 'px',
                    });

                    // Call by default for the first time on initialization.
                    if ((!local_options.disableMobile || !isMobileDevice()) && !isSmallScreen()) {
                        updateParallax($el);
                    }
                }
            });
        }

        function updateParallax($el) {
            $el.each(function() {
                var $this = $(this);
                if ($this.length) { // Make sure the element exists
                    var pos_y = options.offset + ($this.offset().top - $(window).scrollTop()) * (1 - options.speed);
                    $this.data('pos_y', pos_y);
                    $this.css('background-position', options.pos_x + ' ' + pos_y + 'px');
                }
            });
        }

        function isMobileDevice() {
            return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
        }

        function isSmallScreen() {
            return window.matchMedia("(max-width: 767px)").matches;
        }

        initializeParallax.call(this);
    };
}(jQuery));

(function( $ ){

    $.fn.blurOnScroll = function( options ){

        options = $.extend({
            speed: 0.2,
            maxBlur: 20, // Maximum blur in pixels
            disableMobile: true // Added property to disable on mobile devices
        }, options );

        var $elements = this; // Store the elements

        function initializeBlur() {
            $elements.each(function(){
                var $el = $(this);
                var local_options = $el.data('blurOnScroll');
                if( typeof local_options !== 'object' ) local_options = {};
                local_options = $.extend( {}, options, local_options );

                // Call by default for the first time on initialization.
                if ((!local_options.disableMobile || !isMobileDevice()) && !isSmallScreen()) {
                    blur_scroll( $el, local_options );
                }
            });
        }

        function handleResize() {
            if (!isMobileDevice() && !isSmallScreen()) {
                initializeBlur();
            }
        }

        // Initialize blur on page load
        $(document).ready(initializeBlur);

        // Call whenever the scroll event occurs.
        $(window).scroll(function(){
            if (!isMobileDevice() && !isSmallScreen()) {
                blur_scroll($elements, options);
            }
        });

        // Call whenever the window is resized.
        $(window).resize(handleResize);

        return this;
    };


    function blur_scroll( $el, local_options ){
        $el.each(function(){
            var $this = $(this);
            var blur_value =  local_options.maxBlur * ($this.offset().top - $(window).scrollTop()) / $(window).height();
            blur_value = Math.max(0, Math.min(local_options.maxBlur, blur_value)); // Clamp between 0 and maxBlur
            $this.css( 'backdrop-filter', 'blur(' + blur_value + 'px)' );
        });
    }
    
    function isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }

    function isSmallScreen() {
        return window.matchMedia("(max-width: 767px)").matches;
    }

}( jQuery ));
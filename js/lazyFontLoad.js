/*
jQuery(() => {
    (function($) {
        $.fn.fontLoader = function(options) {
            const settings = $.extend({
                fonts: [],
                fallback: 'sans-serif',
                timeout: 3000
            }, options);
    
            function loadFont(font) {
                const formats = font.formats || {};
                const promises = [];
    
                for (let format in formats) {
                    const face = new FontFace(font.name, `url(${formats[format]})`, {
                        weight: font.weight || 'normal',
                        style: font.style || 'normal'
                    });
                    promises.push(face.load());
                }
    
                return Promise.all(promises).then(loadedFonts => {
                    loadedFonts.forEach(loadedFont => {
                        document.fonts.add(loadedFont);
                    });
                }).catch(error => {
                    console.error(`Failed to load font: ${font.name}`, error);
                });
            }
    
            const fontPromises = settings.fonts.map(loadFont);
    
            return this.each(function() {
                Promise.all(fontPromises).then(() => {
                    console.log('All fonts loaded!');
                    $(this).trigger('fontsLoaded');
                }).catch(error => {
                    console.error('Some fonts failed to load.', error);
                    $(this).trigger('fontsLoadError', error);
                });
            });
        };
    })(jQuery);
    
    // Usage
    $(document).ready(function() {
        $('body').fontLoader({
            fonts: [
                {
                    name: 'sharpsans-web',
                    weight: '400',
                    style: 'normal',
                    formats: {
                        woff2: '../css/fonts/SharpSans-Medium.woff2'
                    }
                },
                {
                    name: 'sharpsans-web',
                    weight: '600',
                    style: 'normal',
                    formats: {
                        woff2: '../css/fonts/SharpSans-Semibold.woff2'
                    }
                },
                {
                    name: 'sharpsans-web',
                    weight: '800',
                    style: 'normal',
                    formats: {
                        woff2: '../css/fonts/SharpSans-Bold.woff2'
                    }
                },
                {
                    name: 'architects-daughter',
                    formats: {
                        ttf: '../css/fonts/ArchitectsDaughter-Regular.ttf'
                    }
                },
                {
                    name: 'MailSans',
                    weight: '400',
                    style: 'normal',
                    formats: {
                        woff2: '../css/fonts/MailSansRegular.woff2',
                        woff: '../css/fonts/MailSansRegular.woff'
                    }
                },
                {
                    name: 'Hiragino Mincho Pro',
                    weight: '400',
                    style: 'normal',
                    formats: {
                        otf: '../css/fonts/hiragino-mincho-pro-w3.otf'
                    }
                }
            ],
            fallback: 'sans-serif'
        });
    }) 
})
*/

jQuery(() => {
    (function($) {
        $.fn.fontLoader = function(options) {
            const settings = $.extend({
                fonts: [],
                fallback: 'sans-serif',
                timeout: 3000,
                preload: true
            }, options);
    
            function loadFont(font) {
                const formats = font.formats || {};
                const promises = [];
    
                for (let format in formats) {
                    const face = new FontFace(font.name, `url(${formats[format]})`, {
                        weight: font.weight || 'normal',
                        style: font.style || 'normal'
                    });
                    promises.push(face.load());
                    
                    if (settings.preload) {
                        const preloadLink = document.createElement("link");
                        preloadLink.href = formats[format];
                        preloadLink.rel = "preload";
                        preloadLink.as = "font";
                        preloadLink.type = `font/${format}`;
                        preloadLink.crossOrigin = "";
                        document.head.appendChild(preloadLink);
                    }
                }
    
                return Promise.all(promises).then(loadedFonts => {
                    loadedFonts.forEach(loadedFont => {
                        document.fonts.add(loadedFont);
                    });
                }).catch(error => {
                    console.error(`Failed to load font: ${font.name}`, error);
                });
            }
    
            const fontPromises = settings.fonts.map(loadFont);
    
            function timeout(ms) {
                return new Promise((_, reject) => setTimeout(() => reject(new Error('Font loading timeout')), ms));
            }

            Promise.race([
                Promise.all(fontPromises),
                timeout(settings.timeout)
            ]).then(() => {
                console.log('All fonts loaded!');
                $(this).trigger('fontsLoaded');
            }).catch(error => {
                console.error('Some fonts failed to load.', error);
                $(this).trigger('fontsLoadError', error);
            });
        };
    })(jQuery);

    // Usage
    $(window).on('load', function() {
        $('body').fontLoader({
            fonts: [ 
                {
                    name: 'sharpsans-web',
                    weight: '400',
                    style: 'normal',
                    formats: {
                        woff2: '../css/fonts/SharpSans-Medium.woff2'
                    }
                },
                {
                    name: 'sharpsans-web',
                    weight: '600',
                    style: 'normal',
                    formats: {
                        woff2: '../css/fonts/SharpSans-Semibold.woff2'
                    }
                },
                {
                    name: 'sharpsans-web',
                    weight: '800',
                    style: 'normal',
                    formats: {
                        woff2: '../css/fonts/SharpSans-Bold.woff2'
                    }
                },
                {
                    name: 'architects-daughter',
                    formats: {
                        ttf: '../css/fonts/ArchitectsDaughter-Regular.ttf'
                    }
                },
                {
                    name: 'MailSans',
                    weight: '400',
                    style: 'normal',
                    formats: {
                        woff2: '../css/fonts/MailSansRegular.woff2',
                        woff: '../css/fonts/MailSansRegular.woff'
                    }
                },
                {
                    name: 'Hiragino Mincho Pro',
                    weight: '400',
                    style: 'normal',
                    formats: {
                        otf: '../css/fonts/hiragino-mincho-pro-w3.otf'
                    }
                }
             ],
            fallback: 'sans-serif',
            preload: true,  // Set this to false if you don't want to preload
            timeout: 3000  // 3 seconds timeout
        });
    });
});

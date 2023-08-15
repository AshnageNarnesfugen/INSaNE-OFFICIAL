jQuery(() => {
    $.fn.fontLoader = function(options) {
        const {
            fonts = [],
            fallback = 'sans-serif'
        } = options;

        function loadFont(font) {
            const { name, formats = {}, weight = 'normal', style = 'normal' } = font;
            const promises = Object.entries(formats).map(([format, url]) => {
                const face = new FontFace(name, `url(${url})`, { weight, style });
                return face.load().then(loadedFont => {
                    document.fonts.add(loadedFont);
                }).catch(error => {
                    console.error(`Failed to load font [${name}] in format [${format}]:`, error);
                });
            });
            return Promise.all(promises);
        }

        const fontPromises = fonts.map(loadFont);

        return Promise.all(fontPromises).then(() => {
            console.log('All fonts loaded!');
            this.trigger('fontsLoaded');
        }).catch(error => {
            console.error('Some fonts failed to load.', error);
            this.trigger('fontsLoadError', error);
        });
    };

    // Usage
    $(document).on('load', window, function() {
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
    });
});

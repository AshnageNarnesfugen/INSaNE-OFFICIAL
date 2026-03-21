/*(function($) {
    $.fn.lazyVideoLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            // Parámetros de animación GSAP
            startWidth: "80%",
            endWidth: "100%",
            startRadius: "40px",
            endRadius: "0px",
            gsapStart: "top bottom",
            gsapEnd: "top 10%"
        }, options);

        // Registrar ScrollTrigger por si no se hizo externamente
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }

        const observer = new IntersectionObserver(handleIntersection, settings);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Page Visibility API
        let hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden"; visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden"; visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden"; visibilityChange = "webkitvisibilitychange";
        }

        let isTabActive = !document[hidden];

        function handleVisibilityChange(videoElement) {
            const video = $(videoElement);
            if (document[hidden]) {
                if (!video[0].paused && video.attr('data-user-started') === 'true') {
                    video[0].pause();
                    video.attr('data-paused', 'true');
                }
            } else {
                if (video.attr('data-paused') === 'true' && video.attr('data-user-started') === 'true') {
                    const entry = observer.takeRecords().find(e => e.target === videoElement);
                    if (entry && entry.isIntersecting) {
                        video[0].play();
                        video.attr('data-paused', 'false');
                    }
                }
            }
        }

        function loadVideos($video) {
            const videoElement = $video[0];
            $video.attr('id', `video-${Math.random().toString(36).substr(2, 9)}`);

            // --- WRAPPER DINÁMICO ---
            // Envolvemos el video para que el contenedor controle el ancho y el clip del radius
            const $wrapper = $video.wrap('<div class="dynamic-video-wrapper"></div>').parent();
            $wrapper.css({
                'width': settings.startWidth,
                'border-radius': settings.startRadius,
                'margin': '0 auto',
                'overflow': 'hidden',
                'position': 'relative',
                'background': '#000'
            });

            // --- ANIMACIÓN GSAP SCROLL ---
            if (typeof gsap !== "undefined") {
                gsap.to($wrapper, {
                    width: settings.endWidth,
                    borderRadius: settings.endRadius,
                    ease: "none",
                    scrollTrigger: {
                        trigger: $wrapper,
                        start: settings.gsapStart,
                        end: settings.gsapEnd,
                        scrub: true
                    }
                });
            }

            observer.observe(videoElement);
            document.addEventListener(visibilityChange, () => handleVisibilityChange(videoElement), false);
        }

        function handleIntersection(entries) {
            entries.forEach(entry => {
                const video = $(entry.target);
                if (entry.isIntersecting) {
                    if (video.attr('data-loaded') !== 'true') {
                        video.data('posters', []);
                        lazyLoadVideo(video);
                        lazyLoadPoster(video);
                        video.attr('data-loaded', 'true');
                    }
                    if (video.attr('data-paused') === 'true' && video.attr('data-user-started') === 'true') {
                        video[0].play();
                        video.attr('data-paused', 'false');
                    }
                } else {
                    if (!video[0].paused && video.attr('data-user-started') === 'true') {
                        video[0].pause();
                        video.attr('data-paused', 'true');
                    }
                }
            });
        }

        function fetchVideoSource(src) {
            return fetch(src)
                .then(response => response.blob())
                .then(blob => URL.createObjectURL(blob))
                .catch(err => {
                    console.error(`Failed to fetch video: ${err}`);
                    return '';
                });
        }

        function lazyLoadPoster(video) {
            const posterData = video.attr('data-poster');
            if (posterData) {
                let posterObject;
                try { posterObject = JSON.parse(posterData); } catch { return; }
                const posterPriorityList = Object.keys(posterObject).sort();
                loadPostersFromPriorityList(video, posterObject, posterPriorityList, 0);
            }
        }

        function loadPostersFromPriorityList(video, posterObject, posterPriorityList, index = 0) {
            if (index >= posterPriorityList.length) return;
            const posterURL = posterObject[posterPriorityList[index]];
            fetch(posterURL)
                .then(response => response.blob())
                .then(blob => {
                    const objectURL = URL.createObjectURL(blob);
                    video.data('posters').push(objectURL);
                    if (index === 0) {
                        video.attr('poster', objectURL);
                        if (isMobile) loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
                    } else if (isMobile) {
                        video.attr('poster', objectURL);
                    }
                    loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
                });
        }

        function lazyLoadVideo(video) {
            const sources = video.find('source');
            const overlay = createOverlay(video);
            video.prop('controls', false);
        
            const promises = sources.map((index, sourceElement) => {
                const source = $(sourceElement);
                return fetchVideoSource(source.attr('data-src')).then(url => {
                    if (url) { source.attr('src', url); return url; }
                    throw new Error();
                });
            }).get();
        
            $.when.apply($, promises).then(() => {
                video[0].load();
                setupPlayButton(overlay, video);
            });
        }

        function createOverlay(video) {
            const overlay = $('<div>', { class: 'video-overlay', text: 'Loading...' });
            video.parent().append(overlay);
            return overlay;
        }

        function setupPlayButton(overlay, video) {
            const playButtonTemplate = `
                <div class="play-button-overlay d-flex align-items-center justify-content-center">
                    <button class="play-button btn btn-danger btn-lg" aria-label="Play Button">
                        <span class="btn-iris"></span>
                    </button>
                </div>`;

            overlay.html(playButtonTemplate);
            const $wrapper = video.parent();
            const $playBtn = overlay.find('.play-button');

            // --- LÓGICA DE CURSOR MAGNÉTICO (Solo Desktop) ---
            if (!isMobile) {
                $wrapper.css('cursor', 'none').find('*').css('cursor', 'none');

                $wrapper.on('mousemove', function(e) {
                    const rect = $wrapper[0].getBoundingClientRect();
                    const relX = e.clientX - rect.left;
                    const relY = e.clientY - rect.top;

                    gsap.to($playBtn, {
                        x: relX - ($playBtn.outerWidth() / 2),
                        y: relY - ($playBtn.outerHeight() / 2),
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                });

                // Play al hacer click en cualquier parte del wrapper
                $wrapper.on('click', function() {
                    if ($wrapper.find('.video-overlay').length > 0) {
                        $playBtn.trigger('click');
                    }
                });
            }

            $playBtn.on('click', function(e) {
                e.stopPropagation(); // Evitar doble activación por el click del wrapper
                overlay.remove();
                video.prop('controls', true);
                video[0].play();
                video.attr('data-user-started', 'true');
            });

            video.on('ended', function() {
                const posters = video.data('posters');
                video[0].load();
                video.parent().append(overlay);
                setupPlayButton(overlay, video);
                video.prop('controls', false);
                video.attr('poster', posters[0]);
            });
        }

        return this.each(function() {
            loadVideos($(this));
        });
    };
}(jQuery));*/

(function($) {
    $.fn.lazyVideoLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            startWidth: "80%",
            endWidth: "100%",
            startRadius: "40px",
            endRadius: "0px",
            gsapStart: "top bottom",
            gsapEnd: "top 10%"
        }, options);

        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }

        const observer = new IntersectionObserver(handleIntersection, settings);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        let hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden"; visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden"; visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden"; visibilityChange = "webkitvisibilitychange";
        }

        function handleVisibilityChange(videoElement) {
            const video = $(videoElement);
            if (document[hidden]) {
                if (!video[0].paused && video.attr('data-user-started') === 'true') {
                    video[0].pause();
                    video.attr('data-paused', 'true');
                    updateUIState(video, true);
                }
            } else {
                if (video.attr('data-paused') === 'true' && video.attr('data-user-started') === 'true') {
                    video[0].play();
                    video.attr('data-paused', 'false');
                    updateUIState(video, false);
                }
            }
        }

        function loadVideos($video) {
            const videoElement = $video[0];
            $video.attr('id', `video-${Math.random().toString(36).substr(2, 9)}`);

            // Wrapper dinámico con clase de blur inicial
            const $wrapper = $video.wrap('<div class="dynamic-video-wrapper is-video-blur"></div>').parent();
            $wrapper.css({
                'width': settings.startWidth,
                'border-radius': settings.startRadius,
                'margin': '0 auto',
                'overflow': 'hidden',
                'position': 'relative',
                'background': '#000'
            });

            if (typeof gsap !== "undefined") {
                gsap.to($wrapper, {
                    width: settings.endWidth,
                    borderRadius: settings.endRadius,
                    ease: "none",
                    scrollTrigger: {
                        trigger: $wrapper,
                        start: settings.gsapStart,
                        end: settings.gsapEnd,
                        scrub: true
                    }
                });
            }

            observer.observe(videoElement);
            document.addEventListener(visibilityChange, () => handleVisibilityChange(videoElement), false);
        }

        function handleIntersection(entries) {
            entries.forEach(entry => {
                const video = $(entry.target);
                if (entry.isIntersecting) {
                    if (video.attr('data-loaded') !== 'true') {
                        video.data('posters', []);
                        lazyLoadVideo(video);
                        lazyLoadPoster(video);
                        video.attr('data-loaded', 'true');
                    }
                    if (video.attr('data-paused') === 'true' && video.attr('data-user-started') === 'true') {
                        video[0].play();
                        video.attr('data-paused', 'false');
                        updateUIState(video, false);
                    }
                } else {
                    if (!video[0].paused && video.attr('data-user-started') === 'true') {
                        video[0].pause();
                        video.attr('data-paused', 'true');
                        updateUIState(video, true);
                    }
                }
            });
        }

        function fetchVideoSource(src) {
            return fetch(src).then(r => r.blob()).then(b => URL.createObjectURL(b)).catch(() => '');
        }

        function lazyLoadPoster(video) {
            const posterData = video.attr('data-poster');
            if (posterData) {
                let posterObject;
                try { posterObject = JSON.parse(posterData); } catch { return; }
                const posterPriorityList = Object.keys(posterObject).sort();
                loadPostersFromPriorityList(video, posterObject, posterPriorityList, 0);
            }
        }

        function loadPostersFromPriorityList(video, posterObject, posterPriorityList, index = 0) {
            if (index >= posterPriorityList.length) return;
            fetch(posterObject[posterPriorityList[index]]).then(r => r.blob()).then(blob => {
                const url = URL.createObjectURL(blob);
                video.data('posters').push(url);
                if (index === 0) video.attr('poster', url);
                loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
            });
        }

        function lazyLoadVideo(video) {
            const sources = video.find('source');
            const overlay = createOverlay(video);
            video.prop('controls', false);
        
            const promises = sources.map((index, el) => {
                return fetchVideoSource($(el).attr('data-src')).then(url => {
                    if (url) { $(el).attr('src', url); return url; }
                    throw new Error();
                });
            }).get();
        
            $.when.apply($, promises).then(() => {
                video[0].load();
                setupPlayButton(overlay, video);
            });
        }

        function createOverlay(video) {
            const overlay = $('<div>', { class: 'video-overlay' });
            video.parent().append(overlay);
            return overlay;
        }

        // Nueva función para centralizar el estado visual (Blur y Botón)
        function updateUIState(video, isPaused) {
            const $wrapper = video.parent();
            const $btn = $wrapper.find('.play-button');
            const $shape = $btn.find('.button-shape');

            if (isPaused) {
                $wrapper.addClass('is-video-blur');
                $btn.removeClass('is-playing-state').addClass('is-paused-state');
                gsap.to($shape, { rotate: 45, borderRadius: "2px", duration: 0.4 });
            } else {
                $wrapper.removeClass('is-video-blur');
                $btn.removeClass('is-paused-state').addClass('is-playing-state');
                gsap.to($shape, { rotate: 0, borderRadius: "8px", duration: 0.4 });
            }
        }

        function setupPlayButton(overlay, video) {
            const playButtonTemplate = `
                <div class="play-button-overlay d-flex align-items-center justify-content-center">
                    <button class="play-button btn-custom-video is-paused-state" aria-label="Play Button">
                        <div class="button-shape"><span class="icon-symbol"></span></div>
                    </button>
                </div>`;

            overlay.html(playButtonTemplate);
            const $wrapper = video.parent();
            const $playBtn = overlay.find('.play-button');
            const videoEl = video[0];

            if (!isMobile) {
                $wrapper.css('cursor', 'none').find('*').css('cursor', 'none');

                $wrapper.on('mousemove', function(e) {
                    const rect = $wrapper[0].getBoundingClientRect();
                    gsap.to($playBtn, {
                        x: (e.clientX - rect.left) - ($playBtn.outerWidth() / 2),
                        y: (e.clientY - rect.top) - ($playBtn.outerHeight() / 2),
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                });

                $wrapper.on('click', function() {
                    if (videoEl.paused) {
                        videoEl.play();
                        video.attr('data-user-started', 'true');
                        updateUIState(video, false);
                    } else {
                        videoEl.pause();
                        updateUIState(video, true);
                    }
                });
            } else {
                $playBtn.on('click', function(e) {
                    e.stopPropagation();
                    if (videoEl.paused) {
                        videoEl.play();
                        video.attr('data-user-started', 'true');
                        updateUIState(video, false);
                    } else {
                        videoEl.pause();
                        updateUIState(video, true);
                    }
                });
            }

            video.on('ended', function() {
                video.attr('data-user-started', 'false');
                updateUIState(video, true);
            });
        }

        return this.each(function() {
            loadVideos($(this));
        });
    };
}(jQuery));
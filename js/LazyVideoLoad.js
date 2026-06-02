(function($) {
    $.fn.lazyVideoLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            startWidth: "80%",
            endWidth: "100%",
            startTop: "-50px",
            endTop: "0px",
            startRadius: "40px",
            endRadius: "0px",
            gsapStart: "top 50%",
            gsapEnd: "top 10%"
        }, options);

        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }

        const observer = new IntersectionObserver(handleIntersection, {
            root:       settings.root,
            rootMargin: settings.rootMargin,
            threshold:  settings.threshold
        });
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        let hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden"; visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden"; visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden"; visibilityChange = "webkitvisibilitychange";
        }

        // --- LÓGICA DE CAMBIO DE PESTAÑA (TAB) ---
        function handleVisibilityChange(videoElement) {
            const video = $(videoElement);
            const videoEl = videoElement;

            if (document[hidden]) {
                // Si el video está reproduciéndose, lo pausamos automáticamente
                if (!videoEl.paused) {
                    videoEl.pause();
                    video.attr('data-autopaused', 'true'); // Marcamos que fue pausa automática
                    updateUIState(video, true);
                }
            } else {
                // Solo reanudar si fue pausado automáticamente y el usuario no lo pausó antes
                if (video.attr('data-autopaused') === 'true' && video.attr('data-user-started') === 'true') {
                    videoEl.play();
                    video.removeAttr('data-autopaused'); // Limpiamos la bandera
                    updateUIState(video, false);
                }
            }
        }

        function loadVideos($video) {
            const videoElement = $video[0];
            const $wrapper = $video.wrap('<div class="dynamic-video-wrapper"></div>').parent();
            
            $wrapper.css({
                'width': settings.startWidth,
                'border-radius': settings.startRadius,
                'top': settings.startTop,
                'margin': '0 auto',
                'overflow': 'hidden',
                'position': 'relative',
                'background': '#000'
            });

            if (typeof gsap !== "undefined") {
                gsap.to($wrapper, {
                    top: settings.endTop,
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

        // --- LÓGICA DE INTERSECCIÓN (SCROLL) ---
        function handleIntersection(entries) {
            entries.forEach(entry => {
                const video = $(entry.target);
                const videoEl = entry.target;

                if (entry.isIntersecting) {
                    if (video.attr('data-loaded') !== 'true') {
                        video.data('posters', []);
                        lazyLoadVideo(video);
                        lazyLoadPoster(video);
                        video.attr('data-loaded', 'true');
                    }
                    
                    // Solo reanudar si el video fue autopausado por salir de pantalla
                    if (video.attr('data-autopaused') === 'true' && video.attr('data-user-started') === 'true') {
                        videoEl.play();
                        video.removeAttr('data-autopaused');
                        updateUIState(video, false);
                    }
                } else {
                    // Si el video se está reproduciendo y sale de pantalla, pausa automática
                    if (!videoEl.paused) {
                        videoEl.pause();
                        video.attr('data-autopaused', 'true');
                        updateUIState(video, true);
                    }
                }
            });
        }

        function fetchVideoSource(src) {
            // Direct src assignment — browser handles caching, no double-download
            return Promise.resolve(src);
        }

        function lazyLoadPoster(video) {
            const posterData = video.attr('data-poster');
            if (!posterData) return;
            let posterObject;
            try { posterObject = JSON.parse(posterData); } catch { return; }
            const urls = Object.keys(posterObject).sort().map(k => posterObject[k]);
            video.data('posters', urls);
            if (urls.length > 0) video.attr('poster', urls[0]);
        }

        function lazyLoadVideo(video) {
            const sources = video.find('source');
            const overlay = createOverlay(video);
            video.prop('controls', false);

            const loadingTemplate = `
                <div class="video-loading-indicator d-flex align-items-center justify-content-center">
                    Loading<span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span>
                </div>`;
            overlay.html(loadingTemplate);

            if (typeof gsap !== "undefined") {
                gsap.timeline({ repeat: -1 })
                    .to(overlay.find('span'), { opacity: 1, stagger: 0.2, duration: 0.3 })
                    .to(overlay.find('span'), { opacity: 0, duration: 0.3, delay: 0.5 });
            }
        
            const promises = sources.map((index, el) => {
                return fetchVideoSource($(el).attr('data-src')).then(url => {
                    if (url) { $(el).attr('src', url); return url; }
                    throw new Error();
                });
            }).get();
        
            $.when.apply($, promises).then(() => {
                video[0].load();
                overlay.find('.video-loading-indicator').remove();
                setupInteractiveControls(overlay, video);
            });
        }

        function createOverlay(video) {
            const overlay = $('<div>', { class: 'video-overlay', style: 'pointer-events: none;' });
            video.parent().append(overlay);
            return overlay;
        }

        function updateUIState(video, isPaused) {
            const $overlay = video.parent().find('.video-overlay');
            const $btn = $overlay.find('.play-button');
            const $shape = $btn.find('.button-shape');

            const filterState = { blur: isPaused ? 0 : 10, opacity: isPaused ? 0 : 0.7 };
            gsap.to(filterState, {
                blur: isPaused ? 10 : 0,
                opacity: isPaused ? 0.7 : 0,
                duration: 0.6,
                overwrite: "auto",
                onUpdate: () => {
                    $overlay.css({
                        'background-color': `rgba(0, 0, 0, ${filterState.opacity})`,
                        'backdrop-filter': `blur(${filterState.blur}px)`,
                        '-webkit-backdrop-filter': `blur(${filterState.blur}px)`
                    });
                }
            });

            if (isPaused) {
                $btn.removeClass('is-playing-state').addClass('is-paused-state');
                gsap.to($shape, { rotate: 45, borderRadius: "2px", duration: 0.4 });
            } else {
                $btn.removeClass('is-paused-state').addClass('is-playing-state');
                gsap.to($shape, { rotate: 0, borderRadius: "8px", duration: 0.4 });
            }
        }

        function setupInteractiveControls(overlay, video) {
            const playButtonTemplate = `
                <div class="play-button-overlay d-flex align-items-center justify-content-center">
                    <button class="play-button btn-custom-video is-paused-state" aria-label="Play Button" style="pointer-events: auto; opacity: 0; transform: scale(0.5);">
                        <div class="button-shape"><span class="icon-symbol"></span></div>
                    </button>
                </div>`;

            overlay.html(playButtonTemplate);
            const $wrapper = video.parent();
            const $playBtn = overlay.find('.play-button');
            const videoEl = video[0];
            let isGifActive = false;

            if (!isMobile) {
                $wrapper.css('cursor', 'none').find('*').css('cursor', 'none');

                // Cache rect on enter — avoids getBoundingClientRect() on every mousemove
                let rect = null;
                const halfW = $playBtn.outerWidth()  / 2;
                const halfH = $playBtn.outerHeight() / 2;

                $wrapper.on('mousemove', function(e) {
                    if (!rect) rect = $wrapper[0].getBoundingClientRect();
                    gsap.to($playBtn, {
                        x: (e.clientX - rect.left) - halfW,
                        y: (e.clientY - rect.top)  - halfH,
                        duration: 0.6,
                        overwrite: "auto"
                    });
                });

                $wrapper.on('mouseenter', function() {
                    rect = $wrapper[0].getBoundingClientRect();
                    gsap.to($playBtn, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" });
                    if (videoEl.paused && !isGifActive) {
                        const posters = video.data('posters');
                        if (posters && posters.length > 1) {
                            video.attr('poster', posters[1]);
                            isGifActive = true;
                        }
                    }
                }).on('mouseleave', function() {
                    gsap.to($playBtn, { opacity: 0, scale: 0.5, duration: 0.4, ease: "power2.in" });
                    if (isGifActive) {
                        const posters = video.data('posters');
                        if (posters && posters.length > 0) {
                            video.attr('poster', posters[0]);
                            isGifActive = false;
                        }
                    }
                });

                $wrapper.on('click', function() {
                    if (videoEl.paused) {
                        videoEl.play();
                        video.attr('data-user-started', 'true');
                        video.removeAttr('data-autopaused'); // Importante: el usuario tomó el control
                        updateUIState(video, false);
                    } else {
                        videoEl.pause();
                        video.attr('data-user-started', 'false'); // Marcamos que el usuario quiso pausar
                        video.removeAttr('data-autopaused'); // Quitamos autopaused para que no se reanude solo
                        updateUIState(video, true);
                    }
                });
            } else {
                gsap.set($playBtn, { opacity: 1, scale: 1 });
                $playBtn.on('click', function(e) {
                    e.stopPropagation();
                    if (videoEl.paused) {
                        videoEl.play();
                        video.attr('data-user-started', 'true');
                        video.removeAttr('data-autopaused');
                        updateUIState(video, false);
                    } else {
                        videoEl.pause();
                        video.attr('data-user-started', 'false');
                        video.removeAttr('data-autopaused');
                        updateUIState(video, true);
                    }
                });
            }

            video.on('ended', function() {
                video.attr('data-user-started', 'false');
                video.removeAttr('data-autopaused');
                updateUIState(video, true);
                isGifActive = false;
                const posters = video.data('posters');
                if (posters) video.attr('poster', posters[0]);
                gsap.to($playBtn, { opacity: 0, scale: 0.5, duration: 0.4 });
            });
        }

        return this.each(function() {
            loadVideos($(this));
        });
    };
}(jQuery));
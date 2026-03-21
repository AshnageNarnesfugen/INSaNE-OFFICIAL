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

            const $wrapper = $video.wrap('<div class="dynamic-video-wrapper"></div>').parent();
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

        // --- CORRECCIÓN: HANDLE INTERSECTION (SCROLL PLAY/PAUSE) ---
        function handleIntersection(entries) {
            entries.forEach(entry => {
                const video = $(entry.target);
                const videoEl = video[0];

                if (entry.isIntersecting) {
                    // 1. Carga inicial si no está cargado
                    if (video.attr('data-loaded') !== 'true') {
                        video.data('posters', []);
                        lazyLoadVideo(video);
                        lazyLoadPoster(video);
                        video.attr('data-loaded', 'true');
                    }
                    
                    // 2. REPRODUCIR AL REGRESAR (Si el usuario ya le dio play antes)
                    if (video.attr('data-user-started') === 'true' && videoEl.paused) {
                        videoEl.play();
                        video.attr('data-paused', 'false');
                        updateUIState(video, false);
                    }
                } else {
                    // 3. PAUSAR AL SALIR
                    if (!videoEl.paused && video.attr('data-user-started') === 'true') {
                        videoEl.pause();
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

            const filterState = { 
                blur: isPaused ? 0 : 10, 
                opacity: isPaused ? 0 : 0.7 
            };

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
                    <button class="play-button btn-custom-video is-paused-state" aria-label="Play Button" style="pointer-events: auto;">
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

                $wrapper.on('mousemove', function(e) {
                    const rect = $wrapper[0].getBoundingClientRect();
                    gsap.to($playBtn, {
                        x: (e.clientX - rect.left) - ($playBtn.outerWidth() / 2),
                        y: (e.clientY - rect.top) - ($playBtn.outerHeight() / 2),
                        duration: 0.6,
                        overwrite: "auto"
                    });
                });

                $wrapper.on('mouseenter', function() {
                    if (videoEl.paused && !isGifActive) {
                        const posters = video.data('posters');
                        if (posters && posters.length > 1) {
                            video.attr('poster', posters[1]);
                            isGifActive = true;
                        }
                    }
                }).on('mouseleave', function() {
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
                isGifActive = false;
                const posters = video.data('posters');
                if (posters) video.attr('poster', posters[0]);
            });
        }

        return this.each(function() {
            loadVideos($(this));
        });
    };
}(jQuery));
/*(function($) {
    $.fn.lazyVideoLoader = function(options) {
        const settings = $.extend({
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            // Parámetros de animación GSAP para expansión
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
                    const entry = observer.takeRecords().find(e => e.target === videoElement);
                    if (entry && entry.isIntersecting) {
                        video[0].play();
                        video.attr('data-paused', 'false');
                        updateUIState(video, false);
                    }
                }
            }
        }

        function loadVideos($video) {
            const videoElement = $video[0];
            $video.attr('id', `video-${Math.random().toString(36).substr(2, 9)}`);

            // --- WRAPPER DINÁMICO ---
            const $wrapper = $video.wrap('<div class="dynamic-video-wrapper"></div>').parent();
            $wrapper.css({
                'width': settings.startWidth,
                'border-radius': settings.startRadius,
                'margin': '0 auto',
                'overflow': 'hidden',
                'position': 'relative',
                'background': '#000'
            });

            // --- ANIMACIÓN GSAP SCROLL (Expansión) ---
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
                        video.data('posters', []); // Inicializar array de pósters
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
                video.data('posters').push(url); // Guardar pósters cargados
                if (index === 0) {
                    video.attr('poster', url); // Setear póster inicial
                    if (isMobile) loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
                } else if (isMobile && index === 1) {
                    // Opcional: lógica móvil original para cambiar póster automáticamente
                }
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
                setupInteractiveControls(overlay, video);
            });
        }

        function createOverlay(video) {
            // El overlay debe tener pointer-events: none para no bloquear los clicks al wrapper
            const overlay = $('<div>', { class: 'video-overlay', style: 'pointer-events: none;' });
            video.parent().append(overlay);
            return overlay;
        }

        // --- LÓGICA DE ANIMACIÓN DE ESTADOS (Overlay, Blur y Botón Shape) ---
        function updateUIState(video, isPaused) {
            const $overlay = video.parent().find('.video-overlay');
            const $btn = $overlay.find('.play-button');
            const $shape = $btn.find('.button-shape');

            const targetBlur = isPaused ? 10 : 0;
            const targetOpacity = isPaused ? 0.7 : 0; // Delta del RGBA

            // Objeto genérico para animar valores numéricos y construir el string del filtro manual
            const filterState = { blur: isPaused ? 0 : 10, opacity: isPaused ? 0 : 0.7 };

            gsap.to(filterState, {
                blur: targetBlur,
                opacity: targetOpacity,
                duration: 0.6,
                ease: "power2.out",
                onUpdate: function() {
                    // Aplicar estilos dinámicamente en cada frame
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

            if (!isMobile) {
                // Ocultar cursor nativo
                $wrapper.css('cursor', 'none').find('*').css('cursor', 'none');

                // --- LÓGICA DE MOUSE MAGNÉTICO ---
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

                // --- RE-INTRODUCCIÓN DE LÓGICA HOVER (GIF/POSTER 2) ---
                $playBtn.hover(
                    function() {
                        // Al hacer hover, si está pausado, cambiar al póster 2 (GIF)
                        if (videoEl.paused) {
                            const posters = video.data('posters');
                            if (posters && posters.length > 1) {
                                video.attr('poster', posters[1]);
                            }
                        }
                    },
                    function() {
                        // Al quitar hover, volver al póster 1
                        if (videoEl.paused) {
                            const posters = video.data('posters');
                            if (posters && posters.length > 0) {
                                video.attr('poster', posters[0]);
                            }
                        }
                    }
                );

                // --- LÓGICA DE CLICK (Toggle Play/Pause) ---
                $wrapper.on('click', function(e) {
                    // El wrapper maneja el click global
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
                // Lógica móvil simplificada (click directo en botón)
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
                // Asegurar que vuelve al póster inicial
                const posters = video.data('posters');
                if (posters && posters.length > 0) {
                    video.attr('poster', posters[0]);
                }
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
            // Parámetros de animación GSAP para expansión
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
                    const entry = observer.takeRecords().find(e => e.target === videoElement);
                    if (entry && entry.isIntersecting) {
                        video[0].play();
                        video.attr('data-paused', 'false');
                        updateUIState(video, false);
                    }
                }
            }
        }

        function loadVideos($video) {
            const videoElement = $video[0];
            $video.attr('id', `video-${Math.random().toString(36).substr(2, 9)}`);

            // --- WRAPPER DINÁMICO ---
            const $wrapper = $video.wrap('<div class="dynamic-video-wrapper"></div>').parent();
            $wrapper.css({
                'width': settings.startWidth,
                'border-radius': settings.startRadius,
                'margin': '0 auto',
                'overflow': 'hidden',
                'position': 'relative',
                'background': '#000'
            });

            // --- ANIMACIÓN GSAP SCROLL (Expansión) ---
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
                        video.data('posters', []); // Inicializar array de pósters
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
                video.data('posters').push(url); // Guardar pósters cargados
                if (index === 0) {
                    video.attr('poster', url); // Setear póster inicial
                    if (isMobile) loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
                } else if (isMobile && index === 1) {
                    // Opcional: lógica móvil original para cambiar póster automáticamente
                }
                loadPostersFromPriorityList(video, posterObject, posterPriorityList, index + 1);
            });
        }

        function lazyLoadVideo(video) {
            const sources = video.find('source');
            const overlay = createOverlay(video); // Crear overlay transparente con backdrop-filter
            video.prop('controls', false);

            // --- RE-INTRODUCCIÓN DE LOADING CON ANIMACIÓN GSAP ---
            const loadingTemplate = `
                <div class="video-loading-indicator d-flex align-items-center justify-content-center">
                    Loading
                    <div class="dot-loading">
                        <span class="dot-1">.</span>
                        <span class="dot-2">.</span>
                        <span class="dot-3">.</span>
                    </div>
                </div>`;
            overlay.html(loadingTemplate); // Inyectar loading estático temporalmente

            // Iniciar la animación GSAP para los tres puntitos
            if (typeof gsap !== "undefined") {
                gsap.set('.video-loading-indicator span', { opacity: 0 }); // Ocultar puntos inicialmente
                // Crear timeline en bucle infinito
                gsap.timeline({ repeat: -1 })
                    .to('.video-loading-indicator span', { 
                        opacity: 1, 
                        duration: 0.3, 
                        stagger: 0.2 // Aparecer uno por uno
                    })
                    .to('.video-loading-indicator span', {
                        opacity: 0,
                        duration: 0.3,
                        delay: 0.5 // Pequeña pausa antes de reiniciar
                    });
            }
        
            const promises = sources.map((index, el) => {
                return fetchVideoSource($(el).attr('data-src')).then(url => {
                    if (url) { $(el).attr('src', url); return url; }
                    throw new Error();
                });
            }).get();
        
            $.when.apply($, promises).then(() => {
                video[0].load();
                // Una vez cargadas las fuentes, remover el loading y configurar controles interactivos
                overlay.find('.video-loading-indicator').remove();
                setupInteractiveControls(overlay, video);
            });
        }

        function createOverlay(video) {
            // El overlay debe tener pointer-events: none para no bloquear los clicks al wrapper
            const overlay = $('<div>', { class: 'video-overlay', style: 'pointer-events: none;' });
            video.parent().append(overlay);
            return overlay;
        }

        // --- LÓGICA DE ANIMACIÓN DE ESTADOS (Overlay, Blur y Botón Shape) ---
        function updateUIState(video, isPaused) {
            const $overlay = video.parent().find('.video-overlay');
            const $btn = $overlay.find('.play-button');
            const $shape = $btn.find('.button-shape');

            const targetBlur = isPaused ? 10 : 0;
            const targetOpacity = isPaused ? 0.7 : 0; // Delta del RGBA

            // Objeto genérico para animar valores numéricos y construir el string del filtro manual
            const filterState = { blur: isPaused ? 0 : 10, opacity: isPaused ? 0 : 0.7 };

            if (typeof gsap !== "undefined") {
                gsap.to(filterState, {
                    blur: targetBlur,
                    opacity: targetOpacity,
                    duration: 0.6,
                    ease: "power2.out",
                    onUpdate: function() {
                        // Aplicar estilos dinámicamente en cada frame
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

            if (!isMobile) {
                // Ocultar cursor nativo
                $wrapper.css('cursor', 'none').find('*').css('cursor', 'none');

                // --- LÓGICA DE MOUSE MAGNÉTICO (Mejorada para no interferir con Hover) ---
                if (typeof gsap !== "undefined") {
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
                }

                // --- CORRECCIÓN DE LÓGICA HOVER (GIF/POSTER 2) ---
                $playBtn.on('mouseenter', function() {
                    // Al hacer hover, si está pausado, cambiar al póster 2 (GIF)
                    if (videoEl.paused) {
                        const posters = video.data('posters');
                        if (posters && posters.length > 1) {
                            // CORRECCIÓN CRÍTICA: Solo asignar si NO es ya el póster actual
                            if (video.attr('poster') !== posters[1]) {
                                video.attr('poster', posters[1]);
                            }
                        }
                    }
                }).on('mouseleave', function() {
                    // Al quitar hover, volver al póster 1
                    if (videoEl.paused) {
                        const posters = video.data('posters');
                        if (posters && posters.length > 0) {
                            // CORRECCIÓN CRÍTICA: Solo asignar si NO es ya el póster actual
                            if (video.attr('poster') !== posters[0]) {
                                video.attr('poster', posters[0]);
                            }
                        }
                    }
                });

                // --- LÓGICA DE CLICK (Toggle Play/Pause) ---
                $wrapper.on('click', function(e) {
                    // El wrapper maneja el click global
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
                // Lógica móvil simplificada (click directo en botón)
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
                // Asegurar que vuelve al póster inicial al terminar
                const posters = video.data('posters');
                if (posters && posters.length > 0) {
                    if (video.attr('poster') !== posters[0]) {
                        video.attr('poster', posters[0]);
                    }
                }
            });
        }

        return this.each(function() {
            loadVideos($(this));
        });
    };
}(jQuery));
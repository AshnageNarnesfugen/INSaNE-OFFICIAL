document.addEventListener("DOMContentLoaded", () => {
    function loadFont(font) {
        const { name, formats = {}, weight = "normal", style = "normal", priority = "lazy" } = font;

        try {
            if (priority === "preload" || priority === "prefetch") {
                Object.entries(formats).forEach(([format, url]) => {
                    const link = document.createElement("link");
                    link.rel = priority;
                    link.href = url;
                    link.as = "font";
                    link.type = `font/${format}`;
                    link.crossOrigin = "anonymous";
                    document.head.appendChild(link);
                });
            }

            Object.entries(formats).forEach(([format, url]) => {
                const face = new FontFace(name, `url(${url})`, { weight, style });
                face.load()
                    .then((loadedFont) => document.fonts.add(loadedFont))
                    .catch((error) => console.error(`Failed to load font [${name}] in format [${format}]:`, error));
            });

            console.log(`Font ${name} processed.`);
        } catch (error) {
            console.error(`Error processing font [${name}]:`, error);
        }
    }

    const currentURL = window.location.href.toLowerCase();
    let fontsToLoad = [];

    const fontConfigs = {
        "/jp": [
            {
                name: "Hiragino Mincho Pro",
                style: "normal",
                priority: "preload",
                formats: {
                    otf: "../css/fonts/hiragino-mincho-pro-w3.otf"
                }
            }
        ],
        "/ru": [
            {
                name: "MailSans",
                weight: "400",
                style: "normal",
                priority: "preload",
                formats: {
                    woff2: "../css/fonts/MailSansRegular.woff2",
                    woff: "../css/fonts/MailSansRegular.woff"
                }
            }
        ],
        "/kr": [
            {
                name: "Stylish Regular",
                weight: "400",
                style: "normal",
                priority: "preload", 
                formats: {
                    ttf: "../css/fonts/Stylish-Regular.ttf"
                }
            }
        ],
        "/hi": [
            {
                name: "Rajdhani",
                weight: "700",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/rajdhani/Rajdhani-Bold.ttf"
                }
            },
            {
                name: "Rajdhani",
                weight: "300",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/rajdhani/Rajdhani-Light.ttf"
                }
            },
            {
                name: "Rajdhani",
                weight: "500",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/rajdhani/Rajdhani-Medium.ttf"
                }
            },
            {
                name: "Rajdhani",
                weight: "400",
                style: "normal",
                priority: "preload",
                formats: {
                    ttf: "../css/fonts/rajdhani/Rajdhani-Regular.ttf"
                }
            },
            {
                name: "Rajdhani",
                weight: "600",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/rajdhani/Rajdhani-SemiBold.ttf"
                }
            }
        ],
        "/ar": [
            {
                name: "Scheherazade New",
                weight: "700",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/scheherazadenew/ScheherazadeNew-Bold.ttf"
                }
            },
            {
                name: "Scheherazade New",
                weight: "500",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/scheherazadenew/ScheherazadeNew-Medium.ttf"
                }
            },
            {
                name: "Scheherazade New",
                weight: "400",
                style: "normal",
                priority: "preload",
                formats: {
                    ttf: "../css/fonts/scheherazadenew/ScheherazadeNew-Regular.ttf"
                }
            },
            {
                name: "Scheherazade New",
                weight: "600",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/scheherazadenew/ScheherazadeNew-SemiBold.ttf"
                }
            }
        ],

        // ── Thai ─────────────────────────────────────────────────────────────
        // Sarabun: fuente oficial tailandesa, excelente legibilidad en pantalla,
        // cubre todos los pesos. Descarga desde Google Fonts o bundles propios.
        "/th": [
            {
                name: "Sarabun",
                weight: "400",
                style: "normal",
                priority: "preload",
                formats: {
                    ttf: "../css/fonts/sarabun/Sarabun-Regular.ttf"
                }
            },
            {
                name: "Sarabun",
                weight: "700",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/sarabun/Sarabun-Bold.ttf"
                }
            },
            {
                name: "Sarabun",
                weight: "300",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/sarabun/Sarabun-Light.ttf"
                }
            },
            {
                name: "Sarabun",
                weight: "500",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/sarabun/Sarabun-Medium.ttf"
                }
            },
            {
                name: "Sarabun",
                weight: "600",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/sarabun/Sarabun-SemiBold.ttf"
                }
            }
        ],

        // ── Vietnamese ───────────────────────────────────────────────────────
        // Be Vietnam Pro: diseñada específicamente para vietnamita, métricas
        // verticales generosas para los diacríticos apilados, moderna y legible.
        "/vi": [
            {
                name: "Be Vietnam Pro",
                weight: "400",
                style: "normal",
                priority: "preload",
                formats: {
                    ttf: "../css/fonts/bevietnam/BeVietnamPro-Regular.ttf"
                }
            },
            {
                name: "Be Vietnam Pro",
                weight: "700",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/bevietnam/BeVietnamPro-Bold.ttf"
                }
            },
            {
                name: "Be Vietnam Pro",
                weight: "300",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/bevietnam/BeVietnamPro-Light.ttf"
                }
            },
            {
                name: "Be Vietnam Pro",
                weight: "500",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/bevietnam/BeVietnamPro-Medium.ttf"
                }
            },
            {
                name: "Be Vietnam Pro",
                weight: "600",
                style: "normal",
                priority: "lazy",
                formats: {
                    ttf: "../css/fonts/bevietnam/BeVietnamPro-SemiBold.ttf"
                }
            }
        ],

        // ── ms / id / tl ─────────────────────────────────────────────────────
        // Usan latín puro — caen al `default` (sharpsans-web) automáticamente.
        // No necesitan entrada propia salvo que quieras diferenciación visual.

        default: [
            {
                name: "sharpsans-web",
                weight: "400",
                style: "normal",
                priority: "lazy",
                formats: {
                    woff2: "../css/fonts/SharpSans-Medium.woff2"
                }
            },
            {
                name: "sharpsans-web",
                weight: "600",
                style: "normal",
                priority: "lazy",
                formats: {
                    woff2: "../css/fonts/SharpSans-Semibold.woff2"
                }
            },
            {
                name: "sharpsans-web",
                weight: "800",
                style: "normal",
                priority: "lazy",
                formats: {
                    woff2: "../css/fonts/SharpSans-Bold.woff2"
                }
            },
            {
                name: "architects-daughter",
                priority: "preload",
                formats: {
                    ttf: "../css/fonts/ArchitectsDaughter-Regular.ttf"
                }
            }
        ]
    };

    fontsToLoad = fontConfigs[Object.keys(fontConfigs).find((key) => currentURL.includes(key))] || fontConfigs.default;
    fontsToLoad.forEach(loadFont);

    console.log("Font loading initiated.");
});
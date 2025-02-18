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
        "/kr" : [
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
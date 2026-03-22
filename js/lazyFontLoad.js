document.addEventListener("DOMContentLoaded", () => {
    // Wait for data-loader JSONs before selecting fonts
    // so fontConfigs reads from the JSON, not the inline fallback
    function runFontLoad() {
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

    // Font configs — from /data/config/fonts.json via data-loader.js
    // Falls back to default sharpsans inline if JSON not loaded
    const _fontData = ((window.INSaNE_DATA || {})['fonts'] || {}).configs || null;
    const fontConfigs = _fontData || {
        default: [
            { name: "sharpsans-web",       weight: "400", style: "normal", priority: "lazy",    formats: { woff2: "../css/fonts/SharpSans-Medium.woff2"   } },
            { name: "sharpsans-web",       weight: "600", style: "normal", priority: "lazy",    formats: { woff2: "../css/fonts/SharpSans-Semibold.woff2" } },
            { name: "sharpsans-web",       weight: "800", style: "normal", priority: "lazy",    formats: { woff2: "../css/fonts/SharpSans-Bold.woff2"     } },
            { name: "architects-daughter",               priority: "preload",                   formats: { ttf:   "../css/fonts/ArchitectsDaughter-Regular.ttf" } }
        ]
    };

    fontsToLoad = fontConfigs[Object.keys(fontConfigs).find((key) => currentURL.includes(key))] || fontConfigs.default;
    fontsToLoad.forEach(loadFont);

    console.log("Font loading initiated.");
    }

    if (window.INSaNE_DATA_READY) {
        window.INSaNE_DATA_READY.then(runFontLoad);
    } else {
        runFontLoad();
    }
});
/*$.fn.shuffleLetters = function(prop) {
    var options = $.extend({
        "step": 20, // How many times should the letters be changed
        "fps": 30, // Frames Per Second
        "text": null // Use this text instead of the contents
    }, prop);

    return this.each(function() {
        var el = $(this);
        var originalText = options.text !== null ? options.text : el.text();
        var textLength = originalText.length;
        var textNodes = [];

        function extractTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            } else {
                $(node).contents().each(function() {
                    extractTextNodes(this);
                });
            }
        }

        extractTextNodes(el[0]);

        var str = originalText.split('');
        var letters = [];
        var types = [];

        for (var i = 0; i < str.length; i++) {
            var ch = str[i];
            switch (true) {
                case ch === " ":
                    types[i] = "space";
                    break;
                case /[a-z]/.test(ch):
                    types[i] = "lowerLetter";
                    break;
                case /[A-Z]/.test(ch):
                    types[i] = "upperLetter";
                    break;
                case /[0-9]/.test(ch):
                    types[i] = "number";
                    break;
                case /[\u3040-\u309F]/.test(ch):
                    types[i] = "hiragana";
                    break;
                case /[\u30A0-\u30FF]/.test(ch):
                    types[i] = "katakana";
                    break;
                case /[\u4E00-\u9FBF]/.test(ch):
                    types[i] = "kanji";
                    break;
                case /[\u4E00-\u9FFF]/.test(ch):
                    types[i] = "chinese";
                    break;
                case /[\uAC00-\uD7A3]/.test(ch):
                    types[i] = "korean";
                    break;
                case /[\u0410-\u044F]/.test(ch):
                    types[i] = "russian";
                    break;
                case /[\u0600-\u06FF]/.test(ch):
                    types[i] = "arabic";
                    break;
                case /[\u0900-\u097F]/.test(ch):
                    types[i] = "hindi";
                    break;
                // Thai: U+0E00–U+0E7F
                case /[\u0E00-\u0E7F]/.test(ch):
                    types[i] = "thai";
                    break;
                // Vietnamese: latin base + combining diacritics block U+0300–U+036F
                // and Vietnamese-specific precomposed chars U+1E00–U+1EFF
                case /[\u1E00-\u1EFF\u0300-\u036F]/.test(ch):
                    types[i] = "vietnamese";
                    break;
                default:
                    types[i] = "symbol";
            }
            letters.push(i);
        }

        var animationDuration = (options.step * textLength) / options.fps * 1000;

        function shuffle(start) {
            if (start > options.step) {
                el.text(originalText);
                return;
            }

            var strCopy = originalText.split('');
            letters.forEach((pos, i) => {
                if (i < start + options.step) {
                    strCopy[pos] = $.fn.shuffleLetters.randomChar(types[pos]);
                }
            });
            el.text(strCopy.join(""));

            setTimeout(() => shuffle(start + 1), 1000 / options.fps);
        }

        shuffle(-options.step);

        return animationDuration;
    });
};

$.fn.shuffleLetters.randomChar = function(type) {
    // Character pools — from /data/config/char-pools.json via data-loader.js
    // Falls back to lowerLetter inline if JSON not loaded
    const pools = ((window.INSaNE_DATA || {})['char-pools'] || {}).pools || {
        lowerLetter: "abcdefghijklmnopqrstuvwxyz0123456789",
        upperLetter: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        number: "0123456789"
    };
    return pools[type] ? pools[type][Math.floor(Math.random() * pools[type].length)] : "";
};*/

$.fn.shuffleLetters = function(prop) {
    var options = $.extend({
        "step": 20,       // Cuántas veces deben cambiar las letras
        "fps": 30,        // (Opcional ahora, pero lo mantenemos para calcular la duración)
        "text": null,     // Usar este texto en lugar del contenido
        "ease": "none"    // GSAP ease (lineal por defecto para este efecto)
    }, prop);

    return this.each(function() {
        var el = $(this);
        var originalText = options.text !== null ? options.text : el.text();
        var textLength = originalText.length;
        var textNodes = [];

        function extractTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            } else {
                $(node).contents().each(function() {
                    extractTextNodes(this);
                });
            }
        }

        extractTextNodes(el[0]);

        var str = originalText.split('');
        var letters = [];
        var types = [];

        for (var i = 0; i < str.length; i++) {
            var ch = str[i];
            switch (true) {
                case ch === " ": types[i] = "space"; break;
                case /[a-z]/.test(ch): types[i] = "lowerLetter"; break;
                case /[A-Z]/.test(ch): types[i] = "upperLetter"; break;
                case /[0-9]/.test(ch): types[i] = "number"; break;
                case /[\u3040-\u309F]/.test(ch): types[i] = "hiragana"; break;
                case /[\u30A0-\u30FF]/.test(ch): types[i] = "katakana"; break;
                case /[\u4E00-\u9FBF]/.test(ch): types[i] = "kanji"; break;
                case /[\u4E00-\u9FFF]/.test(ch): types[i] = "chinese"; break;
                case /[\uAC00-\uD7A3]/.test(ch): types[i] = "korean"; break;
                case /[\u0410-\u044F]/.test(ch): types[i] = "russian"; break;
                case /[\u0600-\u06FF]/.test(ch): types[i] = "arabic"; break;
                case /[\u0900-\u097F]/.test(ch): types[i] = "hindi"; break;
                case /[\u0E00-\u0E7F]/.test(ch): types[i] = "thai"; break;
                case /[\u1E00-\u1EFF\u0300-\u036F]/.test(ch): types[i] = "vietnamese"; break;
                default: types[i] = "symbol";
            }
            letters.push(i);
        }

        // GSAP usa la duración en segundos, no milisegundos.
        // Mantenemos tu fórmula original pero la convertimos a segundos:
        var durationInSeconds = (options.step * textLength) / options.fps;

        // Limpieza: Matamos cualquier animación previa en este elemento para evitar parpadeos/sobreposiciones
        if (el[0]._shuffleTween) {
            el[0]._shuffleTween.kill();
        }

        // Creamos un objeto proxy para que GSAP anime la propiedad "start"
        var proxy = { start: -options.step };

        // Creamos la animación con GSAP
        el[0]._shuffleTween = gsap.to(proxy, {
            start: options.step + 1, // Animamos hasta un poco más allá del step final
            duration: durationInSeconds,
            ease: options.ease,
            onUpdate: function() {
                // Redondeamos para emular el incremento por pasos discretos (enteros)
                var currentStart = Math.floor(proxy.start);
                var strCopy = originalText.split('');
                
                letters.forEach((pos, i) => {
                    if (i < currentStart + options.step) {
                        strCopy[pos] = $.fn.shuffleLetters.randomChar(types[pos]);
                    }
                });
                
                el.text(strCopy.join(""));
            },
            onComplete: function() {
                // Nos aseguramos de dejar el texto intacto al finalizar
                el.text(originalText);
                delete el[0]._shuffleTween; // Limpiamos la referencia
            }
        });
    });
};

// Se mantiene intacta tu función de generador de caracteres aleatorios
$.fn.shuffleLetters.randomChar = function(type) {
    const pools = ((window.INSaNE_DATA || {})['char-pools'] || {}).pools || {
        lowerLetter: "abcdefghijklmnopqrstuvwxyz0123456789",
        upperLetter: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        number: "0123456789"
    };
    return pools[type] ? pools[type][Math.floor(Math.random() * pools[type].length)] : "";
};
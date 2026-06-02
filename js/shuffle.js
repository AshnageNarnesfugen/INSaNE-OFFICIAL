$.fn.shuffleLetters = function(prop) {
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

        // Single interval instead of recursive setTimeout chain —
        // avoids creating (step * 2) timer objects per call
        var start = -options.step;
        var interval = setInterval(function() {
            if (start > options.step) {
                clearInterval(interval);
                el.text(originalText);
                return;
            }
            var strCopy = originalText.split('');
            letters.forEach(function(pos, i) {
                if (i < start + options.step) {
                    strCopy[pos] = $.fn.shuffleLetters.randomChar(types[pos]);
                }
            });
            el.text(strCopy.join(""));
            start++;
        }, 1000 / options.fps);

        return interval;
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
};
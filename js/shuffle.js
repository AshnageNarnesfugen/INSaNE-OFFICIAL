$.fn.shuffleLetters = function(prop) {
    var options = $.extend({
        "step": 20, // How many times should the letters be changed
        "fps": 30, // Frames Per Second
        "text": "" // Use this text instead of the contents
    }, prop);

    return this.each(function() {
        var el = $(this);
        var str = "";

        if (options.text) {
            str = options.text.split('');
        } else {
            str = el.text().split('');
        }

        var types = [];
        var letters = [];

        for (var i = 0; i < str.length; i++) {
            var ch = str[i];

            if (ch == " ") {
                types[i] = "space";
                continue;
            } else if (/[a-z]/.test(ch)) {
                types[i] = "lowerLetter";
            } else if (/[A-Z]/.test(ch)) {
                types[i] = "upperLetter";
            } else if (/[\u3040-\u309F]/.test(ch)) { // Hiragana range
                types[i] = "hiragana";
            } else if (/[\u30A0-\u30FF]/.test(ch)) { // Katakana range
                types[i] = "katakana";
            } else if (/[\u4E00-\u9FBF]/.test(ch)) { // Kanji range
                types[i] = "kanji";
            } else {
                types[i] = "symbol";
            }

            letters.push(i);
        }

        el.html("");

        (function shuffle(start) {
            var i,
                len = letters.length,
                strCopy = str.slice(0);

            if (start > len) {
                return;
            }

            for (i = Math.max(start, 0); i < len; i++) {
                if (i < start + options.step) {
                    strCopy[letters[i]] = randomChar(types[letters[i]]);
                } else {
                    strCopy[letters[i]] = "";
                }
            }

            el.text(strCopy.join(""));

            setTimeout(function() {
                shuffle(start + 1);
            }, 1000 / options.fps);
        })(-options.step);
    });
};

function randomChar(type) {
    var pool = "";

    if (type == "lowerLetter") {
        pool = "abcdefghijklmnopqrstuvwxyz0123456789";
    } else if (type == "upperLetter") {
        pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    } else if (type == "symbol") {
        pool = ",.?/\\(^)![]{}*&^%$#'\"";
    } else if (type == "hiragana") {
        pool = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
    } else if (type == "katakana") {
        pool = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    } else if (type == "kanji") {
        pool = "亜哀挨愛曖悪握圧扱宛嵐安案暗以衣位囲医依委威為畏胃尉異移萎偉椅彙意違維慰遺緯射捨赦謝詐社車舎者尺借酌釈爵若樹受呪寿授需儒舟酒収宗就縦従縮熟純処初所暑署書諸除傷償勝称笑賞上";
    }

    var arr = pool.split('');
    return arr[Math.floor(Math.random() * arr.length)];
}

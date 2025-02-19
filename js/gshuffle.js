class ShuffleLetters {
    constructor(el, options = {}) {
        this.el = el;
        this.settings = {
            step: 20,
            fps: 30,
            text: "",
            repeat: 3, // Number of times to repeat the shuffle
            ...options,
        };
        this.count = 0;
        this.textNodes = [];
        this.originalTexts = [];
        this.init();
    }

    init() {
        this.extractTextNodes(this.el); // Get text nodes
        this.shuffle(-this.settings.step);
    }

    extractTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
            this.textNodes.push(node);
            this.originalTexts.push(node.nodeValue.split(""));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            node.childNodes.forEach(child => this.extractTextNodes(child)); // Recursively get text nodes
        }
    }

    shuffle(start) {
        if (start > Math.max(...this.originalTexts.map(text => text.length))) {
            this.count++;
            if (this.count < this.settings.repeat) {
                setTimeout(() => this.shuffle(-this.settings.step), 1000);
            } else {
                this.textNodes.forEach((node, i) => node.nodeValue = this.originalTexts[i].join(""));
            }
            return;
        }

        this.textNodes.forEach((node, i) => {
            let shuffledText = [...this.originalTexts[i]];
            for (let j = Math.max(start, 0); j < shuffledText.length; j++) {
                shuffledText[j] = j < start + this.settings.step ? this.randomChar(this.detectType(shuffledText[j])) : "";
            }
            node.nodeValue = shuffledText.join("");
        });

        gsap.delayedCall(1 / this.settings.fps, () => this.shuffle(start + 1));
    }

    detectType(ch) {
        if (ch === " ") return "space";
        if (/[a-z]/.test(ch)) return "lowerLetter";
        if (/[A-Z]/.test(ch)) return "upperLetter";
        if (/[0-9]/.test(ch)) return "number";
        if (/[ぁ-ゟ]/.test(ch)) return "hiragana";
        if (/[゠-ヿ]/.test(ch)) return "katakana";
        if (/[一-龯]/.test(ch)) return "kanji";
        if (/[А-я]/.test(ch)) return "russian";
        if (/[؀-ۿ]/.test(ch)) return "arabic";
        if (/[ऀ-ॿ]/.test(ch)) return "hindi";
        return "symbol";
    }

    randomChar(type) {
        const pools = {
            lowerLetter: "abcdefghijklmnopqrstuvwxyz0123456789",
            upperLetter: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            number: "0123456789",
            symbol: ",.?/\\(^)![]{}*&^%$#'\"",
            hiragana: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
            katakana: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
            kanji: "亜哀挨愛悪圧安暗以衣位囲医依委威為畏胃尉異移萎偉椅意違維慰遺緯射捨謝詐社車舎者尺借酌釈爵若樹受呪寿授需儒舟酒収宗就縦従縮熟純処初所暑署書諸除傷償勝称笑賞上",
            russian: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя",
            arabic: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي",
            hindi: "अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह"
        };
        return pools[type] ? pools[type][Math.floor(Math.random() * pools[type].length)] : "";
    }
}

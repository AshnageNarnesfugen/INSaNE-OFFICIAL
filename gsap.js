console.clear();

var slideDelay = 1.5;
var slideDuration = 1;
var slides = document.querySelectorAll(".slide");
var numSlides = slides.length;

gsap.set(slides, {
    xPercent: i => i * 100
});

var wrap = gsap.utils.wrap(-100, (numSlides - 1) * 100);
var progressWrap = gsap.utils.wrap(0, 1);
var timer = gsap.delayedCall(slideDelay, autoPlay).pause();
var proxy = document.createElement("div");
var slideWidth = 0;
var wrapWidth = 0;
var animation = gsap.timeline({
    repeat: -1
});
resize();

var draggable = new Draggable(proxy, {
    trigger: ".slides-container",
    inertia: true,
    onPressInit: function() {
        animation.pause();
        timer.pause();
        updateProgress();
    },
    onDrag: updateProgress,
    onThrowUpdate: updateProgress,
    onThrowComplete: () => timer.restart(true)
});

window.addEventListener("resize", resize);

function animateSlides(direction) {
    var progress = animation.progress() + direction / numSlides;
    timer.pause();
    animation.pause();
    gsap.to(animation, {
        duration: slideDuration,
        progress: progress,
        overwrite: true,
        modifiers: {
            progress: value => (value < 0 || value === 1 ? 1 : 0) + (value % 1)
        },
        onComplete: () => timer.restart(true)
    });
}

function autoPlay() {
    animation.play();
    gsap.fromTo(animation, {
        timeScale: 0
    }, {
        timeScale: 1,
        duration: 1,
        ease: "power1.in"
    });
}

function updateProgress() {
    animation.progress(progressWrap(gsap.getProperty(proxy, "x") / wrapWidth));
}

function resize() {
    var progress = animation.progress();
    slideWidth = slides[0].offsetWidth;
    wrapWidth = slideWidth * numSlides;

    animation.progress(0).clear().to(slides, {
            duration: 100,
            xPercent: "+=" + (numSlides * 100),
            ease: "none",
            modifiers: {
                xPercent: wrap
            }
        })
        .to(proxy, {
            x: wrapWidth,
            duration: 100,
            ease: "none"
        }, 0)
        .progress(progress);
}

/*Hamster(document.querySelector('.slides-container')).wheel(function(event, delta, deltaX, deltaY) {
    event.preventDefault();
    animateSlides(delta / 30);
});*/

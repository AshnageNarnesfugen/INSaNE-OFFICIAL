jQuery(() => {
    var owl = $('.owl-carousel')
    owl.owlCarousel({
        items: 1,
        loop: true,
        mouseDrag: false,
        dots: false,
        autoplay: false,
        nav: false
    })
    $('.owl-prev').click(() => owl.trigger('prev.owl.carousel'))
    $('.owl-next').click(() => owl.trigger('next.owl.carousel'))
    $('.cuztomized')
        .on('dragstart', (e) => e.stopPropagation().preventDefault())
        .on('drop', (e) => e.stopPropagation().preventDefault())
})
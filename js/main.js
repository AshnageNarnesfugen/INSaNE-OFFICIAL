jQuery(() => {
	class LazyVideoLoader {
		constructor() {
		  this.options = {
			root: null, // Use the viewport as the root
			rootMargin: '0px', // No margin
			threshold: 0.1 // Trigger when 10% of the video is visible
		  };
	  
		  this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
		}
	  
		loadVideos() {
		  $('video').each((index, videoElement) => {
			this.observer.observe(videoElement);
		  });
		}
	  
		handleIntersection(entries, observer) {
		  entries.forEach(entry => {
			if (entry.isIntersecting) {
			  const videoElement = entry.target;
			  this.lazyLoadVideo(videoElement);
			  observer.unobserve(videoElement);
			}
		  });
		}
	  
		lazyLoadVideo(videoElement) {
		  let isBlobLoaded = false; // Flag to track if blob is loaded
		  const $overlay = $('<div class="video-overlay">Loading...</div>'); // Create a loading overlay
	  
		  $(videoElement).prop('controls', false); // Disable video controls initially
		  $(videoElement).parent().append($overlay);
	  
		  const sources = $(videoElement).find('source');
		  const promises = [];
	  
		  sources.each(function () {
			const sourceElement = $(this)[0];
			const videoURL = $(this).attr('data-src'); // Use data-src attribute to store video URL instead of src
	  
			const promise = fetch(videoURL)
			  .then(response => response.blob())
			  .then(videoBlob => {
				const videoObjectURL = URL.createObjectURL(videoBlob);
	  
				// Set the src attribute of the source element to the URL
				$(sourceElement).attr('src', videoObjectURL);
			  })
			  .catch(error => {
				console.error('Failed to fetch video:', error);
			  });
	  
			promises.push(promise);
		  });
	  
		  Promise.all(promises)
			.then(() => {
			  if (!isBlobLoaded) {
				// Call the load method on the video element to update the sources
				videoElement.load();
				isBlobLoaded = true; // Update the flag
				$(videoElement).prop('controls', true); // Enable video controls
				$overlay.remove(); // Remove the loading overlay
			  }
			});
		}
	  }
	  
	  // Usage:
	  const lazyVideoLoader = new LazyVideoLoader();
	  lazyVideoLoader.loadVideos();
	  
	  class LazyImageLoader {
		constructor() {
		  this.options = {
			root: null, // Use the viewport as the root
			rootMargin: '0px', // No margin
			threshold: 0.1 // Trigger when 10% of the image is visible
		  };
	  
		  this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
		}
	  
		loadImages() {
		  const images = $('img');
	  
		  images.each((index, img) => {
			this.observer.observe(img);
		  });
	  
		  const blurDivs = $(".blur-load");
	  
		  blurDivs.each(function () {
			const img = $(this).find("img");
	  
			const loaded = () => {
			  $(this).addClass('loaded');
			};
	  
			if (img[0].complete) {
			  loaded();
			} else {
			  img.on('load', loaded);
			}
		  });
	  
		  images.click(function () {
			const src = $(this).attr('src');
			const modal = $(`<div class="modal">
			  <div class="modal-dialog">
				<div class="modal-content">
				  <img class="modal-img" src="${src}">
				</div>
			  </div>
			</div>`);
	  
			modal.appendTo('body');
	  
			modal.show();
			$('body').css('overflow', 'hidden');
	  
			modal.click(function () {
			  modal.hide();
			  modal.remove();
			  $('body').css('overflow', 'visible');
			});
		  });
		}
	  
		handleIntersection(entries, observer) {
		  entries.forEach(entry => {
			if (entry.isIntersecting) {
			  const imgElement = entry.target;
			  this.lazyLoadImage(imgElement);
			  observer.unobserve(imgElement);
			}
		  });
		}
	  
		lazyLoadImage(imgElement) {
		  const xhr = new XMLHttpRequest();
		  const src = $(imgElement).attr('src');
	  
		  const promise = new Promise((resolve, reject) => {
			xhr.open('GET', src, true);
			xhr.responseType = 'blob';
			xhr.onload = function () {
			  if (this.status === 200) {
				const blob = this.response;
				$(imgElement).attr('src', URL.createObjectURL(blob));
				resolve();
			  } else {
				reject(new Error('Failed to load image'));
			  }
			};
			xhr.onerror = function () {
			  reject(new Error('Failed to load image'));
			};
			xhr.send();
		  });
	  
		  promise.then(() => {
			const parentDiv = $(imgElement).parent();
			parentDiv.addClass('loaded');
		  }).catch(error => {
			console.error(error);
		  });
		}
	  }

	const lazyImageLoader = new LazyImageLoader();
  	lazyImageLoader.loadImages();

	function acceptedFunctionalityCookie() {
		// Your code that should run after accepting cookies goes here
		var language = Cookies.get('language');
		console.log(language);
	
		switch (language) {
			case 'ES':
			case 'MX':
			case 'AR':
			case 'CO':
			case 'PE':
			case 'VE':
			case 'CL':
			case 'EC':
			case 'GT':
			case 'CU':
				if (window.location.pathname != '/es') {
					window.location.href = `https://insane-bh.space/es?country=${language}`;
				}
				break;
			case 'US':
			case 'CA':
			case 'GB':
			case 'AU':
			case 'NZ':
			case 'IE':
			case 'ZA':
			case 'IN':
			case 'SG':
				if (window.location.pathname != '/') {
					window.location.href = `https://insane-bh.space/?country=${language}`;
				}
				break;
			case 'JP':
				if (window.location.pathname != '/ja') {
					window.location.href = `https://insane-bh.space/ja?country=${language}`;
				}
				break;
			case 'PT':
			case 'BR':
			case 'AO':
			case 'MZ':
			case 'CV':
			case 'GW':
			case 'ST':
			case 'GQ':
			case 'TL':
				if (window.location.pathname != '/pt') {
					window.location.href = `https://insane-bh.space/pt?country=${language}`;
				}
				break;
			default:
				// Get user's location using IP geolocation
				$.getJSON('https://ipapi.co/json/', function(data) {
					var userCountry = data.country_code;
					console.log(userCountry);
	
					switch (userCountry) {
						case 'US':
						case 'CA':
						case 'GB':
						case 'AU':
						case 'NZ':
						case 'IE':
						case 'ZA':
						case 'IN':
						case 'SG':
							Cookies.set('language', userCountry, {
								expires: 365,
								path: '/',
								domain: 'insane-bh.space',
								secure: true,
								sameSite: 'Strict'
							});
							window.location.href = `https://insane-bh.space/?country=${userCountry}`;
							break;
						case 'JP':
							Cookies.set('language', userCountry, {
								expires: 365,
								path: '/ja',
								domain: 'insane-bh.space',
								secure: true,
								sameSite: 'Strict'
							});
							window.location.href = `https://insane-bh.space/ja?country=${userCountry}`;
							break;
						case 'ES':
						case 'MX':
						case 'AR':
						case 'CO':
						case 'PE':
						case 'VE':
						case 'CL':
						case 'EC':
						case 'GT':
						case 'CU':
							Cookies.set('language', userCountry, {
								expires: 365,
								path: '/es',
								domain: 'insane-bh.space',
								secure: true,
								sameSite: 'Strict'
							});
							window.location.href = `https://insane-bh.space/es?country=${userCountry}`;
							break;
						case 'PT':
						case 'BR':
						case 'AO':
						case 'MZ':
						case 'CV':
						case 'GW':
						case 'ST':
						case 'GQ':
						case 'TL':
							Cookies.set('language', userCountry, {
								expires: 365,
								path: '/pt',
								domain: 'insane-bh.space',
								secure: true,
								sameSite: 'Strict'
							});
							window.location.href = `https://insane-bh.space/pt?country=${userCountry}`;
							break;
						default:
							Cookies.remove('language');
							window.location.href = `https://insane-bh.space`;
							break;
					}
				});
				break;
		}
	}
	

	$(window).on("load", function() {
		let langMSG = {}
		if (window.location.href == 'https://insane-bh.space') {
			langMSG = {
				"header": "Cookies used on the website!",
				"message": "This website uses cookies to ensure you get the best experience on our website.",
				"dismiss": "Got it!",
				"allow": "Allow cookies",
				"deny": "Decline",
				"link": "Learn More",
				"href": "https://www.example.com/cookies",
				"close": "❌",
				"policy": "Cookie Policy"
			}
		} else if (window.location.href == 'https://insane-bh.space/es') {
			langMSG = {
				"header": "¡Cookies usadas en el sitio web!",
				"message": "Este sitio web utiliza cookies para garantizar que obtenga la mejor experiencia en nuestro sitio web.",
				"dismiss": "¡Entiendo!",
				"allow": "Permitir cookies",
				"deny": "Rechazar",
				"link": "Saber más",
				"href": "https://www.example.com/cookies",
				"close": "❌",
				"policy": "Politica de Cookies"
			}
		} else if (window.location.href == 'https://insane-bh.space/ja'){
			langMSG = {
				"header": "ウェブサイトでのクッキーの使用について",
				"message": "当ウェブサイトでは、最良の体験を提供するためにクッキーを使用しています。",
				"dismiss": "了解しました！",
				"allow": "クッキーを許可する",
				"deny": "拒否する",
				"link": "詳細を知る",
				"href": "https://www.example.com/cookies",
				"close": "❌",
				"policy": "クッキーポリシー"
			}
		} else if (window.location.href == 'https://insane-bh.space/pt') {
			//portugues
			langMSG = {
				"header": "Usando cookies no site da Web!",
				"message": "O meu website usa cookies para fornecer uma experiência ótima.",
				"dismiss": "Entendi!",
				"allow": "Aceitar",
				"deny": "Negar",
				"link": "Saiba mais",
				"href": "https://www.example.com/cookies",
				"close": "❌",
				"policy": "Política de cookies",
			}
		}
		cookieconsent.initialise({
			"palette": {
				"popup": {
					"background": "#292929",
					"text": "#ffffff"
				},
				"button": {
					"background": "red",
					"text": "#000000"
				}
			},
			"content": langMSG,
			"position": "bottom-left",
			"type": "opt-in",
			"onInitialise": function(status) {
				var consent = Cookies.get('cookieconsent_status');
				if (consent && consent == 'allow') {
					// Your code that uses cookies functionality goes here
					console.log('Cookies are allowed!');
                    acceptedFunctionalityCookie()
				}
			},
			"onStatusChange": function(status, chosenBefore) {
				if (status == 'allow') {
					// Your code that uses cookies functionality goes here
					acceptedFunctionalityCookie()
					console.log('Cookies are allowed!');
				} else {
					// Your code that uses cookies functionality goes here
					console.log('Cookies are not allowed!');
				}
			},
			"onRevokeChoice": function() {
				// Your code that handles cookie revocation goes here
				console.log('Cookies consent has been revoked!');
			},
			"onNoCookieLaw": function() {
				// Your code that handles situations when there is no cookie law goes here
				console.log('No cookie law is applied!');
			},
			"onAccept": function() {
				// Your code that should run after accepting cookies goes here
				console.log('Cookies have been accepted!');
				// Add code here to enable cookie functionality, such as tracking user preferences or analytics data
				acceptedFunctionalityCookie()
			}
		});
	});

	$.fn.clickToggle = function(func1, func2) {
		var funcs = [func1, func2];
		this.data('toggleclicked', 0);
		this.click(() => {
			var data = $(this).data();
			var tc = data.toggleclicked;
			$.proxy(funcs[tc], this)();
			data.toggleclicked = (tc + 1) % 2;
		});
		return this;
	};
	$(".menu-wrapper").clickToggle(() => {
		$(".burger_menu").css({
			"opacity": "1",
			"z-index": "6"
		});
	}, () => {
		$(".burger_menu").css({
			"opacity": "0",
			"z-index": "-1"
		});
	});

	$('.menu-wrapper').on('click', () => {
		$('.hamburger-menu').toggleClass('animate');
	})

	function positionSecondDiv() {
		var topPosition = $('.mark').outerHeight() + 20;
		$('#letter').css('top', `-${topPosition}px`);
	  }
	
	  positionSecondDiv(); // Initial positioning
	
	  $(window).on('resize scroll', function() {
		positionSecondDiv(); // Update positioning on resize and scroll
	  });

	var scrolllink = $('.scroll');
	scrolllink.click(function(e) {
		e.preventDefault();
		$(".menu-wrapper").trigger("click");
		$('body,html').animate({
			scrollTop: $(this.hash).offset().top
		}, 1000);
	});

	var toMail = $("#to-mail");
	toMail.click(function(e) {
		e.preventDefault();
		$('body,html').animate({
			scrollTop: $(this.hash).offset().top
		}, 1000);
	})

	var scrollBtn = $('.scroll-top-button');

	$(window).scroll(() => {
		var y = $(this).scrollTop();
		if (y > 500) {
			$(scrollBtn).fadeIn().css('z-index', '111111');
		} else {
			$(scrollBtn).fadeOut();
		}
	});

	scrollBtn.click(() => {
		$('body,html').animate({
			scrollTop: $('html').offset().top
		}, 1000);
	});

	$("#esc3").parallaxie({
		speed: 0.8,
		disableMobile: true
	});

	let data = $('#letter').attr('data-array');
	data = JSON.parse(data)

	var container = $("#letter")
	var index = 0
	const interval = () => {
		container.shuffleLetters({
			"step": 30,
			"fps": 60,
			"text": data[index]
		});

		index++

		if (index === data.length) {
			index = 0;
		}
	}

	setInterval(interval, 4000)

	var form = $('#former-form')
	form.on('submit', function(e) {
		e.preventDefault()
		let langMSG = {}
		if (window.location.href == 'https://insane-bh.space') {
			langMSG = {
				notiMSGAccepted: "Your form has been Submitted.",
				bodyMSGAccepted: "Congratulations, Soonly our team will be in touch with you.",
				notiMSGRejected: "Your form couldn't be Submitted.",
				bodyMSGRejected: "An error has occurred, try again :(."
			}
		} else if (window.location.href == 'https://insane-bh.space/es') {
			langMSG = {
				notiMSGAccepted: "Su solicitud ha sido enviada.",
				bodyMSGAccepted: "Enhorabuena, pronto nuestro equipo se pondrá en contacto con usted.",
				notiMSGRejected: "No se pudo enviar su formulario.",
				bodyMSGRejected: "Ha ocurrido un error, inténtelo de nuevo :(."
			}
		} else if (window.location.href == 'https://insane-bh.space/ja') {
			langMSG = {
				notiMSGAccepted: "フォームを送信しました",
				bodyMSGAccepted: "おめでとうございます。あな",
				notiMSGRejected: "フォームの送信に失敗しました",
				bodyMSGRejected: "エラーが発生しました。もう一度やり"
			}
		} else if (window.location.href == 'https://insane-bh.space/pt') {
			langMSG = {
				notiMSGAccepted: "Sua mensagem foi envado.",
				bodyMSGAccepted: "Parabéns! Somos capde entrar em contato com você!",
				notiMSGRejected: "Nãose pode enviar sua mensagem.",
				bodyMSGRejected: "Ocorreuum erro, tente novamente :("
			}
		}

		let tymsg = $(this).attr('data-tymsg')
		let errmsg = $(this).attr('data-errmsg')
		console.log(tymsg, errmsg)
		$.ajax({
			method: 'POST',
			url: 'https://formsubmit.co/ajax/70a19f04e48d9da8774f32b49b924edf',
			dataType: 'json',
			accepts: 'application/json',
			data: {
				name: $('#name').val(),
				mail: $('#mail').val(),
				message: $('#message').val()
			},
			success: (data) => {
				Notification.requestPermission().then(perm => {
					if (perm === "granted") {
						new Notification(langMSG.notiMSGAccepted, {
							body: langMSG.bodyMSGAccepted,
							icon: "img/webiconspace-removebg-preview.png"
						});
					}
				});
				form.css('display', 'none');
				$('.form-container').html(tymsg);
			},
			error: (err) => {
				Notification.requestPermission().then(perm => {
					if (perm === "granted") {
						new Notification(langMSG.notiMSGRejected, {
							body: langMSG.bodyMSGRejected,
							icon: "img/webiconspace-removebg-preview.png"
						});
					}
				});
				form.css('display', 'none');
				$('.form-container').html(errmsg);
			}
		});

	})

	const shuffleTitles = (elementClass) => {
		let titles = $(elementClass)
		$(titles).each(function() {
			$(this).shuffleLetters({
				"step": 30,
				"fps": 60,
				"text": $(this).attr('data-text')
			})
		})
	}

	var observer = new IntersectionObserver(function(entries) {
		if (entries[0].isIntersecting === true)
			shuffleTitles('.shuffle')
	}, {
		threshold: [1]
	});

	observer.observe($("#quickresume")[0]);
	var owl = $('.owl-carousel')
    owl.owlCarousel({
        items: 1,
        loop: true,
        mouseDrag: true,
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
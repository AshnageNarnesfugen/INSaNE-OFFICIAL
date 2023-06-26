jQuery(() => {
	$('video').each(function() {
		var videoElement = $(this)[0];
		var isBlobLoaded = false; // Flag to track if blob is loaded
		var $overlay = $('<div class="video-overlay">Loading...</div>'); // Create a loading overlay
		
		$(videoElement).prop('controls', false); // Disable video controls initially
		$(this).parent().append($overlay);
		
		$(this).find('source').each(function() {
			var sourceElement = $(this)[0];
			var videoURL = $(this).attr('src');
			
			fetch(videoURL)
				.then(response => response.blob())
				.then(videoBlob => {
					var videoObjectURL = URL.createObjectURL(videoBlob);
					
					// Set the src attribute of the source element to the URL
					$(sourceElement).attr('src', videoObjectURL);
					
					if (!isBlobLoaded) {
						// Call the load method on the video element to update the sources
						videoElement.load();
						isBlobLoaded = true; // Update the flag
						$(videoElement).prop('controls', true); // Enable video controls
						$overlay.remove(); // Remove the loading overlay
					}
				})
				.catch(error => {
					console.error('Failed to fetch video:', error);
				});
		});
	});
	
	// Get all the image elements on the page
	var images = $('img');

	images.each(function(index, img) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", $(img).attr("src"), true);
		xhr.responseType = "blob";
		xhr.onload = function() {
		  if (this.status === 200) {
			var blob = this.response;
			$(img).attr("src", URL.createObjectURL(blob));
		  }
		};
		xhr.send();
	});
	// Add click event listeners to all the images
	images.click(function() {
		// Get the source of the clicked image
		var src = $(this).attr('src');

		// Create a new modal and append it to the body
		var modal = $(`<div class="modal">
		<div class="modal-dialog">
			<div class="modal-content">
				<img class="modal-img" src="${src}">
			</div>
		</div>
	</div>`);
		modal.appendTo('body');

		// Show the modal and overlay
		modal.show();
		$('body').css('overflow', 'hidden')
		// Add a click event listener to the close button and overlay to remove the modal and overlay from the body
		modal.click(function() {
			modal.hide();
			modal.remove();
			$('body').css('overflow', 'visible')
		});

	});

	const blurDivs = $(".blur-load");
	blurDivs.each(function() {
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
		}
		cookieconsent.initialise({
			"palette": {
				"popup": {
					"background": "#252e39",
					"text": "#ffffff"
				},
				"button": {
					"background": "#14a7d0",
					"text": "#ffffff"
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
  
		const acceptedFunctionalityCookie = () => {
        		// Your code that should run after accepting cookies goes here
        		var language = Cookies.get('language');
				console.log(language)
				if (language) {
					// Redirect user to the appropriate language version of the page
					if (language == 'es' && window.location.pathname != '/es') {
						window.location.href = 'https://insane-bh.space/es';
					} else if (language == 'en' && window.location.pathname != '/') {
						window.location.href = 'https://insane-bh.space';
					} else if (language == 'ja' && window.location.pathname != '/ja') {
						window.location.href = 'https://insane-bh.space/ja';
					}
				} else {
					// Get user's language from browser preferences
					var userLang = navigator.language || navigator.userLanguage;
					
					// Get user's location using IP geolocation
					$.getJSON('https://ipapi.co/json/', function(data) {
						var userCountry = data.country_code;

						// Check if user's language is not English and country is not the US or Canada
						if (userLang == 'en' && userCountry == 'US' && userCountry == 'CA' && userCountry == 'GB' && userCountry == 'AU' && userCountry == 'NZ' && userCountry == 'IE' && userCountry == 'ZA' && userCountry == 'IN' && userCountry == 'SG') {
							// Redirect user to Spanish version of the page
							Cookies.set('language', 'en', {
								expires: 1,
								path: '/',
								domain: 'insane-bh.space',
								secure: true,
								sameSite: 'Strict'
							});
							window.location.href = 'https://insane-bh.space/en';
						} else if (userLang == 'ja' && userCountry == 'JP') {
							// Redirect users to Japanese version of the page
							Cookies.set('language', 'ja', {
								expires: 1,
								path: '/ja',
								domain: 'insane-bh.space',
								secure: true,
								sameSite: 'Strict'
							});
							window.location.href = 'https://insane-bh.space/ja';
						} else if (userLang == 'es' && userCountry == 'ES' && userCountry == 'MX' && userCountry == 'AR' && userCountry == 'CO' && userCountry == 'PE' && userCountry == 'VE' && userCountry == 'CL' && userCountry == 'EC' && userCountry == 'GT' && userCountry == 'CU') {
							// Redirect user to English version of the page
							Cookies.set('language', 'es', {
								expires: 1,
								path: '/es',
								domain: 'insane-bh.space',
								secure: true,
								sameSite: 'Strict'
							});
							window.location.href = 'https://insane-bh.space/es';
						}
					});
				}
    }

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
		speed: 0.8
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
})
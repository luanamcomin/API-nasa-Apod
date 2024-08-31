const apiKey = 'a9yf8buUT0Sy7lA1GMtN88jZkCi4ZxNqbRmLRf1T';
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper');

	// Breakpoints.
	breakpoints({
		xlarge:  [ '1281px',  '1680px' ],
		large:   [ '981px',   '1280px' ],
		medium:  [ '737px',   '980px'  ],
		small:   [ '481px',   '736px'  ],
		xsmall:  [ null,      '480px'  ]
	});

	// Hack: Enable IE workarounds.
	if (browser.name == 'ie')
		$body.addClass('ie');

	// Touch?
	if (browser.mobile)
		$body.addClass('touch');

	// Transitions supported?
	if (browser.canUse('transition')) {

		// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

		// Prevent transitions/animations on resize.
		var resizeTimeout;

		$window.on('resize', function() {

			window.clearTimeout(resizeTimeout);

			$body.addClass('is-resizing');

			resizeTimeout = window.setTimeout(function() {
				$body.removeClass('is-resizing');
			}, 100);

		});

	}

	// Scroll back to top.
	$window.scrollTop(0);

	// Panels.
	var $panels = $('.panel');

	$panels.each(function() {

		var $this = $(this),
			$toggles = $('[href="#' + $this.attr('id') + '"]'),
			$closer = $('<div class="closer" />').appendTo($this);

		// Closer.
		$closer
			.on('click', function(event) {
				$this.trigger('---hide');
			});

		// Events.
		$this
			.on('click', function(event) {
				event.stopPropagation();
			})
			.on('---toggle', function() {

				if ($this.hasClass('active'))
					$this.triggerHandler('---hide');
				else
					$this.triggerHandler('---show');

			})
			.on('---show', function() {

				// Hide other content.
				if ($body.hasClass('content-active'))
					$panels.trigger('---hide');

				// Activate content, toggles.
				$this.addClass('active');
				$toggles.addClass('active');

				// Activate body.
				$body.addClass('content-active');

			})
			.on('---hide', function() {

				// Deactivate content, toggles.
				$this.removeClass('active');
				$toggles.removeClass('active');

				// Deactivate body.
				$body.removeClass('content-active');

			});

		// Toggles.
		$toggles
			.removeAttr('href')
			.css('cursor', 'pointer')
			.on('click', function(event) {

				event.preventDefault();
				event.stopPropagation();

				$this.trigger('---toggle');

			});

	});

	// Global events.
	$body
		.on('click', function(event) {

			if ($body.hasClass('content-active')) {

				event.preventDefault();
				event.stopPropagation();

				$panels.trigger('---hide');

			}

		});

	$window
		.on('keyup', function(event) {

			if (event.keyCode == 27 && $body.hasClass('content-active')) {

				event.preventDefault();
				event.stopPropagation();

				$panels.trigger('---hide');

			}

		});

	// Header.
	var $header = $('#header');

	// Links.
	$header.find('a').each(function() {

		var $this = $(this),
			href = $this.attr('href');

		// Internal link? Skip.
		if (!href || href.charAt(0) == '#')
			return;

		// Redirect on click.
		$this
			.removeAttr('href')
			.css('cursor', 'pointer')
			.on('click', function(event) {

				event.preventDefault();
				event.stopPropagation();

				window.location.href = href;

			});

	});

	// Footer.
	var $footer = $('#footer');

	// Copyright.
	$footer.find('.copyright').each(function() {

		var $this = $(this),
			$parent = $this.parent(),
			$lastParent = $parent.parent().children().last();

		breakpoints.on('<=medium', function() {
			$this.appendTo($lastParent);
		});

		breakpoints.on('>medium', function() {
			$this.appendTo($parent);
		});

	});

	// Main.
	var $main = $('#main');

	// Thumbs.
	$main.children('.thumb').each(function() {

		var	$this = $(this),
			$image = $this.find('.image'), $image_img = $image.children('img'),
			x;

		// No image? Bail.
		if ($image.length == 0)
			return;

		// Image.
		$image.css('background-image', 'url(' + $image_img.attr('src') + ')');

		// Set background position.
		if (x = $image_img.data('position'))
			$image.css('background-position', x);

		// Hide original img.
		$image_img.hide();

	});

	// Poptrox.
	$main.poptrox({
		baseZIndex: 20000,
		caption: function($a) {

			var s = '';

			$a.nextAll().each(function() {
				s += this.outerHTML;
			});

			return s;

		},
		fadeSpeed: 300,
		onPopupClose: function() { $body.removeClass('modal-active'); },
		onPopupOpen: function() { $body.addClass('modal-active'); },
		overlayOpacity: 0,
		popupCloserText: '',
		popupHeight: 150,
		popupLoaderText: '',
		popupSpeed: 300,
		popupWidth: 150,
		selector: '.thumb > a.image',
		usePopupCaption: true,
		usePopupCloser: true,
		usePopupDefaultStyling: false,
		usePopupForceClose: true,
		usePopupLoader: true,
		usePopupNav: true,
		windowMargin: 50
	});

	// Hack: Set margins to 0 when 'xsmall' activates.
	breakpoints.on('<=xsmall', function() {
		$main[0]._poptrox.windowMargin = 0;
	});

	breakpoints.on('>xsmall', function() {
		$main[0]._poptrox.windowMargin = 50;
	});


	// Astronomy Picture of the Day (APOD)
	function fetchAPOD() {
		const date = document.getElementById('apod-date').value;
		const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`;

		fetch(apiUrl)
			.then(response => response.json())
			.then(data => {
				displayAPOD(data);
			})
			.catch(error => console.error('Erro ao buscar a imagem:', error));
	}

	function displayAPOD(data) {
		const resultDiv = document.getElementById('apod-result');
		resultDiv.innerHTML = `
			<h3 class="nasa-title" >${data.title}</h3>
			<div class="nasa-day">
				<a href="${data.url}" class="image-nasa" ><img src="${data.url}" alt="${data.title}" style="max-width:100%;"></a>
				<p class="nasa-explanation" >${data.explanation}</p>
			</div>
		`;
	}

	// Mars Rover Photos
	function fetchMarsRoverPhotos() {
		const rover = document.getElementById('rover').value;
		const date = document.getElementById('rover-date').value;
		const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${date}&api_key=${apiKey}`;

		fetch(apiUrl)
			.then(response => response.json())
			.then(data => {
				displayMarsRoverPhotos(data.photos);
			})
			.catch(error => console.error('Erro ao buscar as fotos:', error));
	}

	function displayMarsRoverPhotos(photos) {
		const resultDiv = document.getElementById('rover-result');
		resultDiv.innerHTML = '';

		if (photos.length === 0) {
			resultDiv.innerHTML = '<p>No photos found for this date.</p>';
			return;
		}

		photos.forEach(photo => {
			const img = document.createElement('img');
			img.src = photo.img_src;
			img.alt = `Photo taken by ${photo.rover.name} on ${photo.earth_date}`;
			img.style = "max-width:100%; margin-bottom: 10px;";
			resultDiv.appendChild(img);
		});
	}

	// Near Earth Objects (NEO)
	function fetchNEO() {
		const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${apiKey}`;

		fetch(apiUrl)
			.then(response => response.json())
			.then(data => {
				displayNEO(data.near_earth_objects);
			})
			.catch(error => console.error('Erro ao buscar os objetos:', error));
	}

	function displayNEO(neoData) {
		const resultDiv = document.getElementById('neo-result');
		resultDiv.innerHTML = '';

		Object.keys(neoData).forEach(date => {
			const neoList = neoData[date];

			neoList.forEach(neo => {
				const neoDiv = document.createElement('div');
				neoDiv.innerHTML = `
					<p><strong>${neo.name}</strong></p>
					<p>Data de aproximação: ${neo.close_approach_data[0].close_approach_date}</p>
					<p>Diâmetro: ${neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km</p>
					<p>Velocidade: ${neo.close_approach_data[0].relative_velocity.kilometers_per_hour.toFixed(2)} km/h</p>
					<p>Distância da Terra: ${neo.close_approach_data[0].miss_distance.kilometers} km</p>
				`;
				resultDiv.appendChild(neoDiv);
			});
		});
	}

	// Function to fetch the Astronomy Picture of the Day (APOD)
	function fetchAPODAndUpdateArticle() {
		const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

		fetch(apiUrl)
			.then(response => response.json())
			.then(data => {
				const article = document.querySelector('.nasa-apod');
				const imageDiv = article.querySelector('.image');
				const descriptionParagraph = article.querySelector('#apod-description');

				// Create and insert the image element
				const img = document.createElement('img');
				img.src = data.url;
				img.alt = data.title;
				img.style.maxWidth = '100%';
				imageDiv.innerHTML = ''; // Clear any existing content
				imageDiv.appendChild(img);

				// Update the description
				descriptionParagraph.innerHTML = `<h3>${data.title}</h3><p>${data.explanation}</p>`;
			})
			.catch(error => console.error('Error fetching APOD:', error));
	}

	// Event Listeners
	document.addEventListener('DOMContentLoaded', fetchAPODAndUpdateArticle);
	document.getElementById('fetch-apod').addEventListener('click', fetchAPOD);
	document.getElementById('fetch-rover').addEventListener('click', fetchMarsRoverPhotos);
	document.getElementById('fetch-neo').addEventListener('click', fetchNEO);

})(jQuery);

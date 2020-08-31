// --------------------------------------------------------------------------
// Load Owl Carousel
// --------------------------------------------------------------------------

var owlPrev = '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.96916 15.8359C8.85445 15.9427 8.72266 15.9958 8.57371 15.9958C8.42494 15.9958 8.29314 15.9427 8.17862 15.8359L0.171757 8.36635C0.0572323 8.25963 0 8.13686 0 7.99797C0 7.85908 0.0572323 7.73608 0.171757 7.6293L8.17862 0.160334C8.29308 0.0535009 8.42488 0 8.57371 0C8.72266 0 8.85445 0.0533325 8.96892 0.160334L9.82794 0.961557C9.94265 1.06833 9.99982 1.19128 9.99982 1.33022C9.99982 1.46911 9.94265 1.59206 9.82794 1.69889L3.07562 7.99797L9.82812 14.2973C9.94283 14.4041 10 14.527 10 14.6658C10 14.8048 9.94283 14.9278 9.82812 15.0346L8.96916 15.8359Z" fill="currentColor"/></svg>',
	owlNext = '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.03084 15.8359L0.171877 15.0346C0.0571721 14.9278 0 14.8048 0 14.6658C0 14.527 0.0571721 14.4041 0.171877 14.2973L6.92438 7.99797L0.172058 1.69889C0.0573526 1.59206 0.000180543 1.46911 0.000180543 1.33022C0.000180543 1.19128 0.0573526 1.06833 0.172058 0.961557L1.03108 0.160334C1.14555 0.0533325 1.27734 0 1.42629 0C1.57512 0 1.70692 0.0535009 1.82138 0.160334L9.82824 7.6293C9.94277 7.73608 10 7.85908 10 7.99797C10 8.13686 9.94277 8.25963 9.82824 8.36635L1.82138 15.8359C1.70686 15.9427 1.57506 15.9958 1.42629 15.9958C1.27734 15.9958 1.14555 15.9427 1.03084 15.8359Z" fill="currentColor"/></svg>',
	owlPrevBig = owlPrev.replace('width="10"', 'width="15"').replace('height="16"', 'height="24"'),
	owlNextBig = owlNext.replace('width="10"', 'width="15"').replace('height="16"', 'height="24"');

var js_owl_reviews = js_owl_reviews || $('.js-owl-reviews-primary');
if (js_owl_reviews.length > 0)
{
	js_owl_reviews.owlCarousel({
		items: 1,
		margin: 20,
		nav: true,
		dots: false,
		loop: false,
		autoplay: false,
		//autoplayTimeout: 2000,
		//autoplayHoverPause: true,
		autoWidth: true,
		navText: [owlPrev, owlNext],
		responsive: {
			480: {
				items: 2
			},
			768: {
				items: 2,
				autoWidth: false
			},
			992: {
				items: 3,
				autoWidth: false
			},
			1200: {
				items: 4,
				autoWidth: false
			}
		}
	});
}

var js_owl_hotels = js_owl_hotels || $('.js-owl-hotels-primary');
if (js_owl_hotels.length > 0)
{
	js_owl_hotels.owlCarousel({
		items: 1,
		margin: 20,
		nav: true,
		dots: false,
		loop: false,
		autoplay: false,
		//autoplayTimeout: 2500,
		//autoplayHoverPause: true,
		autoWidth: true,
		navText: [owlPrev, owlNext],
		responsive: {
			480: {
				items: 2
			},
			768: {
				items: 3,
				autoWidth: false
			},
			992: {
				items: 4,
				autoWidth: false
			},
			1200: {
				items: 5,
				autoWidth: false
			}
		}
	});
}


// hotel image click

// клик по картинке - это переход в карточку
jdoc.on('click', '.hotels__item-image', function(e){
	e.preventDefault();

	var t = t || $(this),
		href = t.closest('.hotels__item').find('.hotels__item-title').find('a').attr('href');

	if (typeof href !== "undefined" && href.length) window.open(href);
});



/////////////////////////

var categories = new Bloodhound({
	datumTokenizer: function (categories) {
		return Bloodhound.tokenizers.whitespace();
	},
	limit: 20,
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	remote: {
		url: 'https://rubrikator.local/api/search?type=categories&query=' + $('#search').val(),
		replace: function (url, uriEncodedQuery) {
			return 'https://rubrikator.local/api/search?type=categories&query=' + $('#search').val()
		},
		filter: function (response) {
			if (response.status == "nothing_found") {
				return false
			} else {
				return response.info
			}
		}
	}
});

categories.initialize();

$('#search').typeahead({
		limit: 20,
		highlight: true,
		minLength: 1
	},
	{
		limit: 19,
		name: 'categories',
		displayKey: function (categories) {
			return categories.name
		},
		source: categories.ttAdapter(),
		templates: {
			empty: [
				'<li class="search-failed">\n' +
				'<div class="ui-search__item">\n' +
				'<span class="ui-search__item-text">\n' +
				'Ничего не найдено' +
				'</span>\n' +
				'</div>\n' +
				'</li>'
			],
			suggestion: function (data) {
				return '<li data-id="' + data['id'] + '">' +
					'<div class="ui-search__item">' +
					'<span class="ui-search__item-text">' +
					'' + data['name'] + '' +
					'</span>' +
					'</div>' +
					'</li>'
			}
		}
	}).on('typeahead:selected', function (event, data) {
		alrt(data);
	})
	.on('typeahead:asyncrequest', function () {
		$('#search-loader-1').removeClass('hidden').css('opacity', 1).css('visibility', 'visible');
	})
	.on('typeahead:asynccancel typeahead:asyncreceive', function () {
		$('#search-loader-1').addClass('hidden').css('opacity', 0).css('visibility', 'hidden');
	});

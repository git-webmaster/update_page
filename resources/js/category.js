// --------------------------------------------------------------------------
// Load Photo Tooltipster
// --------------------------------------------------------------------------

function initCategoryPhotoTooltipster()
{
	var js_tooltip = js_tooltip || $('.js-tooltip-photo:not(.tooltipstered)');

	if (js_tooltip.length)
	{
		js_tooltip.tooltipster({
			animationDuration: 200,
			arrow: false,
			animation: 'fade',
			delay: 0,
			delayTouch: [0,0],
			theme: 'tooltipster-phototip',
			contentAsHTML: true
		});
	}
}

if (window.page.type === 'category_hotel')
{
	initCategoryPhotoTooltipster();
}

// --------------------------------------------------------------------------
// Load Owl Carousel
// --------------------------------------------------------------------------

var owlPrev = '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.96916 15.8359C8.85445 15.9427 8.72266 15.9958 8.57371 15.9958C8.42494 15.9958 8.29314 15.9427 8.17862 15.8359L0.171757 8.36635C0.0572323 8.25963 0 8.13686 0 7.99797C0 7.85908 0.0572323 7.73608 0.171757 7.6293L8.17862 0.160334C8.29308 0.0535009 8.42488 0 8.57371 0C8.72266 0 8.85445 0.0533325 8.96892 0.160334L9.82794 0.961557C9.94265 1.06833 9.99982 1.19128 9.99982 1.33022C9.99982 1.46911 9.94265 1.59206 9.82794 1.69889L3.07562 7.99797L9.82812 14.2973C9.94283 14.4041 10 14.527 10 14.6658C10 14.8048 9.94283 14.9278 9.82812 15.0346L8.96916 15.8359Z" fill="currentColor"/></svg>',
	owlNext = '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.03084 15.8359L0.171877 15.0346C0.0571721 14.9278 0 14.8048 0 14.6658C0 14.527 0.0571721 14.4041 0.171877 14.2973L6.92438 7.99797L0.172058 1.69889C0.0573526 1.59206 0.000180543 1.46911 0.000180543 1.33022C0.000180543 1.19128 0.0573526 1.06833 0.172058 0.961557L1.03108 0.160334C1.14555 0.0533325 1.27734 0 1.42629 0C1.57512 0 1.70692 0.0535009 1.82138 0.160334L9.82824 7.6293C9.94277 7.73608 10 7.85908 10 7.99797C10 8.13686 9.94277 8.25963 9.82824 8.36635L1.82138 15.8359C1.70686 15.9427 1.57506 15.9958 1.42629 15.9958C1.27734 15.9958 1.14555 15.9427 1.03084 15.8359Z" fill="currentColor"/></svg>',
	owlPrevBig = owlPrev.replace('width="10"', 'width="15"').replace('height="16"', 'height="24"'),
	owlNextBig = owlNext.replace('width="10"', 'width="15"').replace('height="16"', 'height="24"');

var js_owl_reviews = js_owl_reviews || $('.js-owl-reviews-new');
if (js_owl_reviews.length > 0)
{
	js_owl_reviews.owlCarousel({
		items: 1,
		loop: false,
		margin: 20,
		nav: true,
		dots: false,
		loop: true,
		autoplay: true,
		autoplayTimeout: 2000,
		autoplayHoverPause: true,
		navText: [owlPrev, owlNext],
		responsive: {
			480: {
				autoWidth: true,
				nav: false
			},
			768: {
				autoWidth: false,
				items: 2,
				nav: false
			},
			992: {
				autoWidth: false,
				items: 3,
				nav: false
			}
		}
	});
}

// клик по картинке - это переход в карточку
jdoc.on('click', '.js-tooltip-photo, .panel__offer-image, .item-category-btn', function(e){
	e.preventDefault();

	var t = t || $(this),
		photo = '#el-photos',
		href = t.closest('.panel__container').find('.panel__offer-title').find('a').attr('href');

	if (!t.hasClass('js-tooltip-photo')) photo = '';

	if (typeof href !== "undefined" && href.length) window.open(href + photo);
});

// кнопка оценок в мобильном отзыве
jdoc.on('click', '.panel__tags-show', function(e){
	e.preventDefault();

	var t = t || $(this),
		t_li = t_li || t.closest('li'),
		ul = ul || t.closest('ul'),
		li = li || ul.find('li');

	t_li.detach();
	li.show();
	ul.append(t_li);
});

// отфильтруем список по буквам в инпуте

var initial_metro_list = $('#metro-list > li'),
	initial_region_list = $('#region-list > li');

jdoc.on('keyup', '.ui-selection__search-input', function (e) {

	e.preventDefault();

	var t = t || $(this),
		items_list,
		word = word || t.val(),
		parent = parent || t.closest('.ui-selection__dropdown'),
		menu = menu || parent.find('.ui-selection__menu');

	if (menu.attr('id') === 'metro-list')
	{
		items_list = initial_metro_list;
	}
	else
	{
		items_list = initial_region_list;
	}

	if (word.length < 1)
	{
		menu.html(items_list);
	}
	else
	{
		menu.html('');
	}

	items_list.each(function (index) {

		var tli = $(this),
			button_text = tli.find('.item-text').html();

		if (button_text.toLowerCase().indexOf(word.toLowerCase()) !== -1)
		{
			menu.append(tli);
		}
	});


});

// клик по карте

// places map click
jdoc.on('click', '.places_map_parent', function(e){
	e.preventDefault();

	if (window.page.map_link.length > 0)
	{
		window.open(window.page.map_link,"_blank");
	}
	else
	{
		toast('Не найдена карта для этой страницы', 'info');
	}

});
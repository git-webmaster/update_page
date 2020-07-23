// --------------------------------------------------------------------------
// Variables
// --------------------------------------------------------------------------

var jwindow = jwindow || $(window),
	jhtml = jhtml || $('html'),
	jdoc = jdoc || $(document),
	jbody = jbody || $('body');

// --------------------------------------------------------------------------
// Functions
// --------------------------------------------------------------------------

$.fn.isInViewport = function(containerSelector, partial = true) {
	var $element = this;

	if($element.length) {
		var el = $element[0], parentRect, rect = el.getBoundingClientRect();

		if(containerSelector && $(containerSelector).length) {
			parentRect = $(containerSelector)[0].getBoundingClientRect();
		} else {
			parentRect = {top: 0, left: 0, bottom: $(window).height(), right: $(window).width()};
		}

		if(partial) {
			return (
				rect.left >= parentRect.left &&
				rect.right <= parentRect.right &&
				(
					(rect.top >= parentRect.top && rect.top <= parentRect.bottom) ||
					(rect.bottom >= parentRect.top && rect.bottom <= parentRect.bottom)
				)
			);
		} else {
			return (
				rect.top >= parentRect.top &&
				rect.left >= parentRect.left &&
				rect.bottom <= parentRect.bottom &&
				rect.right <= parentRect.right
			);
		}
	}
}
$.fn.setCursorPosition = function(pos) {
	this.each(function(index, elem) {
		if (elem.setSelectionRange) {
			elem.setSelectionRange(pos, pos);
		} else if (elem.createTextRange) {
			var range = elem.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	});
	return this;
};

function basicTorTest() {
	var img = document.createElement("img");
	// Creates a black 1x1 px image
	img.src = 'data:image/png;base64,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';

	var canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	var ctx = canvas.getContext("2d");
	var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);

	return imagedata.data[0] === 255
		&& imagedata.data[1] === 255
		&& imagedata.data[2] === 255
		&& imagedata.data[3] === 255;
}

window.page.tor = basicTorTest();

function toggleElementClass(t, selector) {
	if (t.closest(selector).is('.is-open')) {
		t.closest(selector).removeClass('is-open');
	} else {
		$(selector).removeClass('is-open');
		t.closest(selector).addClass('is-open');
	}
}

// LoadCss
let fetchStyle = function(url) {
	return new Promise((resolve, reject) => {

		let link = document.createElement('link');
		link.type = 'text/css';
		link.rel = 'stylesheet';
		link.onload = function() { resolve(); };
		link.href = url;

		let headScript = document.querySelector('script');
		headScript.parentNode.insertBefore(link, headScript);
	});
};

// Trim
function trimChar(string, charToRemove) {

	while(string.charAt(0) === charToRemove) {
		string = string.substring(1);
	}

	while(string.charAt(string.length-1) === charToRemove) {
		string = string.substring(0,string.length-1);
	}

	return string;
}

// scrollTop fn

var arrowTop = arrowTop || $('.icon-scrolltop'),
	scrollPos = 0,
	lastScrollTop = 0;

// перевернем стрелку при скролле вниз при наличии позиции для возврата
var RotateArrow = function()
{
	var scrollPosCurrent = window.pageYOffset || document.documentElement.scrollTop;

	// если направление скролла - вниз
	if (scrollPosCurrent > lastScrollTop)
	{
		if (scrollPos > 0)
		{
			arrowTop.removeClass('rotated').css('top', '-5px');
			scrollPos = scrollPosCurrent;
			lastScrollTop = 0;
			RemoveTopScrollListener();

			return;
		}
	}

	lastScrollTop = scrollPosCurrent <= 0 ? 0 : scrollPosCurrent; // For Mobile or negative scrolling
};

function AddTopScrollListener()
{
	window.addEventListener('scroll', RotateArrow);
}

function RemoveTopScrollListener()
{
	window.removeEventListener('scroll', RotateArrow);
}

Math.inOutQuintic = function(t, b, c, d) {
	var ts = (t/=d)*t,
		tc = ts*t;
	return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
};

var requestAnimFrame = (function(){
	return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };
})();

function scroll(to, duration)
{
	// because it's so fucking difficult to detect the scrolling element, just move them all
	function move(amount) {
		document.documentElement.scrollTop = amount;
		document.body.parentNode.scrollTop = amount;
		document.body.scrollTop = amount;
	}

	function position() {
		return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
	}

	var start = position(),
		change = to - start,
		currentTime = 0,
		increment = 20;

	duration = (typeof(duration) === 'undefined') ? 400 : duration;

	var animateScroll = function()
	{
		// increment the time
		currentTime += increment;

		// find the value with the quadratic in-out easing function
		var val = Math.inOutQuintic(currentTime, start, change, duration);

		// move the document.body
		move(val);

		// do the animation unless its over
		if (currentTime < duration)
		{
			requestAnimFrame(animateScroll);
		}
	};

	animateScroll();
}

jwindow.on('scroll', function(){

	var scroll_pos_window = window.pageYOffset || document.documentElement.scrollTop,
		scrolltop_el = scrolltop_el || $('#scrolltop');

	if (scroll_pos_window === 0 && lastScrollTop <= 0)
	{
		scrolltop_el.addClass('no-show');
	}
	else
	{
		if (scrolltop_el.hasClass('no-show')) scrolltop_el.removeClass('no-show');
	}

});

function escapeRegExp(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.replace(new RegExp(escapeRegExp(search), 'g'), replacement);
};

// --------------------------------------------------------------------------
// AJAX
// --------------------------------------------------------------------------

var token, token_timestamp;

function getToken()
{
	var now = Math.round(new Date().getTime()/1000);

	if (typeof token !== "undefined" && token !== false && token.length && (now - token_timestamp) <= 30 )
	{
		return token;
	}
	else
	{
		return $.post('/api/token').done(function(response){

			token = response;

			if(typeof token !== "undefined" && token !== false && token.length)
			{
				token_timestamp = Math.round(new Date().getTime()/1000);
			}

		});
	}
}

function universalUpdate(page_type, table, id, kv_array)
{
	$.when(getToken()).done(function(tk)
	{
		return $.ajax({
			type     : "POST",
			cache    : false,
			url      : '/api/update',
			data     : {
				token: tk,
				page_type: page_type,
				table: table,
				id: id,
				kv_array: JSON.stringify(kv_array)
			}
		});
	});
}

// --------------------------------------------------------------------------
// Alert
// --------------------------------------------------------------------------


function alrt(text, type = 1, timer = 2000)
{
	if (type === 1)
	{
		Swal.fire({html: text});
	}

	// auto-close timer notice no buttons
	if (type === 2)
	{
		Swal.fire({
			html: text,
			timer: timer,
			showConfirmButton: false,
			timerProgressBar: true
		});
	}

	// auto-close timer notice no buttons, then reload page
	if (type === 3)
	{
		Swal.fire({
			html: text,
			timer: timer,
			showConfirmButton: false,
			timerProgressBar: true
			})
			.then((result) =>
			{

				if (result.dismiss === Swal.DismissReason.timer) {
					location.reload();
				}

			});
	}
}

function toast(text, icon = 'success', timer = 3000)
{
	const Toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: timer,
		timerProgressBar: false,
		onOpen: (toast) => {
			toast.addEventListener('mouseenter', Swal.stopTimer);
			toast.addEventListener('mouseleave', Swal.resumeTimer);
		}
	});

	Toast.fire({
		icon: icon,
		title: text
	});
}

function isJSON (jsonString){
	try {
		var o = JSON.parse(jsonString);

		if (o && typeof o === "object") {
			return o;
		}
	}
	catch (e) { }

	return false;
};

// Themes fn

var themeDark = false;
var themeBlind = false;

var loadTheme = function(url, callback)
{
	var link = document.createElement('link');
	link.type = 'text/css';
	link.rel = 'stylesheet';
	link.href = url;

	document.getElementsByTagName('body')[0].appendChild(link);

	var img = document.createElement('img');

	img.onerror = function(){
		if(callback) callback(link);
	};

	img.src = url;
};

/**
 * Trigger a callback when 'this' image is loaded:
 * @param {Function} callback
 */
(function($){
	$.fn.imgLoad = function(callback) {
		return this.each(function() {
			if (callback) {
				if (this.complete && /*for IE 10-*/ this.naturalHeight > 0) {
					callback.apply(this);
				}
				else {
					$(this).on('load', function(){
						callback.apply(this);
					});
				}
			}
		});
	};
})(jQuery);

// --------------------------------------------------------------------------
// Swipe Menu & Offcanvas
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// Offcanvas
// --------------------------------------------------------------------------

var js_offcanvas_dropdown = js_offcanvas_dropdown || $('.js-offcanvas-dropdown');

jdoc.on('click', '.js-offcanvas-btn', function(e) {
	e.preventDefault();

	jhtml.toggleClass('is-offcanvas-open');

	js_offcanvas_dropdown.css({
		'transition': '',
		'transform' : ''
	});
});

jdoc.on('click', '.js-offcanvas-close', function(e) {
	e.preventDefault();

	jhtml.removeClass('is-offcanvas-open');

	js_offcanvas_dropdown.css({
		'transition': '',
		'transform' : ''
	});
});

jdoc.on('click', function (e) {
	if ($(e.target).closest('.js-offcanvas').length === 0)
	{
		jhtml.removeClass('is-offcanvas-open');

		js_offcanvas_dropdown.css({
			'transition': '',
			'transform' : ''
		});
	}
});

js_offcanvas_dropdown.swipe({
	swipeStatus: function(event, phase, direction, distance, duration, fingers)
	{
		if ( phase === 'move' && direction === "right" )
		{
			js_offcanvas_dropdown.css({
				'transition' : 'none',
				'transform': 'translate(' + distance + 'px,0)'
			});
		}

		if ( phase === 'cancel' )
		{
			js_offcanvas_dropdown.css({
				'transition' : '0.25s',
				'transform': 'translate(0,0)'
			});
		}

		if ( phase === 'end' && direction === "right" )
		{
			js_offcanvas_dropdown.css({
				'transition' : '0.25s',
				'transform': 'translate(100%,0)'
			});

			jhtml.removeClass('is-offcanvas-open');

			js_offcanvas_dropdown.on('transitionend webkitTransitionEnd oTransitionEnd', function ()
			{
				js_offcanvas_dropdown.removeAttr('style');
			});

		}

		if ( phase === 'end' && direction !== "right" )
		{
			js_offcanvas_dropdown.css({
				'transition' : '0.25s',
				'transform': 'translate(0,0)'
			});
		}

	},

	//- triggerOnTouchEnd: false,
	allowPageScroll: 'vertical',
	threshold: 70
});

function updateOffcanvas()
{
	if (window.matchMedia('(min-width: 1200px)').matches)
	{
		js_offcanvas_dropdown.swipe('disable');
	}
	else
	{
		js_offcanvas_dropdown.swipe('enable');
	}
}

updateOffcanvas();

jwindow.on('resize orientationchange', function(event) {
	updateOffcanvas();
});

// --------------------------------------------------------------------------
// Load Sticky-kit
// --------------------------------------------------------------------------

function sticky()
{
	var js_scrolltop_icon_scrolltop = js_scrolltop_icon_scrolltop || $('.js-scrolltop .icon-scrolltop'),
		js_sticky = js_sticky || $('.js-sticky');

	if (js_scrolltop_icon_scrolltop.length)
	{
		if (window.matchMedia('(min-width: 1480px)').matches)
		{
			js_scrolltop_icon_scrolltop.stick_in_parent({
				offset_top: 0,
				bottoming: true,
				spacer: false,
				inner_scrolling: true,
				sticky_class: 'is-sticky',
				parent: '.js-scrolltop'
			});
		}
		else
		{
			js_scrolltop_icon_scrolltop.trigger('sticky_kit:detach');
		}
	}

	if (js_sticky.length)
	{
		if (window.matchMedia('(min-width: 1200px)').matches)
		{
			js_sticky.stick_in_parent({
				offset_top: 15,
				bottoming: true,
				spacer: false,
				inner_scrolling: true,
				sticky_class: 'is-sticky',
				parent: '.js-sticky-container'
			});
		}
		else
		{
			js_sticky.trigger('sticky_kit:detach');
		}
	}
}

sticky();

jwindow.on('resize', function(e)
{
	sticky();
});

// --------------------------------------------------------------------------
// Load Selectric
// --------------------------------------------------------------------------

var js_select =  js_select || $('.js-select');
if ( js_select.length )
{
	js_select.selectric({
		maxHeight: 380,
		keySearchTimeout: 500,
		arrowButtonMarkup: '<span class="arrow"><svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 0.396135C0 0.289855 0.0413793 0.193237 0.124138 0.115942C0.289655 -0.0386473 0.558621 -0.0386473 0.724138 0.115942L6 5.04348L11.2759 0.115942C11.4414 -0.0386473 11.7103 -0.0386473 11.8759 0.115942C12.0414 0.270531 12.0414 0.521739 11.8759 0.676328L6.3 5.88406C6.13448 6.03865 5.86552 6.03865 5.7 5.88406L0.124138 0.676328C0.0413793 0.599034 0 0.502415 0 0.396135Z" fill="currentColor"/></svg></span>',
		disableOnMobile: false,
		nativeOnMobile: true,
		openOnHover: false,
		hoverIntentTimeout: 500,
		expandToItemText: false,
		responsive: false,
		customClass: {
			prefix: 'ui-selectric',
			camelCase: false
		},
		optionsItemBuilder: '{text}',
		labelBuilder: '{text}',
		preventWindowScroll: false,
		inheritOriginalWidth: false,
		allowWrap: true,
		multiple: {
			separator: ', ',
			keepMenuOpen: true,
			maxLabelEntries: false
		},
		onBeforeInit: function() {

		},
		onInit: function(itemData, element, index) {

		},
		onBeforeOpen: function() {

		},
		onOpen: function() {

		},
		onBeforeClose: function() {

		},
		onClose: function() {

		},
		onBeforeChange: function() {

		},
		onChange: function(e) {
			$(e).change();
		},
		onRefresh: function() {

		},
	});
}

var js_select_search =  js_select_search || $('.js-select-search');
if ( js_select_search.length )
{
	js_select_search.selectric({
		optionsItemBuilder: function (itemData, element, index) {
			var icon = itemData.element.data('icon');
			return element.val().length ? '<span class="' + icon + '"></span>' + itemData.text : itemData.text;
		}
	});
}

var js_select_icons =  js_select_icons || $('.js-select-icons');
if ( js_select_icons.length )
{
	js_select_icons.selectric({
		labelBuilder: function (itemData, element, index) {
			var icon = itemData.element.data('icon');

			return icon.length ? '<span class="ui-selectric-icon"><img src="' + icon + '"></span>' + itemData.text : itemData.text;

		},
		optionsItemBuilder: function (itemData, element, index) {
			var icon = itemData.element.data('icon');
			return icon.length ? '<span class="ui-selectric-icon"><img src="' + icon + '"></span>' + itemData.text : itemData.text;
		}
	});
}

var js_select_svg =  js_select_svg || $('.js-select-svg');
if ( js_select_svg.length )
{
	js_select_svg.selectric({
		nativeOnMobile: false,
		labelBuilder: function (itemData, element, index) {
			var icon = itemData.element.data('svg');
			return icon.length ? '<span class="ui-selectric-svg"><svg class="' + icon + '"><use xlink:href="#' + icon + '"></use></svg></span>' + itemData.text : itemData.text;

		},
		optionsItemBuilder: function (itemData, element, index) {
			var icon = itemData.element.data('svg');
			return icon.length ? '<span class="ui-selectric-svg"><svg class="' + icon + '"><use xlink:href="#' + icon + '"></use></svg></span>' + itemData.text : itemData.text;
		}
	});
}

// --------------------------------------------------------------------------
// Load PriorityNav
// --------------------------------------------------------------------------

if ( $('.js-filter').length ) {

	var filterMore = priorityNav.init({
		initClass:                  "is-filter",
		mainNavWrapper:             ".js-filter",
		mainNav:                    ".js-filter-list",
		navDropdownClassName:       "ui-filter__dropdown",
		navDropdownToggleClassName: "ui-filter__dropdown-toggle",
		navDropdownLabel:           "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Еще фильтры",
		navDropdownBreakpointLabel: "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Показать фильтры",
		breakPoint:                 480,
		throttleDelay:              50,
		offsetPixels:               0,
		count:                      true,
		//Callbacks
		moved: function () {
			// $('html').addClass('is-info-open');
		}, // executed when item is moved to dropdown
		movedBack: function () {
			// $('html').removeClass('is-info-open');
		} // executed when item is moved back to main menu
	});
}

if ( $('.js-sorting').length ) {

	var sortingMore = priorityNav.init({
		initClass:                  "is-sorting",
		mainNavWrapper:             ".js-sorting",
		mainNav:                    ".js-sorting-list",
		navDropdownClassName:       "ui-sorting__dropdown",
		navDropdownToggleClassName: "ui-sorting__dropdown-toggle",
		navDropdownLabel:           "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Еще фильтры",
		navDropdownBreakpointLabel: "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Показать фильтры",
		//- breakPoint:                 576,
		breakPoint:                 0,
		throttleDelay:              50,
		offsetPixels:               0,
		count:                      true,
		//Callbacks
		moved: function () {
			// $('html').addClass('is-info-open');
		}, // executed when item is moved to dropdown
		movedBack: function () {
			// $('html').removeClass('is-info-open');
		} // executed when item is moved back to main menu
	});

}

if ( $('.js-priority').length ) {

	var navPriority = priorityNav.init({
		initClass:                  "is-navmore",
		mainNavWrapper:             ".js-priority",
		mainNav:                    ".js-priority-menu",
		navDropdownClassName:       "l__nav-dropdown",
		navDropdownToggleClassName: "l__nav-dropdown-toggle",
		navDropdownLabel:           "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> <u>Еще</u>",
		navDropdownBreakpointLabel: "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Показать фильтры",
		breakPoint:                 0,
		throttleDelay:              50,
		offsetPixels:               0,
		count:                      true,
		//Callbacks
		moved: function () {
			// $('html').addClass('is-info-open');
		}, // executed when item is moved to dropdown


		movedBack: function () {
			// $('html').removeClass('is-info-open');
		} // executed when item is moved back to main menu
	});
}

// --------------------------------------------------------------------------
// Load Perfect Scrollbar
// --------------------------------------------------------------------------

var js_scrollbar = js_scrollbar || $('.js-scrollbar');

if ( js_scrollbar.length )
{
	$.each( js_scrollbar, function(i) {

		var scrollbar = Scrollbar.init(this, {
			renderByPixels: true,
			alwaysShowTracks: true,
			continuousScrolling: true
		});
	});

	Scrollbar.detachStyle();
}

// --------------------------------------------------------------------------
// Load Tooltipster
// --------------------------------------------------------------------------

function initTooltipster()
{
	var js_tooltip = js_tooltip || $('.js-tooltip:not(.tooltipstered)');

	if (js_tooltip.length)
	{
		js_tooltip.tooltipster({
			animationDuration: 200,
			arrow: false,
			animation: 'fade',
			delay: 0,
			delayTouch: [0,0],
			contentAsHTML: true,
			theme: 'tooltipster-sidetip'
		});
	}
}

initTooltipster();

// --------------------------------------------------------------------------
// Load Events - click, change
// --------------------------------------------------------------------------

function loadEvents() {

	// --------------------------------------------------------------------------
	// Modal
	// --------------------------------------------------------------------------

	$('.js-modal').fadeIn(400);

	jdoc.on('click', '.js-modal-close', function(e) {
		e.preventDefault();
		$(this).closest('.js-modal').hide();
	});

	// --------------------------------------------------------------------------
	// Flag
	// --------------------------------------------------------------------------

	jdoc.on('change', '.js-flag', function(event) {

		if ( $(this).is(':checked') ) {
			$(this).closest('.panel__photo, .panel__comment, .panel__renewal').addClass('is-flag');
		} else {
			$(this).closest('.panel__photo, .panel__comment, .panel__renewal').removeClass('is-flag');
		}

	});

	// --------------------------------------------------------------------------
	// Scrolltop
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-scrolltop', function(e)
	{
		e.preventDefault();

		var t = t || $(this), scrollPosCurrent = window.pageYOffset || document.documentElement.scrollTop;

		// Запоминаем позицию при скролле вверх, и если кнопка нажата ещё раз - скроллим обратно
		if (scrollPosCurrent === 0)
		{
			if (scrollPos > 0)
			{
				scroll(scrollPos, 150);

				scrollPos = 0;
				lastScrollTop = 0;

				arrowTop.removeClass('rotated').css('top', '-5px');
				RemoveTopScrollListener();
			}
		}
		else
		{
			scroll(0, 150);

			scrollPos = scrollPosCurrent;
			arrowTop.removeClass('rotated').addClass('rotated').css('top', '0');

			lastScrollTop = scrollPosCurrent <= 0 ? 0 : scrollPosCurrent;
			AddTopScrollListener();
		}
	});

	// --------------------------------------------------------------------------
	// Themes
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-theme-dark', function(e)
	{
		e.preventDefault();

		jhtml.removeClass('is-theme-blind').toggleClass('is-theme-dark');
		jwindow.trigger('resize');

		if( themeDark === false)
		{
			var js_theme_dark = js_theme_dark || $('.js-theme-dark');
			js_theme_dark.addClass('is-loading');

			loadTheme('/css/themes/theme-dark.css', function()
			{
				js_theme_dark.removeClass('is-loading');
				themeDark = true;
			});
		}
	});

	jdoc.on('click', '.js-theme-blind', function(e)
	{
		e.preventDefault();

		jhtml.removeClass('is-theme-dark').toggleClass('is-theme-blind');
		jwindow.trigger('resize');

		if( themeBlind === false)
		{
			var js_theme_blind = js_theme_blind || $('.js-theme-blind');
			js_theme_blind.addClass('is-loading');

			loadTheme('/css/themes/theme-blind.css', function()
			{
				js_theme_blind.removeClass('is-loading');
				themeBlind = true;
			});
		}
	});

	// --------------------------------------------------------------------------
	// Nav
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-nav-btn', function(e) {
		e.preventDefault();
		var t = t || $(this);
		toggleElementClass(t, '.js-nav');
	});

	// --------------------------------------------------------------------------
	// Collapse
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-collapse-btn', function(e) {

		e.preventDefault();

		var t = t || $(this)
			js_collapse = t.closest('.js-collapse'),
			js_collapse_content = js_collapse.find('.js-collapse-content');

		if ( js_collapse_content.is(':visible') )
		{
			js_collapse.removeClass('is-open')
			js_collapse_content.hide();
		}
		else
		{
			js_collapse.addClass('is-open')
			js_collapse_content.show();
		}
	});

	// --------------------------------------------------------------------------
	// Toggle
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-toggle-btn', function(e)
	{
		e.preventDefault();
		var t = t || $(this);

		toggleElementClass(t, '.js-toggle');
	});

	jdoc.on('click', function (e)
	{
		if ($(e.target).closest('.js-toggle').length === 0)
		{
			$('.js-toggle').removeClass('is-open');
		}
	});

	// --------------------------------------------------------------------------
	// Cookies
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-cookies-trigger', function(e)
	{
		e.preventDefault();
		var t = t || $(this);

		if ( t.closest('.js-cookies').is('.is-open'))
		{
			t.closest('.js-cookies').removeClass('is-open').find('.js-cookies-dropdown').hide();
		}
		else
		{
			t.closest('.js-cookies').addClass('is-open').find('.js-cookies-dropdown').show();
		}
	});

	jdoc.on('click', '.js-cookies-hide', function(e)
	{
		e.preventDefault();
		$(this).closest('.js-cookies').addClass('is-hide');
	});

	// --------------------------------------------------------------------------
	// Tabs
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-tabs-btn', function(e) {
		e.preventDefault();
		var t = t || $(this),
			jtabs = jtabs || t.closest('.js-tabs'),
			tabsIndex = tabsIndex || t.closest('li').index();

		jtabs.find('.js-tabs-btn').removeClass('is-active').eq(tabsIndex).addClass('is-active');
		jtabs.find('.js-tabs-content').removeClass('is-active').eq(tabsIndex).addClass('is-active');
	});

	// --------------------------------------------------------------------------
	// Tabs ID
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-tabsid-btn', function(e)
	{
		e.preventDefault();

		var tab = $(this),
			tab_id = $(this).attr('data-tabs-btn'),
			tabsid = tab.closest('.js-tabsid'),
			tabsid_btn = tabsid.find('.js-tabsid-btn'),
			tabsid_content = tabsid.find('.js-tabsid-content');

		if ( tab.is('.is-active') )
		{
			tabsid_btn.removeClass('is-active');
			tabsid_content.removeClass('is-active');
		}
		else
		{
			tabsid_btn.removeClass('is-active');
			tabsid_content.removeClass('is-active');

			tabsid.find('[data-tabs-btn=' + tab_id + ']').addClass('is-active');
			tabsid.find('[data-tabs-content=' + tab_id + ']').addClass('is-active');
		}
	});

	// --------------------------------------------------------------------------
	// Ellipsis
	// --------------------------------------------------------------------------

	var js_ellipsis = js_ellipsis || $('.js-ellipsis');

	if (js_ellipsis.length)
	{
		js_ellipsis.each(function(){

			var t = t || $(this);

			t.html('<span style>' + t.text() + '</span>');

			t.hover(function(){
				var speed  = 250,
					length = t.find('span').width() - t.width(),
					time   = length/speed;

				t.find('span').css('transition', 'left ' + time + 's linear').css('left', '-' + length + 'px');
			}, function(){
				t.find('span').attr('style', '');
			});
		});
	}

	//- // --------------------------------------------------------------------------
	//- // Sorting
	//- // --------------------------------------------------------------------------

	//- $(document).on('click', '.js-sorting-btn', function(event) {
	//-     event.preventDefault();
	//-     var t = t || $(this);

	//-     if ( t.closest('.js-sorting').is('.is-open') ) {

	//-         t.closest('.js-sorting').removeClass('is-open');

	//-     } else {

	//-         t.closest('.js-sorting').addClass('is-open');

	//-     }
	//- });


	// --------------------------------------------------------------------------
	// Clickwall
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-clickwall-btn', function(e)
	{
		e.preventDefault();

		var t = t || $(this),
			loadmore_panel = loadmore_panel || $('.panel__loadmore').closest('.panel'),
			pagination_panel = pagination_panel || $('.panel__pagination').closest('.panel'),
			clickwall = t.closest('.js-clickwall');

		if (loadmore_panel.length)
		{
			loadmore_panel.removeClass('hidden');
		}

		if (pagination_panel.length)
		{
			pagination_panel.removeClass('hidden');
		}

		if ( clickwall.hasClass('is-open') )
		{
			clickwall.removeClass('is-open');
		}
		else
		{
			clickwall.addClass('is-open');
		}
	});

	// --------------------------------------------------------------------------
	// Notice
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-notice-btn, .js-notice-close', function(e)
	{
		e.preventDefault();
		var t = t || $(this);

		if ( t.closest('.js-notice').is('.is-closed') ) {

			t.closest('.js-notice').removeClass('is-closed');

		} else {

			t.closest('.js-notice').addClass('is-closed');

		}
	});

	// --------------------------------------------------------------------------
	// Accordion
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-accordion-btn', function(e) {
		e.preventDefault();
		var t = t || $(this),
			accordeon_item = t.closest('.js-accordion-item'),
			accordeon_content = accordeon_item.children('.js-accordion-content');

		if ( accordeon_item.hasClass('is-open') )
		{
			accordeon_item.removeClass('is-open');
			accordeon_content.css('display', 'none');
		}
		else
		{
			accordeon_item.addClass('is-open');
			accordeon_content.css('display', 'block');
		}
	});

	// --------------------------------------------------------------------------
	// Toggle
	// --------------------------------------------------------------------------

	jdoc.on('click', '.js-selection-btn', function(e) {
		e.preventDefault();
		var t = t || $(this),
			selection = t.closest('.js-selection');

		if ( selection.hasClass('is-open') )
		{
			selection.removeClass('is-open');
		}
		else
		{
			$('.js-selection').removeClass('is-open');
			selection.addClass('is-open');
		}
	});

	jdoc.on('click', '.js-selection-option', function(e) {
		e.preventDefault();
		var t = t || $(this),
			menu = menu || t.closest('.ui-selection'),
			selected = $(this).text();

		//t.closest('.js-selection').addClass('is-changed');
		t.closest('.js-selection').find('.js-selection-text').text(selected);
		menu.removeClass('is-open');
	});

	jdoc.on('click', function (e) {
		if ($(e.target).closest('.js-selection').length === 0)
		{
			$('.js-selection').removeClass('is-open');
		}
	});

	//
	// Search field
	//

	// focus empty search field
	var search_input = $('#search'),
		user_text = search_input.val(),
		selected_suggest_text = '',
		selected_suggest_num = 0;

	if (search_input.length && !search_input.val().length && window.page.type === 'search')
	{
		search_input.focus();
	}

	// search btn click
	jdoc.on('click', '.ui-search__btn', function(e){
		e.preventDefault();
		alrt(search_input.val());
	});

	// remember user input
	jdoc.on('keyup', '#search', function (e) {

		var t = $(this);

		if (e.which !== 38 && e.which !== 40) {
			user_text = t.val();
		}
	});

	// suggest arrow up-down
	jdoc.on('keydown', '#search', function (e) {
		var t = $(this),
			all_li = $('.ui-search__list > li'),
			li_total = all_li.length;

		// up
		if (e.which === 38) {

			if (selected_suggest_num === 0)
			{
				//return false;
				selected_suggest_num = li_total+1;
			}

			if (selected_suggest_num === 1)
			{
				selected_suggest_num--;
				t.setCursorPosition(user_text.length);
				all_li.removeClass('selected');
				// t.val(user_text);
			}
			else
			{
				selected_suggest_num--;
				var this_li = $('.ui-search__list > li[data-num=' + selected_suggest_num + ']');

				if (selected_suggest_num <= 0) selected_suggest_num = li_total+1;
				selected_suggest_text = $.trim(this_li.find('.ui-search__item-text').html());

				all_li.removeClass('selected');
				this_li.addClass('selected');

				// t.val(selected_suggest_text);
				t.setCursorPosition(selected_suggest_text.length);
			}

			return false;
		}

		// down
		if (e.which === 40) {

			if (selected_suggest_num === li_total)
			{
				selected_suggest_num = 0;
				t.setCursorPosition(user_text.length);
				all_li.removeClass('selected');
				t.val(user_text);
				return false;
			}
			else
			{
				selected_suggest_num++;
				var this_li = $('.ui-search__list > li[data-num=' + selected_suggest_num + ']');

				selected_suggest_text = $.trim(this_li.find('.ui-search__item-text').html());

				all_li.removeClass('selected');
				this_li.addClass('selected');

				t.val(selected_suggest_text);
				t.setCursorPosition(selected_suggest_text.length);
			}

			return false;
		}

	});

	// suggest hover
	jdoc.on('mouseover', '.ui-search__list > li', function(e){

		var t = $(this),
			all_li = t.closest('.ui-search__list').find('li'),
			t_text = $.trim(t.find('.ui-search__item-text').html()),
			t_num = t.data('num');

		all_li.removeClass('selected');
		t.addClass('selected');

		selected_suggest_num = t_num;
		selected_suggest_text = t_text;
	});

	// suggest click
	jdoc.on('click', '.ui-search__list > li', function(){


		var t = $(this),
			t_text = $.trim(t.find('.ui-search__item-text').html()),
			t_num = t.data('num');

		if (typeof t_text !== "undefined" && t_text.length)
		{
			$(this).parents('.ui-search__input').val(t_text);

			if (jhtml.hasClass('is-search-open'))
			{
				jhtml.removeClass('is-search-open');
			}

			$('.ui-search__btn').trigger('click');
		}
	});

	// search focus in
	jdoc.on('focusin', '#search', function (e) {
		e.preventDefault();

		if (!jhtml.hasClass('is-search-open'))
		{
			var all_li = $('.ui-search__list > li');

			jhtml.addClass('is-search-open');
			all_li.removeClass('selected');
			selected_suggest_text = '';
			selected_suggest_num = 0;
		}

	});

	// search focus out
	jdoc.on('focusout', '#search', function (e) {
		e.preventDefault();

		// если открыты подсказки - то не закрываемся
		if($('.ui-search__list' + ':hover').length) {
			return;
		}

		if (jhtml.hasClass('is-search-open'))
		{
			jhtml.removeClass('is-search-open');
		}

		selected_suggest_num = 0;
	});
}

loadEvents();

// preload links in viewport


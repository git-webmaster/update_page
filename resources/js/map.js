// --------------------------------------------------------------------------
// Map.js
// --------------------------------------------------------------------------

var map_loaded = false,
	map = false,
	markers_loaded = [],
	me_marker = false,
	me_marker_pos = false,
	was_movement = false,
	cached_area = false,
	from_id_marker, iconSvg, markersLayer,
	map_loader = $('#loader-map'),
	center = [window.page.lat, window.page.lon];

// для проверки кеширования уже загруженных областей координат
function contains_multipolygon(parent, child)
{
	var result = false;

	if (parent.geometry.type === 'Polygon')
	{
		result = Turf.contains(parent, child)
	}
	else if (parent.geometry.type === 'MultiPolygon')
	{
		$.each(parent.geometry.coordinates, function(index,coords)
		{
			var parent_polygon = {'type':'Polygon','coordinates': coords };
			result = Turf.contains(parent_polygon, child);

			if (result)
			{
				return false;
			}
		});
	}

	return result;
}

// для уведомлений на карте
const ToastMap = Swal.mixin({
	toast: true,
	position: 'center',
	showConfirmButton: false,
	timer: 2500,
	timerProgressBar: false,
	onOpen: (toast) => {
		toast.addEventListener('mouseenter', Swal.stopTimer);
		toast.addEventListener('mouseleave', Swal.resumeTimer);
	}
});

function ShowMapError(text)
{
	ToastMap.fire({
		title: text
	});
}

// клик по кнопке Locate me
jdoc.on('click', '#ymaps_locate', function (e) {
	e.preventDefault();

	map.locate({ setView: true, maxZoom: 17 })
		.on('locationfound',function (e)
		{
				if(map.hasLayer(me_marker))
				{
					map.removeLayer(me_marker);
				}

				me_marker = L.featureGroup();

				var me_circle = L.circle([0, 0], {
					color: "#0066FF",
					fillColor: "#0066FF",
					fillOpacity: 0.5,
					radius: 11.0
				}).addTo(me_marker);

				me_circle.setLatLng(e.latlng).bindTooltip("Вы находитесь здесь", {
					permanent: true,
					direction: 'top',
					opacity: 1
				});

				map.addLayer(me_marker);
		})
		.on('locationerror', function(e){
			ShowMapError('Не удалось получить ваше местоположение');
		});
});

function init_map()
{
	// min zoom level

	var min_zoom = 11;

	if (window.page.subtype === 'hotel')
	{
		min_zoom = 13;
	}

	// yandex map options
	L.Yandex = L.Yandex.extend({
		options: {
			type: 'yandex#map', // 'map', 'satellite', 'hybrid', 'map~vector' | 'overlay', 'skeleton'
			mapOptions: {
				suppressMapOpenBlock: true,
				suppressObsoleteBrowserNotifier: true,
				autoFitToViewport: 'always',
				exitFullscreenByEsc: true,
				yandexMapDisablePoiInteractivity: true
			},
			overlayOpacity: 0.8,
			minZoom: min_zoom,
			maxZoom: 19
		}});

	// yandex map onload
	L.Yandex.addInitHook('on', 'load', function () {
		map_loaded = true;
		loadMarkers();
	});

	// leaflet bug - disable zoom animation in Firefox
	var zoom_animation = true, isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	if (isFirefox) zoom_animation = false;

	// create leaflet map
	var defaultZoom = 16;

	if (window.page.subtype === 'hotel')
	{
		defaultZoom = 17;
	}

	map = L.map('map-page', {
		center: center,
		zoom: defaultZoom,
		zoomAnimation: zoom_animation
	});

	// clear leaflet attribution
	map.attributionControl
		.setPosition('bottomleft')
		.setPrefix('');

	// locate me button
	var locateControl =  L.Control.extend({
		options: {
			position: 'topleft'
		},
		onAdd: function (map) {

			var parent = L.DomUtil.create('div');
			parent.classList.add('leaflet-bar');
			parent.classList.add('easy-button-container');
			parent.classList.add('leaflet-control');

			var button = document.createElement('button');
			button.id = "ymaps_locate";
			button.classList.add('easy-button-button');
			button.classList.add('cursor-pointer');
			button.title="Определить моё местоположение";
			button.innerHTML = "&nbsp;";
			button.style.backgroundOrigin = 'content-box';
			button.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 511.998 511.998'%3E%3Cdefs/%3E%3Cpath d='M505.743 6.249c-6.08-6.101-15.211-7.893-23.168-4.672l-469.333 192C4.474 197.182-.881 206.121.122 215.55a21.33 21.33 0 0017.387 18.773l220.139 40.021 40.043 220.139c1.685 9.323 9.323 16.405 18.752 17.408.747.064 1.493.107 2.219.107 8.576 0 16.448-5.184 19.755-13.269l192-469.333a21.34 21.34 0 00-4.674-23.147z'/%3E%3C/svg%3E\")";
				parent.appendChild(button);
			return parent;
		}
	});

	map.addControl(new locateControl());

	// custom icon
	var iconUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBkYXRhLW5hbWU9IkxheWVyIDEiIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48ZGVmcy8+PHBhdGggZmlsbD0iI2ZiNGE1OSIgZD0iTTEwMy44MSA0Ni4zMWE0OS4xNDUgNDkuMTQ1IDAgMDEtMy4wMyAxNS4yNWMtNi40NiAxOS0yMi4xNyA0My4zMi0zNi43OCA1OS45NC0xNC42MS0xNi42Mi0zMC4zMi00MC45NC0zNi43OC01OS45NGE0OS4xNDUgNDkuMTQ1IDAgMDEtMy4wMy0xNS4yNSAzOS44MSAzOS44MSAwIDAxNzkuNjIgMHoiLz48Y2lyY2xlIGN4PSI2NCIgY3k9IjQ2LjMwOCIgcj0iMTkuOTA0IiBmaWxsPSIjZjJmMmYyIi8+PC9zdmc+';

		iconSvg = L.icon({
			iconUrl: iconUrl,
			shadowUrl: '/images/marker-shadow.png',

			iconSize:     [45, 45],
			shadowSize:   [45, 45],
			iconAnchor:   [23, 45],
			shadowAnchor: [15, 46],
			popupAnchor:  [-1, -40] // point from which the popup should open relative to the iconAnchor
		});

	// marker cluster init
	markersLayer = L.markerClusterGroup({
		disableClusteringAtZoom: 20,
		maxClusterRadius: 40,
		removeOutsideVisibleBounds: true,
		spiderfyDistanceMultiplier: 1.2
	});

	// map events
	map.on('dragend', function(e) {
		if (e.distance > 15)
		{
			if (window.page.subtype === 'hotel')
			{
				map.closePopup();
			}

			loadMarkers();
		}
	});

	map.on('zoomend', function() {
		loadMarkers();
	});

	map.on('movestart', function(e) {
		if (!was_movement) was_movement = true;
		ToastMap.close();
	});

	// attach yandex to leaflet
	L.yandex({ controlsContainerStyle: false }).on('load',function () {
		var container = this._yandex.container;

		//container.events.add('actiontick',function (e) {});

	}).addTo(map);
}

function makeMarker(company)
{
	// проверим, нет ли уже такого маркера
	if (markers_loaded.indexOf(company.id) !== -1)
	{
		return;
	}

	// создадим балун
	var cats, rev_word = '', rev_word_text = 'Нет отзывов', rating_word = '', contacts = '', rating_bg,
		url = '/' + company.country_slug + '/' + company.city_slug + '/' + company.name_slug;

	if (company.surname !== 'undefined' && company.surname !== null)
	{
		cats = "<span class=\"mtk\">" + company.surname + "</span>";
	}
	else
	{
		cats = "<span class=\"mtk\">" + window.page.cat_name + "</span>";
	}

	if (typeof company.contacts != 'undefined' && company.contacts.length)
	{
		contacts = "<div class=\"map-tooltip-phone\"><span class=\"mtt\">Телефон</span>";

		$.each(company.contacts, function(index, cc) {

			contacts += "<a href=\"tel:" + cc.href + "\" class=\"map-tooltip-number\" title=\"Позвонить\">" + cc.tel + "</a>";
		});

		contacts += '</div>';
	}

	if (company.rating_avg > 0)
	{
		if (company.rating_avg >= 4) rating_bg = 'bg-green';
		if (company.rating_avg < 3) rating_bg = 'bg-red';

		rating_word = "<span class=\"map-rate-card " + rating_bg + "\">" + company.rating_avg + "</span>";
	}

	if (company.reviews_number > 0)
	{
		rev_word = "<span class=\"mtr\">" + company.reviews_number_word + "</span>";
		rev_word_text = company.reviews_number_word;
	}

	var popup = "<div class=\"map-tooltip-name\"><a href=\"" + url + "\" target=\"_blank\" title=\"" + company.name + "\" class=\"link-color\">" + company.name + "</a>" + cats + rating_word + rev_word + "</div>" +  contacts + "<div class=\"map-tooltip-address\"><span class=\"mtt\">Адрес</span><span class=\"span_3_of_5\">" + company.city_ns_safe + ', ' + company.address_safe + "</span></div>";
	popup = popup.replace(/(\r\n|\n|\r)/gm, " ");

	// создадим маркер и привяжем к нему балун
	var marker = new L.Marker(new L.LatLng(company.lat, company.lon), {icon: iconSvg}).bindPopup(popup);

	// добавим id компании в уже загруженные
	markers_loaded.push(company.id);

	// добавим маркер в кластер
	markersLayer.addLayer(marker);

	// для показа балуна после загрузки
	if (company.id == window.page.from_id)
	{
		from_id_marker = marker;
	}

	// тултип с рейтингом
	if (company.rating_avg > 0)
	{
		marker.bindTooltip('<span class="map-small-rating ' + rating_bg + '">' + company.rating_avg + '</span> ' + rev_word_text,
			{
				permanent: true,
				direction: 'bottom',
				opacity: 1,
			})
	}

	// события
	marker.on('mouseover', function (e) {
		if (!this.getPopup().isOpen())
		{
			this.openPopup();
		}
	});

	marker.on('click', function (e) {
		if (!this.getPopup().isOpen())
		{
			this.openPopup();
		}
	});

	marker.on('popupopen', function (e) {
		this.closeTooltip();

		// deselect text
		if (window.getSelection) {window.getSelection().removeAllRanges();}
		else if (document.selection) {document.selection.empty();}
	});

	marker.on('popupclose', function (e) {
		this.openTooltip();
	});
}

function makeHotelMarker(company)
{
	// проверим, нет ли уже такого маркера
	if (markers_loaded.indexOf(company.id) !== -1)
	{
		return;
	}

	// создадим балун
	var cats = '', type = company.hotel_type, cc = company.country_ru, city = company.city_ru, rev_word = '', rev_word_text = 'Нет отзывов', rating_word = '', contacts = '', rating_bg,
		url = '/hotels/' + company.country_slug + '/' + company.city_slug + '/' + company.name_slug;

	if (city == null)
	{
		city = '';
	}

	if (cc == null)
	{
		city = '';
	}

	if (city.length > 1 && cc.length > 1)
	{
		city = ', ' + city;
	}

	if (type == null)
	{
		type = cc + city;
	}

	//cats = "<span class=\"mtk\">" + cc + city + "</span>";
	cats = "<span class=\"mtk\">" + type + "</span>";
	cats += "<span class=\"mtk load-photo\" data-owner-hash=\"" + company.hash + "\"><span class=\"hotel_image_placeholder himg\"></span></span>";

	if (company.rating_avg > 0)
	{
		if (company.rating_avg >= 3.5) rating_bg = 'bg-green';
		if (company.rating_avg < 3.5) rating_bg = 'bg-red';

		rating_word = "<span class=\"map-rate-card " + rating_bg + "\">" + company.rating_avg + "</span>";
	}

	if (company.reviews_number > 0)
	{
		rev_word = "<span class=\"mtr\">" + company.reviews_number_word + "</span>";
		rev_word_text = company.reviews_number_word;
	}

	// Popup
	var popup = "<div class=\"map-tooltip-name\"><a href=\"" + url + "\" target=\"_blank\" class=\"popup-link\" title=\"" + company.name + "\" class=\"link-color\">" + company.name_wstar + "</a>" + cats + rating_word + rev_word + "</div>" +  contacts + "<div class=\"map-tooltip-address\"><span class=\"mtt\">Адрес</span><span class=\"span_3_of_5\">" + company.full_address + "</span></div>";
	popup = popup.replace(/(\r\n|\n|\r)/gm, " ");

	var popup_el = L.popup({keepInView: true, autoPanPaddingTopLeft: [50, 25]}).setContent(popup);
	//var popup_el = L.popup({autoPanPaddingTopLeft: [5, 100]}).setContent(popup);

	// создадим маркер и привяжем к нему балун
	var marker = new L.Marker(new L.LatLng(company.lat, company.lon), {icon: iconSvg}).bindPopup(popup_el);

	// добавим id компании в уже загруженные
	markers_loaded.push(company.id);

	// добавим маркер в кластер
	markersLayer.addLayer(marker);

	// для показа балуна после загрузки
	if (company.id == window.page.from_id)
	{
		from_id_marker = marker;
	}

	// тултип с рейтингом
	if (company.rating_avg > 0)
	{
		marker.bindTooltip('<span class="map-small-rating ' + rating_bg + '">' + company.rating_avg + '</span> ' + rev_word_text,
			{
				permanent: true,
				direction: 'bottom',
				opacity: 1,
			})
	}

	// события
	marker.on('mouseover', function (e) {
		if (!this.getPopup().isOpen())
		{
			this.openPopup();
		}
	});

	marker.on('click', function (e) {
		if (!this.getPopup().isOpen())
		{
			this.openPopup();
		}
	});

	marker.on('popupopen', function (e) {

		this.closeTooltip();

		// deselect text
		if (window.getSelection) {window.getSelection().removeAllRanges();}
		else if (document.selection) {document.selection.empty();}

		// загрузим фото отеля при открытии тултипа
		var popup = this.getPopup(),
			t = $(popup.getContent()),
			thumb_virtual = t.find('.hotel_image_placeholder'),
			parent_virtual = thumb_virtual.closest('.load-photo'),
			href = t.find('a.popup-link').attr('href'),
			owner_hash = parent_virtual.data('owner-hash'),
			parent = $('span.load-photo[data-owner-hash=' + owner_hash + ']'),
			thumb = parent.find('.hotel_image_placeholder');

		$.when(getToken())
			.done(function (tk) {

				$.ajax({
					type: "POST",
					cache: false,
					url: '/api/ajax/load_hotel_map_photo',
					data: {
						token: tk,
						hash: owner_hash
					},
					})
					.done(function (data) {

						var result = String(data).match(/({"status".*"})/gm);

						if (isJSON(result)) {
							var r = JSON.parse(result);

							if (r.status === 'error') {
								parent.remove();
							}

							if (r.status === 'success') {

								var new_photos = JSON.parse(r.info);

								// удалим заглушку
								thumb.remove();

								// создадим новый элемент
								if (new_photos[0]['filename_enlarge'].length)
								{
									var link = document.createElement('a');
									link.setAttribute('href', href);
									link.setAttribute('target', '_blank');

									var image = document.createElement('img');
									image.src = window.page.ugc_cdn_hotels + new_photos[0]['filename_enlarge'];
									image.classList.add('hotel_map_photo');
									image.classList.add('himg');

									link.append(image);
								}
								else
								{
									parent.remove();
									return;
								}

								// добавим его вместо заглушки
								parent.replaceWith(link);

								// удалим класс с анимацией загрузки после полной загрузки img
								$('.himg').imgLoad(function () {
									$(this).removeClass('himg');
								});
							}

						}
						else {
							parent.remove();
						}

					})
					.fail(function () {
						parent.remove();
					});
			})
			.fail(function () {
				parent.remove();
		});

	});

	marker.on('popupclose', function (e) {
		this.openTooltip();
	});
}


function loadMarkers() {

	var bounds = map.getBounds(),
		bbox = [
			bounds._southWest.lng,
			bounds._southWest.lat,
			bounds._northEast.lng,
			bounds._northEast.lat
		],
		bbox_polygon = Turf.bboxPolygon(bbox),
		err = 'Ошибка. Пожалуйста, попробуйте ещё раз',
		err404 = 'В этой области ничего не найдено',
		errLimit = 'Найдено слишком много мест. Уменьшите масштаб, чтобы увидеть больше.';

	// проверим, не закеширована ли данная координатная область
	if (cached_area === false)
	{
		cached_area = bbox_polygon;
	}
	else
	{
		if (contains_multipolygon(cached_area, bbox_polygon))
		{
			return;
		}
	}

	map_loader.show();

	$.when(getToken())
		.done(function(tk)
		{
			// получим данные о компания в этой координатной области
			$.ajax({
				type     : "POST",
				cache    : false,
				url      : '/api/geo',
				data     : {
					token: tk,
					page_type: window.page.type,
					page_subtype: window.page.subtype,
					cat_id: window.page.cat_id,
					country: window.page.country,
					minLon: bounds._southWest.lng,
					minLat: bounds._southWest.lat,
					maxLon: bounds._northEast.lng,
					maxLat: bounds._northEast.lat,
				},
				})
				.done(function(data)
				{
					var result = String(data).match(/({"status".*"})/gm);

					if (isJSON(result))
					{
						var r = JSON.parse(result);

						if (r.status === 'error')
						{
							ShowMapError(err);
							return;
						}

						if (r.status === 'notfound')
						{
							// закешируем эту координатную область
							if (cached_area !== false)
							{
								cached_area = Turf.union(cached_area, bbox_polygon);
							}

							ShowMapError(err404);
							return;
						}

						if (r.status === 'success')
						{
							map_loader.hide();

							// распарсим данные о компаниях
							if (typeof r.info !== 'undefined' && isJSON(r.info))
							{
								var companies = JSON.parse(r.info),
									count = 0;

								$.each(companies, function(index, company) {

									if (window.page.subtype === 'hotel')
									{
										makeHotelMarker(company);
									}
									else
									{
										makeMarker(company);
									}

									count++;
								});

								if (count >= window.page.load_limit) ShowMapError(errLimit);

								// закешируем эту координатную область
								if (cached_area !== false && count < window.page.load_limit)
								{
									cached_area = Turf.union(cached_area, bbox_polygon);
								}

								map.addLayer(markersLayer);

								// откроем маркер from_id, если первая загрузка
								if (!was_movement && window.page.from_id > 0) from_id_marker.openPopup();
							}
							else
							{
								ShowMapError(err404);
							}
						}
					}
					else
					{
						ShowMapError(err404);
					}

				})
				.fail(function()
				{
					ShowMapError(err);
				})
				.always(function()
				{
					map_loader.hide();
					//$('#button-leaflet-research').hide();
				});
		})
		.fail(function()
		{
			ShowMapError(err);
		});
}

init_map();
// get fp
function getFp() {

	try
	{
		Fingerprint2.get({
				fonts: {
					swfContainerId: '',
					swfPath: ''
				},
				excludes: {
					'webgl': true,
					'enumerateDevices': true,
					'webdriver': true,
					'pixelRatio': true,
					'doNotTrack': true,
					'fontsFlash': true
				},
				preprocessor: function(key, value) {

					// Transfrom UA to only: OS Browser
					if (key === "userAgent")
					{
						var parser = new UAParser(value);
						return parser.getOS().name + ' ' + parser.getBrowser().name;
					}

					return value;
				}
			},
			(components) => {

				// remove deviceMemory
				components.splice(components.findIndex(i => i.key === 'deviceMemory'), 1);

				// remove EnumerateDevices
				components.splice(components.findIndex(i => i.key === 'enumerateDevices'), 1);

				var values = components.map((component) => {
					return component.value
				});

				if (typeof values === 'object' && values !== null) {
					window.page.fp = Fingerprint2.x64hash128(values.join(''), 31);
				}
			});
	}
	catch (err)
	{
	}
}

if (window.requestIdleCallback)
{
	requestIdleCallback(function () { getFp(); })
}
else
{
	setTimeout(function () { getFp(); }, 500)
}

// update js
var deleted = {},
	schedule = {},
	initialBackOffices = [],
	backOffices = [],
	changedOffice = [],
	days = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
	]

deleted['categories'] = []
deleted['telephone'] = []
deleted['fax'] = []
deleted['email'] = []
deleted['site'] = []
deleted['video-link'] = []
deleted['backOffices'] = []

$.extend($.validator.messages, {
	required: "Это поле обязательное",
	remote: "Пожалуйста, исправьте это поле",
	email: "Введите корректный e-mail",
	url: "Введите корректный URL",
	number: "Введите коректное число",
	digits: "Можно вводить только цифры"
});
autosize($('textarea'));

ymaps.load(function() {
	let s_el = $('.js-select__b-office option'), initialOptionsLength = s_el.length;

	s_el.each(function(index, elem) {
		let officeId = $(elem).data('id');
		// метод который отдает инфу о филиалах по id
		$.ajax({
			type: "POST",
			cache: false,
			url: 'https://rubrikator.local/api/ajax/load_filials',
			data: {
				token: 'tk',
				page_type: window.page.type,
				owner_id: window.page.id,
				id: officeId
			},
			})
			.done(function(data) {
				var result = String(data).match(/({"status".*"})/gm);

				if (isJSON(result)) {
					var r = JSON.parse(result);

					if (r.status === 'success') {
						var info = JSON.parse(r.info);
						initialBackOffices.push(info);
						backOffices.push(info);
						changedOffice.push(info);
					}
				}

				if (initialOptionsLength === index + 1) {
					init()
				}
			});

	});
});

function init() {

	const initialHash = []
	for (i in initialBackOffices) {
		let hash = objectHash(Object.values(initialBackOffices[i]));
		initialHash.push(hash)
	}

	var officeMap = new ymaps.Map("mapDrag", {
		center: [55.76, 37.64],
		zoom: 10,
		controls: ['zoomControl', 'fullscreenControl']
	}, {
		searchControlProvider: 'yandex#search'
	})

	//функция связывания инпута адрес и точки на карте
	async function setCoords() {

		let address_input = $('#update-address');
		let office = $('.js-select__b-office').val();
		let address = '' + address_input.val() + '';

		var mapCaption = $('.panel__settings-map-caption'),
			mapCaptionOldVal = mapCaption.html();

		mapCaption.html('Обновляется <div class="loader"></div>');
		officeMap.geoObjects.removeAll();

		ymaps.geocode(address, {
			results: 1
			})
			.then(async function (res)
			{

				mapCaption.html(mapCaptionOldVal);

			if (res.geoObjects.get(0) != undefined) {
				var GeoObject = res.geoObjects.get(0)
				var coords = GeoObject.geometry.getCoordinates()
				var myPlacemark = new ymaps.Placemark(coords, null, {
					preset: 'islands#redDotIcon',
					draggable: true
				});

				myPlacemark.events.add('dragend', async function (e) {

					address_input.attr('disabled', true);
					address_input.addClass('is-loading');
					address_input.val('Определяю новый адрес..');
					mapCaption.html('Обновляется <div class="loader"></div>');

					var newCords = e.get('target').geometry.getCoordinates();
					ymaps.geocode(newCords, {
						results: 1
					}).then(async function (res) {
						var geoObject = res.geoObjects.get(0)
						var address = geoObject.getAddressLine()
						var coords = geoObject.geometry.getCoordinates()

						mapCaption.html(mapCaptionOldVal);
						address_input.attr('disabled', false);
						address_input.removeClass('is-loading');
						address_input.data('ttTypeahead').input.setQuery(address, true);
						address_input.fadeOut(150).fadeIn(150);

						for (let i in backOffices) {
							if (backOffices[i]['name'] == office) {
								backOffices[i]['coords']['latitude'] = coords[1]
								backOffices[i]['coords']['longitude'] =  coords[0]
								backOffices[i]['address'] = address
								backOffices[i]['address_was_changed'] = true
								backOffices[i]['address_parts'] = await getAddressPartsYandex(address)
							}
						}
					})
					.fail(function () {
						address_input.attr('disabled', false);
						address_input.removeClass('is-loading');
						address_input.data('ttTypeahead').input.setQuery('Не удалось определить адрес', true);
						address_input.fadeOut(150).fadeIn(150);
					})

				});

				officeMap.geoObjects.removeAll()
				officeMap.geoObjects.add(myPlacemark);
				officeMap.setCenter(coords, 16)

				for (let i in backOffices) {
					if (backOffices[i]['name'] == office) {
						backOffices[i]['coords']['latitude'] =  coords[1]
						backOffices[i]['coords']['longitude'] =  coords[0]
						backOffices[i]['address'] = address
						backOffices[i]['address_was_changed'] = true
						backOffices[i]['address_parts'] = await getAddressPartsYandex(address)

					}
				}
			} else {
				let office = $('.js-select__b-office').val()
				for (let i in backOffices) {
					if (backOffices[i]['name'] == office) {
						backOffices[i]['coords']['latitude'] = 'not_found'
						backOffices[i]['coords']['longitude'] = 'not_found'
						backOffices[i]['address'] = address_input.val()
						backOffices[i]['address_was_changed'] = true
						backOffices[i]['address_parts'] = await getAddressPartsYandex(address_input.val())
					}
				}
			}
			})
			.fail(function(){
				mapCaption.html(mapCaptionOldVal);
			});
	}

	//Автозаполнение адреса
	let token = "e42b1ce121984f1fba3256837f67e961b2982b05";
	var addresses = new Bloodhound({
		datumTokenizer: function (addresses) {
			return Bloodhound.tokenizers.whitespace('value');
		},
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		remote: {
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
				"Authorization": "Token " + token,
			},
			body: JSON.stringify({query: $('#update-address').val(), count: 5, language: 'ru',}),
			url: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
			replace: function (url, uriEncodedQuery) {
				return 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address?token=' + token + '&query=' + 	$('#update-address').val()
			},
			filter: function (response) {
				return response.suggestions
			}
		}
	})
	addresses.initialize();

	$('#update-address').typeahead({
			hint: true,
			highlight: true,
			minLength: 1
			},
			{
			name: 'addresses',
			displayKey: function (value) {
				return value.value
			},
			source: addresses.ttAdapter(),
			templates: {
				suggestion: function (data) {
					return '<li>' +
						'<div class="ui-search__item">' +
						'<span class="ui-search__item-text">' +
						'' + data['value'] + '' +
						'</span>' +
						'</div>' +
						'</li>'
				}
			}
		})
		.on('typeahead:selected', function (event, data) {
			setCoords()
		})
		.on('typeahead:asyncrequest', function () {
			$('#search-loader-2').removeClass('hidden').css('opacity', 1).css('visibility', 'visible');
		})
		.on('typeahead:asynccancel typeahead:asyncreceive', function () {
			$('#search-loader-2').addClass('hidden').css('opacity', 0).css('visibility', 'hidden');
		});

	//если пользователь захочет ввести адрес который не найдется в дадате и в яндексе
	$('#update-address').change(function () {
		setCoords()
	})

	//подставляю данные из выбранного филиала в селекты
	function showSelectedAddress() {
		let officeAddress = $('.js-select__b-office').val();
		for (let office in backOffices) {
			if (backOffices[office]['name'] == officeAddress) {
				$('#update-address').data('ttTypeahead').input.setQuery(backOffices[office]['address'], true);
				$('#update-address-floor').val(backOffices[office]['floor']);
				$('#update-address-office').val(backOffices[office]['office']);
				$('#update-address-additional').val(backOffices[office]['additional']);
				$('.backoffice-label').html($('.js-select__b-office').val())
				officeMap.geoObjects.removeAll();

				for (var day in days) {
				    if (backOffices[office]['schedule'][days[day]]['not_working'] == false || backOffices[office]['schedule'][days[day]]['not_working'] == undefined) {

				        let input = $('.js-worktime-checkbox').eq(+day)

				        if (input.is(':checked') == false)
				            input.trigger('click')

				        if (backOffices[office]['schedule'][days[day]]['aroundClock'] == true) {
				            let input = $('#time-0' + day).find('.ui-check__input')
				            if (input.is(':checked') == false)
				                input.trigger('click')
				        } else {
				            let input = $('#time-0' + day).find('.ui-check__input')
				            if (input.is(':checked') == true)
				                input.trigger('click')

				            $('#time-0' + day).find('.js-select').first().val(''+backOffices[office]['schedule'][days[day]]['from']+'').trigger('change').selectric('refresh');

				            $('#time-0' + day).find('.js-select').last().val(''+backOffices[office]['schedule'][days[day]]['to']+'').trigger('change').selectric('refresh');
				        }

				        if (backOffices[office]['schedule'][days[day]]['no_break'] == true) {
				            let input = $('#break-0' + day).find('.ui-check__input')
				            if (input.is(':checked') == false) {
				                input.trigger('click')
				            }
				        } else {
				            if (backOffices[office]['schedule'][days[day]]['no_break'] == undefined) {
				                let input = $('#break-0' + day).find('.ui-check__input')
				                if (input.is(':checked') == true)
				                    input.trigger('click')
				                $('#break-0' + day).find('.js-select').first().val(''+backOffices[office]['schedule'][days[day]]['break_from']).trigger('change'+'').selectric('refresh');
				                $('#break-0' + day).find('.js-select').last().val(''+backOffices[office]['schedule'][days[day]]['break_to']).trigger('change'+'').selectric('refresh');
				            }
				        }
				    } else {
				        let input = $('.js-worktime-checkbox').eq(+day)
				        if (input.is(':checked'))
				            input.trigger('click')
				    }
				}

				setCoords()

				// blink
				$('#update-address, #update-address-floor, #update-address-office, #update-address-additional, .backoffice-label').fadeOut(150).fadeIn(150);

			}
		}
	}

	showSelectedAddress()

	// Автозаполнение для поля поиска организации
	var firm_search = new Bloodhound({
		datumTokenizer: function () {
			return Bloodhound.tokenizers.whitespace('value');
		},
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		remote: {
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
				"Authorization": "Token " + token,
			},
			body: JSON.stringify({query: $('#update-person').val(), count: 20, language: 'ru',}),
			url: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party',
			replace: function (url, uriEncodedQuery) {
				return 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party?token=' + token + '&query=' + 	$('#update-person').val() + '&count=20'
			},
			filter: function (response) {
				return response.suggestions
			}
		}
	})

	firm_search.initialize();

	$('#update-person').typeahead({
			limit: 20,
			hint: true,
			highlight: true,
			minLength: 1
			},
			{
			limit: 19,
			name: 'firm_search',
			displayKey: function (value) {
				return value.value
			},
			source: firm_search.ttAdapter(),
			templates: {
				suggestion: function (data) {
					return '<li>' +
						'<div class="ui-search__item">' +
						'<span class="ui-search__item-text">' +
						'' + data['value'] + ' (' + data['data']['address']['value'] + ') ' +
						'</span>' +
						'</div>' +
						'</li>'
				}
			}
		})
		.on('typeahead:selected', function (event, data) {

			var ogrn_input = $('#update-ogrn'),
				inn_input = $('#update-inn');

			ogrn_input.val(data['data']['ogrn']);
			inn_input.val(data['data']['inn']);

			ogrn_input.fadeOut(150).fadeIn(150);
			inn_input.fadeOut(150).fadeIn(150);

			// заполним поле "адрес" если оно пустое
			if ($('#update-address').val().length < 1)
			{
				$('#update-address').data('ttTypeahead').input.setQuery(data['data']['address']['value'], true);
				setCoords()
			}
		})
		.on('typeahead:asyncrequest', function () {
			$('#search-loader-3').removeClass('hidden').css('opacity', 1).css('visibility', 'visible');
		})
		.on('typeahead:asynccancel typeahead:asyncreceive', function () {
			$('#search-loader-3').addClass('hidden').css('opacity', 0).css('visibility', 'hidden');
		});


	//    сравниваю хеш изначального обьекта с текущим
	$('.change-watch').on('change', function () {
		let office = $('.js-select__b-office').val()
		for (let i in backOffices) {
			if (backOffices[i]['name'] == office && initialHash[i]) {
				let hash = objectHash(Object.values(backOffices[i]));
				let selectDropdown = $('.ui-selectric-js-select__b-office .ui-selectric-scroll .selected')
				if (hash !== initialHash[i]) {
					changedOffice[i]['changed'] = true
					if (selectDropdown.find('.changed-address').length == 0) {
						let changeNotif = $('<span class="changed-address"> (изменено)</span>')
						selectDropdown.append(changeNotif)
					}
				} else {
					changedOffice[i]['changed'] = false
					selectDropdown.find('.changed-address').remove()
				}
			}
		}
	})

	//заполняю поля времени работы в массиве с филиалами по событию change
	$('.ui-worktime__row').each(function (index, elem) {
		$(this).change(function () {
			let backOfficeName = $('.js-select__b-office').val()
			for (let i in backOffices) {
				if (backOffices[i]['name'] == backOfficeName) {
					if ($(this).find('.js-worktime-checkbox').is(":checked") == false) {
						backOffices[i]['schedule']['' + days[index] + '']['not_working'] = true
					} else {
						backOffices[i]['schedule']['' + days[index] + '']['not_working'] = false;

						if ($(this).find('.ui-worktime__period-content[id *= "time"]').find('.ui-check__input').is(':checked')) {
							backOffices[i]['schedule']['' + days[index] + '']['aroundClock'] = true;
						} else {
							backOffices[i]['schedule']['' + days[index] + '']['aroundClock'] = false;
							backOffices[i]['schedule']['' + days[index] + '']['from'] = $(this).find('.ui-worktime__period-content[id *= "time"]').find('.js-select').first().val();
							backOffices[i]['schedule']['' + days[index] + '']['to'] = $(this).find('.ui-worktime__period-content[id *= "time"]').find('.js-select').last().val();
						}

						if ($(this).find('.ui-worktime__period-content[id *= "break"]').find('.ui-check__input').is(':checked')) {
							backOffices[i]['schedule']['' + days[index] + '']['no_break'] = true
						} else {
							backOffices[i]['schedule']['' + days[index] + '']['no_break'] = false
							backOffices[i]['schedule']['' + days[index] + '']['break_from'] = $(this).find('.ui-worktime__period-content[id *= "break"]').find('.js-select').first().val();
							backOffices[i]['schedule']['' + days[index] + '']['break_to'] = $(this).find('.ui-worktime__period-content[id *= "break"]').find('.js-select').last().val();
						}
						backOffices[i]['schedule']['' + days[index] + '']['comment'] = $(this).find('.ui-input--40').val()
					}
				}
			}

		})
	})
	//заполняю остальнын поля по событию change
	$('#update-address-floor').change(function () {
		let office = $('.js-select__b-office').val()
		for (let i in backOffices) {
			if (backOffices[i]['name'] == office) {
				backOffices[i]['floor'] = $(this).val()
			}
		}
	})
	$('#update-address-office').change(function () {
		let office = $('.js-select__b-office').val()
		for (let i in backOffices) {
			if (backOffices[i]['name'] == office) {
				backOffices[i]['office'] = $(this).val()
			}
		}


	})
	$('#update-address-additional').change(function () {
		let office = $('.js-select__b-office').val()
		for (let i in backOffices) {
			if (backOffices[i]['name'] == office) {
				backOffices[i]['additional'] = $(this).val()
			}
		}


	})


	//показываю что инпут
	var newOfficeIndex = 1

	//Добавление нового офиса
	$('.btn__add-office').click(function () {
		let newOffice = {
			'name': 'Новый филиал #' + newOfficeIndex,
			'address': '',
			'floor': '',
			'office': '',
			'additional': '',
			'id': '0',
			'coords': {
				'longitude': 55.763761,
				'latitude': 37.621732
			},
			"schedule": {
				'tuesday': {'not_working': true},
				'monday': {'not_working': true},
				'thursday': {'not_working': true},
				'wednesday': {'not_working': true},
				'friday': {'not_working': true},
				'saturday': {'not_working': true},
				'sunday': {'not_working': true},
			}
		}
		backOffices.push(newOffice)
		$('.js-select__b-office').append('<option data-id="">Новый филиал #' + newOfficeIndex + '</option>').val('Новый филиал #' + newOfficeIndex + '').selectric('refresh');
		$('.ui-selectric-js-select__b-office .ui-selectric-scroll ul li').each(function () {
			for (i in backOffices) {
				if ($(this).text() == backOffices[i]['name'] && changedOffice[i] !== undefined && changedOffice[i]['changed'] == true) {
					let changeNotif = $('<span class="changed-address"> (изменено)</span>')
					$(this).append(changeNotif)
				}
			}
		})
		$('.update-address').focus()
		showSelectedAddress()
		newOfficeIndex += 1
		officeMap.setCenter([55.763761, 37.621732], 10)
	})

	// Удаление офиса
	// window.Swal = swal;
	$('.btn__delete-office').click(function () {
		Swal.fire({
			title: 'Удалить этот филал?',
			showCancelButton: true,
			confirmButtonText: 'Удалить',
			cancelButtonText: 'Отмена'
			})
			.then((result) => {
				if (result['value']) {
					let officeSelect = $('.js-select__b-office');
					//TODO можно убрать условие если хотите разрешить удалять все филиалы
					if ($('.js-select__b-office option').length > 1) {
						let deletedOffice = officeSelect.val()
						$(".js-select__b-office option").each(function () {
							if ($(this).val() == deletedOffice) {
								$(this).remove();
							}
						})
						officeSelect.val($('.js-select__b-office option').val()).trigger('change').selectric('refresh')
						$('.ui-selectric-js-select__b-office .ui-selectric-scroll ul li').each(function () {
							for (i in backOffices) {
								if ($(this).text() == backOffices[i]['name'] && changedOffice[i] !== undefined && changedOffice[i]['changed'] == true) {
									let changeNotif = $('<span class="changed-address"> (изменено)</span>')
									$(this).append(changeNotif)
								}
							}
						})
						if ($('.js-select__b-office .selected').data('id') != '') {
							for (let i in backOffices) {
								if (backOffices[i]['name'] == deletedOffice) {
									deleted['backOffices'].push(backOffices[i])
									delete backOffices[i]
								}
							}
						} else {
							for (let i in backOffices) {
								if (backOffices[i]['name'] == deletedOffice) {
									delete backOffices[i]
								}
							}

						}
					}
					else
					{
						alrt('Нельзя удалить единственный филиал');
					}
				}
			});
	})
	//Выбор офиса
	jdoc.on('change', '.js-select__b-office', function (index, elem) {
		showSelectedAddress()
	})

	//перестраиваю размер карты при скрытии/показе этого блока
	$('.select-form').change(function () {
		officeMap.container.fitToViewport()
	})

	function updateBar() {
		var currentStep = 0;
		var fillingStep = Math.ceil((100 / $('.panel__bookmark-link').length));
		const progressBar = $('.ui-progress-bar');
		$('.progress-input').each(function() {
			if ($(this).val() !== '') {
				$('.panel__bookmark-link[href="#' + $(this).attr('id') + '"]').css('color', 'green');
				if (currentStep >= 100 || Math.ceil(currentStep + fillingStep) >= 100) {
					currentStep = 100
				} else {
					currentStep += fillingStep
				}
				progressBar.css('width', '' + currentStep + '%');
				progressBar.html(currentStep + '%')
			} else {
				$('.panel__bookmark-link[href="#' + $(this).attr('id') + '"]').css('color', 'grey');
			}
		})
	}

	jdoc.ready(function() {
		updateBar()
	});
}

async function getAddressPartsYandex(address)
{
	return await $.ajax({
			type: "GET",
			cache: false,
			url: 'https://geocode-maps.yandex.ru/1.x/',
			data: {
				apikey: window.page.yandex_maps_token,
				format: 'json',
				geocode: address
			},
		});
}

jdoc.on('click', '.ui-check', function (e) {

	var t = $(this), val = t.find('.ui-check__input').val();

	if (val === 'update') {
		$('#fast-menu').removeClass('hidden');
		$('#scrolltop').removeClass('hidden');
		$('#update-container').removeClass('hidden');

		// пересчитаем позицию стики блока
		jbody.trigger("sticky_kit:recalc");
	}
});

// --------------------------------------------------------------------------
// Worktime
// --------------------------------------------------------------------------

jdoc.on('change', '.js-worktime-checkbox', function () {

	if ($(this).is(':checked'))
	{
		$(this).closest('.js-worktime').addClass('is-active');
		$('.worktime-input').val('yes').trigger('change')
	}
	else
	{
		$(this).closest('.js-worktime').removeClass('is-active');
		$(this).closest('.js-worktime').find('.js-worktime-btn').removeClass('is-active');
		$(this).closest('.js-worktime').find('.js-worktime-content').hide();

		if ($('.js-worktime-checkbox').is(':checked') == false) {
			$('.worktime-input').val('').trigger('change')
		}
	}

});

jdoc.on('click', '.js-worktime-btn', function (e) {
	e.preventDefault();
	var targetId = $(this).data('target'),
		allSameButtons = $('.js-worktime-btn');

	$('.js-worktime-content').hide();

	if ($(this).is('.is-active')) {
		$(this).removeClass('is-active');
	} else {
		allSameButtons.removeClass('is-active');

		$(this).closest('.js-worktime').find('.js-worktime-btn').removeClass('is-active');
		$(this).addClass('is-active');
		$(this).closest('.js-worktime').find(targetId).show();
	}

});

jdoc.on('click', '.js-worktime-comment-btn, .js-worktime-comment-cancel', function (e) {
	e.preventDefault();

	if ($(this).closest('.js-worktime-comment').is('.is-open')) {

		$(this).closest('.js-worktime-comment').removeClass('is-open');

	} else {

		$(this).closest('.js-worktime-comment').addClass('is-open');
	}

});

// функция для добавления оффсета в 150 якорным ссылкам в плавающем блоке с прогресс баром
$('.panel__bookmark-link , .ui-taglist__link').each(function () {
	$(this).click(function () {
		if ($($(this).attr('href')).length == 0) {

			$('html, body').animate({
				scrollTop: $('.first-labels_' + $(this).attr('href').split('#')[1]).offset().top - 150
			}, 200);
		} else {
			$('html, body').animate({
				scrollTop: $($(this).attr('href')).offset().top - 150
			}, 200);
		}
	})
})

$(document).ready(function () {

	var submit_button = $('#submit'),
		submit_checkbox = $('#submit_checkbox'),
		prices = $('.price');

	// set prices
	prices.html(window.page.prices.update);

	// set SUBMIT button active
	submit_button.attr('disabled', false);
	submit_button.removeClass('is-loading-right');
	submit_checkbox.attr('disabled', false);

	$('.loader__wrapper').remove()
	$('.js-select__b-office').trigger('change')

	//выбор заявки
	$('.select-form').change(function () {
		$('.panel__settings-group').show()
		$('.l__wrapper').removeClass('hidden')
		switch ($(this).val()) {
			case 'update':

				$('.change_address').removeClass('no-after');
				$('.pm-comment').removeClass('no-after');

				$('#fast-menu').removeClass('hidden');
				$('#scrolltop').removeClass('hidden');
				$('#update-container').removeClass('hidden');

				$('.company-info .panel__settings').children().show();
				$('.l__sidebar').show();

				jbody.trigger("sticky_kit:recalc");

				break
			case 'transfer':
				$('.change_address').addClass('no-after');
				$('.company-info .panel__settings').children().show()
				$('.l__sidebar').hide()
				break
			case 'closed_temp':
				$('.pm-comment').addClass('no-after');
				$('.company-info .panel__settings').children().show()
				$('.l__sidebar').hide()
				break
			case 'closed':
				$('.pm-comment').addClass('no-after');
				$('.company-info .panel__settings').children().show()
				$('.l__sidebar').hide()
				break

		}

	})
	//если пользователь нажал на радиобатон выбора типа заявки то загрузки скриптов

	//Стайлинг списка над прогресс баром  и его самого в зависимости от заполнения полей
	// связано по дата-атрибуту, но можно и вручную выбирать по  id так будет чуточку быстрей но менее универсально
	$('.company-info').validate()
	const progressBar = $('.ui-progress-bar');
	var fillingStep = Math.ceil((100 / $('.panel__bookmark-link').length));

	function updateBar() {
		var currentStep = 0;
		$('.progress-input').each(function() {

			if ($(this).val() !== '') {
				$('.panel__bookmark-link[href="#' + $(this).attr('id') + '"]').css('color', 'green');
				if (currentStep >= 100 || Math.ceil(currentStep + fillingStep) >= 100) {
					currentStep = 100
				} else {
					currentStep += fillingStep
				}
				progressBar.css('width', '' + currentStep + '%');
				progressBar.html(currentStep + '%')
			} else {
				$('.panel__bookmark-link[href="#' + $(this).attr('id') + '"]').css('color', 'grey');
			}
		})
	}

	jdoc.on('change', '.progress-input', function() {
		updateBar()
	})

	jdoc.on('keyup', '.progress-input', function() {
		updateBar()
	})

	//удаление инпутов по клику на крестик
	jdoc.on('click', '.ui-input-delete', function(e) {
		e.preventDefault()
		let btnAdd = $(this).parents('.panel__settings-group').find('.btn.btn--36')
		let firstLabels = $(this).parents('.panel__settings-group').find('.first-labels')
		btnAdd.show()
		let parent = $(this).parents('.panel__settings-row')
		let parentInput = parent.find('.ui-input')
		deleted['' + parentInput.attr("name") + ''].push(parentInput.data('id'))


		if (parentInput.hasClass('progress-input')) {
			$(this).parents('.panel__settings-group').find('.panel__settings-row').next().find('.ui-input').first().addClass('progress-input')
		}
		if ($(this).parents('.panel__settings-group').find('.panel__settings-row').length <= 2 ||
			$(this).parents('.panel__settings-group').find('.panel__settings-row.panel__new').length == 1
		) {
			firstLabels.addClass('show-labels')
			parent.remove()
		} else {
			parent.remove()
		}
		updateBar()
	})

	jdoc.on('click', '.ui-input-price .btn--remove', function (e) {
		e.preventDefault()
		let parent = $(this).parents('.ui-input-price')
		parent.remove()
		$(this).remove()
	})

	// TODO здесь идет много кода вставки шаблонов полей, как вариант, если это будет использоваться только здесь, то можно написать одну универсальную функцию которая будет по дата-атрибутам понимать куда/чего
	// либо смотреть на вышестоящий элемент , забирать его html и генерировать новый элемент
	jdoc.on('click', '.btn-add-email', function (e) {
		e.preventDefault()
		let rowsLength = $(this).parents('.panel__settings-group').find('.panel__settings-row').length
		let firstLabels = $(this).parents('.panel__settings-group').find('.first-labels')
		firstLabels.removeClass('show-labels')
		if (rowsLength < 32) {
			let emailRow = $('<div class="panel__settings-row">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label  " for="update-email">Email</label>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="email" placeholder="name@mail.ru" id="update-email" name="email" value="" data-id="123">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label  ">Комментарий к email</label>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" name="email-comment" type="text" placeholder="отдел продаж">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="ui-input-delete">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore($('.btn-add-email__row')).find(".ui-input").first().focus();
			if (rowsLength + 1 == 32) {
				$(this).hide()
			}
		}
	})

	jdoc.on('click', '.btn-add-tel', function (e) {
		e.preventDefault()
		let firstInput = '';
		let rowsLength = $(this).parents('.panel__settings-group').find('.panel__settings-row').length
		let firstLabels = $(this).parents('.panel__settings-group').find('.first-labels')
		firstLabels.removeClass('show-labels')

		if (rowsLength <= 1) {
			firstInput = 'progress-input';
		}

		if (rowsLength < 32) {
			let telephoneRow = $('<div class="panel__settings-row">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label ">Телефон</label>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input ' + firstInput + '" type="tel" name="telephone" placeholder="+7 999 12 34 567" id="update-tel" data-id="123">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label ">Комментарий к телефону</label>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" name="telephone-name" type="text" placeholder="отдел продаж">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="ui-input-delete">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore($('.btn-add-tel__row')).find(".ui-input").first().focus();
			if (rowsLength + 1 == 32) {
				$(this).hide()
			}
		}
	})

	jdoc.on('click', '.btn-add-fax', function (e) {
		e.preventDefault()
		let rowsLength = $(this).parents('.panel__settings-group').find('.panel__settings-row').length
		let firstLabels = $(this).parents('.panel__settings-group').find('.first-labels')
		firstLabels.removeClass('show-labels')
		if (rowsLength < 32) {
			let telephoneRow = $('<div class="panel__settings-row">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label ">Факс</label>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="tel" name="fax" placeholder="+7 999 12 34 567" id="update-fax" data-id="0">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label ">Комментарий к номеру</label>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" name="fax-name" type="text" placeholder="отдел продаж">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="ui-input-delete">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore($('.btn-add-fax__row')).find(".ui-input").first().focus();
			if (rowsLength + 1 == 32) {
				$(this).hide()
			}
		}
	})

	jdoc.on('click', '.btn-add-row', function (e) {
		e.preventDefault();
		let priceRow = $('<li class="ui-input-price">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-price-val">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="text" placeholder="Наименование" value="">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-price-field">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input ui-input--w200" type="text" placeholder="Цена" value="">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn--48 btn--light btn--remove">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn-move btn-move btn-move btn--48 btn--light">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-move" aria-hidden="true">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-move"></use>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t</li>')
		$(".panel__sortable").append(priceRow).find(".ui-input-price-val .ui-input").last().focus();
	})

	jdoc.on('click', '.btn-add-site', function (e) {
		e.preventDefault();
		let rowsLength = $(this).parents('.panel__settings-group').find('.panel__new').length
		let firstLabels = $(this).parents('.panel__settings-group').find('.first-labels')
		firstLabels.removeClass('show-labels')
		if (rowsLength < 10) {
			let siteRow = $('\t<div class="panel__settings-row panel__new">\n' +
				'<label class="ui-label" for="update-website">Сайт</label>' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input progress-input" type="text" name="site" placeholder="http://www.renins.com" id="update-website" data-id="123" value="">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="ui-input-delete">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore($(".btn-add-site__row")).find(".ui-input").first().focus();
			if (rowsLength + 1 == 10) {
				$(this).hide()
			}
		}
	})

	jdoc.on('click', '.btn-add-video', function (e) {
		e.preventDefault();
		let rowsLength = $(this).parents('.panel__settings-group').find('.panel__settings-row').length
		let firstLabels = $(this).parents('.panel__settings-group').find('.first-labels')
		firstLabels.addClass('show-labels')
		if (rowsLength < 32) {

			let videoRow = $('\t<div class="panel__settings-row panel__new">\n' +
				'<label class="ui-label">Видео (только YouTube)</label>' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-sm-6">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="text"  name="video-link" placeholder="Ссылка на видео">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-sm-6">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="text" name="video-name" placeholder="Название видео">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="ui-input-delete">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
				'\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore($(".btn-add-video__row")).find(".ui-input").first().focus();
			if (rowsLength + 1 == 32) {
				$(this).hide()
			}
		}

	})

	// Добавление нового заголовка в форму прайс листа
	jdoc.on('click', '.btn-add-title', function (e) {
		e.preventDefault();
		let priceTitle = $('<li class="ui-input-price  title-price">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-price-val">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-icon">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-badge" aria-hidden="true">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-badge"></use>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input ui-input--light" type="text" placeholder="Услуги печати">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn--48 btn--light btn--remove">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn-move btn-move btn-move btn--48 btn--light">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-move" aria-hidden="true">\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-move"></use>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
			'\t\t\t\t\t\t\t\t\t\t\t\t\t</li>');
		$(".panel__sortable").append(priceTitle).find(".ui-input").last().focus();
	})

	// Сортировка полей прайслиста по drag ивенту
	const sortable = new Sortable.default(
		document.querySelector('ol.panel__sortable'), {
			draggable: 'li.ui-input-price',
			handle: '.btn-move'
		}
	)

	var CategoriesBlock = $('.search-categories__categories')
	const maxCategories = $('.search-categories__search').data('maxCategories')

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

	$('.search-categories__search').typeahead({
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
		let selected = $('.search-categories__categories').find('.btn--selected').length
		let id = data.id
		let val = data.name
		if (maxCategories != 1) {
			if (selected >= maxCategories) {
				alrt('Категорий может быть не более ' + maxCategories + ' шт.');
				return false
			} else {
				if ($('.search-categories__categories').find('.btn[data-id="' + id + '"]').length == 0) {
					let category = $('<div class="col-auto">\n' +
						'<button type="button" class ="btn btn--selected category__button" data-id="' + id + '">' + val + '\n' +
						'<span class="btn__delete">\n' +
						'<svg class="icon-delete category__button-icon-delete" aria-hidden="true">\n' +
						'<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
						'</svg>\n' +
						'</span>\n' +
						'</button>\n' +
						'</div>')
					CategoriesBlock.append(category)
				} else {
					CategoriesBlock.find('.btn[data-id="' + id + '"]').parents('.col-auto').remove()
					let category = $('<div class="col-auto">\n' +
						'<button type="button" class ="btn btn--selected category__button" data-id="' + id + '">' + val + '\n' +
						'<span class="btn__delete">\n' +
						'<svg class="icon-delete category__button-icon-delete" aria-hidden="true">\n' +
						'<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
						'</svg>\n' +
						'</span>\n' +
						'</button>\n' +
						'</div>')
					CategoriesBlock.append(category)
				}

				$(this).data('ttTypeahead').input.setQuery('', true);
				$(this).val('');

				$(this).data('ttTypeahead').input.blur();
				$(this).blur();
			}
		} else {
			CategoriesBlock.empty()
			let category = $('<div class="col-auto">\n' +
				'<button  type="button" class ="btn btn--selected category__button" data-id="' + id + '">' + val + '\n' +
				'<span class="btn__delete">\n' +
				'<svg class="icon-delete category__button-icon-delete" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
				'</svg>\n' +
				'</span>\n' +
				'</button>\n' +
				'</div>')
			CategoriesBlock.append(category);

			$(this).data('ttTypeahead').input.setQuery('', true);
			$(this).val('');

			$(this).data('ttTypeahead').input.blur();
			$(this).blur();
		}
		})
		.on('typeahead:asyncrequest', function () {
			$('#search-loader-1').removeClass('hidden').css('opacity', 1).css('visibility', 'visible');
		})
		.on('typeahead:asynccancel typeahead:asyncreceive', function () {
			$('#search-loader-1').addClass('hidden').css('opacity', 0).css('visibility', 'hidden');
	});


	jdoc.on('click', '.search-categories__categories .btn--selected', function (e) {
		deleted['categories'].push($(this).data('id'))
		$(this).parents('.col-auto').remove()
	})
	jdoc.on('click', '.js-select__b-office option', function (e) {
		$('.js-select__b-office option').removeClass('selected')
		$(this).addClass('selected')
	})

	jdoc.on('focusin', '#update-address', function (e) {
		e.preventDefault();
		if (!jhtml.hasClass('is-search-open')) {
			var all_li = $(this).find('.ui-search__list > li');
			jhtml.addClass('is-search-open');
			all_li.removeClass('selected');
		}
	});

	// Добавление поля комментария для модератора
	jdoc.on('click', '.panel__settings-moderator .ui-link', function (e) {

		var t = $(this),
			panel_comment = $('.panel__settings-m-comment'),
			was_hidden = false;

		t.addClass('hidden');
		t.siblings('.ui-link').removeClass('hidden');

		if (panel_comment.hasClass('hidden')) was_hidden = true;
		panel_comment.toggleClass('hidden');

		if (was_hidden) panel_comment.find('input').focus();
	})

	// Блок с временем работы
	function SetWorkHours(elem, msg_1, msg_2) {
		$(elem).find('.js-select').change(function () {
			let from = $(elem).find('.js-select').first().val();
			let to = $(elem).find('.js-select').last().val();
			var msg = msg_2 + from + ' – ' + to;
			$(elem).find('.ui-check__input').prop('checked', false)
			// в дата таргет стоит id + # вначале,в верстке так изначально было
			$('.ui-worktime__period-btn[data-target="#' + $(elem).attr('id') + '"]').text(msg);
		})
		$(elem).find('.ui-check__input').change(function () {
			if ($(this).is(":checked") == true) {
				var msg = msg_1
				$('.ui-worktime__period-btn[data-target="#' + $(elem).attr('id') + '"]').text(msg);
			} else {
				let from = $(elem).find('.js-select').first().val();
				let to = $(elem).find('.js-select').last().val();
				var msg = msg_2 + from + ' – ' + to;
				$('.ui-worktime__period-btn[data-target="#' + $(elem).attr('id') + '"]').text(msg);
			}
		})
	}

	$('.ui-worktime__period [id *= "time"]').each(function (index, elem) {
		SetWorkHours(elem, 'Круглосуточно', 'c ')
	})
	$('.ui-worktime__period [id *= "break"]').each(function (index, elem) {
		SetWorkHours(elem, 'Без перерыва', 'перерыв ')
	})

	// Заполнение селектов по значениям линкованным в кнопку, сделал не на спанах внутри кнопки для уменьшения работы бека

	// переключение вида формы
	$('.ui-check__input[name="update-status"]').change(function () {
		let val = $(this).val()
		$(this).addClass('btn is-loading-right')
		switch (val) {
			case "update":
				$('.ui-taglist').show()
				$('.panel__settings-group').show();
				$(".l__sticky.js-sticky").show();
				$('.change_address').removeClass('no-after')
				jbody.trigger("sticky_kit:recalc");
				break
			case "transfer":
				$('.ui-taglist').hide()
				$('.panel__settings-group:not(.change_address):not(.pm-comment):not(.panel__settings-m-comment)').hide();
				$('.panel__settings-group.change_address').show();
				$(".l__sticky.js-sticky").hide();
				$('.change_address').addClass('no-after')
				break
			default:
				$('.ui-taglist').hide()
				$('.panel__settings-group:not(.pm-comment):not(.panel__settings-m-comment)').hide();
				if ($('.panel__settings-m-comment.hidden').length > 0)
					$('.panel__settings-moderator .ui-link').first().trigger('click');
				$(".l__sticky.js-sticky").hide();
				$('.change_address').addClass('no-after')
				break
		}
		$(this).removeClass('btn is-loading-right')
	})

	//Сериализация формы
	submit_button.click(function (e) {

		if (CategoriesBlock.find('.btn').length === 0) {
			toast('Пожалуйста, укажите категорию', 'info');
			scroll('#search', 150);
			$('#search').focus();
			return false
		}

		e.preventDefault()

		// set button loading state
		submit_button.attr('disabled', true);
		submit_button.addClass('is-loading-right');
		submit_button.html('Подготовка к отправке');

		var data = {}
		let array = $('.company-info').serializeArray();
		data['address_parts'] = []
		data['telephone'] = []
		data['fax'] = []
		data['email'] = []
		data['site'] = []
		data['video'] = []

		data['is_paid_request'] = $('.panel__tabs-btn.js-tabsid-btn.is-active').data('tabsBtn') === '01' ? 'yes' : 'no';
		data['request_score'] = $('.ui-progress-bar').text()

		for (var i in array) {
			switch (array[i]['name']) {
				case "telephone":
					data['telephone'].push({
						'telephone': array[i]['value'],
						'comment': array[(parseInt(i) + 1)]['value']
					})
					break
				case "fax":
					data['fax'].push({
						'fax': array[i]['value'],
						'comment': array[(parseInt(i) + 1)]['value']
					})
					break
				case "email":
					data['email'].push({'email': array[i]['value'], 'comment': array[(parseInt(i) + 1)]['value']})
					break
				case "site":
					data['site'].push({'email': array[i]['value']})
					break
				case "video-link":
					data['video'].push({'video': array[i]['value'], 'name': array[(parseInt(i) + 1)]['value']})
					break
				default:
					if (array[i]['name'] != "telephone-name" && array[i]['name'] != "email-comment" && array[i]['name'] != "video-name") {
						data[array[i]['name']] = array[i]['value']
					}
			}
		}

		data['pricelist'] = {
			"value": []
		}

		$('.panel__sortable').find('.ui-input-price').each(function (index, elem) {
			let text = $(this).find('.ui-input-price-val').find('.ui-input').val()
			if ($(this).hasClass('title-price')) {
				data['pricelist']["value"][index] = {}
				data['pricelist']["value"][index]['type'] = 'title'
				data['pricelist']["value"][index]['text'] = text
				data['pricelist']["value"][index]['order'] = index
			} else {

				let value = $(this).find('.ui-input--w200').val()
				data['pricelist']["value"][index] = {}
				data['pricelist']["value"][index]['type'] = 'string'
				data['pricelist']["value"][index]['text'] = text
				data['pricelist']["value"][index]['value'] = value
				data['pricelist']["value"][index]['order'] = index
			}
		})

		data['categories'] = []
		$('.search-categories__categories').find('.btn--selected').each(function () {
			data['categories'].push($(this).data('id'))
		})

		data['socials'] = {}
		$('.ui-input[id*="update-social-"]').each(function () {
			data['socials']['' + this.id + ''] = $(this).val()
		})

		data['deleted'] = deleted
		data['backOffices'] = backOffices

		data['fp'] = window.page.fp
		data['meta'] = window.page.meta

		// отправляем массив

		var success_template = '<div class="syst">' +
			'\t<div class="syst__wrapper">' +
			'\t\t<div class="syst__error">' +
			'\t\t\t\t<figure class="syst__error-icon">' +
			'\t\t\t\t\t<img class="vh10" src="/images/icon-success.svg" alt="" />' +
			'\t\t\t\t</figure>' +
			'\t\t\t\t<span class="syst__error-title">Заявка успешно зарегистрирована, спасибо!</span>' +
			'\t\t\t\t<p class="syst__error-caption">Номер вашей заявки: <span id="issue">%issue%</span></p>' +
			'\t\t\t\t<a class="ui-link ui-link--underline ui-link--dark" href="/">На главную</a>' +
			'\t\t</div>' +
			'\t</div>' +
			'</div>';

		submit_button.html('Отправляю данные');

		$.ajax({
				type: "POST",
				cache: false,
				url: 'https://rubrikator.local/api/ajax/edit_request',
				data: {
					token: 'tk',
					owner_id: window.page.id,
					data: data
				},
			})
			.done(function(data) {

				var result = String(data).match(/({"status".*"})/gm);

				if (isJSON(result)) {
					var r = JSON.parse(result);

					if (r.status === 'success') {
						$('footer').remove();
						$('main').html(success_template.replace('%issue%', r.number));
					}
					else
					{
						alrt('Ошибка. Попробуйте ещё раз, пожалуйста');
						submit_button.attr('disabled', false);
						submit_button.removeClass('is-loading-right');
						submit_button.html('Отправить');
					}
				}
				else
				{
					alrt('Ошибка. Попробуйте ещё раз, пожалуйста');
					submit_button.attr('disabled', false);
					submit_button.removeClass('is-loading-right');
					submit_button.html('Отправить');
				}

			})
			.fail(function(error){
				alrt('Ошибка. Попробуйте ещё раз, пожалуйста');
				submit_button.attr('disabled', false);
				submit_button.removeClass('is-loading-right');
				submit_button.html('Отправить');
			});
	})

	$('.is-acceptence').change(function () {
		if ($(this).is(':checked')) {
			$('.btn--submit').removeAttr('disabled').removeClass('disabled')
		} else {
			$('.btn--submit').attr('disabled', 'disabled').addClass('disabled')
		}
	})

	jdoc.on('click', '.js-tabsid-btn', function (e) {

		if ($(this).hasClass('premium-tab')) {
			$('.premium-submit').show()
		} else {
			$('.premium-submit').hide()
		}
		e.preventDefault();

		var tab = $(this),
			tab_id = $(this).attr('data-tabs-btn'),
			tabsid = tab.closest('.js-tabsid'),
			tabsid_btn = tabsid.find('.js-tabsid-btn'),
			tabsid_content = tabsid.find('.js-tabsid-content');
		if (tab.is('.is-active')) {
			return false
		} else {
			tabsid_btn.removeClass('is-active');
			tabsid_content.removeClass('is-active');

			tabsid.find('[data-tabs-btn=' + tab_id + ']').addClass('is-active');
			tabsid.find('[data-tabs-content=' + tab_id + ']').addClass('is-active');
		}


	});

	jdoc.on('focus', '#update-price-list .ui-input', function (e) {
		e.preventDefault()
	})

	$('.select-form').each(function () {
		if ($(this).is(':checked')) {
			$(this).trigger('change');
		}
	})
})

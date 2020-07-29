var deleted = {}
deleted['categories'] = []
deleted['telephone'] = []
deleted['email'] = []
deleted['site'] = []
deleted['video-link'] = []
deleted['backOffices'] = []
var days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
]
// первый блок radio click
//Карта
var backOffices = []
var schedule = {}

ymaps.load(init);

function init() {
    var officeMap = new ymaps.Map("mapDrag", {
        center: [55.76, 37.64],
        zoom: 10,
        controls:['zoomControl','fullscreenControl']
    }, {
        searchControlProvider: 'yandex#search'
    })


//Пока оставил отправку по дата-атрибуту селекта как было ранее в тз, но можно и одним запросом отправлять если вам удобней так будет

    // TODO эндпоинты информации о филиалах сюда

    $('.js-select__b-office .ui-selectric-scroll option').each(function (index, elem) {
        let officeId = $(elem).data('index');
        //Здесь должен быть метод который отдает инфу о филиалах по id
        // $.ajax({
        //     type: 'GET',
        //     url: 'https://api.github.com/users/starred',
        //     dataType: "json",
        //     data: officeId,
        //     success: function (response) {
        //     let data = repsonse.text()
        //      backOffices.push(data)
        //     }
        // })
    })
    let answer_1 = {
        'name': 'Москва, Дзержинского проспект, 211а',
        'address': 'Пример адреса',
        'floor': '3',
        'office': '206',
        'additional': 'Дополнительный комментарий',
        'id':'125',
        'coords': {
            'longitude': 0,
            'latitude': 0
        },
        "schedule": {
            'monday': {'not_working': true},
            'tuesday': {'from': '08:00', 'to': '21:00', 'break_from': '11:00', 'break_to': '15:00'},
            'wednesday': {'from': '08:00', 'to': '16:00', 'break_from': '11:00', 'break_to': '12:00'},
            'thursday': {'from': '08:00', 'to': '09:00', 'no_break': true},
            'friday': {'aroundClock': true, 'break_from': '15:00', 'break_to': '20:00'},
            'saturday': {'aroundClock': true, 'break_from': '11:00', 'break_to': '12:00'},
            'sunday': {'not_working': true},
        }
    }
    let answer_2 = {
        'name': 'Новороссийск, Хворостянского, 13б',
        'address': 'Пример второго адреса',
        'floor': '34',
        'office': '26',
        'additional': 'Дополнительный второй комментарий',
        'id':'125',
        'coords': {
            'longitude': 0,
            'latitude': 0
        },
        "schedule": {
            'tuesday': {'not_working': true},
            'monday': {'from': '08:00', 'to': '21:00', 'break_from': '11:00', 'break_to': '12:00'},
            'thursday': {'from': '08:00', 'to': '16:00', 'break_from': '11:00', 'break_to': '12:00'},
            'wednesday': {'from': '08:00', 'to': '09:00', 'no_break': true},
            'friday': {'aroundClock': true, 'no_break': true},
            'saturday': {'not_working': true},
            'sunday': {'not_working': true},
        }
    }
    backOffices.push(answer_1, answer_2)


    //функция связывания инпута адрес и точки на карте
    function setCoords(){
        let office = $('.js-select__b-office').val()
        officeMap.geoObjects.removeAll()
        let address=''+ $('#update-address').val()+''
        ymaps.geocode(address, {
            results: 1
        }).then(function (res) {
            if(res.geoObjects.get(0)!=undefined){
            var GeoObject = res.geoObjects.get(0)
            var coords = GeoObject.geometry.getCoordinates()

            var myPlacemark = new ymaps.Placemark([coords[0],coords[1]], null, {
                preset: 'islands#blueDotIcon',
                draggable: true
            });
            myPlacemark.events.add('dragend', function (e) {
                var newCords = e.get('target').geometry.getCoordinates();
                ymaps.geocode(newCords, {
                    results: 1
                }).then(function (res) {
                    var geoObject = res.geoObjects.get(0)
                    var address = geoObject.getAddressLine()
                    var coords = geoObject.geometry.getCoordinates()
                    $('#update-address').val(address)
                    for (let i in backOffices) {
                        if (backOffices[i]['name'] == office) {
                            backOffices[i]['coords']['latitude']= coords[0]
                            backOffices[i]['coords']['longitude']= coords[1]
                            backOffices[i]['address'] = address
                        }
                    }
                })

            });
            officeMap.geoObjects.add(myPlacemark);
            officeMap.setCenter(coords, 16)
            for (let i in backOffices) {
                    if (backOffices[i]['name'] == office) {
                        backOffices[i]['coords']['latitude']= coords[0]
                        backOffices[i]['coords']['longitude']= coords[1]
                        backOffices[i]['address'] = address
                    }
                }
        }else{
                let office = $('.js-select__b-office').val()
                for (let i in backOffices) {
                    if (backOffices[i]['name'] == office) {
                        backOffices[i]['coords']['latitude']= 'not_found'
                        backOffices[i]['coords']['longitude']= 'not_found'
                        backOffices[i]['address'] = $('#update-address').val()
                    }
                }
            }})
    }

    //Автозаполнение адреса
    let token = "e42b1ce121984f1fba3256837f67e961b2982b05";
    var addresses = new Bloodhound({
        datumTokenizer: function(addresses) {
            return Bloodhound.tokenizers.whitespace('value');
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            headers:{
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + token,
            },
            body: JSON.stringify({query: $('#update-address').val(), count: 5, language: 'ru',}),
            url: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
            replace: function(url, uriEncodedQuery) {
                return 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address?token='+token+'&query='+$('#update-address').val()
            },
            filter: function(response) {
                $('.search-address__progress').addClass('hidden')
                return response.suggestions
            }
        }})
    addresses.initialize();
    $('#update-address').typeahead({
            hint: true,
            highlight: true,
            minLength: 2
        },
        {
            name: 'addresses',
            displayKey: function(value) {
                return value.value
            },
            source: addresses.ttAdapter(),
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
                suggestion: function(data) {
                    return '<li>' +
                        '<div class="ui-search__item">' +
                        '<span class="ui-search__item-text">' +
                        '' + data['value'] + '' +
                        '</span>' +
                        '</div>' +
                        '</li>'
                }
            }
        }).on('typeahead:asyncrequest', function() {
        $('.search-address__progress').removeClass('hidden')
    })
        .on('typeahead:asynccancel typeahead:asyncreceive', function() {
            $('.search-address__progress').addClass('hidden')
        })
        .on('typeahead:selected', function(event, data){
            setCoords()
        })
    //если пользователь захочет ввести адрес который не найдется в дадате и в яндексе
    $('#update-address').change(function () {
        setCoords()
    })
    //заполняю поля времени работы в массиве с филиалами по событию change
    function addSchedule() {
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
    }

    addSchedule()
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

    //подставляю данные из выбранного филиала в селекты
    function showSelectedAddress() {
        let officeAddress = $('.js-select__b-office').val();
        for (let office in backOffices) {
            if (backOffices[office]['name'] == officeAddress) {
                $('#update-address').val(backOffices[office]['address']);
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

                            $('#time-0' + day).find('.js-select').first().val(backOffices[office]['schedule'][days[day]]['from']).trigger('change').selectric('refresh');
                            $('#time-0' + day).find('.js-select').last().val(backOffices[office]['schedule'][days[day]]['to']).trigger('change').selectric('refresh');
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
                                $('#break-0' + day).find('.js-select').first().val(backOffices[office]['schedule'][days[day]]['break_from']).trigger('change').selectric('refresh');
                                $('#break-0' + day).find('.js-select').last().val(backOffices[office]['schedule'][days[day]]['break_to']).trigger('change').selectric('refresh');
                            }
                        }
                    } else {
                        let input = $('.js-worktime-checkbox').eq(+day)
                        if (input.is(':checked'))
                            input.trigger('click')
                    }
                }
                setCoords()
            }
        }
    }
    var newOfficeIndex = 1
    showSelectedAddress()
    //Добавление нового офиса
    $('.btn__add-office').click(function () {
        let newOffice = {
            'name': 'Новый филиал #'+newOfficeIndex,
            'address': '',
            'floor': '',
            'office': '',
            'additional': '',
            'id':'0',
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
        $('.update-address').focus()
        showSelectedAddress()
        newOfficeIndex += 1
        officeMap.setCenter([55.763761,37.621732], 10)
    })
    //Удаление офиса
    // window.Swal = swal;
    $('.btn__delete-office').click(function () {
        Swal.fire({
            title: 'Удалить этот филал?',
            showCancelButton: true,
            confirmButtonText: 'Удалить',
            cancelButtonText: 'Отмена'
        })
            .then((result) => {
                if (result['value'])
                {
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

    if ($(this).is(':checked')) {
        $(this).closest('.js-worktime').addClass('is-active');
        $('.worktime-input').val('yes').trigger('change')
    } else {
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
    var targetId = $(this).data('target');

    $('.js-worktime-content').hide();

    if ($(this).is('.is-active')) {
        $(this).removeClass('is-active');
    } else {
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
        if($($(this).attr('href')).length==0){

            $('html, body').animate({
                scrollTop: $('.first-labels_'+$(this).attr('href').split('#')[1]).offset().top - 150
            }, 200);
        }else{
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 150
        }, 200);
        }
    })
})


$(document).ready(function () {
    var stateSelectors = document.querySelectorAll(".select-form")
    for (var i = 0, element; element = stateSelectors[i]; i++) {
        element.removeEventListener('click', showLoader,false);
    }
    $('.loader__wrapper').remove()
    $('.js-select__b-office').trigger('change')
    //выбор заявки
    $('.select-form').change(function () {
        $('.panel__settings-group').show()
        $('.l__wrapper').removeClass('hidden')
        switch ($(this).val()) {
            case 'update':
                $('.company-info .panel__settings').children().show()
                $('.l__sidebar').show()
                jbody.trigger("sticky_kit:recalc");
                break
            case 'transfer':
                $('.company-info .panel__settings').children().show()
                $('.l__sidebar').hide()
                break
            case 'closed_temp':
                $('.company-info .panel__settings').children().show()
                $('.l__sidebar').hide()
                break
            case 'closed':
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
    let fillingStep = Math.ceil((100 / $('.panel__bookmark-link').length));

    function updateBar() {
        let currentStep = 0;
        $('.progress-input').each(function () {
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

    $('.progress-input').on('keyup', function () {
        updateBar()
    })
    $('.progress-input').on('change', function () {
        updateBar()
    })
    $('.progress-input').trigger('change')

    //удаление инпутов по клику на крестик
    jdoc.on('click', '.ui-input-delete', function (e) {
        e.preventDefault()
        let btnAdd = $(this).parents('.panel__settings-group').find('.btn.btn--36')
        let firstLabels=$(this).parents('.panel__settings-group').find('.first-labels')
        btnAdd.show()
        let parent = $(this).parents('.panel__settings-row')
        let parentInput = parent.find('.ui-input')
        deleted['' + parentInput.attr("name") + ''].push(parentInput.data('id'))

        if ($(this).parents('.panel__settings-group').find('.panel__settings-row').length<=2 ||
            $(this).parents('.panel__settings-group').find('.panel__settings-row.panel__new').length==1
        ) {
            firstLabels.addClass('show-labels')
            parent.remove()
        } else {

            parent.remove()
        }
        $(this).remove()

    })
    jdoc.on('click', '.ui-input-price .btn--remove', function (e) {
        e.preventDefault()
        let parent = $(this).parents('.ui-input-price')
        parent.remove()
        $(this).remove()
    })
    //TODO здесь идет много кода вставки шаблонов полей, как вариант, если это будет использоваться только здесь, то можно написать одну универсальную функцию которая будет по дата-атрибутам понимать куда/чего
    // либо смотреть на вышестоящий элемент , забирать его html и генерировать новый элемент
    jdoc.on('click', '.btn-add-email', function (e) {
        e.preventDefault()
        let rowsLength = $(this).parents('.panel__settings-group').find('.panel__settings-row').length
        let firstLabels=$(this).parents('.panel__settings-group').find('.first-labels')
        firstLabels.removeClass('show-labels')
        if (rowsLength < 11) {
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
            if(rowsLength+1==11){
                $(this).hide()
            }
        }
    })
    jdoc.on('click', '.btn-add-tel', function (e) {
        e.preventDefault()
        let rowsLength = $(this).parents('.panel__settings-group').find('.panel__settings-row').length
        let firstLabels=$(this).parents('.panel__settings-group').find('.first-labels')
        firstLabels.removeClass('show-labels')
        if (rowsLength < 11) {
            let telephoneRow = $('<div class="panel__settings-row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label ">Телефон</label>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="tel" name="telephone" placeholder="+7 999 12 34 567" id="update-tel2" data-id="123">\n' +
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
            if(rowsLength+1==11){
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
        $(".panel__sortable").append(priceRow).find(".ui-input").last().focus();
    })

    jdoc.on('click', '.btn-add-site', function (e) {
        e.preventDefault();
        let rowsLength = $(this).parents('.panel__settings-group').find('.panel__new').length
        let firstLabels=$(this).parents('.panel__settings-group').find('.first-labels')
        firstLabels.removeClass('show-labels')
        if (rowsLength < 10) {
            let siteRow = $('\t<div class="panel__settings-row panel__new">\n' +
                '<label class="ui-label" for="update-website">Сайт</label>'+
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
            if(rowsLength+1 ==10){
                $(this).hide()
            }
        }
    })
    jdoc.on('click', '.btn-add-video', function (e) {
        e.preventDefault();
            let rowsLength = $(this).parents('.panel__settings-group').find('.panel__settings-row').length
            let firstLabels=$(this).parents('.panel__settings-group').find('.first-labels')
            firstLabels.addClass('show-labels')
            if (rowsLength < 11) {

            let videoRow = $('\t<div class="panel__settings-row panel__new">\n' +
                '<label class="ui-label">Видео (только YouTube)</label>'+
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
                if(rowsLength+1==11){
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
            handle:'.btn-move'
        }
    )

    var searchProgress = $('.search-categories__progress');
    var CategoriesBlock = $('.search-categories__categories')
    const maxCategories = $('.search-categories__search').data('maxCategories')

    var categories = new Bloodhound({
        datumTokenizer: function(categories) {
            return Bloodhound.tokenizers.whitespace();
        },
        limit: 20,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: 'https://rubrikator.local/api/search?type=categories&query='+ $('#search').val(),
            replace: function(url, uriEncodedQuery) {
                return 'https://rubrikator.local/api/search?type=categories&query='+ $('#search').val()
            },
            filter: function(response) {
               if(response.status=="nothing_found"){
                    return false
                }else{
                   searchProgress.addClass('hidden')
                    return response.info
                }


            }
        }
    });


    categories.initialize();

    $('.search-categories__search').typeahead({
            limit: 20,
            highlight: true,
            minLength: 2
        },
        {     limit: 19,
            name: 'categories',
            displayKey: function(categories) {
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
                suggestion: function(data) {
                    return '<li data-id="' + data['id'] +'">' +
                        '<div class="ui-search__item">' +
                        '<span class="ui-search__item-text">' +
                        '' + data['name'] + '' +
                        '</span>' +
                        '</div>' +
                        '</li>'
                }
            }
        }).on('typeahead:selected', function(event, data){
        let selected =$('.search-categories__categories').find('.btn--selected').length
        let id =data.id
        let val = data.name
        if (maxCategories != 1) {
            if (selected >= maxCategories) {
                alert('Можно добавить не более ' + maxCategories + ' шт.')
                return false
            } else {
                    if ($('.search-categories__categories').find('.btn[data-id="' + id + '"]').length == 0) {
                        let category = $('<div class="col-auto">\n' +
                            '<button  type="button" class ="btn btn--selected" data-id="' + id + '">' + val + '\n' +
                            '<span class="btn__delete">\n' +
                            '<svg class="icon-delete" aria-hidden="true">\n' +
                            '<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                            '</svg>\n' +
                            '</span>\n' +
                            '</button>\n' +
                            '</div>')
                        CategoriesBlock.append(category)
                    } else {
                        CategoriesBlock.find('.btn[data-id="' + id + '"]').parents('.col-auto').remove()
                            let category = $('<div class="col-auto">\n' +
                                '<button  type="button" class ="btn btn--selected" data-id="' + id + '">' + val + '\n' +
                                '<span class="btn__delete">\n' +
                                '<svg class="icon-delete" aria-hidden="true">\n' +
                                '<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                                '</svg>\n' +
                                '</span>\n' +
                                '</button>\n' +
                                '</div>')
                            CategoriesBlock.append(category)

                    }

                $(this).val('')
            }
        }else{
            CategoriesBlock.empty()
            let category = $('<div class="col-auto">\n' +
                '<button  type="button" class ="btn btn--selected" data-id="' + id + '">' + val + '\n' +
                '<span class="btn__delete">\n' +
                '<svg class="icon-delete" aria-hidden="true">\n' +
                '<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                '</svg>\n' +
                '</span>\n' +
                '</button>\n' +
                '</div>')
            CategoriesBlock.append(category)
        }
    }).on('typeahead:asyncrequest', function() {
        searchProgress.removeClass('hidden')
    })
        .on('typeahead:asynccancel typeahead:asyncreceive', function() {
            searchProgress.addClass('hidden')
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


//Добавление поля комментария для модератора
    jdoc.on('click', '.panel__settings-moderator .ui-link', function (e) {
        $(this).addClass('hidden');
        $(this).siblings('.ui-link').removeClass('hidden');
        $('.panel__settings-m-comment').toggleClass('hidden');
    })

//Блок с временем работы
    function SetWorkHours(elem, msg_1, msg_2) {
        $(elem).find('.js-select').change(function () {
            let from = $(elem).find('.js-select').first().val();
            let to = $(elem).find('.js-select').last().val();
            var msg = msg_2 + from + ' -- ' + to;
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
                var msg = msg_2 + from + ' -- ' + to;
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
    //Заполнение селектов по значениям линкованным в кнопку, сделал не на спанах внутри кнопки для уменьшения работы бека

//    переключение вида формы
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
                if ($('.panel__settings-m-comment.hidden').length > 0)
                    $('.panel__settings-moderator .ui-link').first().trigger('click');
                $(".l__sticky.js-sticky").hide();
                $('.change_address').addClass('no-after')
                break
            default:
                $('.ui-taglist').hide()
                $('.change_address').addClass('no-after')
                $('.panel__settings-group:not(.pm-comment):not(.panel__settings-m-comment)').hide();
                if ($('.panel__settings-m-comment.hidden').length > 0)
                    $('.panel__settings-moderator .ui-link').first().trigger('click');
                $(".l__sticky.js-sticky").hide();
                break
        }
        $(this).removeClass('btn is-loading-right')
    })
//Сериализация формы
    $('.btn--submit').click(function (e) {
        if (CategoriesBlock.find('.btn').length === 0) {
            alert('Необходимо добавить категорию')
            $('#search').focus().scrollTo(100)
            return false
        }
        e.preventDefault()
        var data = {}
        let array = $('.company-info').serializeArray();
        data['telephone'] = []
        data['email'] = []
        data['site'] = []
        data['video'] = []
        //не уверен что именно ид такое нужно подставлять в этом поле
        data['type-of-issue'] = $('.panel__tabs-btn.js-tabsid-btn.is-active').data('tabsBtn')
        data['fullness'] = $('.ui-progress-bar').text()
        for (var i in array) {
            switch (array[i]['name']) {
                case "telephone":
                    data['telephone'].push({
                        'telephone': array[i]['value'],
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
        console.log(data)
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
        if($(this).is(':checked')){
            $(this).trigger('change');
        }
    })

})

//Заполняю селекты по нажатию на кнопке, не удалил тк было в изначальном тз
// $('.ui-worktime__period-btn').each(function (index, elem) {
//         let dayIndex = $('.ui-worktime__row.js-worktime').index()
//
//         let val = $(elem).text().split(' ');
//         let inputs = $('' + $(elem).data('target') + '')
//         let from = inputs.find('.js-select').first();
//         let to = inputs.find('.js-select').last();
//         let checkbox = inputs.find('.ui-check__input');
//         if (val[0] == 'Круглосуточно' ) {
//             from.val('00:00').change().selectric('refresh');
//             to.val('00:00').change().selectric('refresh');
//             checkbox.prop('checked', true);
//             $(elem).text('Круглосуточно')
//         } else {
//             if(val[0] == 'Без'){
//                 from.val('00:00').change().selectric('refresh');
//                 to.val('00:00').change().selectric('refresh');
//                 checkbox.prop('checked', true);
//                 $(elem).text('Без перерыва')
//             }
//             else{
//                 from.val(val[1]).change().selectric('refresh');
//                 to.val(val[3]).change().selectric('refresh');
//                 checkbox.prop('checked', false)
//             }
//         }
//
// })

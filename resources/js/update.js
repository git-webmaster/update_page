
var deleted = {}
deleted['categories'] = []
deleted['telephone'] = []
deleted['email'] = []
deleted['site'] = []
deleted['video-link'] = []
// первый блок radio click
//Карта
ymaps.load(init);

function init() {
    var officeMap = new ymaps.Map("mapDrag", {
        center: [55.76, 37.64],
        zoom: 10,
    }, {
        searchControlProvider: 'yandex#search'
    })
    function changeAddress(){
        let officeId = $(this).find('.ui-selectric-scroll .selected').data('index');
        // $.ajax({
        //     type: 'GET',
        //     url: 'https://api.github.com/users/starred',
        //     dataType: "json",
        //     data: officeId,
        //     success: function (response) {
        //     }
        // })
        let answer =
            {
                'address': 'Пример адреса',
                'floor': '3',
                'office': '206',
                'additional': 'Дополнительный комментарий',
                'coords': {
                    'longitude': 55.763761,
                    'latitude': 37.621732
                }
            }
        $('#update-address').val(answer['address']);
        $('#update-address-floor').val(answer['floor']);
        $('#update-address-office').val(answer['office']);
        $('#update-address-additional').val(answer['additional']);
        $('.address-coords').val([
            answer['coords']['longitude'],
            answer['coords']['latitude']
        ])
        officeMap.geoObjects.removeAll();
        if (answer['coords']['latitude'] !== null && answer['coords']['longitude'] !== null) {
            let lat = answer['coords']['latitude']
            let lon = answer['coords']['longitude']
            officeMap.geoObjects.removeAll()
            var myPlacemark = new ymaps.Placemark([lon, lat], null, {
                preset: 'islands#blueDotIcon',
                draggable: true
            });
            myPlacemark.events.add('dragend', function (e) {
                function SetByCoord(result) {
                    result = JSON.parse(result)
                    if (result["suggestions"][0]["value"])
                        $('#update-address').val(result["suggestions"][0]["value"])
                }

                var cord = e.get('target').geometry.getCoordinates();
                var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
                var token = "e42b1ce121984f1fba3256837f67e961b2982b05";
                var query = {lat: cord[0], lon: cord[1]};
                var options = {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": "Token " + token
                    },
                    body: JSON.stringify(query)
                }
                fetch(url, options)
                    .then(response => response.text())
                    .then(result => SetByCoord(result))
                    .catch(error => console.log("error", error));

            });
            officeMap.geoObjects.add(myPlacemark);
            // Слушаем событие окончания перетаскивания на метке.
            officeMap.setCenter([lon, lat], 10)
            $('.address-coords').val([lon, lat])
        }
    }
    changeAddress()
    //Выбор офиса
    jdoc.on('change', '.js-select__b-office', function (e) {
        changeAddress()

    })

    //Автозаполнение адреса
    var searchAddress = $('.search__address')

    function showSuggest(response) {
        response = JSON.parse(response)
        for (i in response["suggestions"]) {
            searchAddress.empty()
            let result = $('<li data-lat="' + response["suggestions"][i]['data']['geo_lat'] + '" data-lon="' + response["suggestions"][i]['data']['geo_lon'] + '" >\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-search__item">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="ui-search__item-text">\n' + response["suggestions"][i]['value'] + ' \n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</li>')
            searchAddress.append(result)
        }
    }

    function getAddressSuggestions() {
        var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
        var token = "e42b1ce121984f1fba3256837f67e961b2982b05";
        var query = $('#update-address').val();

        var options = {
            method: "POST",
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + token,

            },
            body: JSON.stringify({query: query, count: 5, language: 'ru',})
        }
        fetch(url, options)
            .then(response => response.text())
            .then(response => showSuggest(response))
            .catch(error => console.log("error", error));
    }

    jdoc.on('keyup', '#update-address', function (e) {
        clearTimeout(search);
        var search = setTimeout(getAddressSuggestions, 100)
    })
    jdoc.on('change', '#update-address', function (e) {
        let address = $('.search__address').find('.selected')
        let lon = address.data('lon')
        let lat = address.data('lat')
        let val = address.find('.ui-search__item-text').text();
        $(this).val('' + val + '')
        officeMap.geoObjects.removeAll()
        var myPlacemark = new ymaps.Placemark([lat, lon], null, {
            preset: 'islands#blueDotIcon',
            draggable: true
        });
        myPlacemark.events.add('dragend', function (e) {
            function SetByCoord(result) {
                result = JSON.parse(result)
                if (result["suggestions"][0]["value"])
                    $('#update-address').val(result["suggestions"][0]["value"])
            }

            var cord = e.get('target').geometry.getCoordinates();
            var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
            var token = "e42b1ce121984f1fba3256837f67e961b2982b05";
            var query = {lat: cord[0], lon: cord[1]};
            var options = {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token " + token
                },
                body: JSON.stringify(query)
            }
            fetch(url, options)
                .then(response => response.text())
                .then(result => SetByCoord(result))
                .catch(error => console.log("error", error));
        });
        officeMap.geoObjects.add(myPlacemark);
        // Слушаем событие окончания перетаскивания на метке.
        officeMap.setCenter([lat, lon], 10)
        $('.address-coords').val([lon, lat])
    });
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
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 150
        }, 200);
    })
})


$(document).ready(function () {

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
                if( currentStep >= 100 ||  Math.ceil(currentStep + fillingStep) >= 100){
                    currentStep = 100
                }else{
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
        let parent = $(this).parents('.panel__settings-row')
        let parentInput = parent.find('.ui-input')
        deleted['' + parentInput.attr("name") + ''].push(parentInput.data('id'))
        if(parent.hasClass('panel__video')||parent.hasClass('panel__site')){
            parent.find('.ui-input-group').remove()
            parent.css('margin-bottom','0')
        }else {
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
        if ($(this).parent('.panel__settings-group').find('.panel__settings-row').length < 10) {
            let emailRow = $('<div class="panel__settings-row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label is-md-hidden " for="update-email">Email</label>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="email" placeholder="name@mail.ru" id="update-email" name="email" value="raduga@mail.ru" data-id="123">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label is-md-hidden ">Комментарий к email</label>\n' +
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
                '\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore( $('.btn-add-email__row'))

        }
    })
    jdoc.on('click', '.btn-add-tel', function (e) {
        e.preventDefault()
        if ($(this).parent('.panel__settings-group').find('.panel__settings-row').length < 10) {
            let telephoneRow = $('<div class="panel__settings-row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label is-md-hidden">Телефон</label>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="tel" name="telephone" placeholder="+7 999 12 34 567" id="update-tel2" data-id="123">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label is-md-hidden">Комментарий к телефону</label>\n' +
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
                '\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore( $('.btn-add-tel__row'))
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
        $(".panel__sortable").append(priceRow)
    })

    jdoc.on('click', '.btn-add-site', function (e) {
        e.preventDefault();
        if ($(this).parent('.panel__settings-group').find('.panel__settings-row').length < 10) {
            let siteRow = $('\t<div class="panel__settings-row panel__new">\n' +
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
                '\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore( $(".btn-add-site__row"))
        }
    })
    jdoc.on('click', '.btn-add-video', function (e) {
        e.preventDefault();

        if ($(this).parent('.panel__settings-group').find('.panel__settings-row').length < 10) {
            let videoRow = $('\t<div class="panel__settings-row panel__new">\n' +
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
                '\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore( $(".btn-add-video__row"))

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
        $(".panel__sortable").append(priceTitle)
    })
    // Сортировка полей прайслиста по drag ивенту
    const sortable = new Sortable.default(
        document.querySelector('ol.panel__sortable'), {
            draggable: 'li.ui-input-price',
        }
    )
    // делаю поиск с задержкой к обращению к апи в 200 мс, если неактуально в данном конкретном случае то нужно убрать setTimeout в ивентлисенере ниже
    var searchList = $('.search-categories__list');
    var searchProgress = $('.search-categories__progress');
    var CategoriesBlock = $('.search-categories__categories')
    const maxCategories = $('.search-categories__search').data('maxCategories')

    function searchCategories() {
        let val = $('#search').val()
        $.ajax({
            type: 'GET',
            url: 'https://api.github.com/users/' + val + '/starred',
            dataType: "json",
            success: function (response) {
                searchList.empty()
                for (let i in response) {
                    let result = $('<li data-id="' + response[i]['id'] + '" data-num="' + i + '">\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-search__item">\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="ui-search__item-text">\n' +
                        '' + response[i]['name'] + '' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</li>')
                    searchList.append(result)
                }
            },
            error:function () {
                searchList.empty()
                let result = $('<li class="search-failed">\n' +
                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-search__item">\n' +
                    '\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="ui-search__item-text">\n' +
                    'Ничего не найдено' +
                    '\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</li>')
                searchList.append(result)
            }
        })
        searchProgress.addClass('hidden')
    }

    jdoc.on('keyup', '.search-categories__search', function () {
        if ($(this).val().length >= 2) {
            searchProgress.removeClass('hidden')
            searchList.empty()
            clearTimeout(searchCategories);
            var search = setTimeout(searchCategories, 100);
        }
    })
    jdoc.on('click', '.search-categories__list li', function () {
        $('.search-categories__list li').removeClass('selected');
        $(this).addClass('selected');
        $('.search-categories__search').trigger('change');
    })
    jdoc.on('change', '.search-categories__search', function () {
        if (maxCategories !== 1) {
            if ($('.search-categories__categories').find('.btn--selected').length >= maxCategories) {
                alrt('Можно добавить не более ' + maxCategories + ' шт.')
                return false
            } else {
                    if ($('.search-categories__list li.seleeted').length == 0) {
                        return false
                    }
                    else {
                        let id = $('.search-categories__list li.selected').data('id')
                        if ($('.search-categories__categories').find('.btn[data-id="' + id + '"]').length === 0) {
                            let val = $('.search-categories__list li.selected').text()
                            let category = $('<div class="col-auto">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn--selected" data-id="' + id + '">' + val + '\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="btn__delete">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>')
                            CategoriesBlock.append(category)
                        }
                        else {
                            CategoriesBlock.empty()
                            let id = $('.search-categories__list li.selected').data('id')
                            if ($('.search-categories__categories').find('.btn[data-id="' + id + '"]').length === 0) {
                                let val = $('.search-categories__list li.selected').text()
                                let category = $('<div class="col-auto">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn--selected" data-id="' + id + '">' + val + '\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="btn__delete">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>')
                                CategoriesBlock.append(category)
                            }
                        }
                    }
                $(this).val('')
            }
        }
    })
    jdoc.on('click', '.search-categories__categories .btn--selected', function (e) {
        $(this).parents('.col-auto').remove()

        deleted['categories'].push($(this).parents('.btn--selected').data('id'))
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
            if (from == '00:00' && to == '00:00') {
                var msg = msg_1;
                $(elem).find('.ui-check__input').prop('checked', true)
            } else {
                var msg = msg_2 + from + ' -- ' + to;
                $(elem).find('.ui-check__input').prop('checked', false)
            }
            // в дата таргет стоит id + # вначале,в верстке так изначально было
            $('.ui-worktime__period-btn[data-target="#' + $(elem).attr('id') + '"]').text(msg);
        })
        $(elem).find('.ui-check__input').change(function () {
            if ($(this).is(":checked") == true) {
                var msg = msg_1
                $(elem).find('.js-select').first().val('00:00').change().selectric('refresh');
                $(elem).find('.js-select').last().val('00:00').change().selectric('refresh');
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
    //сделал не на спанах внутри кнопки для уменьшения работы бека
    $(document).on('click', '.ui-worktime__period-btn', function (e) {
        try{  let val = $(this).text().split(' ');
            let inputs = $('' + $(this).data('target') + '')

            let from = inputs.find('.js-select').first();
            let to = inputs.find('.js-select').last();
            let checkbox = inputs.find('.ui-check__input');
            if (val[0] == 'Круглосуточно' || val[0] == 'Без') {
                from.val('00:00').change().selectric('refresh');
                to.val('00:00').change().selectric('refresh');
                checkbox.prop('checked', true);
            } else {
                from.val(val[1]).change().selectric('refresh');
                to.val(val[3]).change().selectric('refresh');
                checkbox.prop('checked', false)
            }}catch (e) {
            console.log(e)
        }

    })

//    переключение вида формы
    $('.ui-check__input[name="update-status"]').change(function () {
        let val = $(this).val()
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

    })
//Сериализация формы
    $('.btn--submit').click(function (e) {
        if (CategoriesBlock.find('.btn').length === 0){
            alert('Необходимо добавить категорию')
            $('#search').focus().scrollTo(100)
            return false
        }
        $('.ui-worktime__period-btn').trigger('click');
        e.preventDefault()
        var data = {}
        let array = $('.company-info').serializeArray();
        data['telephone'] = []
        data['email'] = []
        data['site'] = []
        data['video'] = []
        //не уверен что именно ид такое нужно подставлять в этом поле
        data['type-of-issue'] = $('.panel__tabs-btn.js-tabsid-btn.is-active').data('tabsBtn')

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
                    data['site'].push({'email': array[i]['value'], 'comment': array[(parseInt(i) + 1)]['value']})
                    break
                case "video-link":
                    data['video'].push({'video': array[i]['value'], 'name': array[(parseInt(i) + 1)]['value']})
                    break
                default:
                    if (array[i]['name'] !== "telephone-name" || array[i]['name'] !== "email-comment" || array[i]['name'] !== "video-name") {
                        data[array[i]['name']] = array[i]['value']
                    }


            }
        }
        let days = [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
        ]
        data['schedule'] = {
            'monday': {},
            'tuesday': {},
            'wednesday': {},
            'thursday': {},
            'friday': {},
            'saturday': {},
            'sunday': {},
        }
        $('.ui-worktime__row').each(function (index, elem) {
            if ($(this).find('.js-worktime-checkbox').is(":checked") ==false) {
                data['schedule']['' + days[index] + '']['not_working'] = true
            } else {
                data['schedule']['' + days[index] + '']['not_working'] = false;

                if ($(this).find('.ui-worktime__period-content[id *= "time"]').find('.ui-check__input').is(':checked')) {
                    data['schedule']['' + days[index] + '']['24/7'] = true;
                } else {
                    data['schedule']['' + days[index] + '']['24/7'] = false;
                    data['schedule']['' + days[index] + '']['from'] = $(this).find('.ui-worktime__period-content[id *= "time"]').find('.js-select').first().val();
                    data['schedule']['' + days[index] + '']['to'] = $(this).find('.ui-worktime__period-content[id *= "time"]').find('.js-select').last().val();
                }

                if ($(this).find('.ui-worktime__period-content[id *= "break"]').find('.ui-check__input').is(':checked')) {
                    data['schedule']['' + days[index] + '']['no_break'] = true
                } else {
                    data['schedule']['' + days[index] + '']['no_break'] = false
                    data['schedule']['' + days[index] + '']['break_from'] = $(this).find('.ui-worktime__period-content[id *= "break"]').find('.js-select').first().val();
                    data['schedule']['' + days[index] + '']['break_to'] = $(this).find('.ui-worktime__period-content[id *= "break"]').find('.js-select').last().val();
                }
                data['schedule']['' + days[index] + '']['comment'] = $(this).find('.ui-input--40').val()
            }
        })

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
        console.log(data)
    })
    $('.is-acceptence').change(function () {
        if ($(this).is(':checked')) {
            $('.btn--submit').removeAttr('disabled').removeClass('disabled')
        } else {
            $('.btn--submit').attr('disabled', 'disabled').addClass('disabled')
        }
    })


    jdoc.on('click', '.js-tabsid-btn', function(e)
    {

        if($(this).hasClass('premium-tab')){
            $('.premium-submit').show()
        }
        else {
            $('.premium-submit').hide()
        }
        e.preventDefault();

        var tab = $(this),
            tab_id = $(this).attr('data-tabs-btn'),
            tabsid = tab.closest('.js-tabsid'),
            tabsid_btn = tabsid.find('.js-tabsid-btn'),
            tabsid_content = tabsid.find('.js-tabsid-content');
        if ( tab.is('.is-active') )
        {
           return false
        }
        else
        {
            tabsid_btn.removeClass('is-active');
            tabsid_content.removeClass('is-active');

            tabsid.find('[data-tabs-btn=' + tab_id + ']').addClass('is-active');
            tabsid.find('[data-tabs-content=' + tab_id + ']').addClass('is-active');
        }


    });

})

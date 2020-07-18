var jwindow = jwindow || $(window),
    jhtml = jhtml || $('html'),
    jdoc = jdoc || $(document),
    jbody = jbody || $('body');

// первый блок radio click
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
    } else {
        $(this).closest('.js-worktime').removeClass('is-active');
        $(this).closest('.js-worktime').find('.js-worktime-btn').removeClass('is-active');
        $(this).closest('.js-worktime').find('.js-worktime-content').hide();
    }

});


jdoc.on('click', '.js-worktime-btn', function (e) {
    e.preventDefault();
    var targetId = $(this).data('target');

    $(this).closest('.js-worktime').find('.js-worktime-content').hide();

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
    //выбор заявки
    $('.select-form').change(function () {
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
                currentStep >= 100 ? currentStep = 100 : currentStep += fillingStep;
            } else {
                $('.panel__bookmark-link[href="#' + $(this).attr('id') + '"]').css('color', 'grey');
            }
            progressBar.css('width', '' + currentStep + '%');
            progressBar.html(currentStep + '%')
        })
    }

    $('.progress-input').on('change', function () {
        updateBar()
    })
    $('.progress-input').trigger('change')

    //удаление инпутов по клику на крестик
    $('.ui-input-delete').click(function () {
        $(this).parents('.ui-input-group').remove()
    })
    // Добавление новой строки в форму прайс листа
    jdoc.on('click', '.btn-add-row', function () {
        let priceRow = $('<li class="ui-input-price">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-price-val">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="text" placeholder="Наименование" value="">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-price-field">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input ui-input--w200" type="text" placeholder="Цена" value="">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class="btn btn--48 btn--light">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class="btn btn-move btn-move btn-move btn--48 btn--light">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-move" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-move"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t</li>')
        $(".panel__sortable").append(priceRow)
    })
    // Добавление нового заголовка в форму прайс листа
    jdoc.on('click', '.btn-add-title', function () {
        let priceTitle = $('<li class="ui-input-price">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-price-val">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-icon">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-badge" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-badge"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input ui-input--light" type="text" placeholder="Услуги печати">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class="btn btn--48 btn--light">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class="btn btn-move btn-move btn-move btn--48 btn--light">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-move" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-move"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t</li>');
        $(".panel__sortable").append(priceTitle)
    })


    var inputSite = $('<div class="ui-input-group">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input progress-input" type="text" placeholder="http://www.renins.com" id="update-website" data-id="123" value="">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class="ui-input-delete">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t</div>')

    var inputVideo = $('<div class="ui-input-group">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-sm-6">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="text" placeholder="Ссылка на видео">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-sm-6">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="text" placeholder="Название видео">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class="ui-input-delete">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t\t\t\t\t\t</div>')

    // Сортировка полей прайслиста по drag ивенту
    $("ol.panel__sortable").sortable({
        group: 'no-drop',
        handle: '.btn-move',
        onDragStart: function ($item, container, _super) {
            // Duplicate items of the no drop area
            if (!container.options.drop)
                $item.clone().insertAfter($item);
            _super($item, container);
        }
    });
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
                for (i of response) {
                    let result = $('<li data-num="' + i['id'] + '">\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-search__item">\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="ui-search__item-text">\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t ' + i['name'] + ' \n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</li>')
                    searchList.append(result)
                }
            }
        })
        searchProgress.addClass('hidden')
    }

    jdoc.on('keyup', '.search-categories__search', function () {
        if($(this).val().length>=2){
            searchProgress.removeClass('hidden')
            searchList.empty()
            setTimeout(searchCategories, 200);
        }
    })
    jdoc.on('click', '.search-categories__list li', function () {
        $('.search-categories__list li').removeClass('selected');
        $(this).addClass('selected');
        $('.search-categories__search').trigger('change');
    })
    jdoc.on('change', '.search-categories__search', function () {
        if ($('.search-categories__categories').find('.btn--selected').length >= maxCategories) {
        return false
        } else {
            let id = $('.search-categories__list li.selected').data('num')
            if ($('.search-categories__categories').find('.btn[data-id="' + id + '"]').length === 0) {
                let val = $('.search-categories__list li.selected').text()
                let category = $('<div class="col-auto">\n' +
                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class="btn btn--selected" data-id="' + id + '">' + val + '\n' +
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


    })
    jdoc.on('click', '.search-categories__categories .btn__delete', function (e) {
        $(this).parents('.col-auto').remove()
    })
    jdoc.on('click', '.js-select__b-office option', function (e) {
        $('.js-select__b-office option').removeClass('selected')
        $(this).addClass('selected')
    })

    //Карта
    ymaps.ready(init);
    function init() {
        var officeMap = new ymaps.Map("mapDrag", {
            center: [55.76, 37.64],
            zoom: 15,
            controls: []
        }, {
            searchControlProvider: 'yandex#search'
        })
        //Выбор офиса
        jdoc.on('change', '.js-select__b-office', function (e) {
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
                    'address':'Пример адреса',
                    'floor': '3',
                    'office': '206',
                    'additional':'Дополнительный комментарий',
                    'coords':{
                        'longitude':55.76,
                        'latitude':37.64
                    }
                }
            $('#update-address').val(answer['address']);
            $('#update-address-floor').val(answer['floor']);
            $('#update-address-office').val(answer['office']);
            $('#update-address-additional').val(answer['additional']);
            officeMap.geoObjects.removeAll()
            officeMap.geoObjects
                .add(new ymaps.GeoObject({
                    geometry: {
                        type: "Point",
                        coordinates: [answer['coords']['longitude'], answer['coords']['latitude']],
                        draggable: true
                    }
                }))
        })
        //Автозаполнение адреса
        jdoc.on('change', '#update-address', function (e) {
            let officeId = $(this).find('.ui-selectric-scroll .selected').data('index');
            // $.ajax({
            //     type: 'GET',
            //     url: 'https://api.github.com/users/starred',
            //     dataType: "json",
            //     data: officeId,
            //     success: function (response) {
            //     }
            // })
            var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
            var token = "e36246a169fd1131e98c47fc3c16a02848a05a6e";
            var query = $(this).val();

            var options = {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Token " + token,

                },
                body: JSON.stringify([query])
            }

            fetch(url, options)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log("error", error));
        })

    }
    //принудительно заполняю поля по загрузке страницы
    $('.js-select__b-office').trigger('change');

//    автозаполнение адреса
    $('#suggest-address').keyup(function () {

    })
//Добавление поля комментария для модератора
    jdoc.on('click', '.panel__settings-moderator .ui-link', function (e) {
       $(this).addClass('hidden');
       $(this).siblings('.ui-link').removeClass('hidden');
        $('.panel__settings-m-comment').toggleClass('hidden');
    })
//Блок с временем работы
    function SetWorkHours(elem, msg_1, msg_2){
        $(elem).find('.js-select').change(function () {
            let aroundTheClock = $(elem).find('.ui-check__input');
            let from = $(elem).find('.js-select').first().val();
            let to = $(elem).find('.js-select').last().val();
            if(from=='00:00' && to=='00:00'){
                var msg =msg_1;
                aroundTheClock.prop('checked', true)
            }else{
                var msg = msg_2 +from+' -- '+to;
                aroundTheClock.prop('checked', false)
            }
            // в дата таргет стоит id + # вначале,в верстке так изначально было
            $('.ui-worktime__period-btn[data-target="#'+ $(elem).attr('id')+'"]').text(msg);
        })
        $(elem).find('.ui-check__input').change(function () {
            if ($(this).is(":checked")==true){
                var msg = msg_1
                $(elem).find('.js-select').first().val('00:00').trigger('change');
                $(elem).find('.js-select').last().val('00:00').trigger('change');
                $('.ui-worktime__period-btn[data-target="#'+ $(elem).attr('id')+'"]').text(msg);
            }
        })
    }
    $('.ui-worktime__period [id *= "time"]').each( function (index, elem) {
        SetWorkHours(elem,'Круглосуточно','c ')
    })
    $('.ui-worktime__period [id *= "break"]').each( function (index, elem) {
        SetWorkHours(elem,'Без перерыва','перерыв ')
    })
    //сделал не на спанах внутри кнопки для уменьшения работы бека
    $('.ui-worktime__period-btn').each(function () {
        $(this).click(function () {
            let val =$(this).text().split(' ');
            let inputs = $(''+$(this).data('target')+'');
            let from = inputs.find('.js-select').first();
            let to = inputs.find('.js-select').last();
            let checkbox = inputs.find('.ui-check__input');
            if (val[0]=='Круглосуточно' || val[0]=='Без'){
                from.val('00:00').trigger('change');
                to.val('00:00').trigger('change');
                checkbox.prop('checked',true);
            }else {
                from.val(val[1]).trigger('change');
                to.val(val[3]).trigger('change');
                checkbox.prop('checked',true)
            }
        })
    })
})



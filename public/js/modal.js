$(document).ready(function() {
    let fileUploader=$('.ui-upload__add-files');
    let modalFormData= new FormData()
   //открытие модалки, у элемента, вызывающего модалку должен быть класс modal__opener и атрибут data-modal, в котором должен лежать класс модалки, которую этот компонент вызывает
    $('.modal__opener').click( function(e){
        e.preventDefault(); // для того чтобы можно было вызывать модалку ссылками
        let modal = $(this).data('modal')
        $('body').addClass('modal-opened')
        $('.'+modal+' .modal-dialog').animate({opacity: 1, margin: '0%'}, 400);
        $('.'+modal+'').addClass('show')
        $('.modal.show').removeClass('hidden')

    });
    function closeModal(e){
        e.preventDefault(); // для того чтобы можно было закрывать модалку ссылками
        $('.modal.show .modal-dialog').animate({opacity: 0, margin: '-10% 0 0 0'}, 250, function() {
            $('body').removeClass('modal-opened')
            $('.modal.show').addClass('hidden')
            $('.modal.show').removeClass('show')
        });
    }
     // Закрытие модалки
    $('.modal__closer, .modal__button_close').click( function(e){
        closeModal(e)
    });

    // TODO кусок с принятием-отказом от правил и условий можно вынести в all-pages
    $('.accept-rules').change(function () {
        let button = $(this).data('allowSubmit')
        if($(this).is(':checked')){
            $('.'+button+'').removeAttr('disabled')
        }else{
            $('.'+button+'').attr('disabled',true)
        }
    })

    var uppy, uppy_init = false, uppy_locale_ru = {}, success_uploads = 0;

    var thumb_template =
        '<figure class="ui-upload__image">' +
        '    <img alt="" aria-hidden="true" src="%url%">' +
        '    <span class="ui-upload__delete" data-id="%id%">' +
        '    </span>' +
        '</figure>';

    // function uppy_events(t, uppy)
    // {
    //     var reply_form = t.closest('#reply-form'),
    //         old_html = t.html(),
    //         all_buttons = $('.upload-photo'),
    //         is_review_form = reply_form.length;
    //
    //     // unsubscribe old events
    //     uppy.off('upload');
    //     uppy.off('upload-error');
    //     uppy.off('upload-success');
    //     uppy.off('complete');
    //
    //     // subscribe to new events with new t
    //     uppy.on('restriction-failed', (file, error) => {
    //         toast(String(error).replace('Error:', ''), 'info');
    //     });
    //
    //     uppy.on('upload', (data) => {
    //         t.addClass('is-loading-right');
    //         all_buttons.prop('disabled', true);
    //         t.html('Загружается');
    //     });
    //
    //     uppy.on('upload-error', (file, error, response) => {
    //         toast('Загрузка не удалась. Пожалуйста, попробуйте ещё раз', 'error');
    //     });
    //
    //     uppy.on('upload-success', (file, response) => {
    //
    //         var result = response.body.data, r = JSON.parse(result);
    //         if (isJSON(result))
    //         {
    //
    //             if (typeof r.uploaded !== 'undefined' && r.uploaded > 0)
    //             {
    //                 success_uploads++;
    //             }
    //             else
    //             {
    //                 toast('Загрузка не удалась', 'info');
    //                 return;
    //             }
    //
    //         }
    //         else
    //         {
    //             toast('Загрузка не удалась', 'info');
    //             return;
    //         }
    //
    //         if (is_review_form)
    //         {
    //             var update_panel = reply_form.find('.ui-upload__images'),
    //                 update_panel_html = update_panel.html(),
    //                 attachments_input = reply_form.find('#review-attachments'),
    //                 attachments = attachments_input.val();
    //
    //             if (isJSON(result))
    //             {
    //                 var new_thumb;
    //
    //                 if (typeof r.meta[0] !== 'undefined')
    //                 {
    //                     attachments_input.val(attachments + ',' + r.meta[0].id);
    //
    //                     new_thumb = thumb_template.replace('%url%', window.page.ugc_cdn + r.meta[0].thumb);
    //                     new_thumb = new_thumb.replace('%id%', r.meta[0].id);
    //
    //                     update_panel.html(update_panel_html + new_thumb);
    //                 }
    //                 else
    //                 {
    //                     toast('Загрузка не удалась', 'info');
    //                 }
    //
    //             }
    //             else
    //             {
    //                 update_panel.html(success_uploads + ' фото добавлено и будет показано на странице');
    //             }
    //         }
    //
    //     });
    //
    //     uppy.on('complete', (result) => {
    //         t.removeClass('is-loading-right');
    //         all_buttons.prop('disabled', false);
    //         t.html(old_html);
    //
    //         uppy.resetProgress();
    //         uppy.reset();
    //
    //         if (!is_review_form)
    //         {
    //             if (success_uploads > 0)
    //             {
    //                 alrt('Фото добавлено<br/>'+ "\n" + 'Перезагрузка страницы..', 3);
    //             }
    //             else
    //             {
    //                 toast('Загрузка не удалась', 'info');
    //             }
    //         }
    //
    //     });
    // }
    //
    // jdoc.on('click', '.modal__upload-photo', function(e) {
    //
    //     // do not cache this vars
    //     var t = $(this)
    //
    //     e.preventDefault();
    //
    //     // если первый раз - то загрузим js + css
    //     if (!uppy_init)
    //     {
    //         // set loading state
    //         t.addClass('is-loading-right');
    //
    //         // load js + css
    //
    //         $.getScript(window.page.static_cdn + '../js/uppy.js?v=' + window.page.static_version, function() {
    //
    //
    //         })
    //             .done(function()
    //             {
    //                 console.log('eeee')
    //                 uppy = Uppy.Core({
    //                     id: 'uppy',
    //                     autoProceed: true,
    //                     allowMultipleUploads: true,
    //                     restrictions: {
    //                         maxFileSize: 16777216, // 16M
    //                         maxNumberOfFiles: 10,
    //                         minNumberOfFiles: 1,
    //                         allowedFileTypes: ['image/*', '.jpg', '.jpeg', '.png', '.gif', '.jfif', '.webp','.pdf']
    //                     },
    //                     locale: uppy_locale_ru
    //                 });
    //
    //                 uppy.setMeta({
    //                     page_type: window.page.type,
    //                     owner_id: window.page.id
    //                 });
    //
    //                 uppy.use(Uppy.FileInput, {
    //                     target: 'body',
    //                     pretty: false,
    //                     inputName: 'image[]'
    //                 });
    //
    //                 uppy.use(Uppy.ProgressBar, {
    //                     target: 'body',
    //                     fixed: true
    //                 });
    //
    //                 uppy.use(Uppy.XHRUpload, {
    //                     endpoint: '/api/upload',
    //                     fieldName: 'image[]',
    //                     limit: 2,
    //                     responseType: 'text',
    //                     getResponseData (responseText, response) {
    //                         return {
    //                             data: String(responseText).match(/({"uploaded".*]})/gm)
    //                         }
    //                     }
    //                 });
    //
    //                 uppy_events(t, uppy);
    //                     uppy.setOptions({
    //                         restrictions: { maxNumberOfFiles: 10 }
    //                     });
    //
    //
    //                 // set normal state
    //                 t.removeClass('is-loading-right');
    //
    //                 // click input
    //                 var uppy_input = uppy_input || $('input[type=file].uppy-FileInput-input');
    //                 uppy_input.focus().trigger('click');
    //             });
    //     }
    //
    //     else
    //     {
    //         var uppy_input = uppy_input || $('input[type=file].uppy-FileInput-input');
    //         uppy_events(t, uppy);
    //         uppy_input.focus().trigger('click');
    //     }
    //     // uppy.on('complete', (result) => {
    //     //     fileUploader.removeClass('is-loading-right');
    //     //     all_buttons.prop('disabled', false);
    //     //     t.html(old_html);
    //     //
    //     //     uppy.resetProgress();
    //     //     uppy.reset();
    //     //     if (success_uploads > 0)
    //     //     {
    //     //         alrt('Фото добавлено<br/>'+ "\n" + 'Перезагрузка страницы..', 3);
    //     //     }
    //     //     else
    //     //     {
    //     //         toast('Загрузка не удалась', 'info');
    //     //     }
    //     // });
    // });



    $(".modal__form").validate({
        errorClass: 'is-error',
        rules: {
            "category": {
                required: true,
            },
            "page": {
                required: true,
            },
            "email": {
                email: true,
                required: true,
            },
            "title": {
                required: true,
            },
            "description": {
                required: true,
            },
        },
        messages: {
            "category": {
                required: "Поле обязательно для заполнения",
            },
            "page": {
                required: "Поле обязательно для заполнения",
            },
            "email": {
                email: "Введите корректный адрес почты",
                required: "Поле обязательно для заполнения",
            },
            "title": {
                required: "Поле обязательно для заполнения",
            },
            "description": {
                required: "Поле обязательно для заполнения",
            },
        },
        submitHandler: function (e) {
            e.preventDefault()
            let msg = $('.a-form__form').serializeArray();
                $.each(msg, function (key, input) {
                    modalFormData.append(input.name, input.value);
                });
                console.log(modalFormData)
            return false
        }
    });
});
$(document).ready(function() {
    //открытие модалки, у элемента, вызывающего модалку должен быть класс modal__opener и атрибут data-modal, в котором должен лежать класс модалки, которую этот компонент вызывает
    $('.modal__opener').click( function(e){
        e.preventDefault(); // для того чтобы можно было вызывать модалку ссылками
        let modal = $(this).data('modal')
        $('body').addClass('modal-opened')
        $('.'+modal+' .modal-dialog').animate({opacity: 1, margin: '20% auto'}, 250);
        $('.'+modal+'').addClass('show')
    });
    function closeModal(e){
        e.preventDefault(); // для того чтобы можно было закрывать модалку ссылками
        $('body').removeClass('modal-opened')
        $('.modal.show .modal-dialog').animate({opacity: 0, margin: '15% auto'}, 250);
        $('.modal.show').removeClass('show')
    }
     // Закрытие модалки
    $('.modal__closer').click( function(e){
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

    uppy.on('upload', (data) => {
        t.addClass('is-loading-right');
        all_buttons.prop('disabled', true);
        t.html('Загружается');
    });

    uppy.on('upload-error', (file, error, response) => {
        toast('Загрузка не удалась. Пожалуйста, попробуйте ещё раз', 'error');
    });

    uppy.on('upload-success', (file, response) => {

    })
});
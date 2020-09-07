$(document).ready(function() {
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
    // uppy.on('upload', (data) => {
    //     t.addClass('is-loading-right');
    //     all_buttons.prop('disabled', true);
    //     t.html('Загружается');
    // });
    //
    // uppy.on('upload-error', (file, error, response) => {
    //     toast('Загрузка не удалась. Пожалуйста, попробуйте ещё раз', 'error');
    // });
    //
    // uppy.on('upload-success', (file, response) => {
    //
    // })
});
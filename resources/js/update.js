// первый блок radio click
jdoc.on('click', '.ui-check', function(e){

	var t = $(this), val = t.find('.ui-check__input').val();

	if (val === 'update')
	{
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

jdoc.on('change', '.js-worktime-checkbox', function() {

	if ( $(this).is(':checked') ) {
		$(this).closest('.js-worktime').addClass('is-active');
	} else {
		$(this).closest('.js-worktime').removeClass('is-active');
		$(this).closest('.js-worktime').find('.js-worktime-btn').removeClass('is-active');
		$(this).closest('.js-worktime').find('.js-worktime-content').hide();
	}

});



jdoc.on('click', '.js-worktime-btn', function(e) {
	e.preventDefault();
	var targetId = $(this).data('target');

	$(this).closest('.js-worktime').find('.js-worktime-content').hide();

	if ( $(this).is('.is-active') ) {
		$(this).removeClass('is-active');
	} else {
		$(this).closest('.js-worktime').find('.js-worktime-btn').removeClass('is-active');
		$(this).addClass('is-active');
		$(this).closest('.js-worktime').find(targetId).show();
	}

});


jdoc.on('click', '.js-worktime-comment-btn, .js-worktime-comment-cancel', function(e) {
	e.preventDefault();

	if ( $(this).closest('.js-worktime-comment').is('.is-open') ) {

		$(this).closest('.js-worktime-comment').removeClass('is-open');

	} else {

		$(this).closest('.js-worktime-comment').addClass('is-open');
	}

});
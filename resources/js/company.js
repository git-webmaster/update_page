	// set map css

	var static_map = static_map || $('#static_map'), mapx = 350, mapy = 350;

	if (window.page.user_device === 'tablet')
	{
		mapx = 650;
		mapy = 350;
	}

	if (typeof window.page.lon !== 'undefined' && typeof window.page.lat !== 'undefined' && window.page.lon !== '0' && window.page.lat !== '0')
	{
		var map_url = 'https://static-maps.yandex.ru/1.x/?l=map&lang=ru-Ru&size=' + mapx + ',' + mapy + '&z=16&ll=' + window.page.lon + ',' + window.page.lat;
		static_map.css('background-image', 'url("' + map_url + '")');
	}

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

	// скролл по клику на верхние кнопки
	jdoc.on('click', '.company__taglist-link:not(#el-directions)', function(e) {

		e.preventDefault();

		var t = t || $(this),
			offset = $(t.attr('href')).offset().top;

		scroll(offset, 150);
	});

	// --------------------------------------------------------------------------
	// Отзывы
	// --------------------------------------------------------------------------

	// кнопка показать ответы
	jdoc.on('click', '.panel__comment-answers-loadmore', function(e) {
		e.preventDefault();

		var t = t || $(this),
			parent = parent || t.closest('.panel__comment-parent'),
			replies = replies || parent.find('.panel__comment-answers');

		t.hide();
		replies.removeClass('is-open').addClass('is-open');
	});

	// кнопка скрыть ответы
	jdoc.on('click', '.panel__comment-answers-close', function(e) {
		e.preventDefault();

		var t = t || $(this),
			parent = parent || t.closest('.panel__comment-parent'),
			show_replies_button = show_replies_button || parent.find('.panel__comment-answers-loadmore'),
			replies = replies || parent.find('.panel__comment-answers'),
			this_loadmore_button = this_loadmore_button || parent.find('.btn--loadmore');

		replies.removeClass('is-open');
		show_replies_button.show();
		this_loadmore_button.removeClass('loadmore-hidden');

	});

	// нажатие на полоску ответов - скролл к родительскому комментарию
	jdoc.on('click', '.panel__comment-answers-line', function(e) {
		var t = t || $(this),
			parent = parent || t.closest('.panel__comment-parent'),
			parent_offset = parseInt(parent.offset().top, 10);

		if (typeof parent_offset !== 'undefined' && parent_offset >= 0)
		{
			scroll(parent_offset, 300);
		}
	});

	jdoc.on('click', '.panel__comment-user-name', function(e) {
		e.preventDefault();

		var t = t || $(this),
			parent = parent || t.closest('.panel__comment'),
			contacts_link = contacts_link || parent.find('.review-menu-contacts');

			contacts_link.trigger('click');
	});

	// меню отзыва - кнопка контакты
	jdoc.on('click', '.review-menu-contacts', function(e) {
		var t = t || $(this),
			contacts,
			meta_tag = meta_tag || t.closest('.panel__comment').find('.review_meta'),
			meta_content = meta_content || meta_tag.attr('content');

		if (meta_content.length)
		{
			var meta_b64 = Base64.decode(meta_content);

			if (isJSON(meta_b64))
			{
				contacts_string = JSON.parse(meta_b64);
				contacts = contacts_string[0].split(":::");

				if (contacts.length)
				{
					var alert_string = '';

					if (contacts[0].length)
					{
						alert_string += "<b>Телефон:</b><br/>" + contacts[0] + "<br/><br/>";
					}

					if (contacts[1].length)
					{
						alert_string += "<b>Email:</b><br/>" + contacts[1];
					}

					if (alert_string.length)
					{
						alrt(alert_string);
					}
				}
			}
		}
	});


	// меню отзыва - пожаловатсья
	var review_abuse_id, review_abuse_reason;

	jdoc.on('click', '.review-menu-abuse, .ui-voice__btn--abuse', function(e){
		e.preventDefault();

		var t = t || $(this),
			parent_review = t.closest('.panel__comment'),
			review_container = parent_review.find('.panel__comment-container:first'),
			review_id = parent_review.data('id');

		review_abuse_id = review_id;
		review_abuse_reason = 0;

		review_container.removeClass('border-abuse').addClass('border-abuse');

		html_template =
			'<form>' +
			'<ul class="ui-check-vertical ta-left mt10">' +
			'<li>' +
			'<label class="ui-check ui-check--dark">' +
			'<input class="ui-check__input" type="radio" name="abuse" value="abuse-spam" />' +
			'<span class="ui-check__wrapper"><span class="ui-check__radio"></span><span class="ui-check__text">Это спам</span></span>' +
			'</label>' +
			'</li>' +
			'<li>' +
			'<label class="ui-check ui-check--dark">' +
			'<input class="ui-check__input" type="radio" name="abuse" value="abuse-curse" />' +
			'<span class="ui-check__wrapper"><span class="ui-check__radio"></span><span class="ui-check__text">Оскорбление</span></span>' +
			'</label>' +
			'</li>' +
			'<li>' +
			'<label class="ui-check ui-check--dark">' +
			'<input class="ui-check__input" type="radio" name="abuse" value="abuse-pd" />' +
			'<span class="ui-check__wrapper"><span class="ui-check__radio"></span><span class="ui-check__text">Персональные данные</span></span>' +
			'</label>' +
			'</li>' +
			'<li>' +
			'<label class="ui-check ui-check--dark">' +
			'<input class="ui-check__input" type="radio" name="abuse" value="abuse-dmca" />' +
			'<span class="ui-check__wrapper"><span class="ui-check__radio"></span><span class="ui-check__text">Нарушение авторских прав</span></span>' +
			'</label>' +
			'</li>' +
			'<li>' +
			'<label class="ui-check ui-check--dark">' +
			'<input class="ui-check__input" type="radio" name="abuse" value="abuse-xxx" />' +
			'<span class="ui-check__wrapper"><span class="ui-check__radio"></span><span class="ui-check__text">Непристойное содержание</span></span>' +
			'</label>' +
			'</li>' +
			'<li>' +
			'<label class="ui-check ui-check--dark">' +
			'<input class="ui-check__input" type="radio" name="abuse" value="abuse-drug" />' +
			'<span class="ui-check__wrapper"><span class="ui-check__radio"></span><span class="ui-check__text">Пропаганда наркотиков</span></span>' +
			'</label>' +
			'</li>' +
			'<li>' +
			'<label class="ui-check ui-check--dark">' +
			'<input class="ui-check__input" type="radio" name="abuse" value="abuse-anger" />' +
			'<span class="ui-check__wrapper"><span class="ui-check__radio"></span><span class="ui-check__text">Призыв к насилию</span></span>' +
			'</label>' +
			'</li>' +
			'</ul>' +
			'</form>';

		Swal.fire({
			title: 'Жалоба на отзыв ' + review_id,
			html: html_template,
			showCloseButton: true,
			showCancelButton: true,
			cancelButtonText: 'Отмена',
			confirmButtonText: 'Отправить жалобу',
			showLoaderOnConfirm: true,
			preConfirm: () => {

				if (review_abuse_reason === 0)
				{
					toast('Пожалуйста, укажите причину жалобы', 'info');
					review_container.removeClass('border-abuse');
				}
				else
				{
					return $.post('/api/token')
						.then((response) => {
							return $.ajax({
								type: "POST",
								cache: false,
								url: '/api/review/abuse',
								data: {
									token: response,
									page_type: window.page.type,
									id: review_abuse_id,
									value: review_abuse_reason,
									owner_id: window.page.id,
									fp: window.page.fp
								}
							})
						})
						.catch(() => {
							toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
							review_container.removeClass('border-abuse');
						})
				}
			}
		}).then((result) => {

			review_container.removeClass('border-abuse');

			if (typeof result.value !== 'undefined' && result.value.indexOf('1') !== -1)
			{
				alrt('✔️ Спасибо! <br/><br/> Мы проверим этот отзыв на соответствие правилам. Это займёт некоторое время — отзывы проверяются в порядке общей очереди. Повторно подавать жалобу не нужно.');
				return;
			}

			if (typeof result.value !== 'undefined' && result.value.indexOf('0') !== -1)
			{
				toast('Ваша жалоба на отзыв уже записана', 'info');
			}

		});
	});

	jdoc.on('click', 'label.ui-check', function(e){
		var t = $(this);
		review_abuse_reason = t.find('.ui-check__input').val();
	});

	// меню отзыва - закрепить
	var review_menu_pin_id, review_menu_pin_days;

	jdoc.on('click', '.review-menu-pin', function(e){
		e.preventDefault();

		var t = t || $(this),
			parent_review = parent_review || t.closest('.panel__comment');

		review_menu_pin_id = parent_review.data('id');

		parent_review.removeClass('panel__comment--special').addClass('panel__comment--special');

		html_template =
			'<button type="button" role="button" class="custom_days_btn is-active" data-days="7">' + '7 дней' + '</button>' +
			'<button type="button" role="button" class="custom_days_btn" data-days="14">' + '14 дней' + '</button>' +
			'<button type="button" role="button" class="custom_days_btn" data-days="30">' + '30 дней' + '</button>' +
			'<button type="button" role="button" class="custom_days_btn" data-days="90">' + '90 дней' + '</button>';

		Swal.fire({
			title: 'Закрепить отзыв сверху',
			html: html_template,
			showCloseButton: true,
			showCancelButton: true,
			confirmButtonText: 'Оплатить ' + window.page.prices.reviews['7'] + ' руб.',
			cancelButtonText: 'Отмена',
			})
			.then((result) => {
				parent_review.removeClass('panel__comment--special');
			});
	});

	jdoc.on('click', '.custom_days_btn', function(e) {
		e.preventDefault();

		var t = t || $(this),
			days_number = days_number || t.data('days'),
			all_buttons = all_buttons || $('.custom_days_btn');

		review_menu_pin_days = days_number;

		all_buttons.removeClass('is-active');
		t.addClass('is-active');

		$('.swal2-confirm').html('Оплатить ' + window.page.prices.reviews[days_number] + ' руб.');
	});

	jdoc.on('click', '.nsfw-disabled', function(e) {
		e.preventDefault();
		toast('Отзывы с неприемлемым контентом на этой странице запрещены', 'info');
	});

	// отзыв - загрузка NSFW отзыва
	jdoc.on('click', '.nsfw', function(e) {
		var t = t || $(this),
			parent = parent || t.closest('.panel__comment'),
			id = id || parent.data('id'),
			panel_images = panel_images || t.find('.panel__comment-images'),
			panel_message = panel_message || t.find('.panel__comment-message'),
			panel_control = panel_control || t.find('.panel__comment-control'),
			panel_toggle = panel_toggle || t.find('.ui-toggle'),
			panel_notice = panel_notice || t.find('.panel__comment-invisible-text'),
			old_html = old_html || panel_notice.html();

		panel_notice.html('Загружаю отзыв.. <div class="loader"></div>');

		$.when(getToken())
			.done(function(tk)
			{
				$.ajax({
					type     : "POST",
					cache    : false,
					url      : '/api/review/load_more',
					data     : {
						token: tk,
						page_type: window.page.type,
						id: id
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
								toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
								panel_notice.html(old_html);
							}

							if (r.status === 'success')
							{
								t.removeClass('nsfw');

								if (panel_images.length) panel_images.show();
								if (panel_control.length) panel_control.show();
								if (panel_toggle.length) panel_toggle.show();

								panel_message.html(r.info);
							}

						}
						else
						{
							toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
							panel_notice.html(old_html);
						}

					})
					.fail(function()
					{
						toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
						panel_notice.html(old_html);
					});
			})
			.fail(function()
			{
				toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
				panel_notice.html(old_html);
			});

	});

	// форма отзыва; set js data
	function makeReviewJsData()
	{
		var val_jsdata = val_jsdata || $('#review-jsdata'),
			js_data = {};

		// screen dimensions
		js_data.screen_w = window.screen.width || 0;
		js_data.screen_h = window.screen.height || 0;

		// browser dimension
		js_data.browser_w = window.screen.availWidth || 0;
		js_data.browser_h = window.screen.availHeight || 0;

		// referer
		js_data.referer = document.referrer;

		// ua
		js_data.ua = navigator.userAgent;

		// fp
		js_data.fp = window.page.fp || 0;

		// tor
		js_data.tor = window.page.tor;

		if (val_jsdata.length)
		{
			val_jsdata.val(Base64.encodeURI(JSON.stringify(js_data)));
			return true;
		}

		return false;
	}

	// голосование за отзыв
	jdoc.on('click', '.ui-voice .ui-voice__btn:not(.ui-voice__btn--abuse)', function(e)
	{
		e.preventDefault();

		var t = t || $(this),
			parent = parent || t.closest('.panel__comment'),
			this_review = this_review || t.closest('.panel__comment-container'),
			review_id = review_id || parent.data('id'),
			result_area = result_area || this_review.find('.ui-voice__number'),
			old_html = result_area.html(),
			review_buttons = review_buttons || this_review.find('.ui-voice__btn:not(.ui-voice__btn--abuse)'),
			value = value || t.hasClass('ui-voice__btn--like') ? 1 : -1;

		var voiceReset = function(already_voted = true){

			review_buttons.prop('disabled', false);
			result_area.removeClass('loading-1-3 loading-grey');
			result_area.html(old_html);

			if (already_voted)
			{
				toast('Вы уже голосовали за этот комментарий', 'info');
			}
			else
			{
				toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
			}
		};

		result_area.toggleClass('loading-1-3 loading-grey').html('');
		review_buttons.prop('disabled', true);

		$.when(getToken()).done(function(tk)
		{
			return $.ajax({
				type     : "POST",
				cache    : false,
				url      : '/api/review/vote',
				data     : {
					token: tk,
					page_type: window.page.type,
					id: review_id,
					value: value
				},
				})
				.done(function(data) {

					// Cant vote no more
					if (data.indexOf('5001') !== -1)
					{
						voiceReset();
					}
					else
					{
						result_area.removeClass('loading-1-3 loading-grey');
						review_buttons.css('opacity', '0.4');
						review_buttons.prop('disabled', true);

						if ($.isNumeric(data))
						{
							result_area.html(data);
						}
						else
						{
							result_area.html(value);
						}
					}
				})
				.fail(function() {
					voiceReset(false);
				});
		});
	});

	// голосование за wiki card
	jdoc.on('click', '.panel__card .ui-voice__btn', function(e)
	{
		e.preventDefault();

		var t = t || $(this),
			parent = parent || t.closest('.panel__card'),
			card_id = card_id || parent.data('id'),
			card_type = card_type || parent.data('type'),
			result_area = result_area || parent.find('.ui-voice__number'),
			old_html = result_area.html(),
			card_buttons = card_buttons || parent.find('.ui-voice__btn'),
			value = value || t.hasClass('ui-voice__btn--like') ? 1 : -1;

		var voiceReset = function(already_voted = true){

			card_buttons.prop('disabled', false);
			result_area.removeClass('loading loading-grey');
			result_area.html(old_html);

			if (already_voted)
			{
				toast('Вы уже голосовали за эту карточку', 'info');
			}
			else
			{
				toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
			}
		};

		result_area.toggleClass('loading loading-grey').html('');
		card_buttons.prop('disabled', true);

		$.when(getToken()).done(function(tk)
		{
			return $.ajax({
				type     : "POST",
				cache    : false,
				url      : '/api/review/vote_wiki_card',
				data     : {
					token: tk,
					page_type: window.page.type,
					card_type: card_type,
					id: card_id,
					value: value
				},
			})
				.done(function(data) {

					// Cant vote no more
					if (data.indexOf('5001') !== -1)
					{
						voiceReset();
					}
					else
					{
						result_area.removeClass('loading loading-grey');
						card_buttons.css('opacity', '0.4');
						card_buttons.prop('disabled', true);

						if ($.isNumeric(data))
						{
							result_area.html(data);
						}
						else
						{
							result_area.html(value);
						}
					}
				})
				.fail(function() {
					voiceReset(false);
				});
		});
	});

	// форма отзыва; нажатие на кнопку Отмена
	jdoc.on('click', '#reply-form .reply-cancel', function(e) {
		e.preventDefault();

		var t = t || $(this),
			review_form = review_form || $('#reply-form'),
			all_loadmore_button = all_loadmore_button || $('.btn--loadmore');

		review_form.hide();
		all_loadmore_button.removeClass('loadmore-hidden');

		// пересчитаем позицию стики ads блока под фото
		jbody.trigger("sticky_kit:recalc");

	});

	// форма отзыва; нажатие на кнопки рейтинга
	jdoc.on('click', '#reply-form .ui-rating__btn', function(e)
	{
		e.preventDefault();

		var t = t || $(this),
			all_buttons = all_buttons || t.closest('.ui-rating').find('.ui-rating__btn'),
			rating = rating || t.attr('data-rating'),
			val_rating = val_rating || $('#review-rating');

		all_buttons.removeClass('is-active');
		t.addClass('is-active');
		val_rating.val(rating);

		// автоматически поставим тон
		if (rating >= 4)
		{
			$('#tone-2').trigger('click');
		}

		if (rating >= 3 && rating < 4)
		{
			$('#tone-1').trigger('click');
		}

		if (rating < 3)
		{
			$('#tone-0').trigger('click');
		}
	});

	// форма отзыва; нажатие на кнопку Добавить контакты
	jdoc.on('click', '#add-contacts', function(e)
	{
		e.preventDefault();

		var t = t || $(this),
			fields = fields || $('#row-phone, #row-email'),
			val_addcontacts = val_addcontacts || $('#review-addcontacts');

		if (fields.hasClass('hide'))
		{
			fields.removeClass('hide');
			fields.hide();
		}

		if (fields.hasClass('is-visible'))
		{
			t.html('Добавить контакты');

			fields.removeClass('is-visible');
			fields.hide();

			val_addcontacts.val(0);
		}
		else
		{
			t.html('Не добавлять контакты');
			fields.addClass('is-visible');
			fields.fadeIn(300);

			val_addcontacts.val(1);
		}

	});

	// форма отзыва; нажатие на кнопки тона
	jdoc.on('click', '#reply-form .ui-review__btn', function(e)
	{
		e.preventDefault();

		var t = t || $(this),
			all_buttons = all_buttons || t.closest('.ui-review').find('.ui-review__btn'),
			tone = tone || t.attr('data-tone'),
			val_tone = val_tone || $('#review-tone');

		all_buttons.removeClass('is-active');
		t.addClass('is-active');
		val_tone.val(tone);
	});

	// форма отзыва; нажатие на кнопку "кол-во закрепленных дней отзыва"
	jdoc.on('click', '.ui-pin__days .ui-check__btn', function(e)
	{
		var t = t || $(this),
			parent = parent || t.closest('.ui-check'),
			top_div = top_div || parent.closest('.ui-group'),
			all_inputs = all_inputs || parent.closest('.ui-group').find('input'),
			input = input || parent.find('input'),
			days = input.attr('data-count'),
			val_sticky = val_sticky || $('#review-sticky'),
			val_days = val_days || $('#review-sticky-days');

		if (top_div.hasClass('review-menu'))
		{
			return;
		}

		if (days.length)
		{
			all_inputs.prop('checked', false);
			val_sticky.val('1');
			val_days.val(days);
		}

	});

	// textarea edit trigger
	var textarea_edited = false;
	jdoc.on('input', '#send-textarea',function(){
		var t = t || $(this);
		textarea_edited = !!t.val().length;
	});

	// форма отзыва; нажатие на кнопку "добавить отзыв"
	jdoc.on('click', '.reply', function(e)
	{
		e.preventDefault();

		if (window.page.not_allow_reviews)
		{
			toast('Здесь нельзя добавлять новые отзывы', 'info');
			return;
		}

		var t = t || $(this),
			t_name = t_name || t.closest('.panel__comment').find('.panel__comment-user-name').html(),
			review_form = review_form || $('#reply-form'),
			textarea_form = textarea_form || $('#send-textarea'),
			attach_parent = attach_parent || t.closest('.attach-form-here'),
			parent = parent || t.closest('.panel__comment-parent'),
			parent_review_id = parent_review_id || parent.attr('data-id'),
			review_tone_buttons = review_tone_buttons || $('.panel__form-rate-content, .panel__form-rate, .panel__form-pin'),
			val_jsdata = val_jsdata || $('#review-jsdata'),
			val_parent = val_parent || $('#review-parent'),
			val_rating = val_rating || $('#review-rating'),
			val_tone = val_tone || $('#review-tone'),
			val_sticky = val_sticky || $('#review-sticky'),
			val_days = val_days || $('#review-sticky-days'),
			all_pin_inputs = all_pin_inputs || review_form.find('.ui-pin').find('.ui-check__input'),
			active_rating_button = active_rating_button || $('.ui-rating').find('.is-active'),
			active_tone_button = active_tone_button || $('.ui-review').find('.is-active'),
			upload_parent = upload_parent || review_form.find('.ui-upload'),
			this_loadmore_button = this_loadmore_button || parent.find('.btn--loadmore'),
			all_loadmore_button = all_loadmore_button || $('.btn--loadmore'),
			form_name = form_name || $('#form-name');

		if (!val_jsdata.val().length)
		{
			makeReviewJsData();
		}

		review_form.hide();
		review_form.detach();

		all_loadmore_button.removeClass('loadmore-hidden');
		this_loadmore_button.addClass('loadmore-hidden');

		attach_parent.after(review_form);

		if (parent_review_id)
		{
			if (window.matchMedia('(max-width: 767px)').matches)
			{
				upload_parent.addClass('margin-b-20');
			}

			review_tone_buttons.hide();
			textarea_form.attr('placeholder', 'Напишите ваш ответ здесь');

			if (!textarea_edited && t_name.trim() !== 'Анонимно')
			{
				textarea_form.val(t_name.trim() + ', ');
			}

			all_pin_inputs.prop('checked', false);
			val_parent.val(parent_review_id);
			val_rating.val('');
			val_tone.val('');

			val_days.val('');
			val_sticky.val('');

			review_form.find('.js-pin-btn').prop('checked', false);
			review_form.find('.js-pin').removeClass('is-open').find('.js-pin-content').slideUp('150');
			unpined();
		}
		else
		{
			review_tone_buttons.show();
			textarea_form.attr('placeholder', 'Напишите ваш отзыв здесь');

			if (!textarea_edited)
			{
				textarea_form.val('');
			}

			val_parent.val('');
			val_rating.val(active_rating_button.attr('data-rating'));
			val_tone.val(active_tone_button.attr('data-tone'));
		}

		review_form.fadeIn(300);

		if (form_name.val().length)
		{
			textarea_form.focus();
		}
		else
		{
			form_name.focus();
		}

		// пересчитаем позицию стики ads блока под фото
		jbody.trigger("sticky_kit:recalc");
	});

	// клик по верхней кнопке написать отзыв
	jdoc.on('click', '.top-reply', function(e) {
		e.preventDefault();

		if (window.page.not_allow_reviews)
		{
			toast('Здесь нельзя добавлять новые отзывы', 'info');
			return;
		}

		var main_button = $('.panel__add > button.reply'),
			offset = main_button.offset().top;

		main_button.trigger('click');
		scroll(offset, 150);
	});

	// ф-я сброса кнопки "отправить отзыв" в исходное сотояние
	function resetSendButton()
	{
		var send_button = send_button || $('#send-review');

		send_button.removeClass('is-loading-right');
		send_button.prop('disabled', false);
		send_button.html('Отправить');
	}

	// ф-я для отправки отзыва
	function SendReview(token, page_type, review_data)
	{
		var send_button = send_button || $('#send-review');

		send_button.html('Отправляю отзыв');

		$.when(getToken())
			.done(function(tk)
			{
				return 	$.ajax({
					type     : "POST",
					cache    : false,
					url      : '/api/review/new',
					data     : {
						token: tk,
						page_type: page_type,
						review_data: review_data
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
								alrt(r.info,  2);
								resetSendButton();
							}

							if (r.status === 'success')
							{
								send_button.html('Успех! Перезагружаю страницу');
								$('#send-textarea').garlic('destroy');
								location.reload();
							}

						}
						else
						{
							toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
							resetSendButton();
						}

					})
					.fail(function()
					{
						toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
						resetSendButton();
					});
			})
			.fail(function(){

			});
	}

	function CheckNSFW_SendReview(token, text, page_type, review_data)
	{
		$.ajax({
			type     : "POST",
			cache    : false,
			url      : '/api/review/nsfw',
			data     : {
				token: token,
				value: text
			},
			})
			.done(function(data)
			{
				response = data.charAt(0);

				// если нецензурный отзыв
				if ($.isNumeric(response) && response === '1')
				{
					var nsfw_warning = 'Мы можем опубликовать ваш отзыв, но он будет скрыт за предупреждением';

					if (window.page.not_show_nsfw_reviews === '1')
					{
						nsfw_warning = 'Ваш отзыв будет скрыт до тех пор, пока его не проверит модератор';
					}

					Swal.fire({
						title: 'Обнаружена ненормативная лексика',
						text: nsfw_warning,
						showCancelButton: true,
						focusCancel: true,
						confirmButtonText: 'Опубликовать отзыв',
						cancelButtonText: 'Исправить',
						icon: 'error',
						iconHtml: "18+",
						})
						.then((result) =>
						{
							if (result.value)
							{
								SendReview(token, page_type, review_data);
							}
							else
							{
								resetSendButton();
								$('#send-textarea').focus();
							}
					});
				}
				else
				{
					SendReview(token, page_type, review_data);
				}
			})
			.fail(function()
			{
				toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
				resetSendButton();
			});
	}

	// отправка отзыва
	jdoc.on('submit', '#review-data', function(e){

		e.preventDefault();

		var t = t || $(this),
			send_button = send_button || $('#send-review'),
			text = text || $('#send-textarea').val(),
			review_data = t.serializeArray();

		send_button.addClass('is-loading-right');

		send_button.prop('disabled', true);
		send_button.html('Подготовка к отправке');

		$.when(getToken())
			.done(function(tk)
			{
				return CheckNSFW_SendReview(tk, text, window.page.type, review_data);
			})
			.fail(function()
			{
				toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
				resetSendButton();
			});
	});

	// загрузка полного отзыва
	function resetLoadMoreButton(t, old_html) {
		t.removeClass('is-loading-right');
		t.prop('disabled', false);
		t.html(old_html);
	}

	jdoc.on('click', '.review-load-more', function(e) {

		var t = t || $(this),
			id = id || t.data('id'),
			text_container = text_container || t.closest('.panel__comment-message'),
			old_html = old_html || t.html();

		t.addClass('is-loading-right');
		t.prop('disabled', true);
		t.html('Загружаю отзыв');

		$.when(getToken())
			.done(function(tk)
			{
				$.ajax({
					type     : "POST",
					cache    : false,
					url      : '/api/review/load_more',
					data     : {
						token: tk,
						page_type: window.page.type,
						id: id
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
								toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
								resetLoadMoreButton(t, old_html);
							}

							if (r.status === 'success')
							{
								text_container.html(r.info);
							}

						}
						else
						{
							toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
							resetLoadMoreButton(t, old_html);
						}

					})
					.fail(function()
					{
						toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
						resetLoadMoreButton(t, old_html);
					});
			})
			.fail(function()
			{
				toast('Ошибка. Пожалуйста, попробуйте ещё раз позже', 'info');
				resetLoadMoreButton(t, old_html);
			});


	});

	// проверка, есть ли кнопка loadmore-reviews во вьюпорте
	var more_reviews_loading = false, pages_loaded = 1,
		pagination_dynamic_template = '<div class="panel__pagination pagination_dynamic"> <div class="panel__pagination-container"> <ul class="panel__pagination-menu"> <li class="pagination_dynamic_first"> <a class="panel__pagination-link" href="?page=%1%&noautoload#el-reviews"> %1% </a> </li> <li class="pagination_dynamic_second"> <a class="panel__pagination-link is-active" href="?page=%2%&noautoload#el-reviews"> %2% </a> </li> <li class="pagination_dynamic_third"> <a class="panel__pagination-link" href="?page=%3%&noautoload#el-reviews"> %3% </a> </li> </ul> </div> </div>';

	function load_more_reviews()
	{

		if (pages_loaded >= window.page.total_pages)
		{
			return;
		}

		var loadmore_button = $('.loadmore-reviews'),
			loadmore_parent = loadmore_parent || loadmore_button.closest('.panel'),
			pagination_panel = pagination_panel || $('.panel__pagination'),
			old_html = loadmore_button.html(),
			reviews_list = reviews_list || $('.reviews_list'),
			error_message = 'Автоматическая загрузка отзывов не удалась. Пожалуйста, попробуйте ещё раз';

		if (loadmore_parent.hasClass('hidden'))
		{
			return;
		}

		if (window.page.noautoload !== false)
		{
			loadmore_parent.hide();
			return;
		}

		more_reviews_loading = true;
		loadmore_button.html('Загружаю следующие отзывы <div class="loader"></div>').prop('disabled', true);

		$.when(getToken())
			.done(function(tk)
			{
				$.ajax({
					type     : "POST",
					cache    : false,
					url      : '/api/review/load_next',
					data     : {
						token: tk,
						page_type: window.page.type,
						id: window.page.id,
						value: window.page.reviews_offset + window.page.reviews_limit,
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
								more_reviews_loading = false;
								loadmore_button.html(error_message).prop('disabled', false);
							}

							if (r.status === 'success')
							{
								var page_number = window.page.current_page + pages_loaded;

								pages_loaded++;
								more_reviews_loading = false;

								//history.pushState({}, "title " + page_number, "?page="  + page_number);

								if (page_number >= window.page.total_pages)
								{
									loadmore_parent.remove();
								}
								else
								{
									loadmore_button.html(old_html).prop('disabled', false);
								}

								window.page.reviews_offset = window.page.reviews_offset + window.page.reviews_limit;

								pagination_panel.hide();
								var dynamic_pagination = pagination_dynamic_template.replaceAll('%1%', page_number-1).replaceAll('%2%', page_number).replaceAll('%3%', page_number+1);

								reviews_list.append(JSON.parse(r.info));
								pagination_panel.html(dynamic_pagination).show();
								initTooltipster();

								if (window.page.total_pages === page_number)
								{
									pagination_panel.hide();
								}
							}

						}
						else
						{
							more_reviews_loading = false;
							loadmore_button.html(error_message).prop('disabled', false);
						}

					})
					.fail(function()
					{
						more_reviews_loading = false;
						loadmore_button.html(error_message).prop('disabled', false);
					});
			})
			.fail(function()
			{
				more_reviews_loading = false;
				loadmore_button.html(error_message).prop('disabled', false);
			});
	}

	jwindow.on('resize scroll', function(){

		// loadmore button
		var loadmore_button_visible = $('.loadmore-reviews').isInViewport();

		if (loadmore_button_visible && !more_reviews_loading)
		{
			load_more_reviews();
		}
	});

	jdoc.on('click', '.loadmore-reviews', function(e) {
		e.preventDefault();

		if (!more_reviews_loading)
		{
			load_more_reviews();
		}
	});

	// --------------------------------------------------------------------------
	// Load Readmore
	// --------------------------------------------------------------------------

	var js_readmore = js_readmore || $('.js-readmore');
	if (js_readmore.length)
	{
		js_readmore.readmore({
			speed: 200,
			collapsedHeight: 200,
			heightMargin: 0,
			moreLink: '<button class="panel__offer-readmore-btn">Читать дальше</button>',
			lessLink: '<button class="panel__offer-readmore-btn">Свернуть</button>',
			embedCSS: true,
			blockCSS: 'display: inline-block;',
			startOpen: false,
			beforeToggle: function () {
			},
			afterToggle: function () {
			},
			blockProcessed: function () {
			}
		});
	}

	var js_more_phones = js_more_phones || $('.js-more-phones');
	if (js_more_phones.length)
	{
		var phones_count = '';

		if (window.page.phones_number > 0)
		{
			phones_count = ' (' + window.page.phones_number + ')';
		}

		js_more_phones.readmore({
			speed: 200,
			collapsedHeight: 124,
			heightMargin: 16,
			moreLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Показать все номера' + phones_count +
				'<svg class="icon-arrow-down" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			lessLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Свернуть\n' +
				'<svg class="icon-arrow-down top0 rotated" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			embedCSS: false,
			blockCSS: '',
			startOpen: false,
			beforeToggle: function() {},
			afterToggle: function() {},
			blockProcessed: function() {}
		});
	}

	var js_more_faxes = js_more_faxes || $('.js-more-faxes');
	if (js_more_faxes.length)
	{
		var faxes_count = '';

		if (window.page.faxes_number > 0)
		{
			faxes_count = ' (' + window.page.faxes_number + ')';
		}

		js_more_faxes.readmore({
			speed: 200,
			collapsedHeight: 124,
			heightMargin: 16,
			moreLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Показать все факсы' + faxes_count +
				'<svg class="icon-arrow-down" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			lessLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Свернуть\n' +
				'<svg class="icon-arrow-down top0 rotated" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			embedCSS: false,
			blockCSS: '',
			startOpen: false,
			beforeToggle: function() {},
			afterToggle: function() {},
			blockProcessed: function() {}
		});
	}

	var js_more_address = js_more_address || $('.js-more-address');
	if (js_more_address.length)
	{
		var address_count = '';

		if (window.page.branches_number > 0)
		{
			address_count = ' (' + window.page.branches_number + ')';
		}

		js_more_address.readmore({
			speed: 200,
			collapsedHeight: 55,
			heightMargin: 10,
			moreLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Показать все адреса' + address_count +
				'<svg class="icon-arrow-down" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			lessLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Свернуть\n' +
				'<svg class="icon-arrow-down top0 rotated" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			embedCSS: false,
			blockCSS: '',
			startOpen: false,
			beforeToggle: function() {},
			afterToggle: function() {},
			blockProcessed: function() {}
		});
	}

	var js_more_branches = js_more_branches || $('.js-more-branches');
	if (js_more_branches.length)
	{
		var address_count = '';

		if (window.page.branches_number > 0)
		{
			address_count = ' (' + window.page.branches_number + ')';
		}

		js_more_branches.readmore({
			speed: 200,
			collapsedHeight: 80,
			heightMargin: 10,
			moreLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Показать все филиалы' + address_count +
				'<svg class="icon-arrow-down" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			lessLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Свернуть\n' +
				'<svg class="icon-arrow-down top0 rotated" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			embedCSS: false,
			blockCSS: '',
			startOpen: false,
			beforeToggle: function() {},
			afterToggle: function() {},
			blockProcessed: function() {}
		});
	}

	var js_more_video = js_more_video || $('.js-more-video');
	if (js_more_video.length)
	{
		var videos_count = '';

		if (window.page.videos_number > 0)
		{
			videos_count = ' (' + window.page.videos_number + ')';
		}

		js_more_video.readmore({
			speed: 200,
			collapsedHeight: 95,
			heightMargin: 10,
			moreLink: '<div class="panel__definition-control mbottom-15"><button class="btn btn--36 btn--whitelight js-more-btn">Показать ещё ' + videos_count +
				'<svg class="icon-arrow-down" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			lessLink: '<div class="panel__definition-control mbottom-15"><button class="btn btn--36 btn--whitelight js-more-btn">Свернуть\n' +
				'<svg class="icon-arrow-down top0 rotated" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			embedCSS: false,
			blockCSS: '',
			startOpen: false,
			beforeToggle: function() {},
			afterToggle: function() {},
			blockProcessed: function() {}
		});
	}

	// posts page only
	var js_more_post_address = js_more_post_address || $('#post-addresses');
	if (js_more_post_address.length)
	{
		js_more_post_address.readmore({
			speed: 200,
			collapsedHeight: 85,
			heightMargin: 10,
			moreLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Показать все адреса' +
				'<svg class="icon-arrow-down" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			lessLink: '<div class="panel__definition-control"><button class="btn btn--36 btn--whitelight js-more-btn">Свернуть\n' +
				'<svg class="icon-arrow-down top0 rotated" aria-hidden="true">\n' +
				'<use xlink:href="/sprites/sprite.svg#icon-arrow-down"></use>\n' +
				'</svg>\n' +
				'</button></div>',
			embedCSS: false,
			blockCSS: '',
			startOpen: false,
			beforeToggle: function() {},
			afterToggle: function() {},
			blockProcessed: function() {}
		});
	}

	// режим работы филиалов
	jdoc.on('click', '.panel__offices-btn', function(e){

		e.preventDefault();

		var t = t || $(this),
			all_buttons = all_buttons || $('.panel__offices-btn'),
			id = t.attr('data-id'),
			branch_table = branch_table || $('#' + id).html(),
			table = table || $('.panel__worktime-table');

		table.html(branch_table);
		table.fadeOut(150).fadeIn(150);

		all_buttons.removeClass('is-active');
		t.addClass('is-active');
	});

	// кнопка добавления контактов
	jdoc.on('click', '#add-contacts', function(e) {

		var t = t || $(this);

		if (t.hasClass('is-active'))
		{
			t.removeClass('is-active');
			$('#review-addcontacts').val('0');
		}
		else
		{
			t.addClass('is-active');
			$('#review-addcontacts').val('1');
		}

	});

	// кнопка оценок в мобильном отзыве
	jdoc.on('click', '#review-mobile-rate-control', function(e){

		var t = t || $(this),
			val_rating = val_rating || $('#review-rating'),
			val_tone = val_tone || $('#review-tone'),
			active_rating_button = active_rating_button || $('.ui-rating').find('.is-active'),
			active_tone_button = active_tone_button || $('.ui-review').find('.is-active');

		if (t.hasClass('is-active'))
		{
			t.removeClass('is-active');
			t.html('Поставить оценки');

			val_rating.val('');
			val_tone.val('');
		}
		else
		{
			t.addClass('is-active');
			t.html('Не ставить оценки');

			val_rating.val(active_rating_button.attr('data-rating'));
			val_tone.val(active_tone_button.attr('data-tone'));
		}

	});

	// переключатель видео
	jdoc.on('click', '.panel__video-btn', function(e){

		e.preventDefault();
		var t = t || $(this);

		if (!t.hasClass('is-active'))
		{
			var	current_template,
				all_buttons = all_buttons || $('.panel__video-btn'),
				id = t.attr('data-id'),
				all_videos = window.videos,
				video = $.grep(all_videos, function(e){ return e.id === id; }),
				video_type = video[0].video_type,
				video_id = video[0].video_id,
				video_container = video_container || $('.video-container');

			var youtube_template = '<iframe src="https://www.youtube.com/embed/' + video_id + '?autoplay=1" frameborder="0" allow="accelerometer; encrypted-media; autoplay; gyroscope; picture-in-picture" loading="lazy" allowfullscreen></iframe>';

			if (video_type === 'youtube')
			{
				current_template = youtube_template;
			}

			video_container.html(current_template);
			all_buttons.removeClass('is-active');
			t.addClass('is-active');

			// прокрутим экран к видео
			var video_container_offset = video_container.offset().top - 10;
			scroll(video_container_offset, 250);
		}
	});

	// --------------------------------------------------------------------------
	// Load Owl Carousel
	// --------------------------------------------------------------------------

	var owlPrev = '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.96916 15.8359C8.85445 15.9427 8.72266 15.9958 8.57371 15.9958C8.42494 15.9958 8.29314 15.9427 8.17862 15.8359L0.171757 8.36635C0.0572323 8.25963 0 8.13686 0 7.99797C0 7.85908 0.0572323 7.73608 0.171757 7.6293L8.17862 0.160334C8.29308 0.0535009 8.42488 0 8.57371 0C8.72266 0 8.85445 0.0533325 8.96892 0.160334L9.82794 0.961557C9.94265 1.06833 9.99982 1.19128 9.99982 1.33022C9.99982 1.46911 9.94265 1.59206 9.82794 1.69889L3.07562 7.99797L9.82812 14.2973C9.94283 14.4041 10 14.527 10 14.6658C10 14.8048 9.94283 14.9278 9.82812 15.0346L8.96916 15.8359Z" fill="currentColor"/></svg>',
		owlNext = '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.03084 15.8359L0.171877 15.0346C0.0571721 14.9278 0 14.8048 0 14.6658C0 14.527 0.0571721 14.4041 0.171877 14.2973L6.92438 7.99797L0.172058 1.69889C0.0573526 1.59206 0.000180543 1.46911 0.000180543 1.33022C0.000180543 1.19128 0.0573526 1.06833 0.172058 0.961557L1.03108 0.160334C1.14555 0.0533325 1.27734 0 1.42629 0C1.57512 0 1.70692 0.0535009 1.82138 0.160334L9.82824 7.6293C9.94277 7.73608 10 7.85908 10 7.99797C10 8.13686 9.94277 8.25963 9.82824 8.36635L1.82138 15.8359C1.70686 15.9427 1.57506 15.9958 1.42629 15.9958C1.27734 15.9958 1.14555 15.9427 1.03084 15.8359Z" fill="currentColor"/></svg>',
		owlPrevBig = owlPrev.replace('width="10"', 'width="15"').replace('height="16"', 'height="24"'),
		owlNextBig = owlNext.replace('width="10"', 'width="15"').replace('height="16"', 'height="24"');

	var js_owl_cards = js_owl_cards || $('.js-owl-cards');
	if (js_owl_cards.length > 0)
	{
		js_owl_cards.owlCarousel({
			loop: false,
			margin: 20,
			items: 1,
			nav: true,
			dots: false,
			navText: [owlPrev, owlNext],
			autoHeight: true,
			responsive: {
				480: {
					autoWidth: true,
					autoHeight: false
				}
			}
		});
	}

	var js_owl_gallery = js_owl_gallery || $('.js-owl-gallery');
	if (js_owl_gallery.length > 0)
	{
		js_owl_gallery.owlCarousel({
			loop: false,
			margin: 2,
			autoWidth: true,
			nav: true,
			dots: false,
			navText: [owlPrevBig, owlNextBig]
		});
	}

	var js_owl_places = js_owl_places || $('.js-owl-places');
	if (js_owl_places.length > 0)
	{
		js_owl_places.owlCarousel({
			items: 1,
			loop: false,
			margin: 20,
			nav: true,
			dots: false,
			navText: [owlPrev, owlNext],
			autoHeight: true,
			responsive: {
				768: {
					items: 2,
					autoHeight: false
				}
			}
		});
	}

	var js_owl_specials = js_owl_specials || $('.js-owl-specials');
	if (js_owl_specials.length > 0)
	{
		js_owl_specials.owlCarousel({
			autoWidth: true,
			loop: false,
			margin: 20,
			nav: true,
			dots: false,
			navText: [owlPrev, owlNext]
		});
	}

	var js_owl_reviews = js_owl_reviews || $('.js-owl-reviews');
	if (js_owl_reviews.length > 0)
	{
		js_owl_reviews.owlCarousel({
			autoWidth: true,
			loop: false,
			margin: 20,
			nav: true,
			dots: false,
			navText: [owlPrev, owlNext]
		});
	}

	// --------------------------------------------------------------------------
	// Load Autosize Textarea
	// --------------------------------------------------------------------------

	var textarea = textarea || $('textarea');

	autosize(textarea);

	textarea.on('focus', function()
	{
		$(this).closest('.ui-textarea-wrapper').addClass('is-focus');
	}).on('blur', function()
	{
		$(this).closest('.ui-textarea-wrapper').removeClass('is-focus');
	});

	// --------------------------------------------------------------------------
	// Pin
	// --------------------------------------------------------------------------

	function pined()
	{
		var ch = ch || $('.js-pin-input:checked'),
			days  = ch.data('days'),
			notice = ch.data('notice');

		$('.js-pin-notice').text(notice);
		$('.js-pin-text').text(' + Закрепить на ' + days);
	}

	function unpined()
	{
		$('.js-pin-text').text('');
	}

	jdoc.on('change', '.js-pin-btn', function()
	{
		var t = t || $(this),
			review_meta_sticky = review_meta_sticky || $('#review-sticky'),
			val_days = val_days || $('#review-sticky-days'),
			first_7days_input = first_7days_input || $('.ui-pin__days .first'),
			all_inputs = all_inputs || first_7days_input.closest('.ui-group').find('input'),
			first_7days_button = first_7days_button || first_7days_input.siblings('.ui-check__btn');

		if ( t.is(':checked') )
		{
			t.prop('checked', true).closest('.js-pin').addClass('is-open').find('.js-pin-content').slideDown('150');
			pined();

			if (review_meta_sticky.length)
			{
				first_7days_input.prop('checked', true);

				$('.js-pin-notice').text(first_7days_input.attr('data-notice'));
				$('.js-pin-text').text('');

				val_days.val('7');
				review_meta_sticky.val('1');
			}

		} else {
			t.prop('checked', false).closest('.js-pin').removeClass('is-open').find('.js-pin-content').hide();
			unpined();

			if (review_meta_sticky.length)
			{
				all_inputs.prop('checked', false);
				val_days.val('');
				review_meta_sticky.val('');
			}
		}

	});

	jdoc.on('change', '.js-pin-input', function()
	{
		pined();
	});

	// --------------------------------------------------------------------------
	// Load Photoswipe
	// --------------------------------------------------------------------------

	var openPhotoSwipe = function(id, array, parent)
	{
		var pswpElement = document.getElementById('pswp');

		var options =
		{
			index: id,
			history: false,
			focus: false,

			closeEl: true,
			captionEl: false,
			fullscreenEl: false,
			zoomEl: true,
			shareEl: false,
			counterEl: false,
			arrowEl: true,
			preloaderEl: true,

			showAnimationDuration: 0,
			hideAnimationDuration: 0,

			bgOpacity: 0.75,
			closeOnVerticalDrag: true

		};

		var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, array, options);

		gallery.listen('gettingData', function(index, item)
		{
			if (item.w < 1 || item.h < 1)
			{
				var img = new Image(),
					thumbnail = parent.find('.panel__gallery-link[data-photoswipe-id="' + index + '"] > img.panel__gallery-image')[0];

				if (thumbnail.length)
				{
					item.w = thumbnail.naturalWidth;
					item.h = thumbnail.naturalHeight;
				}

				img.onload = function()
				{
					item.w = this.naturalWidth;
					item.h = this.naturalHeight;

					gallery.updateSize(true);
				};

				img.src = item.src;
			}
		});

		gallery.init();
	};

	jdoc.on('click', '.panel__gallery-link', function(e) {

		e.preventDefault();

		var t = t || $(this),
			p = p || t.closest('.panel');

		if (!t.hasClass('review-upload'))
		{
			openPhotoSwipe($(this).data('photoswipe-id'), pswp_images, p);
		}
		else
		{
			var slide_id = t.data('photoswipe-id'),
				data_id = t.closest('.panel__comment').attr('data-id'),
				photoswipe_parent = $('.panel__comment[data-id=' + data_id + ']'),
				images_array = [],
				all_links = t.closest('.panel__comment-images').find('a.panel__gallery-link');

			// all hrefs to array
			all_links.each(function(){

				var t = $(this), href = t.attr('href'), is_nsfw = t.attr('data-nsfw');

				if (typeof is_nsfw !== 'undefined')
				{
					href = t.attr('data-href');
				}

				images_array.push({
					src: href,
					w: 0,
					h: 0
				});
			});

			openPhotoSwipe(slide_id, images_array, photoswipe_parent);
		}
	});

	// --------------------------------------------------------------------------
	// uppy file uploader
	// --------------------------------------------------------------------------

	var uppy, uppy_init = false, uppy_locale_ru = {}, success_uploads = 0;
	var thumb_template =
		'<figure class="ui-upload__image">' +
		'    <img alt="" aria-hidden="true" src="%url%">' +
		'    <span class="ui-upload__delete" data-id="%id%">' +
		'    </span>' +
		'</figure>';

	function uppy_events(t, uppy)
	{
		var reply_form = t.closest('#reply-form'),
			old_html = t.html(),
			all_buttons = $('.upload-photo'),
			is_review_form = reply_form.length;

		// unsubscribe old events
		uppy.off('upload');
		uppy.off('upload-error');
		uppy.off('upload-success');
		uppy.off('complete');

		// subscribe to new events with new t
		uppy.on('restriction-failed', (file, error) => {
			toast(String(error).replace('Error:', ''), 'info');
		});

		uppy.on('upload', (data) => {
			t.addClass('is-loading-right');
			all_buttons.prop('disabled', true);
			t.html('Загружается');
		});

		uppy.on('upload-error', (file, error, response) => {
			toast('Загрузка не удалась. Пожалуйста, попробуйте ещё раз', 'error');
		});

		uppy.on('upload-success', (file, response) => {

			var result = response.body.data, r = JSON.parse(result);

			if (isJSON(result))
			{

				if (typeof r.uploaded !== 'undefined' && r.uploaded > 0)
				{
					success_uploads++;
				}
				else
				{
					toast('Загрузка не удалась', 'info');
					return;
				}

			}
			else
			{
				toast('Загрузка не удалась', 'info');
				return;
			}

			if (is_review_form)
			{
				var update_panel = reply_form.find('.ui-upload__images'),
					update_panel_html = update_panel.html(),
					attachments_input = reply_form.find('#review-attachments'),
					attachments = attachments_input.val();

				if (isJSON(result))
				{
					var new_thumb;

					if (typeof r.meta[0] !== 'undefined')
					{
						attachments_input.val(attachments + ',' + r.meta[0].id);

						new_thumb = thumb_template.replace('%url%', window.page.ugc_cdn + r.meta[0].thumb);
						new_thumb = new_thumb.replace('%id%', r.meta[0].id);

						update_panel.html(update_panel_html + new_thumb);
					}
					else
					{
						toast('Загрузка не удалась', 'info');
					}

				}
				else
				{
					update_panel.html(success_uploads + ' фото добавлено и будет показано на странице');
				}
			}

		});

		uppy.on('complete', (result) => {
			t.removeClass('is-loading-right');
			all_buttons.prop('disabled', false);
			t.html(old_html);

			uppy.resetProgress();
			uppy.reset();

			if (!is_review_form)
			{
				if (success_uploads > 0)
				{
					alrt('Фото добавлено<br/>'+ "\n" + 'Перезагрузка страницы..', 3);
				}
				else
				{
					toast('Загрузка не удалась', 'info');
				}
			}

		});
	}

	jdoc.on('click', '.upload-photo', function(e) {

		// do not cache this vars
		var t = $(this),
			is_review_form = t.closest('#reply-form').length;

		e.preventDefault();

		// особые условия для формы отзывов
		if (uppy_init)
		{
			if (is_review_form)
			{
				uppy.setOptions({
					restrictions: { maxNumberOfFiles: 6 - success_uploads }
				});

				if (success_uploads >= 6)
				{
					toast('В отзыв можно добавить не более 6 фото', 'info');
					return;
				}
			}
			else
			{
				uppy.setOptions({
					restrictions: { maxNumberOfFiles: 10 }
				});
			}
		}

		// если первый раз - то загрузим js + css
		if (!uppy_init)
		{
			// set loading state
			t.addClass('is-loading-right');

			// load js + css
			fetchStyle(window.page.static_cdn + '/css/uppy.min.css?v=' + window.page.static_version).then(function() {});

			$.getScript(window.page.static_cdn + '/js/uppy.js?v=' + window.page.static_version, function() {

				uppy = Uppy.Core({
					id: 'uppy',
					autoProceed: true,
					allowMultipleUploads: true,
					restrictions: {
						maxFileSize: 16777216, // 16M
						maxNumberOfFiles: 10,
						minNumberOfFiles: 1,
						allowedFileTypes: ['image/*', '.jpg', '.jpeg', '.png', '.gif', '.jfif', '.webp']
					},
					locale: uppy_locale_ru
				});

				uppy.setMeta({
					page_type: window.page.type,
					owner_id: window.page.id
				});

				uppy.use(Uppy.FileInput, {
					target: 'body',
					pretty: false,
					inputName: 'image[]'
				});

				uppy.use(Uppy.ProgressBar, {
					target: 'body',
					fixed: true
				});

				uppy.use(Uppy.XHRUpload, {
					endpoint: '/api/upload',
					fieldName: 'image[]',
					limit: 2,
					responseType: 'text',
					getResponseData (responseText, response) {
						return {
							data: String(responseText).match(/({"uploaded".*]})/gm)
						}
					}
				});

				uppy_events(t, uppy);
				uppy_init = true;
			})
			.done(function()
			{
				// особые условия для формы отзывов
				if (is_review_form)
				{
					uppy.setOptions({
						restrictions: { maxNumberOfFiles: 6 - success_uploads }
					});
				}
				else
				{
					uppy.setOptions({
					restrictions: { maxNumberOfFiles: 10 }
					});
				}

				// set normal state
				t.removeClass('is-loading-right');

				// click input
				var uppy_input = uppy_input || $('input[type=file].uppy-FileInput-input');
				uppy_input.focus().trigger('click');
			});
		}
		else
		{
			var uppy_input = uppy_input || $('input[type=file].uppy-FileInput-input');
			uppy_events(t, uppy);
			uppy_input.focus().trigger('click');
		}
	});

	// удаляет только что загруженное фото
	jdoc.on('click', '.ui-upload__delete', function(e) {

		e.preventDefault();

		var t = $(this),
			parent = t.closest('figure'),
			id = t.attr('data-id'),
			reply_form = reply_form || $('#reply-form'),
			attachments_input = reply_form.find('#review-attachments'),
			attachments = attachments_input.val();

			Swal.fire({
				title: 'Удалить фото?',
				showCancelButton: true,
				confirmButtonText: 'Удалить',
				cancelButtonText: 'Отмена'
				})
				.then((result) => {

				if (result.value && attachments.indexOf(id) !== -1)
				{
					parent.css('opacity', '0.3');

					$.when(getToken()).done(function (tk)
					{
						$.ajax({
							type: "POST",
							cache: false,
							url: '/api/upload/delete',
							data: {
								token: tk,
								page_type: window.page.type,
								id: id
							},
							})
							.done(function (data)
							{
								if (data.indexOf('1') !== -1)
								{
									attachments = attachments.replace(',' + id, '');
									attachments_input.val(attachments);
									success_uploads--;
									parent.remove();
								}
							})
							.fail(function ()
							{
								parent.css('opacity', '1');
								toast('Ошибка. Попробуйте ещё раз', 'error');
							});
					});
				}
			});
	});

	// --------------------------------------------------------------------------
	// Map
	// --------------------------------------------------------------------------

	var maps_api_loaded = false, suggestions_api_loaded = false, map_loading, map_loaded;

	function init_map()
	{
		var map_button = map_button || $('.panel__map-activate'),
			map_parent = map_parent || map_button.closest('#map'),
			center = [window.page.lat, window.page.lon],
			marker;

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
				minZoom: 0,
				maxZoom: 19
			}});

		// yandex map onload
		L.Yandex.addInitHook('on', 'load', function () {
			map_loaded = true;
			map_button.hide();
			map_button.off('click');
			map_parent.off('click');
		});

		// create leaflet map
		var map = L.map('map', {
			center: center,
			zoom: 15,
			zoomAnimation: true
			});

		// clear leaflet attribution
		map.attributionControl
			.setPosition('bottomleft')
			.setPrefix('');

		// set fullscreen action and attach yandex to leaflet map
		L.yandex({ controlsContainerStyle: true })
			.on('load',function () {
				var y_map = this._yandex;
				var container = y_map.container;

				// fullscreen button action
				$('#ymaps_fullscreen').click(function (e){
					if (!container.isFullscreen()) {
						container.enterFullscreen();
					}
				});

				// Настройки метки
				thisOrganization = new ymaps.Placemark([window.page.lat, window.page.lon], {
					hintContent: window.page.name
				}, {
					preset: 'islands#redDotIcon'
				});

				//Разместить метку
				y_map.geoObjects.add(thisOrganization);

		}).addTo(map);

		// create and set fullscreen button + goto map page button

		// 1. Fullscreen button
		var fsControl =  L.Control.extend({
			options: {
				position: 'topright'
			},
			onAdd: function (map) {

				var parent = L.DomUtil.create('div');
					parent.classList.add('leaflet-bar');
					parent.classList.add('easy-button-container');
					parent.classList.add('leaflet-control');
					parent.classList.add('leaflet-inline');

				var button = document.createElement('button');
					button.id = "ymaps_fullscreen";
					button.classList.add('easy-button-button');
					button.classList.add('cursor-pointer');
					button.title="На весь экран";
					button.innerHTML = "&nbsp;";
					button.style.backgroundOrigin = 'content-box';
					button.style.backgroundImage = "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyOTguNjY3IDI5OC42NjciPjxkZWZzLz48cGF0aCBkPSJNNDIuNjY3IDE5MkgwdjEwNi42NjdoMTA2LjY2N1YyNTZoLTY0ek0wIDEwNi42NjdoNDIuNjY3di02NGg2NFYwSDB6TTE5MiAwdjQyLjY2N2g2NHY2NGg0Mi42NjdWMHpNMjU2IDI1NmgtNjR2NDIuNjY3aDEwNi42NjdWMTkySDI1NnoiLz48L3N2Zz4=)";

				parent.appendChild(button);
				return parent;
			}
		});

		// 2. Goto map page button
		var gotoControl =  L.Control.extend({
			options: {
				position: 'topright'
			},
			onAdd: function (map) {

				var parent = L.DomUtil.create('div');
				parent.classList.add('leaflet-bar');
				parent.classList.add('easy-button-container');
				parent.classList.add('leaflet-control');
				parent.classList.add('leaflet-inline');

				var button = document.createElement('button');
				button.id = "ymaps_goto";
				button.classList.add('easy-button-button');
				button.classList.add('cursor-pointer');
				button.title="Большая карта";
				button.innerHTML = "Большая карта";
				button.style.width = 'auto';

				L.DomEvent
					.addListener(button, 'click', L.DomEvent.stopPropagation)
					.addListener(button, 'click', L.DomEvent.preventDefault)
					.addListener(button, 'click', function () {

						var map_link_category = window.page.map_link;

						var mlc_win = window.open(map_link_category, '_blank');

						if (mlc_win)
						{
							mlc_win.focus();
						}
						else
						{
							window.location.href = map_link_category;
						}
					});

				parent.appendChild(button);
				return parent;
			}
		});

		//map.addControl(new fsControl());
		if (window.page.map_link.length > 1)
		{
			if (window.page.type === 'company')
			{
				map.addControl(new gotoControl());
			}
			else
			{
				map.addControl(new fsControl());
			}
		}

	}

	function load_map()
	{
		var map_button = map_button || $('.panel__map-activate');

		if (!map_loading && !map_loaded)
		{
			// load map js + css
			map_loading = true;
			map_button.html('Карта загружается<div class="loader"></div>');

			fetchStyle(window.page.static_cdn + '/css/leaflet.min.css?v=' + window.page.static_version).then(function() {});

			if (!maps_api_loaded)
			{
				$.getScript(window.page.yandex_maps_api, function() {

					maps_api_loaded = true;

					$.getScript(window.page.static_cdn + '/js/leaflet.js?v=' + window.page.static_version, function() {
						$.getScript(window.page.static_cdn + '/js/leaflet.plugins.min.js?v=' + window.page.static_version, function() {
							init_map();
						})
							.fail(function()
							{
								map_loading = false;
								map_loaded = false;
							});
						})
						.fail(function()
						{
							map_loading = false;
							map_loaded = false;
						});
					})
					.fail(function()
					{
						map_loading = false;
						map_loaded = false;
					});
			}
			else
			{
				$.getScript(window.page.static_cdn + '/js/leaflet.js?v=' + window.page.static_version, function() {
						$.getScript(window.page.static_cdn + '/js/leaflet.plugins.min.js?v=' + window.page.static_version, function() {
							init_map();
						})
						.fail(function()
						{
							map_loading = false;
							map_loaded = false;
						});
					})
					.fail(function()
					{
						map_loading = false;
						map_loaded = false;
					});
			}
		}
	}

	jdoc.on('click', '.panel__map-activate, #map', function(e){
		e.preventDefault();
		load_map();
	});

	// places map click
	jdoc.on('click', '.places_map_parent', function(e){
		e.preventDefault();

		if (window.page.map_link.length > 0)
		{
			window.open(window.page.map_link,"_blank");
		}
		else
		{
			toast('Не найдена карта для этой страницы', 'info');
		}

	});

	// --------------------------------------------------------------------------
	// Yandex StreetView
	// --------------------------------------------------------------------------

	var streetview_loading, streetview_loaded;

	function init_streetview()
	{
		var streetview = streetview || $('#streetview'),
			streetview_parent = streetview_parent || $('#streetview-parent');

		ymaps.ready(function () {

			streetview_loading = false;
			streetview_loaded = true;

			var panorama = ymaps.panorama;

			if (!panorama.isSupported()) {
				streetview.html('Ошибка. Ваш браузер не поддерживается');
				return;
			}

			var locateRequest = panorama.locate([window.page.lat, window.page.lon]);

			locateRequest
				.then(function (panoramas) {

					streetview.html('');

					if (panoramas.length)
					{
						streetview_parent.css('height', '480px');
						streetview.find('ymaps').css('box-sizing', 'unset');

						var player = new ymaps.panorama.Player('streetview', panoramas[0], {
							controls: ['panoramaName', 'fullscreenControl', 'zoomControl'],
							direction: [0, 0]
						});
					}
					else
					{
						streetview.html('Фотографий этой улицы нет');
					}
				}
				)
				.fail(function(){
					streetview.html('Фотографий этой улицы нет');
				});

		});
	}

	function load_streetview()
	{
		if (!streetview_loading && !streetview_loaded)
		{
			var streetview = streetview || $('#streetview');
			streetview.html('Загрузка панорамы <div class="loader"></div>');
			streetview_loading = true;

			if (!maps_api_loaded)
			{
				$.getScript(window.page.yandex_maps_api, function() {
					maps_api_loaded = true;
					init_streetview();
				})
					.fail(function()
					{
						streetview.html('Ошибка загрузки.<br/><a href="#" class="ui-link ui-link--underline ui-link--grey" onclick="load_streetview(); return false;">Попробовать ещё раз</a>');
						streetview_loading = false;
						streetview_loaded = false;
					});
			}
			else
			{
				init_streetview();
			}

		}
	}

	jdoc.on('click', '.tab-streetview', function(e) {
		e.preventDefault();

		load_streetview();
	});

	// --------------------------------------------------------------------------
	// Как доехать
	// --------------------------------------------------------------------------

	var routeMap = false, multiRoute = false;

	// клик по ссылке "определить мое местоположение"
	jdoc.on('click', '.js-route-location', function(e){

		e.preventDefault();

		var t = t ||$(this),
			old_html = old_html || t.html(),
			input = input || t.closest('.panel__route-fromto').find('.js-route-from');

		if (!navigator.geolocation)
		{
			toast('Ваше устройство не позволяет определять местоположение', 'info');
		}
		else
		{
			t.html('Определяю');
			t.removeClass('is-loading-right').addClass('is-loading-right');

			navigator.geolocation.getCurrentPosition(function (position) {

				t.removeClass('is-loading-right');
				t.html(old_html);

				const latitude  = position.coords.latitude;
				const longitude = position.coords.longitude;

				input.val(latitude + ', ' + longitude);

			},
				function() {
					t.html('Не удалось определить');
			});
		}

	});

	// input js-route-to "Куда"
	var js_route_to = $('.js-route-to'), old_placeholder = js_route_to.attr('placeholder'), old_address = js_route_to.val(), address_typed = false;

	// type
	jdoc.on('keyup', '.js-route-to', function (e) {
		e.preventDefault();
		address_typed = !!$(this).val();
	});

	jdoc.on('focusin', '.js-route-to', function(){

		var t = t || $(this);

		t.attr('placeholder', 'Куда');

		if(t.val() === old_address)
		{
			t.val('');
		}

	});

	jdoc.on('focusout', '.js-route-to', function(){

		var t = t || $(this);
		t.attr('placeholder', old_placeholder);

		if (t.val().length)
		{
			t.removeClass('input-grey');
		}
		else
		{
			t.removeClass('input-grey').addClass('input-grey');
		}

		if(!address_typed)
		{
			t.removeClass('input-grey').addClass('input-grey');
			t.val(old_address);
		}

		if(t.val() === old_address)
		{
			address_typed = false;
			t.removeClass('input-grey').addClass('input-grey');
			t.val(old_address);
			t.removeClass('input-grey').addClass('input-grey');
		}
	});

	// click address reverse button
	jdoc.on('click', '.js-route-reverse', function(){

		var t = t || $(this),
			input_from = input_from || t.closest('.panel__route-fromto').find('.js-route-from'),
			input_to = input_to || t.closest('.panel__route-fromto').find('.js-route-to'),
			to_val = to_val || input_to.val(),
			from_val = from_val || input_from.val();

		input_from.val(to_val);
		input_to.val(from_val);

		address_typed = true;

		if (from_val.length)
		{
			if (from_val !== old_address) input_to.removeClass('input-grey');
		}
		else
		{
			input_to.removeClass('input-grey').addClass('input-grey');
			input_to.val(old_address);
		}

		if(input_to.val() === old_address)
		{
			address_typed = false;
			input_to.removeClass('input-grey').addClass('input-grey');
		}
	});

	// click route panel head block
	jdoc.on('click', '.panel__route-head, .panel__route-btn', function(e){

		e.preventDefault();
		e.stopPropagation();

		load_suggestions();

		var t = t || $(this),
			from_input = from_input || $('#routeFrom'),
			routeButton = routeButton || $('#routeButton'),
			js_collapse = t.closest('.js-collapse'),
			js_collapse_content = js_collapse.find('.js-collapse-content');

		if (!maps_api_loaded)
		{
			init_route();
		}
		else
		{
			routeButton.prop('disabled', false);
		}

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

	// click top button 'Как доехать'
	jdoc.on('click', '#el-directions-button', function(e) {

		e.preventDefault();

		load_suggestions();

		var p = p || $('.panel__route-head'),
			routeButton = routeButton || $('#routeButton'),
			from_input = from_input || $('#routeFrom'),
			js_collapse = p.closest('.js-collapse'),
			js_collapse_content = js_collapse.find('.js-collapse-content'),
			offset = $(p).offset().top;

		scroll(offset, 150);

		if ( js_collapse_content.not(':visible') )
		{
			js_collapse.addClass('is-open')
			js_collapse_content.show();
			from_input.focus();
		}

		if (!maps_api_loaded)
		{
			init_route();
		}
		else
		{
			routeButton.prop('disabled', false);
		}

	});

	// клик по кнопке построить маршрут
	jdoc.on('click', '#routeButton', function (e) {

		var t = t || $(this),
			old_html = old_html || t.html(),
			panel_map = panel_map || $('#mapRoute'),
			panel_info = panel_info || $('#mapInfo'),
			panel_temp = panel_temp || $('#directions_map'),
			input_from = input_from || $('.js-route-from'),
			input_to = input_to || $('.js-route-to'),
			to_val = to_val || input_to.val(),
			from_val = from_val || input_from.val();

		// check form data
		if (!to_val.length || !from_val.length)
		{
			toast('Не введены данные для построения маршрута', 'info');
			return;
		}

		// set UI loading state
		t.removeClass('is-loading-right').addClass('is-loading-right');
		t.prop('disabled', true);
		t.html('Построение маршрута');

		// тип транспорта
		var routeMode = $('input.js-route-type:checked').val();

		// Создаем кнопки для управления мультимаршрутом.
		var trafficButton = new ymaps.control.Button({
				data: { content: "Учитывать пробки" },
				options: { selectOnClick: true, float: 'right' },
				state: { selected: true }
		});

		trafficButton.events.add('select', function () {
			multiRoute.model.setParams({ avoidTrafficJams: true }, true);
		});

		trafficButton.events.add('deselect', function () {
			multiRoute.model.setParams({ avoidTrafficJams: false }, true);
		});

		// создадим карту
		if (routeMap === false)
		{
			panel_temp.hide();
			panel_map.show();

			routeMap = new ymaps.Map('mapRoute', {
				center: [window.page.lat, window.page.lon],
				zoom: 14,
				controls: ['zoomControl', 'fullscreenControl', 'trafficControl', 'geolocationControl']
			}, {
				buttonMaxWidth: 300
			});

			routeMap.controls.add(trafficButton);
		}

		// Добавляем мультимаршрут на карту.
		multiRoute = new ymaps.multiRouter.MultiRoute({
				referencePoints: [
					from_val,
					to_val
				],
				params: {
					results: 3,
					reverseGeocoding: true,
					routingMode: routeMode
				}
			},
			{
				avoidTrafficJams: true,
				wayPointDraggable: true,
				viaPointDraggable: true,
				preventDragUpdate: true,
				boundsAutoApply: true
			});

		// события маршрутизатора
		multiRoute.model.events
			.add("requestsuccess", function (e)
			{
				t.removeClass('is-loading-right');
				t.prop('disabled', false);
				t.html(old_html);

				routeMap.geoObjects.removeAll();
				routeMap.geoObjects.add(multiRoute);

				panel_info.html(ShowRouteText(routeMode, multiRoute));
				panel_info.fadeOut(150).fadeIn(150);
			})
			.add("requestfail", function (e)
			{
				toast('Не удалось построить маршрут', 'info');

				t.removeClass('is-loading-right');
				t.prop('disabled', false);
				t.html(old_html);
			});

		multiRoute.events
			.add("activeroutechange", function (e) {
				panel_info.html(ShowRouteText(routeMode, multiRoute));
				panel_info.fadeOut(150).fadeIn(150);
			});
	});

	/**
	 * @return {string}
	 */
	function ShowRouteText(routeMode, multiRoute)
	{
		var activeRoute = multiRoute.getActiveRoute(), info_html = 'Не удалось построить такой маршрут', masstransit_info = [];

		if (routeMode === 'masstransit')
		{
			if (typeof activeRoute != 'undefined' && activeRoute !== null)
			{
				var ll = activeRoute.getPaths().toArray().length;

				if (ll > 0)
				{
					for (var i = 0, l = ll; i < l; i++) {

						var path = activeRoute.getPaths().toArray()[i];

						for (var j = 0, k = path.getSegments().toArray().length; j < k; j++)
						{
							masstransit_info.push("<li>" + path.getSegments().toArray()[j].properties.get("text") + "</li>");
						}
					}

					info_html = "Маршрут на общественном транспорте.<br/>";
					info_html += "Время в пути: " + activeRoute.properties.get("duration").text +  ", протяженность маршрута: " + activeRoute.properties.get("distance").text;
					info_html += "<br/><br/>Подробности маршрута:<br/>" + masstransit_info.join("");
				}
			}
		}
		else
		{
			if (typeof activeRoute != 'undefined' && activeRoute !== null)
			{
				if (routeMode === 'pedestrian')
				{
					info_html = "Маршрут пешком.<br/>";
				}
				else if (routeMode === 'auto')
				{
					info_html = "Маршрут на машине.<br/>";
				}
				else if (routeMode === 'bicycle')
				{
					info_html = "Маршрут на велосипеде.<br/>";
				}

				info_html += "Время в пути: " + activeRoute.properties.get("duration").text +  ", протяженность маршрута: " + activeRoute.properties.get("distance").text;
			}
		}

		return info_html;
	}

	// load lib if needed
	function init_route()
	{
		var routeButton = $('#routeButton');

		if (!maps_api_loaded)
		{
			routeButton.html('Форма загружается..');
			routeButton.removeClass('is-loading-right').addClass('is-loading-right');

			$.getScript(window.page.yandex_maps_api, function() {

				// todo посмотреть нужно ли обернуть другие переменные в ymaps ready в карте выше и стритвью
				ymaps.ready(function () {
					routeButton.html('Проложить маршрут');
					routeButton.prop('disabled', false);
					routeButton.removeClass('is-loading-right');
					maps_api_loaded = true;
				});

			});
		}
		else
		{
			routeButton.prop('disabled', false);
			routeButton.removeClass('is-loading-right');
		}
	}

	function load_suggestions()
	{
		if (!suggestions_api_loaded)
		{
			fetchStyle(window.page.static_cdn + '/css/suggestions.min.css?v=' + window.page.static_version).then(function() {});

			$.getScript(window.page.static_cdn + '/js/jquery.suggestions.min.js?v=' + window.page.static_version, function() {

				$("#routeFrom, #routeTo").suggestions({
					token: window.page.suggestions_token,
					addon: 'none',
					scrollOnFocus: false,
					initializeInterval: 150,
					hint: 'Выберите вариант или продолжите ввод',
					noSuggestionsHint: false,
					type: "ADDRESS"
				});

				suggestions_api_loaded = true;
			});
		}
	}

	// --------------------------------------------------------------------------
	// Garlic form persistence
	// --------------------------------------------------------------------------

	$('.auto-save').garlic({destroy: false, domain: true});

	// --------------------------------------------------------------------------
	// Other product pages
	// --------------------------------------------------------------------------

	// item page only

	if (window.page.type === 'item') {
		// клик по кнопкам "за"\"против" вещи
		var items_button_pro = items_button_pro || $('#b-pro');

		if (items_button_pro.length)
		{
			jdoc.on('click', '#b-pro,#b-versus', function(e) {
				e.preventDefault();

				if (window.page.not_allow_reviews)
				{
					toast('Здесь нельзя добавлять новые отзывы', 'info');
					return;
				}

				var t = t || $(this),
					tid = tid || t.attr('id'),
					main_button = $('.panel__add > button.reply'),
					offset = main_button.offset().top;

				main_button.trigger('click');
				scroll(offset, 150);

				// нажмем кнопки в форме - за
				if (tid === 'b-pro')
				{
					$('.ui-rating__btn[data-rating=5]').trigger('click');
					$('#tone-2').trigger('click');
				}

				// нажмем кнопки в форме - против
				if (tid === 'b-versus')
				{
					$('.ui-rating__btn[data-rating=2]').trigger('click');
					$('#tone-0').trigger('click');
				}
			});
		}
	}

	// end item

	// hotel page only

	if (window.page.type === 'hotel') {

		// photos autoload

		var more_photos_loading = false;

		$('.himg').imgLoad(function () {
			$(this).removeClass('himg');
		});

		function load_more_photos() {

			var loadmore_button = $('#load-more-photos'),
				loadmore_parent = loadmore_parent || loadmore_button.closest('.panel__pictures-control'),
				photos_list = photos_list || $('#hotel-photos'),
				error_message = 'Автоматическая загрузка фото не удалась. Пожалуйста, нажмите кнопку ещё раз';

			more_photos_loading = true;
			loadmore_button.html('Фотографии загружаются <div class="loader"></div>').prop('disabled', true);

			$.when(getToken())
				.done(function (tk) {
					$.ajax({
						type: "POST",
						cache: false,
						url: '/api/ajax/load_hotel_photos',
						data: {
							token: tk,
							page_type: window.page.type,
							hash: window.page.hash
						},
					})
						.done(function (data) {
							var result = String(data).match(/({"status".*"})/gm);

							if (isJSON(result)) {
								var r = JSON.parse(result);

								if (r.status === 'error') {
									more_photos_loading = false;
									loadmore_button.html(error_message).prop('disabled', false);
								}

								if (r.status === 'success') {
									more_photos_loading = false;

									var new_photos = JSON.parse(r.info)

									photos_list.append(new_photos);
									loadmore_parent.remove();

									$('.panel__pictures-list > li:nth-of-type(2) ~ li').show();

									$('.himg').imgLoad(function () {
										$(this).removeClass('himg');
									});

									// пересчитаем позицию стики ads блока под фото
									jbody.trigger("sticky_kit:recalc");
								}

							}
							else {
								more_photos_loading = false;
								loadmore_button.html(error_message).prop('disabled', false);
							}

						})
						.fail(function () {
							more_photos_loading = false;
							loadmore_button.html(error_message).prop('disabled', false);
						});
				})
				.fail(function () {
					more_photos_loading = false;
					loadmore_button.html(error_message).prop('disabled', false);
				});
		}

		jwindow.on('resize scroll', function () {

			// loadmore button
			var loadmore_button_visible = $('#load-more-photos').isInViewport();

			if (loadmore_button_visible && !more_photos_loading &&
				window.matchMedia('(min-width: 1200px)').matches) {
				load_more_photos();
			}
		});

		jdoc.on('click', '#load-more-photos', function (e) {
			e.preventDefault();

			if (!more_photos_loading) {
				load_more_photos();
			}
		});

		// near hotel block click

		jdoc.on('click', '.panel__hotel-image', function (e) {
			e.preventDefault();

			var t = $(this), hotel_link = t.closest('.panel__hotel').find('a.ui-link'),
				hotel_href = hotel_link.attr('href');
			window.location = hotel_href;
		});

		// rooms photo owl gallery

		var js_owl_gallery = js_owl_gallery || $('.js-owl-gallery');
		if (js_owl_gallery.length > 0) {
			js_owl_gallery.owlCarousel({
				loop: false,
				margin: 2,
				autoWidth: true,
				nav: true,
				dots: false,
				navText: [owlPrevBig, owlNextBig]
			});
		}

		$('.js-gallery').each(function (index) {

			var gallery = $(this),
				gallerySlides = gallery.find('.js-gallery-slides'),
				galleryThumbs = gallery.find('.js-gallery-thumbs'),
				gallerySlidesItems = gallerySlides.find('.gallery__slides-item');

			gallerySlides.owlCarousel({
				items: 1,
				loop: false,
				autoWidth: true,
				autoHeight: true,
				margin: 10,
				nav: true,
				dots: false,
				navText: [owlPrevBig, owlNextBig],
				onChanged: function (event) {

					var index = event.item.index;

					galleryThumbs.children().removeClass('is-active');
					galleryThumbs.children().eq(index).addClass('is-active');

					gallerySlidesItems.eq(index).css('width', gallery.width());
				}
			});


			galleryThumbs.children().on('click', function (event) {

				var index = $(this).index();

				galleryThumbs.children().removeClass('is-active');
				galleryThumbs.children().eq(index).addClass('is-active');

				gallerySlides.trigger('to.owl.carousel', [index, 150]);

			});
		});

		// photoswipe

		var openPhotoSwipeHotel = function(id, array, parent)
		{
			var pswpElement = document.getElementById('pswp');

			var options =
				{
					index: id,
					history: false,
					focus: false,

					closeEl: true,
					captionEl: false,
					fullscreenEl: false,
					zoomEl: true,
					shareEl: false,
					counterEl: false,
					arrowEl: true,
					preloaderEl: true,

					showAnimationDuration: 0,
					hideAnimationDuration: 0,

					bgOpacity: 0.75,
					closeOnVerticalDrag: true

				};

			var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, array, options);

			gallery.listen('gettingData', function(index, item)
			{
				if (item.w < 1 || item.h < 1)
				{
					var img = new Image();

					img.onload = function()
					{
						item.w = this.naturalWidth;
						item.h = this.naturalHeight;

						gallery.updateSize(true);
					};

					img.src = item.src;
				}
			});

			gallery.init();
		};

		jdoc.on('click', '.panel__pictures-item', function(e) {
			e.preventDefault();
			var t = t || $(this),
				li = t.closest('li');

			openPhotoSwipeHotel(li.index(), hotel_images, '#el-photos');
		});

		// external partner

		jdoc.on('click', '.go-booking', function(e) {
			e.preventDefault();
			window.open(window.page.b_link,"_blank");
		});
	}

	// end hotel



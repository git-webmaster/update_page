// --------------------------------------------------------------------------
// Owner functions on page Company
// --------------------------------------------------------------------------

// == ОТЗЫВЫ

// клик по кнопке с org_id
jdoc.on('click', '.panel__admin_buttons button[data-setting]', function(e) {
	e.preventDefault();

	var t = $(this),
		action = t.data('setting'),
		action_value = t.data('value'),
		panel_comment = t.closest('.panel__comment'),
		id = panel_comment.data('id'),
		fp = panel_comment.data('fp'),
		data_array = {};

	// mark same reviews
	if (action === 'x-mark')
	{
		var parent_panel = panel_comment.closest('.panel'),
			all_reviews = parent_panel.find('.panel__comment'),
			same_reviews = parent_panel.find('.panel__comment[data-fp="' + fp + '"]');

		if (same_reviews.hasClass('same-reviews'))
		{
			same_reviews.removeClass('same-reviews');
			return;
		}
		else
		{
			all_reviews.removeClass('same-reviews');
			same_reviews.addClass('same-reviews');
		}
	}

	// ask if sure to delete
	if (action === 'mark_as_deleted')
	{
		if (action_value === 1) // у администратора удаляем без лишних вопросов
		{
			t.addClass('is-loading-right');
			data_array[action] = action_value;
			admin_action(t, data_array, id, action, action_value, panel_comment);
		}
		else
		{
			action_value = 1;
			var cancel_del = false;

			Swal.fire({
				title: 'Подтвердите удаление',
				text: 'Удалить данный отзыв? Все ответы будут также скрыты. Это действие нельзя отменить',
				showCancelButton: true,
				focusCancel: true,
				confirmButtonText: 'Да, удалить',
				cancelButtonText: 'Нет'
			})
				.then((result) =>
				{
					if (result.value)
					{
						t.addClass('is-loading-right');
						data_array[action] = action_value;
						admin_action(t, data_array, id, action, action_value, panel_comment);
					}
					else
					{
						cancel_del = true;
					}
				});

			if (cancel_del) return;
		}
	}

	// ask if sure to ban
	if (action === 'x-ban' && action_value === 1)
	{
		var cancel_ban = false;

		Swal.fire({
			title: 'Подтвердите бан',
			text: 'Лишить данного пользователя возможности писать отзывы?',
			showCancelButton: true,
			focusCancel: true,
			confirmButtonText: 'Да, забанить',
			cancelButtonText: 'Нет'
			})
			.then((result) =>
			{
				if (result.value)
				{
					t.addClass('is-loading-right');
					data_array[action] = action_value;
					admin_action(t, data_array, id, action, action_value, panel_comment);
				}
				else
				{
					cancel_ban = true;
				}
			});

		if (cancel_ban) return;
	}

	// unban
	if (action === 'x-ban' && action_value === 0)
	{
		data_array[action] = action_value;
		admin_action(t, data_array, id, action, action_value, panel_comment);
	}

	// review update
	if (action === 'is_nsfw' || action === 'x-zero_rating')
	{
		data_array[action] = action_value;
		admin_action(t, data_array, id, action, action_value, panel_comment);
	}

});

function admin_action(t, data_array, id, action, action_value, panel_comment)
{
	t.addClass('is-loading-right');

	$.when(getToken()).done(function (tk)
	{
		if (typeof action_value == 'undefined' || (action_value !== 0 && action_value !== 1 && action_value !== 2))
		{
			action_value = 1;
		}

		$.ajax({
			type: "POST",
			cache: false,
			url: '/api/review/update',
			data: {
				token: tk,
				user_token: tk,
				page_type: window.page.type,
				id: id,
				owner_id: window.page.id,
				kv_array: JSON.stringify(data_array)
			},
		})
			.done(function (data)
			{
				if (data.indexOf('1') === 0)
				{
					toast('OK', 'info');
					panel_comment.css('opacity', '0.6');

					t.css('background', '#ccc');
					t.css('color', '#000');

					// если обновляли текст - подставим его в отзыв сразу
					if (action === 'text')
					{
						panel_comment.find('.panel__comment-message').html(data_array['text']);
					}

					// если удаляли отзыв - то уберем его из dom
					if (action === 'mark_as_deleted')
					{
						panel_comment.remove();
					}
				}
				else
				{
					toast('Операция не удалась', 'error');
				}

				t.removeClass('is-loading-right');
			})
			.fail(function ()
			{
				t.removeClass('is-loading-right');
				toast('Операция не удалась', 'error');
			});
	});
}
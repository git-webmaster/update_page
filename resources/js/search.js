var current_request = '', search_input = $('#search'), search_loader = $('#search-loader-1'), last_query = '';

var search_provider = new Bloodhound({
	datumTokenizer: function (search_provider) {
		return Bloodhound.tokenizers.whitespace();
	},
	limit: 20,
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	remote: {
		url: 'https://rubrikator.local/api/search?type=categories&query=' + search_input.val(),
		replace: function (url, uriEncodedQuery) {
			return 'https://rubrikator.local/api/search?type=categories&query=' + search_input.val()
		},
		filter: function (response) {
			if (response.status === "nothing_found") {
				return false
			} else {
				return response.info
			}
		}
	}
});

search_provider.initialize();

search_input.typeahead({
		limit: 20,
		highlight: true,
		minLength: 1
	},
	{
		limit: 19,
		name: 'search_provider',
		displayKey: function (search_provider) {
			return search_provider.name
		},
		source: search_provider.ttAdapter(),
		templates: {
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
		var search_query = '';

		if (typeof data.name !== undefined && data.name.length > 0)
		{
			search_query = data.name;
		}
		else
		{
			search_query = search_input.val();
		}

		search_ajax(search_query);
	})
	.on('typeahead:asyncrequest', function () {
		search_loader.removeClass('hidden').css('opacity', 1).css('visibility', 'visible');
	})
	.on('typeahead:asynccancel typeahead:asyncreceive', function () {
		search_loader.addClass('hidden').css('opacity', 0).css('visibility', 'hidden');
	});

jdoc.on('click', '.ui-search__btn', function(e){
	e.preventDefault();
	search_ajax(search_input.val());
});

jdoc.on('keypress', '#search', function(e){
	if(e.which === 13) {
		search_ajax(search_input.val());
	}
});

function search_ajax(q)
{
	var search_container = $('#search_results_container'),
		results = $('.l__results'),
		results_container = $('.panel__tabs-container'),
		status_el = $('#search_status'),
		title = $('title');

	var search_q = escapeHtml(q),
		trimmed_length = 32,
	 	trimmed_q = search_q.length > trimmed_length ?
			 		search_q.substring(0, trimmed_length - 3) + "..." :
					search_q;

	// уберем дропдаун с подсказками
	search_input.typeahead('close');

	// проверим, не такой же ли запрос
	if (last_query.length > 0 && last_query === search_q)
	{
		return;
	}
	else
	{
		last_query = search_q;
	}

	// отменим все предыдущие запросы
	if (typeof current_request.abort === "function") {
		current_request.abort();
	}

	// поставим статус загрузки
	results.css('opacity', 0.5);
	status_el.removeClass('hidden').html('<div>Обновляю результаты поиска&nbsp;<div class="loader"></div></div>');

	// запрос данных
	$.when(getToken())
		.done(function(tk) {
			current_request = $.ajax({
				type: "POST",
				cache: false,
				url: 'https://rubrikator.local/api/ajax/search',
				data: {
					token: tk,
					search_type: 1,
					value: search_q
				},
				})
				.done(function (data) {
					var result = String(data).match(/({"status".*"})/gm);

					if (isJSON(result)) {
						var r = JSON.parse(result);

						if (r.status === 'success') {
							var info = JSON.parse(r.info);

							results_container.removeClass('hidden');
							results.css('opacity', 1);

							status_el.addClass('hidden').html('');
							search_container.html(info);

							// обновим тайтл и урл страницы
							title.html(trimmed_q + ' | Рубрикатор');

							if (history.pushState) {
								var new_url = updateURLParameter(window.location.href, 'q', search_q);

								if (typeof new_url != "undefined" ?? new_url.length > 0) {
									window.history.pushState({path: new_url}, '', new_url);
								}
							}
						}
						else {
							status_el.removeClass('hidden').html('Ничего не найдено');
							results.html('').css('opacity', 1);
							results_container.addClass('hidden');
						}
					}
				});
	});
}

function updateURLParameter(url, param, paramVal)
{
	var TheAnchor = null;
	var newAdditionalURL = "";
	var tempArray = url.split("?");
	var baseURL = tempArray[0];
	var additionalURL = tempArray[1];
	var temp = "";

	if (additionalURL)
	{
		var tmpAnchor = additionalURL.split("#");
		var TheParams = tmpAnchor[0];
		TheAnchor = tmpAnchor[1];
		if(TheAnchor)
			additionalURL = TheParams;

		tempArray = additionalURL.split("&");

		for (var i=0; i<tempArray.length; i++)
		{
			if(tempArray[i].split('=')[0] != param)
			{
				newAdditionalURL += temp + tempArray[i];
				temp = "&";
			}
		}
	}
	else
	{
		var tmpAnchor = baseURL.split("#");
		var TheParams = tmpAnchor[0];
		TheAnchor  = tmpAnchor[1];

		if(TheParams)
			baseURL = TheParams;
	}

	if(TheAnchor)
		paramVal += "#" + TheAnchor;

	var rows_txt = temp + "" + param + "=" + paramVal;
	return baseURL + "?" + newAdditionalURL + rows_txt;
}

var entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'/': '&#x2F;',
	'`': '&#x60;',
	'=': '&#x3D;'
};

function escapeHtml(string) {
	return String(string).replace(/[&<>"'`=\/]/g, function (s) {
		return entityMap[s];
	});
}
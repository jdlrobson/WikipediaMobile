window.search = function() {
	function performSearch(term, isSuggestion) {
		if(chrome.isSpinning()) {
			network.stopCurrentRequest();
			chrome.hideSpinner();
			return;
		}
		if (network.isConnected()) {
			if (term == '') {
				chrome.showContent();
				return;
			}

			chrome.showSpinner();

			if(!isSuggestion) {
				console.log('for term: ' + term);
				getFullTextSearchResults(term);
			} else {
				getSearchResults( term );
			}
		} else {
			if(!isSuggestion)
				chrome.showNoConnectionMessage();
			chrome.showContent();
		}
	}

	function getDidYouMeanResults(results) {
		// perform did you mean search
		console.log( "Performing 'did you mean' search for", results[0] );
		var requestUrl = app.baseURL + "/w/api.php";        
		$.ajax({
   			type: 'GET',
			url: requestUrl,
			data: {
				action: 'query',
       			list: 'search',                
				srsearch: results[0],
       			srinfo: 'suggestion',
				format: 'json'
       		},
       		success: function(data) {
				var suggestion_results = data;
				var suggestion = getSuggestionFromSuggestionResults( suggestion_results );
				if ( suggestion ) {
					getSearchResults( suggestion, 'true' );
				}
			}
		});
	}

	function getSuggestionFromSuggestionResults( suggestion_results ) {
		console.log( "Suggestion results", suggestion_results );
		if ( typeof suggestion_results.query.searchinfo != 'undefined' ) {
			var suggestion = suggestion_results.query.searchinfo.suggestion;
			console.log( 'Suggestion found:', suggestion );
			return suggestion;
		} else {
			return false;
		}
	}

	function getFullTextSearchResults(term) {

		var requestUrl = app.baseURL + "/w/api.php";
		$.ajax({
			type: 'GET',
			url: requestUrl,
			data: {
				action: 'query',
				list: 'search',
				srsearch: term,
				srinfo: '',
				srprop: '',
				format: 'json'
			},
			success: function(data) {
				var searchResults = [];
				for(var i = 0; i < data.query.search.length; i++) {
					var result = data.query.search[i];
					searchResults.push(result.title);
				}
				renderResults([term, searchResults], false);
			}, 
			error: function(err) {
				console.log("ERROR!" + JSON.stringify(err));
			}
		});
	}

	function getSearchResults(term, didyoumean) {
		console.log( 'Getting search results for term:', term );
		var requestUrl = app.baseURL + "/w/api.php";
		$.ajax({
			type: 'GET',
			url: requestUrl,
			data: {
				action: 'opensearch',
				search: term,
				format: 'json'
			},
			success: function(results) {
				if ( results[1].length === 0 ) { 
					console.log( "No results for", term );
					getDidYouMeanResults( results );
				} else {
					if ( typeof didyoumean == 'undefined' ) {
						didyoumean = false;
					}
					console.log( 'Did you mean?', didyoumean );
					renderResults(results, didyoumean);
				}			
			}
		});
	}

	function onSearchResultClicked() {
		var parent = $(this).parents(".listItemContainer");
		app.loadPageFromTitle(parent.attr('data-page-title'));
	}

	function onDoFullSearch() {
		performSearch($("#searchParam").val(), false);
	}

	function renderResults(results, didyoumean) {
		var template = templates.getTemplate('search-results-template');
		if (results.length > 0) {

			var searchParam = results[0];
			console.log( "searchParam", searchParam );
			var searchResults = results[1].map(function(title) {
				return {
					key: app.urlForTitle(title),
					title: title
				};
			});
			if ( didyoumean ) {
				var didyoumean_link = {
					key: app.urlForTitle(results[0]),
					title: results[0]
				};
				$("#resultList").html(template.render({'pages': searchResults, 'didyoumean': didyoumean_link}));
			} else {
				$("#resultList").html(template.render({'pages': searchResults}));
			}
			$("#resultList .searchItem").click(onSearchResultClicked);
		}
		$("#doFullSearch").click(onDoFullSearch);
		console.log($("#doFullSearch").html());
		chrome.hideSpinner();
		chrome.hideOverlays();

		if(!chrome.isTwoColumnView()) {
			$("#content").hide(); // Not chrome.hideContent() since we want the header
		} else {
			$("html").addClass('overlay-open');
		}

		chrome.doFocusHack();
		$('#searchresults').localize().show();
		chrome.doScrollHack('#searchresults .scroller');
	}

	return {
		performSearch: performSearch
	};
}();


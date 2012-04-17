
function setMenuItemState(action, state) {
	// Stupid iterator
	$.each(menu_items, function(i, item) {
		if(item.id == action) {
			item.disabled = !state;
		}
	});
	updateMenuState();
}

function setPageActionsState(state) {
	setMenuItemState("page-actions", state);
}

function getAboutVersionString() {
	return "3.1beta2";
}

var menu_items = [
	{
		id: 'go-back',
		action: chrome.goBack,
		disabled: true
	},
	{
		id: 'go-forward',
		action: chrome.goForward,
		disabled: true
	},
	{
		id: 'read-in',
		action:  function() { languageLinks.showLangLinks(app.curPage); }
	},
	{
		id: 'page-actions',
		action: function() {
			var pageActions = [
				mw.msg('menu-savePage'),
				mw.msg('menu-ios-open-safari'),
				mw.msg('menu-share-ril'),
				mw.msg('menu-share-fb'),
				mw.msg('menu-cancel')
			];
			// iOS less than 5 does not have Twitter. 
			// FIXME: Refactor menu.js to be not platform specific
			var cancelIndex = 4;
			if(navigator.userAgent.match(/OS 5/g)) {
				pageActions.splice(pageActions.length - 1, 0, mw.msg('menu-share-twitter'));
				cancelIndex = 5;
			}
			popupMenu(pageActions, function(value, index) {
				if (index == 0) {
					savedPages.saveCurrentPage();
				} else if (index == 1) {
					shareSafari();
				} else if (index == 2) {
					shareRIL();
				} else if (index == 3) {
					shareFB();
				} else if (index == 4 && cancelIndex != 4) {
					shareTwitter();
				}
			}, {
				cancelButtonIndex: cancelIndex,
				origin: this
			});
		}
	},
	{
		id: 'list-actions',
		action: function() {
			popupMenu([
				mw.msg('menu-nearby'),
				mw.msg('menu-savedPages'),
				mw.msg('menu-history'),
				mw.msg('menu-cancel')
			], function(val, index) {
				if (index == 0) {
					geo.showNearbyArticles();
				} else if (index == 1) {
					savedPages.showSavedPages();
				} else if (index == 2) {
					appHistory.showHistory();
				}
			}, {
				cancelButtonIndex: 3,
				origin: this
			});
		}
	},
	{
		id: 'view-settings',
		action: appSettings.showSettings
	}
];

function updateMenuState() {
	$('body').removeClass('nativeMenu');
	$('#menu').remove();
	var $menu = $('<div>');
	$menu
		.attr('id', 'menu')
		.appendTo('body');

	$.each(menu_items, function(i, item) {
		var $button = $('<button>');
		$button
			.attr('id', item.id)
			.attr('title', mw.msg(item.id));
		if(item.disabled) {
			$button.addClass("disabled");
		} else {
			$button.click(function() {
				item.action.apply(this);
			});
		}
		$button.append('<span>')
			.appendTo($menu);
	});
};

// Default emulation, override with platform-specific menu popups
function popupMenu(items, callback, options) {
	options = $.extend({destructiveButtonIndex: null, cancelButtonIndex: null}, options || {});

	var $bg = $('<div class="actionsheet-bg"></div>').appendTo('body'),
		$sheet = $('<div class="actionsheet"></div>').appendTo('body');
	$.each(items, function(index, label) {
		var $button = $('<button>')
			.text(label)
			.appendTo($sheet)
			.click(function() {
				$sheet.remove();
				$bg.remove();
				callback(label, index);
			});
		if (index === options.destructiveButtonIndex) {
			$button.addClass('destructive');
		}
		if (index === options.cancelButtonIndex) {
			$button.addClass('cancel');
		}
	});
}


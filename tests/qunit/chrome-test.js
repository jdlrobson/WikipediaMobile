module('chrome.js - 2', {
	setup: function() {
		app.baseURL = '';
		$('<div id="content" style="display:none"><div id="main"></div></div>').appendTo(document.body);
	},
	teardown: function() {
		$('#content').remove();
	}
});

test('renderFromApi', function() {
	var html = '<div id="content">Sample text<div class="floatleft"><a href="/w/index.php/Hello" class="image">link</a></div>';
	var json = {
		'parse':{'title':'Hello','revid':196,'text': html }
	};
	chrome.renderFromApi( json );
	strictEqual( $('#main h1.firstHeading#firstHeading').text(), 'Hello', 'A heading was added' );
	strictEqual( $('#main a').length, 1, '1 link added to #content div' );
	strictEqual( $('#main a').text(), 'link', 'check link was copied across' );
});

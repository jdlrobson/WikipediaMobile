module('app.js', {
	setup: function() {
		preferencesDB.set('disabledImages', false);
		$('<div id="content">').html('This is article text <img src="../../assets/www/img/orig/optionBack.png"> here and and <img src="../../assets/www/img/orig/optionBack.png"> there').
			appendTo(document.body);
	},
	teardown: function() {
		$('#content').remove();
	}
});

/* When disabling images the preference should be saved and any existing images in the document
should appear disabled */
test('disableImages', function() {
	var imgsStart = $('#content img:visible').length;
	app.disableImages(true);
	var setting = preferencesDB.get('disabledImages');
	var imgsEnd = $('#content img:visible').length;
	strictEqual(setting, 'true', 'images are now disabled');
	strictEqual(imgsStart, 2, '2 images existed before');
	strictEqual(imgsEnd, 0, 'images in document hidden after disabling');
});

test('disableImages off and on', function() {
	var imgsStart = $('#content img:visible').length;
	app.disableImages(true);
	app.disableImages(false); // turn them back on again
	var setting = preferencesDB.get('disabledImages');
	var imgsEnd = $('#content img:visible').length;
	strictEqual(setting, 'false', 'images are now enabled');
	strictEqual(imgsStart, 2, '2 images existed before');
	strictEqual(imgsEnd, 2, 'images in are visible again');
});

module('app.js - 2', {
	setup: function() {
		app.baseURL = '';
		$('<div id="content" style="display:none"><div id="main"></div></div>').appendTo(document.body);
	},
	teardown: function() {
		$('#content').remove();
	}
});

test('loadPageFromTitle', function() {
	var expectedUrl = '/w/api.php?action=parse&format=json&page=Hello&mobileformat=html';
	window.network.setCallback(function(options) {
		if( options.url === expectedUrl && options.dataType === 'json' ) {
			var html = '<div id="content">Sample text<div class="floatleft"><a href="/w/index.php/Hello" class="image">link</a></div>';
			options.success({
				'parse':{'title':'Hello','revid':196,'text': html }
			});
		}
	});
	app.loadPageFromTitle( 'Hello' );
	strictEqual( $('#main h1.firstHeading#firstHeading').text(), 'Hello', 'A heading was added' );
	strictEqual( $('#main a').length, 1, '1 link added to #content div' );
	strictEqual( $('#main a').text(), 'link', 'check link was copied across' );
	strictEqual( $('#content:visible').length, 1, 'the content is visible');
});

test('loadPageFromTitle (Main Page)', function() {
	var expectedUrl = '/w/api.php?action=parse&format=json&page=Main%20Page&mobileformat=html';
	window.network.setCallback(function(options) {
		if( options.url === expectedUrl && options.dataType === 'json' ) {
			var html = '<div id="content">hello</div>';
			options.success({
				'parse':{'title':'Main Page','revid':196,'text': html }
			});
		}
	});
	app.loadPageFromTitle();
	strictEqual( $('#main').text(), 'hello', 'the correct url was determined' );
});


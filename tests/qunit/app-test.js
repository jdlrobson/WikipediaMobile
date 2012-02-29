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

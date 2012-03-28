MobileFrontend = (function() {
	return {
		init: function() {
			MobileFrontend.toggle.init();
			MobileFrontend.references.init();
		},
		message: function(name) {
			return mw.message(name).plain();
		},
		utils: jQuery
	}
})();

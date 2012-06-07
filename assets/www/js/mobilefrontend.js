MobileFrontend = (function() {
	var settings = {
		mapId: 'map',
		'url-maptiles': 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
		language: function() {
			return preferencesDB.get( 'language' );
		},
		'url-geosearch': 'http://ws.geonames.net/findNearbyWikipediaJSON?formatted=true&lat=$1&lng=$2&username=$3&lang=$4'
	};

	function setting( name ) {
		var val = settings[ name ] || '';
		if( typeof val === 'string' ) {
			return val;
		} else {
			return val();
		}
	}

	return {
		init: function() {
		},
		registerModule: function() {
		},
		message: function(name) {
			return mw.message(name).plain();
		},
		setting: setting,
		utils: jQuery
	}
})();

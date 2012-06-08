/*global document, window, mw, L, jQuery, navigator */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.geo = (function($) {

	var shownURLs = [], map,
		setting = MobileFrontend.setting;

	function geoLookup(latitude, longitude, lang, success, error) {
		var requestUrl = MobileFrontend.setting( 'url-geosearch' ),
			username = 'wikimedia';
		requestUrl = requestUrl.replace( '$1', latitude ).
			replace( '$2', longitude ).replace( '$3', username ).replace( '$4', lang );

		$.ajax({
			url: requestUrl,
			success: function(data) {
				success(data);
			},
			error: error
		});
	}
	
	function geoAddMarkers( data, args ) {
		$.each(data.geonames, function(i, item) {
			var summary, html,
				popupContent, marker, popupHeading,
				//TODO: This should not be wikipedia specific
				protocol = args.protocol || window.location.protocol,
				url = item.wikipediaUrl.replace(/^([a-z0-9\-]+)\.wikipedia\.org/, protocol + '//$1.m.wikipedia.org');
			if($.inArray(url, shownURLs) === -1) {
				marker = new L.Marker(new L.LatLng(item.lat, item.lng));
				summary = item.summary || '';

				popupContent = $( '<div />' )[ 0 ];
				popupHeading = $( '<a />' ).text( item.title ).attr( 'href', url ).
					prependTo( popupContent )[ 0 ];
				$( '<p>' ).text( summary ).appendTo( popupContent );
				if( args.clickPopup ) {
					$( popupContent ).click( args.clickPopup );
					$( popupHeading ).click( function( ev ) {
						ev.preventDefault();
					} );
				}
				marker.bindPopup(popupContent, {closeButton: false});
				map.addLayer(marker);
				shownURLs.push(url);
			}
		});
	}

	function showNearbyArticles( args ) {
		args = $.extend(
			{
				lat: 0,
				lon: 0,
				current: true
			},
			args
		);

		if (!map) {
			// Disable webkit 3d CSS transformations for tile positioning
			// Causes lots of flicker in PhoneGap for some reason...
			L.Browser.webkit3d = false;
			map = new L.Map( setting( 'mapId' ) );
			var tiles = new L.TileLayer( setting( 'url-maptiles' ), {
				maxZoom: 18,
				subdomains: '1234' // for MapQuest tiles
			});
			map.addLayer(tiles);

			map.attributionControl.setPrefix("");
			map.attributionControl.addAttribution('<span class="map-attribution">' + mw.message("attribution-mapquest") + '</span>');
			map.attributionControl.addAttribution("<br /><span class='map-attribution'>" + mw.message("attribution-osm") + '</span>');
		}

		// @fixme load last-seen coordinates
		map.setView(new L.LatLng(args.lat, args.lon), 18);

		function findAndDisplayNearby( lat, lon ) {
			geoLookup( lat, lon, setting( 'language' ), function( data ) {
				geoAddMarkers( data, args );
			}, function(err) {
				console.log(JSON.stringify(err));
			});
		}

		function ping() {
			var pos = map.getCenter();
			findAndDisplayNearby( pos.lat, pos.lng );
		}

		if ( args.current ) {
			map.on('viewreset', ping);
			map.on('locationfound', ping);
			map.on('moveend', ping);
			map.locateAndSetView(18, {enableHighAccuracy: true});
		}
		else {
			findAndDisplayNearby( args.lat, args.lon );
		}
	}

	function getFloatFromDMS( dms ) {
		var multiplier = /[sw]/i.test( dms ) ? -1 : 1,
			bits = dms.match(/[\d.]+/g),
			coord = 0, i, iLen;

		for ( i = 0, iLen=bits.length; i<iLen; i++ ) {
			coord += bits[i] / multiplier;
			multiplier *= 60;
		}

		return coord;
	}

	function addShowNearbyLinks() {
		$( 'span.geo-dms' ).each( function() {
			var $coords = $( this ),
			lat = $coords.find( 'span.latitude' ).text(),
			lon = $coords.find( 'span.longitude' ).text();

			$coords.closest( 'a' ).attr( 'href', '#' ).click( function() {
				showNearbyArticles( {
					'lat': getFloatFromDMS( lat ),
					'lon': getFloatFromDMS( lon ),
					'current': false,
				} );
			} );
		} );
	}

	function init() {
		showNearbyArticles();
	}

	MobileFrontend.registerModule( 'geo' );

	return {
		showNearbyArticles: showNearbyArticles,
		addShowNearbyLinks: addShowNearbyLinks,
		init: init
	};

}(jQuery));

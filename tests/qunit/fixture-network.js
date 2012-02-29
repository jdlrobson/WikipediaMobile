window.network = function() {
	var callback = function() {};

	function makeRequest(options) {
		callback(options);
	}

	function setCallback(mycallback) {
		callback = mycallback;
	}

	return {
		makeRequest: makeRequest,
		setCallback: setCallback
	}
}();

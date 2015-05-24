(function () {

	var zoomToIncludeMarkers = function () {
		var linkFunction = function (scope, element, attrs, mapController) {
			scope.$on('mapInitialized', function (evt, map) {
				var markers = map.markers;
				var bounds = new google.maps.LatLngBounds();
				
				for (var key in markers){
					if (markers.hasOwnProperty(key)){
						bounds.extend(markers[key].getPosition());
					}
				}
				
				
				map.fitBounds(bounds);
			});
		};

		return {
			restrict : "A",
			require : "^map",
			link : linkFunction
		};
	};

	zoomToIncludeMarkers.$inject = [];

	angular.module("ngMap").directive("zoomToIncludeMarkers", zoomToIncludeMarkers);
})();

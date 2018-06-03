
var map;
var markers = [];
var polygon = null;
var placeMarkers = [];

//ViewModel
/*
var MapViewModel = function(){

	var self = thisl

	this.markersArray = ko.observableArray([]);


	this.showListings = function(){
		showListing();
	};
	this.hideListings = function(){
		hideListing();
	};

};

ko.applyBindings(new OptionsBoxViewModel());
*/

function initMap() {
//Create new map 
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 51.441642, lng: 5.469722},
		zoom: 14,
		mapTypeControl: false
	});

	var timeAutocomplete = new google.maps.places.Autocomplete(
            document.getElementById('interest-area'));

    // This autocomplete is for use in the geocoder entry box.
    var zoomAutocomplete = new google.maps.places.Autocomplete(
            document.getElementById('zoom-area'));

    var searchBox = new google.maps.places.SearchBox(
    	document.getElementById('places-search'));

    searchBox.setBounds(map.getBounds());
    

	var locations = [
	{title: 'Home', location: {lat: 51.445073, lng: 5.513121}},
	{title: 'High Tech Campus', location: {lat: 51.410953, lng: 5.459404}},
	{title: 'Yacht', location: {lat: 51.413885, lng: 5.457192}},
	{title: 'Philips Museum', location: {lat: 51.439111, lng: 5.475533}},
	{title: 'Bottle Distillery', location: {lat: 51.435869, lng: 5.484804}},
	{title: 'DAF Museum', location: {lat: 51.437217, lng: 5.490448}}
	];

	var largeInfoWindow = new google.maps.InfoWindow();


	var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON
            ]
          }
        });

	var defaultIcon = makeMarkerIcon('FE7569');
	var highlightedIcon = makeMarkerIcon('004d80');
	

	for (var i = 0; i < locations.length; i ++)
	{
		var position = locations[i].location;
		var title = locations[i].title;

		var marker = new google.maps.Marker({
		position: position,
		icon: defaultIcon,
		title: title,
		animation: google.maps.Animation.DROP,
		id: i
		});

		markers.push(marker);

		marker.addListener('click', function() {
			populateInfoWindow(this, largeInfoWindow);
		});

		marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });

	}

	document.getElementById('show-listings').addEventListener('click', showListing);
	document.getElementById('hide-listings').addEventListener('click', hideMarkers(markers));
	document.getElementById('drawingtools').addEventListener('click', function(){
		toggleDrawing(drawingManager);
	});

	document.getElementById('zoom').addEventListener('click', function(){
		zoomToArea();
	});

	document.getElementById('go-button').addEventListener('click', function(){
		searchInTime();
	});

	searchBox.addListener('places_changed', function() {
		searchBoxPlaces(this);
	});

	document.getElementById('go-places').addEventListener('click', textSearchPlaces);

	drawingManager.addListener('overlaycomplete', function (event){

		if (polygon) {
			polygon.setMap(null);
			hideMarkers(markers);
		}

		drawingManager.setDrawingMode(null);
		polygon = event.overlay;
		polygon.setEditable(true);

		searchInPolygon();

		polygon.getPath().addListener('set_at', searchInPolygon);
		polygon.getPath().addListener('insert_at', searchInPolygon);
	});
}

function populateInfoWindow(marker, infoWindow){
		if (infoWindow.marker != marker) {

			infoWindow.setContent('');
			infoWindow.marker = marker;
			
			
			infoWindow.addListener('closeclick', function(){
				infoWindow.marker = null;
			});

			var streetViewService = new google.maps.StreetViewService();
          	var radius = 50;

          	function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {

              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');

                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infoWindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          infoWindow.open(map, marker);
		}
	}


function showListing(){
	var bounds = new google.maps.LatLngBounds();

	for (var i = 0; i < markers.length; i++){
		markers[i].setMap(map);
		bounds.extend(markers[i].position);

	}
	map.fitBounds(bounds);
} 

function hideMarkers(markers){
	for(var i = 0; i< markers.length; i ++)
	{
		markers[i].setMap(null);
	}
}

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
        return markerImage;
    }

function toggleDrawing(drawingManager){
	if (drawingManager.map) {
		drawingManager.setMap(null);
		if (polygon){
			polygon.setMap(null);
		}
	} else {
		drawingManager.setMap(map);
	}
}

function searchInPolygon(){
	for (var i = 0; i < markers.length; i ++){
		if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
			markers[i].setMap(map);
		} else {
			markers[i].setMap(null);
		}
	}
}

function zoomToArea(){
	var geocoder = new google.maps.Geocoder();
	var address = document.getElementById('zoom-area').value;
	if (address == ''){
		window.alert('Please enter an area or address!');
	} else {
		geocoder.geocode({
			address: address,
			componentRestrictions: {locality: 'Eindhoven'}
		}, function(results, status){
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				map.setZoom(15);
			} else {
				window.alert ('We could not find that location - please be more specific.');
			}
		});
	}
}

function searchInTime(){
	var distanceMatrixService = new google.maps.DistanceMatrixService;
	var address = document.getElementById('interest-area').value;

	if (address == ''){
		window.alert('Please enter an area or address!');
	} else {
		hideMarkers(markers);

		var origins = [];
		for (var i = 0; i < markers.length; i++){
			origins[i] = markers[i].position;
		}
		var destination = address;
		var mode = document.getElementById('mode').value;

		distanceMatrixService.getDistanceMatrix({
			origins: origins,
			destinations: [destination],
			travelMode: google.maps.TravelMode[mode],
			unitSystem: google.maps.UnitSystem.METRIC,
		}, function(response, status){
			if (status !== google.maps.DistanceMatrixStatus.OK) {
				window.alert('Error was: '+status);
			} else {
				displayMarkersInTime(response);
			}
		});

	}
}

function displayMarkersInTime(response){
	var maxDur = document.getElementById('duration').value;
	var origins = response.originAddresses;
	var destinations = response.destinationAddresses;

	var flag = false;

	for (var i =0; i<origins.length; i++){
		var results = response.rows[i].elements;
		for(var j =0; j<results.length; j++){

			var element = results[j];
			if (element.status == "OK") {
				var distanceText = element.distance.text;
				var duration = element.duration.value/60;
				var durationText = element.duration.text;
				if (duration <= maxDur) {
					markers[i].setMap(map);
					flag = true;

					var infoWindow = new google.maps.InfoWindow({
						content: durationText + ' away, '+distanceText+
						'<div><button id = \"route\"onclick =' +
                    '\"displayDirections(&quot;' + origins[i] + '&quot;);\">View Route</button>'
					});
					infoWindow.open(map, markers[i]);

					markers[i].infoWindow = infoWindow;
					google.maps.event.addListener(markers[i], 'click', function(){
						this.infoWindow.close();
					});
				}
			}
		}
	}
	if (!flag) {
          window.alert('We could not find any locations within that distance!');
        }
}

function displayDirections(origin){
	hideMarkers(markers);
	var directionsService = new google.maps.DirectionsService;
	var destinationAddress = document.getElementById('interest-area').value;
	var mode = document.getElementById('mode').value;

	directionsService.route({
		origin:origin,
		destination: destinationAddress,
		travelMode: google.maps.TravelMode[mode]
	}, function(response, status){
		if (status === google.maps.DirectionsStatus.OK) {
			var directionsDisplay = new google.maps.DirectionsRenderer({
				map:map,
				directions: response,
				draggable: true,
				polylineOptions: {
					strokeColor: 'green'
				}
			});
		} else {
			window.alert('Directions request failed. Error '+ status);
		}
	});
}

function searchBoxPlaces(searchBox){
	hideMarkers(placeMarkers);
	var places = searchBox.getPlaces();

	createMarkersForPlaces(places);
	if (places.length == 0) {
		window.alert('We did not find any places matching your search.')
	}
}

function textSearchPlaces(){
	var bounds = map.getBounds();
	hideMarkers(placeMarkers);
	var placesService = new google.maps.places.PlacesService(map);
	placesService.textSearch({
		query: document.getElementById('places-search').value,
		bounds: bounds
	}, function(results, status){
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			createMarkersForPlaces(results);
		}
	});

}

function createMarkersForPlaces(places){
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < places.length; i ++){
		var place = places[i];
		var icon = {
			url:place.icon,
			size: new google.maps.Size(35, 35),
        	origin: new google.maps.Point(0, 0),
        	anchor: new google.maps.Point(10, 34),
        	schaledSize: new google.maps.Size(21,34)
		};
		var marker = new google.maps.Marker({
			map: map,
			icon: icon,
			title: place.name,
			position: place.geometry.location,
			id: place.place_id

		});
		var placeInfoWindow = new google.maps.InfoWindow();
		marker.addListener('click', function() {
			if (placeInfoWindow.marker == this) {
				console.log('Info window already on its marker');
			} else {
				getPlacesDetails(this, placeInfoWindow);
			}
		});

		placeMarkers.push(marker);
		if (place.geometry.viewport) {
			bounds.union(place.geometry.viewport);
		} else {
			bounds.extend(place.geometry.location);
		}
	}
	map.fitBounds(bounds);
}

function getPlacesDetails(marker, infoWindow){
	var service = new google.maps.places.PlacesService(map);
	service.getDetails({
		placeId: marker.id,
	}, function(place, status){
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			infoWindow.marker = marker;
			var innerHTML = '<div>';
			if (place.name) {
				innerHTML += '<strong>'+place.name+'</strong>';
			}
			 if (place.formatted_address) {
            innerHTML += '<br>' + place.formatted_address;
          }
          if (place.formatted_phone_number) {
            innerHTML += '<br>' + place.formatted_phone_number;
          }
          if (place.opening_hours) {
            innerHTML += '<br><br><strong>Hours:</strong><br>' +
                place.opening_hours.weekday_text[0] + '<br>' +
                place.opening_hours.weekday_text[1] + '<br>' +
                place.opening_hours.weekday_text[2] + '<br>' +
                place.opening_hours.weekday_text[3] + '<br>' +
                place.opening_hours.weekday_text[4] + '<br>' +
                place.opening_hours.weekday_text[5] + '<br>' +
                place.opening_hours.weekday_text[6];
          }
          if (place.photos) {
            innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                {maxHeight: 100, maxWidth: 200}) + '">';
          }
          innerHTML += '</div>';
          infoWindow.setContent(innerHTML);
          infoWindow.open(map, marker);
          infoWindow.addListener('closeclick',function(){
          	infoWindow.marker = null;
          });

		}
	});
}
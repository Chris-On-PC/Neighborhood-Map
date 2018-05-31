
var map;

function initMap() {
//Create new map 
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 51.441642, lng: 5.469722},
		zoom: 13
	});

	var high_tech_campus = {lat: 51.410953, lng: 5.459404};

	var marker = new google.maps.Marker({
		position: high_tech_campus,
		map: map,
		title: 'High Tech Campus'
	});

	var infoWindow = new google.maps.InfoWindow({
		content: 'Some highly innovative things go down here!'
	});

	marker.addListener('click', function() {
		infoWindow.open(map, marker);
	});

}
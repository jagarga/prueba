// Obtiene la direccion usando el Geocoder de Google Maps
function codeAddress(direction, map) {
    var geocoder = new google.maps.Geocoder();
    //var address = document.getElementById('q-adress').value;
    var address = direction;
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

            var coords = results[0].geometry.location;
            var lat = results[0].geometry.location.lat();
            var lng = results[0].geometry.location.lng();


            //var ll = new ol.proj.fromLonLat([lng, lat]);
            //var ll = new ol.Coordinate([lng, lat]);

            map.getView().setCenter(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));
            map.getView().setZoom(16);


        } else {
            alert('No se obtuvo dirección por la siguiente razón: ' + status);
        }
    });
}
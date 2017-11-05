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

//Funciona para llamar a los themas de las capas para el selector
function selecttheme() {


    Ext.Ajax.request({
        url: '/Home/GetThemes',
        params: "",
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        method: "GET",
        async: false,
        success: function (response) {
            //themes = response.responseText;
            var themes = [];
            var result = JSON.parse(response.responseText);

            for (var i in result['name'])
                themes.push([result['name'][i]]);

            Ext.define('capasmodel', {
                extend: 'Ext.data.Model',
                fields: [{
                    type: 'string',
                    name: 'name'
                },]
            });

            var capasmodel = '[';

            for (i = 0; i < themes.length; i++) {

                capasmodel = capasmodel + '{"name":"' + strip(themes[i].toString()) + '"},'

            }
            capasmodel = capasmodel + ']'

            capasmodel = eval(capasmodel);

            window.themes = capasmodel;


        },
        failure: function (response) {
            Ext.Msg.alert('Something to display the layers was wrong', response, Ext.emptyFn)
        }
    });
 
}

function selectgroup(selected_themes) {


    Ext.Ajax.request({
        url: '/Home/GetGroups?theme=' + selected_themes,
        dataType: "json",
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        method: "GET",
        async: false,
        success: function (response) {
            //themes = response.responseText;
            var groups = [];
            var result = JSON.parse(response.responseText);

            for (var i in result['name'])
                groups.push([result['name'][i]]);

            Ext.define('capasmodel', {
                extend: 'Ext.data.Model',
                fields: [{
                    type: 'string',
                    name: 'name'
                },]
            });

            var capasmodel = '[';

            for (i = 0; i < groups.length; i++) {

                capasmodel = capasmodel + '{"name":"' + strip(groups[i].toString()) + '"},'

            }
            capasmodel = capasmodel + ']'

            capasmodel = eval(capasmodel);

            window.groups = capasmodel;


        },
        failure: function (response) {
            Ext.Msg.alert('Something to display the layers was wrong', response, Ext.emptyFn)
        }
    });

}

function selectlayers(selected_themes) {


    Ext.Ajax.request({
        url: '/Home/GetLayers?theme=' + selected_themes,
        dataType: "json",
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        method: "GET",
        async: false,
        success: function (response) {
            //themes = response.responseText;
            var groups = [];
            var result = JSON.parse(response.responseText);

            for (var i in result['name'])
                groups.push([result['name'][i]]);

            Ext.define('capasmodel', {
                extend: 'Ext.data.Model',
                fields: [{
                    type: 'string',
                    name: 'name'
                },]
            });

            var capasmodel = '[';

            for (i = 0; i < groups.length; i++) {

                capasmodel = capasmodel + '{"name":"' + strip(groups[i].toString()) + '"},'

            }
            capasmodel = capasmodel + ']'

            capasmodel = eval(capasmodel);

            window.single_layer = capasmodel;


        },
        failure: function (response) {
            Ext.Msg.alert('Something to display the layers was wrong', response, Ext.emptyFn)
        }
    });

}

function displaylayers(options, nextRegister) {

    var result;

    Ext.Ajax.request({
        url: '/Home/DisplayLayers?theme=' + options[0] + '&layergroup=' + options[1] + '&layer=' + options[2] + '&ext=' + options[3] + '&nextRegister=' + nextRegister.toString(),
        dataType: "json",
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        method: "GET",
        async: false,
        success: function (response) {
            //themes = response.responseText;
            var groups = [];
            result = JSON.parse(response.responseText);
        },
        failure: function (response) {
            Ext.Msg.alert('Something to display the layers was wrong', response, Ext.emptyFn)
        }
    });

    return result;
}

function strip(str) {
    return str.replace(/^\s+|\s+$/g, '');
}


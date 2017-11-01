Ext.require([
    'GeoExt.component.Map',
    'GeoExt.data.store.LayersTree'
]);

/**
 * A plugin for Ext.grid.column.Column s that overwrites the internal cellTpl to
 * support legends.
 */

Ext.define('BasicTreeColumnLegends', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.basic_tree_column_legend',

    /**
     * @private
     */
    originalCellTpl: Ext.clone(Ext.tree.Column.prototype.cellTpl).join(''),

    /**
     * The Xtemplate strings that will be used instead of the plain {value}
     * when rendering
     */
    valueReplacementTpl: [
        '{value}',
        '<tpl if="this.hasLegend(values.record)"><br />',
        '<tpl for="lines">',
        '<img src="{parent.blankUrl}"',
        ' class="{parent.childCls} {parent.elbowCls}-img ',
        '{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>"',
        ' role="presentation"/>',
        '</tpl>',
        '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
        '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
        '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
        '{[this.getLegendHtml(values.record)]}',
        '</tpl>'
    ],

    /**
     * The context for methods available in the template
     */
    valueReplacementContext: {
        hasLegend: function (rec) {
            var isChecked = rec.get('checked');
            var layer = rec.data;
            return isChecked && !(layer instanceof ol.layer.Group);
        },
        getLegendHtml: function (rec) {
            var layer = rec.data;
            var legendUrl = layer.get('legendUrl');
            if (!legendUrl) {
                legendUrl = 'https://geoext.github.io/geoext2/' +
                    'website-resources/img/GeoExt-logo.png';
            }
            return '<img class="legend" src="' + legendUrl + '" height="32" />';
        }
    },

    init: function (column) {
        var me = this;
        if (!(column instanceof Ext.grid.column.Column)) {
            Ext.log.warn('Plugin shall only be applied to instances of' +
                ' Ext.grid.column.Column');
            return;
        }
        var valuePlaceHolderRegExp = /\{value\}/g;
        var replacementTpl = me.valueReplacementTpl.join('');
        var newCellTpl = me.originalCellTpl.replace(
            valuePlaceHolderRegExp, replacementTpl
        );

        column.cellTpl = [
            newCellTpl,
            me.valueReplacementContext
        ];
    }
});

var mapComponent;
var mapPanel;
var treePanel;
var treePanel2;
var themes; //variable global para almacenar el tema de las capas elegido por el usuario en los combobox
var groups; //variable global para almacenar el grupo de las capas elegido por el usuario en los combobox
var single_layer; //variable global para almacenar la capa elegida por el usuario en los combobox
var geojsonPostgis;

Ext.application({
    name: 'Name_application',
    launch: function () {
        //var source1;
        //var source2;
        //var source3;
        //var layer1;
        //var layer2;
        //var layer3;
        //var layer4;
        var group;
        var olMap;
        var treeStore;
        var panelleft; //panel izquierdo
        var panelright; //panel derecho
        var menu; //menu por debajo menu bootstral
        var overviewMap; //Mapa de posicion
        var ovMapPanel; //Panel para el mapa de posicion


        //source1 = new ol.source.Stamen({layer: 'watercolor'});
        //layer1 = new ol.layer.Tile({
        //    legendUrl: 'https://stamen-tiles-d.a.ssl.fastly.net/' +
        //        'watercolor/2/1/0.jpg',
        //    source: source1,
        //    name: 'Stamen Watercolor'
        //});

        //source2 = new ol.source.Stamen({layer: 'terrain-labels'});
        //layer2 = new ol.layer.Tile({
        //    legendUrl: 'https://stamen-tiles-b.a.ssl.fastly.net/' +
        //        'terrain-labels/4/4/6.png',
        //    source: source2,
        //    name: 'Stamen Terrain Labels'
        //});

        //source3 = new ol.source.TileWMS({
        //    url: 'https://ows.terrestris.de/osm-gray/service',
        //    params: {'LAYERS': 'OSM-WMS', 'TILED': true}
        //});
        //layer3 = new ol.layer.Tile({
        //    legendUrl: 'https://ows.terrestris.de/osm-gray/service?' +
        //        'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&' +
        //        'TRANSPARENT=true&LAYERS=OSM-WMS&TILED=true&WIDTH=256&' +
        //        'HEIGHT=256&CRS=EPSG%3A3857&STYLES=&' +
        //        'BBOX=0%2C0%2C10018754.171394622%2C10018754.171394622',
        //    source: source3,
        //    name: 'terrestris OSM WMS',
        //    visible: false
        //});

        //layer4 = new ol.layer.Vector({
        //    source: new ol.source.Vector(),
        //    name: 'Vector '
        //});

        source = new ol.source.OSM();
        layer = new ol.layer.Tile({
            source: source,
            name: 'OpenStreetMap Layer'
        });


        //TEST GEOJSON
        var geojsonObject =
            {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:3857'
                    }
                },
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'MultiPolygon',
                        'coordinates': [
                            [[[-5.6750576, 38.2550151], [-5.6750405, 38.2550487], [-5.6750309, 38.2550455]],
                            [[-5.67501, 38.255038], [-5.675011, 38.2550609], [-5.6749818, 38.2550625]],
                            [[-5.6749792, 38.2550263], [-5.6749956, 38.2549926], [-5.6750576, 38.2550151]]]
                        ]
                    }
                }]
            };

        geojsonObject.features.push({
            'type': 'Feature',
            'geometry': {
                'type': 'MultiPolygon',
                'coordinates': [
                    [[[-5.6755576, 38.2550051], [-5.6759405, 38.2554487], [-5.6750309, 38.2550455]],
                    [[-5.67501, 38.255038], [-5.675011, 38.2550609], [-5.6749818, 38.2550625]],
                    [[-5.6749792, 38.2550263], [-5.6749956, 38.2549926], [-5.6750576, 38.2550151]]]
                ]
            }
        });
        var image = new ol.style.Circle({
            radius: 5,
            fill: null,
            stroke: new ol.style.Stroke({ color: 'red', width: 1 })
        });

        var styles = {
            'Point': new ol.style.Style({
                image: image
            }),
            'LineString': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 1
                })
            }),
            'MultiLineString': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 1
                })
            }),
            'MultiPoint': new ol.style.Style({
                image: image
            }),
            'MultiPolygon': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 0, 0.1)'
                })
            }),
            'Polygon': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    lineDash: [4],
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)'
                })
            }),
            'GeometryCollection': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'magenta',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'magenta'
                }),
                image: new ol.style.Circle({
                    radius: 10,
                    fill: null,
                    stroke: new ol.style.Stroke({
                        color: 'magenta'
                    })
                })
            }),
            'Circle': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,0.2)'
                })
            })
        };

        var styleFunction = function (feature) {
            return styles[feature.getGeometry().getType()];
        };

        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(geojsonObject, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });

        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: styleFunction,
            name: 'OpenStreetMap Buildings'
        });
        //FIN TEST GEOJSON


        //group = new ol.layer.Group({
        //    layers: [layer, layer2],
        //    name: 'Base Layers'
        //});

        //Proyecion del mapa
        var Projection = new ol.proj.Projection({
            code: 'EPSG:3857',
            units: 'm'
        });

        olMap = new ol.Map({
            controls: ol.control.defaults().extend([
                new ol.control.FullScreen(),
                new ol.control.ZoomToExtent({
                    //extent: [
                    //    393335.175784, 3896421.18109,
                    //    401256.8368764955, 5556421.18109
                    //]
                })
            ]),
            layers: [layer, vectorLayer],
            view: new ol.View({
                projection: Projection,
                center: ol.proj.transform([-3.68, 40.48], 'EPSG:4326', 'EPSG:3857'),
                zoom: 5
            })
        });



        //BARRA DE HERRAMIENTAS (ACCIONES)
        var ctrl, toolbarItems = [],
            action, actions = {};

        toolbarItems.push("-");
        toolbarItems.push(Ext.create('Ext.form.field.Text', {
            id: 'textgeocode',
            value: 'Search adress'
        }));

        toolbarItems.push(Ext.create('Ext.button.Button', {
            text: 'Search',
            handler: function () {
                //alert($('#textgeocode-inputEl').val());
                var direction = $('#textgeocode-inputEl').val();
                codeAddress(direction, olMap);

            }
        }));


        //MAPA CENTRAL

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap,
        });

        mapPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
            layout: 'fit',
            border: true,
            items: [mapComponent],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: toolbarItems
            }]
        });

        treeStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: olMap.getLayerGroup()
        });


        //PANEL LATERAL IZQUIERDO
        treePanel = Ext.create('Ext.tree.Panel', {
            store: treeStore,
            border: false,
            rootVisible: false,
            hideHeaders: true,
            lines: false,
            flex: 1,
            columns: {
                header: false,
                items: [
                    {
                        xtype: 'treecolumn',
                        dataIndex: 'text',
                        flex: 1,
                        plugins: [
                            {
                                ptype: 'basic_tree_column_legend'
                            }
                        ]
                    }
                ]
            },
            fbar: {
                //style: { background:'#08088A', marginTop: '0px' , borderWidth:'0px'},
                items: [
                    {
                        //boton para el ejecutar el calculo de ruta
                        xtype: 'button',
                        text: '<div style="color: Black">Add layer</div>',
                        height: 25,
                        //escuchador de eventos para cuando pulsamos el raton o pasamos por encima el raton
                        listeners: {
                            //evento on click
                            click: function () {

                                //variable global para almacenar la capa elegida para visualizar por el usuario en los combobox
                                var selected_layer_display = null; 
                                var selected_group_display = null;
                                var selected_theme_display = null;
                                var options = [selected_theme_display, selected_group_display, selected_layer_display];

                                selecttheme();   //funcion que hace consulta sobre postgis para obtener los nombres

                                var themestore_display = Ext.create('Ext.data.Store', {
                                    model: 'capasmodel',
                                    data: themes
                                });



                                var singlelayerstore= Ext.create('Ext.data.Store', {
                                    model: 'capasmodel',
                                    data: single_layer
                                });
        //fin obtencion variables para el combobox de temas de capas



                                Ext.create('Ext.window.Window', {
                                    title: 'Add layer to display',
                                    closable: true,
                                    //closeAction: 'hide',
                                    width: 260,
                                    //minWidth: 200,
                                    height: 200,
                                    bodyStyle: 'margin: 10px;',
                                    animCollapse: false,
                                    border: false,
                                    modal: true,

                                    items: [{

 //Selector de la tematica para desplegar el grupo de capas

                                            xtype: 'combo',
                                            fieldLabel: 'Layer Theme',
                                            id: 'selecttheme_display',
                                            store: themestore_display,
                                            displayField: 'name',
                                            value: 'Select theme',
                                            width: 230,
                                            queryMode: 'local',
                                            typeAhead: true,
                                            listeners: {
                                                select: function (combo, records) {

                                                    selected_theme_display = combo.getValue(); //sacamos el valor seleccionado
                                                    selectgroup(selected_theme_display);  //buscamos en postgis los grupos de capas de esa tema
                                                    //Añadimos un store con el resultado de esa busqueda

                                                    var groupstore = Ext.create('Ext.data.Store', {
                                                        model: 'capasmodel',
                                                        data: groups
                                                    });

                                                    Ext.getCmp('selectgroup_display').bindStore(groupstore);

                                                }
                                            }
                                        }, { //Selector del grupo de capas

                                            xtype: 'combo',
                                            fieldLabel: 'Layer Group',
                                            id: 'selectgroup_display',
                                            displayField: 'name',
                                            width: 230,
                                            //store: groupstore,
                                            queryMode: 'local',
                                            typeAhead: true,
                                            listeners: {
                                                select: function (combo, records) {

                                                    selected_group_display = combo.getValue(); //sacamos el valor seleccionado
                                                    selectlayers(selected_group_display);  //buscamos en postgis los grupos de capas de esa tema
                                                    //Añadimos un store con el resultado de esa busqueda

                                                    var singlelayersstore = Ext.create('Ext.data.Store', {
                                                        model: 'capasmodel',
                                                        data: single_layer
                                                    });

                                                    Ext.getCmp('selectlayer_display').bindStore(singlelayersstore);

                                                }
                                            }
                                        }, { //Selector de la capa de cada grupo

                                            xtype: 'combo',
                                            fieldLabel: 'Single Layer',
                                            id: 'selectlayer_display',
                                            displayField: 'name',
                                            width: 230,
                                            //store: singlelayerstore,
                                            queryMode: 'local',
                                            typeAhead: true,
                                            listeners: {
                                                select: function (combo, records) {

                                                    selected_layer_display = combo.getValue(); //sacamos el valor seleccionado
                                           
                                                }
                                            }
                                        },{
                                            xtype: 'button',
                                            text: '<div style="color: Black">Display layer</div>',
                                            height: 25,
                                            margin: "15 2 4 2",
                                            //escuchador de eventos para cuando pulsamos el raton o pasamos por encima el raton
                                            listeners: {
                                                //evento on click
                                                click: function () {

                                                    var ex = olMap.getView().calculateExtent(olMap.getSize());
                                                    ex = ol.proj.transformExtent(ex, ol.proj.get('EPSG:3857'), ol.proj.get('EPSG:4326'));
                                                    options[0] = selected_theme_display;
                                                    options[1] = selected_group_display;
                                                    options[2] = selected_layer_display;
                                                    options[3] = ex;
                                                    displaylayers(options);

                                                    var vector_Source = new ol.source.Vector({
                                                        features: (new ol.format.GeoJSON()).readFeatures(geojsonPostgis, {
                                                            dataProjection: 'EPSG:4326',
                                                            featureProjection: 'EPSG:3857'
                                                        })
                                                    });

                                                    var vector_Layer = new ol.layer.Vector({
                                                        source: vector_Source,
                                                        style: styleFunction,
                                                        name: selected_layer_display
                                                    });

                                                    olMap.addLayer(vector_Layer);
                                                    
                                                    this.up('window').destroy(); //cerramos la ventana
                                                },
                                            }
                                        }
                                    ],
                                }).show();

                            },
                        }

                    }, {
                        xtype: 'tbspacer',
                        width: 85,
                        plugins: 'responsive',
                        responsiveConfig: {
                            'width < 800': {
                                hidden: true,
                            },
                            'width >= 800': {
                                hidden: false,
                            },
                        },

                    },

                    {
                        xtype: 'button',
                        text: '<div style="color: Black">Remove layer</div>',
                        height: 25,
                        //escuchador de eventos para cuando pulsamos el raton o pasamos por encima el raton
                        listeners: {
                            //evento on click
                            click: function () {

                            },
                        },

                    }
                ]
            }
        });

        overviewMap = Ext.create('GeoExt.component.OverviewMap', {
            parentMap: olMap,
            magnification: 12
        });

        ovMapPanel = Ext.create('Ext.panel.Panel', {
            //title: 'OverviewMap (default)',
            flex: 1,
            layout: 'fit',
            items: overviewMap
        });

        panelleft = Ext.create('Ext.form.Panel', {
            xtype: 'panel',
            region: 'west',
            title: 'Layers',
            //width: 300,
            split: true,
            collapsible: true,
            plugins: 'responsive',
            responsiveConfig: {
                'width < 700': {
                    width: 200,
                },
                'width >= 700': {
                    width: 280,
                },
            },
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                treePanel,
                ovMapPanel
            ]
        });



        //PANEL LATERAL DERECHO


        //Variables para el select de capas de analisis

        selecttheme();   //funcion que hace consulta sobre postgis para obtener los nombres
        
        var themestore = Ext.create('Ext.data.Store', {
            model: 'capasmodel',
            data: themes
        });



        var singlelayerstore = Ext.create('Ext.data.Store', {
            model: 'capasmodel',
            data: single_layer
        });
        //fin obtencion variables para el combobox de temas de capas


        panelright = Ext.create('Ext.form.Panel', {
            //hidden : false,
            title: 'Spatial Analysis',
            //responsive design
            plugins: 'responsive',
            layout: 'fit',
            resizable: 'true',
            responsiveConfig: {
                landscape: {
                    region: 'east'
                },
                portrait: {
                    region: 'north'
                },
                'height < 400 && wide': {
                    hidden: true,
                },
                'height >= 400 && wide': {
                    hidden: false,
                },
            },
            collapsed: true,
            collapsible: true,

            items: [{

                xtype: "tabpanel",  //Grupo de pestañas
                id: "tabpanel",
                width: 350,
                plugins: 'responsive',
                responsiveConfig: {
                    'width < 700': {
                        width: 300,
                    },
                    'width >= 700': {
                        width: 350,
                    },
                },
                // height: 350,
                //autoHeight: true,
                autowidth: true,
                activeTab: 0,
                items: [{
                    title: 'Location seeker', //pestaña1
                    bodyPadding: 0,
                    //xtype: "tabpanel",
                    layout: 'accordion',
                    id: 'acordeon',
                    defaults: {
                        bodyStyle: 'padding:15px'
                    },
                    layoutConfig: {
                        titleCollapse: false,
                        animate: true,
                        activeOnTop: true,
                    },
                    items: [{
                        title: 'Favorable conditions',
                        id: 'favorable',
                        items: [

                            { //Selector de la tematica para desplegar el grupo de capas
                            
                                xtype: 'combo',
                                fieldLabel: 'Layer Theme',
                                id: 'selecttheme',
                                displayField: 'name',
                                value: 'Select theme',
                                width: 265,
                                store: themestore,
                                queryMode: 'local',
                                typeAhead: true,
                                listeners: {
                                    select: function (combo, records) {

                                        var selected_theme = combo.getValue(); //sacamos el valor seleccionado
                                        selectgroup(selected_theme);  //buscamos en postgis los grupos de capas de esa tema
                                        //Añadimos un store con el resultado de esa busqueda

                                        var groupstore = Ext.create('Ext.data.Store', {
                                            model: 'capasmodel',
                                            data: groups
                                        });

                                        Ext.getCmp('selectgroup').bindStore(groupstore);

                                    }
                                }
                            }, { //Selector del grupo de capas

                                xtype: 'combo',
                                fieldLabel: 'Layer Group',
                                id: 'selectgroup',
                                displayField: 'name',
                                width: 265,
                                //store: groupstore,
                                queryMode: 'local',
                                typeAhead: true,
                                listeners: {
                                    select: function (combo, records) {

                                        var selected_group = combo.getValue(); //sacamos el valor seleccionado
                                        selectlayers(selected_group);  //buscamos en postgis los grupos de capas de esa tema
                                        //Añadimos un store con el resultado de esa busqueda

                                        var singlelayersstore = Ext.create('Ext.data.Store', {
                                            model: 'capasmodel',
                                            data: single_layer
                                        });

                                        Ext.getCmp('selectlayer').bindStore(singlelayersstore);

                                    }
                                }
                            }, { //Selector de la capa de cada grupo

                                xtype: 'combo',
                                fieldLabel: 'Single Layer',
                                id: 'selectlayer',
                                displayField: 'name',
                                width: 265,
                                //store: singlelayerstore,
                                queryMode: 'local',
                                typeAhead: true
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Maximum influence distance',
                                id: 'buffer_dist',
                                value: "100",
                                width: 210,
                            }, {
                                xtype: 'button',
                                text: '<div style="color: Black">Add Condition</div>',
                                height: 25,
                                margin: "15 2 4 2",
                                //escuchador de eventos para cuando pulsamos el raton o pasamos por encima el raton
                                listeners: {
                                    //evento on click
                                    click: function () {



                                    },
                                }


                            }

                        ]
                    }, {
                        title: 'Disfavorable conditions',
                        id: 'disfavorable',
                        items: [

                            { //Selector de la tematica para desplegar el grupo de capas

                                xtype: 'combo',
                                fieldLabel: 'Layer Theme',
                                id: 'selecttheme_dis',
                                displayField: 'name',
                                value: 'Select theme',
                                width: 265,
                                store: themestore,
                                queryMode: 'local',
                                typeAhead: true
                            },{ //Selector del grupo de capas

                                xtype: 'combo',
                                fieldLabel: 'Layer Group',
                                id: 'selectgroup_dis',
                                displayField: 'name',
                                width: 265,
                                store: themestore,
                                queryMode: 'local',
                                typeAhead: true
                            }, { //Selector de la capa de cada grupo

                                xtype: 'combo',
                                fieldLabel: 'Single Layer',
                                id: 'selectlayer_dis',
                                displayField: 'name',
                                width: 265,
                                store: themestore,
                                queryMode: 'local',
                                typeAhead: true
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Maximum influence distance',
                                id: 'buffer_dist_dis',
                                value: "100",
                                width: 210,
                            }, {
                                xtype: 'button',
                                text: '<div style="color: Black">Add Condition</div>',
                                height: 25,
                                margin: "15 2 4 2",
                                //escuchador de eventos para cuando pulsamos el raton o pasamos por encima el raton
                                listeners: {
                                    //evento on click
                                    click: function () {



                                    },
                                }


                            }

                        ]
                    }
                    ],
                    fbar: {
                        //style: { background:'#08088A', marginTop: '0px' , borderWidth:'0px'},
                        items: [
                            {
                            //boton para el ejecutar el calculo de ruta
                            xtype: 'button',
                            text: '<div style="color: Black">Calculate location</div>',
                            height: 25,
                            //escuchador de eventos para cuando pulsamos el raton o pasamos por encima el raton
                            listeners: {
                                //evento on click
                                click: function () {

                                },
                            }

                            },

                            {
                                xtype: 'button',
                                text: '<div style="color: Black">TEST POSTGIS</div>',
                                height: 25,
                                //escuchador de eventos para cuando pulsamos el raton o pasamos por encima el raton
                                listeners: {
                                    //evento on click
                                    click: function () {
                                        Ext.Ajax.request({
                                            url: '/Home/GetLayout',
                                            params: "",
                                            headers: { 'Content-Type': 'application/json; charset=utf-8' },
                                            method: "GET",
                                            success: function (response) {
                                                Ext.Msg.alert('Javi, ah\u00ed tienes tu json, ahora vas y lo pintas!', response.responseText, Ext.emptyFn)
                                            },
                                            failure: function (response) {
                                                Ext.Msg.alert('Algo ha ido mal', response, Ext.emptyFn)
                                            }
                                        });
                                    },
                                },

                            }
                        ]
                    }

                }, {
                    title: 'Routing', //pestaña2
                    bodyPadding: 0,
                    //xtype: "tabpanel",
                    layout: 'accordion',
                    id: 'acordeon2',
                    defaults: {
                        bodyStyle: 'padding:15px'
                    },
                    layoutConfig: {
                        titleCollapse: false,
                        animate: true,
                        activeOnTop: true,
                    },
                    items: [{
                        title: 'By direction',
                        id: 'pordireccion',
                        items: [

                        ]
                    }, {
                        title: 'By coordinates',
                        id: 'porcoordenadas',
                        items: [

                        ]
                    }
                    ],
                    fbar: {
                        //style: { background:'#08088A', marginTop: '0px' , borderWidth:'0px'},
                        items: [{
                            xtype: 'label',
                            id: 'distancia',
                            text: '',
                        },


                        { //boton para el ejecutar el calculo de ruta
                            xtype: 'button',
                            text: '<div style="color: Black">Calcular ruta</div>',
                            height: 25,
                            //escuchador de eventos para cuando pulsamos el raton o pasamos por encima el raton
                            listeners: {
                                //evento on click
                                click: function () {

                                },
                            }

                        }
                        ]
                    }




                }]
            }]
        });




        //MENU PRINCIPAL (Lo ponemos vacioa para que el mapa no tape el menu bootstrap)
        menu = Ext.create('Ext.form.Panel', {
            id: 'menu',
            hidden: false,
            /*bodyStyle:{
                 background:'#08088A'
               },  */
            height: 50,
            //responsive design
            plugins: 'responsive',
            responsiveConfig: {
                landscape: {
                    region: 'north'
                },
                portrait: {
                    region: 'north'
                }
            },
            tbar: {
                style: {
                    background: '#08088A',
                    marginTop: '0px',
                    borderWidth: '0px'
                },
            }

        });



        //ELEMENTO PRINCIPAL EXTJS
        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
                menu,
                mapPanel,
                panelleft,
                panelright
            ]
        });
    }
});
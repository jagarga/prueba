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


        //group = new ol.layer.Group({
        //    layers: [layer, layer2],
        //    name: 'Base Layers'
        //});

        olMap = new ol.Map({
            layers: [layer],         
            view: new ol.View({
                projection: "EPSG:4326",
                center: [-3.68, 40.48],
                zoom: 5
            })
        });
        

        //BARRA DE HERRAMIENTAS (ACCIONES)
        var ctrl, toolbarItems = [],
            action, actions = {};

        toolbarItems.push("-");
        toolbarItems.push(Ext.create('Ext.form.field.Text', {
            id: 'textgeocode',
            value: 'Buscar direccion'
        }));


        //MAPA CENTRAL

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap,
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: toolbarItems
            }]
        });

        mapPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
            layout: 'fit',
            border: true,
            items: [mapComponent]
        });

        treeStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: olMap.getLayerGroup()
        });


        //PANEL LATERAL IZQUIERDO
        treePanel = Ext.create('Ext.tree.Panel', {
            title: 'Layers',
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
        Ext.define('capasmodel', {
            extend: 'Ext.data.Model',
            fields: [{
                type: 'string',
                name: 'name'
            },]
        });


        var capas = olMap.getLayers();
        var capasmodel = '[';

        for (i = 0; i < capas.length; i++) {

            capasmodel = capasmodel + '{"name":"' + capas[i].name + '"},'

        }
        capasmodel = capasmodel + ']'

        capasmodel = eval(capasmodel);


        var capastore = Ext.create('Ext.data.Store', {
            model: 'capasmodel',
            data: capasmodel
        });



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

                            { //Selector del grupo de capas

                                xtype: 'combo',
                                fieldLabel: 'Layer Group',
                                id: 'selectgroup',
                                displayField: 'name',
                                width: 210,
                                store: capastore,
                                queryMode: 'local',
                                typeAhead: true
                            }, { //Selector de la capa de cada grupo

                                xtype: 'combo',
                                fieldLabel: 'Single Layer',
                                id: 'selectlayer',
                                displayField: 'name',
                                width: 210,
                                store: capastore,
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

                            { //Selector del grupo de capas

                                xtype: 'combo',
                                fieldLabel: 'Layer Group',
                                id: 'selectgroup_dis',
                                displayField: 'name',
                                width: 210,
                                store: capastore,
                                queryMode: 'local',
                                typeAhead: true
                            },{ //Selector de la capa de cada grupo

                                xtype: 'combo',
                                fieldLabel: 'Single Layer',
                                id: 'selectlayer_dis',
                                displayField: 'name',
                                width: 210,
                                store: capastore,
                                queryMode: 'local',
                                typeAhead: true
                            },{
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
                        items: [{
                            xtype: 'label',
                            id: 'distancia',
                            text: '',
                        },


                        { //boton para el ejecutar el calculo de ruta
                            xtype: 'button',
                            text: '<div style="color: Black">Calculate location</div>',
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

function generate_map_chart(dataPath) {
    $.getJSON(dataPath, function (data) {

        var countiesMap = Highcharts.geojson(Highcharts.maps['countries/us/us-all-all']),
            lines = Highcharts.geojson(Highcharts.maps['countries/us/us-all-all'], 'mapline'),
            options;

        // Add state acronym for tooltip
        Highcharts.each(countiesMap, function (mapPoint) {
            mapPoint.name = mapPoint.name + ', ' + mapPoint.properties['hc-key'].substr(3, 2);
        });

        options = {
            chart: {
                borderWidth: 1,
                marginRight: 50 // for the legend
            },

            title: {
                text: 'U.S. Average Houses Price Growth Rate'
            },

            legend: {
                title: {
                    text: 'Growth Rate',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                    }
                },
                layout: 'vertical',
                align: 'right',
                floating: true,
                valueDecimals: 0,
                valueSuffix: '%',
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || 'rgba(255, 255, 255, 0.85)',
                symbolRadius: 0,
                symbolHeight: 14
            },

            mapNavigation: {
                enabled: true
            },

            colorAxis: {
                dataClasses: [{
                    from: 0,
                    to: 2,
                    color: "#F1EEF6"
                }, {
                    from: 2,
                    to: 4,
                    color: "#D4B9DA"
                }, {
                    from: 4,
                    to: 6,
                    color: "#C994C7"
                }, {
                    from: 6,
                    to: 8,
                    color: "#DF65B0"
                }, {
                    from: 8,
                    to: 10,
                    color: "#DD1C77"
                }, {
                    from: 10,
                    color: "#980043"
                }]
            },

            plotOptions: {
                mapline: {
                    showInLegend: false,
                    enableMouseTracking: false
                }
            },

            series: [{
                mapData: countiesMap,
                data: data,
                joinBy: ['hc-key', 'code'],
                name: 'Growth Rate',
                tooltip: {
                    valueSuffix: '%'
                },
                borderWidth: 0.5,
                states: {
                    hover: {
                        color: '#a4edba'
                    }
                }
            }, {
                type: 'mapline',
                name: 'State borders',
                data: [lines[0]],
                color: 'white'
            }, {
                type: 'mapline',
                name: 'Separator',
                data: [lines[1]],
                color: 'gray'
            }],

            exporting: {
                enabled: false
            }
        };

        // Instanciate the map
        $('#maps_container').highcharts('Map', options);
    });
}

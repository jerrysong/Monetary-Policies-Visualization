/**
 * Invoke other modules in this domain to generate dynamic visualizations.
 */
$(function() {
    generate_side_by_side_charts('resources/data/stock_bond_data.json');
    generate_map_chart('https://www.highcharts.com/samples/data/jsonp.php?filename=us-counties-unemployment.json&callback=?');
    apply_highchart_theme();
    $(".main").onepage_scroll({
        sectionContainer: "section"
    });
});

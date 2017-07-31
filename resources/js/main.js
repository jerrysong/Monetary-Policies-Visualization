"use strict";

$(function() {
    var stockDataPath = "resources/data/stock_data.csv";
    var monthlyDataPath = "resources/data/monthly_data.csv";

    var stockVis = new StockVis();
    stockVis.run(stockDataPath, monthlyDataPath);
});

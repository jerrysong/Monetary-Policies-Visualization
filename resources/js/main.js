"use strict";

$(function() {
    var stockDataPath = "stock_data.csv";
    var monthlyDataPath = "monthly_data.csv";

    var stockVis = new StockVis();
    stockVis.run(stockDataPath, monthlyDataPath);
});

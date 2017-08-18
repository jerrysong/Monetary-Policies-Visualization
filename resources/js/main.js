"use strict";

$(function() {
    var sections = d3.select("#navbar").select("ul").selectAll("li").nodes();
    var stockDataPath = "resources/data/stock_data.csv";
    var bondDataPath = "resources/data/bond_data.csv";
    var monthlyDataPath = "resources/data/monthly_data.csv";
    var incomeExpensePath = "resources/data/income_expense_data.csv";
    var timelineDataPath = "resources/data/timeline.csv"
    var debtPath = "resources/data/debt.csv";
    var quintilePath = "resources/data/quintiles.csv";

    setupScrollbar(sections);
    setupNavigationBar();
    setupRuntimeAttributes();

    var stockVis = new StockVis();
    stockVis.run(stockDataPath, monthlyDataPath, "#stock-container");

    var bondVis = new BondVis();
    bondVis.run(bondDataPath, monthlyDataPath, "#bond-container");

    var incomeExpenseVis = new IncomeExpenseVis();
    incomeExpenseVis.run(incomeExpensePath);

    var balanceVis = new BalanceVis();
    balanceVis.run(timelineDataPath);

    var quintilesVis = new QuintilesVis(quintilePath);
    var debtVis = new DebtVis(debtPath);
});

// The dimension attributes must be set in runtime to fit the screen size properly.
function setupRuntimeAttributes() {
    StokcBondShared.constants = {};
    StokcBondShared.constants.parseDate = d3.timeParse("%m/%d/%y");
    StokcBondShared.constants.SVG_WIDTH = $('#stcok-vis').find('svg').width()
    StokcBondShared.constants.SVG_HEIGHT = $('#stcok-vis').find('svg').height();
    StokcBondShared.constants.MONTHS = [
        "January",
        "Feburary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    StokcBondShared.constants.MARGIN = {
        top: 20,
        left: StokcBondShared.constants.SVG_WIDTH * 0.2
    };
    StokcBondShared.constants.MAIN_CHART_WIDTH = StokcBondShared.constants.SVG_WIDTH - StokcBondShared.constants.MARGIN.left;
    StokcBondShared.constants.MAIN_CHART_HEIGHT = StokcBondShared.constants.SVG_HEIGHT - StokcBondShared.constants.MARGIN.top;
    StokcBondShared.constants.TOP_PADDING = StokcBondShared.constants.MAIN_CHART_HEIGHT * 0.05;
    StokcBondShared.constants.CHARTS_SPACING = StokcBondShared.constants.MAIN_CHART_HEIGHT * 0.12;
    StokcBondShared.constants.UPPER_CHART_WIDTH = StokcBondShared.constants.MAIN_CHART_WIDTH;
    StokcBondShared.constants.UPPER_CHART_HEIGHT = StokcBondShared.constants.MAIN_CHART_HEIGHT * 0.5;
    StokcBondShared.constants.LOWER_CHART_WIDTH = StokcBondShared.constants.MAIN_CHART_WIDTH;
    StokcBondShared.constants.LOWER_CHART_HEIGHT = StokcBondShared.constants.MAIN_CHART_HEIGHT * 0.2;
    StokcBondShared.constants.TIME_AXIS_TRANSFORM = StokcBondShared.constants.MAIN_CHART_HEIGHT * 0.95;
    StokcBondShared.constants.START_DATE = StokcBondShared.constants.parseDate("1/31/07");
    StokcBondShared.constants.END_DATE = StokcBondShared.constants.parseDate("6/30/17");
    StokcBondShared.constants.ELECTION_DATE = StokcBondShared.constants.parseDate("11/30/16");

    StockVis.prototype.constants = StokcBondShared.constants;
    BondVis.prototype.constants = StokcBondShared.constants;
    FedVis.prototype.constants = StokcBondShared.constants;

    IncomeExpenseVis.prototype.width = $('#income-expense').find('.vis').width();
    IncomeExpenseVis.prototype.height = $('#income-expense').find('.vis').height();

    BalanceVis.prototype.balanceHeight = $('#balance_div').height();
};

function setupScrollbar(sections) {
    $(".main").onepage_scroll({
        sectionContainer: "section",
        easing: "ease",
        animationTime: 750,
        keyboard: true,
        loop: false,
        afterMove: function(index) {
            for (var i = 0; i < sections.length; i++) {
                if (index - 1 == i) {
                    d3.select(sections[i])
                        .classed("active", true);
                } else {
                    d3.select(sections[i])
                        .classed("active", false);
                }
            }
        },
    });
}

function setupNavigationBar() {
    d3.select("#navbar")
        .selectAll("a")
        .on("click", function(d, i) {
            $(".main").moveTo(i+1);
        });
}

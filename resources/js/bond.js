/*
Author: Song Lingyi Jerry
*/

"use strict";

var BondVis = function() {
    /** Define constants. */
    const INTEREST_RATE_COLOR = "#800000";

    /** Define class member fields. */
    var self = this;
    self.bondData;
    self.dataLength;
    self.initialBondRate;
    self.isMouseActive = true;
    self.container;
    self.svg;
    self.mainChart;
    self.chartBackground;
    self.tooltip;
    self.focusLine;
    self.xScale;
    self.yScale;
    self.insightBox;
    self.insightText;
    self.insightButton;
    self.yieldRegion;
    self.fristQERegion;
    self.secondQERegion;
    self.electionRegion;
    self.fed = new FedVis();
    self.insightFunctions = [
        showBondDataInsight,
        showYieldInsight,
        showBuybackInsight,
        showFirstQEEventInsight,
        showSecondQEEventInsight,
        showElectionInsight,
    ];
    self.insightState = 0;

    /** The public function to be called in the main js. */
    self.run = function(bondDataPath, monthlyDataPath, bondContainer) {
        self.container = d3.select(bondContainer);
        self.svg = self.container.select("svg")
        self.mainChart = self.createMainChart(self.svg);
        self.chartBackground = self.createChartBackground(self.mainChart, self.fed, mainChartMouseMove, mainChartMouseOut);
        self.tooltip = self.createTooltip(self.container);
        self.focusLine = self.createFocusRegion(self.svg);
        self.createInsightBox(self);
        self.buildOnFederalReserveData(self, monthlyDataPath, mainChartMouseMove, mainChartMouseOut);
        buildOnBondData(bondDataPath);
    };

    /** Define private functions. */
    function buildOnBondData(bondDataPath) {
        d3.csv(bondDataPath,
            function(error, rawData) {
                if (error) throw error;

                parseBondData(rawData);
                self.dataLength = self.bondData.length;
                self.initialBondRate = self.bondData[0].rate;
                self.xScale = self.getTimeScale(self.bondData, self.constants.LOWER_CHART_WIDTH);
                self.yScale = getBondYScale(self.bondData);

                createBondStreamChart(mainChartMouseMove, mainChartMouseOut);
                createBondLegend();
                createYieldAnnotationRegion();
                createFirstQEAnnotationRegion();
                createSecondQEAnnotationRegion();

                var eventIndex = 118;
                var x = self.fed.balanceTimeScale(self.bondData[eventIndex].date) + self.constants.MARGIN.left;
                var y = self.yScale(self.bondData[eventIndex].rate);
                self.createElectionRegion(self, x, y);
                self.insightFunctions[0]();
            });
    };

    function parseBondData(input) {
        var output = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currMonth = self.constants.parseDate(input[i].date).getMonth(),
                priorMonth = self.constants.parseDate(input[i - 1].date).getMonth();

            if (currMonth != priorMonth) {
                var num = i - start;
                var date = self.constants.parseDate(input[i - 1].date);
                var obj = {
                    rate: input.slice(start, i).reduce(function(sum, item) {
                        return sum + item.rate / num;
                    }, 0),
                    date: new Date(date.getFullYear(), date.getMonth() + 1, 0)
                };
                output.push(obj);
                start = i;
            }
        }

        var num = input.length - start;
        var date = self.constants.parseDate(input[i - 1].date);
        var obj = {
            rate: input.slice(start, i).reduce(function(sum, item) {
                return sum + item.rate / num;
            }, 0),
            date: new Date(date.getFullYear(), date.getMonth() + 1, 0)
        };
        output.push(obj);

        self.bondData = output;
    };

    function createBondLegend() {
        var title = "U.S. Bond Yield";
        var titleX = 0;
        var titleY = 10 + self.constants.MARGIN.top;
        var rectX = 0;
        var rectY = 20 + self.constants.MARGIN.top;
        var textX = 40;
        var textY = 30 + self.constants.MARGIN.top;

        var legend = self.svg.append("g")
            .attr("class", "legend")
            .attr("text-anchor", "start");

        legend.append("g")
            .attr("class", "title")
            .append("text")
            .attr("x", titleX)
            .attr("y", titleY)
            .text(title);

        if (legend.select(".title").select("text").style("font-size") != "15px") {
            textY -= 5;
        }

        var enter = legend.append("g")
            .attr("class", "items");

        var row1 = enter.append("g")
            .attr("transform", "translate(0,0)");

        row1.append("rect")
            .attr("class", "symbol")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("fill", INTEREST_RATE_COLOR);

        row1.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .text("10 Year Bond");
    };

    function createBondStreamChart(mainChartMouseMove, mainChartMouseOut) {
        var areaMaker = d3.area()
            .curve(d3.curveCatmullRom)
            .x(function(d, i) {
                return self.xScale(d.date);
            })
            .y0(function(d) {
                return self.yScale(0);
            })
            .y1(function(d) {
                return self.yScale(d.rate);
            });

        self.mainChart.append("g")
            .attr("class", "interest-layer")
            .append("path")
            .datum(self.bondData)
            .style("fill", function(d) {
                return INTEREST_RATE_COLOR;
            })
            .attr("d", areaMaker)
            .attr("opacity", 1)
            .on("mousemove", mainChartMouseMove)
            .on("mouseout", mainChartMouseOut)
            .moveToFront();
    };

    function createYieldAnnotationRegion() {
        var highYieldIndex = 5;
        var lowYieldIndex = 114
        var x1 = self.fed.balanceTimeScale(self.bondData[highYieldIndex].date) + self.constants.MARGIN.left;
        var y1 = self.yScale(self.bondData[highYieldIndex].rate) + 15;
        var x2 = self.fed.balanceTimeScale(self.bondData[lowYieldIndex].date) + self.constants.MARGIN.left;
        var y2 = self.yScale(self.bondData[lowYieldIndex].rate) + 15;
        var labels = [{
            note: {
                title: self.bondData[highYieldIndex].rate.toFixed(2) + "%",
                label: "June 2007",
                lineType: "none",
                orientation: "leftRight",
                "align": "middle"
            },
            className: "event",
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 30
            },
            data: {
                x: x1,
                y: y1
            },
            dx: 40
        },{
            note: {
                title: self.bondData[lowYieldIndex].rate.toFixed(2) + "%",
                label: "July 2016",
                lineType: "none",
                "align": "middle"
            },
            className: "event",
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 30
            },
            data: {
                x: x2,
                y: y2
            },
            dy: -100
        }];

        var type = self.getEventAnnotationType();
        var makeAnnotations = self.getEventAnnotationCallback(type, labels);

        self.yieldRegion = self.svg.append("g")
            .attr("class", "annotation-region yield-region hidden")
            .call(makeAnnotations);
    };

    function createFirstQEAnnotationRegion() {
        var eventIndex = 76;
        var x = self.fed.balanceTimeScale(self.bondData[eventIndex].date) + self.constants.MARGIN.left;
        var y = self.yScale(self.bondData[eventIndex].rate) + 10;
        var labels = [{
            note: {
                title: "Forecast Unwinding QE",
                label: "May 2013",
                lineType: "none",
                "align": "middle"
            },
            className: "event",
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 30
            },
            data: {
                x: x,
                y: y
            },
            dy: -100
        }];

        var type = self.getEventAnnotationType();
        var makeAnnotations = self.getEventAnnotationCallback(type, labels);

        self.fristQERegion = self.svg.append("g")
            .attr("class", "annotation-region qe-region hidden")
            .call(makeAnnotations);
    };

    function createSecondQEAnnotationRegion() {
        var eventIndex = 83;
        var x = self.fed.balanceTimeScale(self.bondData[eventIndex].date) + self.constants.MARGIN.left;
        var y = self.yScale(self.bondData[eventIndex].rate) + 30;
        var labels = [{
            note: {
                title: "Start Unwinding QE",
                label: "Dec 2013",
                lineType: "none",
                "align": "middle"
            },
            className: "event",
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 30
            },
            data: {
                x: x,
                y: y
            },
            dy: -80
        }];

        var type = self.getEventAnnotationType();
        var makeAnnotations = self.getEventAnnotationCallback(type, labels);

        self.secondQERegion = self.svg.append("g")
            .attr("class", "annotation-region qe-region hidden")
            .call(makeAnnotations);
    };

    function showBondDataInsight() {
        var text = "There are two big ways the Federal Reserve's action inflated the market."
        self.electionRegion.classed("hidden", true);
        self.insightText.html(text);
    };

    function showYieldInsight() {
        var text = "Low <a href='https://en.wikipedia.org/wiki/Interest_rate#Monetary_policy'>interest rates</a> led to safe bonds providing less income. Yields on the benchmark 10 YR US bond fell from around 5% pre-Great Recession to just a hair about 1.5% at it’s lowest point. Investors had to look to riskier investments like stocks in their search for yields.";
        self.yieldRegion.classed("hidden", false);
        self.insightText.html(text);
    };

    function showBuybackInsight() {
        var text = "Low interest rates also led to companies borrowing an excessive amount of money. However, much of this money was used for <a href='https://en.wikipedia.org/wiki/Share_repurchase'>stock buybacks</a>, which used to be illegal due to being considered market manipulation. Corporate Debt has risen 50% since 2007.";
        self.yieldRegion.classed("hidden", true);
        self.insightText.html(text);
    };

    function showFirstQEEventInsight() {
        var text = "The Fed announces that it believes that will starting unwinding QE in the future. Bond prices immediately start rising until the Fed actually starts cutting QE, at which point the market reacts in a complete opposite direction as bond prices fall.";
        self.fristQERegion.classed("hidden", false);
        self.insightText.html(text);
    };

    function showSecondQEEventInsight() {
        var text = "The Fed starts unwinding QE. Bond Markets slowly fall after having risen for over 6 months in expectation of this event, eventually hittest their lowest point yet. It's questionable whether the advance warning served any legitimate purpose given this reversal.";
        self.fristQERegion.classed("hidden", true);
        self.secondQERegion.classed("hidden", false);
        self.insightText.html(text);
    };

    function showElectionInsight() {
        var text = "Trump is elected. Bond prices jump up significantly in expectation that Trump might help inflation with infrastructure spending.";
        self.secondQERegion.classed("hidden", true);
        self.electionRegion.classed("hidden", false);
        self.insightText.html(text);
    };

    function mainChartMouseMove(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        var invertedX = self.getInvertedX(mouseX, self.constants.UPPER_CHART_WIDTH, self.dataLength);
        var tooltipObj = getTooltipObj(invertedX);
        self.mainChartMouseMove(self, mouseX, mouseY, tooltipObj);
    };

    function mainChartMouseOut(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        self.mainChartMouseOut(self);
    };

    function getTooltipObj(x) {
        var time = self.fed.getDateAt(x).getFullYear() + "  " + self.constants.MONTHS[self.fed.getDateAt(x).getMonth()]
        var section1 = "U.S Bond";
        var section2 = "Federal Reserve";

        var bondValue = self.bondData[x].rate;
        var bondValueChange = (bondValue - self.initialBondRate) / self.initialBondRate;
        var bondValueChangePercentage = "Change Since Start: " + Math.round(bondValueChange * 1000) / 10 + "%";
        bondValue = "10 Year Bond Yield: " + bondValue.toFixed(2) + "%";

        var balance = self.fed.getValueAt(x);
        var balanceChange = (balance - self.fed.getValueAt(0)) / self.fed.getValueAt(0);
        var balanceChangePercentage = "Change Since Start: " + Math.round(balanceChange * 1000) / 10 + "%";
        balance = "Balance Sheet Volume: $" + (balance / 1000000).toFixed(2) + " Trillion";
        var qeStatus = "Quantitative Easing: " + self.fed.getQEStatus(self.fed.getDateAt(x));
        var interestRate = "Interest Rate: " + self.fed.getInterestRate(self.fed.getDateAt(x)) + "%";

        return [time, section1, bondValue, bondValueChangePercentage, section2, balance, balanceChangePercentage, qeStatus, interestRate];
    };

    function getBondYScale(data) {
        var interestYScale = d3.scaleLinear()
            .rangeRound([self.constants.TOP_PADDING + self.constants.UPPER_CHART_HEIGHT, self.constants.TOP_PADDING])
            .domain([0, d3.max(self.bondData, function(d) {
                return d.rate;
            })]);
        return interestYScale;
    }
};

/** Inherit shared functions*/
BondVis.prototype = StokcBondShared;
BondVis.prototype.getInvertedX = Shared.getInvertedX;
BondVis.prototype.getTimeScale = Shared.getTimeScale;
BondVis.prototype.hideFocusLine = Shared.hideFocusLine;
BondVis.prototype.hideTooltip = Shared.hideTooltip;

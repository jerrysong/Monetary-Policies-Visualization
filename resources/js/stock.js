/*
Author: Song Lingyi Jerry
*/

"use strict";

var StockVis = function() {
    /** Define constants. */
    const TOGGLE_HOVER_COLOR = "#00FFFF";
    const TOGGLE_SET_COLOR = "#b7dce9";
    const TOGGLE_UNSET_COLOR = "white";
    const BORDER_STROKE_COLOR = "black";
    const STOCK_INDEX_FACTOR = 1;

    /** Define class member fields. */
    var self = this;
    self.stockData;
    self.dataLength;
    self.initialStockVolume;
    self.sectors;
    self.baselineSector;
    self.stockColorScale;
    self.xScale;
    self.yScale;
    self.activeSectors = new Set();
    self.isMouseActive = true;
    self.currToggleColor;
    self.container;
    self.svg;
    self.mainChart;
    self.chartBackground;
    self.tooltip;
    self.focusLine;
    self.insightBox;
    self.insightText;
    self.insightButton;
    self.qeBoundaryRegion;
    self.electionRegion;
    self.fed = new FedVis();
    self.insightFunctions = [
        showStockDataInsight,
        showQEInsight,
        showElectionInsight,
    ];
    self.insightState = 0;

    /** The public function to be called in the main js. */
    self.run = function(stockDataPath, monthlyDataPath, stockContainer) {
        self.container = d3.select(stockContainer);
        self.svg = self.container.select("svg");
        self.mainChart = self.createMainChart(self.svg);
        self.chartBackground = self.createChartBackground(self.mainChart, self.fed, mainChartMouseMove, mainChartMouseOut);
        self.tooltip = self.createTooltip(self.container);
        self.focusLine = self.createFocusRegion(self.svg);
        self.buildOnFederalReserveData(self, monthlyDataPath, mainChartMouseMove, mainChartMouseOut);
        self.createInsightBox(self);
        buildOnStockData(stockDataPath);
    };

    /** Define private functions. */
    function buildOnStockData(stockDataPath) {
        d3.csv(stockDataPath,
            function(error, rawData) {
                if (error) throw error;

                self.sectors = rawData.columns.slice(1);
                for (var i in self.sectors) {
                    self.activeSectors.add(self.sectors[i]);
                }
                self.stockColorScale = getStockColorScale(getActiveSectors());
                self.baselineSector = self.sectors[0];
                parseStockData(rawData, self.sectors);
                self.dataLength = self.stockData.length;
                self.initialStockVolume = self.getValueSum(self.stockData[0]);
                self.xScale = self.getTimeScale(self.stockData, self.constants.UPPER_CHART_WIDTH);
                var stack = d3.stack()
                    .keys(self.sectors);
                var stackStockData = stack(self.stockData);
                var stockYScale = getStockYScale(stackStockData);
                self.yScale = stockYScale;

                createStockStreamChart(stackStockData, stockYScale);
                createStockLegend();
                createQEAnnotationRegion();

                var eventIndex = 118;
                var x = self.fed.balanceTimeScale(self.stockData[eventIndex].date) + self.constants.MARGIN.left;
                var y = self.yScale(self.getValueSum(self.stockData[eventIndex]) - 15);
                self.createElectionRegion(self, x, y);
                self.insightFunctions[0]();
            });
    };

    function parseStockData(input, keys) {
        var output = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currMonth = self.constants.parseDate(input[i].Date).getMonth(),
                priorMonth = self.constants.parseDate(input[i - 1].Date).getMonth();

            if (currMonth != priorMonth) {
                var num = i - start;
                var obj = {}
                keys.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = self.constants.parseDate(input[i - 1].Date);
                obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
                output.push(obj);
                start = i;
            }
        }

        var num = input.length - start;
        var obj = {}
        keys.forEach(function(key) {
            obj[key] = input.slice(start, input.length).reduce(function(sum, item) {
                return sum + item[key] / num;
            }, 0);
        });
        obj.date = self.constants.parseDate(input[input.length - 1].Date);
        obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
        output.push(obj);

        self.stockData = output;
    };

    function createStockStreamChart(stackStockData, stockYScale) {
        var areaMaker = getAreaMaker(self.xScale, stockYScale);
        var stockLayers = self.mainChart.append("g")
            .attr("class", "stock-layer")
            .selectAll("path")
            .data(stackStockData)
            .enter().append("path")
            .attr("class", "stock-area")
            .style("fill", function(d) {
                return self.stockColorScale(d.key);
            })
            .attr("d", areaMaker)
            .attr("opacity", 1)
            .on("mouseover", stockStreamAreaMouseOver)
            .on("mousemove", stockStreamAreaMouseMove)
            .on("mouseout", stockStreamAreaMouseOut)
            .on("click", stockStreamAreaClick);
    };

    function createStockLegend() {
        var title = "S&P 500 Sectors";
        var titleX = 0;
        var titleY = 10 + self.constants.MARGIN.top;
        var rectX = 0;
        var rectY = 20 + self.constants.MARGIN.top;
        var textX = 40;
        var textY = 30 + self.constants.MARGIN.top;
        var interval = 30;

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
            interval -= 6;
            textY -= 5;
        }

        var enter = legend.append("g")
            .attr("class", "items")
            .selectAll("g")
            .data(self.sectors.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * interval + ")";
            });

        enter.append("rect")
            .attr("class", "symbol")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("fill", self.stockColorScale);

        enter.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .text(function(d) {
                return d;
            });

        enter.append("rect")
            .attr("class", "toggle")
            .attr("x", textX - 10)
            .attr("y", rectY)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("fill", TOGGLE_SET_COLOR)
            .attr("opacity", 1)
            .style("stroke-width", 0.3)
            .on("mouseover", function() {
                self.currToggleColor = this.getAttribute("fill");
                this.setAttribute("fill", TOGGLE_HOVER_COLOR);
            })
            .on("mouseout", function() {
                this.setAttribute("fill", self.currToggleColor)
            })
            .on("click", function(selected, i) {
                if (!self.isMouseActive) {
                    return;
                }

                if (self.activeSectors.has(selected) && self.activeSectors.size == 1) {
                    return
                } else if (self.activeSectors.has(selected)) {
                    self.activeSectors.delete(selected);
                    if (selected == self.baselineSector) {
                        self.baselineSector = getActiveSectors()[0];
                    }
                } else {
                    self.activeSectors.add(selected);
                }

                var stack = getOrderedStack(self.baselineSector, getActiveSectors(), self.sectors.length);
                var stackStockData = stack(self.stockData);
                var stockYScale = getStockYScale(stackStockData);
                updateStockStreamChart(stackStockData, stockYScale);
                toggleFilterButton(this);
                self.currToggleColor = this.getAttribute("fill");
            })
            .moveToBack();
    };

    function createQEAnnotationRegion() {
        var events = [
            [22, "Oct-2008", "QE 1"],
            [46, "Oct-2010", "QE 2"],
            [68, "Aug 2012", "QE 3"]
        ];
        var labels = events.map(function(event) {
            var label = {
                note: {
                    lineType: "none",
                    "align": "middle"
                },
                className: "event",
                type: d3.annotationCalloutCircle,
                subject: {
                    radius: 20
                },
                data: {},
                dx: -35,
                dy: -50
            };
            label.note.title = event[2];
            label.note.label = event[1];
            label.data.x = self.fed.balanceTimeScale(self.stockData[event[0]].date) + self.constants.MARGIN.left;
            label.data.y = self.yScale(self.getValueSum(self.stockData[event[0]]) - 30);
            return label;
        });

        var type = self.getEventAnnotationType();
        var makeAnnotations = self.getEventAnnotationCallback(type, labels);

        self.qeBoundaryRegion = self.svg.append("g")
            .attr("class", "annotation-region qe-boundary-region hidden")
            .call(makeAnnotations);
    }

    function updateStockStreamChart(stackStockData, stockYScale) {
        self.unobscureAll(self.mainChart.select("stock-layer"));
        // Disable mouse detection functions until transition is complete.
        self.isMouseActive = false;
        var enterAreaMaker = d3.area()
            .curve(d3.curveCatmullRom)
            .x(function(d, i) {
                return self.xScale(d.data.date);
            })
            .y0(function(d) {
                return stockYScale(d[1]);
            })
            .y1(function(d) {
                return stockYScale(d[1]);
            });
        var mergeAreaMaker = getAreaMaker(self.xScale, stockYScale);

        var update = self.mainChart.select(".stock-layer")
            .selectAll(".stock-area")
            .data(stackStockData, function(d) {
                return d.key;
            })
            .classed("hover", false)
            .attr("stroke-width", "0px")

        var enter = update.enter().append("path")
            .attr("class", "stock-area")
            .on("mouseover", stockStreamAreaMouseOver)
            .on("mousemove", stockStreamAreaMouseMove)
            .on("mouseout", stockStreamAreaMouseOut)
            .on("click", stockStreamAreaClick)
            .style("fill", function(d) {
                return self.stockColorScale(d.key);
            })
            .attr("d", enterAreaMaker)
            .transition()
            .duration(500)
            .ease(d3.easeLinear);

        update.exit()
            .remove();

        update.merge(enter)
            .transition()
            .on("end", function() {
                self.isMouseActive = true;
            })
            .duration(500)
            .ease(d3.easeLinear)
            .attr("d", mergeAreaMaker)
            .attr("opacity", 1);
    };

    function updateAreaBorder(selectedArea) {
        d3.select(selectedArea)
            .classed("hover", true)
            .attr("stroke", BORDER_STROKE_COLOR)
            .attr("stroke-width", "2px");
    };

    function updateHint() {
        if (!$(".hint")[0]) {
            self.tooltip.append("br")
                .attr("class", "hint");
            self.tooltip.append("p")
                .attr("class", "emphasize hint")
                .text("Click to make it the base layer")
        }
    };

    function hideAreaBorder(selectedArea) {
        d3.select(selectedArea)
            .classed("hover", false)
            .attr("stroke-width", "0px")
    };

    function hideHint() {
        if ($(".hint")[0]) {
            $(".hint").remove();
        }
    };

    function showStockDataInsight() {
        var text = "The Stock data shown is the value of special Exchange-Traded funds for each sector. These funds bundle a variety of stocks from companies in each specific sector, and therefore serve as a good barometer of a sector's performance.";
        self.electionRegion.classed("hidden", true);
        self.insightText.html(text);
    };

    function showQEInsight() {
        var text = "See how stock period reliably trends upward during much of <a href='https://en.wikipedia.org/wiki/Quantitative_easing'>Quantitative Easing</a>, but that after Quantitative Easing ends the market becomes much choppier and fails to hold much in gain until the next round of Quantitative Easing.";
        self.qeBoundaryRegion.classed("hidden", false);
        self.insightText.html(text);
    };

    function showElectionInsight() {
        var text = "On Nov 2016, Donald Trump is elected. Stock market panicks for a few hours, then does a 180 and surges on expectations of corporate tax reform and pro-business government.";
        self.qeBoundaryRegion.classed("hidden", true);
        self.electionRegion.classed("hidden", false);
        self.insightText.html(text);
    };

    function stockStreamAreaMouseOver(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var stockStreamArea = self.mainChart.selectAll(".stock-area");
        self.obscureALlExceptByObj(stockStreamArea.nodes(), this, 250, 0.4);
    };

    function stockStreamAreaMouseMove(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        self.updateFocusLine(self, mouseX);
        updateAreaBorder(this);

        var invertedX = self.getInvertedX(mouseX, self.constants.UPPER_CHART_WIDTH, self.dataLength);
        var tooltipObj = getSectorTooltipObj(selected, invertedX);
        self.updateTooltip(self, mouseX, mouseY, tooltipObj);
        updateHint();
    };

    function stockStreamAreaMouseOut(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var stockStreamArea = self.mainChart.select(".stock-layer")
            .selectAll(".stock-area");
        self.unobscureAll(stockStreamArea, 250);

        hideAreaBorder(this);
        self.hideTooltip(self.tooltip);
        self.hideFocusLine(self.focusLine);
    };

    function stockStreamAreaClick(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        if (selected.key != self.baselineSector) {
            self.baselineSector = selected.key;
            var stack = getOrderedStack(self.baselineSector, getActiveSectors(), self.sectors.length);
            var stackStockData = stack(self.stockData);
            var stockYScale = getStockYScale(stackStockData);
            self.yScale = stockYScale;
            updateStockStreamChart(stackStockData, stockYScale);
        }
    };

    function mainChartMouseMove(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        var invertedX = self.getInvertedX(mouseX, self.constants.UPPER_CHART_WIDTH, self.dataLength);
        var tooltipObj = getWholeMarketTooltipObj(invertedX);
        self.mainChartMouseMove(self, mouseX, mouseY, tooltipObj);
        hideHint();
    };

    function mainChartMouseOut(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        self.mainChartMouseOut(self);
    };

    function getWholeMarketTooltipObj(x) {
        var time = self.fed.getDateAt(x).getFullYear() + "  " + self.constants.MONTHS[self.fed.getDateAt(x).getMonth()]
        var section1 = "S&P 500 All Sectors";
        var section2 = "Federal Reserve";

        var stockValue = parseInt(self.getValueSum(self.stockData[x]));
        var stockValueChange = (stockValue - self.initialStockVolume) / self.initialStockVolume;
        var stockValueChangePercentage = "Change Since Start: " + Math.round(stockValueChange * 1000) / 10 + "%";
        stockValue = "S&P 500 Index: " + parseInt(stockValue * STOCK_INDEX_FACTOR);

        var balance = self.fed.getValueAt(x);
        var balanceChange = (balance - self.fed.getValueAt(0)) / self.fed.getValueAt(0);
        var balanceChangePercentage = "Change Since Start: " + Math.round(balanceChange * 1000) / 10 + "%";
        balance = "Balance Sheet Volume: $" + (balance / 1000000).toFixed(2) + " Trillion";
        var qeStatus = "Quantitative Easing: " + self.fed.getQEStatus(self.fed.getDateAt(x));
        var interestRate = "Interest Rate: " + self.fed.getInterestRate(self.fed.getDateAt(x)) + "%";

        return [time, section1, stockValue, stockValueChangePercentage, section2, balance, balanceChangePercentage, qeStatus, interestRate];
    };

    function getSectorTooltipObj(selected, x) {
        var time = self.fed.getDateAt(x).getFullYear() + "  " + self.constants.MONTHS[self.fed.getDateAt(x).getMonth()]
        var section1 = "S&P 500 " + selected.key + " Sector";
        var section2 = "Federal Reserve";

        var stockValue = parseInt(selected[x].data[selected.key]);
        var stockValueChange = (stockValue - selected[0].data[selected.key]) / selected[0].data[selected.key];
        var stockValueChangePercentage = "Change Since Start: " + Math.round(stockValueChange * 1000) / 10 + "%";
        stockValue = "S&P 500 Sector Index: " + parseInt(stockValue * STOCK_INDEX_FACTOR);

        var balance = self.fed.getValueAt(x);
        var balanceChange = (balance - self.fed.getValueAt(0)) / self.fed.getValueAt(0);
        var balanceChangePercentage = "Change Since Start: " + Math.round(balanceChange * 1000) / 10 + "%";
        balance = "Balance Sheet Volume: $" + (balance / 1000000).toFixed(2) + " Trillion";
        var qeStatus = "Quantitative Easing: " + self.fed.getQEStatus(self.fed.getDateAt(x));
        var interestRate = "Interest Rate: " + self.fed.getInterestRate(self.fed.getDateAt(x)) + "%";

        return [time, section1, stockValue, stockValueChangePercentage, section2, balance, balanceChangePercentage, qeStatus, interestRate];
    };

    function getActiveSectors() {
        return Array.from(self.activeSectors);
    };

    function getAreaMaker(stockXScale, stockYScale) {
        var areaMaker = d3.area()
            .curve(d3.curveCatmullRom)
            .x(function(d, i) {
                return stockXScale(d.data.date);
            })
            .y0(function(d) {
                return stockYScale(d[0]);
            })
            .y1(function(d) {
                return stockYScale(d[1]);
            });
        return areaMaker;
    };

    function getStockYScale(stackStockData) {
        var stockYScale = d3.scaleLinear()
            .rangeRound([self.constants.TOP_PADDING + self.constants.UPPER_CHART_HEIGHT, self.constants.TOP_PADDING])
            .domain([0, d3.max(stackStockData, function(sector) {
                return d3.max(sector, function(d) {
                    return d[1];
                });
            })]);
        return stockYScale;
    };

    function getStockColorScale(activeSectors) {
        var stockColorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(activeSectors);
        return stockColorScale;
    };

    function getOrderedStack(firstKey, activeKeys, length) {
        var stack = d3.stack()
            .keys(activeKeys)
            .order(function(series) {
                var order = d3.range(series.length);
                for (var i = 0; i < length; i++) {
                    if (series[i].key == firstKey) {
                        var tmp = order[0];
                        order[0] = i;
                        order[i] = tmp;
                        break;
                    }
                }
                return order;
            });
        return stack;
    };

    function toggleFilterButton(toggle) {
        toggle.setAttribute("fill", self.currToggleColor === TOGGLE_SET_COLOR ?
            TOGGLE_UNSET_COLOR : TOGGLE_SET_COLOR);
    };
};

/** Inherit shared functions*/
StockVis.prototype = StokcBondShared;
StockVis.prototype.getInvertedX = Shared.getInvertedX;
StockVis.prototype.getValueSum = Shared.getValueSum;
StockVis.prototype.getTimeScale = Shared.getTimeScale;
StockVis.prototype.obscureAll = Shared.obscureAll;
StockVis.prototype.unobscureAll = Shared.unobscureAll;
StockVis.prototype.obscureALlExceptByObj = Shared.obscureALlExceptByObj;
StockVis.prototype.hideFocusLine = Shared.hideFocusLine;
StockVis.prototype.hideTooltip = Shared.hideTooltip;
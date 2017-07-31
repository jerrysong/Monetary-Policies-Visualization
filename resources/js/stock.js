/*
Author: Song Lingyi Jerry
*/

"use strict";

var StockVis = function() {
    /** Define global constants. */
    const SVG_WIDTH = 1200;
    const SVG_HEIGHT = 900;
    const MARGIN = {
        top: 20,
        right: 100,
        bottom: 30,
        left: 210
    };
    const MAIN_CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
    const MAIN_CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
    const TOP_PADDING = 100;
    const CHARTS_SPACING = 100;
    const STOCK_CHART_WIDTH = MAIN_CHART_WIDTH;
    const STOCK_CHART_HEIGHT = 450;
    const BALANCE_CHART_WIDTH = MAIN_CHART_WIDTH;
    const BALANCE_CHART_HEIGHT = 150;
    const BALANCE_SHEET_COLOR = "#aecc00";
    const QE_IN_EFFECT_COLOR = "#c7c8dc";
    const QE_NOT_IN_EFFECT_COLOR = "#deeff5";
    const TOGGLE_HOVER_COLOR = "#00FFFF";
    const TOGGLE_SET_COLOR = "#b7dce9";
    const TOGGLE_UNSET_COLOR = "white";
    const BORDER_STROKE_COLOR = "black";
    const INTEREST_RATE_UP_COLOR = "#FF0000";
    const INTEREST_RATE_DOWN_COLOR = "#00b300";
    const MONTHS = ["January",
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
    const ANNOTATION_DX = [-2, 90, -10, 10, -100, -10, -5];
    const ANNOTATION_DY = [-40, -5, -100, -80, -2, 30, -20];
    const QE_TIMEZONE = [
        {
            date: "1/31/07",
            inEffect: false
        },
        {
            date: "11/30/08",
            inEffect: true
        },
        {
            date: "2/28/10",
            inEffect: false
        },
        {
            date: "11/30/10",
            inEffect: true
        },
        {
            date: "6/30/11",
            inEffect: false
        }
    ];
    const parseDate = d3.timeParse("%m/%d/%y");
    const timeFormat = d3.timeFormat("%d-%b-%y");

    /** Define class member fields. */
    var self = this;
    self.stockData;
    self.dataLength;
    self.balanceSheetData;
    self.interestRateData;
    self.initialStockVolume;
    self.sectors;
    self.baselineSector;
    self.balanceLayer;
    self.stockColorScale;
    self.stockTimeScale;
    self.balanceYScale;
    self.balanceTimeScale;
    self.activeSectors = new Set();
    self.isMouseActive = true;
    self.currToggleColor;
    self.container;
    self.svg;
    self.mainChart;
    self.chartBackground;
    self.tooltip;
    self.focueLine;
    self.focueCircle;

    /** The public function to be called in the main js. */
    self.run = function(stockDataPath, monthlyDataPath) {
        createSectionContainer();
        createSVG();
        createMainChart();
        createChartBackground();
        createTooltip();
        createFocusRegion();
        buildOnStockData(stockDataPath);
        buildOnFederalReserveData(monthlyDataPath);
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
                self.initialStockVolume = getValueSum(self.stockData[0]);
                self.stockTimeScale = getTimeScale(self.stockData, STOCK_CHART_WIDTH);
                var stack = d3.stack()
                    .keys(self.sectors);
                var stackStockData = stack(self.stockData);
                var stockYScale = getStockYScale(stackStockData);

                createStockStreamChart(stackStockData, stockYScale);
                createTimeAxis();
                createStockLegend();
            });
    };

    function buildOnFederalReserveData(balanceDataPath) {
        d3.csv(balanceDataPath,
            function(error, rawData) {
                if (error) throw error;

                parseFederalReserveData(rawData);
                self.balanceYScale = getBalanceYScale(self.balanceSheetData)

                createBalanceStreamChart();
                createInterestRateAnnotation();
                createFederalReserveLegend();
            });
    };

    function parseStockData(input, keys) {
        var output = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currMonth = parseDate(input[i].Date).getMonth(),
                priorMonth = parseDate(input[i - 1].Date).getMonth();

            if (currMonth != priorMonth) {
                var num = i - start;
                var obj = {}
                keys.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].Date);
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
        obj.date = parseDate(input[input.length - 1].Date);
        obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
        output.push(obj);

        self.stockData = output;
    };

    function parseFederalReserveData(input) {
        self.balanceSheetData = [];
        self.interestRateData = [];
        for (var i = 0; i < input.length; i++) {
            var obj = {
                date: parseDate(input[i].date),
                value: +input[i].balance_sheet
            };
            self.balanceSheetData.push(obj);
            if (input[i].category == "'rate'" && input[i].amount != "0") {
                var obj = {
                    data: {
                        date: parseDate(input[i].date),
                        balance: +input[i].balance_sheet,
                        interest: +input[i].amount
                    }
                };
                self.interestRateData.push(obj);
            }
        }
    };

    function createSectionContainer() {
        self.container = d3.select("body")
            .append("div")
            .attr("class", "section2-container");
    };

    function createSVG() {
        self.svg = self.container.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT);
    };

    function createMainChart() {
        self.mainChart = self.svg.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
    };

    function createChartBackground() {
        var regions = [];
        var startDate = parseDate("1/31/07");
        var endDate = parseDate("6/30/17");
        var xscale = d3.scaleTime()
            .rangeRound([0, MAIN_CHART_WIDTH])
            .domain([startDate, endDate]);

        for (var i=0; i<QE_TIMEZONE.length-1; i++) {
            regions.push({
                color: QE_TIMEZONE[i].inEffect ? QE_IN_EFFECT_COLOR : QE_NOT_IN_EFFECT_COLOR,
                x: xscale(parseDate(QE_TIMEZONE[i].date)),
                width: xscale(parseDate(QE_TIMEZONE[i+1].date)) - xscale(parseDate(QE_TIMEZONE[i].date))
            });
        }

        var lastIndex = QE_TIMEZONE.length - 1;
        regions.push({
            color: QE_TIMEZONE[lastIndex].inEffect ? QE_IN_EFFECT_COLOR : QE_NOT_IN_EFFECT_COLOR,
            x: xscale(parseDate(QE_TIMEZONE[lastIndex].date)),
            width: MAIN_CHART_WIDTH - xscale(parseDate(QE_TIMEZONE[lastIndex].date))
        });

        self.chartBackground = self.mainChart.append("g")
            .attr("class", "touchable-rect")

        self.chartBackground.selectAll("rect")
            .data(regions)
            .enter().append("rect")
            .attr("x", function(d) { return d.x; })
            .attr("width", function(d) { return d.width; })
            .attr("height", MAIN_CHART_HEIGHT - 20)
            .attr("pointer-events", "all")
            .style("fill", function(d) { return d.color; })
            .on("mousemove", mainChartMouseMove)
            .on("mouseout", mainChartMouseOut);
    };

    function createTooltip() {
        self.tooltip = self.container
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip.append("p")
            .attr("class", "emphasize");
        self.tooltip.append("br");
        self.tooltip.append("p")
            .attr("class", "emphasize");
        self.tooltip.append("p");
        self.tooltip.append("p");
        self.tooltip.append("br");
        self.tooltip.append("p")
            .attr("class", "emphasize");
        self.tooltip.append("p");
        self.tooltip.append("p");
    };

    function createFocusRegion() {
        var focusRegion = self.svg.append("g")
            .attr("class", "focus-region");

        self.focueLine = focusRegion.append("g")
            .attr("class", "focus-line")
            .append("line")
            .attr("opacity", 0);

        self.focueCircle = focusRegion.append("g")
            .attr("class", "focus-circle")
            .append("circle")

            .attr("opacity", 0);
    };

    function createStockStreamChart(stackStockData, stockYScale) {
        var areaMaker = getAreaMaker(self.stockTimeScale, stockYScale);
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

    function createBalanceStreamChart() {
        self.balanceTimeScale = getTimeScale(self.balanceSheetData, BALANCE_CHART_WIDTH)

        var areaMaker = d3.area()
            .curve(d3.curveCatmullRom)
            .x(function(d, i) {
                return self.balanceTimeScale(d.date);
            })
            .y0(function(d) {
                return self.balanceYScale(0);
            })
            .y1(function(d) {
                return self.balanceYScale(d.value);
            });

        self.balanceLayer = self.mainChart.append("g")
            .attr("class", "balance-layer")
            .append("path")
            .datum(self.balanceSheetData)
            .style("fill", function(d) {
                return BALANCE_SHEET_COLOR;
            })
            .attr("d", areaMaker)
            .attr("opacity", 1)
            .on("mousemove", mainChartMouseMove)
            .on("mouseout", mainChartMouseOut)
            .moveToFront();
    }

    function createTimeAxis() {
        self.mainChart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + MAIN_CHART_HEIGHT + ")")
            .call(d3.axisBottom(self.stockTimeScale)
                .ticks(10)
                .tickFormat(d3.timeFormat("%Y")));
    };

    function createFederalReserveLegend() {
        var title = "Federal Reserve";
        var titleX = 20;
        var titleY = STOCK_CHART_HEIGHT + 55 + TOP_PADDING;
        var rectX = 20;
        var rectY = STOCK_CHART_HEIGHT + 65 + TOP_PADDING;
        var circleX = rectX + 12;
        var circleY = rectY + 11;
        var circleRadius = 10;
        var textX = 60;
        var textY = STOCK_CHART_HEIGHT + 75 + TOP_PADDING;

        var legend = self.svg.append("g")
            .attr("class", "legend")
            .attr("text-anchor", "start");

        legend.append("g")
            .append("text")
            .attr("x", titleX)
            .attr("y", titleY)
            .attr("font-size", 15)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .style("fill", "white")
            .text(title);

        var enter = legend.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 13);

        var row1 = enter.append("g")
            .attr("transform", "translate(0,0)");

        row1.append("rect")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("width", 24)
            .attr("height", 24)
            .attr("fill", BALANCE_SHEET_COLOR);

        row1.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .style("fill", "white")
            .text("Balance Sheet Volume");

        var row2 = enter.append("g")
            .attr("transform", "translate(0,40)");

        row2.append("rect")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("width", 24)
            .attr("height", 24)
            .attr("fill", QE_IN_EFFECT_COLOR);

        row2.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .style("fill", "white")
            .text("QE In Effect");

        var row3 = enter.append("g")
            .attr("transform", "translate(0,80)");

        row3.append("rect")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("width", 24)
            .attr("height", 24)
            .attr("fill", QE_NOT_IN_EFFECT_COLOR);

        row3.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .style("fill", "white")
            .text("QE Not In Effect");

        var row4 = enter.append("g")
            .attr("transform", "translate(0,120)");

        row4.append("circle")
            .attr("cx", circleX)
            .attr("cy", circleY)
            .attr("r", circleRadius)
            .attr("fill", INTEREST_RATE_UP_COLOR);

        row4.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .style("fill", "white")
            .text("Interest Rate Up");

        var row5 = enter.append("g")
            .attr("transform", "translate(0,160)");

        row5.append("circle")
            .attr("cx", circleX)
            .attr("cy", circleY)
            .attr("r", circleRadius)
            .attr("fill", INTEREST_RATE_DOWN_COLOR);

        row5.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .style("fill", "white")
            .text("Interest Rate Down");
    };

    function createStockLegend() {
        var title = "S&P 500 Sectors";
        var titleX = 20;
        var titleY = 10 + MARGIN.top;
        var rectX = 20;
        var rectY = 20 + MARGIN.top;
        var textX = 60;
        var textY = 30 + MARGIN.top;

        var legend = self.svg.append("g")
            .attr("class", "legend")
            .attr("text-anchor", "start");

        legend.append("g")
            .append("text")
            .attr("x", titleX)
            .attr("y", titleY)
            .attr("font-size", 15)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .style("fill", "white")
            .text(title);

        var enter = legend.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 13)
            .selectAll("g")
            .data(self.sectors.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 40 + ")";
            });

        enter.append("rect")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("width", 24)
            .attr("height", 24)
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
            .attr("width", 110)
            .attr("height", 24)
            .attr("fill", TOGGLE_SET_COLOR)
            .attr("opacity", 1)
            .style("stroke", "black")
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

    function createInterestRateAnnotation() {
        var labels = self.interestRateData.map(function(d, i) {
            d.note = Object.assign({}, d.note, {
                title: (d.data.interest >= 0 ? "+" : "") + d.data.interest + "%",
                label: timeFormat(d.data.date) + " click to toggle",
                wrap: 100
            });
            d.subject = {
                radius: Math.abs(d.data.interest) * 1.5 + 2,
                radiusPadding: 5,
                fixed: true
            };
            d.className = d.data.interest >= 0 ? "up" : "down";
            d.dx = ANNOTATION_DX[i];
            d.dy = ANNOTATION_DY[i];
            return d;
        });

        var makeAnnotations = d3.annotation()
            .annotations(labels)
            .type(d3.annotationCalloutCircle)
            .accessors({
                x: function x(d) {
                    return self.balanceTimeScale(d.date);
                },
                y: function y(d) {
                    return self.balanceYScale(d.balance);
                }
            }).accessorsInverse({
                date: function date(d) {
                    return timeFormat(self.balanceTimeScale.invert(d.x));
                },
                balance: function interest(d) {
                    return self.balanceYScale.invert(d.y);
                }
            }).on('subjectover', function(annotation) {
                annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", false);
            }).on('subjectout', function(annotation) {
                if (!annotation.subject.fixed) {
                    annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", true);
                }
            }).on('subjectclick', function(annotation) {
                annotation.subject.fixed = !annotation.subject.fixed;
                if (!annotation.subject.fixed) {
                    annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", true);
                } else {
                    annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", false);
                }
            });

        self.mainChart.append("g")
            .attr("class", "annotation-region")
            .call(makeAnnotations);

        //self.mainChart.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", true);
    };

    function updateStockStreamChart(stackStockData, stockYScale) {
        unobscureAll(self.mainChart.select("stock-layer"));
        // Disable mouse detection functions until transition is complete.
        self.isMouseActive = false;
        var enterAreaMaker = d3.area()
            .curve(d3.curveCatmullRom)
            .x(function(d, i) {
                return self.stockTimeScale(d.data.date);
            })
            .y0(function(d) {
                return stockYScale(d[1]);
            })
            .y1(function(d) {
                return stockYScale(d[1]);
            });
        var mergeAreaMaker = getAreaMaker(self.stockTimeScale, stockYScale);

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

    function updateFocusRegion(mouseX) {
        updateFocusLine(mouseX);
        updateFocuseCircle(mouseX);
    };

    function updateFocusLine(mouseX) {
        var invertedX = getInvertedX(mouseX, STOCK_CHART_WIDTH, self.dataLength);
        self.focueLine.attr("x1", mouseX + MARGIN.left + 5)
            .attr("y1", MARGIN.top)
            .attr("x2", mouseX + MARGIN.left + 5)
            .attr("y2", MARGIN.top + STOCK_CHART_HEIGHT + BALANCE_CHART_HEIGHT + CHARTS_SPACING + 35 + 100)
            .attr("opacity", 1);
    };

    function updateFocuseCircle(mouseX) {
        var invertedX = getInvertedX(mouseX, STOCK_CHART_WIDTH, self.dataLength);
        self.focueCircle.attr("cx", mouseX + MARGIN.left + 5)
            .attr("cy", self.balanceYScale(self.balanceSheetData[invertedX].value) + 20)
            .attr("r", 4)
            .attr("opacity", 1);
    };

    function updateTooltip(x, y, tooltipObj) {
        self.tooltip.classed("hidden", false)
            .style("left", x + 250 + "px")
            .style("top", y - 100 + "px")
            .selectAll("p")
            .data(tooltipObj)
            .text(function(d) {
                return d
            });
    }

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

    function hideFocusLine() {
        self.focueLine.attr("opacity", 0);
    };

    function hideFocusCircle() {
        self.focueCircle.attr("opacity", 0);
    };

    function hideTooltip() {
        self.tooltip.classed("hidden", true);
    };

    function hideAreaBorder(selectedArea) {
        d3.select(selectedArea)
            .classed("hover", false)
            .attr("stroke-width", "0px")
    };

    function hideHit() {
        if ($(".hint")[0]) {
            $(".hint").remove();
        }
    };

    function stockStreamAreaMouseOver(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var stockStreamArea = self.mainChart.selectAll(".stock-area");
        obscureALlExceptByObj(stockStreamArea._groups[0], this, 250, 0.4);
    };

    function stockStreamAreaMouseMove(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine(mouseX);
        updateAreaBorder(this);

        var invertedX = getInvertedX(mouseX, STOCK_CHART_WIDTH, self.dataLength);
        var tooltipObj = getWholeMarketTooltipObj(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj);
        updateHint();
    };

    function stockStreamAreaMouseOut(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var stockStreamArea = self.mainChart.select(".stock-layer")
            .selectAll(".stock-area");
        unobscureAll(stockStreamArea, 250);

        hideAreaBorder(this);
        hideTooltip();
        hideFocusLine();
        hideFocusCircle();
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
            updateStockStreamChart(stackStockData, stockYScale);
        }
    };

    function mainChartMouseMove(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine(mouseX);

        var invertedX = getInvertedX(mouseX, STOCK_CHART_WIDTH, self.dataLength);
        var tooltipObj = getSectorTooltipObj(invertedX);

        updateTooltip(mouseX, mouseY, tooltipObj);

        hideHit();
    };

    function mainChartMouseOut(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        hideTooltip();
        hideFocusLine();
    };

    function getSectorTooltipObj(x) {
        var time = self.balanceSheetData[x].date.getFullYear() + "  " + MONTHS[self.balanceSheetData[x].date.getMonth()]
        var section1 = "S&P 500 All Sectors";
        var section2 = "Federal Reserve";

        var stockValue = parseInt(getValueSum(self.stockData[x]));
        var stockValueChange = (stockValue - self.initialStockVolume) / self.initialStockVolume;
        var stockValueChangePercentage = "Change Since Start: " + Math.round(stockValueChange * 1000) / 10 + "%";
        stockValue = "Index: " + stockValue;

        var balance = self.balanceSheetData[x].value;
        var balanceChange = (balance - self.balanceSheetData[0].value) / self.balanceSheetData[0].value;
        var balanceChangePercentage = "Change Since Start: " + Math.round(balanceChange * 1000) / 10 + "%";
        balance = "Balance Sheet Volume: " + balance;

        return [time, section1, stockValue, stockValueChangePercentage, section2, balance, balanceChangePercentage];
    };

    function getWholeMarketTooltipObj(selected, x) {
        var time = self.balanceSheetData[x].date.getFullYear() + "  " + MONTHS[self.balanceSheetData[x].date.getMonth()]
        var section1 = "S&P 500 " + selected.key + " Sector";
        var section2 = "Federal Reserve";

        var stockValue = parseInt(selected[x].data[selected.key]);
        var stockValueChange = (stockValue - selected[0].data[selected.key]) / selected[0].data[selected.key];
        var stockValueChangePercentage = "Change Since Start: " + Math.round(stockValueChange * 1000) / 10 + "%";
        stockValue = "Index: " + stockValue;

        var balance = self.balanceSheetData[x].value;
        var balanceChange = (balance - self.balanceSheetData[0].value) / self.balanceSheetData[0].value;
        var balanceChangePercentage = "Change Since Start: " + Math.round(balanceChange * 1000) / 10 + "%";
        balance = "Balance Sheet Volume: " + balance;

        return [time, section1, stockValue, stockValueChangePercentage, section2, balance, balanceChangePercentage];
    };

    function getActiveSectors() {
        return Array.from(self.activeSectors);
    };

    function getTimeScale(data, width) {
        var timeScale = d3.scaleTime()
            .rangeRound([0, width])
            .domain(d3.extent(data, function(d) {
                return d.date;
            }));
        return timeScale;
    };

    function getStockYScale(stackStockData) {
        var stockYScale = d3.scaleLinear()
            .rangeRound([TOP_PADDING + STOCK_CHART_HEIGHT, TOP_PADDING])
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

    function getBalanceYScale(data) {
        var balanceYScale = d3.scaleLinear()
            .rangeRound([STOCK_CHART_HEIGHT + BALANCE_CHART_HEIGHT + CHARTS_SPACING + TOP_PADDING,
                STOCK_CHART_HEIGHT + CHARTS_SPACING + TOP_PADDING
            ])
            .domain(d3.extent(data, function(d) {
                return d.value;
            }));
        return balanceYScale;
    }

    function toggleFilterButton(toggle) {
        toggle.setAttribute("fill", self.currToggleColor === TOGGLE_SET_COLOR ?
            TOGGLE_UNSET_COLOR : TOGGLE_SET_COLOR);
    };
};

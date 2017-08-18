"use strict";

/** Define universial shared functions. */
var Shared = function() {};

Shared.getInvertedX = function(mouseX, chartWidth, dataLength) {
    var invertedX = parseInt(mouseX / chartWidth * dataLength);
    invertedX = Math.min(invertedX, dataLength - 1);
    return invertedX;
};

Shared.getValueSum = function(hashMap) {
    var sum = 0;
    Object.keys(hashMap).forEach(function(key) {
        if ($.isNumeric(hashMap[key])) {
            sum += hashMap[key];
        }
    });
    return sum;
};

Shared.getTimeScale = function(data, width) {
    var timeScale = d3.scaleTime()
        .rangeRound([0, width])
        .domain(d3.extent(data, function(d) {
            return d.date;
        }));
    return timeScale;
};

Shared.obscureAll = function(obj, time = 100, opacity = 0) {
    obj.transition()
        .duration(time)
        .attr("opacity", opacity);
};

Shared.unobscureAll = function(obj, time = 100) {
    obj.transition()
        .duration(time)
        .attr("opacity", "1");
};

Shared.obscureALlExceptByObj = function(objs, target, time = 100, opacity = 0.2) {
    objs.forEach(function(curr) {
        d3.select(curr).transition()
            .duration(time)
            .attr("opacity", function(d, j) {
                return curr != target ? opacity : 1;
            });
    });
};

Shared.obscureALlExceptByIndex = function(obj, i, time = 100, opacity = 0.2) {
    obj.transition()
        .duration(time)
        .attr("opacity", function(d, j) {
            return j != i ? opacity : 1;
        });
};

Shared.hideFocusLine = function(focusLine) {
    focusLine.attr("opacity", 0);
};

Shared.hideTooltip = function(tooltip) {
    tooltip.classed("hidden", true);
};

/** Define shared functions and constants for stock and bond classes. */
var StokcBondShared = function() {};

StokcBondShared.buildOnFederalReserveData = function(self, balanceDataPath, mainChartMouseMove, mainChartMouseOut) {
    d3.csv(balanceDataPath,
        function(error, rawData) {
            if (error) throw error;

            self.fed.parseFederalReserveData(rawData);
            self.fed.createBalanceStreamChart(self.mainChart, mainChartMouseMove, mainChartMouseOut);
            self.fed.createFederalReserveLegend(self.svg);
            self.fed.createInterestRateAnnotation();
            self.fed.createTimeAxis();
        });
};

StokcBondShared.createMainChart = function(svg) {
    var mainChart = svg.append("g")
        .attr("class", "main-chart")
        .attr("transform", "translate(" + StokcBondShared.constants.MARGIN.left + "," +
            StokcBondShared.constants.MARGIN.top + ")");
    return mainChart;
};

StokcBondShared.createChartBackground = function(mainChart, fedVis, mainChartMouseMove, mainChartMouseOut) {
    var regions = [];
    var xscale = d3.scaleTime()
        .rangeRound([0, StokcBondShared.constants.MAIN_CHART_WIDTH])
        .domain([StokcBondShared.constants.START_DATE, StokcBondShared.constants.END_DATE]);

    for (var i = 0; i < fedVis.qe_timezone.length - 1; i++) {
        regions.push({
            color: fedVis.qe_timezone[i].inEffect ? fedVis.qe_in_effect_color : fedVis.qe_not_in_effect_color,
            x: xscale(fedVis.qe_timezone[i].date),
            width: xscale(fedVis.qe_timezone[i + 1].date) - xscale(fedVis.qe_timezone[i].date)
        });
    }

    var lastIndex = fedVis.qe_timezone.length - 1;
    regions.push({
        color: fedVis.qe_timezone[lastIndex].inEffect ? fedVis.qe_in_effect_color : fedVis.qe_not_in_effect_color,
        x: xscale(fedVis.qe_timezone[lastIndex].date),
        width: StokcBondShared.constants.MAIN_CHART_WIDTH - xscale(fedVis.qe_timezone[lastIndex].date)
    });

    var chartBackground = mainChart.append("g")
        .attr("class", "touchable-rect")

    chartBackground.selectAll("rect")
        .data(regions)
        .enter().append("rect")
        .attr("x", function(d) {
            return d.x;
        })
        .attr("width", function(d) {
            return d.width;
        })
        .attr("height", StokcBondShared.constants.MAIN_CHART_HEIGHT * 0.915)
        .attr("pointer-events", "all")
        .style("fill", function(d) {
            return d.color;
        })
        .on("mousemove", mainChartMouseMove)
        .on("mouseout", mainChartMouseOut);

    return chartBackground;
};

StokcBondShared.createTooltip = function(container) {
    var tooltip = container
        .append("div")
        .attr("class", "tooltip hidden")
        .moveToFront();
    tooltip.append("p")
        .attr("class", "emphasize");
    tooltip.append("br");
    tooltip.append("p")
        .attr("class", "emphasize");
    tooltip.append("p");
    tooltip.append("p");
    tooltip.append("br");
    tooltip.append("p")
        .attr("class", "emphasize");
    tooltip.append("p");
    tooltip.append("p");
    tooltip.append("p");
    tooltip.append("p");
    return tooltip;
};

StokcBondShared.createFocusRegion = function(svg) {
    var focusRegion = svg.append("g")
        .attr("class", "focus-region");

    var focusLine = focusRegion.append("g")
        .attr("class", "focus-line")
        .append("line")
        .attr("opacity", 0);

    return focusLine;
};

StokcBondShared.createInsightBox = function(self) {
    self.insightBox = self.container
        .select(".insights-wrapper")
        .style("margin-top", self.constants.MARGIN.top + "px")
        .style("height", self.constants.UPPER_CHART_HEIGHT + self.constants.TOP_PADDING + 100 + "px")

    self.insightBox.append("h2")
        .attr("class", "insights-header")
        .text("Key Insights");

    self.insightText = self.insightBox.append("p")
        .attr("class", "insights-text");

    self.insightButton = self.insightBox.append("button")
        .attr("class", "insights-next")
        .text("Next")
        .on("click", function() {
            self.insightState += 1;
            if (self.insightState == self.insightFunctions.length) {
                self.insightState = 0;
            }
            self.insightFunctions[self.insightState]();
        });
};

StokcBondShared.createElectionRegion = function(self, x, y) {
    var labels = [{
        note: {
            title: "Trump Elected",
            label: "Nov-8 2016",
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
            x: x,
            y: y
        },
        dx: -40,
        dy: -25
    }];

    var type = self.getEventAnnotationType();
    var makeAnnotations = self.getEventAnnotationCallback(type, labels);

    self.electionRegion = self.svg.append("g")
        .attr("class", "annotation-region election-region hidden")
        .call(makeAnnotations);
}

StokcBondShared.updateFocusLine = function(self, mouseX) {
    var invertedX = self.getInvertedX(mouseX, self.constants.UPPER_CHART_WIDTH, self.dataLength);
    self.focusLine.attr("x1", mouseX + self.constants.MARGIN.left + 5)
        .attr("y1", self.constants.MARGIN.top)
        .attr("x2", mouseX + self.constants.MARGIN.left + 5)
        .attr("y2", self.constants.MARGIN.top +
            self.constants.UPPER_CHART_HEIGHT +
            self.constants.LOWER_CHART_HEIGHT +
            self.constants.CHARTS_SPACING + 70)
        .attr("opacity", 1);
}

StokcBondShared.updateTooltip = function(self, x, y, tooltipObj) {
    self.tooltip.classed("hidden", false)
        .style("left", x + 280 + "px")
        .style("top", y - 100 + "px")
        .selectAll("p")
        .data(tooltipObj)
        .text(function(d) {
            return d
        });
};

StokcBondShared.mainChartMouseMove = function(self, mouseX, mouseY, tooltipObj) {
    self.updateFocusLine(self, mouseX);
    self.updateTooltip(self, mouseX, mouseY, tooltipObj);
};

StokcBondShared.mainChartMouseOut = function(self) {
    self.hideTooltip(self.tooltip);
    self.hideFocusLine(self.focusLine);
};

StokcBondShared.getEventAnnotationType = function() {
    return d3.annotationCustomType(
        d3.annotationXYThreshold, {
            "note": {
                "lineType": "none",
                "orientation": "top",
                "align": "middle"
            }
        }
    );
};

StokcBondShared.getEventAnnotationCallback = function(type, labels) {
    return d3.annotation()
        .type(type)
        .accessors({
            x: function(d) {
                return d.x
            },
            y: function(d) {
                return d.y
            }
        })
        .annotations(labels)
        .textWrap(150);
}

/** Extend d3 selection functions */
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

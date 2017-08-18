/*
Author: Song Lingyi Jerry
*/

"use strict";

var FedVis = function() {
    /** Define constants. */
    const INITIAL_INTEREST_RATE = 3;
    const BALANCE_SHEET_COLOR = "#aecc00";
    const INTEREST_RATE_UP_COLOR = "#FF0000";
    const INTEREST_RATE_DOWN_COLOR = "#00b300";
    const ANNOTATION_DX = [-2, 90, -10, 10, -20, -10, -5, -5];
    const ANNOTATION_DY = [-40, -5, -60, -60, -2, 30, -10, 90];
    const timeFormat = d3.timeFormat("%b-%y");

    /** Define class member fields. */
    var self = this;
    self.svg
    self.mainChart;
    self.balanceSheetData;
    self.interestRateData;
    self.interestRateChangeData;
    self.balanceTimeScale;
    self.balanceYScale;
    self.qe_timezone = [
        {
            date: self.constants.parseDate("1/31/07"),
            inEffect: false
        },
        {
            date: self.constants.parseDate("11/30/08"),
            inEffect: true
        },
        {
            date: self.constants.parseDate("2/28/10"),
            inEffect: false
        },
        {
            date: self.constants.parseDate("11/30/10"),
            inEffect: true
        },
        {
            date: self.constants.parseDate("6/30/11"),
            inEffect: false
        },
        {
            date: self.constants.parseDate("9/30/12"),
            inEffect: true
        },
        {
            date: self.constants.parseDate("9/31/14"),
            inEffect: false
        }
    ];
    self.qe_in_effect_color = "#c7c8dc";
    self.qe_not_in_effect_color = "#deeff5";

    self.parseFederalReserveData = function(input) {
        self.balanceSheetData = [];
        self.interestRateData = [{date: self.constants.START_DATE, value: INITIAL_INTEREST_RATE}];
        self.interestRateChangeData = [];
        for (var i = 0; i < input.length; i++) {
            var obj = {
                date: self.constants.parseDate(input[i].date),
                value: +input[i].balance_sheet
            };
            self.balanceSheetData.push(obj);
            if (input[i].category == "'rate'") {
                var obj = {
                    data: {
                        date: self.constants.parseDate(input[i].date),
                        balance: +input[i].balance_sheet,
                        interest: +input[i].amount
                    }
                };
                var currInterestRate = self.interestRateData[self.interestRateData.length-1].value + obj.data.interest;
                self.interestRateData.push({date: obj.data.date, value: currInterestRate});
                self.interestRateChangeData.push(obj);
            }
        }

        self.balanceTimeScale = self.getTimeScale(self.balanceSheetData, self.constants.LOWER_CHART_WIDTH);
        self.balanceYScale = getBalanceYScale(self.balanceSheetData);
    };

    self.createBalanceStreamChart = function(mainChart, mainChartMouseMove, mainChartMouseOut) {
        self.mainChart = mainChart;

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

        self.mainChart.append("g")
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
    };

    self.createFederalReserveLegend = function(svg) {
        self.svg = svg;
        var title = "Federal Reserve";
        var titleX = 0;
        var titleY = self.constants.UPPER_CHART_HEIGHT + 55 + self.constants.TOP_PADDING;
        var rectX = 0;
        var rectY = self.constants.UPPER_CHART_HEIGHT + 65 + self.constants.TOP_PADDING;
        var circleX = rectX + 12;
        var circleY = rectY + 11;
        var textX = 40;
        var textY = self.constants.UPPER_CHART_HEIGHT + 75 + self.constants.TOP_PADDING;
        var interval = 30;

        var legend = svg.append("g")
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
            circleX -= 2;
        }

        var enter = legend.append("g")
            .attr("class", "items");

        var row1 = enter.append("g")
            .attr("transform", "translate(0,0)");

        row1.append("rect")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("class", "symbol")
            .attr("fill", BALANCE_SHEET_COLOR);

        row1.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .text("Balance Sheet Volume");

        var row2 = enter.append("g")
            .attr("transform", "translate(0," + interval + ")");

        row2.append("rect")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("class", "symbol")
            .attr("fill", self.qe_in_effect_color);

        row2.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .text("QE In Effect");

        var row3 = enter.append("g")
            .attr("transform", "translate(0," + interval * 2 + ")");

        row3.append("rect")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("class", "symbol")
            .attr("fill", self.qe_not_in_effect_color);

        row3.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .text("QE Not In Effect");

        var row4 = enter.append("g")
            .attr("transform", "translate(0," + interval * 3 + ")");

        row4.append("circle")
            .attr("cx", circleX)
            .attr("cy", circleY)
            .attr("fill", INTEREST_RATE_UP_COLOR);

        row4.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .text("Interest Rate Up");

        var row5 = enter.append("g")
            .attr("transform", "translate(0," + interval * 4 + ")");

        row5.append("circle")
            .attr("cx", circleX)
            .attr("cy", circleY)
            .attr("fill", INTEREST_RATE_DOWN_COLOR);

        row5.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("dy", 7)
            .text("Interest Rate Down");
    };

    self.createTimeAxis = function() {
        self.mainChart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + self.constants.TIME_AXIS_TRANSFORM + ")")
            .call(d3.axisBottom(self.balanceTimeScale)
                .ticks(10)
                .tickFormat(d3.timeFormat("%Y")));
    };

    self.createInterestRateAnnotation = function() {
        var labels = self.interestRateChangeData.map(function(d, i) {
            d.note = Object.assign({}, d.note, {
                title: (d.data.interest >= 0 ? "+" : "") + d.data.interest + "%",
                label: timeFormat(d.data.date),
                wrap: 100
            });
            d.subject = {
                radius: Math.abs(d.data.interest) * 4 + 2,
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
            })
            .on('subjectclick', toggleAnnotation)
            .on('noteclick', toggleAnnotation);

        self.mainChart.append("g")
            .attr("class", "annotation-region")
            .call(makeAnnotations);
    }

    self.getInterestRate = function(time) {
        for (var i =1; i<self.interestRateData.length; i++) {
            if (time < self.interestRateData[i].date) {
                return self.interestRateData[i-1].value;
            }
        }
        return self.interestRateData[self.interestRateData.length-1].value;
    };

    self.getQEStatus = function(time) {
        for (var i =1; i<self.qe_timezone.length; i++) {
            if (time < self.qe_timezone[i].date) {
                return self.qe_timezone[i-1].inEffect ? "Yes" : "No";
            }
        }
        return self.qe_timezone[self.qe_timezone.length-1].inEffect ? "Yes" : "No";
    };

    self.getValueAt = function(i) {
        return self.balanceSheetData[i].value;
    };

    self.getDateAt = function(i) {
        return self.balanceSheetData[i].date;
    };

    function toggleAnnotation(annotation) {
        annotation.subject.fixed = !annotation.subject.fixed;
        if (!annotation.subject.fixed) {
            annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", true);
        } else {
            annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", false);
        }
    };

    function getBalanceYScale(data) {
        var balanceYScale = d3.scaleLinear()
            .rangeRound([self.constants.UPPER_CHART_HEIGHT +
                         self.constants.LOWER_CHART_HEIGHT +
                         self.constants.CHARTS_SPACING +
                         self.constants.TOP_PADDING,
                self.constants.UPPER_CHART_HEIGHT +
                self.constants.CHARTS_SPACING +
                self.constants.TOP_PADDING
            ])
            .domain(d3.extent(data, function(d) {
                return d.value;
            }));
        return balanceYScale;
    }
};

/** Inherit shared functions*/
FedVis.prototype.getTimeScale = Shared.getTimeScale;

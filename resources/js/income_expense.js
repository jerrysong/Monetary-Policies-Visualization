"use strict";

var IncomeExpenseVis = function() {
    var self = this;
    self.dataselect;
    self.quintileTotalIncome = {
        "quantile1": {},
        "quantile2": {},
        "quantile3": {},
        "quantile4": {},
        "quantile5": {},
        "average": {},
    };
    self.years = ["2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015"];
    self.incomeSet = new Set(["Wage Income", "Self Employment Income", "Wealth Income", "Retirement Income"]);
    self.expenseSet = new Set(["Housing Costs", "Transportation Costs", "Food Costs", "Medical Costs"]);
    self.explain = {
        "average": "",
        "first": "<span class='underline'>Key Takeaway 1:</span> Quintile 1 spends <span class='bold'>over 80% of their income on housing</span><br><span class='underline'>Key Takeaway 2:</span>. The % of income derived from <span class='bold'>wages has fallen approximately 25%</span> since 2007?",
        "second": "",
        "third": "",
        "fourth": "",
        "fifth": "<span class='underline'>Key Takeaway:</span> Quintile 5 <span class = 'bold'>derives approximately double the income from wealth (in % of total income)</span> than other quintiles. This is a good evidence of wealth inequality even though it's still a small percentage of total income."
    };
    self.pretaxIncome = "Pretax Income";

    this.run = function(incomeExpensePath) {
        var w = self.width / 8,
            h = self.height / 3,
            p = self.width / 20,
            x = d3.scaleLinear().domain([0, 8]).range([15, w]),
            y = d3.scaleLinear().domain([-0.2, 1]).range([h, 20]),
            hourformat = d3.timeFormat("%I %p");;

        var area = d3.area()
            .x(function(d) {
                return x(d.x);
            })
            .y0(h - 1)
            .y1(function(d) {
                return y(d.y);
            });

        var activities,
            areaClass,
            demogData = [],
            currDemog = "average",
            currData = [];

        // Load CSV file
        d3.csv(incomeExpensePath,
            function(obj) {
                if (obj["ACTIVITY"] == self.pretaxIncome) {
                    for (var year of self.years) {
                        self.quintileTotalIncome[obj["DEMOGRAPHIC"]][year] = parseInt(obj[year]);
                    }
                } else {
                    var row = [obj["DEMOGRAPHIC"], obj["ACTIVITY"]];
                    for (var year of self.years) {
                        row.push(parseInt(obj[year]));
                    }
                }
                return row;
            },
            function(error, activities) {
                // Store data for different demographics
                for (var i = 0; i < activities.length; i++) {
                    if (currDemog != activities[i][0]) {
                        demogData.push(currData);
                        currData = [];
                    }
                    currDemog = activities[i][0];

                    // CSS class for area
                    if (self.incomeSet.has(activities[i][1])) {
                        areaClass = "income";
                    } else if (self.expenseSet.has(activities[i][1])) {
                        areaClass = "expense";
                    }

                    // Slice data
                    //var slicedData = activities[i].slice(2);
                    var slicedData = activities[i].slice(2).map(function(y, i) {
                        return y / self.quintileTotalIncome[currDemog][(i + 2007).toString()];
                    })

                    var adata = slicedData.map(function(y, i) {
                        return {
                            x: i,
                            y: parseFloat(y)
                        };
                    });
                    //for (j=0; j < adata.length; j++) { adata[j].y = parseFloat(adata[j].y) / 100; }
                    currData.push(adata);

                    // Plot for average
                    if (currDemog == "average") {
                        // CSS class for <div> (hack)
                        var vis = d3.select("#income-expense")
                            .select(".vis")
                            .append("div")
                            .attr("class", "chart")
                            .append("svg:svg")
                            .attr("width", w + p * 2 + 10)
                            .attr("height", h + p)
                            .append("svg:g")
                            .attr("transform", "translate(" + 35 + "," + p / 4 + ")");

                        // Tick marks
                        var rules = vis.selectAll("g.rule")
                            .data(x.ticks(d3.timeHours, 12))
                            .enter().append("svg:g")
                            .attr("class", "rule");

                        rules.append("svg:line")
                            .attr("x1", x)
                            .attr("x2", x)
                            .attr("y1", 20)
                            .attr("y2", h - 1);

                        rules.append("svg:line")
                            .attr("class", "axis")
                            .attr("y1", h)
                            .attr("y2", h)
                            .attr("x1", -20)
                            .attr("x2", w + 1);

                        // Header for activity
                        vis.append("svg:text")
                            .attr("x", -35)
                            .text(activities[i][1])
                            .attr("class", "aheader");

                        // x-axis labels
                        vis.append("svg:text")
                            .attr("x", -15)
                            .attr("y", h + 10)
                            .text("2007")
                            .attr("text-anchor", "right")
                            .attr("class", "tick-label");

                        vis.append("svg:text")
                            .attr("x", w + 5)
                            .attr("y", h + 10)
                            .text("2015")
                            .attr("text-anchor", "right")

                        // y-axis labels (hack)
                        vis.append("svg:text")
                            .attr("x", -35)
                            .attr("y", y(slicedData[0]))
                            .text((slicedData[0] * 100).toFixed(2) + "%")
                            .attr("text-anchor", "right")
                            .attr("class", "tick-label left-label");

                        vis.append("svg:text")
                            .attr("x", w + 5)
                            .attr("y", y(slicedData[slicedData.length - 1]))
                            .text((slicedData[slicedData.length - 1] * 100).toFixed(2) + "%")
                            .attr("text-anchor", "right")
                            .attr("class", "tick-label right-label");

                        vis.append("svg:text")
                            .attr("text-anchor", "right")
                            .attr("class", "tick-label focus-label hidden");

                        vis.append("svg:text")
                            .attr("text-anchor", "right")
                            .attr("class", "tick-label focus-year hidden");

                        // Add the area shape
                        vis.append("svg:path")
                            .data([adata])
                            .attr("class", areaClass)
                            .attr("d", area)
                            .attr("opacity", 0.55)
                            .on("mousemove", mouseMove)
                            .on("mouseenter", mouseEnter)
                            .on("mouseout", mouseOut);

                        vis.append("svg:line")
                            .attr("class", "focus-line hidden " + areaClass);

                        vis.append("svg:circle")
                            .attr("class", "focus-circle hidden " + areaClass);
                    }
                } // @end for loop

                demogData.push(currData);

                d3.select("#income-expense").select(".first").on("click", () => transition(1));
                d3.select("#income-expense").select(".second").on("click", () => transition(2));
                d3.select("#income-expense").select(".third").on("click", () => transition(3));
                d3.select("#income-expense").select(".fourth").on("click", () => transition(4));
                d3.select("#income-expense").select(".fifth").on("click", () => transition(5));
                d3.select("#income-expense").select(".average").on("click", () => transition(6));

                self.dataselect = demogData[6];

            }); // @end text()

        function transition(index) {
            self.dataselect = demogData[index];
            d3.select("#income-expense")
                .select(".vis")
                .selectAll("path").each(function(d, i) {
                    d3.select(this)
                        .data([self.dataselect[i]])
                        .transition()
                        .duration(500)
                        .attr("d", area);
                });

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".left-label").each(function(d, i) {
                    d3.select(this)
                        .text((self.dataselect[i][0].y * 100).toFixed(2) + "%")
                        .transition()
                        .duration(500)
                        .attr("y", y(self.dataselect[i][0].y));
                });

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".right-label").each(function(d, i) {
                    d3.select(this)
                        .text((self.dataselect[i][self.dataselect[i].length - 1].y * 100).toFixed(2) + "%")
                        .transition()
                        .duration(500)
                        .attr("y", y(self.dataselect[i][self.dataselect[i].length - 1].y));
                });
        }

        function mouseMove() {
            var mouseX = d3.mouse(this)[0];
            var mouseY = d3.mouse(this)[1];
            var invertedX = self.getInvertedX(mouseX, w - 15, 9);

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".focus-line").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", false)
                        .attr("x1", mouseX + 3)
                        .attr("x2", mouseX + 3)
                        .attr("y1", h - 1)
                        .attr("y2", y(self.dataselect[i][invertedX].y));
                })

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".focus-circle").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", false)
                        .attr("cx", mouseX + 3)
                        .attr("cy", y(self.dataselect[i][invertedX].y))
                        .attr("r", 2.2);
                })

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".focus-label").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", false)
                        .attr("x", mouseX + 3)
                        .attr("y", y(self.dataselect[i][invertedX].y) - 20)
                        .text((self.dataselect[i][invertedX].y * 100).toFixed(2) + "%");
                })

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".focus-year").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", false)
                        .attr("x", mouseX + 3)
                        .attr("y", y(self.dataselect[i][invertedX].y) - 6)
                        .text(2007 + invertedX);
                })
        }

        function mouseEnter() {
            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".left-label").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", true);
                })

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".right-label").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", true);
                })
        }

        function mouseOut() {
            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".focus-line").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", true);
                })

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".focus-circle").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", true);
                })

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".left-label").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", false);
                })

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".right-label").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", false);
                })

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".focus-label").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", true)
                })

            d3.select("#income-expense")
                .select(".vis")
                .selectAll(".focus-year").each(function(d, i) {
                    d3.select(this)
                        .classed("hidden", true)
                })
        }

        $("#income-expense .filters a").click(function() {
            $("#income-expense .filters a").removeClass("current");
            $(this).addClass("current");

            var demog = $(this).text();
            var demogid = $(this).attr("class").split(' ')[0];

            $("#income-expense .explain h3").text(demog);
            $("#income-expense .explain p").html(self.explain[demogid]);
        });
    }
}

IncomeExpenseVis.prototype.getInvertedX = Shared.getInvertedX;

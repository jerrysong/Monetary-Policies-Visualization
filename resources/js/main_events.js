var BalanceVis = function() {
    var self = this; //Self is literally the functio
    /** Define global constants. */
    const SVG_WIDTH = 760;
    const SVG_HEIGHT = self.balanceHeight;
    const MARGIN = {
        top: -5,
        right: 5,
        bottom: 20,
        left: 100
    };
    const MAIN_CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
    const MAIN_CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
    const TOP_PADDING = 10;
    const CHARTS_SPACING = 100;
    const BALANCE_CHART_WIDTH = MAIN_CHART_WIDTH;
    const BALANCE_CHART_HEIGHT = 250;
    const BORDER_STROKE_COLOR = "black";
    const parseDate = d3.timeParse("%m/%Y");
    const timeFormat = d3.timeFormat("%d-%b-%y");
    const QE_IN_EFFECT_COLOR = "teal";
    const QE_NOT_IN_EFFECT_COLOR = "gainsboro";
    const QE_TIMEZONE = [{
            date: "1/07",
            inEffect: false
        },
        {
            date: "10/08",
            inEffect: true
        },
        {
            date: "2/10",
            inEffect: false
        },
        {
            date: "10/10",
            inEffect: true
        },
        {
            date: "6/11",
            inEffect: false
        },
        {
            date: "8/12",
            inEffect: true
        },
        {
            date: "9/14",
            inEffect: false
        }
    ];
    /** Define class member fields. */
    self.balanceData; //Alternate method of passing in data, may be relevant for later parts
    self.dataLength;
    self.initialBalanceVolume;
    self.chartBackground;
    self.baselineSector;
    self.balanceLayer;
    self.balanceColorScale;
    self.balanceTimeScale;
    self.balanceYScale;
    self.balanceTimeScale;
    self.activeSectors = new Set();
    self.isMouseActive = true;
    self.currToggleColor;
    self.container;
    self.legend_container;
    self.svg;
    self.legend_svg;
    self.chartBackground;
    self.mainChart;
    self.tooltip;
    self.focueLine;
    self.focueCircle;
    self.sectors;
    self.balanceLayers;
    var keys = ['bonds', 'mbs'];
    var keys2 = ['bonds', 'mbs'];
    /** The public function to be called in the main js. */
    self.run = function(balanceDataPath) {
        createSectionContainer();
        createSVG();
        createMainChart();
        createChartBackground();
        createTooltip();
        createFocusRegion();
        buildOnBalanceData(balanceDataPath)
        createTimeline(balanceDataPath);
        createLine(balanceDataPath);
    };

    /** Define private functions. */
    function buildOnBalanceData(balanceDataPath) { //Loads Data
        d3.csv(balanceDataPath,
            function(error, rawData) {
                if (error) throw error;

                var keys = ['bonds', 'mbs', 'balance_sheet', 'print_date'];
                var keys2 = ['bonds', 'mbs'];
                for (var i in keys2) {
                    self.activeSectors.add(keys[i]); //Same data in different format
                }
                self.balanceColorScale = getBalanceColorScale(getActiveSectors());
                self.baselineSector = keys2[0]; //Financial is baseline
                parseBalanceData(rawData, keys);
                self.dataLength = self.balanceData.length; //Setting number of data points
                self.initialBalanceVolume = self.getValueSum(self.balanceData[0]);

                self.balanceTimeScale = getTimeScale(self.balanceData, BALANCE_CHART_WIDTH);
                var stack = d3.stack()
                    .keys(keys2);

                var stackBalanceData = stack(self.balanceData);

                var balanceYScale = getbalanceYScale(stackBalanceData);

                createBalanceStreamChart(stackBalanceData, balanceYScale);
                createTimeAxis();
                createBalanceLegend();
            });
    };

    function parseBalanceData(input, keys) {
        var output = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currMonth = parseDate(input[i].date).getMonth(), //Sets the month count
                priorMonth = parseDate(input[i - 1].date).getMonth();
            if (currMonth != priorMonth) {
                var num = i - start;
                var obj = {}
                keys.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
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
        obj.date = parseDate(input[input.length - 1].date);
        obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
        output.push(obj);

        self.balanceData = output;
    };

    function createSectionContainer() {
        self.container = d3.select("#balance_div")
            .append("div")
            .attr("class", "section2-container");
        self.container2 = d3.select("#balance_legend")
            .append("div")
            .attr("class", "section2-container");
    };

    function createSVG() {
        self.svg = self.container.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT);
        var g_text = self.svg.append("g");
        g_text.selectAll('.text')
            .data(keys2.slice().reverse())
            .enter()
            .append('text')
            .attr('dx', 10)
            .attr('dy', 120)
            .text("Dollars");
        g_text.selectAll('.text')
            .data(keys2.slice().reverse())
            .enter()
            .append('text')
            .attr('dx', 0)
            .attr('dy', 140)
            .text("(Trillions)");
        self.legend_svg = self.container2.append("svg")
            .attr("width", 200)
            .attr("height", 250);
    };

    function createMainChart() {
        self.mainChart = self.svg.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
    };

    function createChartBackground() {
        var regions = [];
        var startDate = parseDate("1/07");
        var endDate = parseDate("08/17");
        var xscale = d3.scaleTime()
            .rangeRound([0, MAIN_CHART_WIDTH])
            .domain([startDate, endDate]);

        for (var i = 0; i < QE_TIMEZONE.length - 1; i++) {
            regions.push({
                color: QE_TIMEZONE[i].inEffect ? QE_IN_EFFECT_COLOR : QE_NOT_IN_EFFECT_COLOR,
                x: xscale(parseDate(QE_TIMEZONE[i].date)),
                width: xscale(parseDate(QE_TIMEZONE[i + 1].date)) - xscale(parseDate(QE_TIMEZONE[i].date))
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
            .attr("x", function(d) {
                return d.x + 4;
            })
            .attr("width", function(d) {
                return d.width;
            })
            .attr("height", MAIN_CHART_HEIGHT)
            .attr("pointer-events", "all")
            .style("fill", function(d) {
                return d.color;
            })
            .style("opacity", 0.25)
            .on("mouseover", balanceStreamAreaMouseOver)
            .on("mousemove", balanceStreamAreaMouseMove)
            .on("mouseout", balanceStreamAreaMouseOut)

        return self.chartBackground;
    };

    function createTooltip() {
        self.tooltip = self.container //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
            .moveToFront();
        self.tooltip.append("span")
            .attr("class", "emphasize");
        self.tooltip.append("br");
        self.tooltip.append("span")
            .attr("class", "underline bold");
        self.tooltip.append("br");
        self.tooltip.append("span");
        self.tooltip.append("br");
        self.tooltip.append("br");
        self.tooltip.append("span")
            .attr("class", "emphasize");
        self.tooltip.append("br");
        self.tooltip.append("span");
        self.tooltip.append("br");
        self.tooltip.append("span");
    };

    function createFocusRegion() { //I don't know what this does and it could be important
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

    //Related to having the scrollover in regards to the background
    function mainChartMouseMove(self, mouseX, mouseY, tooltipObj) {
        updateFocusLine(self, mouseX);
        updateTooltip(self, mouseX, mouseY, tooltipObj);
    };

    function mainChartMouseOut(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        hideTooltip();
        hideFocusLine();
    };

    function createBalanceStreamChart(stackBalanceData, balanceYScale) {
        var areaMaker = getAreaMaker(self.balanceTimeScale, balanceYScale);
        var balanceLayers = self.mainChart.append("g")
            .attr("class", "stock-layer")
            .selectAll("path")
            .data(stackBalanceData)
            .enter().append("path")
            .attr("class", "stock-area")
            .style("fill", function(d) {
                return self.balanceColorScale(d.key);
            })
            .attr("d", areaMaker)
            .attr("opacity", 1)
            .on("mouseover", balanceStreamAreaMouseOver)
            .on("mousemove", balanceStreamAreaMouseMove)
            .on("mouseout", balanceStreamAreaMouseOut)
            .on("click", balanceStreamAreaClick);
    };

    function createTimeAxis() {
        self.mainChart.append("g")
            .attr("transform", "translate(0," + MAIN_CHART_HEIGHT + ")")
            .call(d3.axisBottom(self.balanceTimeScale)
                .ticks(10)
                .tickFormat(d3.timeFormat("%Y")));
        var y = d3.scaleLinear()
            .domain([0, 5])
            .rangeRound([MAIN_CHART_HEIGHT, 0]);
        self.mainChart.append("g")
        var yAxis = d3.axisLeft()
            .scale(y)
            .ticks(10);
        self.svg.append('g')
            .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
            .call(yAxis);
    };

    function createBalanceLegend() { //Creating the Legend
        var g = self.legend_svg.append('g')
            .attr("class", "legend")
            .attr("text-anchor", "start");

        var offset = 10;

        g.selectAll('.text')
            .data(keys2.slice().reverse())
            .enter()
            .append('text')
            .attr('dx', 0)
            .attr('dy', 30 - offset)
            .text("Balance Sheet Legend");
        g.selectAll('.rect')
            .data(keys2.slice().reverse())
            .enter()
            .append('rect')
            .attr('x', 5)
            .attr('y', 35 - offset)
            .attr('width', 18)
            .attr('height', 18)
            .attr("style", "stroke:black;stroke-width:2px")
            .style('fill', 'orange');
        g.selectAll('.text')
            .data(keys2.slice().reverse())
            .enter()
            .append('text')
            .attr('dx', 33)
            .attr('dy', 48 - offset)
            .text("MBS (Mortgages)");
        g.selectAll('.rect')
            .data(keys2.slice().reverse())
            .enter()
            .append('rect')
            .attr('x', 5)
            .attr('y', 60 - offset)
            .attr('width', 18)
            .attr('height', 18)
            .attr("style", "stroke:black;stroke-width:2px")
            .style('fill', 'blue');
        g.selectAll('.text')
            .data(keys2.slice().reverse())
            .enter()
            .append('text')
            .attr('dx', 33)
            .attr('dy', 73 - offset)
            .text("Bonds");
        g.selectAll('.rect')
            .data(keys2.slice().reverse())
            .enter()
            .append('rect')
            .attr('x', 5)
            .attr('y', 93 - offset)
            .attr('width', 12)
            .attr('height', 5)
            .style('fill', 'green');
        g.selectAll('.rect')
            .data(keys2.slice().reverse())
            .enter()
            .append('rect')
            .attr('x', 17)
            .attr('y', 93 - offset)
            .attr('width', 12)
            .attr('height', 5)
            .style('fill', 'red');
        g.selectAll('.text')
            .data(keys2.slice().reverse())
            .enter()
            .append('text')
            .attr('dx', 33)
            .attr('dy', 100 - offset)
            .text("Total Balance Sheet Size");

        g.selectAll('.rect')
            .data(keys2.slice().reverse())
            .enter()
            .append('rect')
            .attr('x', 5)
            .attr('y', 120 - offset)
            .attr('width', 24)
            .attr('height', 5)
            .style('fill', 'red');
        g.selectAll('.text')
            .data(keys2.slice().reverse())
            .enter()
            .append('text')
            .attr('dx', 33)
            .attr('dy', 127 - offset)
            .text("QE is not occuring");
        g.selectAll('.rect')
            .data(keys2.slice().reverse())
            .enter()
            .append('rect')
            .attr('x', 5)
            .attr('y', 147 - offset)
            .attr('width', 24)
            .attr('height', 5)
            .style('fill', 'green');
        g.selectAll('.text')
            .data(keys2.slice().reverse())
            .enter()
            .append('text')
            .attr('dx', 33)
            .attr('dy', 154 - offset)
            .text("QE is occuring");

        g.selectAll('.rect')
            .data(keys2.slice().reverse())
            .enter()
            .append('rect')
            .attr('x', 5)
            .attr('y', 165 - offset)
            .attr('width', 24)
            .attr('height', 24)
            .style('fill', 'green')
            .style('opacity', 0.25);
        g.selectAll('.text')
            .data(keys2.slice().reverse())
            .enter()
            .append('text')
            .attr('dx', 33)
            .attr('dy', 180 - offset)
            .text("QE is occuring");
    };

    function updateBalanceStreamChart(stackBalanceData, balanceYScale) { //Reorganize stock order
        self.unobscureAll(self.mainChart.select("stock-layer"));
        // Disable mouse detection functions until transition is complete.
        self.isMouseActive = false;
        var enterAreaMaker = d3.area()
            .curve(d3.curveCatmullRom)
            .x(function(d, i) {
                return self.balanceTimeScale(d.data.date);
            })
            .y0(function(d) {
                return balanceYScale(d[1]);
            })
            .y1(function(d) {
                return balanceYScale(d[1]);
            });
        var mergeAreaMaker = getAreaMaker(self.balanceTimeScale, balanceYScale);

        var update = self.mainChart.select(".stock-layer")
            .selectAll(".stock-area")
            .data(stackBalanceData, function(d) {
                return d.key;
            })
            .classed("hover", false)
            .attr("stroke-width", "0px")

        var enter = update.enter().append("path")
            .attr("class", "stock-area")
            .on("mouseover", balanceStreamAreaMouseOver)
            .on("mousemove", balanceStreamAreaMouseMove)
            .on("mouseout", balanceStreamAreaMouseOut)
            .on("click", balanceStreamAreaClick)
            .style("fill", function(d) {
                return self.balanceColorScale(d.key);
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

    function updateFocusLine(mouseX) { //Moving Line
        var invertedX = self.getInvertedX(mouseX, BALANCE_CHART_WIDTH, self.dataLength);
        self.focueLine.attr("x1", mouseX + MARGIN.left - 3)
            .attr("y1", MARGIN.top)
            .attr("x2", mouseX + MARGIN.left - 3)
            .attr("y2", MARGIN.top + BALANCE_CHART_HEIGHT + 35 + 100)
            .attr("opacity", 1);
    };

    function updateFocuseCircle(mouseX) { //Note sure this has any import
        var invertedX = self.getInvertedX(mouseX, BALANCE_CHART_WIDTH, self.dataLength);
        self.focueCircle.attr("cx", mouseX + MARGIN.left + 5)
            .attr("cy", self.balanceYScale(self.balanceSheetData[invertedX].value) + 20)
            .attr("r", 4)
            .attr("opacity", 1);
    };

    function updateTooltip(x, y, tooltipObj) { //Sets Placement of bar
        self.tooltip.classed("hidden", false)
            .style("left", x + 130 + "px")
            .style("top", y - 100 + "px")
            .selectAll("span")
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

    function balanceStreamAreaMouseOver(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var balanceStreamArea = self.mainChart.selectAll(".stock-area");
        self.obscureALlExceptByObj(balanceStreamArea._groups[0], this, 250, 0.4);
    };

    function balanceStreamAreaMouseMove(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine(mouseX);
        updateAreaBorder(this);

        var invertedX = self.getInvertedX(mouseX, BALANCE_CHART_WIDTH, self.dataLength);
        var tooltipObj = getWholeMarketTooltipObj(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj);
    };

    function balanceStreamAreaMouseMove2(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0] - MARGIN.left;
        var mouseY = d3.mouse(this)[1];
        updateFocusLine(mouseX);
        updateAreaBorder(this);

        var invertedX = self.getInvertedX(mouseX, BALANCE_CHART_WIDTH, self.dataLength);
        var tooltipObj = getWholeMarketTooltipObj(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj);
    };

    function balanceStreamAreaMouseOut(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var balanceStreamArea = self.mainChart.select(".stock-layer")
            .selectAll(".stock-area");
        self.unobscureAll(balanceStreamArea, 250);

        hideAreaBorder(this);
        hideTooltip();
        hideFocusLine();
        hideFocusCircle();
    };

    function balanceStreamAreaClick(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        if (selected.key != self.baselineSector) {
            self.baselineSector = selected.key;
            var stack = getOrderedStack(self.baselineSector, getActiveSectors(), keys2.length);
            var stackBalanceData = stack(self.balanceData);
            var balanceYScale = getbalanceYScale(stackBalanceData);
            updateBalanceStreamChart(stackBalanceData, balanceYScale);
        }
    };

    //Creates the writing on scrolling over individual stock sectors
    function getWholeMarketTooltipObj(selected, x) {

        var d = new Date();
        var month = new Array();
        month[0] = "Jan";
        month[1] = "Feb";
        month[2] = "Mar";
        month[3] = "Apr";
        month[4] = "May";
        month[5] = "Jun";
        month[6] = "Jul";
        month[7] = "Aug";
        month[8] = "Sep";
        month[9] = "Oct";
        month[10] = "Nov";
        month[11] = "Dec";
        var n = month[d.getMonth()];

        var date = month[self.balanceData[x].date.getMonth()] + " " + self.balanceData[x].date.getFullYear();
        var intro = "Federal Reserve Balance Sheet"
        var intro2 = "(in Trillions of $)"
        var totalValue = "Total Balance:" + parseFloat(self.balanceData[x].balance_sheet);
        var bondValue = "Bond Balance:" + parseFloat(self.balanceData[x].bonds);
        var mbsValue = "MBS Balance:" + parseFloat(self.balanceData[x].mbs);

        return [date, intro, intro2, totalValue, bondValue, mbsValue];
    };

    //Needed to show either graph
    function getActiveSectors() {
        return Array.from(self.activeSectors);
    };

    //Needed to show either graph
    function getTimeScale(data, width) {
        var timeScale = d3.scaleTime()
            .rangeRound([0, width])
            .domain(d3.extent(data, function(d) {
                return d.date;
            }));
        return timeScale;
    };

    //Needed to show Stock Graph
    function getbalanceYScale(stackBalanceData) {
        var balanceYScale = d3.scaleLinear()
            .rangeRound([MAIN_CHART_HEIGHT, 0])
            .domain([0, 5]);
        return balanceYScale;
    };

    //Create Colors on Stock Chart
    function getBalanceColorScale(activeSectors) {
        var balanceColorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(activeSectors);
        return balanceColorScale;
    };

    function getBalanceYScale(data) {
        var balanceYScale = d3.scaleLinear()
            .rangeRound([BALANCE_CHART_HEIGHT + BALANCE_CHART_HEIGHT + CHARTS_SPACING + TOP_PADDING,
                BALANCE_CHART_HEIGHT + CHARTS_SPACING + TOP_PADDING
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

    function createLine(balanceDataPath) {
        var dateFmt = d3.timeParse("%m/%Y");
        d3.csv(balanceDataPath,
            function(d) {
                // This function is applied to each row of the dataset
                d.date = dateFmt(`${d.date}`);
                d.timeline_date = dateFmt(`${d.timeline_date}`);
                d.bonds = +d.bonds;
                d.balance_date = dateFmt(`${d.balance_date}`);
                return d;
            },
            function(err, data) {
                if (err) throw err;

                var x = d3.scaleTime()
                    .domain([new Date(2007, 01, 1), new Date(2017, 08, 1)])
                    .rangeRound([5, MAIN_CHART_WIDTH + 10]);

                var y = d3.scaleLinear()
                    .domain([0, 5])
                    .rangeRound([MAIN_CHART_HEIGHT, 0]);

                var red_line = d3.line()
                    .defined(function(d) {
                        return d.red_line != 0;
                    })
                    .x(function(d) {
                        return x(d.date) + MARGIN.left;
                    })
                    .y(function(d) {
                        return y(d.red_line);
                    });
                self.svg.append('path').attr('d', red_line(data))
                    .attr('stroke', 'red')
                    .attr('stroke-width', '2px')
                    .attr('fill', 'none');
                var green_line = d3.line()
                    .defined(function(d) {
                        return d.green_line != 0;
                    })
                    .x(function(d) {
                        return x(d.date) + MARGIN.left;
                    })
                    .y(function(d) {
                        return y(d.green_line);
                    });
                self.svg.append('path').attr('d', green_line(data))
                    .attr('stroke', 'green')
                    .attr('stroke-width', '3px')
                    .attr('fill', 'none');
                var invis_line = d3.line()
                    .defined(function(d) {
                        return d.balance_sheet != 0;
                    })
                    .x(function(d) {
                        return x(d.date) + MARGIN.left;
                    })
                    .y(function(d) {
                        return y(d.balance_sheet);
                    });
                self.svg.append('path').attr('d', invis_line(data))
                    .on("mouseover", balanceStreamAreaMouseOver)
                    .on("mousemove", balanceStreamAreaMouseMove2)
                    .on("mouseout", balanceStreamAreaMouseOut)
                    .attr('stroke', 'teal')
                    .attr('opacity', '0')
                    .attr('stroke-width', '2px')
                    .attr('fill', 'none');

                var svg2 = d3.select('#timeline')
                    .select("svg")
                var timeline_legend = d3.select('#timeline_legend')
                    .select("svg")
                var margin = {
                    top: 20,
                    right: 5,
                    bottom: 30,
                    left: -5
                };
                var height = +timeline_legend.attr('height') - margin.top - margin.bottom;

                var g = timeline_legend.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);


                g.selectAll('.circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', 15)
                    .attr('cy', height / 8 + 7)
                    .attr('r', 7)
                    .attr("style", "stroke:black;stroke-width:2px")
                    .style('fill', 'yellow');
                g.selectAll('.text')
                    .data(data)
                    .enter()
                    .append('text')
                    .attr('dx', 30)
                    .attr('dy', height / 8 + 12)
                    .text("- Special Announcement");
                g.selectAll('.circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', 15)
                    .attr('cy', 2 * height / 8 + 7)
                    .attr('r', 7)
                    .attr("style", "stroke:black;stroke-width:2px")
                    .style('fill', 'greenyellow');
                g.selectAll('.text')
                    .data(data)
                    .enter()
                    .append('text')
                    .attr('dx', 30)
                    .attr('dy', 2 * height / 8 + 12)
                    .text("- QE Begins");
                g.selectAll('.circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', 15)
                    .attr('cy', 3 * height / 8 + 7)
                    .attr('r', 7)
                    .attr("style", "stroke:black;stroke-width:2px")
                    .style('fill', 'green');
                g.selectAll('.text')
                    .data(data)
                    .enter()
                    .append('text')
                    .attr('dx', 30)
                    .attr('dy', 3 * height / 8 + 12)
                    .text("- QE increases");
                g.selectAll('.circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', 15)
                    .attr('cy', 4 * height / 8 + 3)
                    .attr('r', 7)
                    .attr("style", "stroke:black;stroke-width:2px")
                    .style('fill', 'teal');
                g.selectAll('.text')
                    .data(data)
                    .enter()
                    .append('text')
                    .attr('dx', 30)
                    .attr('dy', 4 * height / 8 + 8)
                    .text("- QE Ends or Tapers");
                g.selectAll('.circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', 15)
                    .attr('cy', 5 * height / 8 + 3)
                    .attr('r', 7)
                    .attr("style", "stroke:black;stroke-width:2px")
                    .style('fill', 'red');
                g.selectAll('.text')
                    .data(data)
                    .enter()
                    .append('text')
                    .attr('dx', 30)
                    .attr('dy', 5 * height / 8 + 8)
                    .text("- Interest Rate Change");
            })
    }

    function createTimeline(balanceDataPath) {
        var dateFmt = d3.timeParse("%m/%d/%Y");
        d3.csv(balanceDataPath,
            function(d) {
                // This function is applied to each row of the dataset
                d.date = dateFmt(`${d.date}`);
                d.timeline_date = dateFmt(`${d.timeline_date}`);
                d.bonds = +d.bonds;
                return d;
            },
            function(err, data) {
                if (err) throw err;

                var svg2 = d3.select('#timeline').select("svg");
                var margin = {
                    top: 120,
                    right: 20,
                    bottom: 30,
                    left: -5
                };
                var width = +svg2.attr('width') - margin.left - margin.right;
                var height = +svg2.attr('height') - margin.top - margin.bottom;

                var x = d3.scaleTime()
                    .domain([new Date(2007, 01, 1), new Date(2017, 8, 1)])
                    .range([0, width]);

                var g = svg2.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);

                g.append("path")

                var xAxis = d3.axisBottom()
                    .scale(x)
                    // .ticks(d3.timeMonths)
                    // .tickSize(16, 0)
                    .tickSizeOuter(0)
                    .tickFormat(d3.timeFormat('%m/%Y'));

                g.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(xAxis);
                g.selectAll('.circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('class', 'point')
                    .attr('cx', d => x(d.timeline_date))
                    .attr('cy', d => (110 - (d.amount) * 10))
                    .attr('r', 7)
                    .style('opacity', d => (d.timeline_opacity))
                    .attr("style", "stroke:black;stroke-width:2px")
                    .style('fill', d => (d.timeline_color))
                    .style('opacity', d => (d.timeline_opacity))
                    .style('fill-opacity', 1.0)
                    .on('mousemove', highlight)
                    .on('mouseover', more_info);

                function highlight(d, i) {
                    var highlighted = d3.select('#timeline').select("svg");
                    var highligher1 = highlighted.append("rect")
                        .attr('x', 110)
                        .attr('y', 185)
                        .attr('width', 80)
                        .attr('height', 60)
                        .style('fill', 'teal')
                        .style('fill-opacity', 0.35);
                    var highligher2 = highlighted.append("rect")
                        .attr('x', 235)
                        .attr('y', 185)
                        .attr('width', 40)
                        .attr('height', 60)
                        .style('fill', 'teal')
                        .style('fill-opacity', 0.35)
                    var highligher3 = highlighted.append("rect")
                        .attr('x', 350)
                        .attr('y', 185)
                        .attr('width', 125)
                        .attr('height', 60)
                        .style('fill', 'teal')
                        .style('fill-opacity', 0.35)
                    highlighted.selectAll('.circle')
                        .data(data)
                        .enter()
                        .append('circle')
                        .attr('class', 'point')
                        .attr('cx', d => x(d.timeline_date) - 5)
                        .attr('cy', d => (230 - (d.amount) * 10))
                        .attr('r', 7)
                        .style('opacity', d => (d.timeline_opacity))
                        .attr("style", "stroke:black;stroke-width:2px")
                        .style('fill', d => (d.timeline_color))
                        .style('opacity', d => (d.timeline_opacity))
                        .style('fill-opacity', 1.0)
                        .on('mouseover', more_info);

                    function more_info(d, i) {
                        var timeline_svg = d3.select('#timeline').select("svg");
                        var g = timeline_svg.append('g')
                            .append('line')
                            .attr('x1', 155)
                            .attr('x2', 495)
                            .attr('y1', 0)
                            .attr('y2', 0)
                            .attr("stroke-width", 365)
                            .attr("stroke", d.timeline_color);
                        var g = timeline_svg.append('g')
                            .append('rect')
                            .attr('x', 165)
                            .attr('y', 15)
                            .attr('width', 320)
                            .attr('height', 155)
                            .style('fill', 'white')
                            .style('fill-opacity', 1)
                        var g = timeline_svg.append('g')
                            .append('circle')
                            .attr('class', 'point')
                            .attr('cx', 175)
                            .attr('cy', 30)
                            .attr('r', 7)
                            .attr("style", "fill-opacity:0; stroke:black;stroke-width:2px")
                            .style('fill', d.timeline_color)
                            .style('fill-opacity', 1.0);
                        var g = timeline_svg.append('g')
                            .append('text')
                            .attr('dx', 190)
                            .attr('dy', 35)
                            .text("DATE:" + d.date_info)
                        var g = timeline_svg.append('g')
                            .append('circle')
                            .attr('class', 'point')
                            .attr('cx', 175)
                            .attr('cy', 65)
                            .attr('r', 7)
                            .attr("style", "fill-opacity:0; stroke:black;stroke-width:2px")
                            .style('fill', d.timeline_color)
                            .style('fill-opacity', 1.0);
                        var g = timeline_svg.append('g')
                            .append('text')
                            .attr('dx', 190)
                            .attr('dy', 70)
                            .text(d.info)
                        var g = timeline_svg.append('g')
                            .append('text')
                            .attr('dx', 190)
                            .attr('dy', 85)
                            .text(d.info2)
                        var g = timeline_svg.append('g')
                            .append('text')
                            .attr('dx', 190)
                            .attr('dy', 100)
                            .text(d.info3)
                        var g = timeline_svg.append('g')
                            .append('circle')
                            .attr('class', 'point')
                            .attr('cx', 175)
                            .attr('cy', 120)
                            .attr('r', 7)
                            .attr("style", "fill-opacity:0; stroke:black;stroke-width:2px")
                            .style('fill', d.timeline_color)
                            .style('fill-opacity', 1.0)
                        var g = timeline_svg.append('g')
                            .append('text')
                            .attr('dx', 190)
                            .attr('dy', 125)
                            .text(d.effect)
                        var g = timeline_svg.append('g')
                            .append('text')
                            .attr('dx', 190)
                            .attr('dy', 140)
                            .text(d.effect2)
                        var g = timeline_svg.append('g')
                            .append('text')
                            .attr('dx', 190)
                            .attr('dy', 155)
                            .text(d.effect3);


                    }
                };

                function more_info(d, i) {
                    var timeline_svg = d3.select('#timeline').select("svg");
                    var g = timeline_svg.append('g')
                        .append('line')
                        .attr('x1', 155)
                        .attr('x2', 495)
                        .attr('y1', 0)
                        .attr('y2', 0)
                        .attr("stroke-width", 365)
                        .attr("stroke", d.timeline_color);
                    var g = timeline_svg.append('g')
                        .append('rect')
                        .attr('x', 165)
                        .attr('y', 15)
                        .attr('width', 320)
                        .attr('height', 155)
                        .style('fill', 'white')
                        .style('fill-opacity', 1)
                    var g = timeline_svg.append('g')
                        .append('circle')
                        .attr('class', 'point')
                        .attr('cx', 175)
                        .attr('cy', 30)
                        .attr('r', 7)
                        .attr("style", "fill-opacity:0; stroke:black;stroke-width:2px")
                        .style('fill', d.timeline_color)
                        .style('fill-opacity', 1.0);
                    var g = timeline_svg.append('g')
                        .append('text')
                        .attr('dx', 190)
                        .attr('dy', 35)
                        .text("DATE:" + d.date_info)
                    var g = timeline_svg.append('g')
                        .append('circle')
                        .attr('class', 'point')
                        .attr('cx', 175)
                        .attr('cy', 65)
                        .attr('r', 7)
                        .attr("style", "fill-opacity:0; stroke:black;stroke-width:2px")
                        .style('fill', d.timeline_color)
                        .style('fill-opacity', 1.0);
                    var g = timeline_svg.append('g')
                        .append('text')
                        .attr('dx', 190)
                        .attr('dy', 70)
                        .text(d.info)
                    var g = timeline_svg.append('g')
                        .append('text')
                        .attr('dx', 190)
                        .attr('dy', 85)
                        .text(d.info2)
                    var g = timeline_svg.append('g')
                        .append('text')
                        .attr('dx', 190)
                        .attr('dy', 100)
                        .text(d.info3)
                    var g = timeline_svg.append('g')
                        .append('circle')
                        .attr('class', 'point')
                        .attr('cx', 175)
                        .attr('cy', 120)
                        .attr('r', 7)
                        .attr("style", "fill-opacity:0; stroke:black;stroke-width:2px")
                        .style('fill', d.timeline_color)
                        .style('fill-opacity', 1.0)
                    var g = timeline_svg.append('g')
                        .append('text')
                        .attr('dx', 190)
                        .attr('dy', 125)
                        .text(d.effect)
                    var g = timeline_svg.append('g')
                        .append('text')
                        .attr('dx', 190)
                        .attr('dy', 140)
                        .text(d.effect2)
                    var g = timeline_svg.append('g')
                        .append('text')
                        .attr('dx', 190)
                        .attr('dy', 155)
                        .text(d.effect3);
                };
            })
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

    function QE_shadow() {
        var regions = [];
        var startDate = parseDate("1/31/07");
        var endDate = parseDate("6/30/17");
        var xscale = d3.scaleTime()
            .rangeRound([0, MAIN_CHART_WIDTH])
            .domain([startDate, endDate]);

        for (var i = 0; i < QE_TIMEZONE.length - 1; i++) {
            regions.push({
                color: QE_TIMEZONE[i].inEffect ? QE_IN_EFFECT_COLOR : QE_NOT_IN_EFFECT_COLOR,
                x: xscale(parseDate(QE_TIMEZONE[i].date)),
                width: xscale(parseDate(QE_TIMEZONE[i + 1].date)) - xscale(parseDate(QE_TIMEZONE[i].date))
            });
        }

        var lastIndex = QE_TIMEZONE.length - 1;
        regions.push({
            color: QE_TIMEZONE[lastIndex].inEffect ? QE_IN_EFFECT_COLOR : QE_NOT_IN_EFFECT_COLOR,
            x: xscale(parseDate(QE_TIMEZONE[lastIndex].date)),
            width: MAIN_CHART_WIDTH - xscale(parseDate(QE_TIMEZONE[lastIndex].date))
        })
    };

    function reveal_highlight() {
        var regions = [];
        var startDate = parseDate("1/31/07");
        var endDate = parseDate("6/30/17");
        var xscale = d3.scaleTime()
            .rangeRound([0, MAIN_CHART_WIDTH])
            .domain([startDate, endDate]);

        for (var i = 0; i < QE_TIMEZONE.length - 1; i++) {
            regions.push({
                color: QE_TIMEZONE[i].inEffect ? QE_IN_EFFECT_COLOR : QE_NOT_IN_EFFECT_COLOR,
                x: xscale(parseDate(QE_TIMEZONE[i].date)),
                width: xscale(parseDate(QE_TIMEZONE[i + 1].date)) - xscale(parseDate(QE_TIMEZONE[i].date))
            });
        }

        var lastIndex = QE_TIMEZONE.length - 1;
        regions.push({
            color: QE_TIMEZONE[lastIndex].inEffect ? QE_IN_EFFECT_COLOR : QE_NOT_IN_EFFECT_COLOR,
            x: xscale(parseDate(QE_TIMEZONE[lastIndex].date)),
            width: MAIN_CHART_WIDTH - xscale(parseDate(QE_TIMEZONE[lastIndex].date))
        });
        self.chartBackground = self.mainChart.append("g")

        self.chartBackground.selectAll("rect")
            .data(regions)
            .enter().append("rect")
            .attr("class", "highlight_areas")
            .attr("x", function(d) {
                return d.x;
            })
            .attr("width", function(d) {
                return d.width;
            })
            .attr("height", MAIN_CHART_HEIGHT * 0.915)
            .attr("pointer-events", "all")
            .style("fill", function(d) {
                return d.color;
            })
            .attr("opacity", 0.25);
    };
};

BalanceVis.prototype.getInvertedX = Shared.getInvertedX;
BalanceVis.prototype.getValueSum = Shared.getValueSum;
BalanceVis.prototype.obscureAll = Shared.obscureAll;
BalanceVis.prototype.unobscureAll = Shared.unobscureAll;
BalanceVis.prototype.obscureALlExceptByIndex = Shared.obscureALlExceptByIndex;
BalanceVis.prototype.obscureALlExceptByObj = Shared.obscureALlExceptByObj;

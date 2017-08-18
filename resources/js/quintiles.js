var QuintilesVis = function(QuintilePath) {
    const parseDate = d3.timeParse("%m/%d/%Y");
    const SVG_HEIGHT = 205;
    const SVG_HEIGHT_BIGGER = 280;
    const SVG_WIDTH = 290;
    const MARGIN = {
        top: 5,
        right: 11,
        bottom: 10,
        left: 30
    };
    const MAIN_CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
    const MAIN_CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
    const BIGGER_CHART_HEIGHT = SVG_HEIGHT_BIGGER - MARGIN.top - MARGIN.bottom;
    var dateFmt = d3.timeParse("%m/%d/%Y");
    const BACKGROUND = [{
            date: "01-01-2007",
            inEffect: true
        },
        {
            date: "01-01-2016",
            inEffect: false
        }
    ];
    // Define class variables
    var self = this;
    self.quintData;
    self.quintData1;
    self.quintData2;
    self.quintData3;
    self.quintData4;
    self.quintData5;
    self.dataLength;
    self.bars1;
    self.isMouseActive = true;
    self.activeSectors1 = new Set();
    self.activeSectors2 = new Set();
    self.activeSectors3 = new Set();
    self.activeSectors4 = new Set();
    self.activeSectors5 = new Set();
    self.container1;
    self.svg1;
    self.mainChart1;
    self.container2;
    self.svg2;
    self.mainChart2;
    self.container3;
    self.container3;
    self.svg3;
    self.mainChart3;
    self.container4;
    self.svg4;
    self.mainChart4;
    self.container5;
    self.svg5;
    self.svg_info;
    self.mainChart5;
    self.tooltip1;
    self.tooltip2;
    self.tooltip3;
    self.tooltip4;
    self.tooltip5;
    self.focueLine1;
    self.focueCircle1;
    self.focueLine2;
    self.focueCircle2;
    self.focueLine3;
    self.focueCircle3;
    self.focueLine4;
    self.focueCircle4;
    self.focueLine5;
    self.focueCircle5;
    self.chartBackground1;
    self.quint_takeaway_container;
    self.quint_takeaway_chart;
    self.quint_takeaway_svg;
	self.label_container;
	self.label_svg;
	createLabelContainer();
    createSectionContainer1(self.quintData1);
    createSectionContainer2();
    createSectionContainer3();
    createSectionContainer4();
    createSectionContainer5();
    createQuintTakeaways();
    buildQuintData(QuintilePath)
    createLegend();
    createQuintChart(QuintilePath);
    var keys = ['q1_core', 'q1_pretax', 'q2_core', 'q2_pretax', 'q3_core', 'q3_pretax', 'q4_core', 'q4_pretax', 'q5_core', 'q5_pretax']
    var keys1 = ['q1_core', 'q1_pretax'];
    var keys2 = ['q2_core', 'q2_pretax'];
    var keys3 = ['q3_core', 'q3_pretax'];
    var keys4 = ['q4_core', 'q4_pretax'];
    var keys5 = ['q5_core', 'q5_pretax'];
    /** Define private functions. */
    function buildQuintData(QuintilePath) { //Loads Stock Data
        d3.csv(QuintilePath,
            function(error, rawData) {
                if (error) throw error;

                for (var i in keys1) {
                    self.activeSectors1.add(keys[i]); //Same data in different format
                }
                for (var i in keys2) {
                    self.activeSectors2.add(keys[i]); //Same data in different format
                }
                for (var i in keys3) {
                    self.activeSectors3.add(keys[i]); //Same data in different format
                }
                for (var i in keys4) {
                    self.activeSectors4.add(keys[i]); //Same data in different format
                }
                for (var i in keys5) {
                    self.activeSectors5.add(keys[i]); //Same data in different format
                }
                parseQuintData(rawData, keys1, keys2, keys3, keys4, keys5);
                self.dataLength = self.quintData1.length; //Setting number of data points
            });
    };

	    function createLabelContainer() {
        self.label_container = d3.select("#quintlabel")
            .append("div")
        self.label_svg = self.label_container.append("svg")
            .attr("width", 230)
            .attr("height", 500);
   	  self.label_svg.append('text')
		  .attr('dx', 180)
		  .attr('dy', 210)
		  .text("Dollars");
   	  self.label_svg.append('text')
		  .attr('dx', 190)
		  .attr('dy', 230)
		  .text("($$)");
   	  self.label_svg.append('text')
		  .attr('dx', 180)
		  .attr('dy', 450)
		  .text("Dollars");
   	  self.label_svg.append('text')
		  .attr('dx', 190)
		  .attr('dy', 470)
		  .text("($$)");
	};

    function createQuintTakeaways() {
        self.quint_takeaway_container = d3.select("#quint_takeaways")
        self.quint_takeaway_svg = self.quint_takeaway_container.append("svg")
            .attr("width", 265)
            .attr("height", 500)
        self.quint_takeaway_chart = self.quint_takeaway_svg.append("g")
            .attr("transform", "translate(" + MARGIN.top + ")")
        self.quint_takeaway_chart.append("rect")
                    .attr('width', 265)
                    .attr('height', 500)
                    .attr('x', 0)
                    .attr("y", 20)
                    .attr('fill', 'rgba(182, 195, 184, 0.2)');
        self.quint_takeaway_chart.append("text")
					.attr("class", "insights-header")
                    .attr('x', 30)
                    .attr("y", 90)
                    .text("Key Insights");
        self.quint_takeaway_chart.append("rect")
                    .attr('x', 30)
                    .attr("y", 120)
                    .attr('height', 1)
                    .attr("width", 200);
        self.quint_takeaway_chart.append("circle")
					.attr('cx', 35)
					.attr('cy', 160)
					.attr('r', 10)
					  .style("stroke", 'black')
					  .style("fill", "none")
					  .style("stroke-width", '2px')
					  .text("The Poorer Get Poorer");
		self.quint_takeaway_chart.append('text')
					.attr('dx', 30)
					.attr('dy', 165)
					.text('1')
		self.quint_takeaway_chart.append('text')
					.attr("class", "underline")
					.attr('dx', 50)
					.attr('dy', 165)
					.text('The Poor get Poorer')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 190)
					.text('Every year, the bottom 20% of')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 205)
					.text('income earners are unable to pay')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 220)
					.text('for all their core costs with their')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 235)
					.text('current income.')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 265)
					.text('Since 2007 until now, that')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 280)
					.text('deficit is over $50,000 total.')

        self.quint_takeaway_chart.append("circle")
					.attr('cx', 35)
					.attr('cy', 330)
					.attr('r', 10)
					  .style("stroke", 'black')
					  .style("fill", "none")
					  .style("stroke-width", '2px');
		self.quint_takeaway_chart.append('text')
					.attr('dx', 30)
					.attr('dy', 335)
					.text('2')
	self.quint_takeaway_chart.append('text')
					.attr("class", "underline")
					.attr('dx', 50)
					.attr('dy', 330)
					.text('The Rich get Richer')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 355)
					.text('On the other hand, the top 20%')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 370)
					.text('of income earners saw their yearly')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 385)
					.text('incomes increase by $20,000 from')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 400)
					.text('2007 to 2015.')

		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 430)
					.text('Their costs have risen a much')
		self.quint_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 445)
					.text('smaller amount.')
    };

    function parseQuintData(input, keys1, keys2, keys3, keys4, keys5) {
        var output1 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currYear = parseDate(input[i].date).getYear(), //Sets the month count
                priorYear = parseDate(input[i - 1].date).getYear();
            if (currYear != priorYear) {
                var num = i - start;
                var obj = {}
                keys1.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear() + 1, 0);
                output1.push(obj);
                start = i;
            }
        }

        var num = input.length - start;
        var obj = {}
        keys1.forEach(function(key) {
            obj[key] = input.slice(start, input.length).reduce(function(sum, item) {
                return sum + item[key] / num;
            }, 0);
        });
        obj.date = parseDate(input[input.length - 1].date);
        obj.date = new Date(obj.date.getFullYear() + 1, 0);
        output1.push(obj);
        self.quintData1 = output1;

        var output2 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currYear = parseDate(input[i].date).getYear(), //Sets the month count
                priorYear = parseDate(input[i - 1].date).getYear();
            if (currYear != priorYear) {
                var num = i - start;
                var obj = {}
                keys2.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear() + 1, 0);
                output2.push(obj);
                start = i;
            }
        }

        var num = input.length - start;
        var obj = {}
        keys2.forEach(function(key) {
            obj[key] = input.slice(start, input.length).reduce(function(sum, item) {
                return sum + item[key] / num;
            }, 0);
        });
        obj.date = parseDate(input[input.length - 1].date);
        obj.date = new Date(obj.date.getFullYear() + 1, 0);
        output2.push(obj);
        self.quintData2 = output2;

        var output3 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currYear = parseDate(input[i].date).getYear(), //Sets the month count
                priorYear = parseDate(input[i - 1].date).getYear();
            if (currYear != priorYear) {
                var num = i - start;
                var obj = {}
                keys3.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear() + 1, 0);
                output3.push(obj);
                start = i;
            }
        }

        var num = input.length - start;
        var obj = {}
        keys3.forEach(function(key) {
            obj[key] = input.slice(start, input.length).reduce(function(sum, item) {
                return sum + item[key] / num;
            }, 0);
        });
        obj.date = parseDate(input[input.length - 1].date);
        obj.date = new Date(obj.date.getFullYear() + 1, 0);
        output3.push(obj);
        self.quintData3 = output3;

        var output4 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currYear = parseDate(input[i].date).getYear(), //Sets the month count
                priorYear = parseDate(input[i - 1].date).getYear();
            if (currYear != priorYear) {
                var num = i - start;
                var obj = {}
                keys4.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear() + 1, 0);
                output4.push(obj);
                start = i;
            }
        }

        var num = input.length - start;
        var obj = {}
        keys4.forEach(function(key) {
            obj[key] = input.slice(start, input.length).reduce(function(sum, item) {
                return sum + item[key] / num;
            }, 0);
        });
        obj.date = parseDate(input[input.length - 1].date);
        obj.date = new Date(obj.date.getFullYear() + 1, 0);
        output4.push(obj);
        self.quintData4 = output4;

        var output5 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currYear = parseDate(input[i].date).getYear(), //Sets the month count
                priorYear = parseDate(input[i - 1].date).getYear();
            if (currYear != priorYear) {
                var num = i - start;
                var obj = {}
                keys5.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear() + 1, 0);
                output5.push(obj);
                start = i;
            }
        }

        var num = input.length - start;
        var obj = {}
        keys5.forEach(function(key) {
            obj[key] = input.slice(start, input.length).reduce(function(sum, item) {
                return sum + item[key] / num;
            }, 0);
        });
        obj.date = parseDate(input[input.length - 1].date);
        obj.date = new Date(obj.date.getFullYear() + 1, 0);
        output5.push(obj);
        self.quintData5 = output5;
    };

    function createSectionContainer1(quintData) {
        self.container1 = d3.select("#quint1")
            .append("div")
            .attr("class", "section2-container")
        self.svg1 = self.container1.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT);
        var g_text = self.svg1.append("g")
        self.mainChart1 = self.svg1.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
            .on("mouseover", quintStreamAreaMouseOver1)
            .on("mousemove", quintStreamAreaMouseMove1)
            .on("mouseout", quintStreamAreaMouseOut1)
        self.tooltip1 = self.container1 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip1.append("p")
            .attr("class", "emphasize");
        self.tooltip1.append("br")
        self.tooltip1.append("p")
            .attr("class", "emphasize");
        self.tooltip1.append("p")
            .attr("class", "underline");
        self.tooltip1.append("p");
        self.tooltip1.append("p");
        var focusRegion1 = self.svg1.append("g")
            .attr("class", "focus-region");

        self.focueLine1 = focusRegion1.append("g")
            .attr("class", "focus-line")
            .append("line")
            .attr("opacity", 0);

        self.focueCircle1 = focusRegion1.append("g")
            .attr("class", "focus-circle")
            .append("circle")
            .attr("opacity", 0);

    };

    function createSectionContainer2() {
        self.container2 = d3.select("#quint2")
            .append("div")
            .attr("class", "section2-container")
        self.svg2 = self.container2.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT)
        self.mainChart2 = self.svg2.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
            .on("mouseover", quintStreamAreaMouseOver2)
            .on("mousemove", quintStreamAreaMouseMove2)
            .on("mouseout", quintStreamAreaMouseOut2);
        self.tooltip2 = self.container2 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip2.append("p")
            .attr("class", "emphasize");
        self.tooltip2.append("br")
        self.tooltip2.append("p")
            .attr("class", "emphasize");
        self.tooltip2.append("p")
            .attr("class", "underline");
        self.tooltip2.append("p");
        self.tooltip2.append("p");
        var focusRegion2 = self.svg2.append("g")
            .attr("class", "focus-region");

        self.focueLine2 = focusRegion2.append("g")
            .attr("class", "focus-line")
            .append("line")
            .attr("opacity", 0);

        self.focueCircle2 = focusRegion2.append("g")
            .attr("class", "focus-circle")
            .append("circle")
            .attr("opacity", 0);
    };

    function createSectionContainer3() {
        self.container3 = d3.select("#quint3")
            .append("div")
            .attr("class", "section2-container")
        self.svg3 = self.container3.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT)
        self.mainChart3 = self.svg3.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
            .on("mouseover", quintStreamAreaMouseOver3)
            .on("mousemove", quintStreamAreaMouseMove3)
            .on("mouseout", quintStreamAreaMouseOut3);
        self.tooltip3 = self.container3 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip3.append("p")
            .attr("class", "emphasize");
        self.tooltip3.append("br")
        self.tooltip3.append("p")
            .attr("class", "emphasize");
        self.tooltip3.append("p")
            .attr("class", "underline");
        self.tooltip3.append("p");
        self.tooltip3.append("p");
        var focusRegion3 = self.svg3.append("g")
            .attr("class", "focus-region");

        self.focueLine3 = focusRegion3.append("g")
            .attr("class", "focus-line")
            .append("line")
            .attr("opacity", 0);

        self.focueCircle3 = focusRegion3.append("g")
            .attr("class", "focus-circle")
            .append("circle")
            .attr("opacity", 0);
    };

    function createSectionContainer4() {
        self.container4 = d3.select("#quint4")
            .append("div")
            .attr("class", "section2-container")
        self.svg4 = self.container4.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT)
        self.mainChart4 = self.svg4.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
            .on("mouseover", quintStreamAreaMouseOver4)
            .on("mousemove", quintStreamAreaMouseMove4)
            .on("mouseout", quintStreamAreaMouseOut4);
        self.tooltip4 = self.container4 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip4.append("p")
            .attr("class", "emphasize");
        self.tooltip4.append("br")
        self.tooltip4.append("p")
            .attr("class", "emphasize");
        self.tooltip4.append("p")
            .attr("class", "underline");
        self.tooltip4.append("p");
        self.tooltip4.append("p");
        var focusRegion4 = self.svg4.append("g")
            .attr("class", "focus-region");

        self.focueLine4 = focusRegion4.append("g")
            .attr("class", "focus-line")
            .append("line")
            .attr("opacity", 0);

        self.focueCircle4 = focusRegion4.append("g")
            .attr("class", "focus-circle")
            .append("circle")
            .attr("opacity", 0);
    };

    function createSectionContainer5() {
        self.container5 = d3.select("#quint5")
            .append("div")
            .attr("class", "section2-container")
        self.svg5 = self.container5.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT_BIGGER)
        self.mainChart5 = self.svg5.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
            .on("mouseover", quintStreamAreaMouseOver5)
            .on("mousemove", quintStreamAreaMouseMove5)
            .on("mouseout", quintStreamAreaMouseOut5);
        self.tooltip5 = self.container5 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip5.append("p")
            .attr("class", "emphasize");
        self.tooltip5.append("br")
        self.tooltip5.append("p")
            .attr("class", "emphasize");
        self.tooltip5.append("p")
            .attr("class", "underline");
        self.tooltip5.append("p");
        self.tooltip5.append("p");
        var focusRegion5 = self.svg5.append("g")
            .attr("class", "focus-region");

        self.focueLine5 = focusRegion5.append("g")
            .attr("class", "focus-line")
            .append("line")
            .attr("opacity", 0);

        self.focueCircle5 = focusRegion5.append("g")
            .attr("class", "focus-circle")
            .append("circle")
            .attr("opacity", 0);
    };


    function createQuintChart(QuintilePath) {
        d3.csv(QuintilePath,
            function(d) {
                // This function is applied to each row of the dataset
                d.date = dateFmt(`${d.date}`);
                return d;
            },
            function(err, data) {
                if (err) throw err;
                var margin = {
                    top: 5,
                    right: 1,
                    bottom: 30,
                    left: 50
                };
                var width = SVG_WIDTH - margin.left - margin.right;
                var height = SVG_HEIGHT - margin.top - margin.bottom;
                var height_bigger = SVG_HEIGHT_BIGGER - margin.top - margin.bottom;
                var x = d3.scaleTime()
                    .domain([new Date(2006, 09, 1), new Date(2016, 05, 1)])
                    .rangeRound([0, width]);
                var y = d3.scaleLinear()
                    .domain([-20000, 120000])
                    .rangeRound([height + 5, 0]);
                var y2 = d3.scaleLinear()
                    .domain([-20000, 180000])
                    .rangeRound([height_bigger + 5, 0]);
                var xAxis = d3.axisBottom()
                    .scale(x)
                    .tickSizeOuter(0)
                    .tickFormat(d3.timeFormat('%Y'))
                    .ticks(10);
                var yAxis = d3.axisLeft()
                    .scale(y)
                    .ticks(8);
                var yAxis2 = d3.axisLeft()
                    .scale(y2)
                    .ticks(8);
                var barWidth = MAIN_CHART_WIDTH * (1 / 9) - 3;

                var bars = self.svg1.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                var g = self.svg1.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);
                g.append("path")
                g.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(xAxis);

                self.svg1.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .call(yAxis);

                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => (height - y(d.q1_pretax) - 20))
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q1_pretax) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver1)
                    .on("mousemove", quintStreamAreaMouseMove1)
                    .on("mouseout", quintStreamAreaMouseOut1);
                var bars = self.svg1.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => height - y(d.q1_core) - 20)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q1_core) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver1)
                    .on("mousemove", quintStreamAreaMouseMove1)
                    .on("mouseout", quintStreamAreaMouseOut1);
                var bars = self.svg1.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q1_pretax - d.q1_core) + margin.top)
                    .attr('fill', 'black');
                var bars = self.svg1.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', height)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", quintStreamAreaMouseOver1)
                    .on("mousemove", quintStreamAreaMouseMove1)
                    .on("mouseout", quintStreamAreaMouseOut1);
                bars.append('circle')
                    .attr('cx', 275)
                    .attr('cy', 170)
                    .attr('r', 10)
                    .style("stroke", 'black')
                    .style("fill", "none")
                    .style("stroke-width", '2px')
                    .on("mouseover", quintStreamAreaMouseOver1)
                    .on("mousemove", quintStreamAreaMouseMove1)
                    .on("mouseout", quintStreamAreaMouseOut1);
                bars.append('circle')
                    .attr('cx', 200)
                    .attr('cy', 20)
                    .attr('r', 10)
                    .style("stroke", 'black')
                    .style("fill", "none")
                    .style("stroke-width", '2px')
                    .on("mouseover", quintStreamAreaMouseOver1)
                    .on("mousemove", quintStreamAreaMouseMove1)
                    .on("mouseout", quintStreamAreaMouseOut1);
                bars.append('text')
                    .attr('dx', 215)
                    .attr('dy', 20)
                    .text('The Poor')
                    .on("mouseover", quintStreamAreaMouseOver1)
                    .on("mousemove", quintStreamAreaMouseMove1)
                    .on("mouseout", quintStreamAreaMouseOut1);
                bars.append('text')
                    .attr('dx', 215)
                    .attr('dy', 35)
                    .text('Get Poorer')
                    .on("mouseover", quintStreamAreaMouseOver1)
                    .on("mousemove", quintStreamAreaMouseMove1)
                    .on("mouseout", quintStreamAreaMouseOut1);
                bars.append('text')
                    .attr('dx', 175)
                    .attr('dy', 50)
                    .text('(See Key Insights)')
                    .on("mouseover", quintStreamAreaMouseOver1)
                    .on("mousemove", quintStreamAreaMouseMove1)
                    .on("mouseout", quintStreamAreaMouseOut1);
                bars.append('text')
                    .attr('dx', 195)
                    .attr('dy', 25)
                    .text('1')
                    .on("mouseover", quintStreamAreaMouseOver1)
                    .on("mousemove", quintStreamAreaMouseMove1)
                    .on("mouseout", quintStreamAreaMouseOut1);

                var bars = self.svg2.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");

                var g = self.svg2.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);
                g.append("path")
                g.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(xAxis);
                self.svg2.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .call(yAxis);
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => height - y(d.q2_pretax) - 20)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q2_pretax) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver2)
                    .on("mousemove", quintStreamAreaMouseMove2)
                    .on("mouseout", quintStreamAreaMouseOut2);
                var bars = self.svg2.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => height - y(d.q2_core) - 20)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q2_core) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver2)
                    .on("mousemove", quintStreamAreaMouseMove2)
                    .on("mouseout", quintStreamAreaMouseOut2);
                var bars = self.svg2.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q2_pretax - d.q2_core) + margin.top)
                    .attr('fill', 'black');
                var bars = self.svg2.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', height)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", quintStreamAreaMouseOver2)
                    .on("mousemove", quintStreamAreaMouseMove2)
                    .on("mouseout", quintStreamAreaMouseOut2);

                var bars = self.svg3.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                var g = self.svg3.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);
                g.append("path")
                g.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(xAxis);
                self.svg3.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .call(yAxis);
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => height - y(d.q3_pretax) - 20)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q3_pretax) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver3)
                    .on("mousemove", quintStreamAreaMouseMove3)
                    .on("mouseout", quintStreamAreaMouseOut3);
                var bars = self.svg3.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => height - y(d.q3_core) - 20)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q3_core) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver3)
                    .on("mousemove", quintStreamAreaMouseMove3)
                    .on("mouseout", quintStreamAreaMouseOut3);
                var bars = self.svg3.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q3_pretax - d.q3_core) + margin.top)
                    .attr('fill', 'black');
                var bars = self.svg3.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', height)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", quintStreamAreaMouseOver3)
                    .on("mousemove", quintStreamAreaMouseMove3)
                    .on("mouseout", quintStreamAreaMouseOut3);

                var bars = self.svg4.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                var g = self.svg4.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);
                g.append("path")
                g.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(xAxis);
                self.svg4.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .call(yAxis);
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => height - y(d.q4_pretax) - 20)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q4_pretax) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver4)
                    .on("mousemove", quintStreamAreaMouseMove4)
                    .on("mouseout", quintStreamAreaMouseOut4);
                var bars = self.svg4.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => height - y(d.q4_core) - 20)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q4_core) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver4)
                    .on("mousemove", quintStreamAreaMouseMove4)
                    .on("mouseout", quintStreamAreaMouseOut4);
                var bars = self.svg4.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y(d.q4_pretax - d.q4_core) + margin.top)
                    .attr('fill', 'black');
                var bars = self.svg4.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', height)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", quintStreamAreaMouseOver4)
                    .on("mousemove", quintStreamAreaMouseMove4)
                    .on("mouseout", quintStreamAreaMouseOut4);
                var bars = self.svg5.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");

                var g = self.svg5.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);
                g.append("path")
                g.append('g')
                    .attr('transform', `translate(0,${height_bigger})`)
                    .call(xAxis);
                self.svg5.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .call(yAxis2);
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => height_bigger - y2(d.q5_pretax) - 20)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y2(d.q5_pretax) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver5)
                    .on("mousemove", quintStreamAreaMouseMove5)
                    .on("mouseout", quintStreamAreaMouseOut5);
                var bars = self.svg5.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => height_bigger - y2(d.q5_core) - 20)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y2(d.q5_core) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                    .on("mouseover", quintStreamAreaMouseOver5)
                    .on("mousemove", quintStreamAreaMouseMove5)
                    .on("mouseout", quintStreamAreaMouseOut5);
                var bars = self.svg5.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y2(d.q5_pretax - d.q5_core) + margin.top)
                    .attr('fill', 'black');
                var bars = self.svg5.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', height_bigger)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", quintStreamAreaMouseOver5)
                    .on("mousemove", quintStreamAreaMouseMove5)
                    .on("mouseout", quintStreamAreaMouseOut5);
                bars.append('circle')
                    .attr('cx', 275)
                    .attr('cy', 105)
                    .attr('r', 10)
                    .style("stroke", 'black')
                    .style("fill", "none")
                    .style("stroke-width", '2px')
                    .on("mouseover", quintStreamAreaMouseOver5)
                    .on("mousemove", quintStreamAreaMouseMove5)
                    .on("mouseout", quintStreamAreaMouseOut5);
                bars.append('circle')
                    .attr('cx', 155)
                    .attr('cy', 10)
                    .attr('r', 10)
                    .style("stroke", 'black')
                    .style("fill", "none")
                    .style("stroke-width", '2px')
                    .on("mouseover", quintStreamAreaMouseOver5)
                    .on("mousemove", quintStreamAreaMouseMove5)
                    .on("mouseout", quintStreamAreaMouseOut5);
                bars.append('text')
                    .attr('dx', 168)
                    .attr('dy', 10)
                    .text('And the Rich')
                    .on("mouseover", quintStreamAreaMouseOver5)
                    .on("mousemove", quintStreamAreaMouseMove5)
                    .on("mouseout", quintStreamAreaMouseOut5);
                bars.append('text')
                    .attr('dx', 168)
                    .attr('dy', 23)
                    .text('Get Richer')
                    .on("mouseover", quintStreamAreaMouseOver5)
                    .on("mousemove", quintStreamAreaMouseMove5)
                    .on("mouseout", quintStreamAreaMouseOut5);
                bars.append('text')
                    .attr('dx', 150)
                    .attr('dy', 15)
                    .text('2')
                    .on("mouseover", quintStreamAreaMouseOver5)
                    .on("mousemove", quintStreamAreaMouseMove5)
                    .on("mouseout", quintStreamAreaMouseOut5);
            });
    };
    //Mouseover
    function quintStreamAreaMouseOver1(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var quintStreamArea = self.mainChart1.selectAll(".quint-area");
        self.obscureALlExceptByObj(quintStreamArea._groups[0], this, 250, 0.4);
    };

    function quintStreamAreaMouseOver2(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var quintStreamArea = self.mainChart2.selectAll(".quint-area");
        self.obscureALlExceptByObj(quintStreamArea._groups[0], this, 250, 0.4);
    };

    function quintStreamAreaMouseOver3(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var quintStreamArea = self.mainChart3.selectAll(".quint-area");
        self.obscureALlExceptByObj(quintStreamArea._groups[0], this, 250, 0.4);
    };

    function quintStreamAreaMouseOver4(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var quintStreamArea = self.mainChart4.selectAll(".quint-area");
        self.obscureALlExceptByObj(quintStreamArea._groups[0], this, 250, 0.4);
    };

    function quintStreamAreaMouseOver5(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var quintStreamArea = self.mainChart5.selectAll(".quint-area");
        self.obscureALlExceptByObj(quintStreamArea._groups[0], this, 250, 0.4);
    };
    //Helps with updates but only needs to be defined oncellchange
    function updateTooltip(x, y, tooltipObj, tooltip) { //Sets Placement of bar
        tooltip.classed("hidden", false)
            .style("left", x + 30 + "px")
            .style("top", y - 170 + "px")
            .selectAll("p")
            .data(tooltipObj)
            .text(function(d) {
                return d
            })
    };

    //Changes as the mouse moves. Tied to the writing that appears on each of the 5
    function quintStreamAreaMouseMove1(selected, i) {
        if (!self.isMouseActive || selected == undefined) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine1(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = quintTooltipObj1(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj, self.tooltip1);
    };

    //Creating the writing for each of the 5
    function quintTooltipObj1(selected, x) {
        var intro = selected.date.getFullYear() + ": Quintile 1"
        var difference = "Income-Expense (I-E) Difference: $" + (parseInt(selected.q1_pretax - selected.q1_core));
        var change = "Change in I-E since 2007: $" + (parseInt(selected.q1_pretax - selected.q1_core) + 5505);
        var income = "Pre-Tax Income: $" + parseInt(selected.q1_pretax);
        var expense = "Core Expenses: $" + parseInt(selected.q1_core);

        return [intro, difference, change, income, expense];
    };

    //The functions for frame 2
    function quintStreamAreaMouseMove2(selected, i) {
        if (!self.isMouseActive || selected == undefined) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine2(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = quintTooltipObj2(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj, self.tooltip2);
    };

    function quintTooltipObj2(selected, x) {
        var intro = selected.date.getFullYear() + ": Quintile 2"
        var difference = "Income-Expense Difference: $" + (parseInt(selected.q2_pretax - selected.q2_core));
        var change = "Change in I-E since 2007: $" + (parseInt(selected.q2_pretax - selected.q2_core) - 3859);
        var income = "Pre-Tax Income: $" + parseInt(selected.q2_pretax);
        var expense = "Core Expenses: $" + parseInt(selected.q2_core);

        return [intro, difference, change, income, expense];
    };
    //The functions for frame 3
    function quintStreamAreaMouseMove3(selected, i) {
        if (!self.isMouseActive || selected == undefined) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine3(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = quintTooltipObj3(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj, self.tooltip3);
    };

    function quintTooltipObj3(selected, x) {
        var intro = selected.date.getFullYear() + ": Quintile 3"
        var difference = "Income-Expense Difference: $" + (parseInt(selected.q3_pretax - selected.q3_core));
        var change = "Change in I-E since 2007: $" + (parseInt(selected.q3_pretax - selected.q3_core) - 15391);
        var income = "Pre-Tax Income: $" + parseInt(selected.q3_pretax);
        var expense = "Core Expenses: $" + parseInt(selected.q3_core);

        return [intro, difference, change, income, expense];
    };
    //The functions for frame 4
    function quintStreamAreaMouseMove4(selected, i) {
        if (!self.isMouseActive || selected == undefined) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine4(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = quintTooltipObj4(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj, self.tooltip4);
    };

    function quintTooltipObj4(selected, x) {
        var intro = selected.date.getFullYear() + ": Quintile 5"
        var difference = "Income-Expense Difference: $" + (parseInt(selected.q4_pretax - selected.q4_core));
        var change = "Change in I-E since 2007: $" + (parseInt(selected.q4_pretax - selected.q4_core) - 31875);
        var income = "Pre-Tax Income: $" + parseInt(selected.q4_pretax);
        var expense = "Core Expenses: $" + parseInt(selected.q4_core);

        return [intro, difference, change, income, expense];
    };
    //The functions for frame 5
    function quintStreamAreaMouseMove5(selected, i) {
        if (!self.isMouseActive || selected == undefined) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine5(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = quintTooltipObj5(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj, self.tooltip5);
    };

    function quintTooltipObj5(selected, x) {
        var intro = selected.date.getFullYear() + ": Quintile 5"
        var difference = "Income-Expense Difference: $ $" + (parseInt(selected.q5_pretax - selected.q5_core));
        var change = "Change in I-E since 2007: $" + (parseInt(selected.q5_pretax - selected.q5_core) - 96377);
        var income = "Pre-Tax Income: $ $" + parseInt(selected.q5_pretax);
        var expense = "Core Expenses: $ $" + parseInt(selected.q5_core);

        return [intro, difference, change, income, expense];
    };

    //Mouseout
    function quintStreamAreaMouseOut1(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var quintStreamArea = self.mainChart1.select(".quint-area");
        self.unobscureAll(quintStreamArea, 250);

        hideTooltip1();
        hideFocusLine1();
        hideFocusCircle1();
    };

    function quintStreamAreaMouseOut2(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var quintStreamArea = self.mainChart2.select(".quint-area");
        self.unobscureAll(quintStreamArea, 250);

        hideTooltip2();
        hideFocusLine2();
        hideFocusCircle2();
    };

    function quintStreamAreaMouseOut3(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var quintStreamArea = self.mainChart3.select(".quint-area");
        self.unobscureAll(quintStreamArea, 250);

        hideTooltip3();
        hideFocusLine3();
        hideFocusCircle3();
    };

    function quintStreamAreaMouseOut4(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var quintStreamArea = self.mainChart4.select(".quint-area");
        self.unobscureAll(quintStreamArea, 250);

        hideTooltip4();
        hideFocusLine4();
        hideFocusCircle4();
    };

    function quintStreamAreaMouseOut5(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var quintStreamArea = self.mainChart5.select(".quint-area");
        self.unobscureAll(quintStreamArea, 250);

        hideTooltip5();
        hideFocusLine5();
        hideFocusCircle5();
    };
    //Moving the focus line
    function updateFocusLine1(mouseX, focueLine) { //Moving Line
        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        self.focueLine1.attr("x1", mouseX)
            .attr("y1", MARGIN.top)
            .attr("x2", mouseX)
            .attr("y2", MARGIN.top + SVG_HEIGHT + 35 + 100)
            .attr("opacity", 1);
    };

    function updateFocusLine2(mouseX) { //Moving Line
        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        self.focueLine2.attr("x1", mouseX)
            .attr("y1", MARGIN.top)
            .attr("x2", mouseX)
            .attr("y2", MARGIN.top + SVG_HEIGHT + 35 + 100)
            .attr("opacity", 1);
    };

    function updateFocusLine3(mouseX) { //Moving Line
        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        self.focueLine3.attr("x1", mouseX)
            .attr("y1", MARGIN.top)
            .attr("x2", mouseX)
            .attr("y2", MARGIN.top + SVG_HEIGHT + 35 + 100)
            .attr("opacity", 1);
    };

    function updateFocusLine4(mouseX) { //Moving Line
        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        self.focueLine4.attr("x1", mouseX)
            .attr("y1", MARGIN.top)
            .attr("x2", mouseX)
            .attr("y2", MARGIN.top + SVG_HEIGHT + 35 + 100)
            .attr("opacity", 1);
    };

    function updateFocusLine5(mouseX) { //Moving Line
        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        self.focueLine5.attr("x1", mouseX)
            .attr("y1", MARGIN.top)
            .attr("x2", mouseX)
            .attr("y2", MARGIN.top + SVG_HEIGHT + 35 + 100)
            .attr("opacity", 1);
    };

    //Hiding things after the scroll outs
    function hideFocusLine1() {
        self.focueLine1.attr("opacity", 0);
    };

    function hideFocusCircle1() {
        self.focueCircle1.attr("opacity", 0);
    };

    function hideTooltip1() {
        self.tooltip1.classed("hidden", true);
    };

    function hideFocusLine2() {
        self.focueLine2.attr("opacity", 0);
    };

    function hideFocusCircle2() {
        self.focueCircle2.attr("opacity", 0);
    };

    function hideTooltip2() {
        self.tooltip2.classed("hidden", true);
    };

    function hideFocusLine3() {
        self.focueLine3.attr("opacity", 0);
    };

    function hideFocusCircle3() {
        self.focueCircle3.attr("opacity", 0);
    };

    function hideTooltip3() {
        self.tooltip3.classed("hidden", true);
    };

    function hideFocusLine4() {
        self.focueLine4.attr("opacity", 0);
    };

    function hideFocusCircle4() {
        self.focueCircle4.attr("opacity", 0);
    };

    function hideTooltip4() {
        self.tooltip4.classed("hidden", true);
    };

    function hideFocusLine5() {
        self.focueLine5.attr("opacity", 0);
    };

    function hideFocusCircle5() {
        self.focueCircle5.attr("opacity", 0);
    };

    function hideTooltip5() {
        self.tooltip5.classed("hidden", true);
    };

    function createLegend() {
        var info_svg = d3.select('#quint_info');
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'underline size20')
            .attr('dx', 50)
            .attr('dy', 20)
            .text('QUINTILE LEGEND');
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold underline')
            .attr('dx', 5)
            .attr('dy', 40)
            .text('Column Height:');
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'underline')
            .attr('dx', 5)
            .attr('dy', 55)
            .text('Mean (in $) of Income/Expense');
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 70)
            .attr('dy', 70)
            .text('by Quintile per Year');
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 85)
            .attr('width', 24)
            .attr('height', 24)
            .style('fill', 'blue')
            .style('fill-opacity', 0.35);
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('dx', 33)
            .attr('dy', 103)
            .text("Surplus");
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 93)
            .attr('dy', 103)
            .text("income after core expenses");
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 125)
            .attr('width', 24)
            .attr('height', 24)
            .style('fill', 'red')
            .style('fill-opacity', 0.35);
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('dx', 33)
            .attr('dy', 143)
            .text("Deficit");
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 83)
            .attr('dy', 143)
            .text("of income minus core expenses");
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 165)
            .attr('width', 24)
            .attr('height', 24)
            .style('fill', 'blue')
            .style('fill-opacity', 0.35);
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 165)
            .attr('width', 24)
            .attr('height', 24)
            .style('fill', 'red')
            .style('fill-opacity', 0.35);
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('dx', 33)
            .attr('dy', 183)
            .text("Overlap");
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 93)
            .attr('dy', 183)
            .text("of income and expenses");
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 208)
            .attr('width', 24)
            .attr('height', 3)
            .style('fill', 'black')
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('dx', 33)
            .attr('dy', 213)
            .text("Yearly Income-Expense Difference");
        var g = info_svg.append('g')
            .append('circle')
            .attr('cx', 18)
            .attr('cy', 233)
			.attr('r', 10)
			  .style("stroke", 'black')
			  .style("fill", "none")
			  .style("stroke-width", '2px');
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('x', 33)
            .attr('y', 238)
            .text("Key Takeaway");
    };
};

QuintilesVis.prototype.getInvertedX = Shared.getInvertedX;
QuintilesVis.prototype.getValueSum = Shared.getValueSum;
QuintilesVis.prototype.obscureAll = Shared.obscureAll;
QuintilesVis.prototype.unobscureAll = Shared.unobscureAll;
QuintilesVis.prototype.obscureALlExceptByIndex = Shared.obscureALlExceptByIndex;
QuintilesVis.prototype.obscureALlExceptByObj = Shared.obscureALlExceptByObj;

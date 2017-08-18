var DebtVis = function(DebtPath) {
    var dateFmt = d3.timeParse("%m/%d/%Y");
    var dateFmt2 = d3.timeParse("%m/%Y");
    const parseDate = d3.timeParse("%m/%d/%Y");
    const SVG_HEIGHT = 195;
    const SVG_HEIGHT_BIGGER = 400;
    const SVG_WIDTH = 300;
    var MARGIN = {
        top: 5,
        right: 5,
        bottom: 30,
        left: 30
    };
    const MAIN_CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
    const MAIN_CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
    const BIGGER_CHART_HEIGHT = SVG_HEIGHT_BIGGER - MARGIN.top - MARGIN.bottom;
    // Define class variables
    var self = this;
    self.debtData;
    self.debtData1;
    self.debtData2;
    self.debtData3;
    self.debtData4;
    self.debtData5;
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
    self.debt_takeaway_svg;
    self.debt_takeaway_container;
    self.debt_takeaway_chart;
	self.label_svg;
	self.label_container;
	self.debt_takeaway_svg;
	self.debt_takeaway_container;
	self.debt_takeaway_chart;
    createSectionContainer1(self.debtData1);
    createSectionContainer2();
    createSectionContainer3();
    createSectionContainer4();
    createSectionContainer5();
    createDebtTakeaways();
    buildDebtData(DebtPath);
		createLabelContainer();
    createLegend();
    var keys = ['q1_core', 'q1_pretax', 'q2_core', 'q2_pretax', 'q3_core', 'q3_pretax', 'q4_core', 'q4_pretax', 'q5_core', 'q5_pretax']
    var keys1 = ['total_consumer_change', 'mortgage_change'];
    var keys2 = ['total_consumer_change', 'heloc_change'];
    var keys3 = ['total_consumer_change', 'student_change'];
    var keys4 = ['total_consumer_change', 'credit_change'];
    var keys5 = ['total_consumer_change', 'auto_change'];
    /** Define private functions. */
    function buildDebtData(DebtPath) { //Loads Stock Data
        d3.csv(DebtPath,
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
                parseDebtData(rawData, keys1, keys2, keys3, keys4, keys5);
                self.dataLength = 42; //Setting number of data pointsa);
            });
    };
    function createLabelContainer() {
        self.label_container = d3.select("#debtlabel")
            .append("div")
        self.label_svg = self.label_container.append("svg")
            .attr("width", 230)
            .attr("height", 500)
   	  self.label_svg.append('text')
		  .attr('dx', 160)
		  .attr('dy', 90)
		  .text("% Change");
   	  self.label_svg.append('text')
		  .attr('dx', 160)
		  .attr('dy', 110)
		  .text("in debt");
   	  self.label_svg.append('text')
		  .attr('dx', 160)
		  .attr('dy', 130)
		  .text("since 2007");
   	  self.label_svg.append('text')
		  .attr('dx', 160)
		  .attr('dy', 320)
		  .text("% Change");
   	  self.label_svg.append('text')
		  .attr('dx', 160)
		  .attr('dy', 340)
		  .text("in debt");
   	  self.label_svg.append('text')
		  .attr('dx', 160)
		  .attr('dy', 360)
		  .text("since 2007");
	};

    function parseDebtData(input, keys1, keys2, keys3, keys4, keys5) {
        var output1 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currMonth = parseDate(input[i].date).getMonth(), //Sets the month count
                priorMonth = parseDate(input[i - 1].date).getMonth();
            if (currMonth != priorMonth) {
                var num = i - start;
                var obj = {}
                keys1.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
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
        obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
        output1.push(obj);
        self.debtData1 = output1;

        var output2 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currMonth = parseDate(input[i].date).getMonth(), //Sets the month count
                priorMonth = parseDate(input[i - 1].date).getMonth();
            if (currMonth != priorMonth) {
                var num = i - start;
                var obj = {}
                keys2.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
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
        obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
        output2.push(obj);
        self.debtData2 = output2;

        var output3 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currMonth = parseDate(input[i].date).getMonth(), //Sets the month count
                priorMonth = parseDate(input[i - 1].date).getMonth();
            if (currMonth != priorMonth) {
                var num = i - start;
                var obj = {}
                keys3.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
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
        obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
        output3.push(obj);
        self.debtData3 = output3;

        var output4 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currMonth = parseDate(input[i].date).getMonth(), //Sets the month count
                priorMonth = parseDate(input[i - 1].date).getMonth();
            if (currMonth != priorMonth) {
                var num = i - start;
                var obj = {}
                keys4.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
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
        obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
        output4.push(obj);
        self.debtData4 = output4;

        var output5 = [];
        var start = 0;
        for (var i = 1; i < input.length; i++) {
            var currMonth = parseDate(input[i].date).getMonth(), //Sets the month count
                priorMonth = parseDate(input[i - 1].date).getMonth();
            if (currMonth != priorMonth) {
                var num = i - start;
                var obj = {}
                keys5.forEach(function(key) {
                    obj[key] = input.slice(start, i).reduce(function(sum, item) {
                        return sum + item[key] / num;
                    }, 0);
                });
                obj.date = parseDate(input[i - 1].date);
                obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
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
        obj.date = new Date(obj.date.getFullYear(), obj.date.getMonth() + 1, 0);
        output5.push(obj);
        self.debtData5 = output5;
    };

    function createSectionContainer1() {
        self.container1 = d3.select("#debt1")
            .append("div")
            .attr("class", "section2-container")
        self.svg1 = self.container1.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT);
        self.mainChart1 = self.svg1.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        self.tooltip1 = self.container1 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip1.append("p")
            .attr("class", "emphasize");
        self.tooltip1.append("p")
            .attr("class", "emphasize");
        self.tooltip1.append("p");
        self.tooltip1.append("br");
        self.tooltip1.append("p")
            .attr("class", "underline bold");
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
        self.container2 = d3.select("#debt2")
            .append("div")
            .attr("class", "section2-container")
        self.svg2 = self.container2.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT);
        self.mainChart2 = self.svg2.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        self.tooltip2 = self.container2 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip2.append("p")
            .attr("class", "emphasize");
        self.tooltip2.append("p")
            .attr("class", "emphasize");
        self.tooltip2.append("p");
        self.tooltip2.append("br");
        self.tooltip2.append("p")
            .attr("class", "underline bold");
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
        self.container3 = d3.select("#debt3")
            .append("div")
            .attr("class", "section2-container")
        self.svg3 = self.container3.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT_BIGGER);
        self.mainChart3 = self.svg3.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        self.tooltip3 = self.container3 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip3.append("p")
            .attr("class", "emphasize");
        self.tooltip3.append("p")
            .attr("class", "emphasize");
        self.tooltip3.append("p");
        self.tooltip3.append("br");
        self.tooltip3.append("p")
            .attr("class", "underline bold");
        self.tooltip1.append("p");
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
        self.container4 = d3.select("#debt4")
            .append("div")
            .attr("class", "section2-container")
        self.svg4 = self.container4.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT);
        self.mainChart4 = self.svg4.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        self.tooltip4 = self.container4 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip4.append("p")
            .attr("class", "emphasize");
        self.tooltip4.append("p")
            .attr("class", "emphasize");
        self.tooltip4.append("p");
        self.tooltip4.append("br");
        self.tooltip4.append("p")
            .attr("class", "underline bold");
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
        self.container5 = d3.select("#debt5")
            .append("div")
            .attr("class", "section2-container")
        self.svg5 = self.container5.append("svg")
            .attr("width", SVG_WIDTH)
            .attr("height", SVG_HEIGHT);
        self.mainChart5 = self.svg5.append("g")
            .attr("class", "main-chart")
            .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        self.tooltip5 = self.container5 //d3.select("body")
            .append("div")
            .attr("class", "tooltip hidden")
        self.tooltip5.append("p")
            .attr("class", "emphasize");
        self.tooltip5.append("p")
            .attr("class", "emphasize");
        self.tooltip5.append("p");
        self.tooltip5.append("br");
        self.tooltip5.append("p")
            .attr("class", "underline bold");
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

    function createDebtTakeaways() {
        self.debt_takeaway_container = d3.select("#debt_takeaways")
            .append("div")
        self.debt_takeaway_svg = self.debt_takeaway_container.append("svg")
            .attr("width", 310)
            .attr("height", 450)
        self.debt_takeaway_chart = self.debt_takeaway_svg.append("g")
            .attr("transform", "translate(" + MARGIN.top + ")")
        self.debt_takeaway_chart.append("rect")
                    .attr('width', 285)
                    .attr('height', 450)
                    .attr('x', 0)
                    .attr("y", 20)
                    .attr('fill', 'rgba(182, 195, 184, 0.2)');
        self.debt_takeaway_chart.append("text")
					.attr("class", "insights-header")
                    .attr('x', 30)
                    .attr("y", 55)
                    .text("Key Insights");
        self.debt_takeaway_chart.append("rect")
                    .attr('x', 30)
                    .attr("y", 70)
                    .attr('height', 1)
                    .attr("width", 200);
        self.debt_takeaway_chart.append("circle")
					.attr('cx', 35)
					.attr('cy', 100)
					.attr('r', 10)
					  .style("stroke", 'black')
					  .style("fill", "none")
					  .style("stroke-width", '2px')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 30)
					.attr('dy', 105)
					.text('1')
		self.debt_takeaway_chart.append('text')
					.attr("class", "underline")
					.attr('dx', 50)
					.attr('dy', 105)
					  .text("Mortgage Debt Rebounds");
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 130)
					.text('Mortgage debt passes 2007 levels after')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 145)
					.text('being the trigger of the Great Recession.')

        self.debt_takeaway_chart.append("circle")
					.attr('cx', 35)
					.attr('cy', 170)
					.attr('r', 10)
					  .style("stroke", 'black')
					  .style("fill", "none")
					  .style("stroke-width", '2px');
		self.debt_takeaway_chart.append('text')
					.attr('dx', 30)
					.attr('dy', 175)
					.attr('class', 'bold')
					.text('2')
	self.debt_takeaway_chart.append('text')
					.attr("class", "underline bold")
					.attr('dx', 50)
					.attr('dy', 175)
					.text('Student Loan Debt SKYROCKETS')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 205)
					.text('Student loan debt has more than')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 220)
					.attr('class', 'underline bold')
					.text('doubled ')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 85)
					.attr('dy', 220)
					.text(' since 2007.')

        self.debt_takeaway_chart.append("circle")
					.attr('cx', 35)
					.attr('cy', 245)
					.attr('r', 10)
					  .style("stroke", 'black')
					  .style("fill", "none")
					  .style("stroke-width", '2px');
		self.debt_takeaway_chart.append('text')
					.attr('dx', 30)
					.attr('dy', 250)
					.text('3')
	self.debt_takeaway_chart.append('text')
					.attr("class", "underline")
					.attr('dx', 50)
					.attr('dy', 245)
					.text('Credit Card Debt also rebounds')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 275)
					.text('Credit Card just passed the 2007 mark')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 290)
					.text(' weeks before this was written.')


        self.debt_takeaway_chart.append("circle")
					.attr('cx', 35)
					.attr('cy', 325)
					.attr('r', 10)
					  .style("stroke", 'black')
					  .style("fill", "none")
					  .style("stroke-width", '2px');
		self.debt_takeaway_chart.append('text')
					.attr('dx', 30)
					.attr('dy', 330)
					.text('4')
	self.debt_takeaway_chart.append('text')
					.attr("class", "underline")
					.attr('dx', 50)
					.attr('dy', 325)
					.text('Auto Debt Recovered Early')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 350)
					.text('Auto lending was the first sector')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 365)
					.text('recover first after the recession.')

        self.debt_takeaway_chart.append("circle")
					.attr('cx', 35)
					.attr('cy', 390)
					.attr('r', 10)
					  .style("stroke", 'black')
					  .style("fill", "none")
					  .style("stroke-width", '2px');
		self.debt_takeaway_chart.append('text')
					.attr('dx', 30)
					.attr('dy', 395)
					.text('5')
	self.debt_takeaway_chart.append('text')
					.attr("class", "underline")
					.attr('dx', 50)
					.attr('dy', 390)
					.text('Auto Debt sees surges until 2017')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 415)
					.text('Auto lending sharply rose, fueled in part')
		self.debt_takeaway_chart.append('text')
					.attr('dx', 25)
					.attr('dy', 430)
					.text('by sub-prime (high risk & cost) lending.')
    };

    function createDebtChart() {
        d3.csv(DebtPath,
            function(d) {
                // This function is applied to each row of the dataset
                d.date = dateFmt(`${d.date}`);
                d.date2 = dateFmt2(`${d.date}`);
                d.mortgage_date = dateFmt(`${d.mortgage_date}`);
                d.mortgage_neg_date = dateFmt(`${d.mortgage_neg_date}`);
                d.heloc_date = dateFmt(`${d.heloc_date}`);
                d.heloc_neg_date = dateFmt(`${d.heloc_neg_date}`);
                d.auto_date = dateFmt(`${d.auto_date}`);
                d.auto_neg_date = dateFmt(`${d.auto_neg_date}`);
                d.credit_date = dateFmt(`${d.credit_date}`);
                d.credit_neg_date = dateFmt(`${d.credit_neg_date}`);
                d.total_date = dateFmt(`${d.total_date}`);
                d.total_neg_date = dateFmt(`${d.total_neg_date}`);
                return d;
            },
            function(err, data) {
                var margin = {
                    top: 5,
                    right: 1,
                    bottom: 30,
                    left: 30
                };
                var width = SVG_WIDTH - margin.left - margin.right;
                var height = SVG_HEIGHT - margin.top - margin.bottom;
                var height_bigger = SVG_HEIGHT_BIGGER - margin.top - margin.bottom;
                var x = d3.scaleTime()
                    .domain([new Date(2006, 10, 1), new Date(2017, 9, 1)])
                    .rangeRound([0, width]);
                var y = d3.scaleLinear()
                    .domain([-30, 50])
                    .rangeRound([height, 0]);
                var y2 = d3.scaleLinear()
                    .domain([-30, 170])
                    .rangeRound([height_bigger, 0]);
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

                var barWidth = MAIN_CHART_WIDTH * (1 / 42);
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
                    .attr('height', d => Math.max(0, height - y(d.mortgage_change) - y(20)))
                    .attr('x', d => x(d.mortgage_date) + margin.left)
                    .attr("y", d => y(d.mortgage_change) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.mortgage_date) + margin.left)
                    .attr("y", d => y(d.mortgage_change) + margin.top)
                    .attr('fill', 'blue');
                var bars = self.svg1.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(-1 * d.mort_neg) - y(20)))
                    .attr('x', d => x(d.mortgage_neg_date) + margin.left)
                    .attr("y", d => y(0) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.mortgage_neg_date) + margin.left)
                    .attr('y', d => y(0) + (height - y(-1 * d.mort_neg) - y(20)) + margin.top)
                    .attr('fill', 'blue');
                var bars = self.svg1.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(d.total_consumer_change) - y(20)))
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg1.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(-1 * d.total_neg) - y(20)))
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr("y", d => y(0) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr('y', d => y(0) + (height - y(-1 * d.total_neg) - y(20)) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg1.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height))
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", debtStreamAreaMouseOver1)
                    .on("mousemove", debtStreamAreaMouseMove1)
                    .on("mouseout", debtStreamAreaMouseOut1);
                bars.append('circle')
                    .attr('cx', 250)
                    .attr('cy', 145)
                    .attr('r', 10)
                    .style("stroke", 'black')
                    .style("fill", "none")
                    .style("stroke-width", '2px')
                    .on("mouseover", debtStreamAreaMouseOver1)
                    .on("mousemove", debtStreamAreaMouseMove1)
                    .on("mouseout", debtStreamAreaMouseOut1);
                bars.append('rect')
                    .attr('x', 250)
                    .attr('y', 115)
                    .attr('width', 2)
                    .attr('height', 20)
                    .on("mouseover", debtStreamAreaMouseOver1)
                    .on("mousemove", debtStreamAreaMouseMove1)
                    .on("mouseout", debtStreamAreaMouseOut1);
                bars.append('text')
                    .attr('dx', 170)
                    .attr('dy', 167)
                    .text('Return to 2007 level')
                    .on("mouseover", debtStreamAreaMouseOver1)
                    .on("mousemove", debtStreamAreaMouseMove1)
                    .on("mouseout", debtStreamAreaMouseOut1);
                bars.append('text')
                    .attr('dx', 245)
                    .attr('dy', 150)
                    .text('1')
                    .on("mouseover", debtStreamAreaMouseOver1)
                    .on("mousemove", debtStreamAreaMouseMove1)
                    .on("mouseout", debtStreamAreaMouseOut1);

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
                    .attr('height', d => Math.max(0, height - y(d.heloc_change) - y(20)))
                    .attr('x', d => x(d.heloc_date) + margin.left)
                    .attr("y", d => y(d.heloc_change) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.heloc_date) + margin.left)
                    .attr("y", d => y(d.heloc_change) + margin.top)
                    .attr('fill', 'blue');
                var bars = self.svg2.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(-1 * d.heloc_neg) - y(20)))
                    .attr('x', d => x(d.heloc_neg_date) + margin.left)
                    .attr("y", d => y(0) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.heloc_neg_date) + margin.left)
                    .attr('y', d => y(0) + (height - y(-1 * d.heloc_neg) - y(20)) + margin.top)
                    .attr('fill', 'blue');
                var bars = self.svg2.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(d.total_consumer_change) - y(20)))
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg2.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(-1 * d.total_neg) - y(20)))
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr("y", d => y(0) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr('y', d => y(0) + (height - y(-1 * d.total_neg) - y(20)) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg2.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height))
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", debtStreamAreaMouseOver2)
                    .on("mousemove", debtStreamAreaMouseMove2)
                    .on("mouseout", debtStreamAreaMouseOut2);


                var bars = self.svg3.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                var g = self.svg3.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);
                g.append("path")
                g.append('g')
                    .attr('transform', `translate(0,${height_bigger})`)
                    .call(xAxis);
                self.svg3.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .call(yAxis2);
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height_bigger - y2(d.student_change) - y2(140)))
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y2(d.student_change) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => y2(d.student_change) + margin.top)
                    .attr('fill', 'blue');
                var bars = self.svg3.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height_bigger - y2(d.total_consumer_change) - y2(140)))
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y2(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y2(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg3.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height_bigger - y2(-1 * d.total_neg) - y2(140)))
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr("y", d => y2(0) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr('y', d => y2(0) + (height_bigger - y2(-1 * d.total_neg) - y2(140)) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg3.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height_bigger))
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", debtStreamAreaMouseOver3)
                    .on("mousemove", debtStreamAreaMouseMove3)
                    .on("mouseout", debtStreamAreaMouseOut3);
                bars.append('circle')
                    .attr('cx', 95)
                    .attr('cy', 135)
                    .attr('r', 10)
                    .style("stroke", 'black')
                    .style("fill", "none")
                    .style("stroke-width", '2px')
                    .on("mouseover", debtStreamAreaMouseOver3)
                    .on("mousemove", debtStreamAreaMouseMove3)
                    .on("mouseout", debtStreamAreaMouseOut3);
                bars.append('text')
                    .attr('dx', 35)
                    .attr('dy', 115)
                    .text('Massive Debt Surge')
                    .on("mouseover", debtStreamAreaMouseOver3)
                    .on("mousemove", debtStreamAreaMouseMove3)
                    .on("mouseout", debtStreamAreaMouseOut3);
                bars.append('text')
                    .attr('dx', 90)
                    .attr('dy', 140)
                    .text('2')
                    .on("mouseover", debtStreamAreaMouseOver3)
                    .on("mousemove", debtStreamAreaMouseMove3)
                    .on("mouseout", debtStreamAreaMouseOut3);
                bars.append('text')
                    .attr('dx', 35)
                    .attr('dy', 165)
                    .text('No effect from crash')
                    .on("mouseover", debtStreamAreaMouseOver3)
                    .on("mousemove", debtStreamAreaMouseMove3)
                    .on("mouseout", debtStreamAreaMouseOut3);

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
                    .attr('height', d => Math.max(0, height - y(d.credit_change) - y(20)))
                    .attr('x', d => x(d.credit_date) + margin.left)
                    .attr("y", d => y(d.credit_change) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.credit_date) + margin.left)
                    .attr("y", d => y(d.credit_change) + margin.top)
                    .attr('fill', 'blue');
                var bars = self.svg4.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(-1 * d.credit_neg) - y(20)))
                    .attr('x', d => x(d.credit_neg_date) + margin.left)
                    .attr("y", d => y(0) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.credit_neg_date) + margin.left)
                    .attr('y', d => y(0) + (height - y(-1 * d.credit_neg) - y(20)) + margin.top)
                    .attr('fill', 'blue');
                var bars = self.svg4.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(d.total_consumer_change) - y(20)))
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg4.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(-1 * d.total_neg) - y(20)))
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr("y", d => y(0) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr('y', d => y(0) + (height - y(-1 * d.total_neg) - y(20)) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg4.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height))
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", debtStreamAreaMouseOver4)
                    .on("mousemove", debtStreamAreaMouseMove4)
                    .on("mouseout", debtStreamAreaMouseOut4);
                bars.append('circle')
                    .attr('cx', 285)
                    .attr('cy', 145)
                    .attr('r', 10)
                    .style("stroke", 'black')
                    .style("fill", "none")
                    .style("stroke-width", '2px')
                    .on("mouseover", debtStreamAreaMouseOver4)
                    .on("mousemove", debtStreamAreaMouseMove4)
                    .on("mouseout", debtStreamAreaMouseOut4);
                bars.append('rect')
                    .attr('x', 285)
                    .attr('y', 115)
                    .attr('width', 2)
                    .attr('height', 20)
                    .on("mouseover", debtStreamAreaMouseOver4)
                    .on("mousemove", debtStreamAreaMouseMove4)
                    .on("mouseout", debtStreamAreaMouseOut4);
                bars.append('text')
                    .attr('dx', 170)
                    .attr('dy', 167)
                    .text('Return to 2007 level')
                    .on("mouseover", debtStreamAreaMouseOver4)
                    .on("mousemove", debtStreamAreaMouseMove4)
                    .on("mouseout", debtStreamAreaMouseOut4);
                bars.append('text')
                    .attr('dx', 280)
                    .attr('dy', 150)
                    .text('3')
                    .on("mouseover", debtStreamAreaMouseOver4)
                    .on("mousemove", debtStreamAreaMouseMove4)
                    .on("mouseout", debtStreamAreaMouseOut4);

                var bars = self.svg5.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                var g = self.svg5.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);
                g.append("path")
                g.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(xAxis);
                self.svg5.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .call(yAxis);

                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(d.auto_change) - y(20)))
                    .attr('x', d => x(d.auto_date) + margin.left)
                    .attr("y", d => y(d.auto_change) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.auto_date) + margin.left)
                    .attr("y", d => y(d.auto_change) + margin.top)
                    .attr('fill', 'blue');
                var bars = self.svg5.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(-1 * d.auto_neg) - y(20)))
                    .attr('x', d => x(d.auto_neg_date) + margin.left)
                    .attr("y", d => y(0) + margin.top)
                    .attr('fill', 'blue')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.auto_neg_date) + margin.left)
                    .attr('y', d => y(0) + (height - y(-1 * d.auto_neg) - y(20)) + margin.top)
                    .attr('fill', 'blue');
                var bars = self.svg5.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(d.total_consumer_change) - y(20)))
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_date) + margin.left)
                    .attr("y", d => y(d.total_consumer_change) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg5.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height - y(-1 * d.total_neg) - y(20)))
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr("y", d => y(0) + margin.top)
                    .attr('fill', 'red')
                    .attr('opacity', '0.35')
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', 2)
                    .attr('x', d => x(d.total_neg_date) + margin.left)
                    .attr('y', d => y(0) + (height - y(-1 * d.total_neg) - y(20)) + margin.top)
                    .attr('fill', 'red');
                var bars = self.svg5.append("g")
                    .selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g");
                bars.append("rect")
                    .attr("class", "quint-area")
                    .attr('width', barWidth)
                    .attr('height', d => Math.max(0, height))
                    .attr('x', d => x(d.date) + margin.left)
                    .attr("y", d => 0)
                    .attr('fill', 'red')
                    .attr('opacity', '0')
                    .on("mouseover", debtStreamAreaMouseOver5)
                    .on("mousemove", debtStreamAreaMouseMove5)
                    .on("mouseout", debtStreamAreaMouseOut5);

                bars.append('circle')
                    .attr('cx', 135)
                    .attr('cy', 157)
                    .attr('r', 10)
                    .style("stroke", 'black')
                    .style("fill", "none")
                    .style("stroke-width", '2px')
                    .on("mouseover", debtStreamAreaMouseOver5)
                    .on("mousemove", debtStreamAreaMouseMove5)
                    .on("mouseout", debtStreamAreaMouseOut5);
                bars.append('rect')
                    .attr('x', 133)
                    .attr('y', 137)
                    .attr('width', 2)
                    .attr('height', 10)
                    .on("mouseover", debtStreamAreaMouseOver5)
                    .on("mousemove", debtStreamAreaMouseMove5)
                    .on("mouseout", debtStreamAreaMouseOut5);
                bars.append('text')
                    .attr('dx', 150)
                    .attr('dy', 162)
                    .text('Early trough')
                    .on("mouseover", debtStreamAreaMouseOver5)
                    .on("mousemove", debtStreamAreaMouseMove5)
                    .on("mouseout", debtStreamAreaMouseOut5);
                bars.append('text')
                    .attr('dx', 130)
                    .attr('dy', 162)
                    .text('4')
                    .on("mouseover", debtStreamAreaMouseOver5)
                    .on("mousemove", debtStreamAreaMouseMove5)
                    .on("mouseout", debtStreamAreaMouseOut5);

                bars.append('circle')
                    .attr('cx', 225)
                    .attr('cy', 45)
                    .attr('r', 10)
                    .style("stroke", 'black')
                    .style("fill", "none")
                    .style("stroke-width", '2px')
                    .on("mouseover", debtStreamAreaMouseOver5)
                    .on("mousemove", debtStreamAreaMouseMove5)
                    .on("mouseout", debtStreamAreaMouseOut5);
                bars.append('rect')
                    .attr('x', 235)
                    .attr('y', 45)
                    .attr('width', 20)
                    .attr('height', 2)
                    .on("mouseover", debtStreamAreaMouseOver5)
                    .on("mousemove", debtStreamAreaMouseMove5)
                    .on("mouseout", debtStreamAreaMouseOut5);
                bars.append('text')
                    .attr('dx', 140)
                    .attr('dy', 25)
                    .text('Quick increase')
                    .on("mouseover", debtStreamAreaMouseOver5)
                    .on("mousemove", debtStreamAreaMouseMove5)
                    .on("mouseout", debtStreamAreaMouseOut5);
                bars.append('text')
                    .attr('dx', 220)
                    .attr('dy', 50)
                    .text('5')
                    .on("mouseover", debtStreamAreaMouseOver5)
                    .on("mousemove", debtStreamAreaMouseMove5)
                    .on("mouseout", debtStreamAreaMouseOut5);


            });
    };
    //Mouseover
    function debtStreamAreaMouseOver1(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var debtStreamArea = self.mainChart1.selectAll(".quint-area");
        self.obscureALlExceptByObj(debtStreamArea._groups[0], this, 250, 0.4);
    };

    function debtStreamAreaMouseOver2(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var debtStreamArea = self.mainChart2.selectAll(".quint-area");
        self.obscureALlExceptByObj(debtStreamArea._groups[0], this, 250, 0.4);
    };

    function debtStreamAreaMouseOver3(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var debtStreamArea = self.mainChart3.selectAll(".quint-area");
        self.obscureALlExceptByObj(debtStreamArea._groups[0], this, 250, 0.4);
    };

    function debtStreamAreaMouseOver4(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var debtStreamArea = self.mainChart4.selectAll(".quint-area");
        self.obscureALlExceptByObj(debtStreamArea._groups[0], this, 250, 0.4);
    };

    function debtStreamAreaMouseOver5(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var debtStreamArea = self.mainChart5.selectAll(".quint-area");
        self.obscureALlExceptByObj(debtStreamArea._groups[0], this, 250, 0.4);
    };
    //Helps with updates but only needs to be defined oncellchange
    function updateTooltip(x, y, tooltipObj, tooltip) { //Sets Placement of bar
        tooltip.classed("hidden", false)
            .style("left", x + 30 + "px")
            .style("top", y - 100 + "px")
            .selectAll("p")
            .data(tooltipObj)
            .text(function(d) {
                return d
            })
    };

    //Helps with updates but only needs to be defined oncellchange
    function updateTooltip2(x, y, tooltipObj, tooltip) { //Sets Placement of bar
        tooltip.classed("hidden", false)
            .style("left", x + 30 + "px")
            .style("top", y - 100 + "px")
            .selectAll("p")
            .data(tooltipObj)
            .text(function(d) {
                return d
            })
    };
    //Changes as the mouse moves. Tied to the writing that appears on each of the 5
    function debtStreamAreaMouseMove1(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine1(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = debtTooltipObj1(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj, self.tooltip1);
    };

    //	obj.date.getFullYear(), obj.date.getMonth()

    //Creating the writing for each of the 5
    function debtTooltipObj1(selected, x) {

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

        var date = selected.date.getFullYear() + " " + month[selected.date.getMonth()]
        var intro = "Mortgage Debt";
        var intro2 = "(in % compared to Jan-2007)"
        var mortgage = "% Change in Mort. Debt:" + parseFloat(selected.mortgage_change) + "%"
        var consumer = "% Change in Total Debt:" + parseFloat(selected.total_consumer_change) + "%";

        return [date, intro, intro2, mortgage, consumer];
    };


    //The functions for frame 2
    function debtStreamAreaMouseMove2(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine2(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = debtTooltipObj2(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj, self.tooltip2);
    };

    function debtTooltipObj2(selected, x) {
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

        var date = selected.date.getFullYear() + " " + month[selected.date.getMonth()]
        var intro = "HELOC Debt"
        var intro2 = "(in % compared to Jan-2007)"
        var heloc = "% Change in Heloc Debt:" + parseFloat(selected.heloc_change) + "%"
        var consumer = "% Change in Total Debt:" + parseFloat(selected.total_consumer_change) + "%";

        return [date, intro, intro2, heloc, consumer];
    };

    //The functions for frame 3
    function debtStreamAreaMouseMove3(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine3(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = debtTooltipObj3(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj, self.tooltip3);
    };

    function debtTooltipObj3(selected, x) {

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

        var date = selected.date.getFullYear() + " " + month[selected.date.getMonth()]
        var intro = "Student Debt"
        var intro2 = "(in % compared to Jan-2007)"
        var student = "% Change in Student Debt:" + parseFloat(selected.student_change) + "%"
        var consumer = "% Change in Total Debt:" + parseFloat(selected.total_consumer_change) + "%";

        return [date, intro, intro2, student, consumer];
    };
    //The functions for frame 4
    function debtStreamAreaMouseMove4(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine4(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = debtTooltipObj4(selected, invertedX);
        updateTooltip(mouseX, mouseY, tooltipObj, self.tooltip4);
    };

    function debtTooltipObj4(selected, x) {
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

        var date = selected.date.getFullYear() + " " + month[selected.date.getMonth()]
        var intro = "Credit Card Debt"
        var intro2 = "(in % compared to Jan-2007)"
        var credit = "% Change in Credit Card Debt:" + parseFloat(selected.credit_change) + "%"
        var consumer = "% Change in Total Debt:" + parseFloat(selected.total_consumer_change) + "%";

        return [date, intro, intro2, credit, consumer];
    };
    //The functions for frame 5
    function debtStreamAreaMouseMove5(selected, i) {
        if (!self.isMouseActive) {
            return;
        }
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        updateFocusLine5(mouseX);

        var invertedX = self.getInvertedX(mouseX, MAIN_CHART_WIDTH, self.dataLength);
        var tooltipObj = debtTooltipObj5(selected, invertedX);
        updateTooltip2(mouseX, mouseY, tooltipObj, self.tooltip5);
    };

    function debtTooltipObj5(selected, x) {
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

        var date = selected.date.getFullYear() + " " + month[selected.date.getMonth()]
        var intro = "Auto Debt"
        var intro2 = "(in % compared to Jan-2007)"
        var auto = "% Change in Auto Debt:" + parseFloat(selected.auto_change) + "%"
        var consumer = "% Change in Total Debt:" + parseFloat(selected.total_consumer_change) + "%";

        return [date, intro, intro2, auto, consumer];
    };


    //Mouseout
    function debtStreamAreaMouseOut1(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var debtStreamArea = self.mainChart1.select(".quint-area");
        self.unobscureAll(debtStreamArea, 250);

        hideTooltip1();
        hideFocusLine1();
        hideFocusCircle1();
    };

    function debtStreamAreaMouseOut2(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var debtStreamArea = self.mainChart2.select(".quint-area");
        self.unobscureAll(debtStreamArea, 250);

        hideTooltip2();
        hideFocusLine2();
        hideFocusCircle2();
    };

    function debtStreamAreaMouseOut3(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var debtStreamArea = self.mainChart3.select(".quint-area");
        self.unobscureAll(debtStreamArea, 250);

        hideTooltip3();
        hideFocusLine3();
        hideFocusCircle3();
    };

    function debtStreamAreaMouseOut4(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var debtStreamArea = self.mainChart4.select(".quint-area");
        self.unobscureAll(debtStreamArea, 250);

        hideTooltip4();
        hideFocusLine4();
        hideFocusCircle4();
    };

    function debtStreamAreaMouseOut5(selected, i) {
        if (!self.isMouseActive) {
            return;
        }

        var debtStreamArea = self.mainChart5.select(".quint-area");
        self.unobscureAll(debtStreamArea, 250);

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
            .attr("y1", 0)
            .attr("x2", mouseX)
            .attr("y2", MARGIN.top + SVG_HEIGHT_BIGGER + 35 + 100)
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
        var info_svg = d3.select('#debt_info');
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'underline size24')
            .attr('dx', 130)
            .attr('dy', 20)
            .text('DEBT LEGEND');
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold underline')
            .attr('dx', 5)
            .attr('dy', 40)
            .text('Column Height (or Column Depth if negative):');
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'underline')
            .attr('dx', 5)
            .attr('dy', 55)
            .text('% increase in debt since beginning 2007');
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 260)
            .attr('dy', 55)
            .text('by Debt Type per quarter');
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 75)
            .attr('width', 24)
            .attr('height', 24)
            .style('fill', 'blue')
            .style('fill-opacity', 0.35);
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('dx', 33)
            .attr('dy', 88)
            .text("Categorical Debt:");
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 150)
            .attr('dy', 88)
            .text("% change in debt type specified by chart");
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 33)
            .attr('dy', 103)
            .text("(Mort., HELOC, Auto, Credit, Student) since 2007.");
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 118)
            .attr('width', 24)
            .attr('height', 24)
            .style('fill', 'red')
            .style('fill-opacity', 0.35);
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('dx', 33)
            .attr('dy', 131)
            .text("Total Debt:");
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 108)
            .attr('dy', 131)
            .text("% change in total debt");
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 33)
            .attr('dy', 146)
            .text("(Red columns in all charts are the same.)");
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 160)
            .attr('width', 24)
            .attr('height', 24)
            .style('fill', 'blue')
            .style('fill-opacity', 0.35);
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 160)
            .attr('width', 24)
            .attr('height', 24)
            .style('fill', 'red')
            .style('fill-opacity', 0.35);
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('dx', 33)
            .attr('dy', 175)
            .text("Overlap:");
        var g = info_svg.append('g')
            .append('text')
            .attr('dx', 93)
            .attr('dy', 175)
            .text("Specified Debt & Total Debt moving in same direction");
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 200)
            .attr('width', 24)
            .attr('height', 3)
            .style('fill', 'blue')
        var g = info_svg.append('g')
            .append('rect')
            .attr('x', 5)
            .attr('y', 205)
            .attr('width', 24)
            .attr('height', 3)
            .style('fill', 'red')
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('dx', 33)
            .attr('dy', 205)
            .text("Blue and Red Lines are another notation");
        var g = info_svg.append('g')
            .append('text')
            .attr('class', 'bold')
            .attr('dx', 33)
            .attr('dy', 220)
            .text("marking the change in debt compared to the beginning of 2007.");
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

    //Creating the chart
    createDebtChart();
};

DebtVis.prototype.getInvertedX = Shared.getInvertedX;
DebtVis.prototype.getValueSum = Shared.getValueSum;
DebtVis.prototype.obscureAll = Shared.obscureAll;
DebtVis.prototype.unobscureAll = Shared.unobscureAll;
DebtVis.prototype.obscureALlExceptByIndex = Shared.obscureALlExceptByIndex;
DebtVis.prototype.obscureALlExceptByObj = Shared.obscureALlExceptByObj;

"use strict";

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

function getInvertedX(mouseX, chartWidth, dataLength) {
    var invertedX = parseInt(mouseX / chartWidth * dataLength);
    invertedX = Math.min(invertedX, dataLength - 1);
    return invertedX;
};

function getValueSum(hashMap) {
    var sum = 0;
    Object.keys(hashMap).forEach(function(key) {
        if ($.isNumeric(hashMap[key])) {
            sum += hashMap[key];
        }
    });
    return sum;
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

function obscureAll(obj, time = 100, opacity = 0) {
    obj.transition()
        .duration(time)
        .attr("opacity", opacity);
};

function unobscureAll(obj, time = 100) {
    obj.transition()
        .duration(time)
        .attr("opacity", "1");
};

function obscureALlExceptByIndex(obj, i, time = 100, opacity = 0.2) {
    obj.transition()
        .duration(time)
        .attr("opacity", function(d, j) {
            return j != i ? opacity : 1;
        });
};

function obscureALlExceptByObj(objs, target, time = 100, opacity = 0.2) {
    objs.forEach(function(curr) {
        d3.select(curr).transition()
            .duration(time)
            .attr("opacity", function(d, j) {
                return curr != target ? opacity : 1;
            });
    });
};

// https://github.com/wbkd/d3-extended
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

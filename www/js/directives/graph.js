angular.module('ionicCapri')

.directive('graph', function($window, $q) {
  return {
    restrict: 'EA',
    template: "<div/>",
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModelCtrl) {
      var width = elem[0].firstChild.clientWidth;
      var height = 280;

      elem.attr("id", "curve-" + attrs.index);
      var curve = d3.select("#curve-" + attrs.index);
      var tooltipDiv = curve.append("div").attr('class', 'graph-tooltip');
      var originDiv = curve.append("div").attr('class', 'graph-origintip');
      var vis = curve.append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "none")
        .attr("id", "curve-svg-" + attrs.index);

      ngModelCtrl.$render = function() {
        var graphData = ngModelCtrl.$viewValue;

        // Clean previous graph if needed
        var svg = document.getElementById("curve-svg-" + attrs.index);
        while (svg.lastChild) { svg.removeChild(svg.lastChild); }

        // Define scales and axises
        var yMin = d3.min(graphData, function(d) { return Math.min(d.lcl, d.client); });
        var yMax = d3.max(graphData, function(d) { return Math.max(d.lcl, d.client); });
        var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1).domain(graphData.map(function(d) { return d.date; }));
        var yScale = d3.scale.linear().range([height-30, 30]).domain([yMin, yMax]);
        var xAxis = d3.svg.axis().scale(xScale);
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        // Draw vertical bars
        vis.selectAll("gridline").data(graphData).enter().append("line")
          .attr("x1", function(d) { return xScale(d.date); }).attr("y1", function(d) { return yScale(Math.max(d.lcl, d.client)); })
          .attr("x2", function(d) { return xScale(d.date); }).attr("y2", height - 20)
          .attr("stroke-width", 1).attr("stroke", "#909090");

        // Draw today's cursor
        vis.append("line")
          .attr("x1", xScale(graphData[graphData.length - 1].date)).attr("y1", 20)
          .attr("x2", xScale(graphData[graphData.length - 1].date)).attr("y2", height - 20)
          .attr("stroke-width", 2).attr("stroke", "#CAA559");
        vis.append("text")
          .attr("x", xScale(graphData[graphData.length - 1].date) - 50).attr("y", 12)
          .attr("font-size", "16px").attr("stroke", "#909090").text("Aujourd'hui");

        // Add date labels
        var compteur = 1;
        vis.selectAll("gridline").data(graphData).enter().append("text")
          .attr("x", function(d) { return xScale(d.date) - 14; }).attr("y", height - 7)
          .attr("font-size", "12px").attr("stroke", "#909090")
          .text(function(d) { return !(compteur++ % 5) ? d.date.substring(5, 10) : ''; });

        // add curves
        var line = d3.svg.line().x(function(d) { return xScale(d.date);}).y(function(d) { return yScale(d.lcl); }).interpolate("cardinal");
        vis.append('svg:path').attr('d', line(graphData)).attr('stroke', '#CAA559').attr('stroke-width', 7).attr('fill', 'none');
        line.y(function(d) { return yScale(d.client); });
        vis.append('svg:path').attr('d', line(graphData)).attr('stroke', 'white').attr('stroke-width', 7).attr('fill', 'none');

        // Add the lcl hotspots
        vis.selectAll("dot").data(graphData).enter().append("circle")
          .attr("opacity", 0).attr("r", 10)
          .attr("cx", function(d) { return xScale(d.date); })
          .attr("cy", function(d) { return yScale(d.lcl); })
          .on("mouseover", function(d) {
            tooltipDiv.html(generateTooltipText(d.date, d.lcl, d.lclInv))
            .transition().duration(20).style("opacity", 1)
            .style("background", "#D4A017").style("color", "#000000")
            .style("left", Math.min(d3.event.pageX, $(window).width() - 160) + "px").style("top", d3.event.pageY - 30 + "px");
          }).on("mouseout", function(d) {
            tooltipDiv.transition().duration(500).style("opacity", 0);
          });

        // Add the client hotspots
        vis.selectAll("dot").data(graphData).enter().append("circle")
          .style('cursor','pointer')
          .attr('opacity', 0).attr("r", 10)
          .attr("cx", function(d) { return xScale(d.date); })
          .attr("cy", function(d) { return yScale(d.client); })
          .on("mouseover", function(d) {
            //$(d.target).transition().style('opacity', .8);
            tooltipDiv.html(generateTooltipText(d.date, d.client, d.clientInv))
            .transition().duration(20).style("opacity", .9)
            .style("background", "#ffffff").style("color", "#333333")
            .style("left", Math.min(d3.event.pageX, $(window).width() - 160) + "px").style("top", d3.event.pageY -30 + "px");
          }).on("mouseout", function(d) {
            tooltipDiv.transition().duration(500).style("opacity", 0);
          })
          .on("click", function(d) {
            scope.updateDetails(d.date);
            scope.mainMenuChange("wallet");
          });


        // Resize graph if window dimension changes
        $(window).on("resize", function() {
          vis.attr("width", $(window).width());
          vis.attr("height", $(".content-graph").height());
        }).trigger("resize");
      }

      var generateTooltipText = function(date, value, invested) {
        var text = "<span class='graph-tooltipDate'>";
        text += date.substring(8, 10) + "/" + date.substring(5, 7) + "/" + date.substring(2, 4);
        text += "</span><br><span class='graph-tooltipAmount'>";
        text += (Math.round(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        var variation = Math.round(((value - invested) / invested)*100);
        text += " €</span><span class='graph-tooltipVar ";
        if (variation > 0) {
            text += "varPositive";
        } else if (variation < 0) {
          text += "varNegative";
        } else {
          text += "varNeutral";
        }
        text += "'>";
        if (variation > 0) {
          text += "+";
        }
        text += Math.round(((value - invested) / invested)*100);
        text += "%</span>";
        return text;
      }
    }
  }
})

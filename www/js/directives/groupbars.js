angular.module('ionicCapri')

.directive('groupbars', function($window){
  return{
    restrict:'EA',
    template:"<div id='groupbars'></div>",
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModelCtl) {
      var data = scope.groupbarData;
      var margin = {top: 30, right: 0, bottom: 30, left: 0};
      var width = 700;
      var height = 200;

      // Create scales and x-axis
      var x0 = d3.scale.ordinal().rangeRoundBands([margin.left, width - margin.right], .1).domain(data.map(function(d) { return d.class; }));
      var x1 = d3.scale.ordinal().rangeRoundBands([0, x0.rangeBand()], .1).domain(d3.keys(data[0]).filter(function(key) { return key !== "class" && key !== "bars"; }));
      var y = d3.scale.linear().range([height - margin.bottom, margin.top]).domain([0, d3.max(data, function(d) { return d3.max(d.bars, function(d) { return d.value; }); })]);
      var xAxis = d3.svg.axis().scale(x0).orient("bottom");

      // Create SVG
      elem.attr("id", "groupbars-" + attrs.index);
      var svg = d3.select("#groupbars-" + attrs.index).append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin meet");

      svg.append("g")
        .attr("transform", "translate(0, " + (height - margin.bottom) + ")")
        .style({'stroke': 'steelblue', 'fill': 'none', 'stroke-width': '0px'})
        .call(xAxis).selectAll('text').style({ 'stroke-width': '.5px'});

      // Add groups
      var asset = svg.selectAll(".asset").data(data).enter().append("g")
        .attr("class", "asset")
        .attr("transform", function(d) { return "translate(" + (x0(d.class)) + ",0)"; });

      // Add bars
      asset.selectAll("rect").data(function(d) { return d.bars; }).enter().append("rect")
        .attr("class", function(d) { return d.bclass; })
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function(d) { return height - margin.bottom; })
        .attr("height", function(d) { return 0; })

      // Add bar text
      asset.selectAll("text").data(function(d) { return d.bars; }).enter().append("text")
        .attr("class", function(d) { return d.bclass; })
        //.text(function(d) { return Math.round(d.value) +'%'; })
        //.attr("text-anchor", "middle")
        .attr("x", function(d, i) { return x1(d.name) + (x1.rangeBand() / 2); })
        .attr("y", function(d) { return Math.min(y(d.value) - 10, height - margin.bottom - 30); })
        //.attr("font-family", "sans-serif")
        //.attr("font-size", "20px")
        //.attr("fill", function(d) { console.log('color: ' + d.color); return d.color; })

      // Add bar label
      asset.selectAll("text2").data(function(d) { return d.bars; }).enter().append("text")
        .text(function(d) { return d.name === 'splitLCL' ? 'LCL' : ''; })
        .attr("x", function(d, i) { return (x1(d.name) + 12); })
        .attr("y", function(d) { return height - margin.bottom - 5; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "900")
        .attr("fill", "grey");

      ngModelCtl.$render = function() {

        var data = ngModelCtl.$viewValue;
        if(data) {
          y.domain([0, d3.max(data, function(d) { return d3.max(d.bars, function(d) { return d.value; }); })]);
          var groups = svg.selectAll(".asset").data(data);
          var selec = groups.selectAll("rect").data(function(d) { return d.bars; });

          selec.transition().duration(600).delay(10)
            .attr("width", x1.rangeBand())
            .attr("x", function(d) { return x1(d.name); })
            .attr("y", function(d) { return y(d.value) ; })
            .attr("height", function(d) { return height - margin.bottom - y(d.value);});

          groups.selectAll("text").data(function(d) { return d.bars; })
            .transition().duration(600).delay(10)
            .attr("x", function(d, i) { return x1(d.name) + (x1.rangeBand() / 2); })
            .attr("y", function(d) { return Math.min(y(d.value) - 10, height - margin.bottom - 30); })
            .text(function(d) { return Math.round(d.value) +'%'; })
        }
      };
    }
  }
})

angular.module('ionicCapri')

.directive('bars', function($window){
  return{
    restrict:'EA',
    template:"<div></div>",
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModelCtrl) {

      var margin = {top: 100, right: 0, bottom: 30, left: 0};
      var colors = ['rgba(119, 214, 142, 1)', 'rgba(97, 208, 222, 1)', 'rgba(253, 131, 142, 1)', 'rgba(253, 133, 189, 1)'];
      var width = 700, height = 250;

      var data = scope.barData;

      elem.attr("id", "bars-" + attrs.index);
      var svg = d3.select("#bars-" + attrs.index).append("svg").attr('viewBox','0 0 ' + width + ' ' + height).attr('preserveAspectRatio','xMinYMin meet');

      var x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1).domain(data.map(function(d) { return d.class; }));
      var x1 = d3.scale.ordinal().rangeRoundBands([0, width], .1).domain(data.map(function(d) { return d.split + '%'; }));
      var y = d3.scale.linear().range([height - margin.top, margin.bottom]).domain([0, d3.max(data, function(d) { return d.split; })]);

      var xAxis0 = d3.svg.axis().scale(x0).orient("bottom");

      svg.selectAll("rect").data(data).enter().append("rect")
        .style({'fill': function(d, i) { return colors[i]; }})
        .attr("x",      function(d) { return x0(d.class) + x0.rangeBand() / 2 - x0.rangeBand() / 2.5 / 2; })
        .attr("y",      function(d) { return height - margin.bottom; })
        .attr("width",  function(d) { return x0.rangeBand() / 2.5; })
        .attr("height", function(d) { return 0; })
        .text(function(d) { return x0(d.class); });

      // Draw vertical lines
      svg.selectAll("line").data(data).enter().append("line")
        //.style({'fill': 'black'})
        .attr("x1", function(d, i) { return (x1.rangeBand() + 20) * (i ? i : 1); })
        .attr("y1", function(d) { return margin.top / 6; })
        .attr("x2", function(d, i) { return (x1.rangeBand() + 20) * (i ? i : 1); })
        .attr("y2", function(d) { return margin.top / 6 * 5; })
        .attr('stroke', 'grey')
        .attr('stroke-width', 1);

      // draw classes
      svg.append("g")
        .attr("transform", "translate(0, " + margin.top * 2 / 4 + ")")
        .style({'stroke': '#555555', 'fill': 'none', 'stroke-width': '0px'})
        .call(xAxis0).selectAll('text').style({ 'stroke-width': '1px', 'font-size': '14px' });

      // Label group
      svg.append("g")
        .attr('class', 'split label')
        .attr("transform", "translate(0, " + margin.top / 6 + ")")

      ngModelCtrl.$render = function() {
      	var data = ngModelCtrl.$viewValue;
      	if(data) {
          x0.domain(data.map(function(d) { return d.class; }));
          x1.domain(data.map(function(d) { return d.split + '%'; }));
          y.domain([0, d3.max(data, function(d) { return d.split; })]);
          svg.selectAll("rect").data(data).transition().duration(1000).delay(100)
            .attr("x", function(d) {return x0(d.class) + x0.rangeBand() / 2 - x0.rangeBand() / 2.5 / 2; })
            .attr("y", function(d) {return y(d.split) + margin.top;})
            .attr("width",  function(d) { return x0.rangeBand() / 2.5; })
            .attr("height", function(d) { return height - margin.top - y(d.split); })
          	.style({'fill': function(data, i) { return colors[i]; }})
            .text(function(d) { return x0(d.class); });
          var xAxis1 = d3.svg.axis().scale(x1).orient("bottom");
          svg.selectAll("g.split.label")
            .style({'stroke': 'steelblue', 'fill': 'none', 'stroke-width': '0px'})
            .call(xAxis1).selectAll('text')
            .attr("font-family", "sans-serif")
            .attr("font-size", "30px")
            .attr("font-weight", "600")
            .style({ 'stroke-width': '0px'})
            .attr("fill", function(d, i) {return colors[i]; });;
        }
      };
    }
  }
})

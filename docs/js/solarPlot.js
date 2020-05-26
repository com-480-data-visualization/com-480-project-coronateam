function drawSolar(data){

  var widthSolar = document.getElementById('solar').offsetWidth,
    heightSolar = document.getElementById('solar').offsetHeight;

  var radius = Math.min(widthSolar, heightSolar) / 2 - 15; // radius of the whole chart

  var r = d3.scaleLinear()
    .domain([0, 1])
    .range([0, radius]);

  var solar = d3.select('#solar')
    .append('svg')
    .attr('width', widthSolar)
    .attr('height', heightSolar)
    .append('g')
    .attr('transform', 'translate(' + widthSolar / 2 + ',' + heightSolar / 2 + ')');

  var gr = solar.append('g')
    .attr('class', 'r axis')
    .selectAll('g')
    .data(r.ticks(5).slice(1))
    .enter().append('g');

  gr.append('circle')
    .attr('r', r)

    //Labels for correlation intervals
    gr.append("text")
        .attr("y", function(d) { return -r(d); })
        .attr("dy", "-0.2em")
        .attr("fill", "#b2b2b2")
        .text(function(d) { return Math.round((1-d + Number.EPSILON) * 100) / 100; });

  var ga = solar.append('g')
    .attr('class', 'a axis')
    .selectAll('g')
    .data(d3.range(0, 360, 30)) // line density
    .enter().append('g')
    .attr('transform', function(d) {
      return 'rotate(' + -d + ')';
    });

  ga.append('line')
    .attr('x2', radius);

  var line = d3.radialLine()
    .radius(function(d) {
      return r(1-Math.abs(d[1])); //higher correlation in the center
    })
    .angle(function(d) {
      return -d[0]+ Math.PI / 2;
    });


  solar.selectAll('point')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'point')
    .attr('transform', function(d) {
      var coors = line([d]).slice(1).slice(0, -1); // removes 'M' and 'Z' from string
      return 'translate(' + coors + ')'
    })
    .attr('r', function(d) {
      return 5; // radius for planets
    })
    .attr('fill',function(d){
      if(d[1]==1){
        var color='#696969';
      } else if(Math.sign(d[1])==-1){
        var color='#ff7373'
      } else{
        var color='#5ac18e'
      }
      return color;
    });

  solar.selectAll('point')
    .data(data)
    .enter().append("text")
        .attr('transform', function(d) {
      var coors = line([d]).slice(1).slice(0, -1); // removes 'M' and 'Z' from string
      return 'translate(' + coors + ')'
    })
        .attr("font-size", "10px")
        .attr("fill",'#404040')
        .text(function(d) {
          return d[2];
        });

}

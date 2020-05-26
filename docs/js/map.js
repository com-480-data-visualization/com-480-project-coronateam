var width  = window.innerWidth,
    height = window.innerHeight;

// The svg containing all our viz
var svg =  d3.select("#map")
  .append("svg")
  .attr("viewBox", "0 0 " + width + " "+ height)
  .append("g")
  .attr("width", width)
  .attr("height", height);

// Heatmap
var canvasLayer = d3.select("#heatmap")
  .append("canvas")
  .attr("width",width)
  .attr("height",height)

var canvas = canvasLayer.node(),
    ctx    = canvas.getContext("2d");

// Map projection to compute coordinates
var projection = d3.geoMercator()
  .center([5,48])
  .scale(1200)
  .translate([ width/2, height/2 ]);

// Projection used to position the heatmap during zoom
var projectionCanvas = d3.geoMercator()
    .center([5,48])
    .scale(1200)
    .translate([ width/2, height/2 ]);


// Load all files needed in the vizualisation
Promise.all([d3.json("data/europe_countries.geojson"), d3.csv("data/geocoded_tweets.csv"), d3.csv("data/geocoded_covid_cases.csv"), d3.csv("data/geocoded_trends_bycountry.csv"), d3.json("data/europe_countries_centroids.geojson"), d3.json("data/europe_regions.geojson"), d3.csv("data/geocoded_trends_byregion.csv"), d3.csv("data/data_solar.csv")]).then(function(data) {
  var dataGeo = data[0];
  var dataTweets = data[1];
  var dataCorona = data[2];
  var dataTrends = data[3];
  var dataCentroids = data[4];
  var dataGeoRegions = data[5];
  var dataTrendsRegions = data[6];
  var dataCorrelation = data[7];

  // Fecth the centroids of each country (pre-computed)
  var centroids = new Map();
  dataCentroids.features.forEach(function(feature) {
      centroids.set(
          feature.properties.id,
          feature.geometry.coordinates);
  });

  // Initialize datasets map and filter variables
  var currentDate = null;
  var currentCountry = null;

  var newDataTweets = [];
  var newDataCorona = [];

  var tweetsMap = d3.map();
  var dataMap = d3.map();
  var trendsMap = d3.map();


  ///////////////////////////////////////////
  /////////////////SOLAR/////////////////////
  ///////////////////////////////////////////

  // first is position clockwise, aka angular coordinate, polar angle, or azimuth. range from 0 - 359
  // second is ring (range 0 to 1), aka Radial Coordinate.
  // third is node size radius (center to edge)
  var dataCorrelation = [
  [0, 1, 'Confirmed'],
  [0, 0.96779387, 'Deaths'],
  [1.7135959928671598, 0.68897829, 'Trends'],
  [4.569589314312426, 0.17482298, 'Tweets'],
  [2.2514747351, 0.49888116, 'Pop'],
  [3.4271919857343196, -0.32202591, 'Youngs'],
  [2.284794657156213, 0.52632641, 'GDP'],
]; //will be replaced by data_solar.csv

dataMap = d3.map(dataMap)

drawSolar(dataCorrelation); //Draw solar plot

  ///////////////////////////////////////////
  ////////////////////MAP////////////////////
  ///////////////////////////////////////////

  // Color scales
  colorScaleTrends = d3.scaleLinear()
    .domain([0, 100])
    .range(["#ececec", "#0868ac"]);

  // Draw the map
  var g = svg.append("g")
  g.selectAll("path")
    .data(dataGeo.features)
    .enter()
      .append("path")
      .attr("fill", function (d) {
        return colorScaleTrends(1);
        })
      .attr("d", d3.geoPath().projection(projection))
      .style("stroke", "#abb7b7")
      .style("stroke-width", "1px")
      .on('mouseover', function(d) {
        d3.select(this).style('stroke', 'black');
        d3.event.preventDefault();
      }).on('mouseout', function(d) {
        d3.select(this).style('stroke', '#abb7b7');
      }).on("click", function(d) {
          zoomOnCountry(d);
          update(null);
          displayDetail(d);
        })
      .style("opacity", .6)
    .exit()
      .transition().duration(200)
      .attr("r",1)
      .remove();


  // Update the map color depending on if the map is zoomed/centered on a country
  var displayMap = function(trendsMap, trendsMapRegions){
    if (!centered){
      svg.selectAll("path").attr("fill", function (d) {
      var infos = d3.map(trendsMap.get(d.properties.id));
      d.total = infos.get('trends_covid') || 0;
      return colorScaleTrends(d.total);
    })
    .attr("d", d3.geoPath()
        .projection(projection));

    } else {
      svg.selectAll("path").attr("fill", colorScaleTrends(0))
          .attr("d", d3.geoPath()
          .projection(projection));

      if(trendsMapRegions){
        g.selectAll(".path_regions").attr("fill", function (d) {
          var infos = d3.map(trendsMapRegions.get(d.properties.id));
          d.total = infos.get('trends_covid') || 0;

          return colorScaleTrends(d.total);
        })
        .attr("d", d3.geoPath()
            .projection(projection));

      }
    }
  };

  ///////////////////////////////////////////
  ///////////////////BUBBLES/////////////////
  ///////////////////////////////////////////

  // scale for the size of the bubbles
  var sizeScaleCorona = d3.scalePow()
    .exponent(0.5)
    .domain([0, 15000])
    .range([10, 50]);

    // Add/Update coronavirus circles:
  var displayCircles = function(data) {

    // First remove old circles
    svg.selectAll(".circles").remove();
    svg.selectAll(".cases_text").remove();

    // Load data
    var circles = svg.selectAll(".circle")
        .data(data.sort(function(a,b) { return +b.count - +a.count }).filter(function(d,i){ return i<1000
            && centroids.has(d['country_id'])
            && d['covid_confirmed'] > 0}));

    // add circles
    circles
        .enter()
        .append("g")
        .attr("class", "circles")
        .append("circle")
        .attr("class", "circles")
        .attr("cx", function(d){ return projection([+centroids.get(d['country_id'])[0],+centroids.get(d['country_id'])[1]])[0] })
        .attr("cy", function(d){ return projection([+centroids.get(d['country_id'])[0],+centroids.get(d['country_id'])[1]])[1] })
        .attr("r", 1)
        .transition().duration(80)
        .attr("r", function(d){ return sizeScaleCorona(d['covid_confirmed'])})
        .style("fill", "#f64747")
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.5)
        .attr("fill-opacity", 0.7)
        .style("pointer-events", "none");

    // add text in circles
    circles
        .enter()
        .append("text")
        .attr("class", "cases_text")
        .attr("text-anchor","middle")
        .attr("alignment-baseline", "central")
        .attr("x", function(d){ return projection([+centroids.get(d['country_id'])[0],+centroids.get(d['country_id'])[1]])[0] })
        .attr("y", function(d){
            let r = sizeScaleCorona(d['covid_confirmed']);
            return projection([+centroids.get(d['country_id'])[0],+centroids.get(d['country_id'])[1]])[1] ;
        })
        .attr("fill", "white")
        .attr("font-size", 14)
        .text(function(d){ return d['covid_confirmed']})
        .style("pointer-events", "none"); //Click through
  };

  ///////////////////////////////////////////
  /////////////////HEATMAP//////////////////
  ///////////////////////////////////////////

  var displayHeat = function(data){
    var heat = simpleheat(canvas);
    data.forEach(d => {d.coords=projectionCanvas([d.lon, d.lat]); })
    heat.data(data.map(d => { return [d.coords[0], d.coords[1], +d.covid_tweets]}));
    heat.radius(10, 10);
    heat.max(d3.max(data, d => +d.covid_tweets));
    heat.draw(0.05);
  }

  ///////////////////////////////////////////
  ///////////////RIGHT PANEL/////////////////
  ///////////////////////////////////////////

  var formatDateIntoDay = d3.timeFormat("%B %d, %Y");

  // Display Infos by country
  function displayDetail(d) {
    currentCountry = d;
    let coronaInfos = d3.map(dataMap.get(d.properties.id)) || d3.map();
    let trendsInfos = d3.map(trendsMap.get(d.properties.id)) || d3.map();
    d3.select(".country-details")
    .html(function() {
      let location = d.properties.NUTS_NAME;
      return `
      <div class="header">${location}<li id="hideButton" class="fas fa-times close-button"></li></div>
      <canvas id="infosCountryChart"></canvas>
      <div class="dates"><div><strong>Date</strong>${formatDateIntoDay(currentDate)}</div></div>
      <div class="stats">
        <div><strong>Deaths</strong>${coronaInfos.get('Deaths') || 0  }</div>
        <div><strong>Cases</strong>${coronaInfos.get('Confirmed') || 0 }</div>
        <div><strong>Google Index</strong>${trendsInfos.get('trends_covid')}</div>
        <div><strong>Tweets</strong>N/A</div>
      </div>
      `;});

    var hideButton = document.getElementById('hideButton');
    hideButton.onclick = hideDetail;
    drawChart(currentCountry.properties.id, dates, dataCorona, indexDate);
    }

  // Hide the infos panel + unzoom
  function hideDetail() {
    currentCountry = null
    d3.select(".country-details").html(function() {return '<div class="header">Click on a country for more infos</div>';})
    zoomOnCountry(false);
  }

  ///////////////////////////////////////////
  //////////////////ZOOM/////////////////////
  ///////////////////////////////////////////

  var centered=null;
  function zoomOnCountry(d) {
    var x, y, k;
    g.selectAll(".path_regions").remove()
    if (d && centered !== d) {
      var centroid = projection(centroids.get(d.properties.id))
      x = centroid[0];
      y = centroid[1];
      k = 2;
      centered = d;

      g.selectAll(".path_regions")
        .data(dataGeoRegions.features.filter(function(feature){ return feature.properties.CNTR_CODE == d.properties.id}))
        .enter()
          .append("path")
          .attr("class", "path_regions")
          .attr("fill", function (d) {
          return colorScaleTrends(1);
          })
          .attr("d", d3.geoPath()
              .projection(projection)
          )
          .style("stroke", "#abb7b7")
          .style("stroke-width", "1px")
          .style("opacity", .6);


      projectionCanvas.center(centroids.get(d.properties.id));
      projectionCanvas.scale(k*1200);


    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;

      projectionCanvas.center(projection.center());
      projectionCanvas.scale(projection.scale());

    }
    canvasLayer.style("visibility", "hidden");

    svg.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px").on('end',  function(d){canvasLayer.style("visibility", "visible")});

    update(currentDate);
  }

  ///////////////////////////////////////////
  //////////////DATE SELECTOR////////////////
  ///////////////////////////////////////////
  var parseDate = d3.timeFormat("%Y-%m-%d");

  // Update all dataset maps to get data for the specified date
  function updateDatasets(h){
    currentDate = h;
    const parsedDate = parseDate(h);

    // filter data set and draw map and bubbles
    newDataTweets = dataTweets.filter(function(d) {
      return d.date == parsedDate

    })

    tweetsMap = {};
    newDataTweets.forEach(function(d){
      if (d['country_id'] in tweetsMap){
        tweetsMap[d['country_id']] = parseInt(tweetsMap[d['country_id']]) + parseInt(d.count);
      }
      else{
        tweetsMap[d['country_id']] = parseInt(d.count);
      }
    });

    tweetsMap = d3.cartogram(tweetsMap);
    newDataCorona = dataCorona.filter(function(d) {
      return d.date == parsedDate;
    })

    dataMap = {};
    newDataCorona.forEach(function(d){
      dataMap[d['country_id']] = {}
      dataMap[d['country_id']]['Date'] = d.date;
      dataMap[d['country_id']]['Confirmed'] = d.covid_confirmed;
      dataMap[d['country_id']]['Deaths'] = d.covid_deaths;
    });

    dataMap = d3.map(dataMap)

    trendsMap = {};
    dataTrends
      .filter(function(d) {
        return d.date == parsedDate;
      })
      .forEach(function(d){
        trendsMap[d['country_id']] = {}
        trendsMap[d['country_id']]['date'] = d.date;
        trendsMap[d['country_id']]['trends_covid'] = d.trends_covid;
      });
    trendsMap = d3.map(trendsMap)


    trendsMapRegions = {};
    dataTrendsRegions
      .filter(function(d) {
        return (d.date == parsedDate && centered && d.region_id.includes(centered.properties.id));
      })
      .forEach(function(d){
        trendsMapRegions[d['region_id']] = {}
        trendsMapRegions[d['region_id']]['date'] = d.date;
        trendsMapRegions[d['region_id']]['trends_covid'] = d.trends_covid;
      });
    trendsMapRegions = d3.map(trendsMapRegions)
  }

  function update(h) {
    if(!h && currentDate)
      h = currentDate

    updateDatasets(h);
    displayMap(trendsMap, trendsMapRegions);
    displayHeat(newDataTweets);
    displayCircles(newDataCorona);
    if(currentCountry != null)
      displayDetail(currentCountry)
  }

  ///////////////////////////////////////////
  //////////////////SLIDER///////////////////
  ///////////////////////////////////////////

  var dates = d3.timeDay.range(new Date('2020-02-18T00:00:00Z'), new Date('2020-03-11T00:00:00Z'))
  var indexDate = 0

  var $slider = $(".js-range-slider")
  $slider.ionRangeSlider({
            values: dates,
            from: 0,
            grid: true,
            skin: "flat",
            prettify: formatDateIntoDay,
            onStart: function (data) {
              // fired then range slider is ready
              update(data.from_value)
            },
            onChange: function (data) {
              // fired on every range slider update
              indexDate = dates.indexOf(data.from_value);
              pause();
              update(data.from_value);
            },
            onFinish: function (data) {
              update(data.from_value)
            },
            onUpdate: function (data) {
              update(data.from_value)
            }
   });



  function nextDay(){
    indexDate += 1;
    if(indexDate < dates.length){
      var slider_instance = $slider.data("ionRangeSlider");
        slider_instance.update({
          from: indexDate
        });

      update(dates[indexDate])
    } else {
      if(playing){
        pause()
      }
    }

  }

  var timeBetweenDays = 1000
  var nextDayInterval = null


  var playing = false;
  var playButton = document.getElementById('playButton');

  function pause(){
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    console.log("Pause")
    playing = false;
    clearInterval(nextDayInterval);
  }

  function play(){
    playButton.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>';

    if(indexDate >= dates.length){
      indexDate = 0
      nextDay()
    }

    console.log("Play")
    playing = true;
    nextDayInterval = setInterval(nextDay,timeBetweenDays);
  }

  playButton.onclick = function(){
    if(playing){ pause(); }
    else{ play(); }
  };

///////////////////////////////////////////
//////////////////LEGENDS//////////////////
///////////////////////////////////////////

// Legend: from Bubblemap Template by Yan Holtz
// https://www.d3-graph-gallery.com/graph/bubble_legend.html
// https://www.d3-graph-gallery.com/graph/bubblemap_template.html

  var labels = [0, 25, 50, 75, 100]
  var size_l = 20
  var distance_from_top = (height - 50)

  // Color Legend
  svg
    .append("text")
      .style("fill", "black")
      .attr("x", 20)
      .attr("y", distance_from_top - labels.length*(size_l+5) + (size_l/2))
      .attr("width", 90)
      .html("Google Index")
      .style("font-size", 12)

  svg.selectAll("dots")
    .data(labels)
    .enter()
    .append("rect")
      .attr("x", 20)
      .attr("y", function(d,i){ return distance_from_top - i*(size_l+5)})
      .attr("width", size_l)
      .attr("height", size_l)
      .style("fill", function(d){ return colorScaleTrends(d)})

  svg.selectAll("labels")
    .data(labels)
    .enter()
    .append("text")
      .attr("x", 20 + size_l*1.2)
      .attr("y", function(d,i){ return distance_from_top - i*(size_l+5) + (size_l/2)})
      .style("fill", function(d){ return colorScaleTrends(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

  // Bubbles legend
  var valuesToShow = [200, 2000, 7000, 15000]
  var xCircle = width - 80
  var xLabel = xCircle - 80;
  var yCircle = height - 40;

  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
      .attr("cx", xCircle)
      .attr("cy", function(d){ return yCircle - sizeScaleCorona(d) } )
      .attr("r", function(d){ return sizeScaleCorona(d) })
      .style("fill", "none")
      .attr("stroke", "black")

  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
      .attr('x1', function(d){ return xCircle - sizeScaleCorona(d) } )
      .attr('x2', xLabel + 10)
      .attr('y1', function(d){ return yCircle - sizeScaleCorona(d) } )
      .attr('y2', function(d){ return yCircle - sizeScaleCorona(d) } )
      .attr('stroke', 'black')
      .style('stroke-dasharray', ('2,2'))

  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
      .attr('x', xLabel)
      .attr('y', function(d){ return yCircle - sizeScaleCorona(d) } )
      .text( function(d){
        return d + ' cases'
      } )
      .style("font-size", 12)
      .attr('alignment-baseline', 'middle')
      .attr('text-anchor', 'end')
});

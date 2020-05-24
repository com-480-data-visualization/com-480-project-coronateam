var width = window.innerWidth,
    height = window.innerHeight;

// The svg
 var svg = d3.select("#map")
   .append("svg")
   .attr("viewBox", "0 0 " + width + " "+ height)
   .append("g")
   .attr("width", width)
   .attr("height", height);

// Heatmap
var canvasLayer = d3.select("#map")
  .append("canvas")
  .attr("viewBox", "0 0 " + width + " "+ height)
  .attr("id","heatmap")
  .attr("width",width)
  .attr("height",height)


// Map and projection/Zoom
var projection = d3.geoMercator()
    .center([10,48])
    .scale(1800)
    .translate([ width/2, height/2 ]);

//Promise.all([d3.json("data/europe_lvl2.geojson"), d3.csv("data/geo_tweets_by_week.csv"), d3.csv("data/coronavirus_2020-03-18.csv")]).then(function(data) {
Promise.all([d3.json("data/europe_countries.geojson"), d3.csv("data/geocoded_tweets.csv"), d3.csv("data/geocoded_covid_cases.csv"), d3.csv("data/geocoded_trends_bycountry.csv"), d3.json("data/europe_countries_centroids.geojson")]).then(function(data) {
  var dataGeo = data[0];
  var dataTweets = data[1];
  var dataCorona = data[2];
  var dataTrends = data[3];
  var dataCentroids = data[4];

  var formatDateIntoDay = d3.timeFormat("%B %d, %Y");
  var parseDate = d3.timeFormat("%Y-%m-%d");

  var currentDate = null;
  var currentCountry = null;

  var centroids = new Map();
  dataCentroids.features.forEach(function(feature) {
      centroids.set(
          feature.properties.id,
          feature.geometry.coordinates);
  });
  console.log(centroids.get('FR')[0])
  //Adjust France's centroid because it's off due to DOM
  // if (centroids.has("FRA")) {
  //     let c_fra = centroids.get("FRA");
  //     c_fra[0] += 60;
  //     c_fra[1] -= 60;
  //     centroids.set("FRA", c_fra);
  // }

  // Initialize datasets map and filter variables
  var newDataTweets = [];
  var tweetsMap = d3.map();

  var newDataCorona = [];
  var dataMap = d3.map();
  //var dataMap = d3.cartogram();

  ///////////////////////////////////////////
  ////////////////////MAP////////////////////
  ///////////////////////////////////////////

  // Color scales
  colorScaleCorona = d3.scalePow()
    .exponent(0.5)
    .domain([0, 100])
    .range(["#ececec", "red"]);

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(dataGeo.features)
    .enter()
      .append("path")
      .attr("fill", function (d) {
      return colorScaleCorona(1);
      })
      .attr("d", d3.geoPath()
          .projection(projection)
      )
      .style("stroke", "#abb7b7")
      .style("stroke-width", "1px")
      .on('mouseover', function(d) {
        d3.select(this).style('stroke', 'black');
        d3.event.preventDefault();
        //displayDetail(d);
      }).on('mouseout', function(d) {
        d3.select(this).style('stroke', '#abb7b7');
      }).on("click", function(d) {
        displayDetail(d);
      })
      .style("opacity", .6)
    .exit()
      .transition().duration(200)
      .attr("r",1)
      .remove();

  // Display Infos by country
  function displayDetail(d) {
    currentCountry = d;
    let infos = d3.map(dataMap.get(d.properties.id)) || d3.map();
    d3.select(".country-details")
    .html(function() {
      let location = d.properties.NUTS_NAME;
      return `
      <div class="header">${location}<li class="fas fa-times close-button" onclick="hideDetail();"></li></div>
      <canvas id="infosCountryChart"></canvas>
      <div class="dates"><div><strong>Date</strong>${formatDateIntoDay(currentDate)}</div></div>
      <div class="stats">
        <div><strong>Cases</strong>${infos.get('Confirmed') || 0 }</div>
        <div><strong>Recovered</strong>N/A</div>
        <div><strong>Deaths</strong>${infos.get('Deaths') || 0  }</div>
      </div>
      `;});
    console.log(parseDate(currentDate));
    drawChart(currentCountry.properties.id, dates, dataCorona, indexDate);
      /*
      return `<h4>${location}</h4>
        <p><span class="stats">Nombre total de tweets geolocalisés par semaine</span> ${tweetsMap.get(d.id) || 0}</p>
        <p><span class="stats">Cas confirmés par million d'habitants</span> ${Math.round(infos.get('ConfirmedRatio') * 100) / 100 || 0  }</p>
        <p><span class="stats">Cas confirmés cumulés</span> ${infos.get('Confirmed') || 0  }</p>
        <p><span class="stats">Décès</span> ${infos.get('Deaths') || 0  }</p>
        <p><span class="stats">Date</span> ${formatDateIntoDay(currentDate)}</p>
      `;})
      .style('opacity', 1);
      */
    }


  // Update the map
  var displayMap = function(dta){
      data = dta.entries();

      //console.log('data:', data);

      var deaths = function(d) {
          return d.value['covid_deaths'];
      };

      var values = data.map(deaths)
          .sort(d3.descending),
      lo = values[0],
      hi = values[values.length - 1];

      var scale = d3.scaleLinear()
          .domain([lo, hi])
          .range([1, 1.01]);

    svg.selectAll("path").attr("fill", function (d) {
      var infos = d3.map(dta.get(d.properties.id));
      d.total = infos.get('Confirmed') || 0;
      return colorScaleCorona(d.total);
    })
    .attr("d", d3.geoPath()
        .projection(projection));

    //Scale the countries for cartogram
    /*svg.selectAll('path').attr('transform', function(d) {
       const infos = d3.map(dta.get(d.id));
       const s = scale(infos.get('Deaths') || 1);
       console.log('scale:', s);
       return 'scale(' + s + ')';
    });*/
  };

  ///////////////////////////////////////////
  ///////////////////BUBLES//////////////////
  ///////////////////////////////////////////

  // Color Scale
  var colorScaleTweets = d3.scaleLinear().domain([0,10000])
    .range(["#b8b8b8", "blue"]);

    // Add/Update circles:
    var displayCircles = function(data) {
            let scale = function(d){
                let s = d3.scaleLog().base(2).domain([1, 1e6]).range([0, 50]);
                return s(d+1);
            }
            svg.selectAll(".circles").remove();
            svg.selectAll(".cases_text").remove();
            var circles = svg.selectAll(".circle")
                .data(data.sort(function(a,b) { return +b.count - +a.count }).filter(function(d,i){ return i<1000
                    && centroids.has(d['country_id'])
                    && d['covid_confirmed'] > 0}));
            circles
                .enter()
                .append("g")
                .attr("class", "circles")
                .append("circle")
                .attr("class", "circles")
                .attr("cx", function(d){ return projection([+centroids.get(d['country_id'])[0],+centroids.get(d['country_id'])[1]])[0] }) //If data is tweets
                .attr("cy", function(d){ return projection([+centroids.get(d['country_id'])[0],+centroids.get(d['country_id'])[1]])[1] }) //If data is tweets
                .attr("r", 1)
                .transition().duration(80)
                .attr("r", function(d){ return scale(d['covid_confirmed'])})
                .style("fill", function(d){ return colorScaleCorona(scale(d["covid_confirmed"])) })//return "#67809f"})
                .attr("stroke", function(d){ if(d["covid_confirmed"]>100){return "black"}else{return "none"}  })
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.7)
                .attr("fill-opacity", 0.4)
                .style("pointer-events", "none");
            circles.enter()
                .append("text")
                .attr("class", "cases_text")
                .attr("x", function(d){ return projection([+centroids.get(d['country_id'])[0],+centroids.get(d['country_id'])[1]])[0] })
                .attr("y", function(d){
                    let r = scale(d['covid_confirmed']);
                    return projection([+centroids.get(d['country_id'])[0],+centroids.get(d['country_id'])[1]])[1] + r/4;
                })
                .attr("text-anchor","middle")
                .attr("fill", "black")
                //.attr("font-size", function(d){ return d3.max(scale(d['covid_confirmed'])-5, 3) + "px"})
                .attr("font-size", function(d){
                    let cases = d["covid_confirmed"];
                    let val = scale(cases);
                    if (cases > 999) { //Scale the text to not overflow when 4 numbers
                        return val * 0.8;
                    } else {
                        return val;
                    }
                })
                .text(function(d){ return d['covid_confirmed']})
                .style("pointer-events", "none"); //Click through

        /*circles
          .exit()
            .transition(d3.transition().duration(750))
              .attr("r", 1e-6)
            .remove();
          */
    };
    // Add a scale for bubble size
  var valueExtent = d3.extent(dataTweets, function(d) { return +d.count; })

  var size = d3.scaleSqrt()
    .domain(valueExtent)
    .range([ 1, 50])  // Size in pixel


  ///////////////////////////////////////////
  /////////////////HEATMAP//////////////////
  ///////////////////////////////////////////

  var displayHeat = function(data){
    var canvas = canvasLayer.node(),
      context = canvas.getContext("2d");

    var heat = simpleheat(canvas);

    data.forEach(d => {d.coords=projection([d.lon, d.lat]); })
    heat.data(data.map(d => { console.log(d); return [d.coords[0], d.coords[1]-50, +d.covid_tweets]}));
    heat.radius(15, 15);
    heat.max(d3.max(data, d => +d.covid_tweets));
    heat.draw(0.05);
  }


  ///////////////////////////////////////////
  /////////////////SELECTOR//////////////////
  ///////////////////////////////////////////
  function updateDatasets(h){
      currentDate = h;
      // filter data set and draw map and bubbles
      newDataTweets = dataTweets.filter(function(d) {
        return d.date == parseDate(h)

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
      //tweetsMap = d3.map(tweetsMap);
      tweetsMap = d3.cartogram(tweetsMap);
      newDataCorona = dataCorona.filter(function(d) {
        return d.date == parseDate(h);
      })

    dataMap = {};
    newDataCorona.forEach(function(d){
      dataMap[d['country_id']] = {}
      dataMap[d['country_id']]['Date'] = d.date;
      dataMap[d['country_id']]['Confirmed'] = d.covid_confirmed;
      dataMap[d['country_id']]['Deaths'] = d.covid_deaths;
      //dataMap[d['country_id']]['ConfirmedRatio'] = d.cases_by_million;
    });

    dataMap = d3.map(dataMap)
  }
  function update(h) {
    updateDatasets(h);
    displayMap(dataMap);
    displayHeat(newDataTweets);
    displayCircles(newDataCorona);
    if(currentCountry != null)
      displayDetail(currentCountry)
  }

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
    console.log(indexDate)
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

  var timeBetweenDays = 100
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
//////////////////LEGEND///////////////////
///////////////////////////////////////////

// Legend: from Bubblemap Template by Yan Holtz
// https://www.d3-graph-gallery.com/graph/bubble_legend.html
// https://www.d3-graph-gallery.com/graph/bubblemap_template.html

  var labels = [0.5, 1, 10, 100]
  var size_l = 20
  var distance_from_top = (height - 50)
  // Legend title
  svg
    .append("text")
      .style("fill", "black")
      .attr("x", 20)
      .attr("y", distance_from_top - labels.length*(size_l+5) + (size_l/2))
      .attr("width", 90)
      .html("Cas confirmés/Mi d'habitants")
      .style("font-size", 12)

  // Add one dot in the legend for each name.

  svg.selectAll("mydots")
    .data(labels)
    .enter()
    .append("rect")
      .attr("x", 20)
      .attr("y", function(d,i){ return distance_from_top - i*(size_l+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", size_l)
      .attr("height", size_l)
      .style("fill", function(d){ return colorScaleCorona(d)})

  // Add one dot in the legend for each name.
  svg.selectAll("mylabels")
    .data(labels)
    .enter()
    .append("text")
      .attr("x", 20 + size_l*1.2)
      .attr("y", function(d,i){ return distance_from_top - i*(size_l+5) + (size_l/2)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return colorScaleCorona(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

  var valuesToShow = [500, 10000, 30000]
  var xCircle = width - 80
  var xLabel = xCircle - 80;
  var yCircle = height - 40;
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
      .attr("cx", xCircle)
      .attr("cy", function(d){ return yCircle - size(d) } )
      .attr("r", function(d){ return size(d) })
      .style("fill", "none")
      .attr("stroke", "black")
  // Add legend: segments
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
      .attr('x1', function(d){ return xCircle - size(d) } )
      .attr('x2', xLabel + 10)
      .attr('y1', function(d){ return yCircle - size(d) } )
      .attr('y2', function(d){ return yCircle - size(d) } )
      .attr('stroke', 'black')
      .style('stroke-dasharray', ('2,2'))
  // Add legend: labels
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
      .attr('x', xLabel)
      .attr('y', function(d){ return yCircle - size(d) } )
      .text( function(d){
        return d + ' tweets'
      } )
      .style("font-size", 12)
      .attr('alignment-baseline', 'middle')
      .attr('text-anchor', 'end')
});

function hideDetail() {
    d3.select(".country-details").html(function() {return '<div class="header">Click on a country for more infos</div>';})
  }

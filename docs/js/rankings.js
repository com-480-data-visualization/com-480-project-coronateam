function drawRankings(data) {
    let width = document.getElementById('rankings').offsetWidth,
        height = document.getElementById('rankings').offsetHeight;
    let radius = Math.min(width, height) / 2 - 15; // radius of the whole chart

    let g = d3.select('#rankings')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // Echelles
    let xscale = d3.scaleLinear().range([0, width]);
    let yscale = d3
        .scaleBand()
        .rangeRound([0, height])
        .paddingInner(0.1);

    // Axes
    var xaxis = d3.axisTop().scale(xscale);
    var g_xaxis = g.append("g").attr("class", "x axis");
    var yaxis = d3.axisLeft().scale(yscale);
    var g_yaxis = g.append("g").attr("class", "y axis");

    console.log(data);

    xscale.domain([0, d3.max(data, d => d['covid_confirmed'])]).nice();
    yscale.domain(data.map(d => d['country_id']));

    let rect = g
        .selectAll("rect")
        .data(data, d => d['country_id'])
        .join(
            enter => {
                var rect_enter = enter.append("rect")
                    .attr("x", 0)
                    .attr("y", height) // les pays partent du bas, plop
                    .style("fill", function(d){
                        console.log(d);
                        if(d.country == 'Italie') return '#4E8054';
                        if(d.country == 'Espagne') return '#e5b927';
                        if(d.country == 'Suisse') return '#E01649';
                        return '#930025'
                    });

                rect_enter
                    .append("text")
                    .text(function(d){ return d['covid_confirmed']; });

                return rect_enter;
            },
            update => update,
            exit => exit.remove()
        );

    let textLabels = g
        .selectAll(".textLabels")
        .data(data, d => d['country_id'])
        .join(
            enter => {
                var textLabels_enter = enter.append("text")
                    .attr("class", "textLabels")
                    .attr("x", 0)
                    .attr("y", height) // les pays partent du bas, plop
                    .attr("text-anchor", "right")
                    .attr("opacity", 0)
                    .attr("fill", '#fff')
                    .text( function(d, i){
                            return d.casesPerPop + (i == 0 ? ' par mio. d’habitant' : '')
                        }
                    );

                return textLabels_enter;
            },
            exit => exit.remove()
        );

}
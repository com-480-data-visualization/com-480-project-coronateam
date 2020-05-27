function drawRankings(data, currentDate) {
    let margin = { top: 30, bottom: 5, left: 50, right: 20 };
    let width = document.getElementById('rankings').offsetWidth - margin.right,
        height = document.getElementById('rankings').offsetHeight;

    d3.select('#rankings').selectAll("svg").remove();

    let g = d3.select('#rankings')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

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

    const parseDate = d3.timeFormat("%Y-%m-%d");
    let count = 0;
    const maxDisplay = 10;
    data = data.sort(function(a,b) { return +b['covid_confirmed'] - +a['covid_confirmed'] })
        .filter(d => d.date == parseDate(currentDate) && count++ < maxDisplay)

    xscale.domain([0, d3.max(data, d => d['covid_confirmed'])]).nice();
    yscale.domain(data.map(d => d['country_id']));

    let rect = g
        .selectAll("rect")
        .data(data, d => d['country_id'])
        .join(
            enter => {
                var rect_enter = enter.append("rect")
                    .attr("x", 10)
                    .attr("y", height) // les pays partent du bas, plop
                    .style("fill", '#930025');

                rect_enter
                    .append("text")
                    .text(function(d){ return d['covid_confirmed']; });

                return rect_enter;
            },
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
                    .text( function(d){
                            return d['covid_confirmed'];
                        }
                    );

                return textLabels_enter;
            },
            exit => exit.remove()
        );

    rect
        .transition()
        .duration(0) // 400
        .attr("height", yscale.bandwidth())
        .attr("width", d => xscale(d['covid_confirmed']))
        .attr("y", d => yscale(d['country_id']));

    textLabels
        .transition()
        .duration(0) // 400
        .attr("height", yscale.bandwidth())
        .attr("x", 18)
        .attr("opacity", 1)
        .attr("y", d => yscale(d['country_id']) + 16)
        .text( function(d, i){
                return d['covid_confirmed'];
            }
        );

        g_xaxis.transition().call(
            xaxis
                .ticks(5)
                .tickFormat( d3.format(".0s") )
        );
        g_yaxis.transition().call(yaxis);


}
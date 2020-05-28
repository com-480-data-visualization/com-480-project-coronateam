/// Takes the already filtered day-data and displays it on the left panel
function drawRankings(data) {
    let margin = { top: 30, bottom: 5, left: 30, right: 10 };
    let width = document.getElementById('rankings').offsetWidth - margin.right - margin.left,
        height = document.getElementById('rankings').offsetHeight - margin.top - margin.bottom;

    d3.select('#rankings').selectAll("svg").remove();

    let g = d3.select('#rankings')
        .append('svg')
        .attr('width', width + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    let xscale = d3.scaleLinear().range([0, width - 50]);
    let yscale = d3
        .scaleBand()
        .rangeRound([0, height])
        .paddingInner(0.1);

    // Axes
    var xaxis = d3.axisTop().scale(xscale);
    var g_xaxis = g.append("g").attr("class", "x axis");
    var yaxis = d3.axisLeft().scale(yscale);
    var g_yaxis = g.append("g").attr("class", "y axis");

    let count = 0;
    const maxDisplay = 10;
    data = data.sort(function(a,b) { return +b['covid_confirmed'] - +a['covid_confirmed'] })
        .filter(d => count++ < maxDisplay && d['covid_confirmed'] > 0) //Sort and retain only first maxDisplay

    xscale.domain([0, d3.max(data, d => parseInt(d['covid_confirmed']))]).nice();
    yscale.domain(data.map(d => d['country_id']));

    let rect = g
        .selectAll("rect")
        .data(data, d => d['country_id'])
        .join(
            enter => {
                var rect_enter = enter.append("rect")
                    .attr("height", yscale.bandwidth())
                    .attr("width", d => xscale(d['covid_confirmed']))
                    .attr("x", 5)
                    .attr("y", d => yscale(d['country_id']) + 2)
                    .style("fill", '#34495e');
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
                    .attr("height", yscale.bandwidth())
                    .attr("x", d => xscale(d['covid_confirmed']) + 14)
                    .attr("opacity", 1)
                    .attr("y", d => yscale(d['country_id']) + 20)
                    .attr("text-anchor", "right")
                    .attr("fill", '#000')
                    .text( function(d){
                            return d['covid_confirmed'];
                        }
                    );

                return textLabels_enter;
            },
            exit => exit.remove()
        );

        g_xaxis.transition().call(xaxis
            .ticks(5)
            .tickFormat( d3.format(".0s")));
        g_yaxis.transition().call(yaxis);


}
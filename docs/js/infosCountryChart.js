function drawChart(country, dates, dataCorona, dateIndex){
    const backgroundColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];

    const borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];

    const parseDate = d3.timeFormat("%Y-%m-%d");
    const numDates = 5;
    let cases = [];
    let deaths = [];
    let datesLabel = [];

    function f(n){
        if(n <= 9){
            return "0" + n;
        }
        return n
    }

    console.log(dataCorona)

    let border = [];
    for (let date = dateIndex; date >= 0; date--) {
        const index = dateIndex - date;
        let currentDate = dates[date];
        dataCorona.forEach(function(d) {
            if (d.date == parseDate(currentDate) && d['country_id'] == country) {
                cases.unshift(d.covid_confirmed);
                deaths.unshift(d.covid_deaths);
                let x = new Date(d.date);
                let dateString = x.getDate() + "." + (f(x.getMonth() + 1));
                datesLabel.unshift(dateString);
            }
        });
    }

    var ctx = document.getElementById('infosCountryChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datesLabel,
            datasets: [{
                label: '# of confirmed cases',
                data: cases,
                backgroundColor: backgroundColors[1],
                borderColor: borderColors[1],
                borderWidth: 1,
                fill: false
            },
            {
                label: '# of deaths',
                data: deaths,
                backgroundColor: backgroundColors[0],
                borderColor: borderColors[0],
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    type: 'logarithmic'
                }]
            }
        }
    });
}

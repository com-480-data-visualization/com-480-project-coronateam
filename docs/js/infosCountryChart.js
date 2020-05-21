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
    let data = [];
    let background = [];
    let datesLabel = [];

    function f(n){
        if(n <= 9){
            return "0" + n;
        }
        return n
    }

    let border = [];
    for (let date = dateIndex; date > dateIndex - numDates && date >= 0; date--) {
        const index = dateIndex - date;
        let currentDate = dates[date];
        dataCorona.forEach(function(d) {
            if (d.date == parseDate(currentDate) && d['alpha-3'] == country) {
                data.unshift(d.cumsum_cases);
                background.unshift(backgroundColors[1]);
                border.unshift(borderColors[1]);
                let x = new Date(d.date);
                let dateString = x.getDate() + "." + (f(x.getMonth() + 1));
                datesLabel.unshift(dateString);
            }
        });
    }

    var ctx = document.getElementById('infosCountryChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datesLabel,
            datasets: [{
                label: '# of Confirmed cases',
                data: data,
                backgroundColor: background,
                borderColor: border,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
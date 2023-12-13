// Admin protection
document.addEventListener('DOMContentLoaded', (event) => {
    const userId = getCookie("user_id"); // Get user_id from cookie
    // Check if user is admin
    if (userId !== 'admin') {
        alert('관리자만 사용 가능한 메뉴에요!');
        window.location.href = 'index.html';
    }
});

function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for(let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

/* chart drawing */
let previousCharts = [];

function drawChart(chartType, chartData, chartOptions, chartId, clearPrevious = false) {
    const ctx = document.getElementById(chartId).getContext('2d');

    if (clearPrevious) {
        // Destroy all existing chart instances
        previousCharts.forEach(chart => chart.destroy());
        previousCharts = []; // Clear the array
    }

    // Create a new chart instance
    const newChart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: chartOptions
    });

    // Store the new chart instance
    previousCharts.push(newChart);
}

function drawDiceHistogram(userId = '') {
    const url = `http://127.0.0.1:8000/dice_histogram${userId ? '?user_id=' + userId : ''}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const labels = Object.keys(data);
            const values = Object.values(data);
            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Number of Rolls',
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.9)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            };
            const chartOptions = {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            };

            drawChart('bar', chartData, chartOptions, 'diceHistogram', true);
        })
        .catch(error => console.error('Error:', error));
}

function drawMontyHallCharts(userId = '') {
    // Fetch strategy stats
    fetch(`http://127.0.0.1:8000/get_strategy_stats${userId ? '?user_id=' + userId : ''}`)
        .then(response => response.json())
        .then(data => {
            const strategyChartData = {
                labels: ['Changed', 'Not Changed'],
                datasets: [{
                    label: 'Strategy Choices',
                    data: [data.changed, data.not_changed],
                    backgroundColor: ['#FF6384', '#36A2EB']
                }]
            };
            drawChart('pie', strategyChartData, {}, 'strategyChart', true);
        });

    // Fetch win stats
    fetch(`http://127.0.0.1:8000/get_win_stats${userId ? '?user_id=' + userId : ''}`)
    .then(response => response.json())
    .then(data => {
        const winRateChartData = {
            labels: ['Changed', 'Not Changed'],
            datasets: [{
                label: 'Win Rate',
                data: [data.changed_win_rate, data.not_changed_win_rate],
                backgroundColor: ['#FFCE56', '#FF6384']
            }]
        };

        // Set a timeout before drawing the second chart
        setTimeout(() => {
            drawChart('bar', winRateChartData, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }, 'winRateChart', false);
        }, 50); // Adjust the delay (500ms) as needed
    });
}

function prepareChartPanel(game) {
    const chartPanel = document.getElementById('chartPanel');
    chartPanel.innerHTML = ''; // Clear existing canvas elements

    // Add canvas elements based on the selected game
    if (game === 'game1') {
        const diceHistogramCanvas = document.createElement('canvas');
        diceHistogramCanvas.id = 'diceHistogram';
        chartPanel.appendChild(diceHistogramCanvas);
    } else if (game === 'game2') {
        const strategyCanvas = document.createElement('canvas');
        strategyCanvas.id = 'strategyChart';
        chartPanel.appendChild(strategyCanvas);

        const winRateCanvas = document.createElement('canvas');
        winRateCanvas.id = 'winRateChart';
        chartPanel.appendChild(winRateCanvas);
    }
    // Add cases for other games as needed
}

document.getElementById('drawChartButton').addEventListener('click', function() {
    const selectedGame = document.getElementById('gameSelection').value;
    const userId = document.getElementById('userIdInput').value;

    prepareChartPanel(selectedGame); // Prepare the panel for the selected game

    if (selectedGame === 'game1') {
        drawDiceHistogram(userId);
    } else if (selectedGame === 'game2') {
        drawMontyHallCharts(userId);
    }
    // Add conditions for other games if needed
});
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
let previousChart = null;

function drawChart(chartType, chartData, chartOptions, chartId) {
    const ctx = document.getElementById(chartId).getContext('2d');

    // Destroy existing chart instance if it exists
    if (previousChart) {
        previousChart.destroy();
    }

    // Create a new chart instance
    previousChart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: chartOptions
    });
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

            drawChart('bar', chartData, chartOptions, 'diceHistogram');
        })
        .catch(error => console.error('Error:', error));
}


document.getElementById('drawChartButton').addEventListener('click', function() {
    const selectedGame = document.getElementById('gameSelection').value;
    const userId = document.getElementById('userIdInput').value;

    if (selectedGame === 'game1') {
        drawDiceHistogram(userId);
    }
    // Add conditions for other games if needed
});
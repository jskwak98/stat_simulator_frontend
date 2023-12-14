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
    const url = `http://152.67.208.253:8001/dice_histogram${userId ? '?user_id=' + userId : ''}`;
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
    fetch(`http://152.67.208.253:8001/get_strategy_stats${userId ? '?user_id=' + userId : ''}`)
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
    fetch(`http://152.67.208.253:8001/get_win_stats${userId ? '?user_id=' + userId : ''}`)
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

function drawChoiceFrequency() {
    fetch('http://152.67.208.253:8001/choice_frequency')
        .then(response => response.json())
        .then(data => {
            // Prepare chart data
            const chartData = {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Number of Choices',
                    data: Object.values(data),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            };

            // Draw the chart
            drawChart('bar', chartData, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }, 'choiceHistogram', true);
        })
        .catch(error => console.error('Error:', error));
}

function drawAntiChoiceFrequency() {
    fetch('http://152.67.208.253:8001/anti_choice_frequency')
        .then(response => response.json())
        .then(data => {
            const chartData = {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Number of Anti-Choices',
                    data: Object.values(data),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            };
            drawChart('bar', chartData, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }, 'antiChoiceHistogram', true);
        })
        .catch(error => console.error('Error:', error));
}

function displayUsersByAntiChoice(number) {
    fetch(`http://152.67.208.253:8001/users_by_anti_choice/${number}`)
        .then(response => response.json())
        .then(users => {
            const usersTable = document.getElementById('usersTable');
            usersTable.innerHTML = ''; // Clear previous table content

            const tableTitle = document.createElement('h3');
            tableTitle.textContent = `${number}번 고른 사람 명단`;
            usersTable.appendChild(tableTitle);

            // Create and append a table
            const table = document.createElement('table');
            usersTable.appendChild(table);

            // Create table header
            const thead = document.createElement('thead');
            table.appendChild(thead);
            const headerRow = thead.insertRow();
            let headerCell = headerRow.insertCell();
            headerCell.textContent = 'ID';
            headerCell = headerRow.insertCell();
            headerCell.textContent = '닉네임';

            // Create table body
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);

            // Insert user data into table
            users.forEach(user => {
                const row = tbody.insertRow();
                let cell = row.insertCell();
                cell.textContent = user.user_id;
                cell = row.insertCell();
                cell.textContent = user.nickname;
            });
        })
        .catch(error => console.error('Error:', error));
}

function prepareChartPanel(game, userId) {
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
    } else if (game === 'game3-1') {
        const diceHistogramCanvas = document.createElement('canvas');
        diceHistogramCanvas.id = 'choiceHistogram';
        chartPanel.appendChild(diceHistogramCanvas);
    } else if (game === 'game3-2') {
        // For anti-choice game
        const antiChoiceCanvas = document.createElement('canvas');
        antiChoiceCanvas.id = 'antiChoiceHistogram';
        chartPanel.appendChild(antiChoiceCanvas);
        
        if (userId){
            // Prepare a section for the users table
            const usersTable = document.createElement('div');
            usersTable.id = 'usersTable';
            chartPanel.appendChild(usersTable);
        }
    } else if (game === 'game1win') {
        // Prepare a panel for the 'game1win' tables
        const game1winPanel = document.createElement('div');
        game1winPanel.id = 'game1winPanel';
        game1winPanel.classList.add('game1win-panel');
        chartPanel.appendChild(game1winPanel);
    } else if (game === 'game2win') {
        // Prepare a panel for the 'game2win' tables
        const game2winPanel = document.createElement('div');
        game2winPanel.id = 'game2winPanel';
        game2winPanel.classList.add('game2win-panel');
        chartPanel.appendChild(game2winPanel);
    } else if (game === 'game1prob') {
        // Create a div to display the game1prob message
        const game1probDiv = document.createElement('div');
        game1probDiv.id = 'game1probPanel';
        game1probDiv.classList.add('game1prob-panel');
        chartPanel.appendChild(game1probDiv);
    }
}

document.getElementById('drawChartButton').addEventListener('click', function() {
    const selectedGame = document.getElementById('gameSelection').value;
    const userId = document.getElementById('userIdInput').value;

    prepareChartPanel(selectedGame, userId); // Prepare the panel for the selected game

    if (selectedGame === 'game1') {
        drawDiceHistogram(userId);
    } else if (selectedGame === 'game2') {
        drawMontyHallCharts(userId);
    } else if (selectedGame === 'game3-1') {
        drawChoiceFrequency();
    } else if (selectedGame === 'game3-2') {
        // For the anti-choice game
        drawAntiChoiceFrequency(); // Always draw the histogram
        if (userId) {
            displayUsersByAntiChoice(userId); // Display users table if a user ID is input
        }
    } else if (selectedGame === 'game1win') {
        drawGame1WinTables();
    } else if (selectedGame === 'game2win') {
        displayWinningStudents();
    } else if (selectedGame === 'game1prob') {
        getDiceProbabilities(userId)
    }
});

/* wins */
function drawGame1WinTables() {
    fetch(`http://152.67.208.253:8001/top_dice_rolls`)
        .then(response => response.json())
        .then(data => {
            createTable('높게!', data.top_rolls, ['user_id', 'nickname', 'sum_of_rolls', 'rolls']);
            createTable('낮게!', data.bottom_rolls, ['user_id', 'nickname', 'sum_of_rolls', 'rolls']);
        })
        .catch(error => console.error('Error:', error));

    fetch(`http://152.67.208.253:8001/rarest_rolls`)
        .then(response => response.json())
        .then(data => {
            createTable('희귀하게!', data.top_3_users, ['user_id', 'total_score', 'top_rolls']);
        })
        .catch(error => console.error('Error:', error));
}

function createTable(title, data, columns) {
    const panel = document.getElementById('game1winPanel');
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');

    const tableTitle = document.createElement('h3');
    tableTitle.textContent = title;
    tableContainer.appendChild(tableTitle);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = typeof row[column] === 'object' ? JSON.stringify(row[column]) : row[column];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    panel.appendChild(tableContainer);
}

function displayWinningStudents() {
    fetch('http://152.67.208.253:8001/winning_students')
        .then(response => response.json())
        .then(data => {
            const panel = document.getElementById('game2winPanel');
            panel.innerHTML = ''; // Clear any existing content

            // Create tables for best and worst students
            createStudentTable(panel, data.best_students, '최고 승률 학생들');
            createStudentTable(panel, data.worst_students, '최저 승률 학생들');
        })
        .catch(error => console.error('Error:', error));
}

function createStudentTable(container, students, title) {
    const tableTitle = document.createElement('h3');
    tableTitle.textContent = title;
    container.appendChild(tableTitle);

    const table = document.createElement('table');
    container.appendChild(table);

    // Table headers
    const headerRow = table.insertRow();
    ['User ID', 'Nickname', 'Number of Wins'].forEach(text => {
        const cell = headerRow.insertCell();
        cell.textContent = text;
    });

    // Table rows
    students.forEach(student => {
        const row = table.insertRow();
        ['user_id', 'nickname', 'number_of_wins'].forEach(key => {
            const cell = row.insertCell();
            cell.textContent = student[key];
        });
    });
}

function getDiceProbabilities(sumRolls) {
    fetch(`http://152.67.208.253:8001/get_dice_probs/${sumRolls}`)
        .then(response => response.json())
        .then(data => {
            const game1probPanel = document.getElementById('game1probPanel');
            game1probPanel.innerHTML = ''; // Clear existing content

            const messageParagraph = document.createElement('p');
            messageParagraph.textContent = data.message;
            game1probPanel.appendChild(messageParagraph);

            const meanParagraph = document.createElement('p');
            meanParagraph.textContent = '평균: ' + data.mean.toFixed(2);
            game1probPanel.appendChild(meanParagraph);

            const stdParagraph = document.createElement('p');
            stdParagraph.textContent = '표준 편차: ' + data.std.toFixed(2);
            game1probPanel.appendChild(stdParagraph);
        })
        .catch(error => console.error('Error:', error));
}
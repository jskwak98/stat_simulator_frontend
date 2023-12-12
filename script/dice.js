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

document.getElementById('rollButton').addEventListener('click', function() {
    const userId = getCookie('user_id'); // Replace with actual user ID
    const record = document.getElementById('recordRoll').checked;
    
    fetch(`http://127.0.0.1:8000/roll?user_id=${userId}&record=${record}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.rolls) {
            data.rolls.forEach((roll, index) => {
                document.getElementById('dice' + (index + 1)).textContent = roll;
            });
            document.getElementById('sum-of-rolls').textContent = 'Sum of Rolls: ' + data.sum_of_rolls;
            updateTotalRolls(userId);
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

function updateTotalRolls(userId) {
    fetch(`http://127.0.0.1:8000/roll_check/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.total_rolls !== undefined) {
                document.getElementById('totalRolls').textContent = 'Total Rolls: ' + data.total_rolls;
            }
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    const userId = getCookie('user_id');
    updateTotalRolls(userId);
});
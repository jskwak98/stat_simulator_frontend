// Login Protection Code
document.addEventListener('DOMContentLoaded', (event) => {
    if (!document.cookie.split(';').some((item) => item.trim().startsWith('user_id='))) {
        alert("로그인 후 이용해주세요.");
        window.location.href = './login.html'; // 로그인 페이지로 Redirection
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

function updateTotalTrials(userId) {
    fetch(`http://127.0.0.1:8000/monty_hall_trials/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.total_trials !== undefined) {
                document.getElementById('totalTrials').textContent = 'Total Trials: ' + data.total_trials;
            }
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    const userId = getCookie('user_id');
    updateTotalTrials(userId);
});

// Monty hall starts

let doors = [];
let pickedDoor;
let winningDoor;
let goatDoorIndex;
let isGameActive = false;
let state;

let initialIconPositions = []; 

function setup() {
    // Create three doors
    const doorsContainer = document.getElementById('doors');
    doorsContainer.innerHTML = ''; // Clear existing doors if any
    for (let i = 0; i < 3; i++) {
        const door = document.createElement('div');
        door.className = 'door';
        door.addEventListener('click', () => pickDoor(i));
        doorsContainer.appendChild(door);
        doors.push(door);
    }
    positionIcons();
    resetGame();
    

    document.getElementById('play-again').addEventListener('click', resetGame);
    document.getElementById('yes').addEventListener('click', () => finalizeChoice(true));
    document.getElementById('no').addEventListener('click', () => finalizeChoice(false));

    window.addEventListener('resize', positionIcons);
}

function resetGame() {
    isGameActive = true;
    winningDoor = Math.floor(Math.random() * 3); // Randomly select a winning door
    doors.forEach((door, index) => {
        door.classList.remove('picked', 'prev', 'right', 'wrong', 'open');
    });

    // Reset icons to default (hippo)
    document.querySelectorAll('#icons i').forEach(icon => {
        icon.className = 'fa-solid fa-hippo';
        icon.style.visibility = 'hidden';
    });

    document.getElementById('instruction').innerHTML = 'Pick a Door!';
    document.getElementById('choices').classList.add('hidden');
    document.getElementById('play-again').classList.add('hidden');
    state = "PICK";

    resetIconPositions();
}

function resetIconPositions() {
    const icons = document.querySelectorAll('#icons i');
    icons.forEach((icon, index) => {
        const position = initialIconPositions[index];
        if (position) {
            icon.style.left = position.left + 'px';
            icon.style.top = position.top + 'px';
        }
    });
}

function pickDoor(selectedIndex) {
    if (!isGameActive || state !== 'PICK') return;
    pickedDoor = selectedIndex;

    // Highlight the picked door
    doors.forEach((door, index) => {
        if (index === selectedIndex) {
            door.classList.add('picked');
        } else {
            door.classList.remove('picked');
        }
    });

    state = 'REVEAL';
    revealGoat();
}

function revealGoat() {
    do {
        goatDoorIndex = Math.floor(Math.random() * 3);
    } while (goatDoorIndex === winningDoor || goatDoorIndex === pickedDoor);

    doors[goatDoorIndex].classList.add('open');
    document.getElementById('choices').classList.remove('hidden');
    document.getElementById('instruction').innerHTML = `Switch to another door?`;

    // Reveal only the goat icon
    const goatIcon = document.querySelectorAll('#icons i')[goatDoorIndex];
    goatIcon.style.visibility = 'visible';
}

function finalizeChoice(didSwitch) {
    if (!isGameActive) return;
    isGameActive = false;

    let finalDoorIndex;

    // Remove 'prev' class from all doors
    doors.forEach(door => door.classList.remove('prev'));

    if (didSwitch) {
        doors[pickedDoor].classList.add('prev'); // Mark previous choice
        finalDoorIndex = [0, 1, 2].find(index => index !== pickedDoor && index !== goatDoorIndex);
        doors[finalDoorIndex].classList.add('picked'); // Mark final choice
    } else {
        finalDoorIndex = pickedDoor;
    }

    // Update doors based on whether they are correct or incorrect
    doors.forEach((door, index) => {
        door.classList.add('open');
        door.classList.add(index === winningDoor ? 'right' : 'wrong');
    });

    // Update icons based on final decision
    updateIcons();

    // Update instruction text based on win or lose
    document.getElementById('instruction').innerHTML = finalDoorIndex === winningDoor ? 'You WIN!' : 'You LOSE!';

    doors.forEach((door) => door.classList.add('open'));
    document.querySelectorAll('#icons i').forEach(icon => {
        icon.style.visibility = 'visible';
    });

    // Send result to the backend
    const userId = getCookie('user_id');
    const record = document.getElementById('recordTrial').checked;
    recordMontyHallResult(userId, didSwitch, finalDoorIndex === winningDoor, record);

    // Update UI elements
    document.getElementById('choices').classList.add('hidden');
    document.getElementById('play-again').classList.remove('hidden');
}

function updateIcons() {
    const icons = document.querySelectorAll('#icons i');
    icons.forEach((icon, index) => {
        if (index === winningDoor) {
            icon.className = 'fa-solid fa-car-side'; // Winning door gets a car
        } else {
            icon.className = 'fa-solid fa-hippo'; // Other doors get a hippo
        }
        icon.style.visibility = 'hidden'; // Initially hide icons
    });
}

function positionIcons() {
    const doorsContainer = document.getElementById('doors');
    const icons = document.querySelectorAll('#icons i');
    const doorRects = Array.from(doors).map(door => door.getBoundingClientRect());
    const containerRect = doorsContainer.getBoundingClientRect();

    icons.forEach((icon, index) => {
        const doorRect = doorRects[index];
        icon.style.position = 'absolute';
        icon.style.left = (doorRect.left - containerRect.left + doorRect.width / 2 - icon.offsetWidth / 2) + 'px';
        icon.style.top = (doorRect.top - containerRect.top + doorRect.height / 2 - icon.offsetHeight / 2) + 'px';
        icon.style.visibility = 'visible'; // Make icon visible when positioned
    });
}

function recordMontyHallResult(userId, didSwitch, didWin, record) {
    fetch('http://127.0.0.1:8000/monty_hall', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, change: didSwitch, win: didWin, record: record })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message)
        updateTotalTrials(userId);
    })
    .catch(error => console.error('Error:', error));
}
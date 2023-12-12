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

function setup() {
    // Create three doors
    const doorsContainer = document.getElementById('doors');
    doorsContainer.innerHTML = ''; // Clear existing doors if any
    for (let i = 0; i < 3; i++) {
        const door = document.createElement('div');
        door.className = 'door';

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'icon-wrapper';

        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';

        const icon = document.createElement('i');
        iconContainer.appendChild(icon);
        iconWrapper.appendChild(iconContainer);
        door.appendChild(iconWrapper);

        door.addEventListener('click', () => pickDoor(i));
        doorsContainer.appendChild(door);
        doors.push(door);
    }

    resetGame();

    document.getElementById('play-again').addEventListener('click', resetGame);
    document.getElementById('yes').addEventListener('click', () => finalizeChoice(true));
    document.getElementById('no').addEventListener('click', () => finalizeChoice(false));
}



function resetGame() {
    isGameActive = true;
    winningDoor = Math.floor(Math.random() * 3); // Randomly select a winning door
    doors.forEach((door, index) => {
        const icon = door.querySelector('.icon-container i');
        icon.className = ''; // Clear existing icon class
        door.classList.remove('picked', 'open', 'final');
    });

    document.getElementById('instruction').innerHTML = 'Pick a Door!';
    document.getElementById('choices').classList.add('hidden');
    document.getElementById('play-again').classList.add('hidden');

    state="PICK"
}

function pickDoor(selectedIndex) {
    if (!isGameActive || state !== 'PICK') return; // Prevent picking a door if the game is not active or not in the 'PICK' state
    pickedDoor = selectedIndex;

    // Highlight the picked door
    doors.forEach((door, index) => {
        if (index === selectedIndex) {
            door.classList.add('picked');
        } else {
            door.classList.remove('picked');
        }
    });

    state = 'REVEAL'; // Change state to 'REVEAL'
    revealGoat();
}

function revealGoat() {
    // Reveal a goat behind a non-winning, non-picked door
    do {
        goatDoorIndex = Math.floor(Math.random() * 3);
    } while (goatDoorIndex === winningDoor || goatDoorIndex === pickedDoor);

    const goatIcon = doors[goatDoorIndex].querySelector('.icon-container i');
    goatIcon.className = 'fa-solid fa-hippo'; // Set icon to hippo
    doors[goatDoorIndex].classList.add('open')
    
    // Show options to stay or switch
    document.getElementById('instruction').innerHTML = `Switch to another door?`;
    document.getElementById('choices').classList.remove('hidden');
}

function finalizeChoice(didSwitch) {
    if (!isGameActive) return;
    isGameActive = false;

    let finalDoorIndex;

    // If player switches, change their selected door to the other closed door
    if (didSwitch) {
        finalDoorIndex = [0, 1, 2].find(index => index !== pickedDoor && index !== goatDoorIndex);
        doors[finalDoorIndex].classList.add('final'); // Add green color to the final switched door
    } else {
        finalDoorIndex = pickedDoor;
        doors[finalDoorIndex].classList.replace('picked', 'final'); // Replace red with green on the stayed door
    }

    // Reveal all doors
    doors.forEach((door, index) => {
        const icon = door.querySelector('.icon-container i');
        if (index === winningDoor) {
            icon.className = 'fa-solid fa-car-side'; // Winning door gets a car
        } else {
            icon.className = 'fa-solid fa-hippo'; // Other doors get a hippo
        }
        door.classList.add('open');
    });

    // Determine win or lose
    const didWin = finalDoorIndex === winningDoor;
    document.getElementById('instruction').innerHTML = didWin ? 'You Win!' : 'You Lose!';

    // Send result to the backend
    const userId = getCookie('user_id');
    const record = document.getElementById('recordTrial').checked;
    recordMontyHallResult(userId, didSwitch, didWin, record);

    document.getElementById('choices').classList.add('hidden'); // Show play again button
    document.getElementById('play-again').classList.remove('hidden'); // Show play again button
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
    .then(data => console.log(data.message))
    .catch(error => console.error('Error:', error));
}
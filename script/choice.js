// Login Protection Code
document.addEventListener('DOMContentLoaded', (event) => {
    if (!document.cookie.split(';').some((item) => item.trim().startsWith('user_id='))) {
        alert("로그인 후 이용해주세요.");
        window.location.href = './login.html'; // 로그인 페이지로 Redirection
    }
});

let selectedNumber = null;

// Function to create a number button
function createNumberButton(number, parentElement, isZero = false) {
    const numberButton = document.createElement('div');
    numberButton.classList.add('number');
    numberButton.textContent = number;
    if (isZero) {
        numberButton.style.gridColumn = '2'; // Place "0" in the middle column
    }
    numberButton.addEventListener('click', function() {
        if (selectedNumber !== null) {
            selectedNumber.classList.remove('selected');
        }
        numberButton.classList.add('selected');
        selectedNumber = numberButton;
    });
    parentElement.appendChild(numberButton);
}

document.addEventListener('DOMContentLoaded', function() {
    const numberChoicesContainer = document.getElementById('number-choices');

    // Create number buttons 1 to 9
    for (let i = 1; i <= 9; i++) {
        createNumberButton(i, numberChoicesContainer);
    }

    // Create number button 0
    createNumberButton(0, numberChoicesContainer, true);
});

document.getElementById('submitChoice').addEventListener('click', function() {
    // Manually apply the hover style
    this.style.backgroundColor = '#7FFFD4';
    this.style.border = '2px solid #00FFFF';

    // Wait a moment before executing the rest of the code
    setTimeout(() => {
        if (selectedNumber === null) {
            alert('Please select a number');
            // Revert the style changes if no number is selected
            this.style.backgroundColor = '';
            this.style.border = '';
            return;
        }
        const userId = getCookie('user_id'); // Replace with actual user ID retrieval method
        const choice = selectedNumber.textContent;

        // Call the function to submit the choice
        submitChoice(userId, choice);

        // Revert the style changes after submission
        this.style.backgroundColor = '';
        this.style.border = '';
    }, 100); // Small delay to allow UI to update
});

// Function to submit the chosen number
function submitChoice(userId, choice) {
    fetch(`http://backend:8000/choose?user_id=${userId}&choice=${choice}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Show response message
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

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
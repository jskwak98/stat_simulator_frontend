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

function toggleFeature(feature, isEnabled = true) {
    const url = `http://127.0.0.1:8000/admin/${feature}`;
    const userId = getCookie("user_id"); // Get user_id from cookie

    // Check if user is admin
    if (userId !== 'admin') {
        alert('관리자만 사용 가능한 메뉴에요!');
        return;
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ admin_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (feature === 'disable_all') {
            // Uncheck all checkboxes
            document.getElementById('RollDice').checked = false;
            document.getElementById('MontyHall').checked = false;
            document.getElementById('Choice').checked = false;
            document.getElementById('AntiChoice').checked = false;
        }
    })
    .catch(error => console.error('Error:', error));
}

function setupCheckboxToggles() {
    const userId = getCookie("user_id");

    document.querySelectorAll('.material-switch input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('click', function(event) {
            if (userId !== 'admin') {
                alert('관리자만 사용 가능한 메뉴에요!');
                event.preventDefault(); // Prevent the checkbox from changing state
            } else {
                toggleFeature(checkbox.id, checkbox.checked);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', setupCheckboxToggles);

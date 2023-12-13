document.getElementById('menu-toggle').addEventListener('click', function() {
    var sidebar = document.getElementById("sidebar");
    if (sidebar.style.width === '120px') {
        sidebar.style.width = '0';
    } else {
        sidebar.style.width = '120px';
    }
});

document.getElementById('closeBtn').addEventListener('click', function() {
    document.getElementById("sidebar").style.width = "0";
});

function getCookie(name) {
    let cookieValue = "";
    let cookies = document.cookie.split(';');
    for(let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name + "=") === 0) {
            cookieValue = cookie.substring(name.length + 1, cookie.length);
            break;
        }
    }
    return cookieValue;
}

document.addEventListener('DOMContentLoaded', (event) => {
    let nickname = getCookie("nickname");
    if (nickname) {
        let nicknameElement = document.createElement("div");
        nicknameElement.textContent = nickname;
        nicknameElement.className = "user-nickname";

        let userPicElement = document.getElementById("user-pic");
        let sidebarBottom = userPicElement.parentNode;

        // Insert nicknameElement after the userPicElement
        sidebarBottom.insertBefore(nicknameElement, userPicElement.nextSibling);
    }
});

document.getElementById('logoutButton').addEventListener('click', function() {
    // Delete the user_id cookie
    document.cookie = 'user_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'nickname=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    // Redirect to login page
    window.location.href = 'login.html';
});

document.addEventListener('DOMContentLoaded', function() {
    const userId = getCookie('user_id');
    if (userId === 'admin') {
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        adminOnlyElements.forEach(element => {
            element.style.display = 'block'; // Or 'flex', 'inline', etc., depending on your layout
        });
    }
});
// Login Protection Code
document.addEventListener('DOMContentLoaded', (event) => {
    if (!document.cookie.split(';').some((item) => item.trim().startsWith('user_id='))) {
        alert("로그인 후 이용해주세요.");
        window.location.href = './login.html'; // 로그인 페이지로 Redirection
    }
});


document.getElementById('logoutButton').addEventListener('click', function() {
    // Delete the user_id cookie
    document.cookie = 'user_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    // Redirect to login page
    window.location.href = 'login.html';
});

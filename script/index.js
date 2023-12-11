// Login Protection Code
document.addEventListener('DOMContentLoaded', (event) => {
    if (!document.cookie.split(';').some((item) => item.trim().startsWith('user_id='))) {
        alert("로그인 후 이용해주세요.");
        window.location.href = './login.html'; // 로그인 페이지로 Redirection
    }
});

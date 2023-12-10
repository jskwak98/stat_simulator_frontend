document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const user_id = document.getElementById('user_id').value;
    const password = document.getElementById('password').value;

    // Encode credentials
    const encodedCredentials = btoa(user_id + ':' + password);

    fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + encodedCredentials
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('로그인 실패');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        document.cookie = "user_id=" + user_id + ";path=/;";
        window.location.href = "./index.html"
    })
    .catch(error => {
        console.error('Error:', error);
        alert('로그인 실패 아이디와 비밀번호를 재확인하세요!');
    });
});

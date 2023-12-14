document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const user_id = document.getElementById('user_id').value;
    const password = document.getElementById('password').value;

    // Encode credentials
    const encodedCredentials = btoa(user_id + ':' + password);

    fetch('http://152.67.208.253:8001/login', {
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
        document.cookie = "nickname=" + data.nickname + ";path=/;";
        window.location.href = "./index.html"
    })
    .catch(error => {
        console.error('Error:', error);
        alert('로그인 실패 아이디와 비밀번호를 재확인하세요!');
    });
});


(function ($) {
    "use strict";


    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })
  
    /*==================================================================
    [ Show pass ]*/
    var showPass = 0;
    $('.btn-show-pass').on('click', function(){
        if(showPass == 0) {
            $(this).next('input').attr('type','text');
            $(this).find('i').removeClass('zmdi-eye');
            $(this).find('i').addClass('zmdi-eye-off');
            showPass = 1;
        }
        else {
            $(this).next('input').attr('type','password');
            $(this).find('i').addClass('zmdi-eye');
            $(this).find('i').removeClass('zmdi-eye-off');
            showPass = 0;
        }
        
    });


})(jQuery);
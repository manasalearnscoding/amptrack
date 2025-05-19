document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
});

function initLoginPage() {    
    const urlParams = new URLSearchParams(window.location.search);
    const errorMsg = urlParams.get('error');
    const successMsg = urlParams.get('success');
    const messageElement = document.getElementById('auth-message');
    
    if (errorMsg) {
        messageElement.className = 'auth-message error';
        messageElement.textContent = errorMsg; 
    } else if (successMsg) {
        messageElement.className = 'auth-message success';
        messageElement.textContent = successMsg; 
    }
    
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('register-form-container').style.display = 'block';
        document.title = 'Amptrack - Register';
    });
    
    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form-container').style.display = 'none';
        document.getElementById('login-form-container').style.display = 'block';
        document.title = 'Amptrack - Login';
    });

    checkLoginStatus();
}

async function checkLoginStatus() {
    try {
        const res = await fetch('/auth/check');
        const data = await res.json();

        if (data.loggedIn) {
            window.location.href = '/dashboard.html';
        }
    } catch (err) {
        console.error('error checking login status:', err);
    }
}
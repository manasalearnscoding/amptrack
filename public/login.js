document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
});

function initLoginPage() {
    const loginForm = document.getElementById('login-form-container');
    const registerForm = document.getElementById('register-form-container');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    
    const urlParams = new URLSearchParams(window.location.search);
    const errorMsg = urlParams.get('error');
    const successMsg = urlParams.get('success');
    const messageElement = document.getElementById('auth-message');
    
    if (errorMsg) {
        messageElement.classList.add('error');
        messageElement.textContent = decodeURIComponent(errorMsg);
        messageElement.style.display = 'block';
    } else if (successMsg) {
        messageElement.classList.add('success');
        messageElement.textContent = decodeURIComponent(successMsg);
        messageElement.style.display = 'block';
    }
    
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    
    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        document.title = 'Amptrack - Register';
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
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
        console.error('Error checking login status:', err);
    }
}

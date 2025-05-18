function logout() {
    fetch('/auth/logout', {
        method: 'GET',
    })
    .then(() => {
        localStorage.removeItem('username');
        localStorage.removeItem('theme');
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Logout error:', error);
        alert('Failed to logout');
    });
}

// Theme switching function
function initThemeSwitch() {
    const lightBtn = document.getElementById('light-mode');
    const darkBtn = document.getElementById('dark-mode');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply the saved theme or default to dark
    document.body.classList.toggle('light-mode', savedTheme === 'light');
    lightBtn.classList.toggle('active', savedTheme === 'light');
    darkBtn.classList.toggle('active', savedTheme === 'dark');
    
    // Light mode button
    lightBtn.addEventListener('click', () => {
        document.body.classList.add('light-mode');
        lightBtn.classList.add('active');
        darkBtn.classList.remove('active');
        localStorage.setItem('theme', 'light');
    });
    
    // Dark mode button
    darkBtn.addEventListener('click', () => {
        document.body.classList.remove('light-mode');
        darkBtn.classList.add('active');
        lightBtn.classList.remove('active');
        localStorage.setItem('theme', 'dark');
    });
}

// Apply theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
});

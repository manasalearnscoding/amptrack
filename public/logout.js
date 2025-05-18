function logout() {
    fetch('/auth/logout', {
        method: 'GET',
    })
    .then(() => {
        localStorage.removeItem('username');
        window.location.href = '/';
    })
    .catch(error => {
        alert('Failed to logout');
    });
}

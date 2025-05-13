document.addEventListener('DOMContentLoaded', async function() {
    initAddConcertPage();
});

async function initAddConcertPage() {
    try {
        // Check login
        const res = await fetch('/auth/check');
        const data = await res.json();

        if (!data.loggedIn) {
            window.location.href = '/?error=' + encodeURIComponent("You are not logged in. Please log in first.");
            return;
        }

        // Store username
        localStorage.setItem('username', data.username);
        
        // Update username display
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = data.username;
        }

        // Set today as the default date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('concert-date').value = today;
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (err) {
        console.error('Error checking login:', err);
        window.location.href = '/?error=' + encodeURIComponent("Failed to verify login status.");
    }
}

function setupEventListeners() {
    // Profile menu toggle
    const profileButton = document.getElementById('profile-button');
    profileButton.addEventListener('click', function() {
        const menu = document.getElementById('user-menu');
        menu.classList.toggle('active');
    });
    
    // Logout button
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Theme switching
    initThemeSwitch();
    
    // Add concert form submission
    const addConcertForm = document.getElementById('add-concert-form');
    if (addConcertForm) {
        addConcertForm.addEventListener('submit', handleFormSubmit);
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('User not logged in');
            return;
        }

        const concertData = {
            username,
            ticketmasterId: document.getElementById('concert-id')?.value || '',
            name: document.getElementById('concert-name').value,
            date: document.getElementById('concert-date').value,
            venue: document.getElementById('concert-venue').value,
            price: parseFloat(document.getElementById('concert-price').value) || 0,
            review: document.getElementById('concert-review').value
        };

        console.log('Adding concert:', concertData);

        const response = await fetch('/concerts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(concertData),
        });

        if (!response.ok) {
            throw new Error(`Error adding concert: ${response.status}`);
        }

        const result = await response.json();
        console.log('Concert added result:', result);
        alert('Concert added successfully!');
        
        // Redirect to concerts page
        window.location.href = '/concerts.html';
        
    } catch (error) {
        console.error('Error adding concert:', error);
        alert('Failed to add concert. Please try again.');
    }
}
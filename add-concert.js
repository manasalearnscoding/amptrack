//DONE
document.addEventListener('DOMContentLoaded', async function() {
    addConcert();
});

async function addConcert() {
    try {
        const res = await fetch('/auth/check');
        const data = await res.json();

        if (!data.loggedIn) {
            window.location.href = '/?error=' + encodeURIComponent("please log in first");
            return;
        }

        localStorage.setItem('username', data.username);
        
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = data.username;
        }

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('concert-date').value = today;
        
        setupEventListeners();
        
    } catch (err) {
        window.location.href = '/?error=' + encodeURIComponent("could not verify login");
    }
}

function setupEventListeners() {

    const profileButton = document.getElementById('profile-button');
    profileButton.addEventListener('click', function() {
        const menu = document.getElementById('user-menu');
        if (menu.className === 'user-menu') {
            menu.className = 'user-menu active';
        } else {
            menu.className = 'user-menu';
        }
    });
    
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', function(e) {
        logout();
    });
        
    const addConcert = document.getElementById('add-concert-form');
    if (addConcert) {
        addConcert.addEventListener('submit', handleFormSubmit);
    }
}

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

        const response = await fetch('/concerts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(concertData),
        });

        if (!response.ok) {
            console.log(`Error adding concert: ${response.status}`);
        }

        const result = await response.json();
        // console.log('Concert added result:', result);
        alert('Concert added successfully!');

        window.location.href = '/concerts.html';
        
    } catch (error) {
        // console.error('Error adding concert:', error);
        alert('Failed to add concert. Please try again.');
    }
}
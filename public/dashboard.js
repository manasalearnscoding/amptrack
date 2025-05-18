document.addEventListener('DOMContentLoaded', async function() {
    initDashboard();
});

async function initDashboard() {
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

        await loadUserActivity();
        
        setupEventListeners();
        
    } catch (err) {
        window.location.href = '/?error=' + encodeURIComponent("could not verify login");
    }
}

function setupEventListeners() {
    const profileButton = document.getElementById('profile-button');
    profileButton.addEventListener('click', function() {
        const menu = document.getElementById('user-menu');
        // Check if menu has the active class by checking class attribute
        const hasActiveClass = menu.getAttribute('class').includes('active');
        
        // Toggle the active state
        if (hasActiveClass) {
            menu.setAttribute('class', 'user-menu'); // Remove active class
        } else {
            menu.setAttribute('class', 'user-menu active'); // Add active class
        }
    });
    
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

async function loadUserActivity() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('User not logged in');
            return;
        }

        const response = await fetch(`/concerts/mine?username=${encodeURIComponent(username)}`);
        if (!response.ok) {
            throw new Error(`Error fetching concerts: ${response.status}`);
        }

        const concerts = await response.json();
        
        updateStats(concerts);
        
    } catch (error) {
        console.error('Error loading concerts:', error);
    }
}

function updateStats(concerts) {
    if (!concerts || concerts.length === 0) {
        return;
    }

    document.getElementById('total-concerts').textContent = concerts.length;
    
    const currentYear = new Date().getFullYear();
    const thisYearConcerts = concerts.filter(concert => {
        try {
            return new Date(concert.date).getFullYear() === currentYear;
        } catch {
            return false;
        }
    });
    document.getElementById('year-concerts').textContent = thisYearConcerts.length;
    
    const totalPrice = concerts.reduce((sum, concert) => sum + (concert.price || 0), 0);
    const avgPrice = concerts.length > 0 ? totalPrice / concerts.length : 0;
    document.getElementById('avg-price').textContent = '$' + Math.round(avgPrice);
    
    const venueCounts = {};
    concerts.forEach(concert => {
        if (concert.venue) {
            venueCounts[concert.venue] = (venueCounts[concert.venue] || 0) + 1;
        }
    });
    
    let latestArtist = '-';
    if (sortedConcerts && sortedConcerts.length > 0) {
        latestArtist = sortedConcerts[0].name || '-';
    }
    
    document.getElementById('latest-artist').textContent = latestArtist;
}
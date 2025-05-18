document.addEventListener('DOMContentLoaded', async function() {
    initDashboard();
});

async function initDashboard() {
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

        // Load user concerts and update stats
        await loadUserActivity();
        
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
}

// Load user activity and update stats
async function loadUserActivity() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('User not logged in');
            return;
        }

        // Fetch user concerts
        const response = await fetch(`/concerts/mine?username=${encodeURIComponent(username)}`);
        if (!response.ok) {
            throw new Error(`Error fetching concerts: ${response.status}`);
        }

        const concerts = await response.json();
        
        // Update stats
        updateStats(concerts);
        
    } catch (error) {
        console.error('Error loading concerts:', error);
    }
}

// Update stats based on concert data
function updateStats(concerts) {
    if (!concerts || concerts.length === 0) {
        return;
    }

    // Total concerts
    document.getElementById('total-concerts').textContent = concerts.length;
    
    // Concerts this year
    const currentYear = new Date().getFullYear();
    const thisYearConcerts = concerts.filter(concert => {
        try {
            return new Date(concert.date).getFullYear() === currentYear;
        } catch {
            return false;
        }
    });
    document.getElementById('year-concerts').textContent = thisYearConcerts.length;
    
    // Average price
    const totalPrice = concerts.reduce((sum, concert) => sum + (concert.price || 0), 0);
    const avgPrice = concerts.length > 0 ? totalPrice / concerts.length : 0;
    document.getElementById('avg-price').textContent = '$' + Math.round(avgPrice);
    
    // Most common venue
    const venueCounts = {};
    concerts.forEach(concert => {
        if (concert.venue) {
            venueCounts[concert.venue] = (venueCounts[concert.venue] || 0) + 1;
        }
    });
    
    // Latest artist (from most recent concert)
    let latestArtist = '-';
    if (sortedConcerts && sortedConcerts.length > 0) {
        latestArtist = sortedConcerts[0].name || '-';
    }
    
    document.getElementById('latest-artist').textContent = latestArtist;
}

document.addEventListener('DOMContentLoaded', async function() {
    initExplorePage();
});

async function initExplorePage() {
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
    
    // Search button
    const searchButton = document.getElementById('explore-search-button');
    searchButton.addEventListener('click', searchConcerts);
    
    // Popular show cards
    const popularShowCards = document.querySelectorAll('.popular-show-card');
    popularShowCards.forEach(card => {
        card.addEventListener('click', function() {
            const artist = this.getAttribute('data-artist');
            quickSearch(artist);
        });
    });
}

// Quick search from popular shows
function quickSearch(artist) {
    document.getElementById('explore-search').value = artist;
    searchConcerts();
}

// Function to search for concerts using the Ticketmaster API
async function searchConcerts() {
    const searchQuery = document.getElementById('explore-search').value;
    if (!searchQuery) {
        alert('Please enter a search term');
        return;
    }

    const resultsSection = document.getElementById('explore-results-section');
    resultsSection.style.display = 'block';
    
    const resultsDiv = document.getElementById('explore-results');
    resultsDiv.innerHTML = '<p>Searching for concerts...</p>';

    try {
        const apikey = 'BgK2HR1cbLZENtALUAakJ3mtrGJCGhNf';
        const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?size=9&keyword=${encodeURIComponent(searchQuery)}&apikey=${apikey}`);
        const data = await response.json();

        displaySearchResults(data);
    } catch (error) {
        console.error('Error fetching concerts:', error);
        resultsDiv.innerHTML = '<p>Error fetching concert data. Please try again.</p>';
    }
}

// Function to display search results
function displaySearchResults(data) {
    const resultsDiv = document.getElementById('explore-results');
    resultsDiv.innerHTML = '';

    if (!data || !data._embedded || !Array.isArray(data._embedded.events)) {
        resultsDiv.innerHTML = '<p>No concerts found or invalid response format</p>';
        return;
    }

    data._embedded.events.forEach(event => {
        try {
            const eventName = event.name || 'Unknown Event';
            const eventDate = event.dates?.start?.localDate || 'Date not available';

            let venueInfo = 'Venue not available';
            const venue = event._embedded?.venues?.[0];
            if (venue) {
                const venueName = venue.name || '';
                const city = venue.city?.name || '';
                const state = venue.state?.name || '';
                venueInfo = [venueName, city, state].filter(Boolean).join(', ');
            }

            const imageUrl = event.images?.find(img => img.width >= 300 && img.width <= 800)?.url || event.images?.[0]?.url || '';
            const eventUrl = event.url || '';
            const eventId = event.id || '';

            const resultCard = document.createElement('div');
            resultCard.classList.add('concert-item', 'search-result');

            resultCard.innerHTML = `
                <div class="concert-header">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${eventName}" class="search-image">` : `
                    <div class="concert-image">
                        ${eventName.substring(0, 2).toUpperCase()}
                    </div>`}
                    <h3 class="concert-name">${eventName}</h3>
                </div>
                <div class="concert-details">
                    <div class="concert-date">Date: ${eventDate}</div>
                    <div class="concert-venue">Venue: ${venueInfo}</div>
                    ${eventUrl ? `<div class="concert-link"><a href="${eventUrl}" target="_blank" rel="noopener noreferrer">Ticket Info</a></div>` : ''}
                </div>
                <div class="concert-actions">
                    <button class="btn-primary add-profile-btn" data-id="${eventId}" data-name="${eventName.replace(/"/g, '&quot;')}" data-date="${eventDate}" data-venue="${venueInfo.replace(/"/g, '&quot;')}">
                        Add to My Profile
                    </button>
                </div>
            `;

            resultsDiv.appendChild(resultCard);
            
            // Add event listener to the add button
            const addButton = resultCard.querySelector('.add-profile-btn');
            addButton.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const date = this.getAttribute('data-date');
                const venue = this.getAttribute('data-venue');
                addToMyProfile(id, name, date, venue);
            });
            
        } catch (err) {
            console.error('Error processing event:', err, event);
        }
    });
}

// Add to my profile
async function addToMyProfile(id, name, date, venue) {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('User not logged in');
            return;
        }

        // Use the venue from the Ticketmaster data
        const confirmedVenue = prompt('Enter venue:', venue);
        if (confirmedVenue === null) return;

        const price = prompt('Enter price paid:');
        if (price === null) return;

        const review = prompt('Write a review or notes:');
        if (review === null) return;

        const concertData = {
            username,
            ticketmasterId: id,
            name: name,
            date: date,
            venue: confirmedVenue,
            price: parseFloat(price) || 0,
            review: review
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
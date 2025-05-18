// I THINK DONE
document.addEventListener('DOMContentLoaded', async function() {
    initConcertsPage();
});

async function initConcertsPage() {
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

        loadUserConcerts();        
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
    
    document.getElementById('search-button').addEventListener('click', searchConcerts);
}

async function loadUserConcerts() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('User not logged in');
            return;
        }

        const response = await fetch(`/concerts/mine?username=${encodeURIComponent(username)}`);

        if (!response.ok) {
            console.log(`Error fetching concerts: ${response.status}`);
        }

        const concerts = await response.json();
        // console.log('Loaded concerts:', concerts);

        const concertListDiv = document.getElementById('concert-list');
        concertListDiv.innerHTML = '';

        if (!concerts || concerts.length === 0) {
            concertListDiv.innerHTML = '<p>You haven\'t added any concerts yet.</p>';
            return;
        }

        const sortedConcerts = [...concerts].sort((a, b) => {
            try {
                return new Date(b.date) - new Date(a.date);
            } catch {
                return 0;
            }
        });

        sortedConcerts.forEach(concert => {
            try {
                let formattedDate;
                try {
                    formattedDate = new Date(concert.date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                } catch {
                    formattedDate = concert.date;
                }

                const concertItem = document.createElement('div');
                concertItem.classList.add('concert-item');
                
                concertItem.innerHTML = `
                    <div class="concert-header">
                        <div class="concert-image">
                            ${concert.name.substring(0, 2).toUpperCase()}
                        </div>
                        <h3 class="concert-name">${concert.name}</h3>
                        <div class="concert-rating">
                            <span class="star">★</span>
                        </div>
                    </div>
                    <div class="concert-details">
                        <div class="concert-date">Date: ${formattedDate}</div>
                        <div class="concert-venue">Venue: ${concert.venue || 'Not specified'}</div>
                        <div class="concert-price">Price: $${concert.price || '0'}</div>
                        ${concert.review ? `<div class="concert-review">Review: ${concert.review}</div>` : ''}
                    </div>
                    <div class="concert-actions">
                        <button class="btn-delete" data-id="${concert._id}">Delete</button>
                    </div>
                `;
                concertListDiv.appendChild(concertItem);
                
                const deleteButton = concertItem.querySelector('.btn-delete');
                deleteButton.addEventListener('click', function() {
                    deleteConcert(this.getAttribute('data-id'));
                });
                
            } catch (err) {
                console.error('Error rendering concert:', err, concert);
            }
        });
    } catch (error) {
        console.error('Error loading concerts:', error);
        document.getElementById('concert-list').innerHTML =
            '<p>Error loading your concerts. Please try again.</p>';
    }
}

async function deleteConcert(concertId) {
    try {
        if (!confirm('Are you sure you want to delete this concert?')) return;

        const username = localStorage.getItem('username');
        if (!username) {
            alert('User not logged in');
            return;
        }

        const response = await fetch('/concerts/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, concertId }),
        });

        if (!response.ok) {
            console.log(`Error deleting concert: ${response.status}`);
        }

        alert('Concert deleted successfully!');
        loadUserConcerts();
    } catch (error) {
        // console.error('Error deleting concert:', error);
        alert('Failed to delete concert. Please try again.');
    }
}

async function searchConcerts() {
    const searchQuery = document.getElementById('concert-search').value;
    if (!searchQuery) {
        alert('Please enter a search term');
        return;
    }

    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    
    const resultsDiv = document.getElementById('concert-results');
    resultsDiv.innerHTML = '<p>Searching for concerts...</p>';

    try {
        const response = await fetch(`/concerts/search?keyword=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        displayConcertResults(data);
    } catch (error) {
        // console.error('Error fetching concerts:', error);
        resultsDiv.innerHTML = '<p>Error fetching concert data. Please try again.</p>';
    }
}

function displayConcertResults(data) {
    const concertResultsDiv = document.getElementById('concert-results');
    concertResultsDiv.innerHTML = '';

    if (!data || !data._embedded || !Array.isArray(data._embedded.events)) {
        concertResultsDiv.innerHTML = '<p>No concerts found or invalid response format</p>';
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

            const concertCard = document.createElement('div');
            concertCard.classList.add('concert-item', 'search-result');

            concertCard.innerHTML = `
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
                    <button class="btn-primary add-concert-btn" data-id="${eventId}" data-name="${eventName.replace(/"/g, '&quot;')}" data-date="${eventDate}" data-venue="${venueInfo.replace(/"/g, '&quot;')}">
                        Add to My Concerts
                    </button>
                </div>
            `;

            concertResultsDiv.appendChild(concertCard);
            
            const addButton = concertCard.querySelector('.add-concert-btn');
            addButton.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const date = this.getAttribute('data-date');
                const venue = this.getAttribute('data-venue');
                addConcert(id, name, date, venue);
            });
            
        } catch (err) {
            console.error('Error processing event:', err, event);
        }
    });
}

async function addConcert(id, name, date, venue) {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('User not logged in');
            return;
        }

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
            console.log(`Error adding concert: ${response.status}`);
        }

        const result = await response.json();
        console.log('Concert added result:', result);
        alert('Concert added successfully!');
        loadUserConcerts();
        
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('concert-search').value = '';
        
    } catch (error) {
        // console.error('Error adding concert:', error);
        alert('Failed to add concert. Please try again.');
    }
}
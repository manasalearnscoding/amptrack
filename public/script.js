document.addEventListener('DOMContentLoaded', async function () {
  console.log("Loading Concert Management");

  try {
    const res = await fetch('/auth/check');
    const data = await res.json();

    if (!data.loggedIn) {
      alert("You are not logged in. Please log in first.");
      return;
    }

    // Store username instead of userId
    localStorage.setItem('username', data.username);
    console.log("Logged in as:", data.username);

    loadUserConcerts();
  } catch (err) {
    console.error('Error checking login:', err);
    alert('Failed to verify login status.');
  }
});

// Function to search for concerts using the Ticketmaster API
async function searchConcerts() {
  const searchQuery = document.getElementById('concert-search').value;
  if (!searchQuery) {
    alert('Please enter a search term');
    return;
  }

  const resultsDiv = document.getElementById('concert-results');
  resultsDiv.innerHTML = '<p>Searching for concerts...</p>';

  try {
    const apikey = 'BgK2HR1cbLZENtALUAakJ3mtrGJCGhNf';
    const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?size=10&keyword=${encodeURIComponent(searchQuery)}&apikey=${apikey}`);
    const data = await response.json();
    // console.log('API Response:', data);

    displayConcertResults(data);
  } catch (error) {
    console.error('Error fetching concerts:', error);
    resultsDiv.innerHTML = '<p>Error fetching concert data. Please try again.</p>';
  }
}

// Function to display concert results
function displayConcertResults(data) {
  const concertResultsDiv = document.getElementById('concert-results');
  concertResultsDiv.innerHTML = '';

  if (!data || !data._embedded || !Array.isArray(data._embedded.events)) {
    concertResultsDiv.innerHTML = '<p>No concerts found or invalid response format</p>';
    return;
  }

  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';

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
      concertCard.classList.add('concert-card');

      concertCard.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" alt="${eventName}" class="concert-image">` : ''}
        <h3>${eventName}</h3>
        <p>Date: ${eventDate}</p>
        <p>Venue: ${venueInfo}</p>
        ${eventUrl ? `<p><a href="${eventUrl}" target="_blank" rel="noopener noreferrer">Ticket Info</a></p>` : ''}
        <button onclick="addConcert('${eventId}', '${eventName.replace(/'/g, "\\'")}', '${eventDate}')">
          Add to My Profile
        </button>
      `;

      resultsContainer.appendChild(concertCard);
    } catch (err) {
      console.error('Error processing event:', err, event);
    }
  });

  concertResultsDiv.appendChild(resultsContainer);
}

// Add concert using username instead of userId
async function addConcert(id, name, date) {
  try {
    const username = localStorage.getItem('username');
    if (!username) {
      alert('User not logged in');
      return;
    }

    const section = prompt('Enter your section:');
    if (section === null) return;

    const price = prompt('Enter price paid:');
    if (price === null) return;

    const review = prompt('Write a review:');
    if (review === null) return;

    const concertData = {
      username,
      ticketmasterId: id,
      name: name,
      date: date,
      section: section,
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
    loadUserConcerts();
  } catch (error) {
    console.error('Error adding concert:', error);
    alert('Failed to add concert. Please try again.');
  }
}

// Load concerts for the logged-in user
async function loadUserConcerts() {
  try {
    const username = localStorage.getItem('username');
    if (!username) {
      alert('User not logged in');
      return;
    }

    console.log('Loading concerts for user:', username);

    const response = await fetch(`/concerts/mine?username=${encodeURIComponent(username)}`);

    if (!response.ok) {
      throw new Error(`Error fetching concerts: ${response.status}`);
    }

    const concerts = await response.json();
    console.log('Loaded concerts:', concerts);

    const concertListDiv = document.getElementById('concert-list');
    concertListDiv.innerHTML = '';

    if (!concerts || concerts.length === 0) {
      concertListDiv.innerHTML = '<p>You haven\'t added any concerts yet.</p>';
      return;
    }

    concerts.forEach(concert => {
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
          <h3>${concert.name}</h3>
          <p>Date: ${formattedDate}</p>
          <p>Section: ${concert.section || 'Not specified'}</p>
          <p>Price Paid: $${concert.price || '0'}</p>
          <p>Review: ${concert.review || 'No review'}</p>
          <button onclick="deleteConcert('${concert._id}')">Delete</button>
        `;
        concertListDiv.appendChild(concertItem);
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

// Delete concert using username instead of userId
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
      throw new Error(`Error deleting concert: ${response.status}`);
    }

    alert('Concert deleted successfully!');
    loadUserConcerts();
  } catch (error) {
    console.error('Error deleting concert:', error);
    alert('Failed to delete concert. Please try again.');
  }
}

// Manual concert add form
document.addEventListener('DOMContentLoaded', function () {
  const addConcertForm = document.getElementById('add-concert-form');
  if (addConcertForm) {
    addConcertForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const username = localStorage.getItem('username');
      if (!username) {
        alert('User not logged in');
        return;
      }

      const concertData = {
        username,
        ticketmasterId: document.getElementById('concert-id').value,
        name: document.getElementById('concert-name').value,
        date: document.getElementById('concert-date').value,
        section: document.getElementById('concert-section').value,
        price: parseFloat(document.getElementById('concert-price').value) || 0,
        review: document.getElementById('concert-review').value
      };

      console.log('Manual add concert:', concertData);

      fetch('/concerts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(concertData),
      })
        .then(response => {
          if (!response.ok) throw new Error(`Failed to add concert: ${response.status}`);
          return response.json();
        })
        .then(result => {
          console.log('Manual add result:', result);
          alert('Concert added successfully!');
          addConcertForm.reset();
          loadUserConcerts();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Failed to add concert. Please try again.');
        });
    });
  }
});
// public/script.js - Simplified for concert management only

// On page load, set a test user ID for simplicity
document.addEventListener('DOMContentLoaded', function() {
  console.log("Loading Concert Management");
  
  // Always use this ID for simplicity - we're skipping auth to focus on concert functionality
  localStorage.setItem('userId', 'fixed-test-user');
  
  // Load user concerts immediately
  loadUserConcerts();
});

// Function to search for concerts using the Ticketmaster API
async function searchConcerts() {
  const searchQuery = document.getElementById('concert-search').value;
  if (!searchQuery) {
    alert('Please enter a search term');
    return;
  }
  
  // Show loading indicator
  const resultsDiv = document.getElementById('concert-results');
  resultsDiv.innerHTML = '<p>Searching for concerts...</p>';
  
  try {
    const apikey = 'BgK2HR1cbLZENtAUAakJ3mtrGJCGhNf';
    const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?size=10&keyword=${encodeURIComponent(searchQuery)}&apikey=${apikey}`);
    const data = await response.json();
    console.log('API Response:', data);
    
    displayConcertResults(data);
  } catch (error) {
    console.error('Error fetching concerts:', error);
    document.getElementById('concert-results').innerHTML = '<p>Error fetching concert data. Please try again.</p>';
  }
}

// Function to display concert results
function displayConcertResults(data) {
  const concertResultsDiv = document.getElementById('concert-results');
  concertResultsDiv.innerHTML = '';

  // Check if data has the expected structure
  if (!data || !data._embedded || !data._embedded.events || !Array.isArray(data._embedded.events)) {
    concertResultsDiv.innerHTML = '<p>No concerts found or invalid response format</p>';
    return;
  }

  // Create a container for the results
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';

  data._embedded.events.forEach(event => {
    try {
      // Get event details safely with fallbacks
      const eventName = event.name || 'Unknown Event';
      const eventDate = event.dates && event.dates.start && event.dates.start.localDate 
        ? event.dates.start.localDate 
        : 'Date not available';
      
      // Safely extract venue and location information
      let venueInfo = 'Venue not available';
      if (event._embedded && event._embedded.venues && event._embedded.venues.length > 0) {
        const venue = event._embedded.venues[0];
        const venueName = venue.name || '';
        const city = venue.city && venue.city.name ? venue.city.name : '';
        const state = venue.state && venue.state.name ? venue.state.name : '';
        
        const locationParts = [venueName, city, state].filter(part => part); // Remove empty parts
        venueInfo = locationParts.join(', ') || 'Venue not available';
      }
      
      // Get event image if available
      let imageUrl = '';
      if (event.images && event.images.length > 0) {
        // Find a medium-sized image if available
        const mediumImage = event.images.find(img => img.width >= 300 && img.width <= 800);
        imageUrl = mediumImage ? mediumImage.url : event.images[0].url;
      }

      // Get event URL for ticket info
      const eventUrl = event.url || '';
      
      // Event ID for internal tracking
      const eventId = event.id || '';

      // Create card for this concert
      const concertCard = document.createElement('div');
      concertCard.classList.add('concert-card');
      
      // Build the card HTML
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
      // Skip this event if there was an error processing it
    }
  });
  
  concertResultsDiv.appendChild(resultsContainer);
}

// Function to add a concert to the user's profile
async function addConcert(id, name, date) {
  try {
    const userId = localStorage.getItem('userId');
    
    const section = prompt('Enter your section:');
    if (section === null) return; // User canceled
    
    const price = prompt('Enter price paid:');
    if (price === null) return; // User canceled
    
    const review = prompt('Write a review:');
    if (review === null) return; // User canceled

    const concertData = {
      userId,
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
    
    // Reload the concerts to show the newly added one
    loadUserConcerts();
  } catch (error) {
    console.error('Error adding concert:', error);
    alert('Failed to add concert. Please try again.');
  }
}

// Function to load the user's concerts from the database
async function loadUserConcerts() {
  try {
    const userId = localStorage.getItem('userId');
    console.log('Loading concerts for user:', userId);
    
    const response = await fetch(`/concerts/mine?userId=${userId}`);
    
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
        // Format date for display
        let formattedDate;
        try {
          formattedDate = new Date(concert.date).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          });
        } catch (e) {
          formattedDate = concert.date; // Use raw date if parsing fails
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
    const concertListDiv = document.getElementById('concert-list');
    concertListDiv.innerHTML = 
      '<p>Error loading your concerts. Please try again.</p>';
  }
}

// Function to delete a concert from the user's profile
async function deleteConcert(concertId) {
  try {
    if (!confirm('Are you sure you want to delete this concert?')) {
      return;
    }
    
    const userId = localStorage.getItem('userId');

    const response = await fetch('/concerts/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, concertId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting concert: ${response.status}`);
    }
    
    alert('Concert deleted successfully!');
    
    // Reload the concerts to update the list
    loadUserConcerts();
  } catch (error) {
    console.error('Error deleting concert:', error);
    alert('Failed to delete concert. Please try again.');
  }
}

// Handle form submission for adding a concert manually
document.addEventListener('DOMContentLoaded', function() {
  const addConcertForm = document.getElementById('add-concert-form');
  if (addConcertForm) {
    addConcertForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const userId = localStorage.getItem('userId');
      
      const concertData = {
        userId: userId,
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
        if (!response.ok) {
          throw new Error(`Failed to add concert: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
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
// public/script.js

// Helper function to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Store userId from cookie to localStorage if available
document.addEventListener('DOMContentLoaded', () => {
  const userId = getCookie('userId');
  if (userId) {
    localStorage.setItem('userId', userId);
  }
  
  const username = getCookie('username');
  if (username) {
    localStorage.setItem('username', username);
  }
});

// Function to search for concerts using the Ticketmaster API
async function searchConcerts() {
  const searchQuery = document.getElementById('concert-search').value;
  if (!searchQuery.trim()) {
    alert('Please enter a search term');
    return;
  }

  try {
    // Show loading indicator
    const concertResultsDiv = document.getElementById('concert-results');
    concertResultsDiv.innerHTML = '<p>Searching for concerts...</p>';

    const apikey = 'BgK2HR1cbLZENtALUAakJ3mtrGJCGhNf';
    const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?size=5&keyword=${encodeURIComponent(searchQuery)}&apikey=${apikey}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log(data);
    displayConcertResults(data);
  } catch (error) {
    console.error('Error searching for concerts:', error);
    const concertResultsDiv = document.getElementById('concert-results');
    concertResultsDiv.innerHTML = '<p>Error searching for concerts. Please try again later.</p>';
  }
}

// Function to display concert results
function displayConcertResults(data) {
  const concertResultsDiv = document.getElementById('concert-results');
  concertResultsDiv.innerHTML = '';

  if (data._embedded && data._embedded.events) {
    data._embedded.events.forEach(event => {
      const concertCard = document.createElement('div');
      concertCard.classList.add('concert-card');
      
      // Get venue info safely
      const venueName = event._embedded?.venues?.[0]?.name || 'Unknown Venue';
      const venueCity = event._embedded?.venues?.[0]?.city?.name || 'Unknown City';
      
      // Format the date nicely if available
      let formattedDate = event.dates?.start?.localDate || 'Unknown Date';
      if (formattedDate !== 'Unknown Date') {
        const dateObj = new Date(formattedDate);
        formattedDate = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      concertCard.innerHTML = `
        <h3>${event.name}</h3>
        <p>Date: ${formattedDate}</p>
        <p>Venue: ${venueName}</p>
        <p>Location: ${venueCity}</p>
        <button onclick="addConcert('${event.id}', '${event.name.replace(/'/g, "\\'")}', '${event.dates.start.localDate}')">Add to My Concerts</button>
      `;
      concertResultsDiv.appendChild(concertCard);
    });
  } else {
    concertResultsDiv.innerHTML = `<p>No concerts found for your search. Try different keywords.</p>`;
  }
}

// Function to add a concert to the user's profile
async function addConcert(id, name, date) {
  try {
    const userId = localStorage.getItem('userId'); // Get userId from localStorage
    
    if (!userId) {
      alert('You need to be logged in to add concerts');
      window.location.href = '/index.html';
      return;
    }
    
    const section = prompt('Enter your section:') || 'General Admission';
    const price = prompt('Enter price paid:') || '0';
    const review = prompt('Write a review (optional):') || '';

    const concertData = {
      userId,
      ticketmasterId: id,
      name: name,
      date: date,
      section: section,
      price: price,
      review: review
    };

    const response = await fetch('/concerts/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(concertData),
    });

    if (!response.ok) {
      throw new Error('Failed to add concert');
    }

    alert('Concert added to your profile!');
    loadUserConcerts(); // Refresh the user's concert list
  } catch (error) {
    console.error('Error adding concert:', error);
    alert('Error adding concert. Please try again.');
  }
}

// Function to load the user's concerts from the database
async function loadUserConcerts() {
  try {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      console.warn('No userId found in localStorage');
      window.location.href = '/index.html';
      return;
    }
    
    const response = await fetch(`/concerts/mine?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load concerts');
    }
    
    const concerts = await response.json();

    const concertListDiv = document.getElementById('concert-list');
    if (!concertListDiv) return; // Exit if we're not on a page with the concert list

    concertListDiv.innerHTML = '';

    if (concerts.length === 0) {
      concertListDiv.innerHTML = '<p>You haven\'t added any concerts yet. Search for concerts above or add one manually.</p>';
      return;
    }

    concerts.forEach(concert => {
      const concertItem = document.createElement('div');
      concertItem.classList.add('concert-item');
      
      // Format the date nicely
      const concertDate = new Date(concert.date);
      const formattedDate = concertDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      concertItem.innerHTML = `
        <h3>${concert.name}</h3>
        <p><span class="star-rating">★</span> </p>
        <p>Date: ${formattedDate}</p>
        <p>Section: ${concert.section}</p>
        <p>Price: $${concert.price}</p>
        ${concert.review ? `<p>Review: ${concert.review}</p>` : ''}
        <button onclick="deleteConcert('${concert._id}')">Delete</button>
      `;
      concertListDiv.appendChild(concertItem);
    });
  } catch (error) {
    console.error('Error loading concerts:', error);
    const concertListDiv = document.getElementById('concert-list');
    if (concertListDiv) {
      concertListDiv.innerHTML = '<p>Error loading your concerts. Please try again later.</p>';
    }
  }
}

// Function to delete a concert from the user's profile
async function deleteConcert(concertId) {
  try {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      alert('You need to be logged in to delete concerts');
      window.location.href = '/index.html';
      return;
    }
    
    if (!confirm('Are you sure you want to delete this concert?')) {
      return;
    }

    const response = await fetch(`/concerts/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, concertId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete concert');
    }

    alert('Concert deleted!');
    loadUserConcerts(); // Refresh the list
  } catch (error) {
    console.error('Error deleting concert:', error);
    alert('Error deleting concert. Please try again.');
  }
}

// Function to handle logout
function logout() {
  // Clear localStorage
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  
  // Clear cookies and session server-side
  fetch('/auth/logout')
    .then(() => {
      window.location.href = '/index.html';
    })
    .catch(error => {
      console.error('Logout error:', error);
      window.location.href = '/index.html'; // Redirect anyway
    });
}

// Toggle navbar on mobile
function toggleNav() {
  const navbar = document.querySelector('.navbar');
  navbar.classList.toggle('show');
}

// Toggle user dropdown menu
function toggleUserMenu() {
  const dropdown = document.querySelector('.user-dropdown');
  dropdown.classList.toggle('show');
  
  // Close dropdown when clicking outside
  if (dropdown.classList.contains('show')) {
    document.addEventListener('click', function closeMenu(e) {
      if (!e.target.closest('.user-dropdown')) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeMenu);
      }
    });
  }
}

// Toggle theme functionality
function toggleTheme() {
  const body = document.body;
  const themeToggle = document.querySelector('.theme-toggle');
  
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
}

// Load concert statistics for dashboard
async function loadConcertStats() {
  try {
    // Check if we're on the dashboard page
    if (!document.getElementById('total-concerts')) return;
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('No userId found in localStorage');
      window.location.href = '/index.html';
      return;
    }
    
    // Fetch stats through the stats endpoint
    const response = await fetch(`/concerts/stats?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to load concert stats');
    }
    
    const stats = await response.json();
    
    // Update stats on dashboard
    document.getElementById('total-concerts').textContent = stats.totalConcerts || 0;
    document.getElementById('this-year').textContent = stats.thisYear || 0;
    document.getElementById('avg-price').textContent = `$${stats.avgPrice || 0}`;
    document.getElementById('top-venue').textContent = stats.topSection || '-';
    
  } catch (error) {
    console.error('Error loading concert stats:', error);
  }
}

// Load recent activity for dashboard
async function loadRecentActivity() {
  try {
    // Check if we're on the dashboard page
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('No userId found in localStorage');
      window.location.href = '/index.html';
      return;
    }
    
    // Fetch user's concerts
    const response = await fetch(`/concerts/mine?userId=${userId}`);
    const concerts = await response.json();
    
    if (concerts.length === 0) {
      activityContainer.innerHTML = '<p>No activity yet. Start by adding your first concert!</p>';
      return;
    }
    
    // Sort concerts by date (most recent first)
    concerts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display the 5 most recent concerts
    const recentConcerts = concerts.slice(0, 5);
    
    let activityHtml = '';
    
    recentConcerts.forEach(concert => {
      // Format the date nicely
      const concertDate = new Date(concert.date);
      const formattedDate = concertDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      activityHtml += `
        <div class="concert-card">
          <h3>${concert.name}</h3>
          <p><span class="star-rating">★</span> </p>
          <p>Date: ${formattedDate}</p>
          <p>Section: ${concert.section}</p>
          <p>Price: $${concert.price}</p>
          ${concert.review ? `<p>Review: ${concert.review}</p>` : ''}
        </div>
      `;
    });
    
    activityContainer.innerHTML = activityHtml;
    
  } catch (error) {
    console.error('Error loading recent activity:', error);
    const activityContainer = document.getElementById('recent-activity');
    if (activityContainer) {
      activityContainer.innerHTML = '<p>Error loading activity. Please try again.</p>';
    }
  }
}

// Load user data for dashboard
async function loadUserData() {
  try {
    // Get username from localStorage
    const userId = localStorage.getItem('userId');
    let username = localStorage.getItem('username');
    
    if (!userId) {
      console.warn('No userId found in localStorage');
      window.location.href = '/index.html';
      return;
    }
    
    // Set default username if not found
    if (!username) {
      username = 'User';
      // You could fetch the actual username from server here
    }
    
    // Update username displays
    const usernameElements = document.querySelectorAll('.username');
    usernameElements.forEach(element => {
      element.textContent = username;
    });
    
    // Set welcome username if on dashboard
    const welcomeUsername = document.getElementById('welcome-username');
    if (welcomeUsername) {
      welcomeUsername.textContent = username;
    }
    
    // Set avatar initial
    const avatarElements = document.querySelectorAll('.avatar');
    avatarElements.forEach(element => {
      element.textContent = username.charAt(0).toUpperCase();
    });
    
    // Load concert stats if on dashboard
    await loadConcertStats();
    
    // Load recent activity if on dashboard
    await loadRecentActivity();
    
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Handle form submission for adding concerts manually
document.addEventListener('DOMContentLoaded', () => {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  const themeToggle = document.querySelector('.theme-toggle');
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }
  
  // Load user data
  loadUserData();
  
  // Add event listener for concert form if it exists
  const addConcertForm = document.getElementById('add-concert-form');
  if (addConcertForm) {
    addConcertForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('You need to be logged in to add concerts');
        window.location.href = '/index.html';
        return;
      }
      
      const concertData = {
        userId,
        ticketmasterId: document.getElementById('concert-id').value || 'manual',
        name: document.getElementById('concert-name').value,
        date: document.getElementById('concert-date').value,
        section: document.getElementById('concert-section').value,
        price: document.getElementById('concert-price').value,
        review: document.getElementById('concert-review').value
      };
      
      try {
        const response = await fetch('/concerts/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(concertData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add concert');
        }
        
        alert('Concert added to your profile!');
        addConcertForm.reset();
        loadUserConcerts();
      } catch (error) {
        console.error('Error adding concert:', error);
        alert('Error adding concert. Please try again.');
      }
    });
  }
  
  // Add event listener for Enter key in search input
  const searchInput = document.getElementById('concert-search');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchConcerts();
      }
    });
  }
  
  // Add event listener for explore search
  const exploreSearchInput = document.getElementById('explore-search');
  if (exploreSearchInput) {
    exploreSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        exploreSearch();
      }
    });
  }
});

// Explore search function
async function exploreSearch() {
  const searchQuery = document.getElementById('explore-search').value;
  if (!searchQuery.trim()) {
    alert('Please enter a search term');
    return;
  }

  try {
    // Show loading indicator
    const exploreResultsDiv = document.getElementById('explore-results');
    exploreResultsDiv.innerHTML = '<p>Searching for concerts...</p>';

    const apikey = 'BgK2HR1cbLZENtALUAakJ3mtrGJCGhNf';
    const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?size=8&keyword=${encodeURIComponent(searchQuery)}&apikey=${apikey}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    displayExploreResults(data);
  } catch (error) {
    console.error('Error searching for concerts:', error);
    const exploreResultsDiv = document.getElementById('explore-results');
    exploreResultsDiv.innerHTML = '<p>Error searching for concerts. Please try again later.</p>';
  }
}

// Display explore search results
function displayExploreResults(data) {
  const exploreResultsDiv = document.getElementById('explore-results');
  exploreResultsDiv.innerHTML = '';

  if (data._embedded && data._embedded.events) {
    // Create a grid container for the results
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'dashboard-cards';
    
    data._embedded.events.forEach(event => {
      // Get venue info safely
      const venueName = event._embedded?.venues?.[0]?.name || 'Unknown Venue';
      const venueCity = event._embedded?.venues?.[0]?.city?.name || 'Unknown City';
      
      // Format the date nicely if available
      let formattedDate = event.dates?.start?.localDate || 'Unknown Date';
      if (formattedDate !== 'Unknown Date') {
        const dateObj = new Date(formattedDate);
        formattedDate = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      const concertCard = document.createElement('div');
      concertCard.className = 'dashboard-card';
      
      concertCard.innerHTML = `
        <div class="dashboard-card-icon">🎵</div>
        <div class="dashboard-card-title">${event.name}</div>
        <div class="dashboard-card-text">${venueName}</div>
        <div class="dashboard-card-text">${venueCity} • ${formattedDate}</div>
        <button onclick="addConcert('${event.id}', '${event.name.replace(/'/g, "\\'")}', '${event.dates.start.localDate}')">Add to My Concerts</button>
      `;
      
      resultsGrid.appendChild(concertCard);
    });
    
    exploreResultsDiv.appendChild(resultsGrid);
  } else {
    exploreResultsDiv.innerHTML = `<p>No concerts found for your search. Try different keywords.</p>`;
  }
}
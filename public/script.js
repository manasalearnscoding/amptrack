// public/script.js

// Function to search for concerts using the Ticketmaster API
async function searchConcerts() {
  const searchQuery = document.getElementById('concert-search').value;
  const apikey = 'BgK2HR1cbLZENtALUAakJ3mtrGJCGhNf';

  const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?size=1&keyword=${encodeURIComponent(searchQuery)}&apikey=${apikey}`);
  const data = await response.json();
  console.log(data);
  displayConcertResults(data);
}

// Function to display concert results
function displayConcertResults(data) {
  const concertResultsDiv = document.getElementById('concert-results');
  concertResultsDiv.innerHTML = '';

  if (data._embedded && data._embedded.events) {
      data._embedded.events.forEach(event => {
          const concertCard = document.createElement('div');
          concertCard.classList.add('concert-card');
          concertCard.innerHTML = `
              <h3>${event.name}</h3>
              <p>Date: ${event.dates.start.localDate}</p>
              <p>Location: ${event._embedded.venues[0].city.name}</p>
              <button onclick="addConcert('${event.id}', '${event.name}', '${event.dates.start.localDate}')">Add to My Profile</button>
          `;
          concertResultsDiv.appendChild(concertCard);
      });
  } else {
      concertResultsDiv.innerHTML = `<p>No concerts found</p>`;
  }
}

// Function to add a concert to the user's profile
async function addConcert(id, name, date) {
  const userId = localStorage.getItem('userId'); // Assuming user ID is stored in localStorage (or session)
  const section = prompt('Enter your section:');
  const price = prompt('Enter price paid:');
  const review = prompt('Write a review:');

  const concertData = {
      userId,
      ticketmasterId: id,
      name: name,
      date: date,
      section: section,
      price: price,
      review: review
  };

  await fetch('/concerts/add', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(concertData),
  });

  alert('Concert added!');
  loadUserConcerts(); // Refresh the user's concert list
}

// Function to load the user's concerts from the database
async function loadUserConcerts() {
  const response = await fetch('/concerts/mine');
  const concerts = await response.json();

  const concertListDiv = document.getElementById('concert-list');
  concertListDiv.innerHTML = '';

  concerts.forEach(concert => {
      const concertItem = document.createElement('div');
      concertItem.classList.add('concert-item');
      concertItem.innerHTML = `
          <h3>${concert.name}</h3>
          <p>Date: ${concert.date}</p>
          <p>Section: ${concert.section}</p>
          <p>Price Paid: $${concert.price}</p>
          <p>Review: ${concert.review}</p>
          <button onclick="deleteConcert('${concert._id}')">Delete</button>
      `;
      concertListDiv.appendChild(concertItem);
  });
}

// Function to delete a concert from the user's profile
async function deleteConcert(concertId) {
  const userId = localStorage.getItem('userId');

  await fetch(`/concerts/delete`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, concertId }),
  });

  alert('Concert deleted!');
  loadUserConcerts(); // Refresh the list
}

// Load user concerts on page load
loadUserConcerts();

// Function to handle logout
function logout() {
  localStorage.removeItem('userId'); // Assuming you're storing user ID in localStorage for simplicity
  window.location.href = '/index.html'; // Redirect to login page
}
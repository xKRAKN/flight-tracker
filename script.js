const API_KEY = 'YOUR_API_KEY';
const BCD_COORDS = [10.7762, 123.0189];

// 1. Initialize the Map
const map = L.map('map').setView(BCD_COORDS, 11);

// 2. Add OpenStreetMap Tiles (Dark Mode version for that Radar feel)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

// 3. Add Airport Marker
L.marker(BCD_COORDS).addTo(map)
    .bindPopup('<b>Bacolod-Silay International Airport (BCD)</b>')
    .openPopup();

// 4. Fetch Flight Data (Manual Refresh)
async function fetchFlights() {
    try {
        const response = await fetch(`http://api.aviationstack.com/v1/flights?access_key=${API_KEY}`);
        const result = await response.json();
        
        if (result.data) {
            const arrivals = result.data.filter(f => f.arrival?.iata === 'BCD');
            const departures = result.data.filter(f => f.departure?.iata === 'BCD');

            renderList(arrivals, 'arrivals-list', 'from');
            renderList(departures, 'departures-list', 'to');
            
            // Optional: If API provides live lat/lng, you could add plane markers here
        }
    } catch (e) { console.error("Data fetch failed", e); }
}

function renderList(flights, elementId, dir) {
    const el = document.getElementById(elementId);
    el.innerHTML = flights.length ? '' : '<p>No live flights.</p>';
    flights.forEach(f => {
        const div = document.createElement('div');
        div.className = 'flight-card';
        div.innerHTML = `<strong>${f.flight.iata}</strong><br><small>${dir}: ${f.departure.iata}</small>`;
        el.appendChild(div);
    });
}

window.onload = fetchFlights;

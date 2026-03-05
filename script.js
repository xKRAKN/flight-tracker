const API_KEY = 'YOUR_API_KEY';
const BCD_COORDS = [10.7762, 123.0189];

// 1. Mock Data for Testing (Bacolod-Silay Airport)
const MOCK_DATA = {
    data: [
        { flight: { iata: "5J483" }, airline: { name: "Cebu Pacific" }, departure: { iata: "MNL" }, arrival: { iata: "BCD" }, flight_status: "landed" },
        { flight: { iata: "PR2132" }, airline: { name: "Philippine Airlines" }, departure: { iata: "BCD" }, arrival: { iata: "MNL" }, flight_status: "active" },
        { flight: { iata: "Z2605" }, airline: { name: "AirAsia" }, departure: { iata: "MNL" }, arrival: { iata: "BCD" }, flight_status: "scheduled" },
        { flight: { iata: "DG6507" }, airline: { name: "Cebgo" }, departure: { iata: "CEB" }, arrival: { iata: "BCD" }, flight_status: "active" }
    ]
};

// 2. Initialize the Map
const map = L.map('map').setView(BCD_COORDS, 11);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

L.marker(BCD_COORDS).addTo(map)
    .bindPopup('<b>Bacolod-Silay International Airport (BCD)</b>')
    .openPopup();

// 3. Fetch Data Logic (Live vs Test)
async function fetchFlights() {
    const isTestMode = document.getElementById('test-mode-toggle').checked;
    
    if (isTestMode) {
        console.log("Test Mode Active: Displaying Mock Data");
        processAndRender(MOCK_DATA);
    } else {
        console.log("Live Mode Active: Calling Aviationstack API");
        try {
            // Note: Use http if on free tier as https is often restricted
            const response = await fetch(`http://api.aviationstack.com/v1/flights?access_key=${API_KEY}`);
            const result = await response.json();
            processAndRender(result);
        } catch (e) { 
            console.error("Data fetch failed", e); 
            // Fallback message if API fails
            document.getElementById('arrivals-list').innerHTML = '<p style="color:red">API Error. Try Test Mode?</p>';
        }
    }
}

// 4. Filter and Send to Lists
function processAndRender(result) {
    if (result.data) {
        const arrivals = result.data.filter(f => f.arrival?.iata === 'BCD');
        const departures = result.data.filter(f => f.departure?.iata === 'BCD');

        renderList(arrivals, 'arrivals-list', 'from');
        renderList(departures, 'departures-list', 'to');
    }
}

// 5. Update UI
function renderList(flights, elementId, dir) {
    const el = document.getElementById(elementId);
    el.innerHTML = flights.length ? '' : '<p>No live flights found.</p>';
    
    flights.forEach(f => {
        const div = document.createElement('div');
        div.className = 'flight-card';
        
        // Logical check for departure vs arrival IATA display
        const locationIata = dir === 'from' ? f.departure.iata : f.arrival.iata;
        const status = f.flight_status || 'unknown';

        div.innerHTML = `
            <div class="flight-info">
                <strong>${f.flight.iata}</strong><br>
                <small>${dir.toUpperCase()}: ${locationIata}</small>
            </div>
            <div class="status-${status}">${status.toUpperCase()}</div>
        `;
        el.appendChild(div);
    });
}

// 6. Event Listeners
window.onload = fetchFlights;

// Trigger refresh whenever toggle is flipped
document.getElementById('test-mode-toggle').addEventListener('change', fetchFlights);

const API_KEY = '83d8ca161a2ddda48f3028d1656dec47';
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

// 3. The logic to decide between Mock and Real data
async function updateDashboard() {
    const toggle = document.getElementById('test-mode-toggle');
    const isTestMode = toggle ? toggle.checked : false; // Safe check
    
    if (isTestMode) {
        console.log("TEST MODE: ON");
        processAndRender(MOCK_DATA);
    } else {
        console.log("LIVE MODE: ON");
        try {
            const response = await fetch(`http://api.aviationstack.com/v1/flights?access_key=${API_KEY}`);
            const result = await response.json();
            processAndRender(result);
        } catch (e) {
            console.error("API Error:", e);
            document.getElementById('arrivals-list').innerHTML = '<p style="color:#e74c3c">API Limit reached or Offline. Switch to Test Mode!</p>';
        }
    }
}

// 4. Send the filtered data to the lists
function processAndRender(result) {
    if (!result || !result.data) return;
    
    const arrivals = result.data.filter(f => f.arrival?.iata === 'BCD');
    const departures = result.data.filter(f => f.departure?.iata === 'BCD');

    renderList(arrivals, 'arrivals-list', 'from');
    renderList(departures, 'departures-list', 'to');
}

// 5. Build the HTML cards
function renderList(flights, elementId, dir) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerHTML = flights.length ? '' : `<p>No ${dir === 'from' ? 'arrivals' : 'departures'} found.</p>`;
    
    flights.forEach(f => {
        const div = document.createElement('div');
        div.className = 'flight-card';
        const location = dir === 'from' ? (f.departure?.iata || "???") : (f.arrival?.iata || "???");
        
        div.innerHTML = `
            <div class="flight-info">
                <strong>${f.flight.iata}</strong><br>
                <small>${dir.toUpperCase()}: ${location}</small>
            </div>
            <div class="status-${f.flight_status || 'scheduled'}">${(f.flight_status || 'SCHED').toUpperCase()}</div>
        `;
        el.appendChild(div);
    });
}

// 6. Initialization & Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    // Initial load
    updateDashboard();

    // Listen for the toggle flip
    const toggle = document.getElementById('test-mode-toggle');
    if (toggle) {
        toggle.addEventListener('change', updateDashboard);
    }
});

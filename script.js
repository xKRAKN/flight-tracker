const API_KEY = 'YOUR_API_KEY'; // Replace with your real key
const BCD_COORDS = [10.7762, 123.0189];

// 1. Mock Data for Testing
const MOCK_DATA = {
    data: [
        { flight: { iata: "5J483" }, departure: { iata: "MNL", scheduled: "2026-03-05T08:30:00" }, arrival: { iata: "BCD", estimated: "2026-03-05T09:45:00" }, flight_status: "active" },
        { flight: { iata: "PR2132" }, departure: { iata: "BCD", scheduled: "2026-03-05T10:15:00" }, arrival: { iata: "MNL", estimated: "2026-03-05T11:30:00" }, flight_status: "scheduled" },
        { flight: { iata: "Z2605" }, departure: { iata: "MNL", scheduled: "2026-03-05T14:20:00" }, arrival: { iata: "BCD", estimated: "2026-03-05T15:35:00" }, flight_status: "scheduled" }
    ]
};

// 2. Initialize the Map
const map = L.map('map').setView(BCD_COORDS, 11);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

L.marker(BCD_COORDS).addTo(map).bindPopup('Bacolod-Silay Airport (BCD)');

// 3. Main Logic
async function updateDashboard() {
    const isTestMode = document.getElementById('test-mode-toggle').checked;
    const arrivalsEl = document.getElementById('arrivals-list');
    const departuresEl = document.getElementById('departures-list');

    if (isTestMode) {
        console.log("Using Mock Data");
        renderData(MOCK_DATA);
    } else {
        console.log("Fetching Live API via Proxy");
        try {
            const apiTarget = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiTarget)}`;
            
            const res = await fetch(proxyUrl);
            const data = await res.json();
            
            if (data.error) throw new Error(data.error.code);
            renderData(data);
        } catch (e) {
            console.error("API Error:", e);
            arrivalsEl.innerHTML = `<p style="color:#e74c3c; font-size:0.8rem;">Live API Blocked or Limit Reached. Use Test Mode!</p>`;
            departuresEl.innerHTML = "";
        }
    }
}

function renderData(result) {
    if (!result.data) return;
    const arrivals = result.data.filter(f => f.arrival?.iata === 'BCD');
    const departures = result.data.filter(f => f.departure?.iata === 'BCD');

    displayList(arrivals, 'arrivals-list', 'from');
    displayList(departures, 'departures-list', 'to');
}

function displayList(flights, elementId, dir) {
    const el = document.getElementById(elementId);
    el.innerHTML = flights.length ? '' : '<p style="font-size:0.8rem; color:#555;">No flights found.</p>';
    
    flights.forEach(f => {
        // Extract Time
        const timeValue = dir === 'from' ? (f.arrival.estimated || f.arrival.scheduled) : f.departure.scheduled;
        const timeDisplay = timeValue ? new Date(timeValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
        const location = dir === 'from' ? (f.departure?.iata || "???") : (f.arrival?.iata || "???");
        const status = f.flight_status || 'scheduled';

        const div = document.createElement('div');
        div.className = 'flight-card';
        div.innerHTML = `
            <div class="flight-info">
                <strong>${f.flight.iata}</strong> • <span class="flight-time">${timeDisplay}</span><br>
                <small>${dir.toUpperCase()}: ${location}</small>
            </div>
            <div class="status-${status}">${status.toUpperCase()}</div>
        `;
        el.appendChild(div);
    });
}

// 4. Set Up Listeners
window.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    document.getElementById('test-mode-toggle').addEventListener('change', updateDashboard);
});

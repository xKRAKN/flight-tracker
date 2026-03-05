const API_KEY = 'YOUR_API_KEY';
const BCD_COORDS = [10.7762, 123.0189];

const MOCK_DATA = {
    data: [
        { flight: { iata: "5J483" }, departure: { iata: "MNL", scheduled: "2026-03-05T08:30:00" }, arrival: { iata: "BCD", estimated: "2026-03-05T09:45:00" }, flight_status: "active" },
        { flight: { iata: "PR2132" }, departure: { iata: "BCD", scheduled: "2026-03-05T10:15:00" }, arrival: { iata: "MNL", estimated: "2026-03-05T11:30:00" }, flight_status: "scheduled" }
    ]
};

// Map Init
const map = L.map('map').setView(BCD_COORDS, 11);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
L.marker(BCD_COORDS).addTo(map).bindPopup('BCD Airport');

async function updateDashboard() {
    const isTestMode = document.getElementById('test-mode-toggle').checked;
    
    if (isTestMode) {
        renderData(MOCK_DATA);
    } else {
        try {
            const res = await fetch(`http://api.aviationstack.com/v1/flights?access_key=${API_KEY}`);
            const data = await res.json();
            renderData(data);
        } catch (e) {
            document.getElementById('arrivals-list').innerHTML = "<p style='color:red'>API Error (Check Key)</p>";
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
    el.innerHTML = flights.length ? '' : '<p>No flights.</p>';
    
    flights.forEach(f => {
        const timeValue = dir === 'from' ? (f.arrival.estimated || f.arrival.scheduled) : f.departure.scheduled;
        const timeDisplay = timeValue ? new Date(timeValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
        const location = dir === 'from' ? f.departure.iata : f.arrival.iata;

        const div = document.createElement('div');
        div.className = 'flight-card';
        div.innerHTML = `
            <div class="flight-info">
                <strong>${f.flight.iata}</strong> • <span class="flight-time">${timeDisplay}</span><br>
                <small>${dir.toUpperCase()}: ${location}</small>
            </div>
            <div class="status-${f.flight_status}">${f.flight_status.toUpperCase()}</div>
        `;
        el.appendChild(div);
    });
}

// Logic to bind the toggle correctly
window.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    document.getElementById('test-mode-toggle').addEventListener('change', updateDashboard);
});

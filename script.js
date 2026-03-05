const API_KEY = 'YOUR_API_KEY'; // Replace with your real Aviationstack key
const BCD_COORDS = [10.7762, 123.0189];

// 1. Mock Data
const MOCK_DATA = {
    data: [
        // DEPARTURES: departure.iata is "BCD"
        { flight: { iata: "5J478" }, airline: { name: "Cebu Pacific" }, departure: { iata: "BCD", scheduled: "2026-03-05T17:50:00" }, arrival: { iata: "MNL", airport: "Manila" }, flight_status: "active" },
        { flight: { iata: "PR2288" }, airline: { name: "Philippine Airlines" }, departure: { iata: "BCD", scheduled: "2026-03-05T18:40:00" }, arrival: { iata: "CEB", airport: "Cebu" }, flight_status: "active" },
        { flight: { iata: "5J2591" }, airline: { name: "Cebu Pacific" }, departure: { iata: "BCD", scheduled: "2026-03-05T18:55:00" }, arrival: { iata: "DVO", airport: "Davao City" }, flight_status: "scheduled" },
        { flight: { iata: "PR2136" }, airline: { name: "Philippine Airlines" }, departure: { iata: "BCD", scheduled: "2026-03-05T19:25:00" }, arrival: { iata: "MNL", airport: "Manila" }, flight_status: "active" },
        { flight: { iata: "Z2606" }, airline: { name: "AirAsia" }, departure: { iata: "BCD", scheduled: "2026-03-05T19:30:00" }, arrival: { iata: "MNL", airport: "Manila" }, flight_status: "active" },
        { flight: { iata: "DG6455" }, airline: { name: "Cebgo" }, departure: { iata: "BCD", scheduled: "2026-03-05T21:25:00" }, arrival: { iata: "CEB", airport: "Cebu" }, flight_status: "scheduled" },

        // ARRIVALS/APPROACHES: arrival.iata is "BCD"
        { flight: { iata: "PR2287" }, airline: { name: "Philippine Airlines" }, departure: { iata: "CEB", airport: "Cebu" }, arrival: { iata: "BCD", scheduled: "2026-03-05T18:15:00" }, flight_status: "scheduled" },
        { flight: { iata: "5J2590" }, airline: { name: "Cebu Pacific" }, departure: { iata: "DVO", airport: "Davao City" }, arrival: { iata: "BCD", scheduled: "2026-03-05T18:20:00" }, flight_status: "scheduled" },
        { flight: { iata: "PR2135" }, airline: { name: "Philippine Airlines" }, departure: { iata: "MNL", airport: "Manila" }, arrival: { iata: "BCD", scheduled: "2026-03-05T18:40:00" }, flight_status: "scheduled" },
        { flight: { iata: "Z2605" }, airline: { name: "AirAsia" }, departure: { iata: "MNL", airport: "Manila" }, arrival: { iata: "BCD", scheduled: "2026-03-05T18:45:00" }, flight_status: "scheduled" },
        { flight: { iata: "5J479" }, airline: { name: "Cebu Pacific" }, departure: { iata: "MNL", airport: "Manila" }, arrival: { iata: "BCD", scheduled: "2026-03-05T20:30:00" }, flight_status: "scheduled" },
        { flight: { iata: "DG6454" }, airline: { name: "Cebgo" }, departure: { iata: "CEB", airport: "Cebu" }, arrival: { iata: "BCD", scheduled: "2026-03-05T21:05:00" }, flight_status: "scheduled" }
    ]
};
let map;

// 2. Initialize App
window.addEventListener('DOMContentLoaded', () => {
    // FIX: Initialize map only after DOM is loaded
    map = L.map('map').setView(BCD_COORDS, 11);

    // FIX: Use HTTPS for tiles to avoid grey box on GitHub
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    L.marker(BCD_COORDS).addTo(map).bindPopup('Bacolod-Silay Airport');

    updateDashboard();

    document.getElementById('test-mode-toggle').addEventListener('change', updateDashboard);
});

async function updateDashboard() {
    const isTestMode = document.getElementById('test-mode-toggle').checked;
    
    if (isTestMode) {
        renderData(MOCK_DATA);
    } else {
        try {
            // FIX: Using CORS Proxy to allow HTTP API on HTTPS GitHub Pages
            const apiTarget = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiTarget)}`;
            
            const res = await fetch(proxyUrl);
            const data = await res.json();
            
            if (data.error) throw new Error(data.error.code);
            renderData(data);
        } catch (e) {
            console.error("API Fetch Error:", e);
            document.getElementById('arrivals-list').innerHTML = "<p style='color:red; font-size:0.8rem;'>API Blocked/Limit Reached. Switch to Test Mode!</p>";
        }
    }
}

function renderData(result) {
    if (!result || !result.data) return;

    // APPROACHES: Filter for flights where the ARRIVAL is BCD
    const arrivals = result.data.filter(f => f.arrival && f.arrival.iata === 'BCD');

    // DEPARTURES: Filter for flights where the DEPARTURE is BCD
    const departures = result.data.filter(f => f.departure && f.departure.iata === 'BCD');

    displayList(arrivals, 'arrivals-list', 'approach');
    displayList(departures, 'departures-list', 'departure');
}

function displayList(flights, elementId, type) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerHTML = flights.length ? '' : '<p style="color:#7f8c8d; padding:10px;">No flights found.</p>';
    
    flights.forEach(f => {
        // If it's an approach, we want to show where it came FROM (departure airport)
        // If it's a departure, we want to show where it is going TO (arrival airport)
        const city = type === 'approach' ? f.departure.airport : f.arrival.airport;
        const iata = type === 'approach' ? f.departure.iata : f.arrival.iata;
        const timeValue = type === 'approach' ? f.arrival.scheduled : f.departure.scheduled;
        
        const timeDisplay = new Date(timeValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement('div');
        div.className = 'flight-card';
        div.innerHTML = `
            <div class="flight-info" style="display: flex; align-items: center; width: 100%;">
                <div style="min-width: 75px;">
                    <div style="color: #f1c40f; font-weight: bold; font-size: 1rem;">${timeDisplay}</div>
                    <small style="color: #95a5a6;">${f.flight_status === 'active' ? 'Live' : 'Scheduled'}</small>
                </div>
                <div style="margin-left: 15px; flex-grow: 1;">
                    <strong style="font-size: 1rem;">${city} <span style="background: #333; padding: 2px 5px; border-radius: 3px; font-size: 0.7rem;">${iata}</span></strong><br>
                    <small style="color: #95a5a6;">${f.flight.iata} • ${f.airline.name}</small>
                </div>
                <div style="color: ${f.flight_status === 'active' ? '#2ecc71' : '#7f8c8d'}; font-size: 1.2rem;">●</div>
            </div>
        `;
        el.appendChild(div);
    });
}

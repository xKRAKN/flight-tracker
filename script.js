const API_KEY = 'YOUR_API_KEY'; // Replace with your real Aviationstack key
const BCD_COORDS = [10.7762, 123.0189];

// 1. Mock Data
const MOCK_DATA = {
    data: [
        // --- DEPARTURES (from your first image) ---
        { flight: { iata: "5J478" }, airline: { name: "Cebu Pacific" }, departure: { iata: "BCD", scheduled: "2026-03-05T17:50:00" }, arrival: { iata: "MNL", airport: "Manila" }, flight_status: "active" },
        { flight: { iata: "PR2288" }, airline: { name: "Philippine Airlines" }, departure: { iata: "BCD", scheduled: "2026-03-05T18:40:00" }, arrival: { iata: "CEB", airport: "Cebu" }, flight_status: "active" },
        { flight: { iata: "5J2591" }, airline: { name: "Cebu Pacific" }, departure: { iata: "BCD", scheduled: "2026-03-05T18:55:00" }, arrival: { iata: "DVO", airport: "Davao City" }, flight_status: "scheduled" },
        { flight: { iata: "PR2136" }, airline: { name: "Philippine Airlines" }, departure: { iata: "BCD", scheduled: "2026-03-05T19:25:00" }, arrival: { iata: "MNL", airport: "Manila" }, flight_status: "active" },
        { flight: { iata: "Z2606" }, airline: { name: "AirAsia" }, departure: { iata: "BCD", scheduled: "2026-03-05T19:30:00" }, arrival: { iata: "MNL", airport: "Manila" }, flight_status: "active" },
        { flight: { iata: "DG6455" }, airline: { name: "Cebgo" }, departure: { iata: "BCD", scheduled: "2026-03-05T21:25:00" }, arrival: { iata: "CEB", airport: "Cebu" }, flight_status: "scheduled" },

        // --- ARRIVALS / APPROACHES (from your second image) ---
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
    if (!result.data) return;
    const arrivals = result.data.filter(f => f.arrival?.iata === 'BCD');
    const departures = result.data.filter(f => f.departure?.iata === 'BCD');

    displayList(arrivals, 'arrivals-list', 'from');
    displayList(departures, 'departures-list', 'to');
}

function displayList(flights, elementId, dir) {
    const el = document.getElementById(elementId);
    el.innerHTML = flights.length ? '' : '<p style="color:#555; font-size:0.8rem;">No flights found.</p>';
    
    flights.forEach(f => {
        const timeValue = dir === 'from' ? (f.arrival.estimated || f.arrival.scheduled) : f.departure.scheduled;
        const timeDisplay = timeValue ? new Date(timeValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
        
        // Show City Name + IATA Code (e.g., Manila MNL)
        const city = dir === 'from' ? (f.departure?.airport || "Unknown") : (f.arrival?.airport || "Unknown");
        const iata = dir === 'from' ? (f.departure?.iata || "???") : (f.arrival?.iata || "???");
        
        const statusText = f.flight_status === 'scheduled' ? 'Scheduled' : timeDisplay;
        const statusClass = `status-${f.flight_status}`;

        const div = document.createElement('div');
        div.className = 'flight-card';
        div.innerHTML = `
            <div class="flight-info">
                <div style="display: flex; flex-direction: column;">
                    <span class="flight-time">${timeDisplay}</span>
                    <small style="color: #95a5a6;">${statusText}</small>
                </div>
                <div style="margin-left: 15px;">
                    <strong>${city} <span style="background: #333; padding: 1px 4px; border-radius: 3px; font-size: 0.7rem;">${iata}</span></strong><br>
                    <small>${f.flight.iata} • ${f.airline.name}</small>
                </div>
            </div>
            <div class="${statusClass}">●</div>
        `;
        el.appendChild(div);
    });
}

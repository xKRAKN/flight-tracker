const API_KEY = 'YOUR_API_KEY'; // Replace with your real Aviationstack key
const AIRPORT_IATA = 'BCD';

async function fetchFlights() {
    try {
        const response = await fetch(`http://api.aviationstack.com/v1/flights?access_key=${API_KEY}`);
        const result = await response.json();
        
        if (!result.data) {
            document.getElementById('arrivals-list').innerText = "No data available.";
            document.getElementById('departures-list').innerText = "No data available.";
            return;
        }

        const arrivals = result.data.filter(f => f.arrival && f.arrival.iata === AIRPORT_IATA);
        const departures = result.data.filter(f => f.departure && f.departure.iata === AIRPORT_IATA);

        renderFlights(arrivals, 'arrivals-list', 'from');
        renderFlights(departures, 'departures-list', 'to');

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function renderFlights(flights, elementId, directionText) {
    const container = document.getElementById(elementId);
    container.innerHTML = flights.length === 0 ? '<p>No flights found.</p>' : '';

    flights.forEach(f => {
        const div = document.createElement('div');
        div.className = 'flight-card';
        const location = directionText === 'from' ? (f.departure.iata || "Unknown") : (f.arrival.iata || "Unknown");
        
        div.innerHTML = `
            <div>
                <strong>${f.flight.iata}</strong> | ${f.airline.name}<br>
                <small>${directionText.toUpperCase()}: ${location}</small>
            </div>
            <div class="status-${f.flight_status}">${f.flight_status.toUpperCase()}</div>
        `;
        container.appendChild(div);
    });
}

// Loads only once per refresh
window.onload = fetchFlights;

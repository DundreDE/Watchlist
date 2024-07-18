const apiKey = 'c5dd411b';

// Initialisiere die Watchlist aus dem localStorage oder leere Array, wenn nicht vorhanden
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Funktion zum Anzeigen der Filme in der Watchlist
function renderWatchlist() {
    const watchlistElement = document.getElementById('watchlist');
    watchlistElement.innerHTML = ''; // leere die vorherigen Einträge

    watchlist.forEach(movie => {
        const li = createMovieElement(movie);
        li.onclick = () => openDetails(movie.imdbID); // onclick zum Öffnen der Details
        watchlistElement.appendChild(li);
    });
}

// Event Listener für die Suche nach Filmen
document.getElementById('searchButton').addEventListener('click', searchMovies);

// Beim Laden der Seite die Watchlist und empfohlene Filme anzeigen
renderWatchlist();
fetchRecommendedMovies();
checkSearchParams();


function fetchRecommendedMovies() {
    fetch(`https://www.omdbapi.com/?s=movie&apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            let output = '';
            if (data.Response === 'False') {
                output = '<p class="no-results text-center text-white">Keine empfohlenen Filme gefunden</p>';
            } else {
                const results = data.Search.slice(0, 3); // Nur die ersten 3 Ergebnisse
                if (results && results.length > 0) {
                    results.sort((a, b) => b.Year - a.Year);
                    results.forEach(movie => {
                        fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`)
                            .then(response => response.json())
                            .then(movieDetails => {
                                if (parseFloat(movieDetails.imdbRating) >= 7) {
                                    output += `
                                        <li class="group flex flex-col md:flex-row items-center space-x-4 bg-gray-700 p-4 rounded-lg mb-3 shadow-lg cursor-pointer transition-transform transform hover:scale-105" onclick="openDetails('${movieDetails.imdbID}')">
                                            <img src="${movieDetails.Poster !== 'N/A' ? movieDetails.Poster : 'https://via.placeholder.com/150'}" alt="Poster" class="w-full md:w-24 md:h-36 object-cover rounded-lg mb-3 md:mb-0">
                                            <div class="flex-1 text-center md:text-left">
                                                <h3 class="text-white font-semibold">${movieDetails.Title} (${movieDetails.Year})</h3>
                                                <p class="text-gray-400">Rating: ${movieDetails.imdbRating}</p>
                                            </div>
                                            <button onclick="addToWatchlist('${movieDetails.imdbID}', event)" class="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg">
                                                Zur Watchlist hinzufügen
                                            </button>
                                        </li>
                                    `;
                                }
                                document.getElementById('recommendedMovies').innerHTML = output;
                            });
                    });
                } else {
                    output = '<p class="no-results text-center text-white">Keine empfohlenen Filme gefunden</p>';
                }
                document.getElementById('recommendedMovies').innerHTML = output;
            }
        })
        .catch(err => console.error('Fehler beim Abrufen der empfohlenen Filme:', err));
}




// Funktion zum Suchen von Filmen und URL-Update
function searchMovies() {
    const searchInput = document.getElementById('searchInput').value;
    if (searchInput) {
        const searchQuery = encodeURIComponent(searchInput);
        window.history.pushState({}, '', `?search=${searchQuery}`);
        fetch(`https://www.omdbapi.com/?s=${searchQuery}&apikey=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                let output = '';
                if (data.Response === 'False') {
                    output = '<p class="no-results text-center text-white">Kein Suchergebnis</p>';
                } else {
                    const results = data.Search;
                    results.forEach(movie => {
                        fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`)
                            .then(response => response.json())
                            .then(movieDetails => {
                                output += `
                                    <li class="flex items-center space-x-4 bg-gray-700 p-3 rounded-lg mb-3 shadow-lg cursor-pointer transition-transform transform hover:scale-105" onclick="openDetails('${movieDetails.imdbID}')">
                                        <img src="${movieDetails.Poster !== 'N/A' ? movieDetails.Poster : 'https://via.placeholder.com/150'}" alt="Poster" class="w-24 h-36 object-cover rounded-lg">
                                        <div class="flex-1">
                                            <h3 class="text-white font-semibold">${movieDetails.Title} (${movieDetails.Year})</h3>
                                            <p class="text-gray-400">Rating: ${movieDetails.imdbRating}</p>
                                        </div>
                                        <button onclick="addToWatchlist('${movieDetails.imdbID}', event)" class="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded-lg">
                                            Zur Watchlist hinzufügen
                                        </button>
                                    </li>
                                `;
                                document.getElementById('searchResults').innerHTML = output;
                            });
                    });
                }
                document.getElementById('searchResults').innerHTML = output;
            })
            .catch(err => console.error('Fehler beim Suchen der Filme:', err));
    }
}

// Funktion zum Überprüfen von Suchparametern aus der URL beim Laden der Seite
function checkSearchParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        document.getElementById('searchInput').value = searchQuery;
        searchMovies();
    }
}

// Funktion zum Hinzufügen eines Films zur Watchlist
function addToWatchlist(id, event) {
    event.stopPropagation(); // Verhindert das Auslösen des click-Events des li-Elements
    
    // Überprüfe, ob der Film bereits in der Watchlist vorhanden ist
    const movieExists = watchlist.some(movie => movie.imdbID === id);
    
    if (movieExists) {
        alert('Dieser Film ist bereits in der Watchlist.');
        return;
    }

    fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(movie => {
            watchlist.push(movie); // Füge den Film zur Watchlist hinzu
            localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Speichere die Watchlist im localStorage
            renderWatchlist(); // Aktualisiere die Anzeige der Watchlist
        })
        .catch(err => console.error('Fehler beim Hinzufügen des Films zur Watchlist:', err));
}

// Funktion zum Entfernen eines Films aus der Watchlist
function removeFromWatchlist(id, event) {
    event.stopPropagation(); // Verhindert das Auslösen des click-Events des li-Elements
    watchlist = watchlist.filter(movie => movie.imdbID !== id); // Filtere den Film aus der Watchlist
    localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Speichere die aktualisierte Watchlist im localStorage
    renderWatchlist(); // Aktualisiere die Anzeige der Watchlist
}

// Funktion zum Öffnen der Detailseite eines Films
function openDetails(id) {
    window.location.href = `details.html?id=${id}`;
}

// Hilfsfunktion zur Erstellung eines HTML-Elements für einen Filmfunction createMovieElement(movie) {
    function createMovieElement(movie) {
        const li = document.createElement('li');
        li.className = 'flex items-center space-x-4 bg-gray-700 p-3 rounded-lg mb-3 shadow-lg cursor-pointer transition-transform transform hover:scale-105';
        li.setAttribute('onclick', `openDetails('${movie.imdbID}')`);
        
        li.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'}" alt="Poster" class="w-24 h-36 object-cover rounded-lg">
            <div class="flex-1">
                <h3 class="text-white font-semibold">${movie.Title} (${movie.Year})</h3>
                <p class="text-gray-400">Rating: ${movie.imdbRating}</p>
            </div>
          <button onclick="removeFromWatchlist('${movie.imdbID}', event)" class="bg-red-600 hover:bg-red-800 text-white font-semibold py-1 px-3 rounded-lg">
            Entfernen
        </button>
        `;
        
        return li;
    }
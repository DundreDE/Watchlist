document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'c5dd411b';
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}&plot=full`)
        .then(response => response.json())
        .then(movie => {
            document.getElementById('movieTitle').innerText = movie.Title;
            document.getElementById('moviePoster').src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200';
            document.getElementById('moviePlot').innerText = `Plot: ${movie.Plot}`;
            document.getElementById('movieGenre').innerText = `Genre: ${movie.Genre}`;
            document.getElementById('movieDirector').innerText = `Regisseur: ${movie.Director}`;
            document.getElementById('movieActors').innerText = `Schauspieler: ${movie.Actors}`;

            const rating = parseFloat(movie.imdbRating);
            if (!isNaN(rating)) {
                document.getElementById('ratingBar').style.width = `${rating * 10}%`;
                document.getElementById('ratingValue').innerText = `${rating} / 10`;
            } else {
                document.getElementById('ratingBar').style.width = '0%';
                document.getElementById('ratingValue').innerText = 'N/A';
            }
        })
        .catch(err => console.error(err));
});

const apiKey = 'c5dd411b';

// Initialisiere die Watchlist aus dem localStorage oder leere Array, wenn nicht vorhanden
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Funktion zum Hinzufügen eines Films zur Watchlist
function addToWatchlist() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(movie => {
            watchlist.push(movie); // Füge den Film zur Watchlist hinzu
            localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Speichere die Watchlist im localStorage
            showNotification(); // Zeige die Benachrichtigung an
        })
        .catch(err => console.error('Fehler beim Hinzufügen des Films zur Watchlist:', err));
}

// Funktion zum Anzeigen der Benachrichtigung
function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000); // Benachrichtigung für 3 Sekunden anzeigen
}

// Funktion zum Entfernen eines Films aus der Watchlist
function removeFromWatchlist(id) {
    watchlist = watchlist.filter(movie => movie.imdbID !== id); // Filtere den Film aus der Watchlist
    localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Speichere die aktualisierte Watchlist im localStorage
    // Wenn hier eine Watchlist-Seite vorhanden ist, solltest du die Funktion `renderWatchlist` aufrufen
}

// Funktion zum Öffnen der Detailseite eines Films
function openDetails(id) {
    window.location.href = `details.html?id=${id}`;
}

// Hilfsfunktion zur Erstellung eines HTML-Elements für einen Film
function createMovieElement(movie) {
    const li = document.createElement('li');
    li.innerHTML = `
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/50'}" alt="Poster">
        <span>${movie.Title} (${movie.Year}) - ${movie.Type}</span>
        <span>Rating: ${movie.imdbRating}</span>
        <button onclick="removeFromWatchlist('${movie.imdbID}')">Entfernen</button>
    `;
    return li;
}

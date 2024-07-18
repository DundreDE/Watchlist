// app.js
const apiKey = 'c5dd411b';

document.getElementById('searchButton').addEventListener('click', searchMovies);

function searchMovies() {
    const searchInput = document.getElementById('searchInput').value;
    fetch(`http://www.omdbapi.com/?s=${searchInput}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const results = data.Search;
            let output = '';
            results.forEach(movie => {
                output += `
                    <li>
                        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/50'}" alt="Poster">
                        <span>${movie.Title} (${movie.Year})</span>
                        <button onclick="addToWatchlist('${movie.imdbID}')">Zur Watchlist hinzufügen</button>
                    </li>
                `;
            });
            document.getElementById('searchResults').innerHTML = output;
        })
        .catch(err => console.error(err));
}

function addToWatchlist(id) {
    fetch(`http://www.omdbapi.com/?i=${id}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(movie => {
            const watchlist = document.getElementById('watchlist');
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/50'}" alt="Poster">
                <span>${movie.Title} (${movie.Year}) - ${movie.Type}</span>
                <span>Rating: ${movie.imdbRating}</span>
                <button onclick="removeFromWatchlist(this)">Entfernen</button>
            `;
            watchlist.appendChild(li);
        })
        .catch(err => console.error(err));
}

function removeFromWatchlist(button) {
    const li = button.parentElement;
    li.remove();
}

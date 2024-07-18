document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'c5dd411b';
    const watchmodeApiKey = 'MtYFACMaEm1n6c4kkHDqSVU74MSGLNY3jc2oWoXY';
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

            // Streaming-Anbieter abrufen
            fetch(`https://api.watchmode.com/v1/title/${movieId}/sources/?apiKey=${watchmodeApiKey}`)
                .then(response => response.json())
                .then(data => {
                    displayStreamingProviders(data);
                })
                .catch(err => console.error('Fehler beim Abrufen der Streaming-Anbieter:', err));
        })
        .catch(err => console.error(err));

    // Funktion zum Hinzufügen eines Films zur Watchlist
    function addToWatchlist() {
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

    // Funktion zum Anzeigen der Streaming-Anbieter
    function displayStreamingProviders(data) {
        const providersContainer = document.getElementById('providersContainer');
        providersContainer.innerHTML = '';

        // Filtere die Streaming-Anbieter nach Region (DE oder US) und wähle die wichtigsten aus
        const importantProviders = ['Netflix', 'Amazon Prime Video', 'Disney+', 'Hulu', 'HBO Max', 'Amazon'];
        const filteredProviders = data.filter(provider => 
            (provider.region === 'US' || provider.region === 'DE') && 
            importantProviders.includes(provider.name)
        );

        // Gruppiere Anbieter nach Name, um Duplikate zu vermeiden
        const groupedProviders = filteredProviders.reduce((acc, provider) => {
            if (!acc[provider.name]) {
                acc[provider.name] = provider;
            }
            return acc;
        }, {});

        Object.values(groupedProviders).forEach(provider => {
            const providerElement = document.createElement('a');
            providerElement.href = provider.web_url;
            providerElement.target = '_blank';
            providerElement.className = 'bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105';
            providerElement.innerText = `${provider.name} (${provider.region})`;
            providersContainer.appendChild(providerElement);
        });

        if (Object.keys(groupedProviders).length === 0) {
            const noProviders = document.createElement('p');
            noProviders.className = 'text-white';
            noProviders.innerText = 'Keine Streaming-Anbieter gefunden';
            providersContainer.appendChild(noProviders);
        }
    }
});

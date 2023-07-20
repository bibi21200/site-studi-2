// game-cards.js

function showGameCards(data) {
    const gameContainer = document.querySelector('.game-container');
    gameContainer.innerHTML = ""; // Effacer le contenu précédent du conteneur
  
    // Parcourir les données des jeux et créer une carte pour chaque jeu
    data.forEach(game => {
      const card = document.createElement('div');
      card.classList.add('game-card');
  
      // Ajouter le contenu de la carte (par exemple, titre, description, image, etc.)
      card.innerHTML = `
        <img src="${game.image}" alt="${game.title}" class="game-image">
        <div class="game-details">
          <h3 class="game-title">${game.title}</h3>
          <p class="game-description">${game.description}</p>
          <p class="game-genre">Genre: ${game.genre}</p>
          <p class="game-platform">Plateforme: ${game.platform}</p>
          <button class="btn-favorite" data-game-id="${game.id}">Favoris</button>
        </div>
      `;
  
      // Ajouter la carte au conteneur des jeux
      gameContainer.appendChild(card);
    });
  }
  
  // Fonction de correspondance du genre
  function matchGenre(gameGenres, filterGenre) {
    const genresList = gameGenres.split(',').map(genre => genre.trim());
    return genresList.some(genre => genre.toLowerCase().replace(/\s/g, '') === filterGenre.toLowerCase().replace(/\s/g, ''));
  
     // Fonction de correspondance du genre
     const matchGenre = (gameGenre, filterGenre) =>
     gameGenre.toLowerCase().replace(/\s/g, '') === filterGenre.toLowerCase().replace(/\s/g, '');
  }
  
  function showGameCardsBygenre(games, genre) {
    const gameContainer = document.querySelector('.game-container');
    gameContainer.innerHTML = ""; // Effacer le contenu précédent du conteneur
  
  
    // Filtrer les jeux par catégorie
    const filteredGames = games.filter(game => matchGenre(game.genre, genre));
  
    // Parcourir les jeux filtrés et créer les cartes correspondantes
    filteredGames.forEach(game => {
      const card = document.createElement('div');
      card.classList.add('game-card');
  
      // Ajouter le contenu de la carte (par exemple, titre, description, image, etc.)
      card.innerHTML = `
        <img src="${game.image}" alt="${game.title}" class="game-image">
        <div class="game-details">
          <h3 class="game-title">${game.title}</h3>
          <p class="game-description">${game.description}</p>
          <p class="game-genre">Genre: ${game.genre}</p>
          <p class="game-platform">Plateforme: ${game.platform}</p>
          <button class="btn-favorite" data-game-id="${game.id}">Favoris</button>
        </div>
      `;
  
      // Ajouter la carte au conteneur des jeux
      gameContainer.appendChild(card);
    });
  }
  
  
  // Appeler la fonction updateGameList au chargement de la page
  document.addEventListener('DOMContentLoaded', () => {
    fetch("/get_games")
      .then(response => response.json())
      .then(data => {
        showGameCards(data);
  
        // Récupérer tous les boutons de catégorie
        const genreButtons = document.querySelectorAll('.navbar-2 a');
  
        // Ajouter un gestionnaire d'événements au clic de chaque bouton
        genreButtons.forEach(button => {
          button.addEventListener('click', event => {
            event.preventDefault(); // Empêcher le comportement par défaut du lien
  
            const genre = button.id; // Récupérer l'ID de la catégorie
  
            if (genre === "all") {
              showGameCards(data); // Afficher tous les jeux si la catégorie est "all"
            } else {
              showGameCardsBygenre(data, genre); // Filtrer les jeux par catégorie
            }
          });
        });
      })
      .catch(error => console.error("Erreur lors de la récupération des jeux :", error));
  });
  
  function loadGamesByGenre(genre) {
    $.ajax({
      url: "{{ url_for('get_games_by_genre') }}",  // Remplacez 'get_games_by_genre' par le nom de votre vue Flask pour récupérer les jeux par genre
      method: "POST",
      data: { genre: genre },
      success: function(data) {
        // Mise à jour de la div avec la classe "game-container" pour afficher les jeux
        $(".game-container").html(data);
      },
      error: function(xhr, status, error) {
        console.log("Erreur lors du chargement des jeux par genre:", error);
      }
    });
  }
  
  // Écoutez le clic sur les liens de genre
  $(document).on("click", ".genre-link", function(e) {
    e.preventDefault();
    var genre = $(this).attr("id");  // Récupérez l'ID du lien de genre cliqué
    loadGamesByGenre(genre);  // Chargez les jeux associés à ce genre
  });
  
  
  // Appeler la fonction updateGameList au chargement de la page
  document.addEventListener('DOMContentLoaded', () => {
    fetch("/get_games")
      .then(response => response.json())
      .then(data => {
        // ...
  
        // Ajouter un gestionnaire d'événements au clic du bouton "Favoris"
        const favoriteButtons = document.querySelectorAll('.btn-favorite');
        favoriteButtons.forEach(button => {
          button.addEventListener('click', event => {
            event.preventDefault(); // Empêcher le comportement par défaut du bouton
  
            const gameId = button.dataset.gameId; // Récupérer l'ID du jeu associé au bouton "Favoris"
  
            // Appeler la fonction pour enregistrer le jeu dans la liste des favoris de l'utilisateur
            saveGameToFavorites(gameId);
          });
        });
      })
      .catch(error => console.error("Erreur lors de la récupération des jeux :", error));
  });
  
  // Fonction pour enregistrer le jeu dans la liste des favoris de l'utilisateur
  function saveGameToFavorites(gameId) {
    // Envoyer une requête AJAX pour enregistrer le jeu dans la liste des favoris de l'utilisateur
    fetch("/add_favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json" // Indique au serveur que les données sont au format JSON
      },
      body: JSON.stringify({ game_id: gameId }) // Convertit les données en JSON
    })
      .then(response => response.json())
      .then(data => {
        // Gérer la réponse de la requête (par exemple, afficher un message de succès)
        console.log(data.message);
      })
      .catch(error => console.error("Erreur lors de l'enregistrement du jeu dans les favoris :", error));
  }
  
  

document.getElementById('account-btn').addEventListener('click', () => {
    // Ajouter la classe "active" au conteneur du profil pour l'afficher
    document.getElementById('profil-container').classList.add('active');
    // Supprimer la classe "active" du conteneur Favori pour le masquer
    document.getElementById('favori-container').classList.remove('active');
  });
  
  document.getElementById('favori-btn').addEventListener('click', () => {
    // Ajouter la classe "active" au conteneur Favori pour l'afficher
    document.getElementById('favori-container').classList.add('active');
    // Supprimer la classe "active" du conteneur du profil pour le masquer
    document.getElementById('profil-container').classList.remove('active');
  });
  
  function openProfile() {
    // Effectuer une requête AJAX pour récupérer les informations du profil
    axios.get("/get_profile")
      .then(response => {
        // Récupérer les données du profil de la réponse JSON
        const { username, email, password } = response.data;
  
        // Mettre à jour le contenu de la page de profil avec les informations récupérées
        document.getElementById("username").textContent = `Nom d'utilisateur : ${username}`;
        document.getElementById("email").textContent = `Email : ${email}`;
       
  
        // Afficher le conteneur du profil
        document.getElementById('profil-container').classList.add('active');
        // Masquer le conteneur Favori
        document.getElementById('favori-container').classList.remove('active');
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des informations du profil :", error);
      });
  }
  
  
    function changePassword(event) {
      event.preventDefault();
  
      const form = event.target;
      const currentPassword = form.elements.current_password.value;
      const newPassword = form.elements.new_password.value;
      const confirmPassword = form.elements.confirm_password.value;
  
      if (newPassword !== confirmPassword) {
          alert("Les mots de passe ne correspondent pas. Veuillez réessayer.");
          return;
      }
  
      // Effectuer une requête AJAX pour vérifier le mot de passe actuel
      axios.post("/check_current_password", { current_password: currentPassword })
          .then(response => {
              if (response.data.success) {
                  // Le mot de passe actuel est correct, effectuer la requête AJAX pour changer le mot de passe
                  axios.post("/change_password", { new_password: newPassword })
                      .then(response => {
                          alert(response.data.message);
                          form.reset();
                      })
                      .catch(error => {
                          console.error("Erreur lors du changement de mot de passe :", error);
                          alert("Une erreur s'est produite lors du changement de mot de passe.");
                      });
              } else {
                  // Le mot de passe actuel est incorrect, afficher un message d'erreur
                  alert("Le mot de passe actuel est incorrect. Veuillez réessayer.");
              }
          })
          .catch(error => {
              console.error("Erreur lors de la vérification du mot de passe actuel :", error);
              alert("Une erreur s'est produite lors de la vérification du mot de passe actuel.");
          });
  }
    
  document.addEventListener('DOMContentLoaded', function() {
    const editButton = document.getElementById("edit-btn");
    const displayedPhoto = document.getElementById("displayedPhoto");
  
    // Lorsque l'utilisateur clique sur le bouton "Modifier la Photo"
    editButton.addEventListener("click", function() {
        // Créer un input de type "file" pour permettre à l'utilisateur de choisir une image
        const fileInput = document.createElement("input");
        fileInput.type = "file";
  
        // Lorsque l'utilisateur sélectionne un fichier
        fileInput.addEventListener("change", function() {
            // Récupérer le fichier sélectionné
            const selectedFile = fileInput.files[0];
  
            // Afficher l'image dans l'élément "photo"
            const image = document.createElement("img");
            image.src = URL.createObjectURL(selectedFile);
            image.alt = "Photo de profil";
            image.width = 250;
            image.height = 250;
  
            // Remplacer l'image actuelle (s'il y en a une) par la nouvelle image
            displayedPhoto.innerHTML = "";
            displayedPhoto.appendChild(image);
  
            // Enregistrer l'image dans la base de données (vous devez implémenter cette partie côté serveur)
            saveImageToDatabase(selectedFile);
        });
  
        // Déclencher le clic du bouton de sélection de fichier
        fileInput.click();
    });
  
    // Fonction pour enregistrer l'image dans la base de données (à implémenter côté serveur)
    function saveImageToDatabase(imageFile) {
        // Utilisez une requête AJAX avec Axios pour envoyer l'image au serveur
        // Exemple (à adapter selon votre backend) :
        const formData = new FormData();
        formData.append("photo", imageFile);
  
        axios.post("/upload_photo", formData)
            .then(response => {
                // Traitement de la réponse du serveur (si nécessaire)
                console.log("Image enregistrée dans la base de données.");
            })
            .catch(error => {
                console.error("Erreur lors de l'enregistrement de l'image :", error);
                alert("Une erreur s'est produite lors de l'enregistrement de l'image.");
            });
    }
  });
  
  function openFavori() {
    axios.get("/get_favorites")
      .then(response => {
        const favoriteGames = response.data.favorite_games;
        const tableBody = document.getElementById("favorite-games-table-body");
        tableBody.innerHTML = ""; // Effacer le contenu actuel du tableau
  
        // Pour chaque jeu favori, créer une nouvelle ligne dans le tableau
        favoriteGames.forEach(game => {
          const newRow = document.createElement("tr");
  
          const idCell = document.createElement("td");
          idCell.textContent = game.id;
          newRow.appendChild(idCell);
  
          const titleCell = document.createElement("td");
          titleCell.textContent = game.title;
          newRow.appendChild(titleCell);
  
          const descriptionCell = document.createElement("td");
          descriptionCell.textContent = game.description;
          newRow.appendChild(descriptionCell);
  
          const genreCell = document.createElement("td");
          genreCell.textContent = game.genre;
          newRow.appendChild(genreCell);
  
          const platformCell = document.createElement("td");
          platformCell.textContent = game.platform;
          newRow.appendChild(platformCell);
  
          // Ajouter un bouton pour supprimer la ligne du tableau
          const deleteCell = document.createElement("td");
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Supprimer";
          deleteButton.addEventListener("click", () => removeFavoriteGame(game.id));
          deleteCell.appendChild(deleteButton);
          newRow.appendChild(deleteCell);
  
          // Ajouter la nouvelle ligne au corps du tableau
          tableBody.appendChild(newRow);
        });
  
        // Afficher le conteneur Favori
        document.getElementById('favori-container').classList.add('active');
        // Masquer le conteneur du profil
        document.getElementById('profil-container').classList.remove('active');
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des informations des jeux favoris :", error);
      });
  }
  
  
  
  function removeFavoriteGame(gameid) {
    // Envoyer une requête AJAX pour supprimer le jeu des favoris de l'utilisateur
    fetch("/remove_favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ game_id: gameid })
    })
      .then(response => response.json())
      .then(data => {
        // Vérifier si la suppression a réussi
        if (data.success) {
          console.log(data.message);
          // La suppression a réussi, rafraîchir la liste des favoris
          fetchFavoriteGames();
        } else {
          console.error(data.message);
          // Afficher un message d'erreur si la suppression a échoué
          alert("Une erreur s'est produite lors de la suppression du jeu des favoris. Veuillez réessayer.");
        }
      })
      .catch(error => console.error("Erreur lors de la suppression du jeu des favoris :", error));
  }
  
  function fetchFavoriteGames() {
    // Effectuer une requête AJAX pour récupérer la liste des jeux favoris de l'utilisateur
    fetch("/get_favorites")
      .then(response => response.json())
      .then(data => {
        // Récupérer les jeux favoris de la réponse JSON
        const favoriteGames = data.favorite_games;
  
        // Mettre à jour le tableau des favoris dans la page HTML
        const favoritesTableBody = document.getElementById("favorite-games-table-body");
        favoritesTableBody.innerHTML = ""; // Effacer le contenu actuel du tableau
  
        // Parcourir la liste des jeux favoris et ajouter chaque jeu au tableau
        favoriteGames.forEach(game => {
          const newRow = favoritesTableBody.insertRow();
          newRow.innerHTML = `
            <td>${game.id}</td>
            <td>${game.title}</td>
            <td>${game.description}</td>
            <td>${game.genre}</td>
            <td>${game.platform}</td>
            
            <td>
              <button id="remove-btn" class="remove-btn" onclick="removeFavoriteGame(${game.id})">Supprimer</button>
            </td>
          `;
        });
      })
      .catch(error => console.error("Erreur lors de la récupération des jeux favoris :", error));
  }
  
// index.js

/* ---- Menu Overlay ----  */

// Sélectionnez les éléments du DOM
// Select DOM elements
const burger = document.querySelector('.burger');
const menu = document.querySelector('.menu');
const overlay = document.querySelector('.overlay');
const closeBtn = document.querySelector('.close');

// Fonction pour ouvrir le menu
// Function to open the menu
function openMenu() {
  menu.classList.add('open');
  closeBtn.classList.add('active');
}

// Fonction pour fermer le menu
// Function to close the menu
function closeMenu() {
  menu.classList.remove('open');
  closeBtn.classList.remove('active');
  // Réinitialisation des animations
  // Reset animations
  const menuItems = document.querySelectorAll('.menu li');
  menuItems.forEach((item, index) => {
    item.style.transitionDelay = ``;
    item.style.opacity = '';
  });

}

// Écoutez le clic sur l'icône du menu burger
// Listen for click on burger menu icon
burger.addEventListener('click', openMenu);

// Écoutez le clic sur le bouton de fermeture du menu
// Listen for click on menu close button
closeBtn.addEventListener('click', closeMenu);

// Écoutez le clic sur l'overlay
// Listen for click on overlay
overlay.addEventListener('click', closeMenu);

// Écoutez le clic sur tout le document
// Listen for click on the whole document
document.addEventListener('click', function (event) {
  // Vérifiez si le clic n'est pas à l'intérieur de la navbar ou du menu
  // Check if click is not inside the navbar or menu
  if (!event.target.closest('.navbar') && !event.target.closest('.menu')) {
    closeMenu();
  }
});

//// Tableau des utilisateurs ////

document.addEventListener("DOMContentLoaded", function () {
  const usersBtn = document.getElementById("users-btn"); // Assurez-vous que l'identifiant "users-btn" est correct dans votre HTML
  const gamesBtn = document.getElementById("games-btn"); // Assurez-vous que l'identifiant "games-btn" est correct dans votre HTML
  const contentDiv = document.getElementById("content");

  function updateTableContent() {
    fetch("/get_users")
      .then(response => response.json())
      .then(data => {
        let userList = `
          <table class="user-table">
            <tr>
              <th>ID</th>
              <th>Nom d'utilisateur</th>
              <th>Email</th>
              <th>Groupe</th>
              <th>Modification du groupe</th>
              <th>Suppression</th>
            </tr>
        `;

        data.forEach(user => {
          userList += `
            <tr>
              <td>${user.id}</td>
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>${user.group}</td>
              <td>
                <select data-userid="${user.id}" class="group-select">
                  <option value="admin">Admin</option>
                  <option value="redacchef">Redacchef</option>
                  <option value="redac">Redac</option>
                  <option value="user">User</option>
                </select>
                <button class="update-btn" data-userid="${user.id}">Mettre à jour</button>
              </td>
              <td>
                <button class="delete-btn" data-userid="${user.id}">Supprimer</button>
              </td>
            </tr>
          `;
        });

        userList += "</table>";
        contentDiv.innerHTML = userList;

        // Ajout du style pour la div "contentDiv"
        contentDiv.style.maxHeight = "48rem"; // Vous pouvez ajuster cette valeur selon vos besoins
        contentDiv.style.overflowY = "auto";

        // Ajouter des événements de clic aux boutons de mise à jour
        const updateBtns = document.getElementsByClassName("update-btn");
        for (const btn of updateBtns) {
          btn.addEventListener("click", function () {
            const userId = this.getAttribute("data-userid");
            const groupSelect = this.previousElementSibling;
            const newGroup = groupSelect.value;

            fetch(`/update_group/${userId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ group: newGroup })
            })
            .then(response => {
              if (response.ok) {
                // Mettre à jour le contenu après la mise à jour du groupe
                updateTableContent();
              } else {
                console.error("Erreur lors de la mise à jour du groupe.");
              }
            })
            .catch(error => console.error("Erreur lors de la requête AJAX :", error));
          });
        }

        // Ajouter des événements de clic aux boutons de suppression
        const deleteBtns = document.getElementsByClassName("delete-btn");
        for (const btn of deleteBtns) {
          btn.addEventListener("click", function () {
            const userId = this.getAttribute("data-userid");

            fetch(`/delete_user/${userId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              }
            })
            .then(response => {
              if (response.ok) {
                // Mettre à jour le contenu après la suppression de l'utilisateur
                updateTableContent();
              } else {
                console.error("Erreur lors de la suppression de l'utilisateur.");
              }
            })
            .catch(error => console.error("Erreur lors de la requête AJAX :", error));
          });
        }
      })
      .catch(error => console.error("Erreur lors de la récupération des utilisateurs :", error));
  }

  usersBtn.addEventListener("click", function () {
    updateTableContent();
  });

  // Fonction pour ouvrir le formulaire modal pour ajouter un jeu
  function openAddGameModal() {
    // Créez le formulaire modal
    const addGameModal = document.createElement("div");
    addGameModal.classList.add("modal");
    addGameModal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal" id="closeModal">&times;</span>
        <h2>Ajouter un jeu</h2>
        <form id="addGameForm" action="/add_game" method="POST">
          <label for="title">Titre :</label>
          <input type="text" id="title" name="title" required>
          
          <label for="description">Description :</label>
          <textarea id="description" name="description" required></textarea>
          
          <label for="genre">Genre :</label>
          <input type="text" id="genre" name="genre" required>

          <label for="platform">Platform :</label>
          <input type="text" id="platform" name="platform" required>
          
          <label for="image">image :</label>
          <input type="file" id="image" name="image" accept=".png, .jpg, .jpeg, .gif, .jfif, .webp, .svg" required class="custom-input-image">
          
          
          <button type="submit">Ajouter</button>
        </form>
      </div>
    `;
    console.log("Bouton de création de jeu cliqué !");
    // Ajoutez le formulaire modal à la page
    document.body.appendChild(addGameModal);

    // Écoutez le clic sur le bouton de fermeture du formulaire modal
    const closeModalBtn = addGameModal.querySelector("#closeModal");
    closeModalBtn.addEventListener("click", function () {
      closeAddGameModal(); // Fermer le formulaire modal
    });

    // Écoutez le clic en dehors du formulaire modal pour le fermer
    window.addEventListener("click", function (event) {
      if (event.target === addGameModal) {
        closeAddGameModal(); // Fermer le formulaire modal
      }
    });


    // Validation du formulaire avant soumission
function validateForm() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const genre = document.getElementById("genre").value;
  const image = document.getElementById("image").value;
  const platform = document.getElementById("platform").value;

  if (title.trim() === "" || description.trim() === "" || genre.trim() === "" || image.trim() === "") {
    alert("Veuillez remplir tous les champs du formulaire !");
    return false;
  }

  return true;
}


    // Écoutez le soumission du formulaire d'ajout de jeu
    const addGameForm = addGameModal.querySelector("#addGameForm");
  addGameForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Créer un objet FormData et ajouter les données du formulaire
  const formData = new FormData();
  formData.append("title", addGameForm.title.value);
  formData.append("description", addGameForm.description.value);
  formData.append("genre", addGameForm.genre.value);
  formData.append("platform", addGameForm.platform.value);
  formData.append("image", addGameForm.image.files[0]); // Récupérer le fichier d'image sélectionné

  // Envoyer les données du formulaire au serveur
  fetch("/add_game", {
    method: "POST",
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Le jeu a été ajouté avec succès.');
        // Fermer le formulaire modal après soumission
        closeAddGameModal();
        // Mettre à jour automatiquement la liste des jeux après l'ajout
        updateGameList();
      } else {
        console.error("Erreur lors de l'ajout du jeu.");
      }
    })
    .catch(error => console.error("Erreur lors de la requête AJAX :", error));
});
}

  // Fonction pour fermer le formulaire modal pour ajouter un jeu
  function closeAddGameModal() {
    const addGameModal = document.querySelector(".modal");
    document.body.removeChild(addGameModal); // Supprimer le formulaire modal de la page
  }

  ///// Tableau des jeux ///////

  // Fonction pour afficher la liste des jeux
  function updateGameList() {
    fetch("/get_games")
      .then(response => response.json())
      .then(data => {
        let gameList = `
          <table class="game-table">
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Description</th>
              <th>Genre</th>
              <th>Image</th>
              <th>Platforme</th>
              <th>Supprimer</th>
              <th>Crée un Jeu</th>
            </tr>
        `;

        data.forEach(game => {
          gameList += `
            <tr>
              <td>${game.id}</td>
              <td>${game.title}</td>
              <td>${game.description}</td>
              <td>${game.genre}</td>
              <td><img src="${game.image}" alt="${game.title}"></td>
              <td>${game.platform}</td>
              <td><button class="delete-game-btn" data-gameid="${game.id}">Supprimer</button></td>
            </tr>
          `;
        });

        gameList += "</table>";
        contentDiv.innerHTML = gameList;

        contentDiv.style.overflowY = "auto";

        // Créez le bouton de création de jeu en dehors du tableau
        const createGameBtn = document.createElement("button");
        createGameBtn.textContent = "Créer un jeu";
        createGameBtn.id = "create-game-btn";
        const gameTable = document.querySelector('.game-table');
        gameTable.insertAdjacentElement('afterend', createGameBtn);

        // Écoutez le clic sur le bouton de "Créer un jeu" pour ouvrir la fenêtre modale
        createGameBtn.addEventListener("click", function () {
          openAddGameModal();
        });

        // Ajoutez des événements de clic aux boutons de suppression
        const deleteGameBtns = document.getElementsByClassName("delete-game-btn");
        for (const btn of deleteGameBtns) {
          btn.addEventListener("click", function () {
            const gameId = this.getAttribute("data-gameid");
            console.log("Bouton de suppression de jeu cliqué !");

            fetch(`/delete_game/${gameId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              }
            })
              .then(response => {
                if (response.ok) {
                  // Mettre à jour le contenu après la suppression du jeu
                  updateGameList();
                } else {
                  console.error("Erreur lors de la suppression du jeu.");
                }
              })
              .catch(error => console.error("Erreur lors de la requête AJAX :", error));
          });
        }
      })
      .catch(error => console.error("Erreur lors de la récupération des jeux :", error));
  }

  // Écoutez le clic sur le bouton de "Games" pour afficher la liste des jeux
  gamesBtn.addEventListener("click", function () {
    updateGameList();
  });
});

$(document).ready(function () {
  // Écouter le clic sur le bouton "Envoyer le message"
  $("#submitBtn").click(function () {
      // Récupérer les données du formulaire
      var formData = $("#contactForm").serialize();

      // Envoyer la requête AJAX POST au serveur Flask
      $.ajax({
          url: "/submit",
          method: "POST",
          data: formData,
          success: function (response) {
              // Traiter la réponse du serveur
              alert("Formulaire soumis avec succès !\n\n" +
                  "Nom : " + response.name + "\n" +
                  "Email : " + response.email + "\n" +
                  "Sujet : " + response.subject + "\n" +
                  "Message : " + response.message);
          },
          error: function (error) {
              alert("Une erreur s'est produite lors de la soumission du formulaire.");
          }
      });
  });
});

 // Fonction pour afficher la fenêtre modale et récupérer les messages via AJAX
 function showModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "block";

  // Requête AJAX pour récupérer les messages depuis le backend
  $.ajax({
    url: "/get_messages",
    type: "GET",
    dataType: "json",
    success: function (data) {
      // Ajoutez les lignes du tableau dynamiquement
      var tableBody = document.getElementById("table-body");
      tableBody.innerHTML = "";

      data.forEach(function (message) {
        var row = document.createElement("tr");
        row.innerHTML = `
          <td>${message.name}</td>
          <td>${message.email}</td>
          <td>${message.subject}</td>
          <td>${message.message}</td>
          <td>${message.creation_date}</td>
          <td>
            <button onclick="displayMessage('${message.message}')">Afficher</button>
            <button onclick="deleteMessage('${message.creation_date}')">Supprimer</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    },
    error: function (error) {
      console.error("Erreur lors de la récupération des messages :", error);
    },
  });
}
// Fonction pour fermer la fenêtre modale
function closeModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
}


// Gestionnaire d'événement pour afficher la fenêtre modale lorsqu'on clique sur le bouton "Centre de message"
var centerMessageBtn = document.getElementById("message-btn");
centerMessageBtn.addEventListener("click", showModal);

// Gestionnaire d'événement pour fermer la fenêtre modale lorsqu'on clique sur le bouton de fermeture (×)
var closeModalBtn = document.querySelector(".close");
closeModalBtn.addEventListener("click", closeModal);

$(document).ready(function() {
  // Gestionnaire d'événement pour le clic du bouton d'abonnement
  $('#subscribe-btn').on('click', function(event) {
      event.preventDefault();
      var email = $('#email').val();

      $.ajax({
          url: '/subscribe',
          method: 'POST',
          data: {email: email},
          success: function(response) {
              alert(response.message);
          },
          error: function(error) {
              alert('Erreur lors de l\'abonnement!');
          }
      });
  });
});

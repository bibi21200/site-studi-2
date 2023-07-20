from flask import Flask, render_template, request, redirect, url_for , session , jsonify , flash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_session import Session
from sqlalchemy.orm import Session
import os
from werkzeug.utils import secure_filename
from flask import request, jsonify
from PIL import Image
from datetime import datetime



app = Flask(__name__)
app.debug = True

app.config['SQLALCHEMY_DATABASE_URI'] ='sqlite:///brother.db'
app.config['UPLOAD_FOLDER'] = 'static/images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif' , 'jfif', 'webp', 'svg'}
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/brother'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = '/path/to/session/directory'
app.secret_key = 'ECF'
Session(app)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)

desc="Ceci est une description"


# models.py

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    group = db.Column(db.String(50), nullable=False)
    photo = db.Column(db.String(200))  # Chemin de la photo de profil
    favorite_games = db.Column(db.String(200))  # Vous pouvez stocker les jeux favoris sous forme de texte séparé par des virgules
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)  # Date de création du profil
    
    
class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(255), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    
class ContactForm(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email= db.Column(db.String(50), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)  # Date de création du profil

class Newsletter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
################################################################

def __reper__(self):
    return f"User('{self.username}', '{self.email}', '{self.group}')"

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def homepage():
    return render_template('home.html')


@app.route('/home')
def home():
    return render_template('home.html')


@app.route('/About')
def about():
    return render_template('About.html')


@app.route('/Contact')
def contact():
    return render_template('Contact.html')


@app.route('/Games')
def game():
    return render_template('Games.html')


@app.route('/Login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # Rechercher l'utilisateur dans la base de données par son e-mail
        user = User.query.filter_by(username=username).first()

        if user and bcrypt.check_password_hash(user.password, password):
            # Le mot de passe est correct, connecter l'utilisateur
            # (vous pouvez implémenter votre propre logique d'authentification ici)
            session['username'] = username
            session['email'] = user.email
            session['password'] = user.password
            session['group'] = user.group  # Enregistrer le groupe de l'utilisateur dans la session
            return redirect(url_for('home'))
        else:
            # Le mot de passe est incorrect ou l'utilisateur n'existe pas
            return render_template('Login.html', message='Invalid email or password.')

    return render_template('Login.html')


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect(url_for('home'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # Vérification si l'utilisateur existe déjà dans la base de données
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            # Utilisateur déjà existant, rediriger vers une page d'erreur ou afficher un message
            return render_template('error.html', message='Cet e-mail est déjà utilisé.')

        # Hasher le mot de passe
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Création d'une instance du modèle User avec les données soumises
        user = User(username=username, email=email, password=hashed_password)

        # Définition du groupe pour l'utilisateur
        user.group = 'user'

        # Ajout de l'utilisateur à la session de la base de données
        db.session.add(user)

        # Commit des modifications dans la base de données
        db.session.commit()

        # Redirection vers une page de succès ou une autre page de votre choix
        return redirect(url_for('login'))

    return render_template('Register.html')


@app.route('/forgot-password')
def forgot_password():
    return render_template('forgot.html')


@app.route('/admin')
def admin():
    all_users = User.query.all()
    # Votre code pour la vue admin ici
    return render_template('admin.html' , users=all_users)

@app.route('/get_users', methods=['GET'])
def get_users():
    # Récupérer la liste des utilisateurs depuis la base de données
    users = User.query.all()

    # Convertir la liste d'utilisateurs en une liste de dictionnaires
    users_list = [{ 'id': user.id, 'username': user.username, 'email': user.email, 'group': user.group} for user in users]

    # Renvoyer la liste des utilisateurs au format JSON
    return jsonify(users_list)


@app.route('/update_group/<int:user_id>', methods=['POST'])
def update_group(user_id):
    if 'username' not in session or session['group'] != 'admin':
        return jsonify(success=False, message="Vous n'êtes pas autorisé à effectuer cette action.")

    user = db.session.get(User, user_id)
    if not user:
        return jsonify(success=False, message="L'utilisateur n'existe pas.")

    data = request.get_json()
    new_group = data.get('group')

    if session['group'] == 'admin':
        # Seul le groupe "admin" peut attribuer le groupe "admin" à d'autres utilisateurs
        user.group = new_group
    elif session['group'] == 'redacchef' and new_group in ('redacchef', 'redac', 'user'):
        # Le groupe "redacchef" peut attribuer les groupes "redac", "user" et "redacchef" aux autres utilisateurs
        user.group = new_group
    else:
        # Autres cas, par exemple, un groupe "redac" essaie d'attribuer le groupe "admin"
        return jsonify(success=False, message="Vous n'êtes pas autorisé à attribuer ce groupe.")

    db.session.commit()

    return jsonify(success=True, message="Le groupe a été mis à jour avec succès.")


@app.route('/delete_user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    if 'username' not in session or session['group'] != 'admin':
        return jsonify(success=False, message="Vous n'êtes pas autorisé à effectuer cette action.")

    user = db.session.get(User, user_id)
    if not user:
        return jsonify(success=False, message="L'utilisateur n'existe pas.")

    db.session.delete(user)
    db.session.commit()

    return jsonify(success=True, message="L'utilisateur a été supprimé avec succès.")


@app.route('/add_game', methods=['POST'])
def add_game():
    if 'username' not in session or session['group'] != 'admin':
        return jsonify(success=False, message="Vous n'êtes pas autorisé à ajouter un jeu.")

    # Récupérer les données du jeu depuis le formulaire soumis
    title = request.form.get('title')
    description = request.form.get('description')
    genre = request.form.get('genre')
    platform = request.form.get('platform')

    if not title or not description or not genre or not platform:
        return jsonify(success=False, message="Veuillez fournir tous les détails du jeu.")

    # Vérifier si un fichier image a été inclus dans la requête
    if 'image' not in request.files:
        return jsonify(success=False, message="Veuillez fournir une image pour le jeu.")

    image_file = request.files['image']

    # Vérifier si un fichier a été sélectionné
    if image_file.filename == '':
        return jsonify(success=False, message="Veuillez sélectionner une image pour le jeu.")

    # Utiliser secure_filename pour obtenir un nom de fichier sécurisé
    filename = secure_filename(image_file.filename)

    # Définir le chemin complet où l'image sera sauvegardée
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    # Enregistrer le fichier image sur le disque
    image_file.save(image_path)
    
    # Redimensionner l'image
    try:
        img = Image.open(image_path)
        # Définir la taille maximale souhaitée de l'image (par exemple, 500x500 pixels)
        max_size = (250, 250 )
        min_size = (200, 200)
        img.thumbnail(max_size,)
        # Sauvegarder l'image redimensionnée sur le disque (vous pouvez écraser l'image d'origine ou créer une copie)
        img.save(image_path)
    except Exception as e:
        # En cas d'erreur lors du redimensionnement de l'image, vous pouvez choisir de supprimer l'image enregistrée
        # pour éviter de sauvegarder une image incorrecte.
        os.remove(image_path)
        return jsonify(success=False, message="Une erreur s'est produite lors du redimensionnement de l'image.")

    # Créer une nouvelle instance du modèle Game avec les données soumises
    new_game = Game(title=title, description=description, genre=genre, platform=platform, image=filename)

    # Ajouter le nouveau jeu à la session de la base de données
    db.session.add(new_game)

    # Commit des modifications dans la base de données
    db.session.commit()

    return jsonify(success=True, message="Le jeu a été ajouté avec succès.")

@app.route('/delete_game/<int:game_id>', methods=['POST'])
def delete_game(game_id):
    if 'username' not in session or session['group'] != 'admin':
        return jsonify(success=False, message="Vous n'êtes pas autorisé à supprimer un jeu.")

    game = db.session.get(Game, game_id)
    if not game:
        return jsonify(success=False, message="Le jeu n'existe pas.")

    db.session.delete(game)
    db.session.commit()

    return jsonify(success=True, message="Le jeu a été supprimé avec succès.")

@app.route('/get_games', methods=['GET'])
def get_games():
    # Récupérer la liste des jeux depuis la base de données
    games = Game.query.all()

    # Convertir la liste de jeux en une liste de dictionnaires
    games_list = [{  'id': game.id, 'title': game.title, 'description': game.description, 'genre':game.genre, 'image': f'/static/images/{game.image}', 'platform': game.platform } for game in games]

    # Renvoyer la liste des jeux au format JSON
    return jsonify(games_list)

@app.route('/get_profile')
def get_profile():
    # Vérifier si l'utilisateur est connecté
    if 'username' in session:
        # Récupérer les informations du profil de l'utilisateur depuis la session
        username = session['username']
        email = session.get('email')
        password = session.get('password')

        # Retourner les informations du profil sous forme de JSON
        return jsonify({
            'username': username,
            'email': email,
            'password': password
        })
    else:
        # Si l'utilisateur n'est pas connecté, renvoyer une réponse vide avec un message d'erreur
        return jsonify(success=False, message="L'utilisateur n'est pas connecté.")


@app.route('/change_password', methods=['POST'])
def change_password():
    if 'username' not in session:
        return jsonify(success=False, message="L'utilisateur n'est pas connecté.")

    # Récupérer le nouvel utilisateur depuis la base de données
    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify(success=False, message="L'utilisateur n'existe pas.")

    # Récupérer le nouveau mot de passe à partir de la requête AJAX
    data = request.get_json()
    new_password = data.get('new_password')

    # Hasher le nouveau mot de passe
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')

    # Mettre à jour le mot de passe dans la base de données
    user.password = hashed_password
    db.session.commit()

    return jsonify(success=True, message="Le mot de passe a été changé avec succès.")


@app.route('/profil', methods=['GET', 'POST'])
def profil():
    if 'username' not in session:
        return redirect(url_for('login'))

    # Obtenir l'utilisateur actuellement connecté
    user = User.query.filter_by(username=session['username']).first()

    if request.method == 'POST':
        # Récupérer le fichier de la photo depuis le formulaire
        photo = request.files['photo']
        
        # Vérifier si un fichier de photo a été sélectionné
        if photo and allowed_file(photo.filename):
            # Enregistrer le fichier de la photo dans le dossier 'static/photos'
            filename = secure_filename(photo.filename)
            photo.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            
            # Mettre à jour le champ 'photo' dans le modèle User
            user.photo = filename
            db.session.commit()

    # Récupérez la liste d'IDs des jeux favoris de l'utilisateur
    favorite_game_ids = user.favorite_games.split(',')

    # Récupérez les informations complètes des jeux favoris à partir de la base de données
    favorite_games = Game.query.filter(Game.id.in_(favorite_game_ids)).all()

    # Passez les informations de l'utilisateur et des jeux favoris au modèle profil.html
    return render_template('profil.html', user=user, favorite_games=favorite_games)



@app.route('/upload_photo', methods=['POST'])
def upload_photo():
    try:
        # Vérifiez si un fichier a été envoyé avec la requête
        if 'photo' not in request.files:
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400

        photo = request.files['photo']

        # Vérifiez si le fichier est vide
        if photo.filename == '':
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400

        # Enregistrez le fichier sur le serveur
        file_name = 'static/photos/' + photo.filename
        photo.save(file_name)

        # Mettez à jour la colonne "photo" de l'utilisateur avec le nom du fichier de la photo
        user = User.query.filter_by(username=session['username']).first()
        user.photo = photo.filename
        db.session.commit()

        # Réponse de réussite
        return jsonify({'message': 'Image téléchargée avec succès'}), 200

    except Exception as e:
        return jsonify({'error': 'Une erreur s\'est produite lors du téléchargement de l\'image'}), 500
    
@app.route('/add_favorite', methods=['POST'])
def add_favorite():
    if 'username' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'error': 'Utilisateur introuvable'}), 404

    # Récupérer l'ID du jeu à partir de la requête AJAX
    data = request.get_json()
    game_id = data.get('game_id')

    # Vérifier si le jeu existe dans la base de données
    game = db.session.get(Game, game_id)
    if not game:
        return jsonify({'error': 'Jeu introuvable'}), 404

    # Vérifier si le jeu est déjà dans la liste des favoris de l'utilisateur
    if user.favorite_games:
        favorite_game_ids = user.favorite_games.split(',')
        if str(game_id) in favorite_game_ids:
            return jsonify({'message': 'Le jeu est déjà dans les favoris de l\'utilisateur'}), 200
    else:
        favorite_game_ids = []

    # Ajouter l'ID du jeu à la liste des favoris de l'utilisateur
    favorite_game_ids.append(str(game_id))
    user.favorite_games = ','.join(favorite_game_ids)
    db.session.commit()

    return jsonify({'message': 'Jeu ajouté aux favoris avec succès'}), 200

@app.route('/get_favorites', methods=['GET'])
def get_favorites():
    if 'username' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'error': 'Utilisateur introuvable'}), 404

    # Récupérer la liste des jeux favoris de l'utilisateur depuis la base de données
    favorite_games = []
    if user.favorite_games:
        favorite_game_ids = user.favorite_games.split(',')
        for game_id in favorite_game_ids:
            game = Game.query.filter_by(id=game_id).first()
            if game:
                favorite_games.append({
                    'id': game.id,
                    'title': game.title,
                    'description': game.description,
                    'image': game.image,
                    'genre': game.genre,
                    'platform': game.platform
                })

    return jsonify({'favorite_games': favorite_games}), 200

@app.route('/remove_favorite', methods=['POST'])
def remove_favorite():
    if 'username' not in session:
        return jsonify(success=False, message="L'utilisateur n'est pas connecté."), 401

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify(success=False, message="Utilisateur introuvable."), 404

    # Récupérer l'ID du jeu à partir de la requête AJAX
    data = request.get_json()
    game_id = data.get('game_id')

    # Vérifier si le jeu existe dans la liste des favoris de l'utilisateur
    if user.favorite_games:
        favorite_games_list = user.favorite_games.split(',')
        if str(game_id) in favorite_games_list:
            favorite_games_list.remove(str(game_id))
            # Mettre à jour la liste des favoris de l'utilisateur
            user.favorite_games = ','.join(favorite_games_list)
            db.session.commit()
            return jsonify(success=True, message="Jeu supprimé des favoris avec succès."), 200
        else:
            return jsonify(success=False, message="Jeu non trouvé dans les favoris de l'utilisateur."), 404
    else:
        return jsonify(success=False, message="Aucun jeu trouvé dans les favoris de l'utilisateur."), 404

@app.route('/submit', methods=['POST'])
def submit_form():
    name = request.form['name']
    email = request.form['email']
    subject = request.form['subject']
    message = request.form['message']

    # Insertion des données dans la base de données
    contact_form = ContactForm(name=name, email=email, subject=subject, message=message)
    db.session.add(contact_form)
    db.session.commit()

    # Retourner les données soumises en tant que réponse JSON
    response = {
        'name': name,
        'email': email,
        'subject': subject,
        'message': message
    }

    return jsonify(response)

# Route pour récupérer les messages depuis la base de données
@app.route('/get_messages', methods=['GET'])
def get_messages():
    # Récupérez les messages triés par ordre chronologique (plus récents d'abord)
    messages = ContactForm.query.order_by(desc(ContactForm.creation_date)).all()
    
    # Créez une liste de dictionnaires contenant les informations des messages
    message_list = []
    for message in messages:
        message_data = {
            'name': message.name,
            'email': message.email,
            'subject': message.subject,
            'message': message.message,
            'creation_date': message.creation_date.strftime('%Y-%m-%d %H:%M:%S')
        }
        message_list.append(message_data)

    # Renvoyez les données sous forme de JSON
    return jsonify(message_list)

@app.route('/')
def index():
    return render_template('contact.html')

@app.route('/subscribe', methods=['POST'])
def subscribe():
    email = request.form['email']

    if email:
        newsletter_entry = Newsletter(email=email)
        db.session.add(newsletter_entry)
        db.session.commit()
        return jsonify({'message': 'Vous êtes maintenant abonné à notre newsletter!'})
    else:
        return jsonify({'error': 'Veuillez fournir une adresse e-mail valide!'})


if __name__ == '__main__':
    app.run()

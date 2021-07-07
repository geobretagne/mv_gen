# Documentation - administration

## Configuration de mviewerstudio

La configuration s'effectue dans le fichier config.json (à créer à partir d'une copie de config-sample.json).

### Paramètres  du fichier config.json:

*  **studio_title** : Nom de l'application tel qu'il apparaîtra dans la navbar de l'application et dans le titre de la page dans votre navigateur internet.

*  **upload_service** : Service web utilisé pour stocker les configurations mviewer créées avec le générateur. Valeur par défaut : ``srv/store.php``. Ne pas oublier d'autoriser l'utilisateur apache à accéder en écriture au répertoire. Il est également possible d'utiliser le service "Doc service" de geOrchestra (par exemple ``../mapfishapp/ws/mviewer/``). Dans ce dernier cas, les fichiers de configuration sont stockés dans la base de données de geOrchestra.

*  **export_conf_folder** : Dossier utilisé pour le stockage des fichiers de configuration mviewer générés. Ce paramètre est utilisé si le paramètre précédent est ``srv/store.php``.

*  **mviewer_instance** : URL de l'instance mviewer utilisée (par exemple ``http://localhost/mviewer/``)

*  **conf_path_from_mviewer** : Chemin permettant de charger le fichier de configuration généré depuis le mviewer. Le chemin peut être relatif (par exemple ``../mviewer/conf/``).

*  **mviewer_short_url** : Utilisation du système d'URL courtes (mviewer/#monappli au lieu de mviewer/?config=apps/monappli.xml):

*  **used** : true | false.

*  **apps_folder** : chemin d'accès depuis le répertoire apps (exemple store pour apps/store).

*  **external_themes** : Utilisation du mécanisme d'import de thématiques externes (présentes dans d'autres mviewers):

*  **used** : true | false.

*  **url** : chemin d'accès vers liste format json.

*  **user_info** : url vers service retournant l'identidé de la personne connectée.

*  **proxy** : Chemin du proxy par lequel les requêtes envoyées par mviewerstudio passeront. Valeur par défaut si ce paramètre est absent ``../proxy/?url=``.

*  **logout_url** : URL utilisée par le menu de déconnexion.

*  **app_form_placeholders** : Exemples de valeurs présentes dans le formulaire de création de l'application :

*  **app_title** : Nom de l'application qui sera créée

*  **logo_url** : URL du logo à afficher dans l'application

*  **help_file** : Nom du fichier contenant l'aide à afficher par l'application.

*  **map** : Paramétrage du cadrage initial de la carte grâce aux propriétés center et zoom.

*  **center** : coordonnées du centre de la carte

*  **zoom** : niveau de zoom

*  **baselayers** : Cette section concerne le paramétrage des fonds de plan.

*  **data_providers** : Cette section concerne le paramétrage des différents fournisseurs de données.
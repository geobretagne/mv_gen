# Documentation utilisateur



mviewerstudio est une application qui permet de générer et de déployer des applications [mviewer](https://github.com/geobretagne/mviewer)

![Interface studio](img/studio.png)


# Prérequis

Avant de vous lancer dans la belle aventure du mviewer studio et de goûter les joies de monter sa propre application cartographique, vous devrez malgré tout vous être assuré.e d'avoir rempli les prérequis suivants :

 - Le cas échéant, avoir demandé **les droits** aux administrateurs pour vous connecter à l’application mviewerstudio.
 - Avoir déposé le ou les jeux de données "métier" nécessaires sur un catalogue en **flux OGC** en respectant les recommandations
   ([exemple sur GéoBretagne](https://cms.geobretagne.fr/content/deposer-des-donnees-shapefile-sur-geobretagne-grace-pydio)).
 - Avoir créé la ou les **fiches de métadonnées** nécessaires sur le catalogue partenaire (ou sur son propre catalogue CSW).
 - Disposer des **fichiers de styles SLD** nécessaires.

*N.B sur GéoBretagne : pour plus de confort et d’autonomie, il est fortement conseillé d’être [administrateur délégué](https://cms.geobretagne.fr/content/administration-deleguee-sur-geoserver) de ses données sur GéoBretagne.*


# Paramétrer son application

![Paramétrage application](img/interface-studio.png)

 **1.** Renseigner le titre de votre application cartographique _(ex. "Le plan vélo de la Communauté de communes de Châteaugiron")_

**2.** Régler l'emprise de votre carte en utilisant les zoom +/- et le déplacement en cliquant à la souris sur la carte _(ex. ici on zoome sur le territoire de la Communauté de communes de Châteaugiron, ce sera le cadrage "par défaut" sur lequel arrivera l'utilisation sur l'application cartographique)_

**3.** Renseigner l'URL du logo de l'entité productrice de l'application** _**(info : sur GéoBretagne, les logos des partenaires sont stockés ici**_ [**https://geobretagne.fr/pub/logo/**](https://geobretagne.fr/pub/logo/)_**. Il apparaîtra dans le bandeau de l'application)**_

**4.** Cocher les options d'outils que vous souhaitez voir dans la carte  _(ex. des outils de mesures et un export au format image_)


À ce stade, vous pouvez déjà **sauvegarder votre application** et explorer le menu du haut :

![Sauvegarde application](img/sauvegarde-application.png)

**1. Sauvegarder** : pour enregistrer votre fichier de configuration (xml) sur l'espace du mviewer studio

**2. Prévisualiser** : pour visualiser le résultat de votre application à tout moment

**3. Télécharger** : pour télécharger votre fichier xml de configuration en local

**4. Charger** : pour charger sur le mviewer studio un fichier xml existant en local

Exemple après avoir sauvegardé, je clique sur "**Prévisualiser**" et je visualise déjà le résultat de mon application à ce stade :

![Prévisualiser application](img/previsualiser-application.png)



# Organiser ses données et thématiques

![Thematique-Donnees](img/thematique-donnes.png)

Le mot "**données**" correspond à un ou des jeu(x) de données que vous souhaitez ajouter à votre application. Vous avez la possibilité de regrouper un ou plusieurs jeux de données sous une même "**thématique**". Exemple, je veux ajouter deux couches de données (la couche des linéaires du plan vélo et la couche des abris vélo) sous une thématique "Plan Vélo".

![Selection-Donnees](img/selection-donnees.png)

**1. Créer** : pour créer votre thématique et y associer vos jeux de données "métier"

**2. Importer** : pour réutiliser une thématique déjà créée au sein de la communauté mviewer (ex. la thématique des découpages territoriaux qui contient les limites de communes, EPCI et départements). Ce bouton peut ne pas apparaître dans votre mviewer studio car son activation est optionnelle.

## Option - Créer une thématique

![Créer-thématique](img/creer-thematique.png)

En cliquant sur "**Ajouter des données**", vous pouvez chercher un jeu de données auprès d'un service en ligne (catalogue en ligne comme celui de GéoBretagne ou un service WMS) :

![Rechercher-donnees](img/rechercher-donnees.png)

Les données nécessaires ont été ajoutées à la thématique, vous cliquez sur **OK** (pensez à sauvegarder et télécharger votre fichier de configuration !) :

![Ajout-donnees-thematique](img/ajout-donnee-thematique.png)


Pour modifier la façon de **visualiser/interroger** un jeu de données, cliquez ici :

![Visualiser-interroger-donnees](img/parametrage-donnees.png)

Allez dans les différents onglets faire les paramétrages.

### Onglet Base

La plupart des informations sont récupérées des flux. S'ils sont bien renseignés, il n’y a rien à changer à part éventuellement le titre de la donnée qui apparaîtra dans votre application mviewer.

![Onglet-base](img/onglet-base.png)


### Onglet Fiche

Exemple sur l'onglet FICHE dans format de la fiche d’information, on clique sur "*personnalisé*" pour paramétrer ce qui apparaitra dans la fiche info quand on cliquera sur une portion du linéaire :

![Onglet-fiche](img/onglet-fiche.png)

On choisit les champs que l’on veut afficher dans la fiche d’information et le type (titre, texte, lien, image…).


### Onglet Affichage

On peut aussi y paramétrer la légende (fichier SLD) dans l’onglet **Affichage**. Si le SLD n'a pas été créé et stocké sur GéoBretagne, on peut entrer une URL externe (et un png pour l'affichage de la légende) :

![Onglet-affichage](img/onglet-affichage.png)



### Onglet Filtre

L’onglet **Filtre** permet de filtrer la donnée. On peut avoir un filtre géographique ou attributaire. Exemple ici avec un filtre sur un code SIREN :

![Onglet-filtre](img/onglet-filtre.png)



### Onglet Liste de choix

L’onglet **Liste de choix** permet d’avoir dans son application la possibilité de faire un filtre sur la valeur à afficher. Exemple ici on pourra filtrer les structures qui ont un multi accueil ou pas :

![Onglet-liste-de-choix](img/onglet-liste-de-choix.png)
![Onglet-liste-de-choix-visu](img/onglet-liste-de-choix-visu.png)


## Option - Récupérer une thématique existante

![Importer-thematique](img/importer-thematique.png)
![Previsualiser-thematique](img/previsualiser-thematique.png)

Choisir dans la liste la ou les thématiques que vous souhaitez récupérer et cliquer sur "**Importer**" en bas de page :

![Selection-thematique](img/importer-thematique.png)

À ce stade, vous avez vos deux thématiques :

![Previsualiser-thematique](img/previsualiser-thematique.png)

En cliquant sur **Prévisualiser**, vous accédez à votre application cartographique en ligne :

![Visu-resultat-thematique](img/visu-resultat-thematique.png)

*N.B : la liste des thématiques est en cours d’élaboration, il est possible qu’il y ait des erreurs.*



# Paramétrer les couches de fond

![Couches-fond](img/fonds.png)

Choix des couches de fonds disponibles dans notre application. Pensez aussi à choisir le fond affiché au démarrage.


# Paramétrer la recherche d'entités

![Recherche-entites](img/recherche-entites.png)

Activer la recherche d’entités par adresse en utilisant l’API de la base adresse nationale.


# Enregistrer et mettre à disposition

N'oubliez pas de sauvegarder, de télécharger le fichier xml de votre application et d'enregistrer l'URL qui apparaît quand vous la prévisualisez.

![Enregistrer](img/enregistrer.png)


# Mise en production

L’url fournie par mviewer studio évolue à chaque enregistrement. Pour une mise en production de votre application, merci de contacter votre administrateur de données qui vous créera un espace de stockage accessible où déposer votre fichier XML.


# Intégration dans votre site web

Vous souhaitez intégrer l’application produite sur votre site web ? Ci-dessous la marche à suivre :

**1. Partager** : cliquer sur le bouton partager de votre application mise en production sur GéoBretagne

**2. Mode d’affichage** : sélectionner le mode d’affichage ultra simplifié

**3. Lien :** clic droit sur l’icône de gauche puis copier l’adresse du lien

![Partager](img/partager1.png)

![Partager-details](img/partager2.png)


**4. url** : insérer le code suivant en **modifiant l’url par celle de l’étape 3** :

    <iframe frameborder="1" height="670px" scrolling="no" src="http://lyzen.fr/mviewer/?x=-166138&y=6120203&z=12&l=PCC_PLAN_VELO*%252CPCC_ABRIS_VELO*%252Cepci%252Ccommune&lb=positron&config=apps%2Fplan-velo.xml&mode=u" style="width: 100%;"></iframe>

Les paramètres suivants sont modifiables :

 + **height** : hauteur de la carte en pixels

 + **z** : niveau de zoom

 + **lb** : fond de carte au choix :

	 + **positron** : fond Carto  
	 + **photographie satellitaire et aérienne** (zoom grande échelle)
	 + **osm1** : fond OpenStreetMap

Vous pouvez intégrer ce code (iframe) dans votre page html.

# Pour aller plus loin...

Vous pourrez travailler le fichier.xml sous un éditeur dédié (ex. Notepad++ [https://notepad-plus-plus.org/](https://notepad-plus-plus.org/)) en vous appuyant sur la documentation plus avancée du mviewer : [https://mviewerdoc.readthedocs.io/fr/latest/index.html](https://mviewerdoc.readthedocs.io/fr/latest/index.html)

![Doc-mviewer](img/doc-mviewer.png)

Vous y apprendrez par exemple :

 - Comment ajouter un lien vers votre site internet à partir du logo dans le bandeau,
 - Comment paramétrer plus finement la fiche d'information,
 - Et plein d'autres choses encore, si vous avez la motivation pour rentrer un peu dans du code !

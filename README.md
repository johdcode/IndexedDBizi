IDB - Indexed Data Base
=======================

## Qu'est ce IDB ?
IndexedDB est une API de bas niveau qui permet le stockage côté client de quantités importantes de données structurées, incluant des fichiers/blobs. Cette API utilise des index afin de permettre des recherches performantes sur ces données. Alors que Web Storage est utile pour stocker de petites quantités de données, il est moins utile pour stocker de grandes quantités de données structurées.

## Pourquoi utiliser IDB ?
IndexedDB est conçu afin de permettre de stocker une grande quantité de données dans le navigateur client et d'y accéder de manière rapide, grâce à l'indexation.

## Utilisation général de IDB
La base de données IDB est organisée comme une collection d'objets insérés dans la base en utilisant une syntaxe proche du JSON, de manière similaire à des bases NoSQL comme MongoDB ou CouchDB. Chaque objet est identifié par une clé générée au moment de l'insertion. Un système d'indexation permet ensuite d'optimiser l'accès aux objets.
Ce modèle permet une amélioration des performances en dépit cependant d'une perte de souplesse dans la manipulation des données.

## Limite de stockage
Les politique de stockage diffèrent selon le navigateur:
- **Firefox** n'as pas de limite de stockage, il demande juste une autorisation lorsque les données dépassent 50 Mo
- **Chrome** limite à environs 4 Go de données stockées
- **Internet Explorer** n'as pas non plus de limite, il demande une autorisation lorsque les données dépassent 10 Mo

## Utiliser IDBizi
Bien différent du modèle relationnel des données utilisé dans MySQL, IDB peut parître austère au premier abord, avec son système utilisant un modèle NoSQL, comme MongoDB.
Cette API a pour objectif de fournir un ensemble de méthodes basiques permettant un accès et une manipulation plus facile des données dans une base de données indéxées type IDB :

- install()
- set()
- get()
- getAll()
- getFrom()
- put()
- delete()
- deleteAll()

**Attention** : Chaque méthodes renvoie une Promise, dû au temps d'accès à la base de données, il faut donc traiter celle-ci afin de récupérer le résultat de notre requête.

### intall() - Créer sa base de données
La premiere étape consiste à choisir un nom pour sa base de données et lui indiqué un entier supérieur à 1 définissant la version mise à jour de notre base de données.
Pour se faire nous instancions l'indexedDBizi dans une variable et précisons ses propriétés :

```Javascript
    const Db = new indexedDBizi();
    Db.DB_NAME = 'ma_base_de_donnees'
    Db.DB_VERSION = 2
```

La base de données est paramétrée, si le nom précisé existe déjà, la base correspondante est ouverte, sinon elle est créé.

Paramétrons maintenant les tables et leurs structures. IndexeDBizi fournit un tableau d'objet nommé *init_parameters*, où chaque objet en son sein est la représentation d'une table.
Créons une table 'membre' :

```Javascript
/**
 * Noter que la structure des paramètres est exactement celle utilisée par IDB,
 * init_parameters agit donc comme un intermédiaire passant les paramètres au fonctions correspondantes.
 * Vous pouvez donc vous référencer à la documentation officiel pour rajouter des paramètres selon vos besoins
 **/
Db.init_parameters = [
    {
        /**
         * 'store' permet de créer un table dans notre base de données.
         * La propriété correspondante dans l'objet natif IDB est IDB.createObjectStore(), et est un tableau de valeurs désignant :
         * - le nom de notre table, ici 'membre'
         * - un objet paramétrant notre table :
         *      - keyPath : la clé primaire autogénérée de notre table, ici 'id'
         *      - autoIncrement : booléan permettant l'auto-incrément automatique pour chaque nouvel enregistrement
         **/
        store: ['membre', { keyPath: 'id', autoIncrement: true }],

        /**
         * 'index' permet de choisir les propriétés de la table qui serons placées en index afin de permettre leurs accès.
         * La propriété correspondante dans l'objet natif IDB est IDB.createObjectStore().createIndex(), et est un tableau de valeurs. 
         * Chaque valeur est un tableau où l'on précise :
         * - le nom que l'on souhaite donnée à l'index, ici 'by_id'
         * - la propriété affecté par cette index, ici 'id'
         * - un objet paramétrant notre index :
         *      - unique : la propiété 'id' en index doit être unique
         **/
        index: [
            ['by_id', 'id', { unique: true }],
            ['by_name', 'name', { unique: true }]
        ],

        /**
         * 'init_data' permet de créer des enregistrements après la création de la table.
         * La propriété correspondante dans l'objet natif IDB est IDB.createObjectStore().put(), et est un tableau de valeurs.
         * Chaque valeur est un objet et précise au format JSON l'enregistrement sous forme de clé -> valeur :
         * Notons que le format de la table n'est pas fixe, chaque enregistrement peux ignorer ou rajouter des propriétés en son sein. 
         * Les seuls valeurs obligatoirs sont celles désignées en index.
         **/
        init_data: [
            { name: 'Bob', age : 54 },
            { name: 'Alice' },
            { name: 'John', age: 24, address: 'Nantes' }
        ]
    },
]
```

Notre base de données paramétrée, il est nous reste à exécuter l'installation avec : 
```Javascript
    Db.install();
```

Pour voir votre base de données, ouvrer le panneau d'outils de dévelopement de votre navigateur (Ctrl + Maj + I sur Chrome), et rendez-vous sur l'onglet Application, et chercher le sous-menu IndexedDB.
 [IMAGE outils de développement > Application > IndexedDB]

### set() - Ajouter un enregistrement dans une table
```Javascript
set (table = "", data = {}) : int
```

- **table** : le nom de la table où l'enregistrement est stocké
- **data** : l'enregistrement sous la forme d'un objet

Cette méthode retourne l'id de l'objet inséré en base.

```Javascript
// EXEMPLE

// Insère dans la table 'membre'
Db.set('membre', { name: 'Jean' })
    .then((res) => {
        // Affiche le résulat
        console.log(res);
    })
    .catch((e) => {
        // En cas d'erreur, affiche l'erreur
        console.log(e);
    })
```

### get() - Récupérer un enregistrement dans une table

```Javascript
get(table = "", key = "", position = 'current', store_index = 'by_id') : object
```

- **table** : le nom de la table où l'enregistrement est stocké
- **key** : la valeurs de la clé placée en index, identifiant l'enregistrement (par défaut 'id' pour 'by_id')
- **position** : 
    + *current* : l'engistrement correspondant à la valeur de la 'key' précisée
    + *prev* : l'engistrement précédant correspondant à la valeur de la 'key' précisée
    + *next* : l'engistrement suivant correspondant à la valeur de la 'key' précisée
    + *first* : le premier enregistrement de la table
    + *last* : le dernier enregistrement de la table
- **store_index** : le nom de l'index identifiant la propriétés de la table qui est placé en index, par défaut 'by_id' pour l'id

Cette méthode retourne un objet si la valeurs est trouvé.

```Javascript
// EXEMPLE

// Utilise l'id
Db.get('membre', 1)
    .then((res) => {
        console.log(res);
    });
// Utilise le champ 'name'
Db.get('membre', 'John', 'current', 'by_name')
    .then((res) => {
        console.log(res);
    });
// Récupère l'enregistrement précedent le 'name' spécifié
Db.get('membre', 'John', 'prev', 'by_name')
    .then((res) => {
        console.log(res);
    });
```

### getAll() - Recupérer tout les enregistrements d'un table
```Javascript
getAll (table = "", store_index = "by_id") : array
```

- **table** : le nom de la table où l'enregistrement est stocké
- **store_index** : le nom de l'index identifiant la propriétés de la table qui est placée en index, par défaut 'by_id' pour l'id

Cette méthode retourne un tableau d'objets.

```Javascript
// EXEMPLE

// Recupère tout les enregistrement ordonnés par le champs 'id'
Db.getAll('membre', 'by_id')
    .then((res) => {
        console.log(res);
    });
// Recupère tout les enregistrement ordonnés par le champs 'name', dans l'ordre croissant
Db.getAll('membre', 'by_name')
    .then((res) => {
        console.log(res);
    });
```

### getFrom() - Recupérer tout les enregistrements d'un table à partir d'une position (exclusif)
```Javascript
getFrom (table = "", key = "", direction = 'next', store_index = 'by_id') : array
```

- **table** : le nom de la table où l'enregistrement est stocké
- **key** : la valeurs de la clé placée en index, identifiant l'enregistrement (par défaut 'id' pour 'by_id'). L'enregistrement correspondant à la clé est exclut du résultat.
- **direction** : 
    + *prev* : tous les enregistrements précédants correspondant à la valeur de la 'key' précisée
    + *next* : tous les enregistrements suivant correspondant à la valeur de la 'key' précisée
- **store_index** : le nom de l'index identifiant à la propriétés de la table qui est placée en index, par défaut 'by_id' pour l'id

Cette méthode retourne un tableau d'objets.

```Javascript
// EXEMPLE

// Récupère toutes les enregistrements de la table à partir de l'index précisé (exclu)
Db.getFrom('membre', 2, 'next')
    .then((res) => {
        console.log(res);
    });
```

### put() - Mettre à jour un enregistrement
```Javascript
put (table = "", id = "", data = {}, store_index = 'by_id') : mixed
```

- **table** : le nom de la table où l'enregistrement est stocké
- **id** : identifiant unique de l'enregistrement
- **data** : l'enregistrement sous la forme d'un objet
- **store_index** : le nom de l'index identifiant à la propriétés de la table qui est placée en index, par défaut 'by_id' pour l'id

Cette méthode retourne la valeur de l'identifiant mis à jour.

```Javascript
// EXEMPLE

// Met à jour l'enregistrement id=2 de la table 'membre'
Db.put('membre', 2, { name: 'Chuck Noris' }, 'by_id')
        .then((res) => {
            console.log(res);
        });
```

### delete() - Supprimer un enregistrement dans une table
```Javascript
delete (table = "", key = "", store_index = 'by_id') : mixed
```

- **table** : le nom de la table où l'enregistrement est stocké
- **key** : la valeurs de la clé placée en index, identifiant l'enregistrement (par défaut 'id' pour 'by_id')
- **store_index** : le nom de l'index identifiant à la propriétés de la table qui est placée en index, par défaut 'by_id' pour l'id

Cette méthode retourne 0 si l'enregistrement à bien été supprimé.

```Javascript
// EXEMPLE

// Supprime l'enregistrement où 'name'='Jean'
Db.delete('membre', 'Jean', 'by_name')
```

### deleteAll() - Supprimer tous les enregistrements d'une table
```Javascript
deleteAll (table = "") : mixed
```

- **table** : le nom de la table où l'enregistrement est stocké

Cette méthode retourne 0 si tous les enregistrements ont été supprimés.

```Javascript
// EXEMPLE

// Supprime tout les engistrement de la table 'membre'
Db.deleteAll('membre')
```

### Contribuer
- Améliorer les messages d'erreurs retournés par les fonctions
- Permettre un put() avec un autre champs que l'id
- Ajouter une méthode deleteFrom()
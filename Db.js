/**
 * 
 *  INDEXEDDB - CRUD API
 * 
 * Creer un object config, dans instllDb() dans lequel je peux paramétrer le "store_index"
 * 
 **/

"use strict;"

function indexedDBObj(){
    
    this.DB_NAME = 'mabase';
    this.DB_VERSION = 1;

    this.init_parameters = [
        { ///////////////////////////////// JOUR
            store : [ 'jour', { keyPath: 'id', autoIncrement: true } ],
            index : [
                ['by_date', 'date_jour', { unique: true }],
                ['by_id', 'id', { unique: true }]
            ],
            init_data : [
                { date_jour: "2020/04/26", poids: 0, muscle: 'Vide', debut_jeune: '2020-04-28T21:45:00.000', fin_jeune: '2020-04-29T15:21:00.000', remarque: "Remarque sur votre séance." },
                { date_jour: "2020/04/25", poids: 0, muscle: 'Vide', debut_jeune: '2020-04-28T21:45:00.000', fin_jeune: '2020-04-29T15:21:00.000', remarque: "Remarque sur votre séance." },
                { date_jour: "2020/04/27", poids: 0, muscle: 'Vide', debut_jeune: '2020-04-28T21:45:00.000', fin_jeune: '2020-04-29T15:21:00.000', remarque: "Remarque sur votre séance." }
            ]
        },
        { ///////////////////////////////// MUSCLE
            store: ['muscle', { keyPath: 'id', autoIncrement: true }],
            index: [
                ['by_id', 'id', { unique: true }],
                ['by_name', 'muscle_name', { unique: true }]
            ],
            init_data: [
                { muscle_name: 'Triceps' },
                { muscle_name: 'Biceps' },
                { muscle_name: 'Pectoraux' },
                { muscle_name: 'Dos' },
                { muscle_name: 'Abdos' },
                { muscle_name: 'Cuisse' },
                { muscle_name: 'Fessier' },
                { muscle_name: 'Mollets' }
            ]
        },
        { ///////////////////////////////// SAVE
            store : ['save', { keyPath: 'id', autoIncrement: true }],
            index : [
                ['by_id', 'id', { unique: true }],
                ['by_date', 'date_save', { unique: true }]
            ],
            init_data : [
                { date_save: '2020-04-28T21:45:00.000', last_id: 1, last_date: '2020/04/25' }
            ]
        },
        { ///////////////////////////////// JEUNE
            store : ['jeune', { keyPath: 'id', autoIncrement: true }],
            index : [
                ['by_id', 'id', { unique: true }]
            ],
            init_data : [
                { fast_duration: '16' }
            ]
        }
    ]

    /** INIT */
    this.install = function() {
        // Ouvrir la base de données
        // Si elle n'existe pas, elle est créé
        let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

        request.onupgradeneeded = () => {
            let db = request.result;
            for(let param of this.init_parameters){
                // Create store
                const store = db.createObjectStore(...param.store);
                // Create index
                for (let index of param.index){
                    store.createIndex(...index);
                }
                // Create init data
                for (let init_data of param.init_data){
                    store.put(init_data);
                }
            }
            db.close();
        }
    }
    // this.install();
    
    /** CREATE */
    this.set = function(table = "", data = {}) {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table, 'readwrite');
                let store = transaction.objectStore(table);
                store.put({ ...data })
                    .onsuccess = function (e) {
                        resolve(e.target.result);
                    }
                transaction.onerror = function (e) {
                    reject(e.target.error);
                }
                transaction.oncomplete = function () {
                    db.close();
                }
            }
        });
    }
    
    /** READ */
    this.get = function (table = "", key = "", store_index = 'by_id', position ='current') {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table, 'readonly');
                let store = transaction.objectStore(table);
                let index = store.index(store_index);

                let request2;
                if (position == 'current'){
                    request2 = index.openCursor(key);
                }
                else if (position == 'first'){
                    request2 = index.openCursor(null);
                }
                else if (position == 'last'){
                    request2 = index.openCursor(null, 'prev');
                }
                else if (position == 'prev'){
                    // PREV : la plus haute valeur est la clé (key), exclue (true), avec la position 'prev' => Le précedente de la clé
                    request2 = index.openCursor(IDBKeyRange.upperBound(key, true), position);
                }
                else if (position == 'next'){
                    //NEXT : la plus petite valeur est la clé (key), exclue (true), avec la position 'next' => La suivante de la clé
                    request2 = index.openCursor(IDBKeyRange.lowerBound(key, true), position);
                }
                request2.onsuccess = function () {
                    let cursor = request2.result;
                    if (cursor) { resolve(cursor.value); }
                    else { reject('No data found.'); }
                }
                transaction.oncomplete = function () {
                    db.close()
                }
            }
        });
    };

    this.getAll = function(table = "", store_index = "by_id") {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table, 'readonly');
                let store = transaction.objectStore(table);
                let index = store.index(store_index);
        
                let request2 = index.openCursor();

                let tab_cursor = []
        
                request2.onsuccess = function () {
                    try {
                        var cursor = request2.result;
                        if (cursor != undefined) {
                            tab_cursor.push(cursor.value);
                            cursor.continue();
                        }   
                        else {
                            // Toutes les valeurs ont été trouvé
                            resolve(tab_cursor);
                        }
                    } catch{ }
                }
                transaction.oncomplete = function () {
                    // console.log('Mise à jour de la base de données.');
                    db.close()
                }
            }
        })
    }
  
    this.getFrom = function (table = "", key = "", store_index = 'by_id', direction = 'next') { 
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table, 'readonly');
                let store = transaction.objectStore(table);
                let index = store.index(store_index);

                if(direction == 'prev'){
                    // PREV : la plus haute valeur est la clé (key), exclue (true), avec la direction 'prev' => Le précedente de la clé
                    var request2 = index.openCursor(IDBKeyRange.upperBound(key, true), direction);
                }
                else if ( direction == 'next'){
                    //NEXT : la plus petite valeur est la clé (key), exclue (true), avec la direction 'next' => La suivante de la clé
                    var request2 = index.openCursor(IDBKeyRange.lowerBound(key, true), direction);
                }
                
                let result = []

                request2.onsuccess = function () {
                    let cursor = request2.result;
                    if (cursor) {
                        result.push(cursor.value)
                        cursor.continue();
                    }
                    else {
                        resolve(result);
                        // reject();
                    }
                }
                transaction.oncomplete = function () {
                    // console.log('Mise à jour de la base de données.');
                    db.close()
                }
            }
        });
    }
    
    /** UPDATE */
    this.put = function (table = "", key = "", data = {}, store_index = 'by_id') {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table, 'readwrite');
                let store = transaction.objectStore(table);
                let index = store.index(store_index);
                store.put({ id: key, ...data })
                    .onsuccess = function(){
                        resolve(key);
                    }
                transaction.onerror = function () {
                        reject(e)
                    }
                transaction.oncomplete = function () {
                        db.close()
                    }
            }
        })
    }
    
    /** DELETE */
    this.delete = function (table = "", key = "", store_index = 'by_id') {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table, 'readwrite');
                let store = transaction.objectStore(table);
                let index = store.index(store_index);
                
                // store.delete(key)
                //     .onsuccess = function(r){
                //         resolve(r);
                //     }
                
                let request2 = index.openCursor(key);

                request2.onsuccess = function () {
                    let cursor = request2.result;
                    if (cursor) {
                        cursor.delete();
                        resolve(0);
                    }
                    else {
                        reject('DATA NOT FOUND');
                    }
                }
                transaction.onerror = function(e){
                        reject(e)
                    }
                transaction.oncomplete = function () {
                        // console.log('Mise à jour de la base de données.');
                        db.close()
                    }
            }
        });
    }
    
    this.deleteAll = function (table = "", store_index ='by_id') {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table, 'readwrite');
                let store = transaction.objectStore(table);
                let index = store.index(store_index);

                let request2 = index.openCursor();

                request2.onsuccess = function () {
                    var cursor = request2.result;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                    }
                    else{
                        resolve(0);
                    }
                }
                transaction.oncomplete = function () {
                    db.close()
                }
            }
        })
    }

}
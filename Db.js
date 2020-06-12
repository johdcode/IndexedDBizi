/**
 * 
 *  INDEXEDDB - CRUD 
 * 
 **/

"use strict;"

function indexedDBObj(){
    
    this.result =  [];
    this.DB_NAME = 'mabase';

    /** INIT */
    this.installDB = function() {
        // Ouvrir la base de données
        // Si elle n'existe pas, elle est créé
        let request = indexedDB.open(this.DB_NAME);
    
        request.onupgradeneeded = function () {
            let db = request.result;
            ////////////////////////////////// TABLE JOUR
            // Creer la table 'jour', stocker par leurs numero
            let store = db.createObjectStore('jour', { keyPath: 'id', autoIncrement: true });
            // Creer un index
            let date_index = store.createIndex('by_date', 'date_jour', { unique: true });
            let jour_id_index = store.createIndex('by_id', 'id', { unique: true });
    
            store.put({ date_jour: "2020/04/25", poids: 0, muscle: 'Vide', debut_jeune: '2020-04-28T21:45:00.000', fin_jeune: '2020-04-29T15:21:00.000', remarque: "Remarque sur votre séance."});
            store.put({ date_jour: "2020/04/26", poids: 0, muscle: 'Vide', debut_jeune: '2020-04-28T21:45:00.000', fin_jeune: '2020-04-29T15:21:00.000', remarque: "Remarque sur votre séance."});
            store.put({ date_jour: "2020/04/27", poids: 0, muscle: 'Vide', debut_jeune: '2020-04-28T21:45:00.000', fin_jeune: '2020-04-29T15:21:00.000', remarque: "Remarque sur votre séance."});
            ////////////////////////////////// TABLE MUSCLE
            store = db.createObjectStore('muscle', { keyPath: 'id', autoIncrement: true });
            let name_index = store.createIndex('by_name', 'muscle_name', { unique: true });
            let muscle_id_index = store.createIndex('by_id', 'id', { unique: true });
    
            store.put({ muscle_name: 'Triceps' });
            store.put({ muscle_name: 'Biceps' });
            store.put({ muscle_name: 'Pectoraux' });
            store.put({ muscle_name: 'Dos' });
            store.put({ muscle_name: 'Abdos' });
            store.put({ muscle_name: 'Cuisse' });
            store.put({ muscle_name: 'Fessier' });
            store.put({ muscle_name: 'Mollets' });

            ////////////////////////////////// TABLE SAVE
            store = db.createObjectStore('save', { keyPath: 'id', autoIncrement: true });
            store.createIndex('by_id', 'id', { unique: true });
            store.createIndex('by_date', 'date_save', { unique: true });
    
            store.put({ date_save: '2020-04-28T21:45:00.000', last_id: 1, last_date: '2020/04/25'});
    
            /////////////////////////////////// TABLE DUREE JEUNE
            store = db.createObjectStore('jeune', { keyPath: 'id', autoIncrement: true });
            store.createIndex('by_id', 'id', { unique: true });
    
            store.put({ fast_duration: '16'});
    
            db.close();
        }
    }
    this.installDB();
    // installDB();
    
    /** CREATE */
    this.createData = function(table, data) {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME);
            switch (table) {
                case 'jour':
                    request.onsuccess = function () {
                        let db = request.result;
                        let transaction = db.transaction('jour', 'readwrite');
                        let store = transaction.objectStore('jour');
                        let index = store.index('by_date');
        
                        store.put({ date_jour: data.date_jour, poids: data.poids, muscle: data.muscle, debut_jeune: data.debut_jeune, fin_jeune: data.fin_jeune, remarque: data.remarque })
                            .onsuccess = function(e){
                                resolve(e.target.result);
                            }
                        transaction.onerror = function(e){
                            reject(e);
                        }
                        transaction.oncomplete = function(){
                            db.close();
                        }
                    }
                    break;
        
                case 'muscle':
                    request.onsuccess = function () {
                        let db = request.result;
                        let transaction = db.transaction('muscle', 'readwrite');
                        let store = transaction.objectStore('muscle');
                        let index = store.index('by_name');
        
                        store.put({ muscle_name: data.muscle_name })
                            .onsuccess = function (e) {
                                resolve(e.target.result);
                                db.close();
                            }
                        transaction.onerror = function (e) {
                                reject(e);
                                db.close();
                            }
                    }
                    break;
                case 'save':
                    request.onsuccess = function () {
                        let db = request.result;
                        let transaction = db.transaction('save', 'readwrite');
                        let store = transaction.objectStore('save');
                        let index = store.index('by_id');
        
                        store.put({ date_save: data.date_save, last_date: data.last_date })
                            .onsuccess = function (e) {
                                resolve(e.target.result);
                                db.close();
                            }
                        transaction.onerror = function (e) {
                                reject(e);
                                db.close();
                            }
                    }
                    break;
                case 'jeune':
                    request.onsuccess = function () {
                        let db = request.result;
                        let transaction = db.transaction('jeune', 'readwrite');
                        let store = transaction.objectStore('jeune');
                        let index = store.index('by_id');

                        store.put({ fast_duration: data.fast_duration })
                            .onsuccess = function (e) {
                                resolve(e.target.result);
                                db.close();
                            }
                        transaction.onerror = function (e) {
                                reject(e);
                                db.close();
                            }
                    }
                    break;
            }
        });
    }
    // createData('jour', { date: "2020-05-02", poid: 100, muscle: 'biceps, dos' } );
    // createData('muscle', { muscle_name: "Ichio" } );
    
    /** READ */
    this.readKey = function(table, key) {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME);
    
            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_id'
                    var _report = function (obj) {
                        // console.log(obj.value)
                        return [obj.value.id, obj.value.date, obj.value.poid, obj.value.muscle, obj.value.debut_jeune, obj.value.fin_jeune];
                    }
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_id'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.muscle_name);
                    }
                    break;
                }
            
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readonly');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);

                let request2 = index.openCursor(key);
                request2.onsuccess = function () {
                    let cursor = request2.result;
                    if (cursor) {
                        // _report(cursor);
                        resolve(cursor.value);
                    }
                    else {
                        // report();
                        reject();
                    }
                }
                request2.onerror = function(){
                        reject();
                    }
                transaction.oncomplete = function () {
                        db.close()
                    }
            }
        });
    };
    // readKey('jour', 2);
    // readKey('muscle', 3);
    
    this.readValue = function(table, value) {
        return new Promise((resolve, reject) => {

            let request = indexedDB.open(this.DB_NAME);
        
            switch (table) {
                case 'jour':
                    var table_name = 'jour';
                    var table_index = 'by_date';
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.date, obj.value.poid, obj.value.muscle);
                    }
                    break;
                case 'muscle':
                    var table_name = 'muscle';
                    var table_index = 'by_name';
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.muscle_name);
                    }
                    break;
            }
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readonly');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);
        
                let request2 = index.openCursor(value);
        
                request2.onsuccess = function () {
                    let cursor = request2.result;
                    if (cursor != undefined) {
                        // _report(cursor)
                        resolve(cursor.value);
                    }
                    else {
                        // report(NULL);
                        // reject()
                    }
                }
                transaction.oncomplete = function () {
                    // console.log('Mise à jour de la base de données.');
                    db.close()
                }
            }
        });
    }
    // readValue('jour', '2020-04-29');
    // readValue('muscle', 'Abdos');
    
    this.readAll = function(table) {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME);
            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_date'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.date, obj.value.poid, obj.value.muscle);
                    }
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_name'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.muscle_name);
                    }
                    break;
            }
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readonly');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);
        
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
    // readAll('jour');
    // readAll('muscle');
    
    this.readFirst = function(table) {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME);
            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_id'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.date, obj.value.poid, obj.value.muscle);
                    }
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_id'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.muscle_name);
                    }
                    break;
                case 'save':
                    var table_name = 'save'
                    var table_index = 'by_id'
                    break;
            }
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readonly');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);

                let request2 = index.openCursor(null);

                request2.onsuccess = function () {
                    let cursor = request2.result;
                    if (cursor) {
                        // _report(cursor);
                        resolve(cursor.value);
                    }
                    else {
                        // report();
                        reject("La donnée n'a pas été trouvée.")
                    }
                }
                transaction.oncomplete = function () {
                    // console.log('Mise à jour de la base de données.');
                    db.close();
                }
            }
        });
    }
    this.readLast = function(table) {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME);
            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_id'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.date, obj.value.poid, obj.value.muscle);
                    }
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_id'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.muscle_name);
                    }
                    break;
                case 'save':
                    var table_name = 'save'
                    var table_index = 'by_id'
                    break;
                case 'jeune':
                    var table_name = 'jeune'
                    var table_index = 'by_id'
                    break;
            }
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readonly');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);

                let request2 = index.openCursor(null, 'prev');

                request2.onsuccess = function () {
                    let cursor = request2.result;
                    if (cursor) {
                        // _report(cursor);
                        resolve(cursor.value);
                    }
                    else {
                        // report();
                        reject("La donnée n'a pas été trouvée.")
                    }
                }
                transaction.oncomplete = function () {
                    // console.log('Mise à jour de la base de données.');
                    db.close();
                }
            }
        });
    }
    // readLast('jour');
    // readLast('muscle');

    this.readNext = function (table, key, direction = 'next') { 
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.DB_NAME);

            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_id'
                    var _report = function (obj) {
                        // console.log(obj.value)
                        return [obj.value.id, obj.value.date, obj.value.poid, obj.value.muscle, obj.value.debut_jeune, obj.value.fin_jeune];
                    }
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_id'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.muscle_name);
                    }
                    break;
            }

            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readonly');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);

                if(direction == 'prev')
                // PREV : la plus haute valeur est la clé (key), exclue (true), avec la direction 'prev' => Le précedente de la clé
                    var request2 = index.openCursor(IDBKeyRange.upperBound(key, true), direction);
                else
                //NEXT : la plus petite valeur est la clé (key), exclue (true), avec la direction 'next' => La suivante de la clé
                    var request2 = index.openCursor(IDBKeyRange.lowerBound(key, true), direction);
                request2.onsuccess = function () {
                    let cursor = request2.result;
                    if (cursor) {
                        resolve(cursor.value);
                    }
                    else {
                        reject();
                    }
                }

                transaction.oncomplete = function () {
                    // console.log('Mise à jour de la base de données.');
                    db.close()
                }
            }
        });
    }
    this.readNextValue = function (table, value, direction = 'next') { 
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.DB_NAME);

            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_date'
                    var _report = function (obj) {
                        // console.log(obj.value)
                        return [obj.value.id, obj.value.date, obj.value.poid, obj.value.muscle, obj.value.debut_jeune, obj.value.fin_jeune];
                    }
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_name'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.muscle_name);
                    }
                    break;
            }

            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readonly');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);

                if(direction == 'prev')
                // PREV : la plus haute valeur est la clé (key), exclue (true), avec la direction 'prev' => Le précedente de la clé
                    var request2 = index.openCursor(IDBKeyRange.upperBound(value, true), direction);
                else
                //NEXT : la plus petite valeur est la clé (key), exclue (true), avec la direction 'next' => La suivante de la clé
                    var request2 = index.openCursor(IDBKeyRange.lowerBound(value, true), direction);
                request2.onsuccess = function () {
                    let cursor = request2.result;
                    if (cursor) {
                        resolve(cursor.value);
                    }
                    else {
                        reject();
                    }
                }

                transaction.oncomplete = function () {
                    // console.log('Mise à jour de la base de données.');
                    db.close()
                }
            }
        });
    }

    this.readFrom = function (table, key, direction = 'next') { 
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.DB_NAME);

            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_date'
                    var _report = function (obj) {
                        // console.log(obj.value)
                        return [obj.value.id, obj.value.date, obj.value.poid, obj.value.muscle, obj.value.debut_jeune, obj.value.fin_jeune];
                    }
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_id'
                    var _report = function (obj) {
                        report(obj.value.id, obj.value.muscle_name);
                    }
                    break;
            }

            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readonly');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);

                if(direction == 'prev')
                    // PREV : la plus haute valeur est la clé (key), exclue (true), avec la direction 'prev' => Le précedente de la clé
                    var request2 = index.openCursor(IDBKeyRange.upperBound(key, true), direction);
                else
                    //NEXT : la plus petite valeur est la clé (key), exclue (true), avec la direction 'next' => La suivante de la clé
                    var request2 = index.openCursor(IDBKeyRange.lowerBound(key, true), direction);
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
    this.updateKey = function(table, key, data) {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME);
            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_id'
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_id'
                    break;
            }
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readwrite');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);
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
    // updateKey('muscle', 2, {muscle_name: 'Bob'});
    // updateKey('jour', 2, { date: "2020-05-01", poid: 50, muscle: 'Changement !' });
    
    /** DELETE */
    this.deleteKey = function(table, key) {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME);
            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_id'
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_id'
                    break;
            }
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readwrite');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);
                
                store.delete(key)
                    .onsuccess = function(r){
                        resolve(r);
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
    // deleteKey('jour', 2);
    // deleteKey('muscle', 2);
    
    this.deleteValue = function(table, value) {
        let request = indexedDB.open(this.DB_NAME);
        switch (table) {
            case 'jour':
                var table_name = 'jour'
                var table_index = 'by_date'
                break;
            case 'muscle':
                var table_name = 'muscle'
                var table_index = 'by_name'
                break;
        }
        request.onsuccess = function () {
            let db = request.result;
            let transaction = db.transaction(table_name, 'readwrite');
            let store = transaction.objectStore(table_name);
            let index = store.index(table_index);
    
            let request2 = index.openCursor(value);
    
            request2.onsuccess = function () {
                let cursor = request2.result;
                if (cursor.value != undefined) {
                    cursor.delete();
                }
                else {
                    report();
                }
            }
            transaction.oncomplete = function () {
                // console.log('Mise à jour de la base de données.');
                db.close()
            }
        }
    }
    // deleteValue('jour', '2020-04-28');
    // deleteValue('muscle', 'Cuisse');

    this.deleteAll = function(table) {
        return new Promise((resolve, reject)=>{
            let request = indexedDB.open(this.DB_NAME);
            switch (table) {
                case 'jour':
                    var table_name = 'jour'
                    var table_index = 'by_date'
                    break;
                case 'muscle':
                    var table_name = 'muscle'
                    var table_index = 'by_name'
                    break;
                case 'save':
                    var table_name = 'save'
                    var table_index = 'by_id'
                    break;
                case 'jeune':
                    var table_name = 'jeune'
                    var table_index = 'by_id'
                    break;
            }
            request.onsuccess = function () {
                let db = request.result;
                let transaction = db.transaction(table_name, 'readwrite');
                let store = transaction.objectStore(table_name);
                let index = store.index(table_index);

                let request2 = index.openCursor();

                request2.onsuccess = function () {
                    var cursor = request2.result;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                    }
                    else{
                        resolve();
                    }
                }
                transaction.oncomplete = function () {
                    // console.log('Mise à jour de la base de données.');
                    db.close()
                }
            }
        })
    }
    // deleteAll('jour');
    // deleteAll('muscle');
}
/** REPORT */
let report = function(obj) {
    console.log(obj)

    // return arguments;
    // if (arguments[0] != null) {
    //     let h2 = document.createElement('h2');
    //     h2.textContent = arguments[1];

    //     let ul = document.createElement('ul');
    //     let li = [];
    //     arguments.forEach((arg) => {
    //         let l = document.createElement('li');
    //         l.textContent = arg;
    //         li.push(l);
    //     })
    //     li.forEach((e) => {
    //         ul.appendChild(e);
    //     })

    //     document.getElementById('result').appendChild(h2);
    //     document.getElementById('result').appendChild(ul);
    // }
}
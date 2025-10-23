export default class IndexedDbManager {
   constructor(databaseName, storeNames) {
      this.databaseName = databaseName;
      this.storeNames = Array.isArray(storeNames) ? storeNames : [storeNames];
      this.db = null;
   }
   
   async openDatabase() {
      if (this.db) {
         return Promise.resolve(this.db);
      }

      return new Promise((resolve, reject) => {
         // --- CAMBIO 1: Incrementar la versión de la base de datos a 2 ---
         // Esto disparará el evento 'onupgradeneeded' para los usuarios existentes.
         const request = indexedDB.open(this.databaseName, 2);

         request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const transaction = event.target.transaction;

            // Lógica de creación de almacenes (sin cambios)
            this.storeNames.forEach(storeName => {
               if (!db.objectStoreNames.contains(storeName)) {
                  db.createObjectStore(storeName, {
                     keyPath: 'id',
                     autoIncrement: true,
                  });
               }
            });

            // --- CAMBIO 2: Lógica de migración de esquema para SRS ---
            // Si la versión antigua es menor que 2, estamos actualizando.
            if (event.oldVersion < 2) {
               console.log("Upgrading database to v2 for Spaced Repetition System...");
               if (db.objectStoreNames.contains('flashcards')) {
                  // Obtenemos el almacén de tarjetas dentro de la transacción de actualización.
                  const flashcardStore = transaction.objectStore('flashcards');
                  // Creamos un índice en 'nextReviewDate'. Esto es VITAL para buscar
                  // eficientemente las tarjetas pendientes de revisión.
                  flashcardStore.createIndex('nextReviewDateIdx', 'nextReviewDate', { unique: false });
                  console.log("Index 'nextReviewDateIdx' created on 'flashcards' store.");
               }
            }
         };

         request.onsuccess = (event) => {
            this.db = event.target.result;
            resolve(this.db);
         };

         request.onerror = (event) => {
            reject(new Error(`Error opening IndexedDB: ${event.target.error}`));
         };
      });
   }

   closeDatabase() {
      if (this.db) {
         this.db.close();
         this.db = null;
      }
   }

   // 3. Todos los métodos de datos ahora aceptan 'storeName' como primer argumento

   async addItem(storeName, item) {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
         const transaction = db.transaction([storeName], 'readwrite');
         const store = transaction.objectStore(storeName);
         const request = store.add(item);

         request.onsuccess = (event) => {
            // Devolvemos el objeto completo con el ID que IndexedDB le asignó
            const newItem = { ...item, id: event.target.result };
            resolve(newItem);
         };

         request.onerror = (event) => {
            reject(new Error(`Error adding item to ${storeName}: ${event.target.error}`));
         };
      });
   }

   async updateItem(storeName, item) {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
         const transaction = db.transaction([storeName], 'readwrite');
         const store = transaction.objectStore(storeName);
         const request = store.put(item);

         request.onsuccess = () => {
            resolve(item); 
         };

         request.onerror = (event) => {
            reject(new Error(`Error updating item in ${storeName}: ${event.target.error}`));
         };
      });
   }

   async getItem(storeName, id) {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
         const transaction = db.transaction([storeName], 'readonly');
         const store = transaction.objectStore(storeName);
         const request = store.get(id);

         request.onsuccess = () => {
            resolve(request.result);
         };

         request.onerror = (event) => {
            reject(new Error(`Error getting item from ${storeName}: ${event.target.error}`));
         };
      });
   }

   async deleteItem(storeName, id) {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
         const transaction = db.transaction([storeName], 'readwrite');
         const store = transaction.objectStore(storeName);
         const request = store.delete(id);

         request.onsuccess = () => {
            resolve();
         };

         request.onerror = (event) => {
            reject(new Error(`Error deleting item from ${storeName}: ${event.target.error}`));
         };
      });
   }

   async getAllItems(storeName) {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
         const transaction = db.transaction([storeName], 'readonly');
         const store = transaction.objectStore(storeName);
         const request = store.getAll();

         request.onsuccess = () => {
            resolve(request.result);
         };

         request.onerror = (event) => {
            reject(new Error(`Error getting items from ${storeName}: ${event.target.error}`));
         };
      });
   }

   async clearItems(storeName) {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
         const transaction = db.transaction([storeName], 'readwrite');
         const store = transaction.objectStore(storeName);
         const request = store.clear();

         request.onsuccess = () => {
            resolve();
         };

         request.onerror = (event) => {
            reject(new Error(`Error clearing items in ${storeName}: ${event.target.error}`));
         };
      });
   }

   /**
    * Obtiene todos los elementos de un almacén que coinciden con una consulta en un índice específico.
    * @param {string} storeName - El nombre del almacén.
    * @param {string} indexName - El nombre del índice a consultar (ej: 'nextReviewDateIdx').
    * @param {IDBKeyRange} query - El rango de la consulta (ej: todas las fechas hasta hoy).
    * @returns {Promise<Array>} - Una promesa que se resuelve con un array de elementos.
    */
   async getItemsByIndex(storeName, indexName, query) {
      await this.openDatabase();
      return new Promise((resolve, reject) => {
         const transaction = this.db.transaction(storeName, 'readonly');
         const store = transaction.objectStore(storeName);
         const index = store.index(indexName);
         const request = index.getAll(query);

         request.onsuccess = () => {
            resolve(request.result);
         };

         request.onerror = (event) => {
            reject(new Error(`Error fetching items by index: ${event.target.error}`));
         };
      });
   }
}
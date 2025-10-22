export default class IndexedDbManager {
   // 1. El constructor ahora acepta un array de nombres de almacenes
   constructor(databaseName, storeNames) {
      this.databaseName = databaseName;
      // Nos aseguramos de que storeNames sea siempre un array
      this.storeNames = Array.isArray(storeNames) ? storeNames : [storeNames];
      this.db = null;
   }
   
   // 2. openDatabase ahora crea todos los almacenes de una vez
   async openDatabase() {
      // Si ya tenemos una conexión abierta, la reutilizamos
      if (this.db) {
         return Promise.resolve(this.db);
      }

      return new Promise((resolve, reject) => {
         // IMPORTANTE: Se debe especificar una versión para que onupgradeneeded se dispare
         const request = indexedDB.open(this.databaseName, 1);

         // Este evento solo se ejecuta si la versión cambia o la DB no existe
         request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Recorremos el array de nombres de almacenes
            this.storeNames.forEach(storeName => {
               // Y creamos cada almacén si no existe
               if (!db.objectStoreNames.contains(storeName)) {
                  db.createObjectStore(storeName, {
                     keyPath: 'id',
                     autoIncrement: true,
                  });
               }
            });
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
            resolve(item); // Devolvemos el item actualizado
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
}
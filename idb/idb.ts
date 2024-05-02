import { Stores, type Note, type User } from "./store";

const DB_NAME = "notey";
const DB_VERSION = 5;

export default {
  async initDB(): Promise<IDBDatabase | null> {
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(null);
      };

      request.onsuccess = () => {
        const db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = () => {
        console.log("WARN: upgrade needed");
        const db = request.result;
        if (!db.objectStoreNames.contains(Stores.Note)) {
          db.createObjectStore(Stores.Note, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(Stores.User)) {
          db.createObjectStore(Stores.User, { keyPath: "name" });
        }
      };
    });
  },
  async createUser(
    db: IDBDatabase,
    storeName: Stores,
    user: User
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(user);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  },
  async getUser(db: IDBDatabase, storeName: Stores): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  async getAll(db: IDBDatabase, storeName: Stores): Promise<Note[]> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },
  async updateByID(db: IDBDatabase, storeName: Stores, note: Note) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      // Check if the record exists
      const getRequest = store.get(note.id);

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          // Record exists, proceed with the update
          const putRequest = store.put(note);

          putRequest.onsuccess = () => {
            resolve(true);
          };
          putRequest.onerror = () => {
            resolve(false);
          };
        } else {
          // Record doesn't exist
          resolve(false);
        }
      };

      getRequest.onerror = () => {
        resolve(false);
      };

      transaction.oncomplete = () => {
        console.log("Transaction completed");
      };

      transaction.onerror = () => {
        resolve(false);
      };
    });
  },

  async insert(
    db: IDBDatabase,
    storeName: Stores,
    note: Note
  ): Promise<IDBValidKey | null> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(note);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(null);
      };
    });
  },

  async deleteByID(
    db: IDBDatabase,
    storeName: Stores,
    id: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  },

  async getByID(
    db: IDBDatabase,
    storeName: Stores,
    id: string
  ): Promise<Note | null> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result ? request.result : null);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  async clear(db: IDBDatabase, storeName: Stores): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },
};

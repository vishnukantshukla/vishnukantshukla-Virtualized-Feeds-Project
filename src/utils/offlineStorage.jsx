class OfflineStorage {
    constructor() {
      this.dbName = 'virtualizedFeedDB';
      this.dbVersion = 1;
      this.postsStoreName = 'posts';
      this.db = null;
      this.initDB();
    }
    
    // Initialize the database
    async initDB() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          console.error("Your browser doesn't support IndexedDB");
          reject("IndexedDB not supported");
          return;
        }
        
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = (event) => {
          console.error("IndexedDB error:", event.target.error);
          reject("Error opening database");
        };
        
        request.onsuccess = (event) => {
          this.db = event.target.result;
          console.log("Database opened successfully");
          resolve(this.db);
        };
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Create object store for posts if it doesn't exist
          if (!db.objectStoreNames.contains(this.postsStoreName)) {
            const objectStore = db.createObjectStore(this.postsStoreName, { keyPath: 'id' });
            objectStore.createIndex('id', 'id', { unique: true });
            objectStore.createIndex('type', 'type', { unique: false });
            console.log("Object store created");
          }
        };
      });
    }
    
    // Save posts to IndexedDB
    async savePosts(posts) {
      if (!Array.isArray(posts)) {
        posts = [posts];
      }
      
      try {
        if (!this.db) {
          await this.initDB();
        }
        
        const transaction = this.db.transaction(this.postsStoreName, 'readwrite');
        const store = transaction.objectStore(this.postsStoreName);
        
        posts.forEach(post => {
          store.put(post);
        });
        
        return new Promise((resolve, reject) => {
          transaction.oncomplete = () => {
            console.log(`${posts.length} posts saved to IndexedDB`);
            resolve(true);
          };
          
          transaction.onerror = (error) => {
            console.error("Error saving posts:", error);
            reject(error);
          };
        });
      } catch (error) {
        console.error("Error in savePosts:", error);
        throw error;
      }
    }
    
    // Get all posts from IndexedDB
    async getAllPosts() {
      try {
        if (!this.db) {
          await this.initDB();
        }
        
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(this.postsStoreName, 'readonly');
          const store = transaction.objectStore(this.postsStoreName);
          const request = store.getAll();
          
          request.onsuccess = () => {
            resolve(request.result);
          };
          
          request.onerror = (error) => {
            console.error("Error getting posts:", error);
            reject(error);
          };
        });
      } catch (error) {
        console.error("Error in getAllPosts:", error);
        throw error;
      }
    }
    
    // Get a specific post by ID
    async getPostById(id) {
      try {
        if (!this.db) {
          await this.initDB();
        }
        
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(this.postsStoreName, 'readonly');
          const store = transaction.objectStore(this.postsStoreName);
          const request = store.get(id);
          
          request.onsuccess = () => {
            resolve(request.result);
          };
          
          request.onerror = (error) => {
            console.error("Error getting post:", error);
            reject(error);
          };
        });
      } catch (error) {
        console.error("Error in getPostById:", error);
        throw error;
      }
    }
    
    // Delete a post by ID
    async deletePost(id) {
      try {
        if (!this.db) {
          await this.initDB();
        }
        
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(this.postsStoreName, 'readwrite');
          const store = transaction.objectStore(this.postsStoreName);
          const request = store.delete(id);
          
          request.onsuccess = () => {
            resolve(true);
          };
          
          request.onerror = (error) => {
            console.error("Error deleting post:", error);
            reject(error);
          };
        });
      } catch (error) {
        console.error("Error in deletePost:", error);
        throw error;
      }
    }
    
    // Clear all posts
    async clearAllPosts() {
      try {
        if (!this.db) {
          await this.initDB();
        }
        
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(this.postsStoreName, 'readwrite');
          const store = transaction.objectStore(this.postsStoreName);
          const request = store.clear();
          
          request.onsuccess = () => {
            console.log("All posts cleared");
            resolve(true);
          };
          
          request.onerror = (error) => {
            console.error("Error clearing posts:", error);
            reject(error);
          };
        });
      } catch (error) {
        console.error("Error in clearAllPosts:", error);
        throw error;
      }
    }
  }
  
  // Create and export a singleton instance
  const offlineStorage = new OfflineStorage();
  export default offlineStorage;

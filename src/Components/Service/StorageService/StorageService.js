import IndexedDbManager from '../IndexedDbManager/IndexedDbManager.js';

let instance = null;

export default class StorageService {
  constructor(props) {
    if (instance) {
      return instance;
    }

    this.props = props || {};
    
    const DB_NAME = 'FlashcardAppDB';
    const STORE_NAMES = ['decks', 'flashcards'];

    this.dbManager = new IndexedDbManager(DB_NAME, STORE_NAMES);
    
    instance = this;
  }

  async init() {
    try {
      await this.dbManager.openDatabase();
      console.log('StorageService initialized and database is ready.');
    } catch (error) {
      console.error('Failed to initialize StorageService:', error);
    }
  }

  // --- Métodos para Mazos (Decks) ---

  async saveDeck(deckData) {
    return this.dbManager.addItem('decks', deckData);
  }

  async getAllDecks() {
    return this.dbManager.getAllItems('decks');
  }

  async getDeck(deckId) {
    return this.dbManager.getItem('decks', deckId);
  }

  async deleteDeck(deckId) {
    return this.dbManager.deleteItem('decks', deckId);
  }

  // --- Métodos para Tarjetas (Flashcards) ---

  async saveFlashcard(cardData) {
    return this.dbManager.addItem('flashcards', cardData);
  }

  async getFlashcardsByDeck(deckId) {
    const allCards = await this.dbManager.getAllItems('flashcards');
    return allCards.filter(card => card.deckId === Number(deckId));
  }

  async getCard(cardId) {
    return this.dbManager.getItem('flashcards', cardId);
  }

  async updateCard(cardData) {
    return this.dbManager.updateItem('flashcards', cardData);
  }

  async deleteCard(cardId) {
    return this.dbManager.deleteItem('flashcards', cardId);
  }

  // --- Métodos Genéricos ---

  /**
   * Obtiene todos los items de un almacén de objetos específico.
   * @param {string} storeName 
   * @returns {Promise<Array>} 
   */
  async getAllItems(storeName) {
    return this.dbManager.getAllItems(storeName);
  }
}
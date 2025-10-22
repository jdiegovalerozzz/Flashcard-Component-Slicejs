import IndexedDbManager from '../IndexedDbManager/IndexedDbManager.js';

// 1. Creamos una variable fuera de la clase para mantener la instancia única.
let instance = null;

export default class StorageService {
  constructor(props) {
    // 2. Si ya existe una instancia, la devolvemos inmediatamente.
    if (instance) {
      return instance;
    }

    this.props = props || {};
    
    const DB_NAME = 'FlashcardAppDB';
    const STORE_NAMES = ['decks', 'flashcards'];

    this.dbManager = new IndexedDbManager(DB_NAME, STORE_NAMES);
    
    // 3. Guardamos esta nueva instancia en nuestra variable.
    instance = this;
  }

  // El resto del código permanece exactamente igual...
  async init() {
    try {
      await this.dbManager.openDatabase();
      console.log('StorageService initialized and database is ready.');
    } catch (error) {
      console.error('Failed to initialize StorageService:', error);
    }
  }

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
}
import IndexedDbManager from "../IndexedDbManager/IndexedDbManager.js";

let instance = null;

export default class StorageService {
  constructor(props) {
    if (instance) {
      return instance;
    }

    this.props = props || {};

    const DB_NAME = "FlashcardAppDB";
    const STORE_NAMES = ["decks", "flashcards", "settings"];

    this.dbManager = new IndexedDbManager(DB_NAME, STORE_NAMES);

    instance = this;
  }

  async init() {
    try {
      await this.dbManager.openDatabase();
      console.log("StorageService initialized and database is ready.");
    } catch (error) {
      console.error("Failed to initialize StorageService:", error);
    }
  }

  // --- Settings Methods ---

  async saveSettings(settingsData) {
    const settingsToSave = { id: 1, ...settingsData };
    return this.dbManager.updateItem("settings", settingsToSave);
  }

  async getSettings() {
    return this.dbManager.getItem("settings", 1);
  }

  // --- Métodos para Mazos (Decks) ---

  async saveDeck(deckData) {
    return this.dbManager.addItem("decks", deckData);
  }

  async getAllDecks() {
    return this.dbManager.getAllItems("decks");
  }

  async getDeck(deckId) {
    return this.dbManager.getItem("decks", deckId);
  }

  async deleteDeck(deckId) {
    console.log(
      `[StorageService] Iniciando eliminación del mazo ${deckId} y sus tarjetas.`
    );

    // 1. Encontrar todas las tarjetas que pertenecen a este mazo.
    const cardsToDelete = await this.getFlashcardsByDeck(deckId);

    // 2. Crear una lista de promesas para eliminar cada tarjeta.
    const deleteCardPromises = cardsToDelete.map((card) =>
      this.deleteCard(card.id)
    );

    // 3. Ejecutar todas las promesas de eliminación de tarjetas en paralelo.
    await Promise.all(deleteCardPromises);
    console.log(
      `[StorageService] ${cardsToDelete.length} tarjetas asociadas eliminadas.`
    );

    // 4. Finalmente, eliminar el mazo en sí.
    await this.dbManager.deleteItem("decks", deckId);
    console.log(`[StorageService] Mazo ${deckId} eliminado correctamente.`);
  }

  // --- Métodos para Tarjetas (Flashcards) ---

  async saveFlashcard(cardData) {
    return this.dbManager.addItem("flashcards", cardData);
  }

  async getFlashcardsByDeck(deckId) {
    const allCards = await this.dbManager.getAllItems("flashcards");
    return allCards.filter((card) => card.deckId === Number(deckId));
  }

  async getCard(cardId) {
    return this.dbManager.getItem("flashcards", cardId);
  }

  async updateCard(cardData) {
    return this.dbManager.updateItem("flashcards", cardData);
  }

  async deleteCard(cardId) {
    return this.dbManager.deleteItem("flashcards", cardId);
  }

  // --- Métodos Genéricos ---

  async getAllItems(storeName) {
    return this.dbManager.getAllItems(storeName);
  }
}

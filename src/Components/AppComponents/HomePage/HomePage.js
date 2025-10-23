import StorageService from '../../Service/StorageService/StorageService.js';
import '../../Visual/Flashcard/Flashcard.js';
import '../../Visual/FlashcardModal/FlashcardModal.js';
import CardRenderer from '../../Service/CardRenderer/CardRenderer.js';

export default class HomePage extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        // Corregimos el constructor para que sea más robusto
        this.props = props || {};
        this.storageService = new StorageService();
    }

    async init() {
        await this.storageService.init();

        // Guardamos las referencias como propiedades de la instancia
        this.decksGrid = this.querySelector('#decks-grid');
        this.allCardsGrid = this.querySelector('#all-cards-grid');
        this.modalContainer = this.querySelector('#modal-container');
        const addCardButton = this.querySelector('#add-card-button');
        const settingsButton = this.querySelector('#settings-button');

        // Construimos el modal una sola vez
        this.flashcardModal = await slice.build('FlashcardModal', {});
        this.modalContainer.appendChild(this.flashcardModal);

        // Configuramos los listeners una sola vez
        addCardButton.addEventListener('click', () => {
            slice.router.navigate('/create-flashcard');
        });

        settingsButton.addEventListener('click', () => {
            slice.router.navigate('/settings');
        });

        // Renderizamos el contenido por primera vez
        await this.renderDashboard();
    }

    // --- INICIO DEL CAMBIO ---
    /**
     * El router llamará a este método cuando se navegue de vuelta a HomePage.
     * Se encarga de refrescar el contenido.
     */
    async update() {
        console.log('[HomePage] Update llamado. Refrescando el dashboard...');
        await this.renderDashboard();
    }
    // --- FIN DEL CAMBIO ---

    async renderDashboard() {
        // Ahora usamos las referencias guardadas en 'this'
        this.decksGrid.innerHTML = '';
        this.allCardsGrid.innerHTML = '';

        const decks = await this.storageService.getAllDecks();
        const allCards = await this.storageService.getAllItems('flashcards');

        if (decks.length === 0) {
            this.decksGrid.innerHTML = '<p>No decks found. Add a new card to create one!</p>';
        } else {
            for (const deck of decks) {
                const cardsInDeck = allCards.filter(c => c.deckId === deck.id);
                const deckCard = this.createDeckCard(deck, cardsInDeck.length);
                this.decksGrid.appendChild(deckCard);
            }
        }

        if (allCards.length === 0) {
            this.allCardsGrid.innerHTML = '<p>No flashcards found yet.</p>';
        } else {
            for (const card of allCards) {
                const cardWrapper = await CardRenderer.createCardWrapper({
                    card: card,
                    flashcardModal: this.flashcardModal // Usamos el modal guardado
                });
                this.allCardsGrid.appendChild(cardWrapper);
            }
        }
    }

    createDeckCard(deck, cardCount) {
        const cardEl = document.createElement('div');
        cardEl.className = 'deck-card';
        cardEl.innerHTML = `
            <div class="deck-card-header">
                <h3>${deck.name}</h3>
                <span>${deck.difficulty}</span>
            </div>
            <p class="deck-card-info">${cardCount} card${cardCount !== 1 ? 's' : ''}</p>
            <div class="deck-card-actions">
                <button class="action-button edit">Edit</button>
                <button class="action-button delete">Delete</button>
            </div>
        `;

        const deleteButton = cardEl.querySelector('.action-button.delete');
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();

            if (confirm(`Are you sure you want to delete the deck "${deck.name}" and all its cards?`)) {
                try {
                    await this.storageService.deleteDeck(deck.id);
                    cardEl.remove();
                } catch (error) {
                    console.error(`Failed to delete deck ${deck.id}:`, error);
                    alert('An error occurred while deleting the deck.');
                }
            }
        });

        cardEl.addEventListener('click', (e) => {
            if (!e.target.closest('.action-button')) {
                slice.router.navigate(`/deck/${deck.id}`);
            }
        });
        return cardEl;
    }
}

customElements.define('home-page', HomePage);
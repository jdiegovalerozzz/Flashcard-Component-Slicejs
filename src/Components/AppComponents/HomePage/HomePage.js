import StorageService from '../../Service/StorageService/StorageService.js';
import '../../Visual/Flashcard/Flashcard.js';
import '../../Visual/FlashcardModal/FlashcardModal.js';
import CardRenderer from '../../Service/CardRenderer/CardRenderer.js';

export default class HomePage extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        slice.controller.setComponentProps(this, props);
        this.storageService = new StorageService();
    }

    async init() {
        await this.storageService.init();

        const decksGrid = this.querySelector('#decks-grid');
        const allCardsGrid = this.querySelector('#all-cards-grid');
        const modalContainer = this.querySelector('#modal-container');
        const addCardButton = this.querySelector('#add-card-button');
        const settingsButton = this.querySelector('#settings-button');

        const flashcardModal = await slice.build('FlashcardModal', {});
        modalContainer.appendChild(flashcardModal);

        addCardButton.addEventListener('click', () => {
            slice.router.navigate('/create-flashcard');
        });

        settingsButton.addEventListener('click', () => {
            slice.router.navigate('/settings');
        });

        this.renderDashboard(decksGrid, allCardsGrid, flashcardModal);
    }

    async renderDashboard(decksGrid, allCardsGrid, flashcardModal) {
        decksGrid.innerHTML = '';
        allCardsGrid.innerHTML = '';

        const decks = await this.storageService.getAllDecks();
        const allCards = await this.storageService.getAllItems('flashcards');

        if (decks.length === 0) {
            decksGrid.innerHTML = '<p>No decks found. Add a new card to create one!</p>';
        } else {
            for (const deck of decks) {
                const cardsInDeck = allCards.filter(c => c.deckId === deck.id);
                const deckCard = this.createDeckCard(deck, cardsInDeck.length);
                decksGrid.appendChild(deckCard);
            }
        }

        if (allCards.length === 0) {
            allCardsGrid.innerHTML = '<p>No flashcards found yet.</p>';
        } else {
            for (const card of allCards) {
                // --- INICIO DEL CAMBIO ---
                // Se envuelven los argumentos en un solo objeto {}
                const cardWrapper = await CardRenderer.createCardWrapper({
                    card: card,
                    flashcardModal: flashcardModal
                });
                // --- FIN DEL CAMBIO ---
                allCardsGrid.appendChild(cardWrapper);
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
        cardEl.addEventListener('click', (e) => {
            if (!e.target.closest('.action-button')) {
                slice.router.navigate(`/deck/${deck.id}`);
            }
        });
        return cardEl;
    }
}

customElements.define('home-page', HomePage);
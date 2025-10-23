import StorageService from '../../Service/StorageService/StorageService.js';
import '../../Visual/Flashcard/Flashcard.js';
import '../../Visual/FlashcardModal/FlashcardModal.js';
import CardRenderer from '../../Service/CardRenderer/CardRenderer.js';

export default class HomePage extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        this.props = props || {};
        this.storageService = new StorageService();
    }

    async init() {
        await this.storageService.init();

        this.decksGrid = this.querySelector('#decks-grid');
        this.allCardsGrid = this.querySelector('#all-cards-grid');
        this.modalContainer = this.querySelector('#modal-container');
        this.languageIndicator = this.querySelector('#language-indicator');
        const addCardButton = this.querySelector('#add-card-button');
        const settingsButton = this.querySelector('#settings-button');

        this.flashcardModal = await slice.build('FlashcardModal', {});
        this.modalContainer.appendChild(this.flashcardModal);

        addCardButton.addEventListener('click', () => {
            slice.router.navigate('/create-flashcard');
        });

        settingsButton.addEventListener('click', () => {
            slice.router.navigate('/settings');
        });

        await this.renderDashboard();
    }

    async update() {
        console.log('[HomePage] Update llamado. Refrescando el dashboard...');
        await this.renderDashboard();
    }

    async renderDashboard() {
        this.decksGrid.innerHTML = '';
        this.allCardsGrid.innerHTML = '';

        const settings = await this.storageService.getSettings();
        const allLangs = await this.storageService.getAllLanguages();
        const allDecks = await this.storageService.getAllDecks();
        const allCards = await this.storageService.getAllItems('flashcards');
        const targetLangCode = settings ? settings.targetLanguage : null;

        if (targetLangCode) {
            const targetLang = allLangs.find(lang => lang.code === targetLangCode);
            this.languageIndicator.textContent = `🎯 Learning: ${targetLang ? targetLang.name : targetLangCode}`;
            this.languageIndicator.style.display = 'block';
        } else {
            this.languageIndicator.textContent = 'Set your target language in Settings!';
            this.languageIndicator.style.display = 'block';
        }

        const filteredDecks = targetLangCode
            ? allDecks.filter(deck => deck.languageCode === targetLangCode)
            : allDecks; // If theres no language selected, show all decks

        if (filteredDecks.length === 0) {
            if (targetLangCode) {
                this.decksGrid.innerHTML = `<p>No decks found for the selected language. Add a new card to create one!</p>`;
            } else {
                this.decksGrid.innerHTML = '<p>No decks found. Add a new card to create one!</p>';
            }
        } else {
            for (const deck of filteredDecks) {
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
                    flashcardModal: this.flashcardModal
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

        // --- INICIO DEL CAMBIO ---
        const editButton = cardEl.querySelector('.action-button.edit');
        editButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic navegue a la página del mazo.
            slice.router.navigate(`/edit-deck/${deck.id}`);
        });
        // --- FIN DEL CAMBIO ---

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
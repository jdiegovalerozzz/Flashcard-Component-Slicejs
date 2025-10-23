import StorageService from '../../Service/StorageService/StorageService.js';
import '../../Visual/Flashcard/Flashcard.js';
import '../../Visual/FlashcardModal/FlashcardModal.js';
import CardRenderer from '../../Service/CardRenderer/CardRenderer.js';

export default class DeckViewPage extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        
        // --- CAMBIO CLAVE Y DEFINITIVO ---
        // Asignamos las props manualmente a la instancia.
        // Si las props de entrada son undefined, this.props será un objeto vacío {}.
        this.props = props || {};
        
        // Ya no dependemos de este método que no funcionaba como esperábamos.
        // slice.controller.setComponentProps(this, this.props); 
        
        this.storageService = new StorageService();
        console.log('[DeckViewPage] Constructor - Props asignadas:', this.props);
    }

    async init() {
        console.log('[DeckViewPage] Init - Props al iniciar:', this.props);
        await this.storageService.init();

        // Ahora este acceso es seguro, porque this.props está garantizado que es un objeto.
        const deckId = this.props.params?.id;
        
        console.log('[DeckViewPage] ID del mazo extraído:', deckId);

        const deckNameEl = this.querySelector('#deck-name');
        const cardsGrid = this.querySelector('#cards-grid');
        const backButton = this.querySelector('#back-button');
        const studyButton = this.querySelector('#study-button');

        backButton.addEventListener('click', () => slice.router.navigate('/'));

        if (!deckId) {
            console.error('[DeckViewPage] ERROR: No se encontró deckId. El router no está pasando los parámetros.');
            deckNameEl.textContent = 'Deck ID not provided in URL.';
            return;
        }

        const deck = await this.storageService.getDeck(Number(deckId));
        const cards = await this.storageService.getFlashcardsByDeck(Number(deckId));

        console.log('[DeckViewPage] Datos del mazo encontrados:', deck);
        console.log('[DeckViewPage] Tarjetas encontradas:', cards);

        if (!deck) {
            console.error('[DeckViewPage] ERROR: No se encontró el mazo en la BD.');
            deckNameEl.textContent = 'Deck not found in database.';
            return;
        }

        deckNameEl.textContent = deck.name;

        if (cards.length === 0) {
            cardsGrid.innerHTML = '<p>This deck has no cards yet.</p>';
        } else {
            const flashcardModal = await slice.build('FlashcardModal', {});
            this.appendChild(flashcardModal);

            for (const card of cards) {
                console.log('[DeckViewPage] Renderizando tarjeta:', card.id);
                const cardWrapper = await CardRenderer.createCardWrapper(card, flashcardModal);
                cardsGrid.appendChild(cardWrapper);
            }
        }

        studyButton.addEventListener('click', () => {
            alert('La funcionalidad de estudio aleatorio aún no está implementada.');
        });
        
        console.log('[DeckViewPage] Init completado con éxito.');
    }
}

customElements.define('deck-view-page', DeckViewPage);
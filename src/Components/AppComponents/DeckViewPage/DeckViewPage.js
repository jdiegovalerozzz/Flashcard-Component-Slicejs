import StorageService from '../../Service/StorageService/StorageService.js';
import '../../Visual/Flashcard/Flashcard.js';
import '../../Visual/FlashcardModal/FlashcardModal.js';
import CardRenderer from '../../Service/CardRenderer/CardRenderer.js';

export default class DeckViewPage extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        this.props = props || {};
        this.storageService = new StorageService();
    }

    async init() {
        await this.storageService.init();
        // Guardamos la referencia al contenedor de tarjetas UNA VEZ.
        this.cardsGrid = this.querySelector('#cards-grid');
        await this.renderContent();
    }

    async update() {
        console.log('[DeckViewPage] Update llamado. Limpiando componentes hijos...');

        // --- PASO 1: DESTRUIR (Según la documentación) ---
        // Destruimos todos los componentes Slice (Flashcards) dentro del contenedor.
        slice.controller.destroyByContainer(this.cardsGrid);
        // También destruimos el modal si existe, para recrearlo.
        const oldModal = this.querySelector('slice-flashcard-modal');
        if (oldModal) {
            slice.controller.destroyComponent(oldModal);
        }

        // --- PASO 2: LIMPIAR (Ya lo hacías bien) ---
        this.cardsGrid.innerHTML = '';

        // --- PASO 3: RE-RENDERIZAR ---
        const pathParts = window.location.pathname.split('/');
        const newId = pathParts[pathParts.length - 1];

        if (this.props.params) {
            this.props.params.id = newId;
        } else {
            this.props.params = { id: newId };
        }
        
        await this.renderContent();
    }

    async renderContent() {
        const deckId = this.props.params?.id;
        console.log(`[DeckViewPage] Renderizando contenido para el ID de mazo: ${deckId}`);

        const deckNameEl = this.querySelector('#deck-name');
        const backButton = this.querySelector('#back-button');
        const studyButton = this.querySelector('#study-button');

        backButton.onclick = () => slice.router.navigate('/');

        if (!deckId || isNaN(deckId)) {
            deckNameEl.textContent = 'Deck ID inválido en la URL.';
            return;
        }

        const deck = await this.storageService.getDeck(Number(deckId));
        const cards = await this.storageService.getFlashcardsByDeck(Number(deckId));

        if (!deck) {
            deckNameEl.textContent = 'Mazo no encontrado en la base de datos.';
            return;
        }

        deckNameEl.textContent = deck.name;

        if (cards.length === 0) {
            this.cardsGrid.innerHTML = '<p>Este mazo aún no tiene tarjetas.</p>';
        } else {
            const flashcardModal = await slice.build('FlashcardModal', {});
            this.appendChild(flashcardModal);

            for (const card of cards) {
                const cardWrapper = await CardRenderer.createCardWrapper(card, flashcardModal);
                this.cardsGrid.appendChild(cardWrapper);
            }
        }

        studyButton.onclick = () => {
            alert('La funcionalidad de estudio aleatorio aún no está implementada.');
        };
        
        console.log('[DeckViewPage] Renderizado de contenido completado.');
    }
}

customElements.define('deck-view-page', DeckViewPage);
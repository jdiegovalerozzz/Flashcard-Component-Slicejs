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
        this.cardsGrid = this.querySelector('#cards-grid');
        await this.renderContent();
    }

    async update() {
        console.log('[DeckViewPage] Update llamado. Limpiando componentes hijos...');
        slice.controller.destroyByContainer(this.cardsGrid);
        const oldModal = this.querySelector('slice-flashcard-modal');
        if (oldModal) {
            slice.controller.destroyComponent(oldModal);
        }
        this.cardsGrid.innerHTML = '';

        const pathParts = window.location.pathname.split('/');
        const newId = pathParts[pathParts.length - 1];
        this.props.params = { id: newId };
        
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
                const cardWrapper = await CardRenderer.createCardWrapper({
                    card: card,
                    flashcardModal: flashcardModal,
                    onDelete: async (cardId, wrapperElement) => {
                        if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
                            try {
                                // 1. Llama al servicio para borrar de la base de datos.
                                await this.storageService.deleteCard(cardId);
                                // 2. Elimina el elemento de la vista para una respuesta instantánea.
                                wrapperElement.remove();
                                console.log(`[DeckViewPage] Tarjeta ${cardId} eliminada.`);
                            } catch (error) {
                                console.error(`Error al eliminar la tarjeta ${cardId}:`, error);
                                alert('No se pudo eliminar la tarjeta.');
                            }
                        }
                    }
                });
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
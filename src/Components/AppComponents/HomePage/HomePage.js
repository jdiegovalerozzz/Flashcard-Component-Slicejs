import StorageService from '../../Service/StorageService/StorageService.js';
import '../../Visual/Flashcard/Flashcard.js'; 

export default class HomePage extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        slice.controller.setComponentProps(this, props);
        this.storageService = new StorageService();
    }

    async init() {
        await this.storageService.init();

        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'sans-serif';

        // --- Título y Botón de Crear ---
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';

        const title = document.createElement('h1');
        title.textContent = 'My Decks';
        
        const createButton = await slice.build('Button', { value: 'Create New Deck' });
        createButton.addEventListener('click', () => {
            slice.router.navigate('/create-flashcard');
        });

        header.append(title, createButton);
        container.appendChild(header);

        // --- Cargar y Mostrar los Mazos ---
        const decks = await this.storageService.getAllDecks();

        if (decks.length === 0) {
            const noDecksMessage = document.createElement('p');
            noDecksMessage.textContent = 'You have no decks yet. Click "Create New Deck" to get started!';
            noDecksMessage.style.marginTop = '20px';
            container.appendChild(noDecksMessage);
        } else {
            for (const deck of decks) {
                // Contenedor para cada mazo
                const deckContainer = document.createElement('div');
                deckContainer.style.marginTop = '30px';
                deckContainer.style.border = '1px solid #eee';
                deckContainer.style.padding = '15px';
                deckContainer.style.borderRadius = '8px';

                const deckTitle = document.createElement('h2');
                deckTitle.textContent = `${deck.name} (${deck.difficulty})`;
                deckContainer.appendChild(deckTitle);

                // Grid para las tarjetas de este mazo
                const cardGrid = document.createElement('div');
                cardGrid.style.display = 'flex';
                cardGrid.style.flexWrap = 'wrap';
                cardGrid.style.gap = '10px';
                cardGrid.style.marginTop = '15px';

                const cards = await this.storageService.getFlashcardsByDeck(deck.id);
                
                for (const card of cards) {
                    const cardComponent = await slice.build('Flashcard', {
                        'front-text': card.front,
                        'back-text': card.back
                    });
                    cardComponent.style.transform = 'scale(0.5)';
                    cardComponent.style.transformOrigin = 'top left';
                    cardGrid.appendChild(cardComponent);
                }

                deckContainer.appendChild(cardGrid);
                container.appendChild(deckContainer);
            }
        }

        this.appendChild(container);
    }
}

customElements.define('home-page', HomePage);
import '../../Visual/Flashcard/Flashcard.js';

export default class FlashcardCreator extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        slice.controller.setComponentProps(this, props);
        this.deck = []; 
    }

    async init() {
        // --- Contenedor Principal ---
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'sans-serif';

        const title = document.createElement('h1');
        title.textContent = 'Create New Flashcard Deck';
        container.appendChild(title);

        // --- Sección del Formulario ---
        const formSection = document.createElement('div');
        formSection.style.marginBottom = '20px';

        const fromLangInput = await slice.build('Input', { placeholder: 'Source Language' });
        const toLangInput = await slice.build('Input', { placeholder: 'Target Language' });
        
        const frontInput = await slice.build('Input', { placeholder: 'Front text' });
        const backInput = await slice.build('Input', { placeholder: 'Back text' });

        const addButton = await slice.build('Button', { value: 'Add Card' });

        formSection.append(fromLangInput, toLangInput, frontInput, backInput, addButton);
        container.appendChild(formSection);

        // --- Sección de Preview ---
        const previewSection = document.createElement('div');
        const previewTitle = document.createElement('h2');
        previewTitle.textContent = 'Preview';
        const previewCard = await slice.build('Flashcard', { 
            'front-text': 'Front', 
            'back-text': 'Back' 
        });
        
        previewSection.append(previewTitle, previewCard);
        container.appendChild(previewSection);

        // --- Sección del Mazo ---
        const deckSection = document.createElement('div');
        const deckTitle = document.createElement('h2');
        deckTitle.innerHTML = 'Cards in this deck (<span id="card-count">0</span>)';
        const deckList = document.createElement('div');
        deckList.id = 'deck-list';
        deckList.style.display = 'flex';
        deckList.style.flexWrap = 'wrap';
        deckList.style.gap = '10px';
        deckList.style.marginTop = '15px';

        const saveButton = await slice.build('Button', { value: 'Save Deck' });

        deckSection.append(deckTitle, deckList, saveButton);
        container.appendChild(deckSection);

        // --- Lógica de Eventos ---

        const updatePreview = () => {
            previewCard.setAttribute('front-text', frontInput.value || 'Front');
            previewCard.setAttribute('back-text', backInput.value || 'Back');
        };

        frontInput.addEventListener('input', updatePreview);
        backInput.addEventListener('input', updatePreview);

        addButton.addEventListener('click', async () => {
            const frontText = frontInput.value;
            const backText = backInput.value;

            if (!frontText || !backText) {
                alert('Please fill out both sides of the card.');
                return;
            }
            
            this.deck.push({ front: frontText, back: backText });
            
            const newCardInDeck = await slice.build('Flashcard', {
                'front-text': frontText,
                'back-text': backText
            });
            newCardInDeck.style.transform = 'scale(0.5)';
            newCardInDeck.style.transformOrigin = 'top left';
            
            deckList.appendChild(newCardInDeck);

            deckTitle.querySelector('#card-count').textContent = this.deck.length;

            frontInput.value = '';
            backInput.value = '';
            updatePreview();
            frontInput.focus();
        });

        this.appendChild(container);
    }
}

customElements.define("flashcard-creator", FlashcardCreator); 
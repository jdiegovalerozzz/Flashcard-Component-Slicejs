import '../../Visual/Flashcard/Flashcard.js';

// La clase se debe exportar como default para que el import() dinámico del router funcione.
export default class FlashcardCreator extends HTMLElement {
    constructor(props) {
        super();
        // Asumo que 'slice' es una variable global en tu framework
        slice.attachTemplate(this);
        slice.controller.setComponentProps(this, props);
        this.deck = []; // Array para guardar las tarjetas
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

        // --- Sección de Previsualización ---
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
        // Añadimos estilos para que las tarjetas se organicen bien
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

        // --- CAMBIO AQUÍ: Lógica para añadir la tarjeta al mazo ---
        addButton.addEventListener('click', async () => {
            const frontText = frontInput.value;
            const backText = backInput.value;

            if (!frontText || !backText) {
                alert('Please fill out both sides of the card.');
                return;
            }
            
            // 1. Añadimos los datos al array del mazo
            this.deck.push({ front: frontText, back: backText });
            
            // 2. Creamos un nuevo componente Flashcard para mostrarlo en la lista
            const newCardInDeck = await slice.build('Flashcard', {
                'front-text': frontText,
                'back-text': backText
            });
            // Hacemos las tarjetas de la lista más pequeñas
            newCardInDeck.style.transform = 'scale(0.5)';
            newCardInDeck.style.transformOrigin = 'top left';
            
            // 3. Añadimos el nuevo componente a la lista del mazo
            deckList.appendChild(newCardInDeck);

            // 4. Actualizamos el contador
            deckTitle.querySelector('#card-count').textContent = this.deck.length;

            // 5. Limpiamos los inputs y la previsualización
            frontInput.value = '';
            backInput.value = '';
            updatePreview();
            frontInput.focus();
        });

        this.appendChild(container);
    }
}

// La definición del custom element es para usarlo en HTML, pero el router lo instancia por su clase.
// Es buena práctica mantenerlo de todas formas.
customElements.define("flashcard-creator", FlashcardCreator); 
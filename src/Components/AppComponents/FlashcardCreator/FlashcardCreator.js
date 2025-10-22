import '../../Visual/Flashcard/Flashcard.js';
import StorageService from '../../Service/StorageService/StorageService.js';

export default class FlashcardCreator extends HTMLElement {
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

        const title = document.createElement('h1');
        title.textContent = 'Add a New Flashcard';
        container.appendChild(title);

        // --- 1. Sección para Seleccionar o Crear un Mazo ---
        const deckSection = document.createElement('div');
        deckSection.style.marginBottom = '30px';
        
        const existingDecks = await this.storageService.getAllDecks();
        const deckOptions = existingDecks.map(deck => ({ value: deck.id, text: deck.name }));
        
        deckOptions.push({ value: 'CREATE_NEW', text: 'Create a new deck...' });

        // Contenedor para los campos de creación de nuevo mazo (inicialmente oculto)
        const newDeckFields = document.createElement('div');
        newDeckFields.style.display = 'none';
        newDeckFields.style.marginTop = '10px';
        const newDeckNameInput = await slice.build('Input', { placeholder: 'New Deck Name' });
        const newDeckDifficultySelect = await slice.build('Select', {
            label: 'Select Difficulty',
            options: [
                { value: 'Basic', text: 'Basic' },
                { value: 'Intermediate', text: 'Intermediate' },
                { value: 'Advanced', text: 'Advanced' }
            ]
        });
        newDeckFields.append(newDeckNameInput, newDeckDifficultySelect);

        // Creación del selector de mazos con la lógica onOptionSelect
        const deckSelector = await slice.build('Select', {
            label: 'Select a Deck',
            options: deckOptions,
            onOptionSelect: (selectedOption) => {
                if (selectedOption && selectedOption.value === 'CREATE_NEW') {
                    newDeckFields.style.display = 'block';
                } else {
                    newDeckFields.style.display = 'none';
                }
            }
        });
        
        deckSection.appendChild(deckSelector);
        deckSection.appendChild(newDeckFields); // Añadimos los campos ocultos al DOM
        container.appendChild(deckSection);

        // --- 2. Sección del Formulario de la Tarjeta ---
        const cardFormSection = document.createElement('div');
        cardFormSection.style.marginBottom = '20px';
        
        const frontInput = await slice.build('Input', { placeholder: 'Front text (required)' });
        const backInput = await slice.build('Input', { placeholder: 'Back text (required)' });
        const exampleInput = await slice.build('Input', { placeholder: 'Usage example (optional)' });
        const notesInput = await slice.build('Input', { placeholder: 'Personal notes (optional)' });
        cardFormSection.append(frontInput, backInput, exampleInput, notesInput);
        container.appendChild(cardFormSection);

        // --- 3. Botón de Guardado Final ---
        const saveCardButton = await slice.build('Button', { value: 'Save Card' });
        container.appendChild(saveCardButton);

        // --- Lógica de Eventos ---
        saveCardButton.addEventListener('click', async () => {
            let deckId;
            const selectedDeck = deckSelector.value;

            if (!selectedDeck) {
                alert('Please select a deck or create a new one.');
                return;
            }

            if (selectedDeck.value === 'CREATE_NEW') {
                const newDeckName = newDeckNameInput.value;
                const newDeckDifficulty = newDeckDifficultySelect.value ? newDeckDifficultySelect.value.value : null;

                if (!newDeckName || !newDeckDifficulty) {
                    alert('Please provide a name and difficulty for the new deck.');
                    return;
                }

                const newDeck = await this.storageService.saveDeck({
                    name: newDeckName,
                    difficulty: newDeckDifficulty,
                    createdAt: new Date().toISOString()
                });
                deckId = newDeck.id;
            } else {
                deckId = selectedDeck.value;
            }

            if (!frontInput.value || !backInput.value) {
                alert('Front and Back text are required for the card.');
                return;
            }

            try {
                const cardData = {
                    deckId: deckId,
                    front: frontInput.value,
                    back: backInput.value,
                    example: exampleInput.value,
                    notes: notesInput.value,
                };
                await this.storageService.saveFlashcard(cardData);

                alert('Flashcard saved successfully!');
                slice.router.navigate('/');

            } catch (error) {
                console.error('Failed to save flashcard:', error);
                alert('An error occurred while saving the card. See console for details.');
            }
        });

        this.appendChild(container);
    }
}

customElements.define("flashcard-creator", FlashcardCreator);
import '../../Visual/Flashcard/Flashcard.js';
import StorageService from '../../Service/StorageService/StorageService.js';

export default class FlashcardCreator extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        // --- INICIO DEL CAMBIO ---
        // Asignamos las props directamente. Si no llegan, inicializamos un objeto vacío.
        this.props = props || {}; 
        // --- FIN DEL CAMBIO ---
        this.storageService = new StorageService();
        this.editMode = false;
        this.cardToEdit = null;
    }

    async init() {
        await this.storageService.init();

        // Detectar si estamos en modo edición por los parámetros de la ruta
        if (this.props.params && this.props.params.id) {
            this.editMode = true;
            this.cardToEdit = await this.storageService.getCard(Number(this.props.params.id));
            if (!this.cardToEdit) {
                this.innerHTML = '<h1>Error: Card not found</h1>';
                return;
            }
        }

        // Referencias a los elementos del HTML
        const title = this.querySelector('h1');
        const deckSection = this.querySelector('#deck-section');
        const formSection = this.querySelector('#card-form-section');
        const saveButton = this.querySelector('#save-card-button');
        const backButton = this.querySelector('#back-button');

        backButton.onclick = () => window.history.back(); // Botón para volver atrás

        // Cambiar título y texto del botón según el modo
        title.textContent = this.editMode ? 'Edit Flashcard' : 'Add a New Flashcard';
        saveButton.textContent = this.editMode ? 'Update Card' : 'Save Card';

        // Lógica para la sección del mazo
        if (this.editMode) {
            const deck = await this.storageService.getDeck(this.cardToEdit.deckId);
            deckSection.innerHTML = `<p><strong>Deck:</strong> ${deck.name}</p>`;
        } else {
            // La lógica para crear/seleccionar mazo solo se muestra en modo creación
            const existingDecks = await this.storageService.getAllDecks();
            const deckOptions = existingDecks.map(deck => ({ value: deck.id, text: deck.name }));
            deckOptions.push({ value: 'CREATE_NEW', text: 'Create a new deck...' });

            const newDeckFields = this.querySelector('#new-deck-fields');
            this.newDeckNameInput = await slice.build('Input', { placeholder: 'New Deck Name' });
            this.newDeckDifficultySelect = await slice.build('Select', {
                label: 'Select Difficulty',
                options: [ { value: 'Basic', text: 'Basic' }, { value: 'Intermediate', text: 'Intermediate' }, { value: 'Advanced', text: 'Advanced' } ]
            });
            newDeckFields.append(this.newDeckNameInput, this.newDeckDifficultySelect);

            this.deckSelector = await slice.build('Select', {
                label: 'Select a Deck',
                options: deckOptions,
                onOptionSelect: (selectedOption) => {
                    if (selectedOption && selectedOption.value === 'CREATE_NEW') newDeckFields.style.display = 'block';
                    else newDeckFields.style.display = 'none';
                }
            });
            this.querySelector('#deck-selector-container').appendChild(this.deckSelector);
        }

        // Pre-rellenar el formulario en modo edición
        this.frontInput = await slice.build('Input', { placeholder: 'Front text (required)', value: this.cardToEdit?.front || '' });
        this.backInput = await slice.build('Input', { placeholder: 'Back text (required)', value: this.cardToEdit?.back || '' });
        this.exampleInput = await slice.build('Input', { placeholder: 'Usage example (optional)', value: this.cardToEdit?.example || '' });
        this.notesInput = await slice.build('Input', { placeholder: 'Personal notes (optional)', value: this.cardToEdit?.notes || '' });
        
        // Limpiar el contenedor del formulario y añadir los nuevos inputs
        formSection.innerHTML = '';
        formSection.append(this.frontInput, this.backInput, this.exampleInput, this.notesInput);

        // Lógica de guardado
        saveButton.addEventListener('click', () => this.handleSave());
    }

    async handleSave() {
        if (this.editMode) {
            await this.updateExistingCard();
        } else {
            await this.createNewCard();
        }
    }

    async createNewCard() {
        let deckId;
        const selectedDeck = this.deckSelector.value;

        if (!selectedDeck) {
            alert('Please select a deck or create a new one.');
            return;
        }

        if (selectedDeck.value === 'CREATE_NEW') {
            const newDeckName = this.newDeckNameInput.value;
            const newDeckDifficulty = this.newDeckDifficultySelect.value ? this.newDeckDifficultySelect.value.value : null;
            if (!newDeckName || !newDeckDifficulty) {
                alert('Please provide a name and difficulty for the new deck.');
                return;
            }
            const newDeck = await this.storageService.saveDeck({ name: newDeckName, difficulty: newDeckDifficulty, createdAt: new Date().toISOString() });
            deckId = newDeck.id;
        } else {
            deckId = selectedDeck.value;
        }

        if (!this.frontInput.value || !this.backInput.value) {
            alert('Front and Back text are required for the card.');
            return;
        }

        try {
            await this.storageService.saveFlashcard({
                deckId: deckId,
                front: this.frontInput.value,
                back: this.backInput.value,
                example: this.exampleInput.value,
                notes: this.notesInput.value,
            });
            alert('Flashcard saved successfully!');
            slice.router.navigate('/');
        } catch (error) {
            console.error('Failed to save flashcard:', error);
            alert('An error occurred while saving the card.');
        }
    }

    async updateExistingCard() {
        if (!this.frontInput.value || !this.backInput.value) {
            alert('Front and Back text are required for the card.');
            return;
        }

        try {
            const updatedCardData = {
                ...this.cardToEdit,
                front: this.frontInput.value,
                back: this.backInput.value,
                example: this.exampleInput.value,
                notes: this.notesInput.value,
            };
            await this.storageService.updateCard(updatedCardData);
            alert('Flashcard updated successfully!');
            slice.router.navigate(`/deck/${this.cardToEdit.deckId}`);
        } catch (error) {
            console.error('Failed to update flashcard:', error);
            alert('An error occurred while updating the card.');
        }
    }
}

customElements.define("flashcard-creator", FlashcardCreator);
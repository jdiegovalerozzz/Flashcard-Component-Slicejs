import StorageService from '../../Service/StorageService/StorageService.js';

export default class DeckEditor extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        this.props = props || {};
        this.storageService = new StorageService();
        this.deckToEdit = null;
    }

    async init() {
        await this.storageService.init();

        const deckId = Number(this.props.params?.id);
        if (!deckId) {
            this.innerHTML = '<h1>Error: Deck ID is missing.</h1>';
            return;
        }

        this.deckToEdit = await this.storageService.getDeck(deckId);
        if (!this.deckToEdit) {
            this.innerHTML = '<h1>Error: Deck not found.</h1>';
            return;
        }

        const mainContainer = this.querySelector('#editor-main');
        const backButton = this.querySelector('#back-button');
        backButton.onclick = () => window.history.back();

        this.deckNameInput = await slice.build('Input', {
            placeholder: 'Deck Name',
            value: this.deckToEdit.name
        });

        const difficultyOptions = [
            { value: 'Basic', text: 'Basic' },
            { value: 'Intermediate', text: 'Intermediate' },
            { value: 'Advanced', text: 'Advanced' }
        ];

        this.deckDifficultySelect = await slice.build('Select', {
            label: 'Select Difficulty',
            options: difficultyOptions
        });

        const selectedDifficulty = difficultyOptions.find(opt => opt.value === this.deckToEdit.difficulty);
        if (selectedDifficulty) {
            this.deckDifficultySelect.value = selectedDifficulty;
        }

        const saveButton = await slice.build('Button', {
            value: 'Update Deck',
            customColor: { button: '#38a169', label: '#ffffff' },
            onClickCallback: async () => await this.handleUpdate()
        });

        mainContainer.append(this.deckNameInput, this.deckDifficultySelect, saveButton);
    }

    async handleUpdate() {
        const newName = this.deckNameInput.value;
        const newDifficulty = this.deckDifficultySelect.value ? this.deckDifficultySelect.value.value : null;

        if (!newName) {
            alert('Deck name cannot be empty.');
            return;
        }

        if (!newDifficulty) {
            alert('Please select a difficulty.');
            return;
        }

        const updatedDeck = {
            ...this.deckToEdit,
            name: newName,
            difficulty: newDifficulty
        };

        try {
            await this.storageService.updateDeck(updatedDeck);
            alert('Deck updated successfully!');
            slice.router.navigate('/');
        } catch (error) {
            console.error('Failed to update deck:', error);
            alert('An error occurred while updating the deck.');
        }
    }
}

customElements.define('deck-editor', DeckEditor);
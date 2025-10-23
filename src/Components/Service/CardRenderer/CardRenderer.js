import '../../Visual/Flashcard/Flashcard.js';

export default class CardRenderer {
    /**
     * Crea un contenedor para una flashcard con sus botones de acción.
     * Es un método estático porque no necesita estado; solo toma datos y devuelve HTML.
     * @param {object} card - El objeto de datos de la tarjeta.
     * @param {HTMLElement} flashcardModal - La instancia del modal para abrir al hacer clic.
     * @returns {Promise<HTMLElement>} - El elemento wrapper de la tarjeta.
     */
    static async createCardWrapper(card, flashcardModal) {
        const wrapper = document.createElement('div');
        wrapper.className = 'flashcard-wrapper';

        const cardComponent = await slice.build('Flashcard', {
            'front-text': card.front,
            'back-text': card.back,
            'flippable': false
        });
        cardComponent.style.transform = 'scale(1)';

        cardComponent.addEventListener('click', () => {
            if (flashcardModal && typeof flashcardModal.show === 'function') {
                flashcardModal.show(card);
            }
        });

        const actions = document.createElement('div');
        actions.className = 'flashcard-actions';
        actions.innerHTML = `
            <button title="Edit">✏️</button>
            <button title="Delete">🗑️</button>
        `;
        // TODO: Añadir event listeners para los botones de editar y eliminar tarjeta

        wrapper.append(cardComponent, actions);
        return wrapper;
    }
}
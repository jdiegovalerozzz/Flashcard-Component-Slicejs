import '../../Visual/Flashcard/Flashcard.js';

export default class CardRenderer {
    /**
     * Crea un contenedor para una flashcard con sus botones de acción.
     * @param {object} options - Opciones de renderizado.
     * @param {object} options.card - El objeto de datos de la tarjeta.
     * @param {HTMLElement} options.flashcardModal - La instancia del modal.
     * @param {function} [options.onDelete] - Callback que se ejecuta al hacer clic en eliminar. Recibe (cardId, wrapperElement).
     * @returns {Promise<HTMLElement>} - El elemento wrapper de la tarjeta.
     */
    static async createCardWrapper({ card, flashcardModal, onDelete }) {
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
        
        const deleteButton = actions.querySelector('button[title="Delete"]');
        
        if (onDelete && typeof onDelete === 'function') {
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                onDelete(card.id, wrapper);
            });
        } else {
            deleteButton.style.display = 'none';
        }

        wrapper.append(cardComponent, actions);
        return wrapper;
    }
}
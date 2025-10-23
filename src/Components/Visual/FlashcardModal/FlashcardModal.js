import '../Flashcard/Flashcard.js';

export default class FlashcardModal extends HTMLElement {

  static props = {}

  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
  }

  init() {
    // Guardamos referencias a los elementos que vamos a manipular
    this.closeButton = this.querySelector('.close-button');
    this.overlay = this.querySelector('.modal-overlay');
    this.cardDisplayArea = this.querySelector('.card-display-area');
    this.usageExampleEl = this.querySelector('.usage-example');
    this.personalNotesEl = this.querySelector('.personal-notes');

    // Eventos para cerrar el modal
    this.closeButton.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', (e) => {
        // Cierra solo si se hace clic en el fondo, no en el contenido
        if (e.target === this.overlay) {
            this.hide();
        }
    });
  }

  // Método público para mostrar el modal con los datos de una tarjeta
  async show(cardData) {
    // Limpiar el área por si había una tarjeta anterior
    this.cardDisplayArea.innerHTML = '';
    // Asegurarnos de que los detalles están ocultos al abrir
    this.classList.remove('is-revealed');

    // Crear la flashcard grande para el modal, asegurándonos de que SÍ pueda girar
    const mainCard = await slice.build('Flashcard', {
        'front-text': cardData.front,
        'back-text': cardData.back,
        'flippable': true // Le decimos a esta tarjeta que sí puede girar
    });

    // Añadimos un listener para saber CUANDO gira la tarjeta
    mainCard.addEventListener('click', () => {
        // Una vez que se hace clic, mostramos el resto de la información
        this.classList.add('is-revealed');
    }, { once: true }); // { once: true } hace que este evento solo se dispare la primera vez

    this.cardDisplayArea.appendChild(mainCard);

    // Rellenar los detalles adicionales (example y notes)
    this.usageExampleEl.textContent = cardData.example || 'No example provided.';
    this.personalNotesEl.textContent = cardData.notes || 'No notes provided.';

    // Hacer visible el modal añadiendo la clase CSS
    this.classList.add('is-visible');
  }

  // Método público para ocultar el modal
  hide() {
    this.classList.remove('is-visible');
    // Limpiamos también la clase 'is-revealed' para la próxima vez
    this.classList.remove('is-revealed');
    this.cardDisplayArea.innerHTML = '';
  }
}

customElements.define("slice-flashcardmodal", FlashcardModal);
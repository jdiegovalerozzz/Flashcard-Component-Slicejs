import '../Flashcard/Flashcard.js';

export default class FlashcardModal extends HTMLElement {
  static props = {};

  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
  }

  init() {
    this.closeButton = this.querySelector('.close-button');
    this.overlay = this.querySelector('.modal-overlay');
    this.cardDisplayArea = this.querySelector('.card-display-area');
    this.usageExampleEl = this.querySelector('.usage-example');
    this.personalNotesEl = this.querySelector('.personal-notes');

    this.closeButton.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
  }

  async show(cardData) {
    this.cardDisplayArea.innerHTML = '';
    this.classList.remove('is-revealed');

    const mainCard = await slice.build('Flashcard', {
      'front-text': cardData.front,
      'back-text': cardData.back,
      'flippable': false
    });

    this.cardDisplayArea.appendChild(mainCard);
    const modal = this;

    //  first click => flip + reveal; next clicks => alternate (front/back)
    mainCard.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!mainCard.classList.contains('is-flipped')) {
        mainCard.classList.add('is-flipped');
        if (!modal.classList.contains('is-revealed')) {
          modal.classList.add('is-revealed');
        }
      } else {
        mainCard.classList.toggle('is-flipped');
      }
    });

    this.usageExampleEl.textContent = cardData.example || 'No example provided.';
    this.personalNotesEl.textContent = cardData.notes || 'No notes provided.';

    // Show modal
    this.classList.add('is-visible');
  }

  hide() {
    this.classList.remove('is-visible', 'is-revealed');
    this.cardDisplayArea.innerHTML = '';
  }
}

customElements.define("slice-flashcardmodal", FlashcardModal);
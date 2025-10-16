export default class Flashcard extends HTMLElement {

  static props = {
    "front-text": { type: 'string', default: 'Anverso' },
    "back-text": { type: 'string', default: 'Reverso' }
  }

  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
  }

  // Se ejecuta cuando el elemento se añade al DOM. Es el lugar seguro para manipular el DOM.
  connectedCallback() {
    // Solo hacemos esto una vez para evitar duplicar elementos o listeners
    if (!this.isInitialized) {
      this.$front = this.querySelector('.flashcard-front');
      this.$back = this.querySelector('.flashcard-back');
      this.addEventListener('click', this.flipCard);
      this.isInitialized = true;
      
      // Actualizamos el texto por si las propiedades se establecieron antes de que esto se ejecutara
      this.updateInitialText();
    }
  }

  updateInitialText() {
    if (this.$front) this.$front.textContent = this['front-text'];
    if (this.$back) this.$back.textContent = this['back-text'];
  }

  flipCard() {
    this.classList.toggle('is-flipped');
  }

  get ['front-text']() { return this._frontText; }
  set ['front-text'](value) {
    this._frontText = value;
    if (this.$front) { // Si el elemento ya ha sido encontrado, actualiza el texto
        this.$front.textContent = value;
    }
  }

  get ['back-text']() { return this._backText; }
  set ['back-text'](value) {
    this._backText = value;
    if (this.$back) { // Si el elemento ya ha sido encontrado, actualiza el texto
        this.$back.textContent = value;
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.flipCard);
  }
}

customElements.define("slice-flashcard", Flashcard);
export default class Flashcard extends HTMLElement {

  static props = {
    "front-text": { type: 'string', default: 'Front' },
    "back-text": { type: 'string', default: 'Back' },
    "flippable": { type: 'boolean', default: true }
  }

  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
  }

  connectedCallback() {
    if (!this.isInitialized) {
      this.$front = this.querySelector('.flashcard-front');
      this.$back = this.querySelector('.flashcard-back');
      
      // 2. AÑADIMOS EL EVENTO SOLO SI ES 'flippable'
      if (this.flippable) {
        this.addEventListener('click', this.flipCard);
      }

      this.isInitialized = true;
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
    if (this.$front) { 
        this.$front.textContent = value;
    }
  }

  get ['back-text']() { return this._backText; }
  set ['back-text'](value) {
    this._backText = value;
    if (this.$back) { 
        this.$back.textContent = value;
    }
  }

  get flippable() { return this._flippable; }
  set flippable(value) {
    this._flippable = value;
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.flipCard);
  }
}

customElements.define("slice-flashcard", Flashcard);
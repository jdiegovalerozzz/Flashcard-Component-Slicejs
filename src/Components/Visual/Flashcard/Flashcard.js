export default class Flashcard extends HTMLElement {
  static props = {
    "front-text": { type: 'string', default: 'Front' },
    "back-text": { type: 'string', default: 'Back' },
    "flippable": { type: 'boolean', default: true }
  };

  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
    this._isInitialized = false;
    this.flipCard = this.flipCard.bind(this);
  }

  connectedCallback() {
    if (!this._isInitialized) {
      this.$front = this.querySelector('.flashcard-front');
      this.$back = this.querySelector('.flashcard-back');

      if (this.flippable) {
        this.addEventListener('click', this.flipCard);
      }

      this._isInitialized = true;
    }
    this._render();
  }

  _render() {
    if (!this._isInitialized) return;

    if (this.$front) {
      this.$front.textContent = this['front-text'] || '';
    }

    if (this.$back) {
      this.$back.textContent = this['back-text'] || '';
    }
  }

  flipCard() {
    this.classList.toggle('is-flipped');
  }

  get 'front-text'() {
    return this._frontText;
  }

  set 'front-text'(value) {
    this._frontText = value;
    this._render();
  }

  get 'back-text'() {
    return this._backText;
  }

  set 'back-text'(value) {
    this._backText = value;
    this._render();
  }

  get flippable() {
    return this._flippable;
  }

  set flippable(value) {
    this._flippable = value;
  }

  disconnectedCallback() {
    if (this.flippable) {
      this.removeEventListener('click', this.flipCard);
    }
  }
}

customElements.define("slice-flashcard", Flashcard);

import StorageService from "../../Service/StorageService/StorageService.js";
import "../../Visual/Flashcard/Flashcard.js";
import "../../Visual/FlashcardModal/FlashcardModal.js";
import CardRenderer from "../../Service/CardRenderer/CardRenderer.js";

export default class DeckViewPage extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.props = props || {};
    this.storageService = new StorageService();
    this.deckId = null;
  }

  async init() {
    await this.storageService.init();
    this.cardsGrid = this.querySelector("#cards-grid");
    this.modalContainer = this.querySelector("#modal-container");
    this.flashcardModal = await slice.build("FlashcardModal", {});
    this.modalContainer.appendChild(this.flashcardModal);
    await this.renderContent();
  }

  async update() {
    console.log("[DeckViewPage] Update llamado. Refrescando contenido...");
    // --- Limpieza recomendada antes de refrescar ---
    if (this.cardsGrid) {
      slice.controller.destroyByContainer(this.cardsGrid);
      this.cardsGrid.innerHTML = "";
    }
    await this.renderContent();
  }
  async renderContent() {
    this.cardsGrid.innerHTML = "";
    this.deckId = Number(this.props.params?.id);
    console.log(
      `[DeckViewPage] Renderizando contenido para el ID de mazo: ${this.deckId}`
    );

    const deckNameEl = this.querySelector("#deck-name");
    const backButton = this.querySelector("#back-button");
    const studyButton = this.querySelector("#study-button");
    const customStudyButton = this.querySelector("#custom-study-button");

    backButton.onclick = () => slice.router.navigate("/");

    if (!this.deckId || isNaN(this.deckId)) {
      deckNameEl.textContent = "Deck ID inválido en la URL.";
      studyButton.style.display = "none";
      customStudyButton.style.display = "none";
      return;
    }

    const deck = await this.storageService.getDeck(this.deckId);
    const cards = await this.storageService.getFlashcardsByDeck(this.deckId);

    if (!deck) {
      deckNameEl.textContent = "Mazo no encontrado.";
      studyButton.style.display = "none";
      customStudyButton.style.display = "none";
      return;
    }

    deckNameEl.textContent = deck.name;
    studyButton.style.display = "block";
    customStudyButton.style.display = "block";

    if (cards.length === 0) {
      this.cardsGrid.innerHTML = "<p>Este mazo aún no tiene tarjetas.</p>";
      studyButton.disabled = true;
      customStudyButton.disabled = true;
      studyButton.title = "Add cards to this deck to start studying.";
      customStudyButton.title = "Add cards to this deck to start studying.";
    } else {
      studyButton.disabled = false;
      customStudyButton.disabled = false;
      studyButton.title = "Review cards that are due for today.";
      customStudyButton.title =
        "Study all cards in this deck, ignoring the schedule.";

      for (const card of cards) {
        const cardWrapper = await CardRenderer.createCardWrapper({
          card: card,
          flashcardModal: this.flashcardModal,
          onDelete: async (cardId, wrapperElement) => {
            if (
              confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")
            ) {
              await this.storageService.deleteCard(cardId);
              wrapperElement.remove();
            }
          },
        });
        this.cardsGrid.appendChild(cardWrapper);
      }
    }

    studyButton.onclick = () => {
      sessionStorage.removeItem("studyMode");
      slice.router.navigate(`/practice/${this.deckId}`);
    };

    customStudyButton.onclick = () => {
      sessionStorage.setItem("studyMode", "cram");
      slice.router.navigate(`/practice/${this.deckId}`);
    };

    console.log("[DeckViewPage] Renderizado de contenido completado.");
  }
}

customElements.define("deck-view-page", DeckViewPage);

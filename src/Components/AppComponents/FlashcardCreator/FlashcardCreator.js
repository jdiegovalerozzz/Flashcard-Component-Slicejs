import "../../Visual/Flashcard/Flashcard.js";
import StorageService from "../../Service/StorageService/StorageService.js";

export default class FlashcardCreator extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.props = props || {};
    this.storageService = new StorageService();
    this.editMode = false;
    this.cardToEdit = null;
    this.selectedAudioFile = null;
  }

  async init() {
    await this.storageService.init();

    if (this.props.params && this.props.params.id) {
      this.editMode = true;
      this.cardToEdit = await this.storageService.getCard(
        Number(this.props.params.id)
      );
      if (!this.cardToEdit) {
        this.innerHTML = "<h1>Error: Card not found</h1>";
        return;
      }
    }

    const title = this.querySelector("h1");
    const deckSection = this.querySelector("#deck-section");
    const formSection = this.querySelector("#card-form-section");
    const saveButton = this.querySelector("#save-card-button");
    const backButton = this.querySelector("#back-button");
    const audioFileInput = this.querySelector("#audio-file-input");
    const audioFileNameDisplay = this.querySelector("#audio-file-name");

    backButton.onclick = () => window.history.back();

    title.textContent = this.editMode
      ? "Edit Flashcard"
      : "Add a New Flashcard";
    saveButton.textContent = this.editMode ? "Update Card" : "Save Card";

    if (this.editMode) {
      const deck = await this.storageService.getDeck(this.cardToEdit.deckId);
      deckSection.innerHTML = `<p><strong>Deck:</strong> ${deck.name}</p>`;
      if (this.cardToEdit.audioBlob) {
        audioFileNameDisplay.textContent = `Current audio: ${
          this.cardToEdit.audioBlob.name || "recorded_audio.webm"
        }`;
      }
    } else {
      const settings = await this.storageService.getSettings();
      const targetLangCode = settings ? settings.targetLanguage : null;
      const allDecks = await this.storageService.getAllDecks();
      const filteredDecks = targetLangCode
        ? allDecks.filter(
            (deck) => deck.languageCode === targetLangCode || !deck.languageCode
          )
        : allDecks;
      const deckOptions = filteredDecks.map((deck) => ({
        value: deck.id,
        text: deck.name,
      }));
      deckOptions.push({ value: "CREATE_NEW", text: "Create a new deck..." });
      const newDeckFields = this.querySelector("#new-deck-fields");
      this.newDeckNameInput = await slice.build("Input", {
        placeholder: "New Deck Name",
      });
      this.newDeckDifficultySelect = await slice.build("Select", {
        label: "Select Difficulty",
        options: [
          { value: "Basic", text: "Basic" },
          { value: "Intermediate", text: "Intermediate" },
          { value: "Advanced", text: "Advanced" },
        ],
      });
      newDeckFields.append(this.newDeckNameInput, this.newDeckDifficultySelect);
      this.deckSelector = await slice.build("Select", {
        label: `Select a Deck (for ${targetLangCode || "any language"})`,
        options: deckOptions,
        onOptionSelect: (selectedOption) => {
          newDeckFields.style.display =
            selectedOption?.value === "CREATE_NEW" ? "block" : "none";
        },
      });
      this.querySelector("#deck-selector-container").appendChild(
        this.deckSelector
      );
    }

    this.frontInput = await slice.build("Input", {
      placeholder: "Front text (required)",
      value: this.cardToEdit?.front || "",
    });
    this.backInput = await slice.build("Input", {
      placeholder: "Back text (required)",
      value: this.cardToEdit?.back || "",
    });
    this.exampleInput = await slice.build("Input", {
      placeholder: "Usage example (optional)",
      value: this.cardToEdit?.example || "",
    });
    this.notesInput = await slice.build("Input", {
      placeholder: "Personal notes (optional)",
      value: this.cardToEdit?.notes || "",
    });

    formSection.innerHTML = "<h2>Card Content</h2>";
    formSection.append(
      this.frontInput,
      this.backInput,
      this.exampleInput,
      this.notesInput
    );

    audioFileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        this.selectedAudioFile = file;
        audioFileNameDisplay.textContent = file.name;
      } else {
        this.selectedAudioFile = null;
        audioFileNameDisplay.textContent = "No file chosen";
      }
    });

    saveButton.addEventListener("click", () => this.handleSave());
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
      alert("Please select a deck or create a new one.");
      return;
    }

    if (selectedDeck.value === "CREATE_NEW") {
      const newDeckName = this.newDeckNameInput.value;
      const newDeckDifficulty = this.newDeckDifficultySelect.value?.value;
      if (!newDeckName || !newDeckDifficulty) {
        alert("Please provide a name and difficulty for the new deck.");
        return;
      }
      const settings = await this.storageService.getSettings();
      const targetLangCode = settings ? settings.targetLanguage : null;
      if (!targetLangCode) {
        alert(
          "Please set a target language in Settings before creating a new deck."
        );
        return;
      }
      const newDeckData = {
        name: newDeckName,
        difficulty: newDeckDifficulty,
        createdAt: new Date().toISOString(),
        languageCode: targetLangCode,
      };
      const newDeck = await this.storageService.saveDeck(newDeckData);
      deckId = newDeck.id;

      // Recarga la lista de mazos y selecciona el nuevo mazo
      const allDecks = await this.storageService.getAllDecks();
      const filteredDecks = targetLangCode
        ? allDecks.filter(
            (deck) => deck.languageCode === targetLangCode || !deck.languageCode
          )
        : allDecks;
      const deckOptions = filteredDecks.map((deck) => ({
        value: deck.id,
        text: deck.name,
      }));
      deckOptions.push({ value: "CREATE_NEW", text: "Create a new deck..." });

      // --- CAMBIO CLAVE: actualiza opciones y selecciona el nuevo mazo ---
      this.deckSelector.options = deckOptions;
      this.deckSelector.value = [ { value: deckId, text: newDeckName } ];
    } else {
      deckId = selectedDeck.value;
    }

    if (!this.frontInput.value || !this.backInput.value) {
      alert("Front and Back text are required for the card.");
      return;
    }

    try {
      const cardData = {
        deckId: deckId,
        front: this.frontInput.value,
        back: this.backInput.value,
        example: this.exampleInput.value,
        notes: this.notesInput.value,
      };
      if (this.selectedAudioFile) {
        cardData.audioBlob = this.selectedAudioFile;
      }
      await this.storageService.saveFlashcard(cardData);
      alert("Flashcard saved successfully!");

      // --- Redirección robusta ---
      if (slice.router && typeof slice.router.navigate === "function") {
        slice.router.navigate("/");
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Failed to save flashcard:", error);
      alert("An error occurred while saving the card.");
    }
  }

  async updateExistingCard() {
    if (!this.frontInput.value || !this.backInput.value) {
      alert("Front and Back text are required for the card.");
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
      if (this.selectedAudioFile) {
        updatedCardData.audioBlob = this.selectedAudioFile;
      }
      await this.storageService.updateCard(updatedCardData);
      alert("Flashcard updated successfully!");
      slice.router.navigate(`/deck/${this.cardToEdit.deckId}`);
    } catch (error) {
      console.error("Failed to update flashcard:", error);
      alert("An error occurred while updating the card.");
    }
  }
}

customElements.define("flashcard-creator", FlashcardCreator);
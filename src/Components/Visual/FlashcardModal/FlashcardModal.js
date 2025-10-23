import '../Flashcard/Flashcard.js';
import AudioRecorderService from '../../Service/AudioRecorderService/AudioRecorderService.js';
import StorageService from '../../Service/StorageService/StorageService.js';

export default class FlashcardModal extends HTMLElement {
  static props = {};

  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);

    // Services
    this.audioRecorder = new AudioRecorderService();
    this.storageService = new StorageService();

    this.currentCard = null;
    this.currentAudioUrl = null;
  }

  async init() {
    await this.storageService.init();

    this.closeButton = this.querySelector('.close-button');
    this.overlay = this.querySelector('.modal-overlay');
    this.cardDisplayArea = this.querySelector('.card-display-area');
    this.usageExampleEl = this.querySelector('.usage-example');
    this.personalNotesEl = this.querySelector('.personal-notes');
    this.audioControlButton = this.querySelector('#audio-control-btn');
    this.audioPlayerContainer = this.querySelector('#audio-player-container');
    this.deleteAudioButton = this.querySelector('#delete-audio-btn');

    // Events
    this.closeButton.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
    this.audioControlButton.addEventListener('click', () => this.handleAudioControlClick());

    this.deleteAudioButton.addEventListener('click', () => this.handleDeleteAudioClick());

  }

  async show(cardData) {
    this.currentCard = cardData;
    this.cardDisplayArea.innerHTML = '';
    this.classList.remove('is-revealed');
    this.audioPlayerContainer.innerHTML = '';

    const mainCard = await slice.build('Flashcard', {
      'front-text': cardData.front,
      'back-text': cardData.back,
      'flippable': true
    });
    mainCard.addEventListener('click', () => this.classList.add('is-revealed'), { once: true });
    this.cardDisplayArea.appendChild(mainCard);

    this.usageExampleEl.textContent = cardData.example || 'No example provided.';
    this.personalNotesEl.textContent = cardData.notes || 'No notes provided.';

    this.updateAudioState();

    this.classList.add('is-visible');
  }

  hide() {
    this.classList.remove('is-visible', 'is-revealed');
    this.cardDisplayArea.innerHTML = '';
    this.currentCard = null;

    // Memory cleaning for the audio URL
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
  }

  updateAudioState() {
    const audioBlob = this.currentCard.audioBlob;

    if (audioBlob && audioBlob instanceof Blob) {
      //  There's a saved audio
      this.audioControlButton.textContent = 'Play Audio';
      this.audioControlButton.disabled = false;
      this.deleteAudioButton.style.display = 'inline-block';


      // Create url to reproductor
      if (this.currentAudioUrl) URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = URL.createObjectURL(audioBlob);

    } else {
      // No audio
      this.audioControlButton.textContent = 'Record Audio';
      this.audioControlButton.disabled = false;
      this.deleteAudioButton.style.display = 'none';
    }
  }

  async handleAudioControlClick() {
    const state = this.audioRecorder.getState();

    if (state === 'recording') {
      this.audioControlButton.textContent = 'Saving...';
      this.audioControlButton.disabled = true;
      const newAudioBlob = await this.audioRecorder.stopRecording();

      if (newAudioBlob) {
        this.currentCard.audioBlob = newAudioBlob;
        await this.storageService.updateCard(this.currentCard);

        // Actualizar la UI
        this.updateAudioState();
        this.createAudioPreview(newAudioBlob);
      } else {
        // Hubo un error, revertir UI
        this.updateAudioState();
      }

    } else if (this.currentCard.audioBlob) {
      const audio = new Audio(this.currentAudioUrl);
      audio.play();

    } else {
      // Start recording
      const success = await this.audioRecorder.startRecording();
      if (success) {
        this.audioControlButton.textContent = 'Stop Recording';
        this.audioPlayerContainer.innerHTML = ''; // Cleaning
      }
    }
  }

  async handleDeleteAudioClick() {
    if (!this.currentCard || !this.currentCard.audioBlob) return;

    if (confirm('Are you sure you want to delete this audio recording? This action cannot be undone.')) {
      // Update flashCard state
      this.currentCard.audioBlob = null;

      try {
        await this.storageService.updateCard(this.currentCard);
        console.log('Audio deleted successfully from the database.');

        // Update UI
        this.audioPlayerContainer.innerHTML = '';
        if (this.currentAudioUrl) {
          URL.revokeObjectURL(this.currentAudioUrl);
          this.currentAudioUrl = null;
        }
        this.updateAudioState();

      } catch (error) {
        console.error('Failed to delete audio:', error);
        alert('Could not delete the audio. Please try again.');
      }
    }
  }

  createAudioPreview(blob) {
    const url = URL.createObjectURL(blob);
    const audioPlayer = document.createElement('audio');
    audioPlayer.controls = true;
    audioPlayer.src = url;

    this.audioPlayerContainer.innerHTML = ''; // Cleaning
    this.audioPlayerContainer.appendChild(audioPlayer);

    if (this.currentAudioUrl) URL.revokeObjectURL(this.currentAudioUrl);
    this.currentAudioUrl = url;
  }
}

customElements.define("slice-flashcardmodal", FlashcardModal);
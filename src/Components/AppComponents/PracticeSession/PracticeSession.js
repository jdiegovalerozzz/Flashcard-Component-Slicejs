import StorageService from '../../Service/StorageService/StorageService.js';
import SRSService from '../../Service/SRSService/SRSService.js';
import '../../Visual/Flashcard/Flashcard.js';

export default class PracticeSession extends HTMLElement {
    constructor(props) {
        super();
        slice.attachTemplate(this);
        this.props = props || {};
        this.storageService = new StorageService();
        this.reviewQueue = [];
        this.totalInSession = 0;
        this.currentCardComponent = null;
        this.isCramMode = false; 
        this.deckId = null;
    }

    async init(options = {}) {
        await this.storageService.init();
        this.deckId = Number(this.props.params?.deckId);
        
        // Si el botón "Practice Again" nos fuerza al modo cram, lo usamos.
        // Si no, leemos de sessionStorage 
        const studyMode = options.forceCramMode ? 'cram' : sessionStorage.getItem('studyMode');
        this.isCramMode = studyMode === 'cram';

        // Solo borramos el sessionStorage si venimos de una navegación normal, no de "Practice Again"
        if (this.isCramMode && !options.forceCramMode) {
            sessionStorage.removeItem('studyMode');
        }

        if (this.isCramMode) {
            console.log("Starting a 'Cram' session. Loading all cards.");
            this.reviewQueue = await this.storageService.getFlashcardsByDeck(this.deckId);
        } else {
            console.log("Starting an SRS review session. Loading due cards only.");
            this.reviewQueue = await this.storageService.getDueCards(this.deckId);
        }

        this.reviewQueue.sort(() => Math.random() - 0.5);
        this.totalInSession = this.reviewQueue.length;

        if (this.reviewQueue.length === 0) {
            const message = this.isCramMode 
                ? "This deck has no cards to study."
                : "No cards due for review in this deck today. Well done!";
            this.innerHTML = `
                <div class="session-summary">
                    <h1>${message}</h1>
                    <button id="back-button" class="button-primary">Back to Deck</button>
                </div>`;
            this.querySelector('#back-button').onclick = () => slice.router.navigate(`/deck/${this.deckId}`);
            return;
        }

        // Re-adjuntamos el template original por si venimos de un "Practice Again"
        slice.attachTemplate(this);
        this.cardContainer = this.querySelector('#card-container');
        this.progressIndicator = this.querySelector('#progress-indicator');
        this.showAnswerButton = this.querySelector('#show-answer-button');
        this.ratingButtons = this.querySelector('#rating-buttons');
        this.querySelector('#back-button').onclick = () => slice.router.navigate(`/deck/${this.deckId}`);

        this.showAnswerButton.addEventListener('click', () => this.flipCard());
        this.querySelector('#again-button').addEventListener('click', () => this.handleReview(0));
        this.querySelector('#hard-button').addEventListener('click', () => this.handleReview(3));
        this.querySelector('#good-button').addEventListener('click', () => this.handleReview(5));

        this.showNextCardInQueue();
    }

    async showNextCardInQueue() {
        if (this.reviewQueue.length === 0) {
            this.endSession();
            return;
        }

        this.cardContainer.innerHTML = '';
        this.progressIndicator.textContent = `Cards Remaining: ${this.reviewQueue.length}`;

        const cardData = this.reviewQueue[0];

        this.currentCardComponent = await slice.build('Flashcard', {
            'front-text': cardData.front,
            'back-text': cardData.back,
            'flippable': true
        });
        this.cardContainer.appendChild(this.currentCardComponent);

        this.showAnswerButton.style.display = 'block';
        this.ratingButtons.style.display = 'none';
    }

    flipCard() {
        if (this.currentCardComponent) {
            this.currentCardComponent.flipCard();
        }
        this.showAnswerButton.style.display = 'none';
        this.ratingButtons.style.display = 'block';
    }

    async handleReview(quality) {
        const currentCard = this.reviewQueue.shift();
        
        if (!this.isCramMode) {
            const updatedCard = SRSService.calculateNextReview(currentCard, quality);
            await this.storageService.updateCard(updatedCard);
        }

        if (quality < 3) {
            this.reviewQueue.push(currentCard);
            console.log(`Card failed. Re-scheduling for later in this session.`);
        }

        this.showNextCardInQueue();
    }

    endSession() {
        if (this.isCramMode) {
            this.innerHTML = `
                <div class="session-summary">
                    <h1>Practice Complete!</h1>
                    <p>You have reviewed all ${this.totalInSession} cards in this deck.</p>
                    <button id="back-to-deck-button" class="button-primary">Back to Deck</button>
                    <button id="practice-again-button" class="button-secondary">Practice Again</button>
                </div>
            `;
            this.querySelector('#back-to-deck-button').onclick = () => slice.router.navigate(`/deck/${this.deckId}`);
            
            this.querySelector('#practice-again-button').onclick = () => {
                this.init({ forceCramMode: true });
            };
        } else {
            this.innerHTML = `
                <div class="session-summary">
                    <h1>Review Complete!</h1>
                    <p>You have reviewed all ${this.totalInSession} due cards.</p>
                    <button id="back-to-deck-button" class="button-primary">Back to Deck</button>
                </div>
            `;
            this.querySelector('#back-to-deck-button').onclick = () => slice.router.navigate(`/deck/${this.deckId}`);
        }
    }
}

customElements.define('practice-session', PracticeSession);
import StorageService from '../../Service/StorageService/StorageService.js';

export default class SettingsPage extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.storageService = new StorageService();
  }

  async init() {
    await this.storageService.init();

    this.nativeLangContainer = this.querySelector('#native-lang-select-container');
    this.targetLangContainer = this.querySelector('#target-lang-select-container');
    this.saveButton = this.querySelector('#save-settings-button');
    this.backButton = this.querySelector('#back-button');
    this.addLangButton = this.querySelector('#add-language-button');
    this.newLangNameInput = this.querySelector('#new-lang-name-input');
    this.newLangCodeInput = this.querySelector('#new-lang-code-input');
    this.langList = this.querySelector('#language-list');

    // Events
    this.backButton.onclick = () => slice.router.navigate('/');
    this.addLangButton.addEventListener('click', () => this.handleAddLanguage());
    this.saveButton.addEventListener('click', () => this.handleSaveSettings());

    await this.populatePage();
  }

  async populatePage() {
    const allLangs = await this.storageService.getAllLanguages();
    this.renderLanguageList(allLangs);
    await this.populateDropdowns(allLangs);
  }

  renderLanguageList(languages) {
    this.langList.innerHTML = '';
    languages.sort((a, b) => a.name.localeCompare(b.name));
    for (const lang of languages) {
      const li = document.createElement('li');
      li.textContent = `${lang.name} (${lang.code})`;
      this.langList.appendChild(li);
    }
  }

  async populateDropdowns(languages) {
    this.nativeLangContainer.innerHTML = '';
    this.targetLangContainer.innerHTML = '';

    const options = languages.map(lang => ({ value: lang.code, text: lang.name }));

    this.nativeLangSelect = await slice.build('Select', { label: '', options });
    this.targetLangSelect = await slice.build('Select', { label: '', options });

    this.nativeLangContainer.appendChild(this.nativeLangSelect);
    this.targetLangContainer.appendChild(this.targetLangSelect);

    // Load saved config
    const currentSettings = await this.storageService.getSettings();
    if (currentSettings) {
      this.nativeLangSelect.value = currentSettings.nativeLanguage;
      this.targetLangSelect.value = currentSettings.targetLanguage;
    }
  }

  async handleAddLanguage() {
    const name = this.newLangNameInput.value.trim();
    const code = this.newLangCodeInput.value.trim().toLowerCase();

    if (!name || !code) {
      alert('Please provide both a name and a code for the language.');
      return;
    }

    try {
      await this.storageService.addLanguage({ name, code });
      this.newLangNameInput.value = '';
      this.newLangCodeInput.value = '';
      await this.populatePage();
    } catch (error) {
      console.error('Failed to add language:', error);
      alert('This language code might already exist.');
    }
  }

  async handleSaveSettings() {
    const nativeLanguage = this.nativeLangSelect.value?.value;
    const targetLanguage = this.targetLangSelect.value?.value;

    if (!nativeLanguage || !targetLanguage) {
      alert('Please select both a native and a target language.');
      return;
    }
    if (nativeLanguage === targetLanguage) {
      alert('Native and target languages cannot be the same.');
      return;
    }

    try {
      await this.storageService.saveSettings({ nativeLanguage, targetLanguage });
      alert('Settings saved successfully!');
      slice.router.navigate('/');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('An error occurred while saving settings.');
    }
  }
}

customElements.define('settings-page', SettingsPage);
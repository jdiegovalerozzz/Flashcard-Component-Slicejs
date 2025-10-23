import StorageService from '../../Service/StorageService/StorageService.js';

export default class SettingsPage extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.props = props || {};
    this.storageService = new StorageService();
  }

  async init() {
    await this.storageService.init();

    const nativeLangContainer = this.querySelector('#native-lang-select-container');
    const targetLangContainer = this.querySelector('#target-lang-select-container');
    const saveButton = this.querySelector('#save-settings-button');
    const backButton = this.querySelector('#back-button');

    backButton.onclick = () => slice.router.navigate('/');

    // Change this @jdiegoValero
    const languageOptions = [
      { value: 'en', text: 'English' },
      { value: 'es', text: 'Español' },
      { value: 'fr', text: 'Français' },
      { value: 'de', text: 'Deutsch' },
      { value: 'it', text: 'Italiano' },
      { value: 'pt', text: 'Português' },
    ];

    const nativeLangSelect = await slice.build('Select', { label: '', options: languageOptions });
    const targetLangSelect = await slice.build('Select', { label: '', options: languageOptions });

    nativeLangContainer.appendChild(nativeLangSelect);
    targetLangContainer.appendChild(targetLangSelect);

    // Load the saved config
    const currentSettings = await this.storageService.getSettings();
    if (currentSettings) {
      nativeLangSelect.value = currentSettings.nativeLanguage;
      targetLangSelect.value = currentSettings.targetLanguage;
    }

    saveButton.addEventListener('click', async () => {
      const nativeLanguage = nativeLangSelect.value ? nativeLangSelect.value.value : null;
      const targetLanguage = targetLangSelect.value ? targetLangSelect.value.value : null;

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
        alert('An error occurred while saving settings. See console for details.');
      }
    });
  }
}

customElements.define('settings-page', SettingsPage);
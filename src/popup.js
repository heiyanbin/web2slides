const apiKeyInput = document.getElementById('apiKey');
const baseUrlInput = document.getElementById('baseUrl');
const modelInput = document.getElementById('model');
const saveButton = document.getElementById('save');
const generateButton = document.getElementById('generate');

// Load the saved API key, base URL, and model when the popup is opened
chrome.storage.local.get(['apiKey', 'baseUrl', 'model'], (data) => {
  if (data.apiKey) {
    apiKeyInput.value = data.apiKey;
  }
  if (data.baseUrl) {
    baseUrlInput.value = data.baseUrl;
  }
  if (data.model) {
    modelInput.value = data.model;
  }
});

saveButton.addEventListener('click', () => {
  const apiKey = apiKeyInput.value;
  const baseUrl = baseUrlInput.value;
  const model = modelInput.value;
  chrome.storage.local.set({ apiKey, baseUrl, model }, () => {
    alert('Settings saved!');
  });
});

generateButton.addEventListener('click', () => {
  console.log('Sending generateSlides message from popup.'); // Added this line
  chrome.runtime.sendMessage({ action: 'generateSlides' });
});

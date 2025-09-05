import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('provider');
  const generateButton = document.getElementById('generate');

  let providers = [];
  let activeProvider = null;

  // Load providers and active provider from storage
  chrome.storage.local.get(['llmProviders', 'activeProvider'], (data) => {
    if (data.llmProviders) {
      providers = data.llmProviders;
      populateProviderSelect();
    }
    if (data.activeProvider) {
      activeProvider = data.activeProvider;
      providerSelect.value = activeProvider;
    }
  });

  function populateProviderSelect() {
    providerSelect.innerHTML = '';
    providers.forEach((provider) => {
      const option = document.createElement('option');
      option.value = provider.name;
      option.textContent = provider.name;
      providerSelect.appendChild(option);
    });
  }

  providerSelect.addEventListener('change', () => {
    activeProvider = providerSelect.value;
    chrome.storage.local.set({ activeProvider });
  });

  generateButton.addEventListener('click', () => {
    console.log('Sending generateSlides message from popup.');
    chrome.runtime.sendMessage({ action: 'generateSlides' });
  });
});

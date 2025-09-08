import { PROVIDERS } from './providers.js';
import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  // Views
  const mainView = document.getElementById('main-view');
  const settingsView = document.getElementById('settings-view');

  // Main view elements
  const providerSelect = document.getElementById('provider');
  const modelNameElement = document.getElementById('model-name');
  const generateButton = document.getElementById('generate');
  const settingsButton = document.getElementById('settings-button');

  // Settings view elements
  const backButton = document.getElementById('back-button');
  const providersContainer = document.getElementById('providers-container');
  const addProviderButton = document.getElementById('add-provider');

  let providers = [];
  let activeProviderName = null;

  // Load data from storage
  chrome.storage.local.get(['llmProviders', 'activeProvider'], (data) => {
    if (data.llmProviders && data.llmProviders.length > 0) {
      providers = data.llmProviders;
    } else {
      providers = Object.values(PROVIDERS).map((p) => ({ ...p, apiKey: '' }));
      saveProviders();
    }

    if (data.activeProvider) {
      activeProviderName = data.activeProvider;
      providerSelect.value = activeProviderName;
    } else if (providers.length > 0) {
      activeProviderName = providers[0].name;
      chrome.storage.local.set({ activeProvider: activeProviderName });
    }

    populateProviderSelect();
    renderProviders();
    if (activeProviderName) {
      updateModelName(activeProviderName);
    }
  });

  // --- Main View Logic ---
  function updateModelName(providerName) {
    const provider = providers.find(p => p.name === providerName);
    if (provider) {
      modelNameElement.textContent = provider.model;
    }
  }

  function populateProviderSelect() {
    providerSelect.innerHTML = '';
    providers.forEach((provider) => {
      const option = document.createElement('option');
      option.value = provider.name;
      option.textContent = provider.name;
      providerSelect.appendChild(option);
    });
    if (activeProviderName) {
        providerSelect.value = activeProviderName;
        updateModelName(activeProviderName);
    }
  }

  providerSelect.addEventListener('change', () => {
    activeProviderName = providerSelect.value;
    chrome.storage.local.set({ activeProvider: activeProviderName });
    updateModelName(activeProviderName);
  });

  generateButton.addEventListener('click', () => {
    const activeProvider = providers.find(p => p.name === activeProviderName);

    if (!activeProvider || !activeProvider.apiKey) {
      alert(`Please configure the API key for ${activeProviderName}.`);
      mainView.style.display = 'none';
      settingsView.style.display = 'block';
      const providerIndex = providers.findIndex(p => p.name === activeProviderName);
      if (providerIndex !== -1) {
        renderEditForm(providerIndex);
      }
      return;
    }

    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';
    console.log('Sending generateSlides message from popup.');
    chrome.runtime.sendMessage({ action: 'generateSlides' });
  });

  settingsButton.addEventListener('click', () => {
    mainView.style.display = 'none';
    settingsView.style.display = 'block';
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generationComplete') {
      generateButton.disabled = false;
      generateButton.textContent = 'Generate Slides';
    }
  });

  // --- Settings View Logic ---
  backButton.addEventListener('click', () => {
    mainView.style.display = 'block';
    settingsView.style.display = 'none';
  });

  function renderProviders() {
    providersContainer.innerHTML = '';
    providers.forEach((provider, index) => {
      const providerElement = document.createElement('div');
      providerElement.className = 'provider';
      providerElement.innerHTML = `
        <h2>${provider.name}</h2>
        <p>API Key: ${provider.apiKey ? '********' : 'Not set'}</p>
        <p>Base URL: ${provider.baseUrl}</p>
        <p>Model: ${provider.model}</p>
        <div class="provider-actions">
          <button class="edit-provider" data-index="${index}">Edit</button>
          <button class="delete-provider" data-index="${index}">Delete</button>
        </div>
      `;
      providersContainer.appendChild(providerElement);
    });

    document.querySelectorAll('.edit-provider').forEach(button => {
      button.addEventListener('click', handleEditProvider);
    });

    document.querySelectorAll('.delete-provider').forEach(button => {
      button.addEventListener('click', handleDeleteProvider);
    });
  }

  function handleAddProvider() {
    const newProvider = {
      name: 'New Provider',
      apiKey: '',
      baseUrl: '',
      model: '',
    };
    providers.push(newProvider);
    renderEditForm(providers.length - 1);
  }

  function handleEditProvider(event) {
    const index = event.target.dataset.index;
    renderEditForm(index);
  }

  function handleDeleteProvider(event) {
    const index = event.target.dataset.index;
    providers.splice(index, 1);
    saveProviders();
  }

  function saveProviders() {
    chrome.storage.local.set({ llmProviders: providers }, () => {
      renderProviders();
      populateProviderSelect();
    });
  }

  function renderEditForm(index) {
    const provider = providers[index];
    const form = document.createElement('form');
    form.className = 'provider-form';
    form.innerHTML = `
      <label for="name">Name:</label>
      <input type="text" id="name" value="${provider.name}" required>
      <label for="apiKey">API Key:</label>
      <input type="text" id="apiKey" value="${provider.apiKey}" required>
      <label for="baseUrl">Base URL:</label>
      <input type="text" id="baseUrl" value="${provider.baseUrl}" required>
      <label for="model">Model:</label>
      <input type="text" id="model" value="${provider.model}" required>
      <div class="form-actions">
        <button type="submit">Save</button>
        <button type="button" class="cancel-edit">Cancel</button>
      </div>
    `;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      providers[index] = {
        name: form.name.value,
        apiKey: form.apiKey.value,
        baseUrl: form.baseUrl.value,
        model: form.model.value,
      };
      saveProviders();
    });

    form.querySelector('.cancel-edit').addEventListener('click', () => {
      renderProviders();
    });

    providersContainer.innerHTML = '';
    providersContainer.appendChild(form);
  }

  addProviderButton.addEventListener('click', handleAddProvider);
});
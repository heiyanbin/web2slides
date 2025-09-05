import { PROVIDERS } from './providers.js';
import './settings.css';

document.addEventListener('DOMContentLoaded', () => {
  const providersContainer = document.getElementById('providers-container');
  const addProviderButton = document.getElementById('add-provider');

  let providers = [];

  // Load providers from storage
  chrome.storage.local.get('llmProviders', (data) => {
    if (data.llmProviders && data.llmProviders.length > 0) {
      providers = data.llmProviders;
      renderProviders();
    } else {
      // Initialize with default providers if storage is empty
      providers = Object.values(PROVIDERS).map((p) => ({ ...p, apiKey: '' }));
      saveProviders();
    }
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
        <button class="edit-provider" data-index="${index}">Edit</button>
        <button class="delete-provider" data-index="${index}">Delete</button>
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
      <button type="submit">Save</button>
      <button type="button" class="cancel-edit">Cancel</button>
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

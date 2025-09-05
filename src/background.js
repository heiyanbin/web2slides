import { SLIDE_GENERATION_PROMPT } from './prompt.js';
import { PROVIDERS } from './providers.js';

console.log('Web2Slides background script loaded.');

function initializeProviders() {
  chrome.storage.local.get('llmProviders', (data) => {
    if (!data.llmProviders) {
      const initialProviders = Object.values(PROVIDERS).map(provider => ({
        name: provider.name,
        apiKey: '',
        baseUrl: provider.baseUrl,
        model: provider.model || ''
      }));
      chrome.storage.local.set({ llmProviders: initialProviders });
    }
  });
}

chrome.runtime.onInstalled.addListener(initializeProviders);
chrome.runtime.onStartup.addListener(initializeProviders);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateSlides') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['dist/content.js'],
      });
    });
  } else if (request.action === 'extractedContent') {
    chrome.storage.local.get(['llmProviders', 'activeProvider'], (data) => {
      const providers = data.llmProviders;
      const activeProviderName = data.activeProvider;

      if (!providers || !activeProviderName) {
        sendNotification('Configuration Missing', 'Please select a provider in the extension popup.');
        return;
      }

      const activeProvider = providers.find(p => p.name === activeProviderName);

      if (!activeProvider || !activeProvider.apiKey) {
        sendNotification('Configuration Missing', `Please set your API Key for ${activeProviderName} in the settings.`);
        return;
      }

      generateSlides(activeProvider, request.content);
    });
  } else if (request.action === 'contentScriptError') {
    console.error('Content script error:', request.error);
    sendNotification('Content Script Error', `An error occurred in the content script: ${request.error}`);
  }
});

async function generateSlides(provider, content) {
  const endpoint = `${provider.baseUrl}/chat/completions`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${provider.apiKey}`,
  };
  const body = {
    model: provider.model,
    messages: [
      { role: 'system', content: SLIDE_GENERATION_PROMPT },
      { role: 'user', content: `Here is the article content:\n\n${content}` },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('API response:', data);

    if (!response.ok) {
      const errorMessage = data?.error?.message || `Status: ${response.status}`;
      console.error('Error generating slides:', data);
      sendNotification('Error Generating Slides', `An error occurred: ${errorMessage}`);
      return;
    }

    const slidesHtml = data.choices[0].message.content;
    chrome.tabs.create({ url: 'data:text/html;charset=utf-8,' + encodeURIComponent(slidesHtml) });
  } catch (error) {
    console.error('Error generating slides:', error);
    sendNotification('Error Generating Slides', 'An unexpected error occurred. Please check the console for more details.');
  }
}

function sendNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    title: title,
    message: message,
  });
}

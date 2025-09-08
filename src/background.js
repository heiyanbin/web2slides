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
    chrome.storage.local.get(['llmProviders', 'activeProvider', 'temperature'], (data) => {
      const providers = data.llmProviders;
      const activeProviderName = data.activeProvider;
      const temperature = data.temperature || 0.7;

      if (!providers || !activeProviderName) {
        handleGenerationError('Configuration Missing', 'Please select a provider in the extension popup.');
        return;
      }

      const activeProvider = providers.find(p => p.name === activeProviderName);

      if (!activeProvider || !activeProvider.apiKey) {
        handleGenerationError('Configuration Missing', `Please set your API Key for ${activeProviderName} in the settings.`);
        return;
      }

      generateSlides(activeProvider, request.content, temperature);
    });
  } else if (request.action === 'contentScriptError') {
    console.error('Content script error:', request.error);
    handleGenerationError('Content Script Error', `An error occurred in the content script: ${request.error}`);
  }
});

async function generateSlides(provider, content, temperature) {
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
    temperature: temperature,
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
      handleGenerationError('Error Generating Slides', `An error occurred: ${errorMessage}`);
      return;
    }

    let slidesHtml = data.choices[0].message.content;
    // The LLM may wrap the response in a markdown block, so we extract the content.
    const htmlBlockRegex = /```(?:html)?\s*([\s\S]*?)\s*```/
    const match = slidesHtml.match(htmlBlockRegex);
    if (match && typeof match[1] === 'string') {
      slidesHtml = match[1];
    }
    chrome.tabs.create({ url: 'data:text/html;charset=utf-8,' + encodeURIComponent(slidesHtml) });
    chrome.runtime.sendMessage({ action: 'generationSuccess' });
  } catch (error) {
    console.error('Error generating slides:', error);
    handleGenerationError('Error Generating Slides', `An unexpected error occurred: ${error.message}`);
  } finally {
    chrome.runtime.sendMessage({ action: 'generationComplete' });
  }
}

function handleGenerationError(title, message) {
  chrome.runtime.sendMessage({
    action: 'generationError',
    error: { title, message }
  });
}

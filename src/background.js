import { SLIDE_GENERATION_PROMPT } from './prompt.js'; // Added this line

console.log('Web2Slides background script loaded.'); // Added this line

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateSlides') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['dist/content.js']
      });
    });
  } else if (request.action === 'extractedContent') {
    chrome.storage.local.get(['apiKey', 'baseUrl', 'model'], (data) => {
      const apiKey = data.apiKey;
      const baseUrl = data.baseUrl;
      const model = data.model || 'gpt-3.5-turbo'; // Default to gpt-3.5-turbo if not set
      if (!apiKey || !baseUrl) {
        chrome.notifications.create({
          type: 'basic',
          // iconUrl: 'images/icon128.png', // Removed this line
          title: 'Configuration Missing',
          message: 'Please set your API Key and Base URL in the extension popup.'
        });
        return;
      }
      generateSlides(apiKey, baseUrl, model, request.content);
    });
  } else if (request.action === 'contentScriptError') { // Added this block
    console.error('Content script error:', request.error);
    chrome.notifications.create({
      type: 'basic',
      // iconUrl: 'images/icon128.png', // Removed this line
      title: 'Content Script Error',
      message: `An error occurred in the content script: ${request.error}`
    });
  }
});

async function generateSlides(apiKey, baseUrl, model, content) {
  // const prompt = `Please convert the following article into a simple HTML slide deck. Each slide should be a single <div> with a class of 'slide'. The slides should be easy to read and navigate. Here is the article content:
  //
  // ${content}`;

  try {
    const response = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: SLIDE_GENERATION_PROMPT
          },
          {
            role: 'user',
            content: `Here is the article content:\n\n${content}`
          }
        ]
      })
    });

    const data = await response.json();
    console.log('API response:', data); // Log the full response

    if (!response.ok) {
      const errorMessage = data?.error?.message || `Status: ${response.status}`;
      console.error('Error generating slides:', data);
      chrome.notifications.create({
        type: 'basic',
        // iconUrl: 'images/icon128.png', // Removed this line
        title: 'Error Generating Slides',
        message: `An error occurred: ${errorMessage}`
      });
      return;
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Error generating slides: Invalid response from API', data);
      chrome.notifications.create({
        type: 'basic',
        // iconUrl: 'images/icon128.png', // Removed this line
        title: 'Error Generating Slides',
        message: 'Received an invalid response from the AI service. Please check the console for the full response.'
      });
      return;
    }

    const slidesHtml = data.choices[0].message.content;
    chrome.tabs.create({ url: 'data:text/html;charset=utf-8,' + encodeURIComponent(slidesHtml) });
  } catch (error) {
    console.error('Error generating slides:', error);
    chrome.notifications.create({
      type: 'basic',
      // iconUrl: 'images/icon128.png', // Removed this line
      title: 'Error Generating Slides',
      message: 'An unexpected error occurred. Please check the console for more details.'
    });
  }
}
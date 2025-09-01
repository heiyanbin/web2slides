import { Readability } from '@mozilla/readability';

try {
  const documentClone = document.cloneNode(true);
  const article = new Readability(documentClone).parse();

  console.log('Sending extractedContent message from content script.');
  chrome.runtime.sendMessage({ action: 'extractedContent', content: article.content });
} catch (error) {
  console.error('Error in content script:', error);
  chrome.runtime.sendMessage({ action: 'contentScriptError', error: error.message });
}
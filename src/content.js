import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

try {
  const turndownService = new TurndownService();
  const documentClone = document.cloneNode(true);
  const article = new Readability(documentClone).parse();
  const markdown = turndownService.turndown(article.content);

  console.log('Sending extractedContent message from content script.');
  chrome.runtime.sendMessage({ action: 'extractedContent', content: markdown });
} catch (error) {
  console.error('Error in content script:', error);
  chrome.runtime.sendMessage({ action: 'contentScriptError', error: error.message });
}
# GEMINI.md

## Project Overview

This project is a Chrome Extension called **Web2Slides**. It's designed to take the content of the current webpage and convert it into an HTML slide deck.

*   **Purpose:** To quickly create a presentation from a webpage.
*   **Core Functionality:**
    1.  A user clicks a button in the Chrome toolbar.
    2.  The extension extracts the text from the current page.
    3.  The extracted text is sent to an AI service, which generates a complete HTML slide deck in a single step.
    4.  The user can preview the slides in a new tab and save them as an HTML file.
*   **Technologies:**
    *   Chrome Extension (Manifest V3)
    *   `chrome.scripting` API for page content extraction.
    *   An AI API for summarization and HTML slide generation.
    *   HTML/CSS/JS for the slide deck. The project might use a library like Reveal.js or custom code.

## Building and Running

### Building the extension

To build the extension, run the following command:

```bash
npm run build
```

This will create a `dist` directory with the bundled extension files.

### Loading the extension in Chrome for development

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode".
3.  Click "Load unpacked".
4.  Select the `dist` directory.

## Development Conventions

*   **TODO:** Add any coding style guidelines or conventions.
*   **TODO:** Add instructions on how to run tests.
# Product Requirement Prompt (PRP)

## Product Name

**Web2Slides (Chrome Extension)**

## Input

* Current open webpage in Chrome.

## Output

* A standalone **HTML slide deck (PPT style)**:

  * Each slide fits one screen.
  * Arrow keys / clicks for navigation.

## Core Requirements

1. **One-click button** in Chrome toolbar → summarize current page.
2. **Extract page text**, send to AI summarizer, generate outline.
3. **Render HTML slides** with clean styling (minimal, modern).
4. **Preview in new tab** + option to save HTML file.

## Tech Notes

* Chrome **Manifest V3**.
* Use `chrome.scripting` for page extraction.
* Summarization via **AI API**.
* HTML slides can use **Reveal.js** or custom CSS/JS.




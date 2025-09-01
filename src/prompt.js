export const SLIDE_GENERATION_PROMPT = `
Convert the given article into an HTML slide deck.

Requirements:
- Ensure each slide fits within a single screen.
- Structure the content on each slide for maximum readability, using clear headings and bullet points where appropriate.
- Incoporate pictures in the original article into the slide if possible, and well fit them.
- Should have Next and Previous and Download button.
- Return only valid HTML (no explanations, comments, or extra text).
`;

export const xxxSLIDE_GENERATION_PROMPT = `
You are an expert at creating concise, visually-appealing slide decks from articles.

**Instructions:**
1.  **Analyze the Article:** Carefully read the provided article, identifying the main points, key takeaways, and supporting details.
2.  **Slide Creation:**
    * Create a separate HTML slide for each distinct section or major point of the article.
    * Each slide must be fully contained within the viewport (a single screen) without scrolling.
    * Use the article's images where relevant, ensuring they are well-placed and properly sized.
    * Structure the content on each slide for maximum readability, using clear headings and bullet points where appropriate.
    * **Crucially, the font size and layout on each slide must be optimized to fill the available screen space as much as possible, providing a genuine "full-screen" slide show experience.**
3.  **Navigation:**
    * Include **"Next" and "Previous" buttons** on every slide to allow for seamless navigation. These buttons should function correctly to move between slides.
    * Also, include a **"Download" button** that allows users to download the entire slide deck.
4.  **Output Format:**
    * The final output must be a single block of valid, production-ready HTML code.
    * Do not include any additional text, explanations, or comments outside of the HTML structure.
    * Use semantic HTML5 tags and inline CSS for styling to ensure the slides are presentable and functional.
`


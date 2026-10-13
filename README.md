# AI Tailor Studio

A responsive fashion-design website with:
- A fashion concept form that generates an outfit image through the OpenAI Images API.
- A fashion assistant that gives styling, colour, and fabric suggestions through the OpenAI Responses API.
- A mobile-friendly design.

## Run locally
1. Install Node.js 18 or newer.
2. Open this project folder in a terminal.
3. Run `npm install`.
4. Set `OPENAI_API_KEY` as an environment variable on the server.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Important security notes
- Never put your API key in `index.html`, `styles.css`, or `app.js`.
- Use your hosting provider's server-side Secrets / Environment Variables feature.
- API usage can cost money. Review your API account's billing and usage limits before testing image generation.
- The site is a starter project. Before public launch, add authentication/rate limiting, privacy and terms pages, abuse prevention, and deployment configuration.

## Deploying
Deploy to a Node.js host that supports server-side environment variables. Upload the project files, install dependencies, set `OPENAI_API_KEY` as a secret, and start with `npm start`.

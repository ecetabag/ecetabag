# Ece portfolio — Vercel + Groq

This version is ready for Vercel.

## Required Vercel environment variable

`GROQ_API_KEY`

You said this is already set in Vercel. Make sure it is enabled for the environment you deploy to (Production, Preview, or Development as needed).

## Structure

- `index.html` — website
- `assets/style.css` — styles
- `assets/app.js` — frontend logic; chatbot calls `/api/chat`
- `assets/images/` — local images
- `api/chat.js` — Vercel serverless function that securely calls Groq
- `vercel.json` — basic Vercel config

## Deploy

Push this folder to the GitHub repository connected to Vercel, or import the folder/repository directly into Vercel.

The browser never receives the Groq API key. `/api/chat` reads it from `process.env.GROQ_API_KEY` on the server.

The chatbot currently uses Groq model `openai/gpt-oss-120b`.

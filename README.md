# Co-Pilot: AI Meeting Assistant

Co-Pilot is an always-on, intelligent meeting assistant that listens to your live conversations and provides real-time, highly contextual suggestions to help you navigate meetings more effectively. Built for performance and precision, it serves as a lightweight copilot that dynamically analyzes transcripts and surfaces critical follow-ups, fact checks, and action items as you speak.

## Features

- **Live Speech-to-Text Transcription**: Streams mic audio in precise chunks to Groq's high-speed Whisper Large V3 for lightning-fast, highly accurate transcription.
- **Context-Aware Live Suggestions**: As the meeting progresses, the engine actively analyzes recent context using `Llama-3.3-70b-versatile` and surfaces exactly 3 actionable items:
  - 🔍 **Follow-up Questions** (Deep dive into something just mentioned)
  - 🎯 **Fact Checking** (Verify claims or metrics discussed)
  - 💡 **Clarifying Info** (Explain jargon, acronyms, or concepts instantly)
  - 📌 **Talking Points** (Strategic maneuvers)
  - ✅ **Action Items** (Concrete next steps)
- **Interactive AI Chat Sidebar**: Clicking on any live suggestion automatically queries the dedicated Chat Assistant for deeper insights without interrupting your workflow.
- **Configurable Intelligence**: Modify API keys, character limits for context rolling windows, and customize the deep-level system Prompts for the AI models straight from the UI.
- **Export Session**: Allows users to seamlessly export the entire session—including full transcripts, timestamped AI suggestion batches, and chat history—into a structured JSON file.
- **Clean Aesthetic**: A beautiful, minimalist, high-contrast light mode UI inspired by modern professional SaaS tooling.

## Tech Stack

This project was bootstrapped with [Vite](https://vitejs.dev/) and is built entirely in React.

- **Frontend**: React, Tailwind CSS, Lucide React (Icons), React Markdown
- **AI / LLM Backend**: [Groq API](https://groq.com) (Whisper Large V3 and Llama 3)
- **Audio Processing**: Native Web `MediaRecorder` API with modular local chunking.

## Getting Started

### Prerequisites
You will need a valid **Groq API Key**. You can obtain one by signing up at the [Groq Console](https://console.groq.com/keys).

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`. 
4. Click the gear icon (⚙️) in the top right to open settings and input your Groq API key.
5. Click the **Microphone** icon to start recording and let your Copilot assist you!

## Usage Security & Privacy
All API requests to Groq are sent securely and directly from the client. Your audio and transcript data is kept in-memory to power the context windows and does not persist anywhere unencrypted besides what is sent to the LLM context limits. Ensure you review Groq's privacy policy regarding audio and prompt data.

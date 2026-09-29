# Aura: Persistent Memory Voice Agent

Aura is a next-generation conversational voice agent powered by Google Gemini and **Hindsight DB**. The primary purpose of this project is to demonstrate an AI agent that possesses true, persistent, long-term memory across all interactions. 

## The Zero-Repetition Guarantee

"Nothing angers a user more than repeating their story." 

Traditional support bots and IVR systems suffer from "context amnesia." Every time a user connects, transfers to a new department, or calls back the next day, they are forced to re-explain their problem, verify their identity, and repeat the details of their previous interactions.

Aura solves this by utilizing **Hindsight DB** as an active memory fabric. Every interaction, complaint, preference, and resolution is permanently recorded as an event in the agent's timeline. When the user interacts with Aura, the agent proactively recalls their historical context and leads the conversation with what it already knows.

### Key Capabilities:
* **Persistent Memory Logs:** Seamlessly stores and recalls user preferences, unresolved issues, and past actions.
* **Proactive Empathy:** The agent acknowledges ongoing issues the moment a session starts.
* **Instant Action Execution:** Powered by Gemini function calling, the agent acts on the user's behalf (e.g., executing backend tasks) rather than just answering questions.

## The Usecase: Banking Customer Support

To effectively showcase the power of this memory system, this project wraps the voice agent in a **mock digital banking application**. 

**Note:** The banking UI, accounts, and transactions are entirely simulated and exist purely to provide a realistic, complex environment for the AI agent to operate within. The core innovation of this repository is the voice agent architecture and its integration with Hindsight DB, not the banking features themselves. 

The banking scenario effectively highlights the agent's memory capabilities:
* Remembering that a user's call dropped yesterday while disputing a $124 charge, so the agent can immediately process the refund today without asking any questions.
* Recalling that a user explicitly asked for text-message receipts for all future transactions.
* Identifying patterns in the user's transaction history to provide intelligent, context-aware assistance.

## Technology Stack

* **Google Gemini API:** Real-time conversational AI and function calling.
* **Hindsight DB:** Agent memory system for long-term, persistent event storage and retrieval.
* **Express & Node.js:** Backend API for handling AI interactions and database operations.
* **React & Vite:** Frontend interface to simulate the environment the agent operates within.

## Run Locally

**Prerequisites:** Node.js v20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env` to your Gemini API key.
3. Run the development server:
   ```bash
   npm run dev
   ```

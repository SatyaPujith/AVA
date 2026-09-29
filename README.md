# AVA (Advanced Voice Agent): The Zero-Repetition Voice AI

<div align="center">
  <h3>Powered by Google Gemini & Hindsight DB</h3>
</div>

## 📖 Overview

**AVA (Advanced Voice Agent)** is a next-generation conversational AI architecture designed to solve one of the most frustrating problems in customer service: **Context Amnesia**. 

Traditional IVR (Interactive Voice Response) systems and early-generation support bots force users to constantly repeat their stories, re-verify their identities, and re-explain their problems every time they connect, get transferred, or call back the next day. 

AVA eliminates this friction by leveraging **Hindsight DB** as a persistent, active memory fabric. Every interaction, complaint, user preference, dropped call, and resolution is permanently recorded as an event in a vector-aware timeline. When a user interacts with AVA, the agent proactively queries this database, recalling their exact historical context, and leading the conversation with what it already knows.

---

## 🚀 The Usecase: A Simulated Banking Environment

To effectively showcase the power of this memory system, AVA is demonstrated within a **mock digital banking application**. 

> **Important Note:** The banking UI, accounts, balances, and transactions in this repository are entirely simulated. They exist purely to provide a realistic, complex, and data-rich environment for the AI agent to operate within. The core innovation of this project is the **voice agent architecture and its integration with persistent memory**, not the banking features themselves.

### Why Banking?
A banking environment perfectly highlights the need for persistent memory:
* **The Dropped Call Scenario:** If a user calls to dispute a $124 charge, and the call drops after 14 minutes of holding, AVA remembers. When the user calls back, AVA says, *"I see we got disconnected while discussing the $124 charge. I've already prepared the refund, would you like me to process it?"* — zero repetition required.
* **Complex Preferences:** If a user explicitly asks for text-message receipts instead of emails, AVA remembers this forever.
* **Proactive Empathy:** By analyzing past transaction patterns and support tickets, AVA can detect frustration and immediately escalate or offer immediate resolutions without forcing the user through a standard troubleshooting script.

---

## 🧠 Core Architecture

The AVA architecture is built on three main pillars:

### 1. The Conversational Engine (Google Gemini API)
At the heart of AVA is **Google Gemini**, providing real-time, highly empathetic conversational AI capabilities. Gemini acts as the brain, processing natural language, understanding intent, and generating human-like responses. Furthermore, Gemini's **function calling** capabilities allow AVA to actively execute backend tasks (like locking a card or issuing a refund) rather than just answering static questions.

### 2. The Persistent Memory Fabric (Hindsight DB)
Instead of relying on a standard SQL database for state, AVA uses **Hindsight DB**. Hindsight DB is a purpose-built database for agent memory and events. 
* It stores user interactions as a chronological timeline of events.
* It allows the agent to semantically search past interactions to retrieve relevant context.
* Before the agent even speaks to the user, the backend queries Hindsight DB to build a highly contextual "System Prompt" injecting all known history about the user.

### 3. The Execution Environment (Node.js & React)
* **Backend (`server.ts`):** An Express server that acts as the orchestration layer. It handles communication with the Gemini API, manages the integration with Hindsight DB, and exposes REST endpoints for memory retrieval and insertion.
* **Frontend (`React + Vite`):** A modern, responsive dashboard that visualizes the "Agent's View" of the customer, showing the active memory ledger, transaction history, and providing the interface to initiate a voice call with AVA.

---

## ⚙️ How It Works (The Lifecycle of a Memory)

1. **The Interaction:** The user initiates a voice call with AVA via the frontend dashboard.
2. **Context Retrieval:** The backend intercepts the call initiation and queries Hindsight DB (`GET /api/memory/:customerId`).
3. **Prompt Injection:** All historical events, preferences, and unresolved issues are dynamically injected into Gemini's system instructions.
4. **The Conversation:** AVA speaks to the user, demonstrating full awareness of their history.
5. **Action Execution:** If the user asks AVA to perform an action (e.g., "Lock my card"), Gemini triggers a tool call, which the frontend executes.
6. **Memory Solidification:** Once the call concludes, AVA generates a post-call summary. This summary, along with any actions taken, is pushed back to the backend (`POST /api/memory/:customerId`) and permanently inserted into Hindsight DB as a new historical event, ready for the next interaction.

---

## 🛠️ Technology Stack

* **AI Engine:** Google Gemini API (gemini-2.5-flash)
* **Database:** Hindsight DB (Embedded SQLite Vector DB for Agent Memory)
* **Backend Framework:** Node.js, Express, TypeScript
* **Frontend Framework:** React 19, Vite, Tailwind CSS, Lucide Icons
* **Animation:** Motion (Framer Motion) for fluid UI transitions

---

## 💻 Running the Project Locally

### Prerequisites
* Node.js v20.x or higher
* A valid Google Gemini API Key

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "HINDSIGHT DB HACKATHON"
   ```

2. **Install dependencies:**
   *(Note: `--legacy-peer-deps` is recommended due to specific version requirements between Vite, React, and build tools in this environment).*
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   ```

4. **Start the Development Server:**
   This command concurrently starts both the Express backend and the Vite frontend.
   ```bash
   npm run dev
   ```

5. **Access the Application:**
   Open your browser and navigate to `http://localhost:3000`. You can now select a mock customer profile and click the "Call AVA" button to experience the zero-repetition voice agent.

---

## 🛡️ License & Disclaimer

This project was built as a proof-of-concept for hackathon purposes. The financial data, customer profiles, and banking interfaces are entirely simulated. Do not use real financial data or personal identifiable information (PII) when interacting with the voice agent.

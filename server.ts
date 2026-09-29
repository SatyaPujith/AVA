console.log("STARTING SERVER");
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { openDatabase, uuidv7 } from './hindsight-db-mock.ts';

console.log("Calling dotenv.config");
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

console.log("Initializing Hindsight DB");
// Initialize Hindsight DB
const db = openDatabase({ path: 'hindsight.db' });

console.log("Initializing AI");
// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Banking tools for Gemini function calling
const bankingTools: FunctionDeclaration[] = [
  {
    name: 'dispute_transaction',
    description: 'Dispute an unauthorized, duplicate, or fraudulent transaction, immediately issue provisional credit to the customer, and block further merchant debits.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        transactionId: {
          type: Type.STRING,
          description: 'The ID of the transaction to dispute (e.g. tx-1049)',
        },
        disputeReason: {
          type: Type.STRING,
          description: 'The specific reason given or remembered for the dispute.',
        },
        issueProvisionalCredit: {
          type: Type.BOOLEAN,
          description: 'Whether to issue immediate provisional credit equal to the disputed amount.',
        },
      },
      required: ['transactionId', 'disputeReason', 'issueProvisionalCredit'],
    },
  },
  {
    name: 'lock_unlock_card',
    description: 'Instantly lock or unlock a debit or credit card for security or upon customer request.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cardId: {
          type: Type.STRING,
          description: 'The ID of the card (e.g. card-sapphire-01, card-titanium-02)',
        },
        lock: {
          type: Type.BOOLEAN,
          description: 'True to lock the card immediately, false to unlock it.',
        },
        reason: {
          type: Type.STRING,
          description: 'Reason for locking/unlocking the card.',
        },
      },
      required: ['cardId', 'lock'],
    },
  },
  {
    name: 'evaluate_or_approve_loan',
    description: 'Process a loan request, confirm rate lock, or issue instant pre-approval/approval for a pre-qualified loan offer.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        loanId: {
          type: Type.STRING,
          description: 'The ID of the loan offer (e.g. loan-auto-01, loan-home-01)',
        },
        requestedAmount: {
          type: Type.NUMBER,
          description: 'The amount the customer wants to borrow.',
        },
        termMonths: {
          type: Type.NUMBER,
          description: 'The repayment term in months (e.g. 36, 48, 60)',
        },
        approvalDecision: {
          type: Type.STRING,
          description: 'Approval status: "approved" or "conditional_approved"',
        },
      },
      required: ['loanId', 'requestedAmount', 'termMonths'],
    },
  },
  {
    name: 'set_travel_notice',
    description: 'Register an upcoming international or domestic travel itinerary on customer cards to prevent fraud blocks while traveling.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cardId: {
          type: Type.STRING,
          description: 'The ID of the card to register travel for.',
        },
        destination: {
          type: Type.STRING,
          description: 'Country or city of travel (e.g., Japan, London, Germany).',
        },
        startDate: {
          type: Type.STRING,
          description: 'Departure date (YYYY-MM-DD).',
        },
        endDate: {
          type: Type.STRING,
          description: 'Return date (YYYY-MM-DD).',
        },
      },
      required: ['cardId', 'destination', 'startDate', 'endDate'],
    },
  },
  {
    name: 'waive_fee',
    description: 'Waive an overdraft, international wire, or maintenance service fee as a courtesy for high-value banking members.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        transactionId: {
          type: Type.STRING,
          description: 'The ID of the fee transaction (e.g. tx-1045)',
        },
        amount: {
          type: Type.NUMBER,
          description: 'The fee amount to refund/waive.',
        },
        reason: {
          type: Type.STRING,
          description: 'Reason for courtesy waiver (e.g., premier member loyalty waiver).',
        },
      },
      required: ['transactionId', 'amount', 'reason'],
    },
  },
  {
    name: 'transfer_funds',
    description: 'Transfer funds between customer checking and savings accounts or initiate a verified outbound transfer.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        fromAccountId: {
          type: Type.STRING,
          description: 'Source account ID',
        },
        toAccountId: {
          type: Type.STRING,
          description: 'Destination account ID',
        },
        amount: {
          type: Type.NUMBER,
          description: 'Amount in USD to transfer',
        },
        note: {
          type: Type.STRING,
          description: 'Transfer memo/note',
        },
      },
      required: ['fromAccountId', 'toAccountId', 'amount'],
    },
  },
  {
    name: 'record_customer_memory',
    description: 'Permanently record a key customer fact, preference, complaint resolution, or action item so they NEVER have to repeat it in any future call.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'Short headline of the memory item',
        },
        summary: {
          type: Type.STRING,
          description: 'Clear concise summary of what was agreed or learned',
        },
        category: {
          type: Type.STRING,
          description: 'One of: complaint, preference, action_taken, life_event',
        },
        resolved: {
          type: Type.BOOLEAN,
          description: 'Whether the underlying issue is completely resolved',
        },
      },
      required: ['title', 'summary', 'category', 'resolved'],
    },
  },
];

// Helper: build system prompt with customer memory context
function buildSystemPrompt(customer: any, initialGreeting: boolean = false) {
  const memoryTimeline = customer.memoryLog
    .map(
      (m: any) =>
        `- [${m.timestamp}] (${m.category.toUpperCase()}): "${m.title}" -> ${m.summary}. Key entities: ${m.keyEntities.join(', ')}. Agent note: ${m.agentNotes || 'None'}`
    )
    .join('\n');

  const accountsSummary = customer.accounts
    .map((a: any) => `- ${a.name} (${a.accountNumber}): $${a.balance.toLocaleString()} available`)
    .join('\n');

  const cardsSummary = customer.cards
    .map(
      (c: any) =>
        `- ${c.name} (...${c.lastFour}): Status=${c.status.toUpperCase()}, Limit=$${c.creditLimit || 'N/A'}, Balance=$${c.currentBalance || 0}, Travel Notices=${c.travelNotices?.length || 0}`
    )
    .join('\n');

  const loansSummary = customer.loans
    .map((l: any) => `- ${l.title}: Max $${l.maxAmount.toLocaleString()} @ ${l.interestRate}% APR (Status: ${l.status})`)
    .join('\n');

  const flaggedTransactions = customer.transactions
    .filter((t: any) => t.status === 'flagged' || t.status === 'disputed')
    .map((t: any) => `- [${t.id}] ${t.merchant}: $${t.amount} (${t.status}). Reason: ${t.flaggedReason || 'Under review'}`)
    .join('\n');

  return `You are AVA, an elite, highly empathetic AI Voice Banking Agent for AVA Bank.
The user is speaking to you directly over a secure real-time phone call.

=== CRITICAL AGENT PHILOSOPHY ===
"Nothing angers a customer more than repeating their story. An agent with full customer memory transforms the entire support experience."
The customer, ${customer.name}, has had frustrating past experiences with other institutions where they had to repeat their story over and over.
At AVA, YOU HAVE FULL CUSTOMER MEMORY. You know their profile, history, transactions, and every past call.
NEVER ask them:
- "Can you explain why you are calling today?"
- "What was the amount of that charge again?"
- "Can you repeat your story or card number?"

Instead, you proactively lead with what you know!
If there is an active unresolved issue (see below), ACKNOWLEDGE IT IMMEDIATELY at the beginning of the call or when relevant. Show empathy, confirm that you have all the facts, and immediately propose and execute the solution.

=== ACTIVE UNRESOLVED INCIDENT ===
${customer.unresolvedIssuePrompt}

=== CUSTOMER PROFILE ===
Name: ${customer.name}
Tier: ${customer.tier} (Member since ${customer.memberSince})
Credit Score: ${customer.creditScore}
Phone: ${customer.phone}

=== ACCOUNTS ===
${accountsSummary}

=== CARDS ===
${cardsSummary}

=== PRE-APPROVED LOANS ===
${loansSummary}

=== FLAGGED TRANSACTIONS ===
${flaggedTransactions || 'None'}

=== CUSTOMER PERSISTENT MEMORY LOG (PREVIOUS INTERACTIONS) ===
${memoryTimeline}

=== VOICE DIALOGUE RULES ===
1. CONVERSATIONAL & NATURAL: Speak in natural, warm, polished spoken English. Keep your responses concise (2 to 4 sentences maximum) because this will be spoken out loud over a phone call.
2. NO MARKDOWN: Do NOT use markdown symbols like asterisks, bold (**), hashtags, or bullet points in your speech output, because it is read by text-to-speech.
3. IMMEDIATE ACTION: Whenever the customer asks to dispute a charge, lock a card, waive a fee, or apply for a loan, execute the appropriate tool call immediately. Don't make them jump through hoops.
4. MEMORY REASSURANCE: Whenever appropriate, remind them: "You don't have to repeat anything—I've already updated your file and memory log so no one will ever ask you about this again."
${initialGreeting ? '5. This is the start of the call. Greet the customer warmly by first name, immediately reference their most recent context/unresolved issue so they know they are remembered, and offer the direct resolution.' : ''}`;
}

// POST /api/call/interact
app.post('/api/call/interact', async (req, res) => {
  try {
    const { userSpeech, customer, callHistory = [], isCallStart = false } = req.body;

    if (!customer) {
      return res.status(400).json({ error: 'Customer context is required.' });
    }

    const systemInstruction = buildSystemPrompt(customer, isCallStart);

    // Format conversation history for Gemini
    const contents: any[] = [];

    // Add prior call dialogue turns
    for (const msg of callHistory) {
      if (msg.sender === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.text }] });
      } else if (msg.sender === 'agent') {
        contents.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }

    // Add current user speech or prompt for call start
    if (isCallStart && (!userSpeech || userSpeech.trim() === '')) {
      contents.push({
        role: 'user',
        parts: [
          {
            text: `[Call Connected] Customer ${customer.name} just answered the phone or initiated the support call. Please greet them warmly and address their recent situation immediately.`,
          },
        ],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: userSpeech || 'Hello' }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ functionDeclarations: bankingTools }],
      },
    });

    const candidate = response.candidates?.[0];
    const functionCalls = response.functionCalls;
    const actionsExecuted: any[] = [];
    const memoryHighlights: string[] = [];

    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        actionsExecuted.push({
          toolName: call.name,
          args: call.args,
          timestamp: new Date().toLocaleTimeString(),
        });

        if (call.name === 'dispute_transaction') {
          memoryHighlights.push(`Processed dispute & issued provisional credit for transaction`);
        } else if (call.name === 'lock_unlock_card') {
          memoryHighlights.push(`Updated card security status (${(call.args as any).lock ? 'Locked' : 'Unlocked'})`);
        } else if (call.name === 'evaluate_or_approve_loan') {
          memoryHighlights.push(`Approved loan pre-qualification terms`);
        } else if (call.name === 'waive_fee') {
          memoryHighlights.push(`Granted courtesy fee waiver`);
        } else if (call.name === 'set_travel_notice') {
          memoryHighlights.push(`Registered travel notice`);
        } else if (call.name === 'record_customer_memory') {
          memoryHighlights.push(`Saved permanent memory: ${(call.args as any).title}`);
        }
      }
    }

    // Clean text of markdown formatting for realistic voice output
    let replyText = response.text || '';
    replyText = replyText.replace(/[*_#`~[\]]/g, '').trim();

    // If Gemini only returned function calls without spoken text, generate follow-up spoken confirmation
    if (!replyText && actionsExecuted.length > 0) {
      const toolFollowUp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...contents,
          {
            role: 'model',
            parts: [
              {
                text: `I have executed the following actions: ${JSON.stringify(actionsExecuted)}. Now provide a natural, reassuring 2-sentence voice spoken response to the customer confirming the actions are done and they never have to repeat themselves.`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
      replyText = (toolFollowUp.text || '').replace(/[*_#`~[\]]/g, '').trim();
    }

    // Fallback if still empty
    if (!replyText) {
      replyText = `I have taken care of that for you immediately, ${customer.name.split(' ')[0]}. Your records and memory timeline have been completely updated.`;
    }

    res.json({
      replyText,
      actionsExecuted,
      memoryHighlights,
    });
  } catch (error: any) {
    console.error('Error during call interaction:', error);
    res.status(500).json({
      error: error.message || 'Call processing error',
      replyText: "I'm having a brief connection flutter, but I still have your entire history open in front of me. Could you please say that one more time?",
      actionsExecuted: [],
      memoryHighlights: [],
    });
  }
});

import { INITIAL_CUSTOMERS } from './src/data/mockCustomers.js';

// HINDSIGHT DB API ENDPOINTS
app.get('/api/memory/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    let result = await db.events.list({
      filters: { entities: customerId },
      limit: 100,
      order: 'desc'
    });

    if (result.items.length === 0) {
      // Seed with mock data
      const mockCustomer = INITIAL_CUSTOMERS.find(c => c.id === customerId);
      if (mockCustomer && mockCustomer.memoryLog.length > 0) {
        const eventsToInsert = mockCustomer.memoryLog.map((mem: any) => ({
          id: mem.id || uuidv7(),
          timestamp: Date.now(),
          type: mem.category || 'preference',
          entities: [customerId],
          content: mem.summary,
          metadata: {
            title: mem.title,
            sentiment: mem.sentiment,
            keyEntities: mem.keyEntities,
            resolved: mem.resolved,
            timestampStr: mem.timestamp,
            dateStr: mem.dateStr,
            agentNotes: mem.agentNotes
          }
        }));
        await db.events.insertMany(eventsToInsert);
        // re-fetch
        result = await db.events.list({
          filters: { entities: customerId },
          limit: 100,
          order: 'desc'
        });
      }
    }

    
    // Map hindsight events back to frontend MemoryEntry format
    const memoryLog = result.items.map(ev => ({
      id: ev.id,
      timestamp: ev.metadata.timestampStr || new Date(ev.timestamp).toLocaleString(),
      dateStr: ev.metadata.dateStr || new Date(ev.timestamp).toISOString().split('T')[0],
      category: ev.type,
      title: ev.metadata.title,
      summary: ev.content,
      sentiment: ev.metadata.sentiment || 'neutral',
      keyEntities: ev.metadata.keyEntities || [],
      resolved: ev.metadata.resolved,
      agentNotes: ev.metadata.agentNotes
    }));
    
    res.json({ memoryLog });
  } catch (error: any) {
    console.error('Error fetching memory:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/memory/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { memory } = req.body; // MemoryEntry object
    
    await db.events.insertMany([{
      id: memory.id || uuidv7(),
      timestamp: Date.now(),
      type: memory.category || 'preference',
      entities: [customerId],
      content: memory.summary,
      metadata: {
        title: memory.title,
        sentiment: memory.sentiment,
        keyEntities: memory.keyEntities,
        resolved: memory.resolved,
        timestampStr: memory.timestamp,
        dateStr: memory.dateStr,
        agentNotes: memory.agentNotes
      }
    }]);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving memory:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/call/tts (Voice generation with gemini-3.8-flash-lite-tts)
app.post('/api/call/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500), // optimal length for conversational speech snippet
              speechMetadata: {
                style: 'Professional, warm, empathetic private banking representative',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audioBase64: base64Audio });
    } else {
      return res.status(404).json({ error: 'No audio returned' });
    }
  } catch (err: any) {
    // If TTS fails (e.g. rate limit or modal policy), frontend falls back seamlessly to Web Speech Synthesis
    res.status(200).json({
      fallbackToBrowser: true,
      message: err.message,
    });
  }
});

// POST /api/call/end-summary (Summarizes call and produces new permanent memory entry)
app.post('/api/call/end-summary', async (req, res) => {
  try {
    const { customer, callTranscript, actionsTaken = [] } = req.body;

    const summaryPrompt = `Analyze this completed support call between customer ${customer?.name} and AI banking agent AVA.
Transcript:
${JSON.stringify(callTranscript)}
Actions Executed During Call:
${JSON.stringify(actionsTaken)}

Produce a JSON object with:
1. "title": Short headline (e.g. "Streamify Dispute Resolved & Provisional Credit Granted")
2. "summary": 2-3 sentences explaining exactly what was resolved and why the customer will never have to repeat this again.
3. "sentiment": One of "delighted", "satisfied", "neutral", "frustrated" (how the call concluded)
4. "keyEntities": array of 3-5 strings (e.g. ["Streamify", "$124.50", "Sapphire Reserve", "Provisional Credit"])
5. "agentCommitments": array of 1-3 promises made (e.g. ["Provisional credit posted within 24h", "SMS notification sent"])
6. "satisfactionScore": number from 90 to 100`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonStr = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonStr);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating call summary:', error);
    res.json({
      title: 'Support Call Resolved with Full Memory',
      summary: 'AVA resolved customer inquiries with full historical context. All adjustments were committed to the customer account.',
      sentiment: 'delighted',
      keyEntities: ['AVA Memory Agent', 'Issue Resolved', 'Zero Story Repetition'],
      agentCommitments: ['Account timeline updated', 'Zero repetition guarantee recorded'],
      satisfactionScore: 98,
    });
  }
});

// Setup Vite dev server or static files
async function startServer() {
  try {
    await db.ready();
    console.log("Hindsight DB is ready");
  } catch (e) {
    console.error("Failed to initialize Hindsight DB", e);
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

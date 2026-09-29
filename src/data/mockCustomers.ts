import { CustomerProfile } from '../types/banking';

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-elena-vance',
    name: 'Elena Vance',
    email: 'elena.vance@vancestudios.design',
    phone: '+1 (415) 890-4421',
    tier: 'Premier Private',
    memberSince: 'March 2019',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    creditScore: 785,
    unresolvedIssuePrompt: 'Yesterday at 3:15 PM, Elena had an unauthorized charge of $124.50 from "Streamify Premium Inc". She waited 14 minutes on the phone, explained the charge twice to IVR and an agent, and the call was disconnected right when transferring to the fraud department.',
    accounts: [
      {
        id: 'acc-chk-01',
        name: 'Premier Interest Checking',
        type: 'checking',
        accountNumber: '•••• 4902',
        balance: 14820.45,
        availableBalance: 14820.45,
        currency: 'USD'
      },
      {
        id: 'acc-sav-01',
        name: 'AVA High-Yield Reserve',
        type: 'savings',
        accountNumber: '•••• 8120',
        balance: 42150.00,
        availableBalance: 42150.00,
        apy: 4.85,
        currency: 'USD'
      }
    ],
    cards: [
      {
        id: 'card-sapphire-01',
        name: 'AVA Sapphire Reserve',
        type: 'credit',
        cardholder: 'ELENA VANCE',
        lastFour: '8821',
        expiry: '09/29',
        cvv: '642',
        brand: 'visa',
        status: 'active',
        creditLimit: 18000,
        currentBalance: 2430.12,
        cashbackRate: '3% All Travel & Dining',
        colorScheme: 'sapphire',
        travelNotices: [
          {
            destination: 'Kyoto & Tokyo, Japan',
            startDate: '2026-10-15',
            endDate: '2026-10-28'
          }
        ]
      },
      {
        id: 'card-plat-debit-01',
        name: 'AVA Signature Debit',
        type: 'debit',
        cardholder: 'ELENA VANCE',
        lastFour: '1104',
        expiry: '04/28',
        cvv: '819',
        brand: 'mastercard',
        status: 'active',
        colorScheme: 'platinum',
        travelNotices: []
      }
    ],
    transactions: [
      {
        id: 'tx-1049',
        accountId: 'acc-chk-01',
        cardId: 'card-sapphire-01',
        description: 'Streamify Premium Inc - Unauthorized Recurring Charge',
        merchant: 'Streamify Premium Inc',
        amount: 124.50,
        category: 'Subscription',
        date: 'Yesterday, 3:12 PM',
        timestamp: Date.now() - 86400000,
        status: 'flagged',
        isRecurring: true,
        flaggedReason: 'Flagged by customer: Unrecognized recurring charge. Never subscribed to family plan.'
      },
      {
        id: 'tx-1048',
        accountId: 'acc-chk-01',
        cardId: 'card-sapphire-01',
        description: 'Whole Foods Market - Organic Groceries',
        merchant: 'Whole Foods Market',
        amount: 86.42,
        category: 'Groceries',
        date: 'Sep 27, 2026',
        timestamp: Date.now() - 120000000,
        status: 'completed'
      },
      {
        id: 'tx-1047',
        accountId: 'acc-chk-01',
        cardId: 'card-sapphire-01',
        description: 'Uber Black Ride - SFO Airport',
        merchant: 'Uber Technologies',
        amount: 52.80,
        category: 'Travel',
        date: 'Sep 26, 2026',
        timestamp: Date.now() - 172800000,
        status: 'completed'
      },
      {
        id: 'tx-1046',
        accountId: 'acc-chk-01',
        description: 'Client Direct Deposit - Vance Studios LLC',
        merchant: 'Client Wire Deposit',
        amount: 6200.00,
        category: 'Income',
        date: 'Sep 25, 2026',
        timestamp: Date.now() - 250000000,
        status: 'completed'
      },
      {
        id: 'tx-1045',
        accountId: 'acc-chk-01',
        description: 'Expedited Outgoing Wire Fee (Eligible for Customer Loyalty Waiver)',
        merchant: 'AVA Banking Service Fee',
        amount: 35.00,
        category: 'Fee',
        date: 'Sep 24, 2026',
        timestamp: Date.now() - 320000000,
        status: 'completed',
        disputeNotes: 'Eligible for instant 1-click loyalty fee waiver'
      }
    ],
    loans: [
      {
        id: 'loan-auto-01',
        title: 'Premier Hybrid/EV Auto Loan',
        type: 'auto',
        maxAmount: 35000,
        approvedAmount: 35000,
        interestRate: 5.89,
        termMonths: [36, 48, 60],
        status: 'pre_approved',
        description: 'Pre-approved rate locked for Elena. Zero origination fee and instant disbursement.',
        monthlyEstimate: 674.20
      },
      {
        id: 'loan-home-01',
        title: 'AVA Home Improvement Line',
        type: 'home_equity',
        maxAmount: 50000,
        interestRate: 6.95,
        termMonths: [60, 120],
        status: 'pre_approved',
        description: 'Flexible revolving credit line against primary residence equity.',
        monthlyEstimate: 579.00
      }
    ],
    memoryLog: [
      {
        id: 'mem-001',
        timestamp: 'Yesterday, 3:28 PM',
        dateStr: '2026-09-27',
        category: 'complaint',
        title: 'Call Dropped: Disputed $124.50 Streamify charge',
        summary: 'Elena called in extreme distress regarding an unauthorized $124.50 debit from Streamify Premium. The call was routed to IVR, transferred twice, and disconnected on hold after 14 minutes. Customer expressed extreme irritation at repeating her verification questions.',
        sentiment: 'frustrated',
        keyEntities: ['Streamify Premium', '$124.50', 'Sapphire Card ...8821', 'Dropped call'],
        resolved: false,
        agentNotes: 'DO NOT ask Elena to re-tell her story. Immediately acknowledge the $124.50 charge, offer instant provisional credit, and confirm merchant block.'
      },
      {
        id: 'mem-002',
        timestamp: 'Sep 22, 2026, 11:15 AM',
        dateStr: '2026-09-22',
        category: 'preference',
        title: 'Auto Loan Inquiry & Rate Match Request',
        summary: 'Elena browsed the 5.89% EV auto loan rate for a new Polestar 3. She prefers a 48-month term and asked if the pre-approved rate would hold until November.',
        sentiment: 'neutral',
        keyEntities: ['EV Auto Loan', '5.89% APR', 'Polestar 3', '48 months'],
        resolved: true,
        agentNotes: 'Rate is guaranteed through Dec 31, 2026. Can be approved in-call instantly.'
      },
      {
        id: 'mem-003',
        timestamp: 'Sep 10, 2026, 2:40 PM',
        dateStr: '2026-09-10',
        category: 'life_event',
        title: 'Upcoming Travel to Japan in October',
        summary: 'Elena confirmed travel itinerary to Kyoto and Tokyo from Oct 15 - Oct 28. Card whitelist was placed for her Sapphire Reserve.',
        sentiment: 'delighted',
        keyEntities: ['Travel Notice', 'Japan', 'Sapphire Reserve'],
        resolved: true,
        agentNotes: 'Zero foreign transaction fee confirmed on all spending.'
      },
      {
        id: 'mem-004',
        timestamp: 'Aug 14, 2026',
        dateStr: '2026-08-14',
        category: 'preference',
        title: 'Communication Preference Recorded',
        summary: 'Customer explicitly noted: "Please send text receipts for all card actions, and never send promotional mail to my home address."',
        sentiment: 'neutral',
        keyEntities: ['SMS Notification Preference', 'Paperless'],
        resolved: true
      }
    ]
  },
  {
    id: 'cust-marcus-chen',
    name: 'Marcus Chen',
    email: 'marcus@hypernode.cloud',
    phone: '+1 (206) 555-0199',
    tier: 'Commercial Executive',
    memberSince: 'January 2021',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    creditScore: 810,
    unresolvedIssuePrompt: 'Marcus tried to send a $12,500 vendor wire to CloudTech Frankfurt yesterday, but it was held for 2FA review, and his card was temporarily flagged during a Berlin airport layover.',
    accounts: [
      {
        id: 'acc-chk-02',
        name: 'Executive Commercial Checking',
        type: 'checking',
        accountNumber: '•••• 7712',
        balance: 84200.00,
        availableBalance: 84200.00,
        currency: 'USD'
      },
      {
        id: 'acc-sav-02',
        name: 'Treasury Yield Account',
        type: 'savings',
        accountNumber: '•••• 3301',
        balance: 165000.00,
        availableBalance: 165000.00,
        apy: 5.12,
        currency: 'USD'
      }
    ],
    cards: [
      {
        id: 'card-titanium-02',
        name: 'AVA Titanium Commercial',
        type: 'credit',
        cardholder: 'MARCUS CHEN',
        lastFour: '3391',
        expiry: '11/28',
        cvv: '902',
        brand: 'mastercard',
        status: 'locked',
        creditLimit: 50000,
        currentBalance: 7890.40,
        cashbackRate: '2.5% Unlimited Cash Back',
        colorScheme: 'emerald',
        travelNotices: []
      }
    ],
    transactions: [
      {
        id: 'tx-2001',
        accountId: 'acc-chk-02',
        description: 'Vendor Outgoing Wire - CloudTech Frankfurt (Pending Review)',
        merchant: 'CloudTech Infrastructure GmbH',
        amount: 12500.00,
        category: 'Transfer',
        date: 'Today, 8:40 AM',
        timestamp: Date.now() - 14400000,
        status: 'flagged',
        flaggedReason: 'Wire pending manual verification over threshold'
      },
      {
        id: 'tx-2002',
        accountId: 'acc-chk-02',
        cardId: 'card-titanium-02',
        description: 'Lufthansa Executive Lounge - Berlin Airport',
        merchant: 'Lufthansa AG',
        amount: 85.00,
        category: 'Travel',
        date: 'Yesterday, 10:20 PM',
        timestamp: Date.now() - 43200000,
        status: 'completed'
      }
    ],
    loans: [
      {
        id: 'loan-comm-01',
        title: 'Commercial SaaS Expansion Line',
        type: 'personal',
        maxAmount: 100000,
        interestRate: 6.25,
        termMonths: [24, 36, 48],
        status: 'pre_approved',
        description: 'Working capital line for growing cloud infrastructure companies.',
        monthlyEstimate: 3050.00
      }
    ],
    memoryLog: [
      {
        id: 'mem-101',
        timestamp: 'Today, 9:02 AM',
        dateStr: '2026-09-28',
        category: 'complaint',
        title: 'Wire Verification Hold ($12,500) & Berlin Travel Flag',
        summary: 'Marcus Chen initiated a $12,500 vendor payment that triggered automated fraud hold. Furthermore, his Titanium card was auto-locked when an expense occurred in Berlin without prior travel notice.',
        sentiment: 'frustrated',
        keyEntities: ['$12,500 Wire', 'CloudTech Frankfurt', 'Berlin layover', 'Card Locked'],
        resolved: false,
        agentNotes: 'Verify Berlin layover, unlock Titanium card immediately, and approve the wire release without making Marcus repeat his security tokens.'
      }
    ]
  }
];

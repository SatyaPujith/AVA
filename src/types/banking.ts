export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment';
  accountNumber: string;
  balance: number;
  availableBalance: number;
  apy?: number;
  currency: string;
}

export interface BankCard {
  id: string;
  name: string;
  type: 'credit' | 'debit';
  cardholder: string;
  lastFour: string;
  expiry: string;
  cvv: string;
  brand: 'visa' | 'mastercard' | 'amex';
  status: 'active' | 'locked' | 'replaced';
  creditLimit?: number;
  currentBalance?: number;
  cashbackRate?: string;
  colorScheme: 'sapphire' | 'platinum' | 'gold' | 'emerald';
  travelNotices: {
    destination: string;
    startDate: string;
    endDate: string;
  }[];
}

export interface Transaction {
  id: string;
  accountId: string;
  cardId?: string;
  description: string;
  merchant: string;
  amount: number;
  category: 'Subscription' | 'Groceries' | 'Dining' | 'Travel' | 'Fee' | 'Income' | 'Utilities' | 'Transfer';
  date: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'flagged' | 'disputed' | 'provisional_credit' | 'refunded';
  isRecurring?: boolean;
  flaggedReason?: string;
  disputeNotes?: string;
}

export interface LoanOffer {
  id: string;
  title: string;
  type: 'auto' | 'personal' | 'mortgage' | 'home_equity';
  maxAmount: number;
  approvedAmount?: number;
  interestRate: number; // e.g. 5.89
  termMonths: number[];
  status: 'pre_approved' | 'in_review' | 'approved' | 'active';
  description: string;
  monthlyEstimate?: number;
}

export interface MemoryEntry {
  id: string;
  timestamp: string;
  dateStr: string;
  category: 'call_summary' | 'complaint' | 'preference' | 'action_taken' | 'life_event';
  title: string;
  summary: string;
  sentiment: 'frustrated' | 'neutral' | 'satisfied' | 'delighted';
  keyEntities: string[];
  resolved: boolean;
  agentNotes?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'Premier Private' | 'Commercial Executive' | 'Select Member';
  memberSince: string;
  avatarUrl: string;
  creditScore: number;
  accounts: BankAccount[];
  cards: BankCard[];
  transactions: Transaction[];
  loans: LoanOffer[];
  memoryLog: MemoryEntry[];
  unresolvedIssuePrompt: string; // The primary pain point customer was dealing with
}

export interface CallMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  memoryReferenced?: string;
  actionTaken?: {
    type: string;
    description: string;
    success: boolean;
  };
}

export interface VoiceCallAction {
  type:
    | 'lock_unlock_card'
    | 'lock_card'
    | 'unlock_card'
    | 'dispute_transaction'
    | 'evaluate_or_approve_loan'
    | 'apply_loan'
    | 'set_travel_notice'
    | 'waive_fee'
    | 'transfer_funds'
    | 'record_customer_memory'
    | 'record_memory'
    | string;
  payload: Record<string, any>;
  description: string;
  timestamp: string;
}

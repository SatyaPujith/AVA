/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomerProfile, VoiceCallAction, CallMessage, MemoryEntry } from './types/banking';
import { INITIAL_CUSTOMERS } from './data/mockCustomers';
import { Header } from './components/Header';
import { AccountOverview } from './components/AccountOverview';
import { CardsView } from './components/CardsView';
import { TransactionsView } from './components/TransactionsView';
import { LoansView } from './components/LoansView';
import { MemoryTimelineView } from './components/MemoryTimelineView';
import { VoiceCallModal } from './components/VoiceCallAgent/VoiceCallModal';
import { VoiceCallPill } from './components/VoiceCallAgent/VoiceCallPill';
import { PostCallSummaryModal } from './components/VoiceCallAgent/PostCallSummaryModal';

export default function App() {
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [currentCustomerId, setCurrentCustomerId] = useState<string>(INITIAL_CUSTOMERS[0].id);
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'transactions' | 'loans' | 'memory'>(
    'overview'
  );

  // Voice Call State
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callTopic, setCallTopic] = useState<string | undefined>(undefined);
  const [postCallSummary, setPostCallSummary] = useState<any | null>(null);
  const [postCallActions, setPostCallActions] = useState<any[]>([]);

  const currentCustomer =
    customers.find((c) => c.id === currentCustomerId) || customers[0];

  // Live action execution by Voice AI Agent or direct UI action
  const handleExecuteAction = (action: VoiceCallAction) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((cust) => {
        if (cust.id !== currentCustomer.id) return cust;

        const updatedCust = { ...cust };

        if (action.type === 'lock_unlock_card') {
          const cardId = action.payload.cardId;
          const shouldLock = Boolean(action.payload.lock);

          updatedCust.cards = updatedCust.cards.map((card) => {
            if (card.id === cardId || updatedCust.cards.length === 1) {
              return { ...card, status: shouldLock ? 'locked' : 'active' };
            }
            return card;
          });
        } else if (action.type === 'dispute_transaction') {
          const txId = action.payload.transactionId;
          let disputedAmount = 0;

          updatedCust.transactions = updatedCust.transactions.map((tx) => {
            if (tx.id === txId || tx.status === 'flagged') {
              disputedAmount = tx.amount;
              return {
                ...tx,
                status: 'provisional_credit',
                disputeNotes: action.payload.disputeReason || 'Disputed via Voice AI Call',
              };
            }
            return tx;
          });

          // Issue provisional credit balance to checking account!
          if (disputedAmount > 0 && updatedCust.accounts[0]) {
            updatedCust.accounts = [
              {
                ...updatedCust.accounts[0],
                balance: updatedCust.accounts[0].balance + disputedAmount,
                availableBalance: updatedCust.accounts[0].availableBalance + disputedAmount,
              },
              ...updatedCust.accounts.slice(1),
            ];
          }

          // Mark unresolved memory as resolved
          updatedCust.memoryLog = updatedCust.memoryLog.map((mem) => {
            if (!mem.resolved) {
              return { ...mem, resolved: true };
            }
            return mem;
          });
        } else if (action.type === 'evaluate_or_approve_loan') {
          const loanId = action.payload.loanId;
          const requestedAmount = action.payload.requestedAmount;

          updatedCust.loans = updatedCust.loans.map((l) => {
            if (l.id === loanId || updatedCust.loans.length === 1) {
              return {
                ...l,
                status: 'approved',
                approvedAmount: requestedAmount || l.maxAmount,
              };
            }
            return l;
          });
        } else if (action.type === 'set_travel_notice') {
          const cardId = action.payload.cardId;
          const newNotice = {
            destination: action.payload.destination,
            startDate: action.payload.startDate,
            endDate: action.payload.endDate,
          };

          updatedCust.cards = updatedCust.cards.map((card) => {
            if (card.id === cardId || card.status === 'active') {
              return {
                ...card,
                travelNotices: [...card.travelNotices, newNotice],
              };
            }
            return card;
          });
        } else if (action.type === 'waive_fee') {
          const txId = action.payload.transactionId;
          const feeAmount = action.payload.amount || 35.0;

          updatedCust.transactions = updatedCust.transactions.map((tx) => {
            if (tx.id === txId || tx.category === 'Fee') {
              return {
                ...tx,
                status: 'refunded',
                disputeNotes: 'Waived as customer loyalty courtesy by Voice AI',
              };
            }
            return tx;
          });

          // Refund fee into primary checking
          if (updatedCust.accounts[0]) {
            updatedCust.accounts = [
              {
                ...updatedCust.accounts[0],
                balance: updatedCust.accounts[0].balance + feeAmount,
                availableBalance: updatedCust.accounts[0].availableBalance + feeAmount,
              },
              ...updatedCust.accounts.slice(1),
            ];
          }
        } else if (action.type === 'record_customer_memory') {
          const newEntry: MemoryEntry = {
            id: `mem-${Date.now()}`,
            timestamp: 'Just now',
            dateStr: new Date().toISOString().split('T')[0],
            category: action.payload.category || 'preference',
            title: action.payload.title,
            summary: action.payload.summary,
            sentiment: 'delighted',
            keyEntities: ['Voice Call Action', 'Automated Record'],
            resolved: Boolean(action.payload.resolved),
          };
          
          fetch(`/api/memory/${cust.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memory: newEntry })
          }).catch(e => console.error(e));

          updatedCust.memoryLog = [newEntry, ...updatedCust.memoryLog];
        }

        return updatedCust;
      })
    );
  };

  const handleStartCall = (topic?: string) => {
    setCallTopic(topic);
    setIsCallActive(true);
  };

  const handleEndCall = async (transcript: CallMessage[], actionsTaken: VoiceCallAction[]) => {
    setIsCallActive(false);

    try {
      const response = await fetch('/api/call/end-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: currentCustomer,
          callTranscript: transcript,
          actionsTaken,
        }),
      });

      const summaryData = await response.json();
      setPostCallSummary(summaryData);
      setPostCallActions(actionsTaken);

      // Append new memory record permanently to customer profile
      const newMemory: MemoryEntry = {
        id: `mem-call-${Date.now()}`,
        timestamp: 'Just now (Support Call)',
        dateStr: new Date().toISOString().split('T')[0],
        category: 'call_summary',
        title: summaryData.title || 'Voice Support Call Resolved',
        summary: summaryData.summary || 'Aura AI resolved issues with zero story repetition.',
        sentiment: (summaryData.sentiment as any) || 'delighted',
        keyEntities: summaryData.keyEntities || ['Voice Support', 'Resolved'],
        resolved: true,
      };

      fetch(`/api/memory/${currentCustomer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memory: newMemory })
      }).catch(e => console.error(e));

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === currentCustomer.id
            ? { ...c, memoryLog: [newMemory, ...c.memoryLog] }
            : c
        )
      );
    } catch (e) {
      console.warn('Error ending call summary:', e);
    }
  };

  const handleToggleCardLock = (cardId: string) => {
    const card = currentCustomer.cards.find((c) => c.id === cardId);
    if (!card) return;
    handleExecuteAction({
      type: 'lock_unlock_card',
      payload: { cardId, lock: card.status !== 'locked' },
      description: card.status === 'locked' ? 'Unlocked Card' : 'Locked Card',
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // Fetch memory log from Hindsight DB backend on customer change
  React.useEffect(() => {
    fetch(`/api/memory/${currentCustomerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.memoryLog) {
          setCustomers(prev => prev.map(c => 
            c.id === currentCustomerId ? { ...c, memoryLog: data.memoryLog } : c
          ));
        }
      })
      .catch(err => console.error('Error fetching memory from hindsight db:', err));
  }, [currentCustomerId]);

  const saveMemoryToDB = async (memoryEntry: MemoryEntry) => {
    try {
      await fetch(`/api/memory/${currentCustomerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memory: memoryEntry })
      });
    } catch (e) {
      console.error('Failed to save memory to db:', e);
    }
  };

  const handleAddCustomMemory = (memoryData: Partial<MemoryEntry>) => {
    const newEntry: MemoryEntry = {
      id: `mem-custom-${Date.now()}`,
      timestamp: memoryData.timestamp || 'Just now',
      dateStr: memoryData.dateStr || new Date().toISOString().split('T')[0],
      category: memoryData.category || 'preference',
      title: memoryData.title || 'Custom Note',
      summary: memoryData.summary || '',
      sentiment: memoryData.sentiment || 'neutral',
      keyEntities: memoryData.keyEntities || ['Manual Entry'],
      resolved: memoryData.resolved ?? true,
    };

    saveMemoryToDB(newEntry);

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === currentCustomer.id
          ? { ...c, memoryLog: [newEntry, ...c.memoryLog] }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white pb-28">
      {/* Header */}
      <Header
        currentCustomer={currentCustomer}
        allCustomers={customers}
        onSelectCustomer={(cust) => setCurrentCustomerId(cust.id)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onStartCall={() => handleStartCall()}
        isCallActive={isCallActive}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <AccountOverview
            customer={currentCustomer}
            onStartCall={handleStartCall}
            onSelectTab={setActiveTab}
            onQuickLockToggle={handleToggleCardLock}
          />
        )}

        {activeTab === 'cards' && (
          <CardsView
            customer={currentCustomer}
            onToggleLockCard={handleToggleCardLock}
            onStartCall={handleStartCall}
            onAddTravelNotice={(cardId, dest, start, end) =>
              handleExecuteAction({
                type: 'set_travel_notice',
                payload: { cardId, destination: dest, startDate: start, endDate: end },
                description: `Registered travel notice for ${dest}`,
                timestamp: new Date().toLocaleTimeString(),
              })
            }
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            customer={currentCustomer}
            onStartCall={handleStartCall}
            onDisputeDirect={(txId, reason) =>
              handleExecuteAction({
                type: 'dispute_transaction',
                payload: { transactionId: txId, disputeReason: reason, issueProvisionalCredit: true },
                description: `Disputed transaction ${txId}`,
                timestamp: new Date().toLocaleTimeString(),
              })
            }
            onWaiveFeeDirect={(txId) =>
              handleExecuteAction({
                type: 'waive_fee',
                payload: { transactionId: txId, amount: 35.0, reason: 'Premier loyalty fee waiver' },
                description: `Waived fee for ${txId}`,
                timestamp: new Date().toLocaleTimeString(),
              })
            }
          />
        )}

        {activeTab === 'loans' && (
          <LoansView
            customer={currentCustomer}
            onStartCall={handleStartCall}
            onApproveLoanDirect={(loanId, amount, term) =>
              handleExecuteAction({
                type: 'evaluate_or_approve_loan',
                payload: { loanId, requestedAmount: amount, termMonths: term },
                description: `Approved loan ${loanId} for $${amount}`,
                timestamp: new Date().toLocaleTimeString(),
              })
            }
          />
        )}

        {activeTab === 'memory' && (
          <MemoryTimelineView
            customer={currentCustomer}
            onStartCall={handleStartCall}
            onAddCustomMemory={handleAddCustomMemory}
          />
        )}
      </main>

      {/* Floating Bottom-Right Voice Call Widget */}
      <VoiceCallPill
        customer={currentCustomer}
        onStartCall={handleStartCall}
        isCallActive={isCallActive}
      />

      {/* Full-Screen / Minimized Interactive Voice Call Agent HUD */}
      <VoiceCallModal
        isOpen={isCallActive}
        onClose={handleEndCall}
        customer={currentCustomer}
        onExecuteAction={handleExecuteAction}
        initialTopic={callTopic}
      />

      {/* Post-Call Zero-Repetition Resolution Celebration Modal */}
      {postCallSummary && (
        <PostCallSummaryModal
          isOpen={Boolean(postCallSummary)}
          onClose={() => setPostCallSummary(null)}
          customer={currentCustomer}
          summaryData={postCallSummary}
          actionsTaken={postCallActions}
        />
      )}
    </div>
  );
}

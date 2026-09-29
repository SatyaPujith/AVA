import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { CustomerProfile } from '../types/banking';

interface TransactionsViewProps {
  customer: CustomerProfile;
  onStartCall: (topic?: string) => void;
  onDisputeDirect: (txId: string, reason: string) => void;
  onWaiveFeeDirect: (txId: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  customer,
  onStartCall,
  onDisputeDirect,
  onWaiveFeeDirect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'flagged' | 'subscriptions' | 'fees'>('all');

  const filteredTransactions = customer.transactions.filter((tx) => {
    const matchesSearch =
      tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory === 'flagged') {
      return tx.status === 'flagged' || tx.status === 'disputed' || tx.status === 'provisional_credit';
    }
    if (filterCategory === 'subscriptions') {
      return tx.category === 'Subscription' || tx.isRecurring;
    }
    if (filterCategory === 'fees') {
      return tx.category === 'Fee';
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Transactions & Disputes</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time ledger with zero-repetition AI dispute resolution & provisional credit.
          </p>
        </div>
        <button
          onClick={() => onStartCall('Dispute transactions & billing discrepancies')}
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call Voice Banker for Dispute</span>
        </button>
      </div>

      {/* Filter and Search Controls (No boxed container, clean inline strip) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchant, description, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-zinc-900 text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterCategory('flagged')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterCategory === 'flagged'
                ? 'bg-zinc-900 text-white font-semibold'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Flagged & Disputes
          </button>
          <button
            onClick={() => setFilterCategory('subscriptions')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterCategory === 'subscriptions'
                ? 'bg-zinc-900 text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Recurring
          </button>
          <button
            onClick={() => setFilterCategory('fees')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterCategory === 'fees'
                ? 'bg-zinc-900 text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Fees
          </button>
        </div>
      </div>

      {/* Seamless Transaction Table / Feed (No chunky card enclosures) */}
      <div className="divide-y divide-zinc-100 border-t border-b border-zinc-100">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No transactions match your search filter.
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-zinc-50/50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 shrink-0 mt-0.5">
                  {tx.category === 'Income' ? (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-950">{tx.merchant}</span>
                    {tx.status === 'flagged' && (
                      <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                        Flagged
                      </span>
                    )}
                    {tx.status === 'disputed' && (
                      <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded">
                        Dispute Active
                      </span>
                    )}
                    {tx.status === 'provisional_credit' && (
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Provisional Credit Issued
                      </span>
                    )}
                    {tx.status === 'refunded' && (
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                        Fee Waived & Refunded
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{tx.description}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    <span>{tx.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{tx.category}</span>
                    {tx.isRecurring && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-zinc-600 font-medium">Recurring</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pl-11 md:pl-0 shrink-0">
                <div className="text-right">
                  <span
                    className={`text-sm font-semibold font-mono tabular-nums ${
                      tx.category === 'Income' || tx.status === 'provisional_credit'
                        ? 'text-emerald-600'
                        : 'text-zinc-950'
                    }`}
                  >
                    {tx.category === 'Income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </span>
                  <p className="text-[11px] text-zinc-400 capitalize">{tx.status.replace(/_/g, ' ')}</p>
                </div>

                {/* Dispute actions */}
                {tx.status === 'flagged' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onStartCall(`I want to dispute the ${tx.merchant} charge for $${tx.amount}`)
                      }
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Dispute on Call</span>
                    </button>
                    <button
                      onClick={() => onDisputeDirect(tx.id, 'Customer flagged unrecognized charge')}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium cursor-pointer"
                    >
                      1-Click Dispute
                    </button>
                  </div>
                )}

                {tx.category === 'Fee' && tx.status !== 'refunded' && (
                  <button
                    onClick={() => onWaiveFeeDirect(tx.id)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium cursor-pointer"
                  >
                    Request Waiver
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

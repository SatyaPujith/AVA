import React from 'react';
import {
  PhoneCall,
  Lock,
  Unlock,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import { CustomerProfile } from '../types/banking';

interface AccountOverviewProps {
  customer: CustomerProfile;
  onStartCall: (topic?: string) => void;
  onSelectTab: (tab: 'overview' | 'cards' | 'transactions' | 'loans' | 'memory') => void;
  onQuickLockToggle: (cardId: string) => void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  customer,
  onStartCall,
  onSelectTab,
  onQuickLockToggle,
}) => {
  const totalBalance = customer.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const primaryCard = customer.cards[0];
  const unresolvedMemory = customer.memoryLog.find((m) => !m.resolved);

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-2">
      {/* Top Open Hero: Balance and Member Context (No bulky card containers) */}
      <div className="pt-2 pb-6 border-b border-zinc-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <span className="font-medium text-zinc-900">{customer.name}</span>
              <span aria-hidden="true">·</span>
              <span>{customer.tier}</span>
              <span aria-hidden="true">·</span>
              <span>Member since {customer.memberSince}</span>
            </div>

            <p className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Total Balance</p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-950 font-mono tabular-nums mt-1">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>

            {/* Quiet account breakdown inline */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-500 mt-3 font-mono">
              {customer.accounts.map((acc) => (
                <div key={acc.id} className="flex items-center gap-1.5">
                  <span className="font-sans text-zinc-600 font-medium">{acc.name}:</span>
                  <span className="text-zinc-950 font-medium">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  {acc.apy && <span className="font-sans text-emerald-700 font-medium">({acc.apy}% APY)</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Voice Call & Memory Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onStartCall()}
              className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Voice Banker</span>
            </button>
            <button
              onClick={() => onSelectTab('memory')}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5 text-blue-600" />
              <span>View Memory</span>
            </button>
          </div>
        </div>

        {/* Unresolved Incident Banner (Quiet, clean callout without nested containers) */}
        {unresolvedMemory && (
          <div className="mt-8 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">
                  Unresolved Prior Interaction: {unresolvedMemory.title}
                </p>
                <p className="text-amber-800/90 mt-0.5 leading-relaxed">
                  {unresolvedMemory.summary}
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  AVA has your full incident record loaded. If you call, you won&apos;t have to repeat your story.
                </p>
              </div>
            </div>

            <button
              onClick={() => onStartCall(`Resolve ${unresolvedMemory.title}`)}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Resolve via Voice Call</span>
            </button>
          </div>
        )}
      </div>

      {/* Two-Column Open Flow (No boxed containers): Left is Activity & Card, Right is Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left 7 Columns: Transactions Feed & Quick Card Bar */}
        <div className="lg:col-span-7 space-y-10">
          {/* Quick Card Status Strip */}
          {primaryCard && (
            <div className="pb-8 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Primary Card</span>
                <button
                  onClick={() => onSelectTab('cards')}
                  className="text-xs text-zinc-600 hover:text-zinc-950 font-medium flex items-center gap-1 cursor-pointer"
                >
                  Manage cards <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-6 rounded bg-zinc-900 text-white flex items-center justify-center text-[10px] font-mono font-bold tracking-wider">
                    {primaryCard.brand.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{primaryCard.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Ending in {primaryCard.lastFour} · Limit ${primaryCard.creditLimit?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    primaryCard.status === 'locked' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {primaryCard.status === 'locked' ? 'Locked' : 'Active'}
                  </span>

                  <button
                    onClick={() => onQuickLockToggle(primaryCard.id)}
                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                    title={primaryCard.status === 'locked' ? 'Unlock Card' : 'Lock Card'}
                  >
                    {primaryCard.status === 'locked' ? (
                      <Unlock className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Seamless Activity Feed (Clean rows, no heavy containers) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-zinc-950">Recent Transactions</h2>
                <p className="text-xs text-zinc-500">All activity monitored with continuous AI dispute protection</p>
              </div>
              <button
                onClick={() => onSelectTab('transactions')}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-medium flex items-center gap-1 cursor-pointer"
              >
                All transactions <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-zinc-100">
              {customer.transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-zinc-50/50 px-1 rounded-lg"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 truncate">{tx.merchant}</p>
                      {tx.status === 'flagged' && (
                        <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                          Flagged
                        </span>
                      )}
                      {tx.status === 'disputed' && (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                          Disputed
                        </span>
                      )}
                      {tx.status === 'provisional_credit' && (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          Provisional Credit Issued
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span>{tx.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tx.category}</span>
                      {tx.isRecurring && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-zinc-500">Recurring</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm font-semibold font-mono tabular-nums ${
                        tx.category === 'Income' || tx.status === 'provisional_credit'
                          ? 'text-emerald-600'
                          : 'text-zinc-900'
                      }`}
                    >
                      {tx.category === 'Income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>

                    {tx.status === 'flagged' && (
                      <button
                        onClick={() => onStartCall(`Dispute transaction ${tx.id} for $${tx.amount}`)}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer transition-colors"
                      >
                        Dispute on Call
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Persistent Customer Memory Stream (Clean, open typography) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-zinc-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-semibold text-zinc-950">AVA Memory Ledger</h2>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {customer.memoryLog.length} stored records
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Every detail from prior calls and preferences is recorded so you never have to repeat your story.
            </p>
          </div>

          <div className="space-y-5">
            {customer.memoryLog.slice(0, 3).map((mem) => (
              <div key={mem.id} className="text-xs space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="font-semibold text-zinc-900 text-xs">{mem.title}</span>
                  <span className="font-mono text-[11px]">{mem.timestamp}</span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[13px]">{mem.summary}</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-0.5">
                  <span className={mem.resolved ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                    {mem.resolved ? '✓ Resolved' : '● Needs Resolution'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-500">{mem.keyEntities.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectTab('memory')}
            className="w-full py-2 text-center text-xs font-medium text-zinc-600 hover:text-zinc-950 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            Open Full Customer Memory Timeline
          </button>

          {/* Quick Lending Insight */}
          {customer.loans[0] && (
            <div className="pt-6 border-t border-zinc-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 uppercase tracking-wider font-medium text-[11px]">Pre-Approved Credit</span>
                <span className="text-zinc-900 font-mono font-semibold">{customer.loans[0].interestRate}% APR</span>
              </div>
              <p className="text-sm font-semibold text-zinc-900">{customer.loans[0].title}</p>
              <p className="text-zinc-500 leading-relaxed">
                Pre-qualified up to ${customer.loans[0].maxAmount.toLocaleString()} with instant verbal rate lock during any voice call.
              </p>
              <button
                onClick={() => onStartCall(`Inquire and apply for ${customer.loans[0].title}`)}
                className="text-xs font-semibold text-zinc-900 hover:underline cursor-pointer flex items-center gap-1 pt-1"
              >
                Discuss Loan with Voice Agent <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

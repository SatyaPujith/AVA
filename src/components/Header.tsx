import React from 'react';
import { PhoneCall, ShieldCheck, Brain } from 'lucide-react';
import { CustomerProfile } from '../types/banking';

interface HeaderProps {
  currentCustomer: CustomerProfile;
  allCustomers: CustomerProfile[];
  onSelectCustomer: (customer: CustomerProfile) => void;
  activeTab: 'overview' | 'cards' | 'transactions' | 'loans' | 'memory';
  onSelectTab: (tab: 'overview' | 'cards' | 'transactions' | 'loans' | 'memory') => void;
  onStartCall: () => void;
  isCallActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentCustomer,
  allCustomers,
  onSelectCustomer,
  activeTab,
  onSelectTab,
  onStartCall,
  isCallActive,
}) => {
  const unresolvedCount = currentCustomer.memoryLog.filter((m) => !m.resolved).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      {/* Top quiet trust & profile switch strip */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between text-xs text-zinc-500 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-zinc-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Aura Private Banking
          </span>
          <span aria-hidden="true" className="text-zinc-300">·</span>
          <span className="flex items-center gap-1 text-zinc-600">
            <Brain className="w-3.5 h-3.5 text-blue-600" />
            Zero-Repetition Customer Memory Active
          </span>
        </div>

        {/* Customer switch tabs (segmented control) */}
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs">
          <span className="text-zinc-400 px-2 py-0.5 text-[11px] hidden sm:inline">Profile:</span>
          {allCustomers.map((cust) => {
            const hasIssue = cust.memoryLog.some((m) => !m.resolved);
            return (
              <button
                key={cust.id}
                onClick={() => onSelectCustomer(cust)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentCustomer.id === cust.id
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>{cust.name}</span>
                {hasIssue && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Active unresolved incident" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Top Bar: Zone 1 Wordmark, Zone 2 Navigation, Zone 3 Action */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a href="#" onClick={(e) => { e.preventDefault(); onSelectTab('overview'); }} className="text-lg font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-black tracking-normal">
              A
            </span>
            <span>Aura</span>
          </a>
          <span className="text-xs text-zinc-400 hidden md:inline">Private Banking & Memory</span>
        </div>

        {/* Zone 2: Navigation Links (Clean text with hover indicators) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('overview')}
            className={`transition-colors pb-0.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('cards')}
            className={`transition-colors pb-0.5 cursor-pointer ${
              activeTab === 'cards'
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`transition-colors pb-0.5 cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => onSelectTab('loans')}
            className={`transition-colors pb-0.5 cursor-pointer ${
              activeTab === 'loans'
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Loans
          </button>
          <button
            onClick={() => onSelectTab('memory')}
            className={`transition-colors pb-0.5 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <span>Customer Memory</span>
            {unresolvedCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onStartCall}
            disabled={isCallActive}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Voice Banker</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-zinc-100 text-xs overflow-x-auto gap-4">
        <button
          onClick={() => onSelectTab('overview')}
          className={`whitespace-nowrap ${activeTab === 'overview' ? 'font-bold text-zinc-950' : 'text-zinc-500'}`}
        >
          Overview
        </button>
        <button
          onClick={() => onSelectTab('cards')}
          className={`whitespace-nowrap ${activeTab === 'cards' ? 'font-bold text-zinc-950' : 'text-zinc-500'}`}
        >
          Cards
        </button>
        <button
          onClick={() => onSelectTab('transactions')}
          className={`whitespace-nowrap ${activeTab === 'transactions' ? 'font-bold text-zinc-950' : 'text-zinc-500'}`}
        >
          Transactions
        </button>
        <button
          onClick={() => onSelectTab('loans')}
          className={`whitespace-nowrap ${activeTab === 'loans' ? 'font-bold text-zinc-950' : 'text-zinc-500'}`}
        >
          Loans
        </button>
        <button
          onClick={() => onSelectTab('memory')}
          className={`whitespace-nowrap ${activeTab === 'memory' ? 'font-bold text-zinc-950' : 'text-zinc-500'}`}
        >
          Memory ({currentCustomer.memoryLog.length})
        </button>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  Brain,
  PhoneCall,
  Plus,
} from 'lucide-react';
import { CustomerProfile, MemoryEntry } from '../types/banking';

interface MemoryTimelineViewProps {
  customer: CustomerProfile;
  onStartCall: (topic?: string) => void;
  onAddCustomMemory: (memory: Partial<MemoryEntry>) => void;
}

export const MemoryTimelineView: React.FC<MemoryTimelineViewProps> = ({
  customer,
  onStartCall,
  onAddCustomMemory,
}) => {
  const [filterCat, setFilterCat] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [summaryInput, setSummaryInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<
    'call_summary' | 'complaint' | 'preference' | 'action_taken' | 'life_event'
  >('preference');

  const filteredMemories = customer.memoryLog.filter((m) => {
    if (filterCat === 'all') return true;
    if (filterCat === 'unresolved') return !m.resolved;
    return m.category === filterCat;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !summaryInput.trim()) return;

    onAddCustomMemory({
      title: titleInput,
      summary: summaryInput,
      category: categoryInput,
      timestamp: 'Just now',
      dateStr: new Date().toISOString().split('T')[0],
      sentiment: 'neutral',
      keyEntities: [categoryInput, 'User Added'],
      resolved: true,
    });

    setTitleInput('');
    setSummaryInput('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Customer Memory Ledger</h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            Nothing angers a customer more than repeating their story. Aura indexes all past calls, dropped connections, and preferences into this persistent memory graph.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onStartCall('Test customer memory recall')}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Test Memory on Call</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (Segmented Control) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 text-xs border-b border-zinc-100">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filterCat === 'all'
              ? 'bg-zinc-900 text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          All Memories ({customer.memoryLog.length})
        </button>
        <button
          onClick={() => setFilterCat('unresolved')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filterCat === 'unresolved'
              ? 'bg-zinc-900 text-white font-semibold'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          Unresolved Incidents
        </button>
        <button
          onClick={() => setFilterCat('complaint')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filterCat === 'complaint'
              ? 'bg-zinc-900 text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          Complaints & Billing
        </button>
        <button
          onClick={() => setFilterCat('preference')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filterCat === 'preference'
              ? 'bg-zinc-900 text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => setFilterCat('life_event')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filterCat === 'life_event'
              ? 'bg-zinc-900 text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          Travel & Life Events
        </button>
      </div>

      {/* Clean Timeline Stream (Open list with hairline borders, no heavy containers) */}
      <div className="space-y-8 divide-y divide-zinc-100">
        {filteredMemories.map((mem) => (
          <div key={mem.id} className="pt-6 first:pt-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-950 text-sm">{mem.title}</span>
                <span className={`text-[11px] font-medium px-1.5 py-0.2 rounded ${
                  mem.resolved ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800 font-semibold'
                }`}>
                  {mem.resolved ? 'Resolved' : 'Needs Resolution'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span>{mem.timestamp}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{mem.sentiment}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed max-w-3xl">
              {mem.summary}
            </p>

            {mem.agentNotes && (
              <div className="text-xs text-zinc-600 bg-zinc-50 border-l-2 border-zinc-900 pl-3 py-1 mt-2">
                <strong className="text-zinc-900 font-medium">Aura Agent Rule:</strong> {mem.agentNotes}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span>Indexed entities:</span>
                <span className="font-mono text-zinc-700">{mem.keyEntities.join(' · ')}</span>
              </div>

              <button
                onClick={() => onStartCall(`Regarding the memory: ${mem.title}`)}
                className="font-medium text-zinc-900 hover:underline cursor-pointer flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call Aura About This</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-950 mb-1">Add Customer Memory Node</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Add a new fact or preference for {customer.name}. The AI voice agent will know it on the next phone call.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Memory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prefers SMS confirmations for all wire transactions"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Category</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value as any)}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="preference">Customer Preference</option>
                  <option value="complaint">Complaint / Billing Dispute</option>
                  <option value="call_summary">Call Summary</option>
                  <option value="life_event">Life Event</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Customer stated: never mail paper brochures; send verified push notifications instead."
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 cursor-pointer"
                >
                  Store Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

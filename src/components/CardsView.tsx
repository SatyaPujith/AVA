import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  Unlock,
  Plane,
  Eye,
  EyeOff,
  PhoneCall,
  Plus,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { CustomerProfile } from '../types/banking';

interface CardsViewProps {
  customer: CustomerProfile;
  onToggleLockCard: (cardId: string) => void;
  onStartCall: (topic?: string) => void;
  onAddTravelNotice: (cardId: string, destination: string, startDate: string, endDate: string) => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
  customer,
  onToggleLockCard,
  onStartCall,
  onAddTravelNotice,
}) => {
  const [selectedCardId, setSelectedCardId] = useState(customer.cards[0]?.id || '');
  const [showCvv, setShowCvv] = useState(false);
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [destInput, setDestInput] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  const selectedCard = customer.cards.find((c) => c.id === selectedCardId) || customer.cards[0];

  const handleTravelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destInput || !startDateInput || !endDateInput) return;
    onAddTravelNotice(selectedCard.id, destInput, startDateInput, endDateInput);
    setDestInput('');
    setStartDateInput('');
    setEndDateInput('');
    setShowTravelModal(false);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Cards & Protection</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Instant lock control, international travel whitelists, and live voice AI support.
          </p>
        </div>
        <button
          onClick={() => onStartCall(`Card emergency or lock status for ${selectedCard?.name}`)}
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call Voice Banker for Cards</span>
        </button>
      </div>

      {/* Card Selector Segmented Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
        {customer.cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCardId(card.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedCardId === card.id
                ? 'bg-zinc-900 text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            {card.name} (•••• {card.lastFour})
            {card.status === 'locked' && (
              <span className="ml-1.5 text-[10px] text-rose-300 font-bold">LOCKED</span>
            )}
          </button>
        ))}
      </div>

      {selectedCard && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Physical Card Representation (5 Cols) */}
          <div className="md:col-span-5 flex flex-col items-center sm:items-start">
            <div
              className={`relative w-full max-w-[360px] h-[220px] rounded-2xl p-6 shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden border ${
                selectedCard.status === 'locked'
                  ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  : 'bg-zinc-950 text-white border-zinc-900'
              }`}
            >
              {selectedCard.status === 'locked' && (
                <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center z-10">
                  <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
                    <Lock className="w-3.5 h-3.5" /> CARD LOCKED
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs tracking-wider">
                <span className="font-mono text-[11px] text-zinc-400">AURA PRIVATE</span>
                <span className="font-bold text-xs uppercase text-zinc-300">{selectedCard.brand}</span>
              </div>

              <div className="my-auto font-mono text-xl tracking-[0.22em] text-white">
                •••• •••• •••• {selectedCard.lastFour}
              </div>

              <div className="flex items-end justify-between text-xs font-mono">
                <div>
                  <p className="text-[9px] text-zinc-400 uppercase">Cardholder</p>
                  <p className="font-medium text-white">{selectedCard.cardholder}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-400 uppercase">Expires</p>
                  <p className="font-medium text-white">{selectedCard.expiry}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-400 uppercase">CVV</p>
                  <p className="font-medium text-white">{showCvv ? selectedCard.cvv : '•••'}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions below Card */}
            <div className="w-full max-w-[360px] mt-4 flex items-center gap-3">
              <button
                onClick={() => setShowCvv(!showCvv)}
                className="flex-1 py-2 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showCvv ? 'Hide CVV' : 'Show CVV'}</span>
              </button>

              <button
                onClick={() => onToggleLockCard(selectedCard.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  selectedCard.status === 'locked'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {selectedCard.status === 'locked' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" /> Unlock Card
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Lock Card
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card Limits & Details (7 Cols - No boxed containers, clean open lists) */}
          <div className="md:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Card Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs border-b border-zinc-100 pb-6">
                <div>
                  <p className="text-zinc-500">Status</p>
                  <p className={`font-semibold mt-1 capitalize ${selectedCard.status === 'locked' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedCard.status}
                  </p>
                </div>
                {selectedCard.creditLimit && (
                  <div>
                    <p className="text-zinc-500">Credit Limit</p>
                    <p className="font-semibold text-zinc-950 font-mono mt-1">
                      ${selectedCard.creditLimit.toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedCard.currentBalance !== undefined && (
                  <div>
                    <p className="text-zinc-500">Current Balance</p>
                    <p className="font-semibold text-zinc-950 font-mono mt-1">
                      ${selectedCard.currentBalance.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Travel Notices List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Travel Notices</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Whitelists cards abroad to prevent automated security declines</p>
                </div>
                <button
                  onClick={() => setShowTravelModal(true)}
                  className="text-xs font-semibold text-zinc-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Destination
                </button>
              </div>

              {selectedCard.travelNotices.length === 0 ? (
                <p className="text-xs text-zinc-400 py-3 italic">
                  No active travel notices. Ask Aura Voice AI on your call or click &apos;Add Destination&apos;.
                </p>
              ) : (
                <div className="divide-y divide-zinc-100 text-xs">
                  {selectedCard.travelNotices.map((notice, i) => (
                    <div key={i} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Plane className="w-4 h-4 text-zinc-400" />
                        <div>
                          <p className="font-semibold text-zinc-900">{notice.destination}</p>
                          <p className="text-zinc-500 text-[11px] font-mono mt-0.5">
                            {notice.startDate} to {notice.endDate}
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald-700 text-xs font-medium">Active Whitelist</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Travel Notice Modal */}
      {showTravelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-950 mb-1">Add Travel Notice</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Register international spending dates to avoid false fraud blocks.
            </p>

            <form onSubmit={handleTravelSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Destination Country / Cities</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zurich & Geneva, Switzerland"
                  value={destInput}
                  onChange={(e) => setDestInput(e.target.value)}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Departure</label>
                  <input
                    type="date"
                    required
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Return</label>
                  <input
                    type="date"
                    required
                    value={endDateInput}
                    onChange={(e) => setEndDateInput(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTravelModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 cursor-pointer"
                >
                  Confirm Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

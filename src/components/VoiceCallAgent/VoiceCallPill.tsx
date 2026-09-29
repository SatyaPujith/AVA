import React, { useState } from 'react';
import { PhoneCall, AlertCircle, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { CustomerProfile } from '../../types/banking';

interface VoiceCallPillProps {
  customer: CustomerProfile;
  onStartCall: (topic?: string) => void;
  isCallActive: boolean;
}

export const VoiceCallPill: React.FC<VoiceCallPillProps> = ({
  customer,
  onStartCall,
  isCallActive,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isCallActive) return null;

  const unresolvedItem = customer.memoryLog.find((m) => !m.resolved);

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end max-w-sm w-full pointer-events-none">
      <div className="pointer-events-auto w-full transition-all duration-300">
        {isExpanded ? (
          <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xl backdrop-blur-md text-zinc-900 animate-in slide-in-from-bottom-2 duration-150">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-semibold text-zinc-950">Aura Voice Banker</h3>
                <span className="text-[11px] text-zinc-400 font-mono">Zero Repetition</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md hover:bg-zinc-100 cursor-pointer"
                title="Collapse"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Unresolved Incident Notification */}
            {unresolvedItem && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold mb-0.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Pending Issue Loaded</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  {unresolvedItem.title}. Aura knows all details—you don&apos;t need to repeat anything.
                </p>
              </div>
            )}

            {/* Direct Call Shortcut Chips */}
            <div className="mt-3 space-y-1 text-xs">
              <button
                onClick={() => onStartCall('Dispute charge')}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">Dispute unrecognized $124.50 charge</span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>
              <button
                onClick={() => onStartCall('Inquire about pre-approved loan')}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">Lock rate for pre-approved loan</span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>
            </div>

            {/* Start Call CTA Button */}
            <div className="mt-3 pt-2 border-t border-zinc-100">
              <button
                onClick={() => onStartCall()}
                className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Start AI Voice Call</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartCall()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-lg transition-transform hover:scale-102 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Aura Support</span>
              {unresolvedItem && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2.5 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950 shadow-md cursor-pointer"
              title="Expand"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, Brain, ArrowRight } from 'lucide-react';
import { CustomerProfile } from '../../types/banking';

interface PostCallSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile;
  summaryData: {
    title: string;
    summary: string;
    sentiment: string;
    keyEntities: string[];
    agentCommitments: string[];
    satisfactionScore: number;
  };
  actionsTaken: any[];
}

export const PostCallSummaryModal: React.FC<PostCallSummaryModalProps> = ({
  isOpen,
  onClose,
  customer,
  summaryData,
  actionsTaken,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#18181b', '#10b981', '#0284c7'],
        });
      } catch (e) {
        // Safe confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7 text-zinc-900">
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Call Resolved · 0 Story Repetitions
            </span>
            <h2 className="text-lg font-bold text-zinc-950 tracking-tight">{summaryData.title}</h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-zinc-950 font-mono">
              {summaryData.satisfactionScore || 99}%
            </span>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Memory Match</p>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 mb-4 text-xs leading-relaxed text-zinc-700">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-900 mb-1">
            <Brain className="w-3.5 h-3.5 text-blue-600" /> Resolution Recorded in Memory
          </div>
          <p>{summaryData.summary}</p>
        </div>

        {/* Real-time actions */}
        {actionsTaken.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Actions Applied Live
            </p>
            <div className="space-y-1.5">
              {actionsTaken.map((act, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/60 text-xs"
                >
                  <span className="font-medium text-zinc-800 capitalize">
                    {act.toolName ? act.toolName.replace(/_/g, ' ') : 'Account update'}
                  </span>
                  <span className="text-emerald-700 font-medium">Applied to Account</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zero repetition guarantee */}
        {summaryData.agentCommitments && summaryData.agentCommitments.length > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950">
            <p className="font-semibold text-blue-900 mb-1">Aura Zero-Repetition Guarantee</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-900/80 text-[11px]">
              {summaryData.agentCommitments.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
              <li>Saved to {customer.name}&apos;s persistent profile for all future calls.</li>
            </ul>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            Return to Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

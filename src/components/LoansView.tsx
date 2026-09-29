import React, { useState } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  Car,
  Home,
} from 'lucide-react';
import { CustomerProfile } from '../types/banking';

interface LoansViewProps {
  customer: CustomerProfile;
  onStartCall: (topic?: string) => void;
  onApproveLoanDirect: (loanId: string, amount: number, termMonths: number) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  customer,
  onStartCall,
  onApproveLoanDirect,
}) => {
  const [selectedLoanId, setSelectedLoanId] = useState(customer.loans[0]?.id || '');
  const [amount, setAmount] = useState(30000);
  const [selectedTerm, setSelectedTerm] = useState(48);

  const selectedLoan = customer.loans.find((l) => l.id === selectedLoanId) || customer.loans[0];

  const calculateMonthly = (principal: number, annualRate: number, months: number) => {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return isNaN(payment) ? 0 : payment;
  };

  const currentMonthly = selectedLoan
    ? calculateMonthly(amount, selectedLoan.interestRate, selectedTerm)
    : 0;

  const totalPayment = currentMonthly * selectedTerm;
  const totalInterest = totalPayment - amount;

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Pre-Approved Lending</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Guaranteed member terms based on credit score {customer.creditScore}. Lock rates in seconds over voice call.
          </p>
        </div>
        <button
          onClick={() =>
            onStartCall(`I want to discuss and approve my pre-approved loan for $${amount}`)
          }
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Discuss Loan with Voice AI</span>
        </button>
      </div>

      {/* Loan Offers Selection (Clean list / grid without heavy borders) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customer.loans.map((loan) => (
          <div
            key={loan.id}
            onClick={() => setSelectedLoanId(loan.id)}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              selectedLoanId === loan.id
                ? 'border-zinc-900 bg-zinc-50/50 shadow-xs'
                : 'border-zinc-200 bg-white hover:border-zinc-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-950">{loan.title}</h2>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  Pre-approved up to ${loan.maxAmount.toLocaleString()}
                </p>
              </div>
              <span className="font-mono text-lg font-bold text-zinc-950">{loan.interestRate}% APR</span>
            </div>

            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{loan.description}</p>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-100 mt-3 font-mono">
              <span>{loan.termMonths.join(', ')} Months</span>
              <span className={loan.status === 'approved' ? 'text-emerald-700 font-semibold' : 'text-zinc-600'}>
                {loan.status === 'approved' ? '✓ Approved in Live Call' : 'Ready to lock'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Simulator (Clean open slider and projections) */}
      {selectedLoan && (
        <div className="pt-6 border-t border-zinc-200 space-y-6">
          <h2 className="text-base font-semibold text-zinc-950">Repayment & Term Calculator</h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            {/* Controls (7 Cols) */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-500 font-medium">Borrow Amount</span>
                  <span className="text-zinc-950 font-mono font-bold text-sm">
                    ${amount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={selectedLoan.maxAmount}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono mt-1">
                  <span>$5,000</span>
                  <span>Max: ${selectedLoan.maxAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-zinc-500 mb-2">Term</span>
                <div className="flex items-center gap-2">
                  {selectedLoan.termMonths.map((term) => (
                    <button
                      key={term}
                      onClick={() => setSelectedTerm(term)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedTerm === term
                          ? 'bg-zinc-900 text-white font-semibold'
                          : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      {term} Months
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Monthly Projection (5 Cols) */}
            <div className="md:col-span-5 p-6 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-4">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Estimated Monthly Payment</span>
                <p className="text-3xl font-bold text-zinc-950 font-mono mt-1">
                  ${currentMonthly.toFixed(2)}
                  <span className="text-xs text-zinc-400 font-normal"> /mo</span>
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-500 border-t border-zinc-200/60 pt-3">
                <div className="flex justify-between">
                  <span>Interest rate:</span>
                  <span className="font-mono text-zinc-900">{selectedLoan.interestRate}% APR</span>
                </div>
                <div className="flex justify-between">
                  <span>Total interest:</span>
                  <span className="font-mono text-zinc-900">${totalInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Origination fee:</span>
                  <span className="font-mono text-emerald-700">$0.00 (Waived)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() =>
                    onStartCall(
                      `I want to approve the ${selectedLoan.title} for $${amount} over ${selectedTerm} months`
                    )
                  }
                  className="flex-1 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call to Authorize</span>
                </button>
                <button
                  onClick={() => onApproveLoanDirect(selectedLoan.id, amount, selectedTerm)}
                  className="py-2 px-3 rounded-lg border border-zinc-200 hover:bg-white text-zinc-800 text-xs font-medium cursor-pointer transition-colors"
                >
                  1-Click Direct Lock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
  TrendingUp, Clock, CheckCircle, XCircle, Plus, X
} from 'lucide-react';

type TxType   = 'deposit' | 'withdrawal' | 'transfer' | 'funding';
type TxStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  sender: string;
  receiver: string;
  status: TxStatus;
  date: string;
  note: string;
}

const initialTxns: Transaction[] = [
  { id: 'tx1', type: 'funding',    amount: 50000, sender: 'Michael Rodriguez', receiver: 'Your Startup',   status: 'completed', date: '2026-04-10', note: 'Seed funding — Tranche 1' },
  { id: 'tx2', type: 'deposit',    amount: 5000,  sender: 'You',               receiver: 'Wallet',         status: 'completed', date: '2026-04-08', note: 'Top-up' },
  { id: 'tx3', type: 'transfer',   amount: 1200,  sender: 'You',               receiver: 'Jennifer Lee',   status: 'completed', date: '2026-04-06', note: 'Due diligence fee' },
  { id: 'tx4', type: 'withdrawal', amount: 2000,  sender: 'Wallet',            receiver: 'Bank Account',   status: 'pending',   date: '2026-04-05', note: 'Withdrawal to bank' },
  { id: 'tx5', type: 'funding',    amount: 25000, sender: 'Jennifer Lee',      receiver: 'Your Startup',   status: 'pending',   date: '2026-04-03', note: 'Series A discussion' },
  { id: 'tx6', type: 'transfer',   amount: 800,   sender: 'You',               receiver: 'Robert Torres',  status: 'failed',    date: '2026-04-01', note: 'Platform fee' },
];

const typeConfig: Record<TxType, { label: string; color: string; icon: React.ReactNode }> = {
  deposit:    { label: 'Deposit',    color: 'bg-green-100 text-green-700',  icon: <ArrowDownLeft  size={14} /> },
  withdrawal: { label: 'Withdrawal', color: 'bg-red-100 text-red-600',      icon: <ArrowUpRight   size={14} /> },
  transfer:   { label: 'Transfer',   color: 'bg-blue-100 text-blue-700',    icon: <ArrowLeftRight size={14} /> },
  funding:    { label: 'Funding',    color: 'bg-purple-100 text-purple-700',icon: <TrendingUp     size={14} /> },
};

const statusConfig: Record<TxStatus, { color: string; icon: React.ReactNode }> = {
  completed: { color: 'text-green-600', icon: <CheckCircle size={15} /> },
  pending:   { color: 'text-amber-500', icon: <Clock       size={15} /> },
  failed:    { color: 'text-red-500',   icon: <XCircle     size={15} /> },
};

type ModalType = 'deposit' | 'withdraw' | 'transfer' | 'fund' | null;

export const PaymentPage: React.FC = () => {
  const [txns, setTxns]           = useState<Transaction[]>(initialTxns);
  const [balance, setBalance]     = useState(78500);
  const [modal, setModal]         = useState<ModalType>(null);
  const [amount, setAmount]       = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote]           = useState('');
  const [toast, setToast]         = useState('');
  const [filter, setFilter]       = useState<TxType | 'all'>('all');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleAction = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { showToast('Please enter a valid amount.'); return; }
    if ((modal === 'withdraw' || modal === 'transfer') && amt > balance) { showToast('Insufficient balance!'); return; }
    if ((modal === 'transfer' || modal === 'fund') && !recipient) { showToast('Please enter recipient name.'); return; }

    const typeMap: Record<NonNullable<ModalType>, TxType> = {
      deposit: 'deposit', withdraw: 'withdrawal', transfer: 'transfer', fund: 'funding',
    };

    const newTx: Transaction = {
      id: 'tx' + Date.now(),
      type: typeMap[modal!],
      amount: amt,
      sender: modal === 'deposit' ? 'Bank Account' : 'You',
      receiver: modal === 'deposit' ? 'Wallet' : modal === 'withdraw' ? 'Bank Account' : recipient,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      note: note || typeMap[modal!],
    };

    setTxns(prev => [newTx, ...prev]);
    if (modal === 'deposit') setBalance(b => b + amt);
    if (modal === 'withdraw' || modal === 'transfer') setBalance(b => b - amt);

    showToast(`${typeMap[modal!].charAt(0).toUpperCase() + typeMap[modal!].slice(1)} of $${amt.toLocaleString()} submitted!`);
    setModal(null); setAmount(''); setRecipient(''); setNote('');
  };

  const filtered = filter === 'all' ? txns : txns.filter(t => t.type === filter);

  const totalIn  = txns.filter(t => ['deposit','funding'].includes(t.type) && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalOut = txns.filter(t => ['withdrawal','transfer'].includes(t.type) && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const pending  = txns.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your wallet, transactions and deal funding</p>
      </div>

      {/* Wallet card + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Wallet */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet size={22} />
              <span className="font-semibold text-lg">My Wallet</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="mb-6">
            <p className="text-blue-200 text-sm mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold">${balance.toLocaleString()}</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Deposit',  modal: 'deposit'  as ModalType, icon: <ArrowDownLeft  size={16} /> },
              { label: 'Withdraw', modal: 'withdraw' as ModalType, icon: <ArrowUpRight   size={16} /> },
              { label: 'Transfer', modal: 'transfer' as ModalType, icon: <ArrowLeftRight size={16} /> },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={() => setModal(btn.modal)}
                className="flex flex-col items-center gap-1.5 bg-white/15 hover:bg-white/25 py-3 rounded-xl transition-colors text-sm font-medium"
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Received</p>
          <div>
            <h3 className="text-2xl font-bold text-green-600">${totalIn.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 mt-1">Deposits + Funding</p>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
            <TrendingUp size={14} /> All time
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Sent</p>
          <div>
            <h3 className="text-2xl font-bold text-red-500">${totalOut.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 mt-1">Withdrawals + Transfers</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-medium">
            <Clock size={14} /> {pending} pending
          </div>
        </div>
      </div>

      {/* Fund a Deal */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-5 flex items-center justify-between text-white">
        <div>
          <h3 className="font-semibold text-lg">Fund a Deal</h3>
          <p className="text-sm text-purple-200 mt-0.5">Send investment funds directly to an entrepreneur</p>
        </div>
        <button
          onClick={() => setModal('fund')}
          className="flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Fund Now
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Transaction History</h2>
          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'deposit', 'withdrawal', 'transfer', 'funding'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Type', 'Amount', 'Sender', 'Receiver', 'Date', 'Note', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[tx.type].color}`}>
                      {typeConfig[tx.type].icon} {typeConfig[tx.type].label}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">${tx.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-600">{tx.sender}</td>
                  <td className="px-5 py-4 text-gray-600">{tx.receiver}</td>
                  <td className="px-5 py-4 text-gray-400">{tx.date}</td>
                  <td className="px-5 py-4 text-gray-500 max-w-[150px] truncate">{tx.note}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusConfig[tx.status].color}`}>
                      {statusConfig[tx.status].icon}
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-400">No transactions found.</div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 capitalize">
                {modal === 'fund' ? 'Fund a Deal' : modal}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number" min="1" placeholder="0.00" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-7 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(modal === 'withdraw' || modal === 'transfer') && (
                  <p className="text-xs text-gray-400 mt-1">Available: ${balance.toLocaleString()}</p>
                )}
              </div>
              {(modal === 'transfer' || modal === 'fund') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {modal === 'fund' ? 'Entrepreneur Name *' : 'Recipient *'}
                  </label>
                  <input
                    type="text" placeholder="Enter name" value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                <input
                  type="text" placeholder="Add a note..." value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setModal(null)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleAction}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
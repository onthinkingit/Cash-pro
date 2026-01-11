
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, History, Zap, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types';

const Wallet: React.FC = () => {
  const { lang, user, setUser, settings, transactions, addTransaction } = useApp();
  const t = translations[lang];

  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [loading, setLoading] = useState(false);

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < settings.minDeposit) {
      alert(`Minimum deposit is ৳${settings.minDeposit}`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let bonus = 0;
      if (val >= 1000) bonus = val * 0.05;
      else if (val >= 500) bonus = val * 0.02;

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user!.id,
        type: 'deposit',
        amount: val,
        bonusUsed: bonus,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      addTransaction(newTx);
      setUser({
        ...user!,
        cashBalance: user!.cashBalance + val,
        bonusBalance: user!.bonusBalance + bonus
      });
      setAmount('');
      setLoading(false);
      alert('Deposit Successful!');
    }, 1500);
  };

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < settings.minWithdraw) {
      alert(`Minimum withdraw is ৳${settings.minWithdraw}`);
      return;
    }
    if (val > user!.cashBalance) {
      alert('Insufficient cash balance!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user!.id,
        type: 'withdraw',
        amount: val,
        bonusUsed: 0,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      addTransaction(newTx);
      setUser({
        ...user!,
        cashBalance: user!.cashBalance - val
      });
      setAmount('');
      setLoading(false);
      alert('Withdrawal request submitted! Will be processed within 24h.');
    }, 1500);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
          <p className="text-indigo-100 text-sm uppercase tracking-widest font-bold">{t.cashBalance}</p>
          <p className="text-5xl font-bebas tracking-wider mt-2">৳{user.cashBalance.toFixed(2)}</p>
          <div className="mt-8 flex gap-4">
             <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                <p className="text-[10px] text-indigo-100 uppercase">Withdrawable</p>
                <p className="font-bold">৳{user.cashBalance.toFixed(2)}</p>
             </div>
          </div>
          <WalletIcon className="absolute -bottom-8 -right-8 text-white/10" size={160} />
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
          <p className="text-amber-100 text-sm uppercase tracking-widest font-bold">{t.bonusBalance}</p>
          <p className="text-5xl font-bebas tracking-wider mt-2">৳{user.bonusBalance.toFixed(2)}</p>
          <div className="mt-8 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm flex items-center gap-2">
            <Zap size={14} className="text-amber-300" />
            <p className="text-xs">Play-only balance. Used automatically first.</p>
          </div>
          <Zap className="absolute -bottom-8 -right-8 text-white/10" size={160} />
        </div>
      </div>

      <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-2">
              <ArrowUpCircle className="text-green-500" />
              Quick Action
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setMethod('bkash')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'bkash' ? 'border-pink-500 bg-pink-500/10' : 'border-slate-700'}`}
              >
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-bold text-xs">bKash</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">bKash</span>
              </button>
              <button 
                onClick={() => setMethod('nagad')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'nagad' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700'}`}
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xs">Nagad</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Nagad</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Enter Amount (BDT)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">৳</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-2xl font-bold focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                disabled={loading}
                onClick={handleDeposit}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 py-4 rounded-2xl font-bebas text-2xl tracking-widest shadow-lg shadow-green-500/20 transition-all active:scale-95"
              >
                {loading ? 'Processing...' : t.deposit}
              </button>
              <button 
                disabled={loading}
                onClick={handleWithdraw}
                className="flex-1 bg-slate-900 hover:bg-slate-950 border border-slate-700 py-4 rounded-2xl font-bebas text-2xl tracking-widest transition-all active:scale-95"
              >
                {t.withdraw}
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-2">
              <History className="text-amber-500" />
              {t.transactionLogs}
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No transactions yet</p>
                </div>
              ) : transactions.map(tx => (
                <div key={tx.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_bonus' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_bonus' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm capitalize">{tx.type.replace('_', ' ')}</p>
                      <p className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_bonus' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_bonus' ? '+' : '-'}৳{tx.amount}
                    </p>
                    {tx.status === 'pending' && <p className="text-[10px] text-amber-500 font-bold">PENDING</p>}
                    {tx.bonusUsed > 0 && <p className="text-[10px] text-amber-500">Bonus: ৳{tx.bonusUsed}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;

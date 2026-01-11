
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, History, Zap, FileText, Copy, CheckCircle2, Info } from 'lucide-react';
import { Transaction, DepositRequest } from '../types';

const Wallet: React.FC = () => {
  const { lang, user, setUser, settings, transactions, addTransaction, depositRequests, setDepositRequests } = useApp();
  const t = translations[lang];

  const [amount, setAmount] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [loading, setLoading] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  const handleCopyNumber = () => {
    const num = method === 'bkash' ? settings.bkashNumber : settings.nagadNumber;
    navigator.clipboard.writeText(num);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const handleDepositRequest = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < settings.minDeposit) {
      alert(t.minDepositError);
      return;
    }
    if (!txId.trim()) {
      alert(lang === 'en' ? 'Transaction ID is required!' : 'ট্রানজেকশন আইডি প্রয়োজন!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newRequest: DepositRequest = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user!.id,
        username: user!.username,
        phone: user!.phone,
        amount: val,
        method,
        txId,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      setDepositRequests(prev => [newRequest, ...prev]);
      setAmount('');
      setTxId('');
      setLoading(false);
      alert(t.depositRequestSuccess);
    }, 1200);
  };

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < settings.minWithdraw) {
      alert(t.minWithdrawError);
      return;
    }
    if (val > user!.cashBalance) {
      alert(t.insufficientBalance);
      return;
    }

    const today = new Date().toDateString();
    if (user!.lastWithdrawal === today) {
      alert(t.withdrawLimitError);
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
        cashBalance: user!.cashBalance - val,
        lastWithdrawal: today
      });
      setAmount('');
      setLoading(false);
      alert(t.withdrawSuccess);
    }, 1200);
  };

  if (!user) return null;

  const currentType = method === 'bkash' ? settings.bkashType : settings.nagadType;
  const actionLabel = currentType === 'Agent' ? t.cashOutTo : t.sendMoneyTo;
  const suggestedAmounts = [30, 50, 100, 500];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 relative">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
          <p className="text-indigo-100 text-sm uppercase tracking-widest font-bold">{t.cashBalance}</p>
          <p className="text-5xl font-bebas tracking-wider mt-2">৳{user.cashBalance.toFixed(2)}</p>
          <WalletIcon className="absolute -bottom-8 -right-8 text-white/10" size={160} />
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
          <p className="text-amber-100 text-sm uppercase tracking-widest font-bold">{t.bonusBalance}</p>
          <p className="text-5xl font-bebas tracking-wider mt-2">৳{user.bonusBalance.toFixed(2)}</p>
          <Zap className="absolute -bottom-8 -right-8 text-white/10" size={160} />
        </div>
      </div>

      <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-2 text-white">
              <ArrowUpCircle className="text-green-500" />
              {t.deposit} / {t.withdraw}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setMethod('bkash')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'bkash' ? 'border-pink-500 bg-pink-500/10' : 'border-slate-700'}`}
              >
                <span className="text-pink-500 font-bold uppercase tracking-widest">bKash</span>
                <span className="text-[10px] text-slate-400">{settings.bkashType}</span>
              </button>
              <button 
                onClick={() => setMethod('nagad')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'nagad' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700'}`}
              >
                <span className="text-orange-500 font-bold uppercase tracking-widest">Nagad</span>
                <span className="text-[10px] text-slate-400">{settings.nagadType}</span>
              </button>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10">
                 <Info size={40} />
               </div>
               <p className="text-xs text-amber-500 uppercase font-bold mb-2 tracking-widest animate-pulse">
                 {actionLabel}
               </p>
               <div className="flex items-center justify-center gap-3 relative">
                 <p className="text-3xl font-bebas text-white tracking-wider">
                   {method === 'bkash' ? settings.bkashNumber : settings.nagadNumber}
                 </p>
                 <div className="relative group">
                   <button 
                     onClick={handleCopyNumber}
                     className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-amber-500 transition-colors shadow-sm"
                     title="Copy Number"
                   >
                     <Copy size={18} />
                   </button>
                   {showCopyTooltip && (
                     <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-left-2 duration-300 z-50 whitespace-nowrap">
                       <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-500 rotate-45"></div>
                       {t.copied}
                     </div>
                   )}
                 </div>
               </div>
               <p className="text-[10px] text-slate-500 mt-2 font-medium">
                 {lang === 'en' 
                    ? `Please make sure to choose ${currentType} transaction.` 
                    : `দয়া করে নিশ্চিত করুন যে আপনি ${currentType === 'Agent' ? 'ক্যাশ আউট' : 'সেন্ড মানি'} করছেন।`}
               </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-bold uppercase tracking-tighter">{t.entryFee} (৳)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {suggestedAmounts.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold hover:border-amber-500 hover:bg-amber-500/5 transition-all text-slate-300 active:scale-95"
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-4 text-xl font-bold focus:outline-none focus:border-amber-500 text-white placeholder:text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-bold uppercase tracking-tighter">{t.txIdLabel}</label>
                <input 
                  type="text" 
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="8XJ9K2L0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-4 text-xl font-bold focus:outline-none focus:border-amber-500 text-white placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                disabled={loading}
                onClick={handleDepositRequest}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 py-4 rounded-2xl font-bebas text-2xl tracking-widest shadow-lg shadow-green-500/20 text-white"
              >
                {loading ? '...' : t.deposit}
              </button>
              <button 
                disabled={loading}
                onClick={handleWithdraw}
                className="flex-1 bg-slate-900 hover:bg-slate-950 border border-slate-700 py-4 rounded-2xl font-bebas text-2xl tracking-widest text-white"
              >
                {t.withdraw}
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-2 text-white">
              <History className="text-amber-500" />
              {t.transactionLogs}
            </h2>
            <div className="space-y-3 max-h-[450px] overflow-auto pr-2 custom-scrollbar">
              {depositRequests.filter(d => d.userId === user.id).map(req => (
                <div key={req.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between border-l-4 border-l-amber-500 text-white">
                   <div className="flex items-center gap-3">
                    <FileText size={20} className="text-amber-500" />
                    <div>
                      <p className="font-bold text-sm">Deposit: ৳{req.amount}</p>
                      <p className="text-[10px] text-slate-500">{req.method.toUpperCase()} | {req.txId}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              ))}
              
              {transactions.length === 0 && depositRequests.filter(d => d.userId === user.id).length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No transactions yet</p>
                </div>
              ) : transactions.map(tx => (
                <div key={tx.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between text-white">
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

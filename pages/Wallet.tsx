
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, History, Copy, Camera, Loader2, CheckCircle2, AlertCircle, XCircle, Gift, Info, Clock, CheckCircle, XCircle as XIcon } from 'lucide-react';
import { DepositRequest, WithdrawalRequest } from '../types';
import { useSearchParams } from 'react-router-dom';

const Wallet: React.FC = () => {
  const { lang, user, setUser, settings, transactions, addTransaction, depositRequests, setDepositRequests, withdrawalRequests, setWithdrawalRequests, updateUserBalance, addNotification } = useApp();
  const t = translations[lang];
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>((searchParams.get('tab') as any) || 'deposit');
  const [showHistory, setShowHistory] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [withdrawType, setWithdrawType] = useState<'Personal' | 'Agent'>('Personal');
  const [withdrawNumber, setWithdrawNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedAmounts = [50, 70, 100, 200, 500, 1000, 2000];

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const calculateBonus = (amt: number) => {
    if (amt <= 499) return amt * 0.10;
    return 0;
  };

  const handleCopyNumber = () => {
    const num = method === 'bkash' ? settings.bkashNumber : settings.nagadNumber;
    navigator.clipboard.writeText(num);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const handleDepositRequest = () => {
    if (!user) return;
    
    if (user.status === 'banned') {
      showFeedback(t.bannedError, 'error');
      return;
    }

    const val = parseFloat(amount);
    const tid = txId.trim().toUpperCase();

    if (isNaN(val) || val <= 0) {
      showFeedback(lang === 'en' ? "Please enter a valid amount!" : "দয়া করে সঠিক পরিমাণ লিখুন!", 'error');
      return;
    }
    if (val < settings.minDeposit) {
      showFeedback(`${t.minDepositError} (৳${settings.minDeposit})`, 'error');
      return;
    }
    if (!tid) {
      showFeedback(lang === 'en' ? "Transaction ID is mandatory!" : "ট্রানজেকশন আইডি বাধ্যতামূলক!", 'error');
      return;
    }

    const isDuplicate = depositRequests.some(r => r.txId === tid);
    if (isDuplicate) {
      showFeedback(t.duplicateTxId || 'Transaction ID already used!', 'error');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const bonus = calculateBonus(val);
      
      const newRequest: DepositRequest = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        username: user.username,
        phone: user.phone,
        amount: val,
        method,
        txId: tid,
        screenshot: screenshot || undefined,
        status: 'approved', // Simulation: instant approval for demo, but listed in history
        bonusApplied: bonus,
        timestamp: new Date().toISOString()
      };

      setDepositRequests(prev => [newRequest, ...prev]);
      updateUserBalance(user.id, val, bonus);
      
      addTransaction({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: 'deposit',
        amount: val,
        bonusUsed: bonus,
        timestamp: new Date().toISOString(),
        status: 'completed',
        txId: tid,
        method: method
      });

      addNotification(user.id, `Deposit Success: ৳${val} credited instantly!`);
      
      setAmount('');
      setTxId('');
      setScreenshot(null);
      setLoading(false);
      showFeedback(t.depositRequestSuccess, 'success');
    }, 1500);
  };

  const handleWithdraw = async () => {
    if (!user) return;
    
    if (user.status === 'banned') {
      showFeedback(t.bannedError, 'error');
      return;
    }

    const today = new Date().toDateString();
    const lastWithdrawalDate = user.lastWithdrawal ? new Date(user.lastWithdrawal).toDateString() : null;
    if (lastWithdrawalDate === today) {
      showFeedback(t.withdrawLimitError, 'error');
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val < settings.minWithdraw) {
      showFeedback(`${t.minWithdrawError} (৳${settings.minWithdraw})`, 'error');
      return;
    }
    
    if (val > user.cashBalance) {
      showFeedback(t.insufficientBalance, 'error');
      return;
    }

    if (!withdrawNumber || withdrawNumber.length < 11) {
      showFeedback(lang === 'en' ? 'Provide a valid receiver phone number (11 digits)' : 'সঠিক ১১ সংখ্যার রিসিভার নম্বর দিন', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newWithdrawal: WithdrawalRequest = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        username: user.username,
        amount: val,
        method: method,
        accountType: withdrawType,
        receiverNumber: withdrawNumber,
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      setUser({ ...user, lastWithdrawal: new Date().toISOString() });
      updateUserBalance(user.id, -val, 0);
      setWithdrawalRequests(prev => [newWithdrawal, ...prev]);
      
      addTransaction({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: 'withdraw',
        amount: val,
        bonusUsed: 0,
        timestamp: new Date().toISOString(),
        status: 'pending',
        method: method,
        receiverNumber: withdrawNumber
      });

      setAmount('');
      setWithdrawNumber('');
      setLoading(false);
      showFeedback(t.withdrawSuccess, 'success');
    }, 1500);
  };

  if (!user) return null;

  const currentType = method === 'bkash' ? settings.bkashType : settings.nagadType;
  const actionLabel = currentType === 'Agent' ? t.cashOutTo : t.sendMoneyTo;

  const userDeposits = depositRequests.filter(d => d.userId === user.id);
  const userWithdrawals = withdrawalRequests.filter(w => w.userId === user.id);

  return (
    <div className="space-y-6 animate-in slide-up duration-500 max-w-lg mx-auto relative pb-20">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className={`p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border-2 backdrop-blur-xl ${
            toast.type === 'success' ? 'bg-emerald/90 border-white/20 text-white' : 'bg-red-600/90 border-white/20 text-white'
          }`}>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              {toast.type === 'success' ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bebas tracking-widest">{toast.type === 'success' ? 'SUCCESS' : 'ERROR'}</h4>
              <p className="text-xs font-bold opacity-90 leading-tight">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <XCircle size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Header with Balance */}
      <div className="bg-emerald p-8 rounded-[2.5rem] shadow-2xl shadow-emerald/20 text-white relative overflow-hidden group">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-2">{t.cashBalance}</p>
            <p className="text-6xl font-bebas tracking-wider">৳{user.cashBalance.toFixed(2)}</p>
            <div className="mt-4 flex gap-4">
               <div className="bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-[8px] uppercase font-black opacity-60">Bonus</p>
                  <p className="text-lg font-bebas">৳{user.bonusBalance.toFixed(2)}</p>
               </div>
            </div>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-4 rounded-2xl transition-all ${showHistory ? 'bg-white text-emerald' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <History size={24} />
          </button>
        </div>
        <WalletIcon className="absolute -bottom-8 -right-8 text-white/10 group-hover:scale-110 transition-transform" size={160} />
      </div>

      {!showHistory ? (
        <>
          {activeTab === 'deposit' && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-orange-500/20 animate-pulse">
               <div className="bg-white/20 p-2 rounded-xl">
                  <Gift className="text-white" size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-white/70 tracking-widest">Special Promo</p>
                  <p className="text-xs font-bold text-white">Get 10% bonus on deposits up to ৳499!</p>
               </div>
            </div>
          )}

          <div className="bg-indigo-900 rounded-[2.5rem] p-6 border border-white/10 shadow-xl relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 z-50 bg-indigo-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                 <Loader2 className="text-electric animate-spin mb-4" size={48} />
                 <h3 className="text-2xl font-bebas tracking-widest text-white mb-2">{activeTab === 'deposit' ? 'Verifying...' : 'Processing...'}</h3>
              </div>
            )}

            <div className="flex bg-indigo-950 p-1 rounded-3xl mb-8">
              <button onClick={() => setActiveTab('deposit')} className={`flex-1 py-4 rounded-[1.5rem] font-bebas text-2xl tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-electric text-white shadow-xl' : 'text-slate-500'}`}>{t.deposit}</button>
              <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-4 rounded-[1.5rem] font-bebas text-2xl tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-electric text-white shadow-xl' : 'text-slate-500'}`}>{t.withdraw}</button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-2">{t.selectMethod}</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setMethod('bkash')} className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'bkash' ? 'border-pink-500 bg-pink-500/10' : 'border-white/5 bg-white/5'}`}>
                    <span className="text-pink-500 font-black uppercase tracking-widest text-sm">bKash</span>
                  </button>
                  <button onClick={() => setMethod('nagad')} className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'nagad' ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-white/5'}`}>
                    <span className="text-orange-500 font-black uppercase tracking-widest text-sm">Nagad</span>
                  </button>
                </div>
              </div>

              {activeTab === 'deposit' && (
                <div className="bg-indigo-950/50 p-6 rounded-3xl border border-white/5 text-center animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-[10px] text-electric uppercase font-black mb-3 tracking-[0.2em]">{actionLabel}</p>
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-3xl font-bebas text-white tracking-widest">
                      {method === 'bkash' ? settings.bkashNumber : settings.nagadNumber}
                    </p>
                    <button onClick={handleCopyNumber} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-colors"><Copy size={18} /></button>
                  </div>
                  {showCopyTooltip && <p className="text-[10px] text-emerald font-bold mt-2 animate-bounce">{t.copied}</p>}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.suggestedAmounts}</label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedAmounts.map(amt => (
                      <button key={amt} onClick={() => setAmount(amt.toString())} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${parseFloat(amount) === amt ? 'bg-electric border-electric text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}>{amt}৳</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Amount (৳)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-indigo-950 border border-white/10 rounded-3xl py-4 px-6 text-2xl font-black focus:outline-none focus:border-electric transition-all text-white placeholder:text-slate-800" />
                </div>

                {activeTab === 'deposit' ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">{t.txIdLabel}</label>
                      <input type="text" value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="8XJ9K2L0" className="w-full bg-indigo-950 border border-white/10 rounded-3xl py-4 px-6 text-2xl font-black focus:outline-none focus:border-electric transition-all text-white placeholder:text-slate-800" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">{t.methodType}</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setWithdrawType('Personal')} className={`py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-all ${withdrawType === 'Personal' ? 'border-electric bg-electric/10 text-electric' : 'border-white/10 bg-white/5 text-slate-500'}`}>{t.personal}</button>
                        <button onClick={() => setWithdrawType('Agent')} className={`py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-all ${withdrawType === 'Agent' ? 'border-electric bg-electric/10 text-electric' : 'border-white/10 bg-white/5 text-slate-500'}`}>{t.agent}</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Your {method.toUpperCase()} Number</label>
                      <input type="tel" value={withdrawNumber} onChange={(e) => setWithdrawNumber(e.target.value)} placeholder="01xxxxxxxxx" className="w-full bg-indigo-950 border border-white/10 rounded-3xl py-4 px-6 text-2xl font-black focus:outline-none focus:border-electric transition-all text-white placeholder:text-slate-800" />
                    </div>
                  </div>
                )}

                <button disabled={loading} onClick={activeTab === 'deposit' ? handleDepositRequest : handleWithdraw} className={`w-full py-5 rounded-3xl font-bebas text-3xl tracking-widest shadow-2xl transition-all active:scale-95 ${activeTab === 'deposit' ? 'bg-emerald shadow-emerald/20' : 'bg-red-600 shadow-red-600/20'}`}>
                  {loading ? '...' : (activeTab === 'deposit' ? t.deposit : t.withdraw)}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-indigo-900 rounded-[2.5rem] p-6 border border-white/10 shadow-xl space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bebas tracking-widest text-white">Transaction History</h3>
            <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white"><XCircle size={24} /></button>
          </div>

          <div className="space-y-6">
            {/* Deposits Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-emerald flex items-center gap-2">
                <ArrowUpCircle size={16} /> {t.deposit} History
              </h4>
              <div className="space-y-3">
                {userDeposits.length === 0 ? (
                  <p className="text-xs text-slate-500 italic px-2">No deposit history found.</p>
                ) : userDeposits.map(dep => (
                  <div key={dep.id} className="bg-indigo-950 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">৳{dep.amount}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{dep.method} | {new Date(dep.timestamp).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={dep.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Withdrawals Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                <ArrowDownCircle size={16} /> {t.withdraw} History
              </h4>
              <div className="space-y-3">
                {userWithdrawals.length === 0 ? (
                  <p className="text-xs text-slate-500 italic px-2">No withdrawal history found.</p>
                ) : userWithdrawals.map(wit => (
                  <div key={wit.id} className="bg-indigo-950 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">৳{wit.amount}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{wit.method} | {new Date(wit.timestamp).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={wit.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    pending: { color: 'text-amber-500 bg-amber-500/10', icon: <Clock size={12} />, label: 'Pending' },
    approved: { color: 'text-emerald bg-emerald/10', icon: <CheckCircle size={12} />, label: 'Approved' },
    rejected: { color: 'text-red-500 bg-red-500/10', icon: <XIcon size={12} />, label: 'Rejected' }
  }[status] || { color: 'text-slate-500 bg-slate-500/10', icon: <Clock size={12} />, label: status };

  return (
    <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${config.color}`}>
      {config.icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
    </div>
  );
};

export default Wallet;

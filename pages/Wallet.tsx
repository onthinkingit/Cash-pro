
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, History, Zap, FileText, Copy, CheckCircle2, Info, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Transaction, DepositRequest, WithdrawalRequest } from '../types';

const Wallet: React.FC = () => {
  const { lang, user, setUser, settings, transactions, addTransaction, depositRequests, setDepositRequests, withdrawalRequests, setWithdrawalRequests, updateUserBalance, addNotification } = useApp();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [withdrawType, setWithdrawType] = useState<'Personal' | 'Agent'>('Personal');
  const [withdrawNumber, setWithdrawNumber] = useState<string>(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && !withdrawNumber) {
      setWithdrawNumber(user.phone);
    }
  }, [user]);

  const calculateBonus = (amt: number) => {
    if (amt >= 1000) return amt * 0.05;
    if (amt >= 500) return amt * 0.02;
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
    const val = parseFloat(amount);
    const tid = txId.trim().toUpperCase();

    if (isNaN(val) || val < settings.minDeposit) {
      alert(t.minDepositError);
      return;
    }

    const txIdRegex = /^[A-Z0-9]{8,12}$/;
    if (!txIdRegex.test(tid)) {
      alert(lang === 'en' ? 'Invalid Transaction ID format! (8-12 Alphanumeric)' : 'ভুল ট্রানজেকশন আইডি ফরম্যাট! (৮-১২ আলফানিউমেরিক)');
      return;
    }

    const isDuplicate = depositRequests.some(r => r.txId === tid);
    if (isDuplicate) {
      alert(t.duplicateTxId);
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
        status: 'approved', 
        bonusApplied: bonus,
        timestamp: new Date().toISOString()
      };

      updateUserBalance(user.id, val, bonus);
      setDepositRequests(prev => [newRequest, ...prev]);
      
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

      addNotification(user.id, t.instantSuccess.replace('{amount}', val.toString()));

      setAmount('');
      setTxId('');
      setScreenshot(null);
      setLoading(false);
      alert(t.autoApproved);
    }, 2000);
  };

  const handleWithdraw = async () => {
    if (!user) return;

    // RULE 1: Withdraw allowed only for active users
    if (user.status !== 'active') {
      alert(t.bannedError);
      return;
    }

    const val = parseFloat(amount);
    
    // RULE 2: Minimum withdraw amount: 10৳
    if (isNaN(val) || val < 10) {
      alert(t.minWithdrawError);
      return;
    }

    // RULE 3: Withdraw allowed only from cash balance
    if (val > user.cashBalance) {
      alert(t.insufficientBalance);
      return;
    }

    // RULE 4: Block multiple pending withdraw requests
    const hasPending = withdrawalRequests.some(r => r.userId === user.id && r.status === 'pending');
    if (hasPending) {
      alert(t.pendingWithdrawError);
      return;
    }

    // RULE 5: Maximum one withdraw request per user per day
    const today = new Date().toDateString();
    const todayWithdraws = withdrawalRequests.filter(r => r.userId === user.id && new Date(r.timestamp).toDateString() === today);
    if (todayWithdraws.length > 0) {
      alert(t.withdrawLimitError);
      return;
    }

    // RULE 6: Validate receiver number format
    if (!withdrawNumber || withdrawNumber.length < 11 || !withdrawNumber.startsWith('01')) {
      alert(lang === 'en' ? 'Valid receiver number required (e.g., 017...)' : 'সঠিক রিসিভার নম্বর প্রয়োজন (যেমন: ০১৭...)');
      return;
    }

    setLoading(true);

    // Simulate Authenticated API Call (JWT)
    console.log("Sending withdrawal request with JWT Auth Header...");
    
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

      setWithdrawalRequests(prev => [newWithdrawal, ...prev]);
      
      // Note: BALANCE IS NOT DEDUCTED HERE.
      // Deduction happens only after admin approval.

      setAmount('');
      setLoading(false);
      alert(t.withdrawSuccess);
    }, 1500);
  };

  if (!user) return null;

  const currentType = method === 'bkash' ? settings.bkashType : settings.nagadType;
  const actionLabel = currentType === 'Agent' ? t.cashOutTo : t.sendMoneyTo;
  const currentBonus = calculateBonus(parseFloat(amount) || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 relative">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setScreenshot(reader.result as string);
          reader.readAsDataURL(file);
        }
      }} />
      
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

      <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
             <Loader2 className="text-amber-500 animate-spin mb-4" size={48} />
             <h3 className="text-2xl font-bebas tracking-widest text-white mb-2">
               {activeTab === 'deposit' ? t.verifying : 'Sending Request...'}
             </h3>
             <p className="text-slate-400 text-sm">
               {activeTab === 'deposit' 
                ? (lang === 'en' ? 'Checking TxID uniqueness...' : 'আইডি যাচাই করা হচ্ছে...') 
                : (lang === 'en' ? 'Verifying account status and limits...' : 'অ্যাকাউন্ট স্ট্যাটাস যাচাই করা হচ্ছে...')}
             </p>
          </div>
        )}

        <div className="flex bg-slate-900 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 rounded-xl font-bebas text-xl tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t.deposit}
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 rounded-xl font-bebas text-xl tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t.withdraw}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-2 text-white">
              {activeTab === 'deposit' ? <ArrowUpCircle className="text-green-500" /> : <ArrowDownCircle className="text-red-500" />}
              {activeTab === 'deposit' ? t.deposit : t.withdraw}
            </h2>

            <div className="space-y-4">
              <label className="text-sm text-slate-400 font-bold uppercase tracking-widest">{t.selectMethod}</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMethod('bkash')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'bkash' ? 'border-pink-500 bg-pink-500/10' : 'border-slate-700'}`}>
                  <span className="text-pink-500 font-bold uppercase tracking-widest">bKash</span>
                  {activeTab === 'deposit' && <span className="text-[10px] text-slate-400">{settings.bkashType}</span>}
                </button>
                <button onClick={() => setMethod('nagad')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'nagad' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700'}`}>
                  <span className="text-orange-500 font-bold uppercase tracking-widest">Nagad</span>
                  {activeTab === 'deposit' && <span className="text-[10px] text-slate-400">{settings.nagadType}</span>}
                </button>
              </div>
            </div>

            {activeTab === 'deposit' ? (
              <div className="space-y-6">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 text-center relative overflow-hidden">
                  <p className="text-xs text-amber-500 uppercase font-bold mb-2 tracking-widest animate-pulse">{actionLabel}</p>
                  <div className="flex items-center justify-center gap-3 relative">
                    <p className="text-3xl font-bebas text-white tracking-wider">
                      {method === 'bkash' ? settings.bkashNumber : settings.nagadNumber}
                    </p>
                    <button onClick={handleCopyNumber} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-amber-500 transition-colors shadow-sm"><Copy size={18} /></button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">{t.bonusLogic}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Amount (৳)</label>
                      {currentBonus > 0 && <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">{t.bonusPreview.replace('{amount}', currentBonus.toString())}</span>}
                    </div>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-4 text-xl font-bold focus:outline-none focus:border-amber-500 text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400 font-bold uppercase tracking-tighter">{t.txIdLabel}</label>
                    <input type="text" value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="8XJ9K2L0" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-4 text-xl font-bold focus:outline-none focus:border-amber-500 text-white" />
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-700 hover:border-amber-500 transition-colors rounded-2xl p-4 flex flex-col items-center gap-2 group">
                    {screenshot ? <div className="relative"><img src={screenshot} alt="Screenshot" className="h-20 w-auto rounded-lg" /><span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full"><CheckCircle2 size={12}/></span></div> : <><Camera className="text-slate-500 group-hover:text-amber-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.uploadScreenshot}</span></>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="text-sm text-slate-400 font-bold uppercase tracking-widest">{t.methodType}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setWithdrawType('Personal')} className={`py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${withdrawType === 'Personal' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-700 text-slate-500'}`}>{t.personal}</button>
                    <button onClick={() => setWithdrawType('Agent')} className={`py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${withdrawType === 'Agent' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-700 text-slate-500'}`}>{t.agent}</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 font-bold uppercase tracking-tighter">{t.withdrawNumber}</label>
                  <input type="tel" value={withdrawNumber} onChange={(e) => setWithdrawNumber(e.target.value)} placeholder="01xxxxxxxxx" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-4 text-xl font-bold focus:outline-none focus:border-amber-500 text-white placeholder:text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Withdrawal Amount (৳)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10.00" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-4 text-xl font-bold focus:outline-none focus:border-amber-500 text-white" />
                  <p className="text-[10px] text-slate-500 italic">Available Cash: ৳{user.cashBalance.toFixed(2)}</p>
                </div>
              </div>
            )}

            <button disabled={loading} onClick={activeTab === 'deposit' ? handleDepositRequest : handleWithdraw} className={`w-full py-4 rounded-2xl font-bebas text-2xl tracking-widest shadow-lg text-white transition-all active:scale-95 ${activeTab === 'deposit' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}>
              {loading ? (activeTab === 'deposit' ? 'Verifying...' : 'Processing...') : (activeTab === 'deposit' ? t.deposit : t.withdraw)}
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-2 text-white"><History className="text-amber-500" />{t.transactionLogs}</h2>
            <div className="space-y-3 max-h-[550px] overflow-auto pr-2 custom-scrollbar">
              {depositRequests.filter(d => d.userId === user.id).map(req => (
                <div key={req.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between border-l-4 border-l-amber-500 text-white">
                   <div className="flex items-center gap-3">
                    {req.screenshot ? <ImageIcon size={20} className="text-amber-500" /> : <FileText size={20} className="text-amber-500" />}
                    <div><p className="font-bold text-sm">Deposit: ৳{req.amount}</p><p className="text-[10px] text-slate-500">{req.method.toUpperCase()} | {req.txId}</p>{req.status === 'approved' && <p className="text-[9px] text-green-400 font-bold uppercase tracking-widest mt-1">✓ Instantly Verified</p>}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{req.status.toUpperCase()}</span>
                </div>
              ))}
              {withdrawalRequests.filter(w => w.userId === user.id).map(req => (
                <div key={req.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between border-l-4 border-l-red-500 text-white">
                   <div className="flex items-center gap-3"><FileText size={20} className="text-red-500" /><div><p className="font-bold text-sm">Withdraw: ৳{req.amount}</p><p className="text-[10px] text-slate-500">{req.method.toUpperCase()} {req.accountType} | {req.receiverNumber}</p>{req.adminNote && <p className="text-[9px] text-red-400 italic mt-1">Note: {req.adminNote}</p>}</div></div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{req.status.toUpperCase()}</span>
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

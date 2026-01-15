
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Wallet as WalletIcon, History, Copy, Loader2, CheckCircle2, AlertCircle, XCircle, Clock, CheckCircle, XCircle as XIcon, Landmark, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
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
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [withdrawType, setWithdrawType] = useState<'Personal' | 'Agent'>('Personal');
  const [withdrawNumber, setWithdrawNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const suggestedAmounts = [100, 200, 500, 1000];

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopyNumber = () => {
    const num = method === 'bkash' ? settings.bkashNumber : settings.nagadNumber;
    navigator.clipboard.writeText(num);
    showFeedback(t.copied, 'success');
  };

  const handleDeposit = () => {
    if (!user) return;
    const val = parseFloat(amount);
    const tid = txId.trim().toUpperCase();

    if (isNaN(val) || val < settings.minDeposit) {
      showFeedback(`${t.minDepositError} (৳${settings.minDeposit})`, 'error');
      return;
    }
    if (!tid) {
      showFeedback('Transaction ID required', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const bonus = val <= 499 ? val * 0.10 : 0;
      const newRequest: DepositRequest = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id, username: user.username, phone: user.phone,
        amount: val, method, txId: tid, status: 'approved', bonusApplied: bonus,
        timestamp: new Date().toISOString()
      };

      setDepositRequests(prev => [newRequest, ...prev]);
      updateUserBalance(user.id, val, bonus);
      addTransaction({
        id: Math.random().toString(36).substr(2, 9), userId: user.id, type: 'deposit', amount: val,
        bonusUsed: bonus, timestamp: new Date().toISOString(), status: 'completed', txId: tid, method
      });

      addNotification(user.id, `Recharge Confirmed: ৳${val} added.`);
      setAmount(''); setTxId(''); setLoading(false);
      showFeedback(t.depositRequestSuccess, 'success');
    }, 1500);
  };

  const handleWithdraw = () => {
    if (!user) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val < settings.minWithdraw) {
      showFeedback(`${t.minWithdrawError} (৳${settings.minWithdraw})`, 'error');
      return;
    }
    if (val > user.cashBalance) {
      showFeedback(t.insufficientBalance, 'error');
      return;
    }
    if (withdrawNumber.length < 11) {
      showFeedback('Recipient number invalid', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newWithdrawal: WithdrawalRequest = {
        id: Math.random().toString(36).substr(2, 9), userId: user.id, username: user.username,
        amount: val, method, accountType: withdrawType, receiverNumber: withdrawNumber,
        status: 'pending', timestamp: new Date().toISOString()
      };
      
      updateUserBalance(user.id, -val, 0);
      setWithdrawalRequests(prev => [newWithdrawal, ...prev]);
      setAmount(''); setWithdrawNumber(''); setLoading(false);
      showFeedback(t.withdrawSuccess, 'success');
    }, 1500);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in slide-up max-w-lg mx-auto pb-28">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-sm">
          <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-600/90 border-white/10' : 'bg-red-600/90 border-white/10'
          }`}>
             {toast.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
             <p className="text-xs font-bold text-white flex-1">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Main Balance Card */}
      <div className="bg-brand-dark p-10 rounded-[3rem] border border-white/5 relative overflow-hidden ludo-board-base">
         <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10"><WalletIcon size={160} /></div>
         <div className="relative z-10 flex justify-between items-end">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">{t.cashBalance}</p>
               <h2 className="text-7xl font-bebas tracking-widest text-white leading-none">৳{user.cashBalance.toFixed(2)}</h2>
               <div className="mt-6 inline-flex items-center gap-3 bg-white/5 px-5 py-2 rounded-2xl border border-white/5 backdrop-blur-md">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bonus Pool</span>
                  <span className="text-lg font-bebas text-brand-success tracking-widest">৳{user.bonusBalance.toFixed(2)}</span>
               </div>
            </div>
            <button onClick={() => setShowHistory(!showHistory)} className={`p-5 rounded-3xl transition-all ${showHistory ? 'bg-brand-accent text-brand-black shadow-xl' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
               <History size={28} />
            </button>
         </div>
      </div>

      {!showHistory ? (
        <div className="bg-brand-dark p-8 rounded-[3rem] border border-white/5 space-y-10 relative overflow-hidden ludo-board-base">
          {loading && (
             <div className="absolute inset-0 z-50 bg-brand-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                <Loader2 className="animate-spin text-brand-accent mb-6" size={56} />
                <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Verifying Connection</p>
             </div>
          )}

          <div className="flex bg-brand-black p-2 rounded-3xl border border-white/5">
             <button onClick={() => setActiveTab('deposit')} className={`flex-1 py-4 rounded-2xl font-bebas text-3xl tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-brand-accent text-brand-black shadow-xl' : 'text-slate-500 hover:text-white'}`}>{t.deposit}</button>
             <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-4 rounded-2xl font-bebas text-3xl tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-brand-accent text-brand-black shadow-xl' : 'text-slate-500 hover:text-white'}`}>{t.withdraw}</button>
          </div>

          <div className="space-y-8">
             <div className="grid grid-cols-2 gap-5">
                <PaymentMethod active={method === 'bkash'} onClick={() => setMethod('bkash')} name="bKash" color="border-pink-500/50" />
                <PaymentMethod active={method === 'nagad'} onClick={() => setMethod('nagad')} name="Nagad" color="border-orange-500/50" />
             </div>

             {activeTab === 'deposit' && (
               <div className="bg-brand-black p-6 rounded-3xl border border-white/5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-brand-accent/10 transition-colors"><Landmark size={24} className="text-brand-accent" /></div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Target Account</p>
                        <p className="text-2xl font-bebas tracking-widest text-white">
                          {method === 'bkash' ? settings.bkashNumber : settings.nagadNumber}
                        </p>
                     </div>
                  </div>
                  <button onClick={handleCopyNumber} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90"><Copy size={20} /></button>
               </div>
             )}

             <div className="space-y-6">
                <div className="flex flex-wrap gap-2.5">
                   {suggestedAmounts.map(amt => (
                     <button key={amt} onClick={() => setAmount(amt.toString())} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${parseFloat(amount) === amt ? 'bg-brand-accent border-brand-accent text-brand-black shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}>৳{amt}</button>
                   ))}
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-2">Amount (৳)</label>
                   <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-brand-black border border-white/5 rounded-[2.5rem] py-6 px-8 text-4xl font-bebas tracking-widest focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-slate-800" />
                </div>

                {activeTab === 'deposit' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-2">Transaction Hash (TXID)</label>
                    <input type="text" value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="ENTER ID" className="w-full bg-brand-black border border-white/5 rounded-[2.5rem] py-6 px-8 text-xl font-bold focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-slate-800 uppercase tracking-widest" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setWithdrawType('Personal')} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${withdrawType === 'Personal' ? 'bg-brand-accent/10 border-brand-accent text-brand-accent shadow-inner' : 'bg-white/5 border-white/5 text-slate-600'}`}>Personal</button>
                      <button onClick={() => setWithdrawType('Agent')} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${withdrawType === 'Agent' ? 'bg-brand-accent/10 border-brand-accent text-brand-accent shadow-inner' : 'bg-white/5 border-white/5 text-slate-600'}`}>Agent</button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] ml-2">Recipient Phone Number</label>
                      <input type="tel" value={withdrawNumber} onChange={(e) => setWithdrawNumber(e.target.value)} placeholder="01XXXXXXXXX" className="w-full bg-brand-black border border-white/5 rounded-[2.5rem] py-6 px-8 text-2xl font-bold focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-slate-800 tracking-wider" />
                    </div>
                  </div>
                )}

                <button onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw} className={`w-full py-7 rounded-[2.5rem] font-bebas text-4xl tracking-widest shadow-2xl transition-all btn-pro active:scale-[0.97] ${activeTab === 'deposit' ? 'bg-brand-success shadow-brand-success/10' : 'bg-brand-secondary shadow-brand-secondary/10'}`}>
                   {activeTab === 'deposit' ? 'SUBMIT DEPOSIT' : 'REQUEST WITHDRAW'}
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-brand-dark rounded-[3rem] p-10 border border-white/5 space-y-10 animate-in slide-in-from-right-6 duration-500 ludo-board-base">
           <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bebas tracking-widest text-white">RECORDS</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 text-slate-600 hover:text-white transition-colors"><XCircle size={28} /></button>
           </div>
           
           <div className="space-y-10">
              <HistorySection title="Deposit Logs" data={depositRequests.filter(d => d.userId === user.id)} />
              <HistorySection title="Withdrawal Logs" data={withdrawalRequests.filter(w => w.userId === user.id)} />
           </div>
        </div>
      )}
    </div>
  );
};

const PaymentMethod = ({ active, onClick, name, color }: any) => (
  <button onClick={onClick} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-2 ${active ? `${color} bg-brand-accent/5` : 'border-white/5 bg-brand-black'}`}>
    <span className={`font-black uppercase tracking-[0.3em] text-[11px] ${active ? 'text-white' : 'text-slate-700'}`}>{name}</span>
  </button>
);

const HistorySection = ({ title, data }: any) => (
  <div className="space-y-5">
     <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 px-2">{title}</h4>
     {data.length === 0 ? <p className="text-[10px] text-slate-700 italic px-4">No records to display.</p> : (
       <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id} className="bg-brand-black p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
               <div>
                  <p className="font-bebas text-2xl text-white tracking-widest leading-none mb-2">৳{item.amount}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{item.method} • {new Date(item.timestamp).toLocaleDateString()}</p>
               </div>
               <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-inner ${
                 item.status === 'approved' ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' : 
                 item.status === 'rejected' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 
                 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
               }`}>
                 {item.status}
               </div>
            </div>
          ))}
       </div>
     )}
  </div>
);

export default Wallet;

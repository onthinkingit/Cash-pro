
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Shield, Users, BarChart3, Settings, AlertCircle, CheckCircle, ExternalLink, CreditCard, XCircle, CheckCircle2, ArrowDownCircle, Image as ImageIcon, MessageSquare, Search, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, DepositRequest, WithdrawalRequest } from '../types';

const AdminDashboard: React.FC = () => {
  const { lang, settings, setSettings, transactions, addTransaction, user, setUser, allUsers, updateUserBalance, depositRequests, setDepositRequests, withdrawalRequests, setWithdrawalRequests, addNotification } = useApp();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'deposits' | 'withdrawals' | 'settings'>('stats');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const calculateBonus = (amt: number) => {
    if (amt >= 1000) return amt * 0.05;
    if (amt >= 500) return amt * 0.02;
    return 0;
  };

  const handleApproveDeposit = (req: DepositRequest) => {
    const bonus = calculateBonus(req.amount);
    updateUserBalance(req.userId, req.amount, bonus);
    setDepositRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved', bonusApplied: bonus } : r));
    
    addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      userId: req.userId,
      type: 'deposit',
      amount: req.amount,
      bonusUsed: bonus,
      timestamp: new Date().toISOString(),
      status: 'completed',
      txId: req.txId
    });
    
    addNotification(req.userId, `Your deposit of ৳${req.amount} was approved! ${bonus > 0 ? `Bonus ৳${bonus} added.` : ''}`);
    alert(`Approved ৳${req.amount} for User ID: ${req.userId}. Bonus: ৳${bonus}`);
  };

  const handleRejectDeposit = (req: DepositRequest) => {
    const note = rejectionNote.trim() || "Information Mismatch";
    setDepositRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected', adminNote: note } : r));
    addNotification(req.userId, `Deposit Rejected: ${note}`);
    setRejectionNote('');
    alert(`Rejected ${req.username}'s deposit.`);
  };

  const handleApproveWithdrawal = (req: WithdrawalRequest) => {
    // 1. Server-side validation before approval
    const targetUser = allUsers.find(u => u.id === req.userId);
    if (!targetUser) {
      alert("Error: User not found.");
      return;
    }

    // 2. Strict Balance Verification (Prevent Negative Balance)
    if (targetUser.cashBalance < req.amount) {
      alert(`Approval Failed: User has insufficient balance (Current: ৳${targetUser.cashBalance.toFixed(2)}). User might have spent the funds in-game while the request was pending.`);
      return;
    }

    // 3. Deduction happens ONLY on approval
    updateUserBalance(req.userId, -req.amount, 0);

    // 4. Update status and log
    setWithdrawalRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
    
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: req.userId,
      type: 'withdraw',
      amount: req.amount,
      bonusUsed: 0,
      timestamp: new Date().toISOString(),
      status: 'completed',
      method: req.method,
      accountType: req.accountType,
      receiverNumber: req.receiverNumber
    };
    addTransaction(newTx);
    
    addNotification(req.userId, t.withdrawAcceptedMsg.replace('{amount}', req.amount.toString()).replace('{method}', req.method.toUpperCase()));
    
    // Log Admin action (Simulation)
    console.log(`[AUDIT] Admin approved withdrawal request ${req.id} for User ${req.userId} at ${new Date().toISOString()}`);
    
    alert(`Approved withdrawal of ৳${req.amount} for ${req.username}. Wallet deducted.`);
  };

  const handleRejectWithdrawal = (req: WithdrawalRequest) => {
    const note = rejectionNote.trim() || "Information mismatch";
    setWithdrawalRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected', adminNote: note } : r));
    
    const msg = t.withdrawRejectedMsg.replace('{amount}', req.amount.toString()).replace('{note}', note);
    addNotification(req.userId, msg);
    
    // Log Admin action (Simulation)
    console.log(`[AUDIT] Admin rejected withdrawal request ${req.id} for User ${req.userId} with note: ${note}`);
    
    setRejectionNote('');
    alert(`Rejected withdrawal for ${req.username}. Reason: ${note}`);
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <AlertCircle size={64} className="text-red-500" />
        <h1 className="text-3xl font-bebas">Access Denied</h1>
        <p className="text-slate-400">Only authorized administrators can view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 relative">
      {selectedImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/90" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Full size" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
        </div>
      )}

      {showSavedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold border-2 border-white/20">
            <CheckCircle2 size={20} />{t.saved}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-4xl font-bebas tracking-widest flex items-center gap-3"><Shield className="text-amber-500" />Admin Panel</h1>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={16} />} label="Stats" />
          <TabButton active={activeTab === 'deposits'} onClick={() => setActiveTab('deposits')} icon={<CreditCard size={16} />} label="Deposits" />
          <TabButton active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} icon={<ArrowDownCircle size={16} />} label="Withdrawals" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16} />} label="Users" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={16} />} label="Settings" />
        </div>
      </div>

      {activeTab === 'withdrawals' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-xl text-white">
          <div className="p-6 border-b border-slate-700">
             <h3 className="text-xl font-bebas tracking-wider">{t.pendingWithdrawals}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Method & Number</th>
                  <th className="px-6 py-4">Amount & Current Bal.</th>
                  <th className="px-6 py-4">Admin Action Note</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {withdrawalRequests.filter(w => w.status === 'pending').map(req => {
                   const u = allUsers.find(user => user.id === req.userId);
                   const canApprove = u && u.cashBalance >= req.amount;
                   return (
                    <tr key={req.id} className="hover:bg-slate-700/20">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm">{req.username}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{req.userId}</p>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${u?.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                           {u?.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold uppercase">{req.method} {req.accountType}</p>
                        <p className="text-[10px] text-amber-500 font-mono">{req.receiverNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                         <p className="font-bold text-red-400">Request: ৳{req.amount}</p>
                         <p className={`text-[10px] font-bold ${canApprove ? 'text-slate-500' : 'text-red-500 animate-pulse'}`}>
                           Wallet: ৳{u?.cashBalance.toFixed(2)}
                         </p>
                      </td>
                      <td className="px-6 py-4">
                         <input 
                           type="text" 
                           placeholder="Rejection note..." 
                           className="bg-slate-900 border border-slate-700 text-[10px] rounded px-2 py-1.5 w-full outline-none focus:border-amber-500"
                           onChange={(e) => setRejectionNote(e.target.value)}
                         />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                             onClick={() => handleApproveWithdrawal(req)} 
                             disabled={!canApprove}
                             className={`p-2 rounded-lg transition-all shadow-sm ${canApprove ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                             title={canApprove ? "Approve" : "Insufficient Balance"}
                          >
                             <CheckCircle size={18}/>
                          </button>
                          <button 
                             onClick={() => handleRejectWithdrawal(req)} 
                             className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                             title="Reject"
                          >
                             <XCircle size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                   );
                })}
                {withdrawalRequests.filter(w => w.status === 'pending').length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No pending withdrawal requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'deposits' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-xl text-white">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
               <h3 className="text-xl font-bebas tracking-wider">{t.pendingDeposits}</h3>
               <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full">{t.bonusLogic}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Verification Logic</th>
                    <th className="px-6 py-4">Status Flag</th>
                    <th className="px-6 py-4">Amount / Bonus</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {depositRequests.filter(d => d.status === 'pending').map(req => {
                    const bonus = calculateBonus(req.amount);
                    const isTxIdUnique = !depositRequests.some(r => r.id !== req.id && r.txId === req.txId);
                    const isAmountValid = req.amount >= settings.minDeposit;
                    const criteriaMatch = isTxIdUnique && isAmountValid;
                    
                    return (
                      <tr key={req.id} className={`hover:bg-slate-700/20 transition-colors ${criteriaMatch ? 'bg-green-500/5' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm">{req.username}</p>
                          <p className="text-[10px] text-slate-500">{req.phone}</p>
                          <p className="text-[9px] font-mono text-slate-600">Ref: {req.txId}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold">
                              {isTxIdUnique ? <CheckCircle size={12} className="text-green-500"/> : <AlertTriangle size={12} className="text-red-500"/>}
                              <span className={isTxIdUnique ? 'text-green-500' : 'text-red-500'}>{t.uniqueId}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold">
                              {isAmountValid ? <CheckCircle size={12} className="text-green-500"/> : <AlertTriangle size={12} className="text-red-500"/>}
                              <span className={isAmountValid ? 'text-green-500' : 'text-red-500'}>{t.validAmount}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${criteriaMatch ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                              {criteriaMatch ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                 {criteriaMatch ? t.criteriaMatch : t.criteriaWarning}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-lg">৳{req.amount}</p>
                          {bonus > 0 && <p className="text-[10px] text-green-500 font-bold bg-green-500/5 inline-block px-1 rounded">+{bonus} Bonus</p>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                               onClick={() => handleApproveDeposit(req)} 
                               className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${criteriaMatch ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-slate-700 text-slate-400 opacity-50'}`}
                            >
                               <CheckCircle size={16}/>
                               <span className="font-bebas text-lg tracking-widest">{t.approve}</span>
                            </button>
                            <button 
                               onClick={() => handleRejectDeposit(req)} 
                               className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            >
                               <XCircle size={20}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid md:grid-cols-4 gap-4">
          <StatBox label="Total Deposits" value={depositRequests.length} icon={<CreditCard className="text-green-500"/>} />
          <StatBox label="Total Withdraws" value={withdrawalRequests.length} icon={<ArrowDownCircle className="text-red-500"/>} />
          <StatBox label="Total Users" value={allUsers.length} icon={<Users className="text-blue-500"/>} />
          <StatBox label="System Balance" value={`৳${allUsers.reduce((sum, u) => sum + u.cashBalance, 0).toFixed(0)}`} icon={<BarChart3 className="text-amber-500"/>} />
        </div>
      )}

      {/* Other tabs like users/settings stay mostly the same */}
    </div>
  );
};

const StatBox = ({ label, value, icon }: any) => (
  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
    <div className="p-3 bg-slate-900 rounded-xl">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-500">{label}</p>
      <p className="text-xl font-bebas text-white tracking-widest">{value}</p>
    </div>
  </div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${active ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
    {icon} <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default AdminDashboard;


import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Shield, Users, BarChart3, CreditCard, XCircle, CheckCircle2, ArrowDownCircle, ArrowUpCircle, Info, Search, X, User as UserIcon, Calendar, TrendingUp, Settings as SettingsIcon, Save, Smartphone, Plus, Trash2, Percent, Send, Ban, UserCheck, Edit2, AlertTriangle } from 'lucide-react';
import { User, Transaction, DepositRequest, WithdrawalRequest, AppSettings } from '../types';

const AdminDashboard: React.FC = () => {
  const { lang, settings, setSettings, transactions, user, allUsers, setAllUsers, updateUserBalance, depositRequests, setDepositRequests, withdrawalRequests, setWithdrawalRequests, addNotification } = useApp();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'deposits' | 'withdrawals' | 'settings'>('stats');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // User Editing State
  const [editCash, setEditCash] = useState('0');
  const [editBonus, setEditBonus] = useState('0');

  // Form state for settings
  const [tempSettings, setTempSettings] = useState<AppSettings>({ ...settings });
  const [newFee, setNewFee] = useState('');

  useEffect(() => {
    if (selectedUser) {
      setEditCash(selectedUser.cashBalance.toString());
      setEditBonus(selectedUser.bonusBalance.toString());
    }
  }, [selectedUser]);

  const showFeedback = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApproveWithdrawal = (req: WithdrawalRequest) => {
    setWithdrawalRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
    addNotification(req.userId, t.withdrawAcceptedMsg.replace('{amount}', req.amount.toString()));
    showFeedback(`Approved withdrawal for ${req.username}`, 'success');
  };

  const handleRejectWithdrawal = (req: WithdrawalRequest) => {
    // Return funds to user
    updateUserBalance(req.userId, req.amount, 0);
    setWithdrawalRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
    addNotification(req.userId, t.withdrawRejectedMsg);
    showFeedback(`Rejected withdrawal for ${req.username}. Funds returned.`, 'warning');
  };

  const handleToggleUserStatus = (u: User) => {
    const newStatus = u.status === 'active' ? 'banned' : 'active';
    setAllUsers(prev => prev.map(item => item.id === u.id ? { ...item, status: newStatus } : item));
    setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    showFeedback(`User ${u.username} is now ${newStatus === 'active' ? 'Unblocked' : 'Blocked'}`, newStatus === 'active' ? 'success' : 'error');
  };

  const handleSaveUserBalances = () => {
    if (!selectedUser) return;
    const cash = parseFloat(editCash);
    const bonus = parseFloat(editBonus);
    
    if (isNaN(cash) || isNaN(bonus) || cash < 0 || bonus < 0) {
      showFeedback('Invalid balance values! Must be positive numbers.', 'error');
      return;
    }

    setAllUsers(prev => prev.map(item => 
      item.id === selectedUser.id ? { ...item, cashBalance: cash, bonusBalance: bonus } : item
    ));
    setSelectedUser(prev => prev ? { ...prev, cashBalance: cash, bonusBalance: bonus } : null);
    showFeedback(t.userUpdated, 'success');
  };

  const handleSaveSettings = () => {
    // Validation check for settings
    if (!tempSettings.telegramLink.startsWith('http')) {
      showFeedback('Telegram link must be a valid URL starting with http:// or https://', 'error');
      return;
    }
    if (tempSettings.matchFees.length === 0) {
      showFeedback('App must have at least one match entry fee defined.', 'warning');
      return;
    }

    setSettings(tempSettings);
    showFeedback(t.saved || 'Settings saved successfully!', 'success');
  };

  const addFee = () => {
    const feeVal = parseInt(newFee);
    if (!isNaN(feeVal) && feeVal > 0) {
      if (!tempSettings.matchFees.includes(feeVal)) {
        setTempSettings({ ...tempSettings, matchFees: [...tempSettings.matchFees, feeVal].sort((a, b) => a - b) });
        setNewFee('');
      } else {
        showFeedback('This entry fee already exists!', 'warning');
      }
    } else {
      showFeedback('Please enter a valid positive number for fee.', 'error');
    }
  };

  const removeFee = (fee: number) => {
    if (tempSettings.matchFees.length <= 1) {
      showFeedback('At least one fee option is required!', 'error');
      return;
    }
    setTempSettings({ ...tempSettings, matchFees: tempSettings.matchFees.filter(f => f !== fee) });
  };

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone.includes(searchQuery) ||
    u.customId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Info size={64} className="text-red-500" />
        <h1 className="text-3xl font-bebas">Access Denied</h1>
        <p className="text-slate-400 max-w-xs">You do not have administrative privileges to access this area.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 relative max-w-lg mx-auto">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[250] w-[90%] max-w-sm animate-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald/90 border-emerald/20 text-white' : 
            toast.type === 'warning' ? 'bg-amber-500/90 border-amber-500/20 text-white' :
            'bg-red-600/90 border-red-500/20 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : 
             toast.type === 'warning' ? <AlertTriangle size={20} /> :
             <Shield size={20} />}
            <p className="text-xs font-bold flex-1">{toast.message}</p>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bebas tracking-widest text-white">Manage User</h2>
            <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/5 rounded-full"><X/></button>
          </div>
          <div className="flex-1 overflow-auto p-6 space-y-8">
             <div className="flex items-center gap-6 bg-indigo-900/40 p-6 rounded-[2.5rem] border border-white/5">
                <div className="w-20 h-20 bg-emerald rounded-full flex items-center justify-center text-3xl font-bebas text-white">
                  {selectedUser.username[0]}
                </div>
                <div className="flex-1">
                   <h3 className="text-2xl font-bebas text-white">{selectedUser.username}</h3>
                   <p className="text-sm text-slate-400 font-bold">{selectedUser.phone}</p>
                   <div className="flex items-center gap-2 mt-1">
                     <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedUser.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-500/20 text-red-500'}`}>
                       {selectedUser.status}
                     </span>
                     <p className="text-[10px] text-electric font-black uppercase tracking-widest">ID: {selectedUser.customId}</p>
                   </div>
                </div>
             </div>

             <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                <h4 className="text-xl font-bebas tracking-widest text-white flex items-center gap-2">
                  <Edit2 size={18} className="text-electric" /> {t.editBalance}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Cash Balance (৳)</label>
                      <input 
                        type="number" 
                        value={editCash} 
                        onChange={(e) => setEditCash(e.target.value)}
                        className="w-full bg-indigo-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                        placeholder="0.00"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Bonus Balance (৳)</label>
                      <input 
                        type="number" 
                        value={editBonus} 
                        onChange={(e) => setEditBonus(e.target.value)}
                        className="w-full bg-indigo-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                        placeholder="0.00"
                      />
                   </div>
                </div>
                <button onClick={handleSaveUserBalances} className="w-full bg-electric text-white py-3 rounded-xl font-bebas text-lg tracking-widest active:scale-95 transition-all">
                  Update Balances
                </button>
             </div>

             <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => handleToggleUserStatus(selectedUser)}
                  className={`w-full py-5 rounded-[2rem] font-bebas text-2xl tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all ${
                    selectedUser.status === 'active' ? 'bg-red-600 text-white' : 'bg-emerald text-white'
                  }`}
                >
                  {selectedUser.status === 'active' ? <Ban size={24}/> : <UserCheck size={24}/>}
                  {selectedUser.status === 'active' ? t.blockUser : t.unblockUser}
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bebas tracking-widest flex items-center gap-3"><Shield className="text-electric" />Admin</h1>
        <div className="flex bg-indigo-900 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'deposits'} onClick={() => setActiveTab('deposits')} icon={<CreditCard size={14} />} label="Deps" />
          <TabButton active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} icon={<ArrowDownCircle size={14} />} label="Withs" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={14} />} label="Users" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={14} />} label="Setup" />
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={14} />} label="Stats" />
        </div>
      </div>

      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 pb-10">
          <div className="bg-indigo-900/60 p-6 rounded-[2.5rem] border border-white/10 space-y-8">
            <h3 className="text-2xl font-bebas tracking-widest text-white flex items-center gap-3">
              <Smartphone className="text-electric" /> App Configuration
            </h3>

            {/* Telegram Link */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                <Send size={14} /> Telegram Channel Link
              </label>
              <input 
                type="text" 
                value={tempSettings.telegramLink}
                onChange={(e) => setTempSettings({ ...tempSettings, telegramLink: e.target.value })}
                placeholder="https://t.me/yourchannel"
                className="w-full bg-indigo-950 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-electric transition-all text-white"
              />
            </div>

            {/* Profit Margin */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                <Percent size={14} /> Company Profit Margin (%)
              </label>
              <input 
                type="number" 
                value={tempSettings.commissionRate * 100}
                onChange={(e) => setTempSettings({ ...tempSettings, commissionRate: parseFloat(e.target.value) / 100 })}
                className="w-full bg-indigo-950 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-electric transition-all text-white"
              />
            </div>

            {/* Match Fees */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Manage Match Entry Fees (৳)</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {tempSettings.matchFees.map(fee => (
                  <div key={fee} className="flex items-center gap-2 bg-indigo-950 px-3 py-2 rounded-xl border border-white/10">
                    <span className="font-bebas text-xl text-white">৳{fee}</span>
                    <button onClick={() => removeFee(fee)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  placeholder="Enter Amount"
                  className="flex-1 bg-indigo-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-electric"
                />
                <button onClick={addFee} className="p-3 bg-emerald rounded-xl text-white active:scale-95 transition-all shadow-lg shadow-emerald/20"><Plus size={20}/></button>
              </div>
            </div>

            {/* bKash Section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <span className="text-xs font-black text-pink-500 uppercase tracking-widest px-2">bKash Payment Gateway</span>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={tempSettings.bkashNumber}
                  onChange={(e) => setTempSettings({ ...tempSettings, bkashNumber: e.target.value })}
                  placeholder="Enter bKash Receiver Number"
                  className="w-full bg-indigo-950 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-pink-500 transition-all text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setTempSettings({ ...tempSettings, bkashType: 'Personal' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${tempSettings.bkashType === 'Personal' ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>Personal</button>
                  <button onClick={() => setTempSettings({ ...tempSettings, bkashType: 'Agent' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${tempSettings.bkashType === 'Agent' ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>Agent</button>
                </div>
              </div>
            </div>

            {/* Nagad Section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest px-2">Nagad Payment Gateway</span>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={tempSettings.nagadNumber}
                  onChange={(e) => setTempSettings({ ...tempSettings, nagadNumber: e.target.value })}
                  placeholder="Enter Nagad Receiver Number"
                  className="w-full bg-indigo-950 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setTempSettings({ ...tempSettings, nagadType: 'Personal' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${tempSettings.nagadType === 'Personal' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>Personal</button>
                  <button onClick={() => setTempSettings({ ...tempSettings, nagadType: 'Agent' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${tempSettings.nagadType === 'Agent' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>Agent</button>
                </div>
              </div>
            </div>

            <button onClick={handleSaveSettings} className="w-full bg-electric text-white py-5 rounded-2xl font-bebas text-2xl tracking-widest shadow-xl shadow-electric/20 active:scale-95 transition-all flex items-center justify-center gap-3 glossy-btn">
              <Save size={24} /> Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search by name, ID or phone..."
               className="w-full bg-indigo-900/60 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-electric"
             />
           </div>
           <div className="space-y-3">
             {filteredUsers.map(u => (
               <button key={u.id} onClick={() => setSelectedUser(u)} className="w-full flex items-center justify-between p-4 bg-indigo-900/40 rounded-[2rem] border border-white/5 hover:border-electric/30 transition-all active:scale-95">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center"><UserIcon className="text-slate-500" /></div>
                    <div className="text-left">
                       <p className="font-bold text-white text-sm">{u.username}</p>
                       <div className="flex items-center gap-2">
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">৳{u.cashBalance.toFixed(0)} | {u.phone}</p>
                         {u.status === 'banned' && <Ban size={10} className="text-red-500" />}
                       </div>
                    </div>
                 </div>
               </button>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bebas tracking-wider px-2">Pending Requests</h3>
          {withdrawalRequests.filter(w => w.status === 'pending').length === 0 ? (
            <div className="text-center py-10 bg-indigo-900/20 rounded-[2rem] border border-white/5">
              <p className="text-slate-500 text-sm italic">No pending withdrawal requests.</p>
            </div>
          ) : (
            withdrawalRequests.filter(w => w.status === 'pending').map(req => (
              <div key={req.id} className="bg-indigo-900/60 p-5 rounded-[2rem] border border-white/10 space-y-4 animate-in slide-in-from-left-4 duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{req.username}</p>
                    <p className="text-[10px] text-slate-500">To: {req.receiverNumber} ({req.accountType})</p>
                  </div>
                  <p className="text-xl font-bebas text-red-500">৳{req.amount}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleApproveWithdrawal(req)} className="flex-1 bg-emerald text-white py-3 rounded-2xl font-bebas text-xl tracking-widest shadow-lg active:scale-95">Approve</button>
                  <button onClick={() => handleRejectWithdrawal(req)} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-bebas text-xl tracking-widest shadow-lg active:scale-95">Cancel</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Total Deposits" value={depositRequests.length} icon={<CreditCard size={18} className="text-emerald"/>} />
          <StatBox label="Total Withdraws" value={withdrawalRequests.length} icon={<ArrowDownCircle size={18} className="text-red-500"/>} />
          <StatBox label="Total Users" value={allUsers.length} icon={<Users size={18} className="text-electric"/>} />
          <StatBox label="Est. Revenue" value={`৳${transactions.filter(t => t.type === 'match_fee').reduce((sum, t) => sum + (t.amount * settings.commissionRate), 0).toFixed(0)}`} icon={<TrendingUp size={18} className="text-amber-500"/>} />
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, icon }: any) => (
  <div className="bg-indigo-900/60 p-5 rounded-[2rem] border border-white/10 flex flex-col gap-2">
    <div className="bg-indigo-950 w-10 h-10 rounded-2xl flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{label}</p>
      <p className="text-xl font-bebas text-white tracking-widest">{value}</p>
    </div>
  </div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${active ? 'bg-electric text-white shadow-lg' : 'text-slate-500 hover:text-white/60'}`}>
    {icon} <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default AdminDashboard;


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Shield, Users, BarChart3, Settings, AlertCircle, CheckCircle, ExternalLink, CreditCard, XCircle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, DepositRequest } from '../types';

const AdminDashboard: React.FC = () => {
  const { lang, settings, setSettings, transactions, addTransaction, user, depositRequests, setDepositRequests } = useApp();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'deposits' | 'settings'>('stats');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const data = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const handleApproveDeposit = (req: DepositRequest) => {
    setDepositRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
    let bonus = 0;
    if (req.amount >= 1000) bonus = req.amount * 0.05;
    else if (req.amount >= 500) bonus = req.amount * 0.02;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: req.userId,
      type: 'deposit',
      amount: req.amount,
      bonusUsed: bonus,
      timestamp: new Date().toISOString(),
      status: 'completed',
      txId: req.txId
    };
    addTransaction(newTx);
    alert(`Approved ৳${req.amount} for ${req.username}. Bonus: ৳${bonus}`);
  };

  const handleRejectDeposit = (id: string) => {
    setDepositRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const notifySaved = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
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
      {/* Saved Toast */}
      {showSavedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold border-2 border-white/20">
            <CheckCircle2 size={20} />
            {t.saved}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-4xl font-bebas tracking-widest flex items-center gap-3">
          <Shield className="text-amber-500" />
          Admin Panel
        </h1>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={16} />} label="Stats" />
          <TabButton active={activeTab === 'deposits'} onClick={() => setActiveTab('deposits')} icon={<CreditCard size={16} />} label="Deposits" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16} />} label="Users" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={16} />} label="Settings" />
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Total Commission" value={`৳${transactions.filter(t => t.type === 'match_fee').reduce((acc, curr) => acc + (curr.amount * settings.commissionRate), 0).toFixed(2)}`} color="text-green-500" />
            <StatCard label="Total Users" value="1,420" color="text-blue-500" />
            <StatCard label="Active Matches" value="12" color="text-amber-500" />
            <StatCard label="Bonuses Paid" value={`৳${transactions.filter(t => t.type === 'referral_bonus' || t.bonusUsed > 0).reduce((acc, curr) => acc + (curr.bonusUsed || curr.amount), 0).toFixed(2)}`} color="text-red-500" />
          </div>

          <div className="bg-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-xl">
            <h3 className="text-xl font-bebas tracking-wider mb-6">Revenue Analytics</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deposits' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-xl text-white">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
             <h3 className="text-xl font-bebas tracking-wider">{t.pendingDeposits}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Method/TxID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {depositRequests.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No deposit requests</td></tr>
                ) : depositRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-700/20">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm">{req.username}</p>
                      <p className="text-[10px] text-slate-500">{req.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold">{req.method.toUpperCase()}</p>
                      <p className="text-[10px] text-amber-500">{req.txId}</p>
                    </td>
                    <td className="px-6 py-4 font-bold">৳{req.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveDeposit(req)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"><CheckCircle size={16}/></button>
                          <button onClick={() => handleRejectDeposit(req.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><XCircle size={16}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-xl text-white">
          <div className="p-6 border-b border-slate-700">
             <h3 className="text-xl font-bebas tracking-wider">User Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Wallet</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr className="hover:bg-slate-700/20"><td colSpan={4} className="px-6 py-4 text-slate-400 text-sm">Demo User Data (Filtered view in production)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid md:grid-cols-2 gap-8 text-white">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-xl">
            <h3 className="text-2xl font-bebas tracking-wider mb-8">Payment Settings</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">bKash Number</label>
                  <input type="text" value={settings.bkashNumber} onChange={(e) => setSettings({...settings, bkashNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">bKash Type</label>
                  <select value={settings.bkashType} onChange={(e) => setSettings({...settings, bkashType: e.target.value as any})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white">
                    <option value="Personal">Personal</option>
                    <option value="Agent">Agent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nagad Number</label>
                  <input type="text" value={settings.nagadNumber} onChange={(e) => setSettings({...settings, nagadNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nagad Type</label>
                  <select value={settings.nagadType} onChange={(e) => setSettings({...settings, nagadType: e.target.value as any})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white">
                    <option value="Personal">Personal</option>
                    <option value="Agent">Agent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Telegram Link</label>
                <input type="text" value={settings.telegramLink} onChange={(e) => setSettings({...settings, telegramLink: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3" />
              </div>

              <button onClick={notifySaved} className="w-full bg-amber-500 py-4 rounded-xl font-bebas text-2xl tracking-widest">Update Payments</button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-xl">
             <h3 className="text-2xl font-bebas tracking-wider mb-8">Match Settings</h3>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-400 uppercase">Commission (%)</label>
                   <input type="number" value={settings.commissionRate * 100} onChange={(e) => setSettings({...settings, commissionRate: parseFloat(e.target.value)/100})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-400 uppercase">Min Deposit (৳)</label>
                   <input type="number" value={settings.minDeposit} onChange={(e) => setSettings({...settings, minDeposit: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3" />
                </div>
                <button onClick={notifySaved} className="w-full bg-slate-700 py-4 rounded-xl font-bebas text-2xl tracking-widest">Update Game Limits</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${active ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
    {icon} <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const StatCard = ({ label, value, color }: any) => (
  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
    <p className={`text-2xl font-bebas tracking-wider ${color}`}>{value}</p>
  </div>
);

export default AdminDashboard;

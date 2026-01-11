
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Shield, Users, BarChart3, Settings, AlertCircle, Ban, CheckCircle, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { lang, settings, setSettings, transactions, user } = useApp();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'settings'>('stats');

  const data = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const stats = {
    totalCommission: transactions.filter(t => t.type === 'match_fee').reduce((acc, curr) => acc + (curr.amount * settings.commissionRate), 0),
    totalUsers: 1420,
    activeMatches: 12,
    bonusesPaid: transactions.filter(t => t.type === 'referral_bonus' || t.bonusUsed > 0).reduce((acc, curr) => acc + (curr.bonusUsed || curr.amount), 0)
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bebas tracking-widest flex items-center gap-3">
          <Shield className="text-amber-500" />
          Admin Control Center
        </h1>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={16} />} label="Stats" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16} />} label="Users" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={16} />} label="Settings" />
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total Commission" value={`৳${stats.totalCommission.toFixed(2)}`} color="text-green-500" />
            <StatCard label="Total Users" value={stats.totalUsers} color="text-blue-500" />
            <StatCard label="Active Matches" value={stats.activeMatches} color="text-amber-500" />
            <StatCard label="Bonuses Paid" value={`৳${stats.bonusesPaid.toFixed(2)}`} color="text-red-500" />
          </div>

          <div className="bg-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-xl">
            <h3 className="text-xl font-bebas tracking-wider mb-6">Revenue Analytics (Weekly)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fbbf24' }}
                  />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
             <h3 className="text-xl font-bebas tracking-wider">User Directory</h3>
             <input 
               type="text" 
               placeholder="Search by ID or Phone..." 
               className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
             />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Wallet</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <UserRow name="Ariful Islam" phone="01712345678" cash={1250} bonus={45} wins={12} losses={5} status="active" />
                <UserRow name="Rakib Ahmed" phone="01887654321" cash={0} bonus={15} wins={0} losses={2} status="banned" />
                <UserRow name="Mehedi Hasan" phone="01999888777" cash={4500} bonus={250} wins={56} losses={12} status="active" />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-xl max-w-2xl">
          <h3 className="text-2xl font-bebas tracking-wider mb-8">Platform Configuration</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Telegram Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.telegramLink}
                  onChange={(e) => setSettings({...settings, telegramLink: e.target.value})}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
                <a href={settings.telegramLink} target="_blank" className="p-3 bg-slate-700 rounded-xl"><ExternalLink size={20}/></a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">bKash Number</label>
                <input 
                  type="text" 
                  value={settings.bkashNumber}
                  onChange={(e) => setSettings({...settings, bkashNumber: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nagad Number</label>
                <input 
                  type="text" 
                  value={settings.nagadNumber}
                  onChange={(e) => setSettings({...settings, nagadNumber: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Min Deposit (৳)</label>
                <input 
                  type="number" 
                  value={settings.minDeposit}
                  onChange={(e) => setSettings({...settings, minDeposit: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Commission (%)</label>
                <input 
                  type="number" 
                  value={settings.commissionRate * 100}
                  onChange={(e) => setSettings({...settings, commissionRate: parseInt(e.target.value) / 100})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button 
              onClick={() => alert('Settings Saved Successfully!')}
              className="w-full bg-amber-500 py-4 rounded-xl font-bebas text-2xl tracking-widest mt-4 shadow-lg shadow-amber-500/20"
            >
              Update Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${active ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
  >
    {icon}
    <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const StatCard = ({ label, value, color }: any) => (
  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-bebas tracking-wider ${color}`}>{value}</p>
  </div>
);

const UserRow = ({ name, phone, cash, bonus, wins, losses, status }: any) => (
  <tr className="hover:bg-slate-700/30 transition-colors">
    <td className="px-6 py-4">
      <p className="font-bold text-sm">{name}</p>
      <p className="text-[10px] text-slate-500">{phone}</p>
    </td>
    <td className="px-6 py-4">
      <p className="text-xs font-bold text-green-500">C: ৳{cash}</p>
      <p className="text-xs font-bold text-amber-500">B: ৳{bonus}</p>
    </td>
    <td className="px-6 py-4">
      <p className="text-xs text-slate-400">W/L: {wins}/{losses}</p>
      <p className="text-[10px] text-slate-500">Win Rate: {((wins/(wins+losses)) * 100 || 0).toFixed(0)}%</p>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
        {status}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex gap-2">
        <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600"><CheckCircle size={16}/></button>
        <button className="p-2 bg-slate-700 rounded-lg hover:bg-red-500/20 hover:text-red-500"><Ban size={16}/></button>
      </div>
    </td>
  </tr>
);

export default AdminDashboard;

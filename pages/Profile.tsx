
import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { User as UserIcon, Award, Share2, LogOut, Shield, ChevronRight } from 'lucide-react';

const Profile: React.FC = () => {
  const { lang, user, setUser } = useApp();
  const t = translations[lang];

  if (!user) return null;

  const copyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    alert('Referral Code Copied!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xl relative z-10">
          <UserIcon size={64} />
          <div className="absolute -bottom-2 right-0 bg-slate-900 border-2 border-amber-500 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
             <Award size={14} className="text-amber-500" />
             <span className="text-[10px] font-bold uppercase tracking-tighter">{user.level}</span>
          </div>
        </div>
        
        <div className="text-center md:text-left relative z-10 flex-1">
          <h1 className="text-4xl font-bebas tracking-widest mb-1">{user.username}</h1>
          <p className="text-slate-400 font-medium mb-4">{user.phone}</p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <StatsBadge label="Wins" value={user.wins} />
            <StatsBadge label="Losses" value={user.losses} />
            <StatsBadge label="Matches" value={user.matchesPlayed} />
          </div>
        </div>

        <div className="absolute top-0 right-0 p-8 opacity-5">
           <UserIcon size={240} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
          <h3 className="text-2xl font-bebas tracking-widest flex items-center gap-2 mb-2">
            <Share2 />
            Referral System
          </h3>
          <p className="text-indigo-100 text-sm mb-6">Earn ৳15 bonus for every friend you invite!</p>
          
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Your Referral Code</p>
              <p className="text-2xl font-bebas tracking-widest">{user.referralCode}</p>
            </div>
            <button 
              onClick={copyReferral}
              className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors"
            >
              Copy
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-black/20 p-4 rounded-2xl">
                <p className="text-[10px] text-indigo-200 uppercase">Total Referrals</p>
                <p className="text-2xl font-bebas">{user.referralCount}</p>
             </div>
             <div className="bg-black/20 p-4 rounded-2xl">
                <p className="text-[10px] text-indigo-200 uppercase">Bonus Earned</p>
                <p className="text-2xl font-bebas">৳{user.totalReferralBonus}</p>
             </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-[2rem] border border-slate-700 overflow-hidden shadow-xl">
           <h3 className="text-xl font-bebas tracking-wider p-6 border-b border-slate-700">Profile Settings</h3>
           <div className="divide-y divide-slate-700">
              <SettingLink icon={<Award className="text-amber-500"/>} label="Leaderboard" />
              <SettingLink icon={<Shield className="text-blue-500"/>} label="Security & Privacy" />
              <SettingLink icon={<LogOut className="text-red-500"/>} label="Logout" onClick={() => setUser(null)} />
           </div>
        </div>
      </div>
    </div>
  );
};

const StatsBadge = ({ label, value }: any) => (
  <div className="bg-slate-900/50 border border-slate-700 px-4 py-2 rounded-xl text-center min-w-[80px]">
    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{label}</p>
    <p className="text-xl font-bebas text-amber-500">{value}</p>
  </div>
);

const SettingLink = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
        {icon}
      </div>
      <span className="font-bold text-slate-200 group-hover:text-white">{label}</span>
    </div>
    <ChevronRight className="text-slate-600 group-hover:text-amber-500 transition-colors" size={20} />
  </button>
);

export default Profile;

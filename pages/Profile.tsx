
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { User as UserIcon, Award, Share2, LogOut, Shield, ChevronRight, Edit3, CheckCircle2, Copy, X, Camera } from 'lucide-react';

const Profile: React.FC = () => {
  const { lang, user, setUser } = useApp();
  const t = translations[lang];

  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.username || '');
  const [editUserId, setEditUserId] = useState(user?.customId || '');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.username);
      setEditUserId(user.customId);
    }
  }, [user]);

  if (!user) return null;

  const copyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const handleUpdateProfile = () => {
    if (!editName.trim() || !editUserId.trim()) {
      alert("Name and ID cannot be empty");
      return;
    }
    setUser({
      ...user,
      username: editName,
      customId: editUserId
    });
    setIsEditing(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({
          ...user,
          avatar: reader.result as string
        });
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {/* Saved Toast */}
      {showSavedToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-green-500 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold border-2 border-white/20">
            <CheckCircle2 size={24} />
            <span className="text-lg uppercase tracking-widest font-bebas">{t.saved}</span>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="relative group">
          <div 
            onClick={handleAvatarClick}
            className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xl relative z-10 overflow-hidden cursor-pointer"
          >
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={64} />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 right-0 bg-slate-900 border-2 border-amber-500 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-20 pointer-events-none">
             <Award size={14} className="text-amber-500" />
             <span className="text-[10px] font-bold uppercase tracking-tighter">{user.level}</span>
          </div>
        </div>
        
        <div className="text-center md:text-left relative z-10 flex-1 w-full">
          {!isEditing ? (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center justify-center md:justify-start gap-3 group">
                <h1 className="text-4xl font-bebas tracking-widest mb-1 text-white">{user.username}</h1>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="p-2 text-slate-500 hover:text-amber-500 transition-colors bg-slate-900/50 rounded-lg"
                  title={t.editProfile}
                >
                  <Edit3 size={18} />
                </button>
              </div>
              <p className="text-slate-400 font-medium mb-1">{user.phone}</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">ID: {user.customId}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-sm mx-auto md:mx-0 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 animate-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between mb-2">
                 <h4 className="text-xl font-bebas text-white tracking-wider">{t.editProfile}</h4>
                 <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white">
                   <X size={20} />
                 </button>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t.usernameLabel}</label>
                 <input 
                   type="text" 
                   value={editName}
                   onChange={(e) => setEditName(e.target.value)}
                   className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:border-amber-500 outline-none text-white text-sm"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t.userIdLabel}</label>
                 <input 
                   type="text" 
                   value={editUserId}
                   onChange={(e) => setEditUserId(e.target.value)}
                   className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:border-amber-500 outline-none text-white text-sm"
                 />
               </div>
               <div className="flex gap-3 pt-2">
                 <button 
                   onClick={handleUpdateProfile}
                   className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bebas text-xl tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                 >
                   {t.update}
                 </button>
               </div>
            </div>
          )}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-6">
            <StatsBadge label="Wins" value={user.wins} />
            <StatsBadge label="Losses" value={user.losses} />
            <StatsBadge label="Matches" value={user.matchesPlayed} />
          </div>
        </div>

        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
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
          
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 mb-6 flex items-center justify-between relative">
            <div>
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Your Referral Code</p>
              <p className="text-2xl font-bebas tracking-widest">{user.referralCode}</p>
            </div>
            <div className="relative">
              <button 
                onClick={copyReferral}
                className="bg-white text-indigo-600 p-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg active:scale-90"
                title="Copy"
              >
                <Copy size={20} />
              </button>
              {showCopyTooltip && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-2xl animate-in fade-in slide-in-from-left-2 duration-300 z-50 whitespace-nowrap border border-white/20">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-500 rotate-45"></div>
                  {t.copied}
                </div>
              )}
            </div>
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
           <h3 className="text-xl font-bebas tracking-wider p-6 border-b border-slate-700 text-white">Profile Settings</h3>
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

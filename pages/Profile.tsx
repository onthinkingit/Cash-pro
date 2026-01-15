
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { User as UserIcon, Award, Share2, LogOut, Shield, ChevronRight, Edit3, CheckCircle2, Copy, X, Camera, BarChart3, Star } from 'lucide-react';

const Profile: React.FC = () => {
  const { lang, user, setUser } = useApp();
  const t = translations[lang];

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.username || '');
  const [editUserId, setEditUserId] = useState(user?.customId || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleUpdateProfile = () => {
    setUser({ ...user, username: editName, customId: editUserId });
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUser({ ...user, avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-in slide-up duration-500 pb-20">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* Profile Header */}
      <div className="bg-brand-dark p-8 rounded-[3rem] border border-white/5 relative overflow-hidden text-center flex flex-col items-center">
         <div className="absolute inset-0 bg-brand-accent/5 opacity-50 blur-[60px]"></div>
         
         <div className="relative group mb-6">
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="w-32 h-32 bg-brand-surface rounded-[2.5rem] flex items-center justify-center border border-white/10 overflow-hidden cursor-pointer shadow-2xl transition-transform group-hover:scale-105 relative"
            >
               {user.avatar ? (
                 <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <UserIcon size={48} className="text-slate-500" />
               )}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-gold p-2 rounded-xl border-4 border-brand-dark shadow-xl"><Star size={16} className="text-brand-dark fill-brand-dark" /></div>
         </div>

         {!isEditing ? (
           <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-center gap-3">
                 <h1 className="text-4xl font-bebas tracking-wider text-white">{user.username}</h1>
                 <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"><Edit3 size={16} /></button>
              </div>
              <p className="text-[10px] text-brand-accent font-black uppercase tracking-[0.4em]">{user.level} Elite</p>
              <p className="text-xs text-slate-500 font-medium tracking-widest">{user.phone} • ID: {user.customId}</p>
           </div>
         ) : (
           <div className="w-full space-y-4 p-6 bg-brand-black/40 rounded-3xl border border-white/5 animate-in zoom-in-95">
              <div className="space-y-2 text-left">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">{t.usernameLabel}</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-accent outline-none" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">{t.userIdLabel}</label>
                <input type="text" value={editUserId} onChange={(e) => setEditUserId(e.target.value)} className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-accent outline-none" />
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-slate-400 font-bold text-xs uppercase">Cancel</button>
                 <button onClick={handleUpdateProfile} className="flex-2 py-3 bg-brand-accent rounded-xl text-white font-bebas text-xl tracking-widest">Save Changes</button>
              </div>
           </div>
         )}

         <div className="grid grid-cols-3 gap-8 mt-10 w-full">
            <StatsItem label="Matches" value={user.matchesPlayed} />
            <StatsItem label="Victories" value={user.wins} />
            <StatsItem label="Rank" value="Gold" />
         </div>
      </div>

      {/* Settings Grid */}
      <div className="bg-brand-dark rounded-[2.5rem] border border-white/5 overflow-hidden divide-y divide-white/5">
         <ProfileLink icon={<Award className="text-brand-gold" />} label="Leaderboard" />
         <ProfileLink icon={<Share2 className="text-brand-accent" />} label="Affiliate Program" />
         <ProfileLink icon={<Shield className="text-brand-success" />} label="Security Settings" />
         <ProfileLink icon={<LogOut className="text-brand-secondary" />} label="Logout" onClick={() => setUser(null)} />
      </div>

      <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">Elite Arena Pro v2.5.0</p>
    </div>
  );
};

const StatsItem = ({ label, value }: any) => (
  <div>
    <p className="text-2xl font-bebas text-white tracking-widest leading-none">{value}</p>
    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{label}</p>
  </div>
);

const ProfileLink = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="w-full p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
     <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
     </div>
     <ChevronRight size={18} className="text-slate-600 group-hover:text-brand-accent transition-all group-hover:translate-x-1" />
  </button>
);

export default Profile;

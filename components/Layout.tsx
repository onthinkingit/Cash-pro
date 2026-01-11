
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Home, Plus, User as UserIcon, Share2, LogOut, MessageSquare, Bell, X, Shield, Wallet as WalletIco, MessageCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, lang, setLang, notifications, markNotificationsRead } = useApp();
  const t = translations[lang];
  const location = useLocation();
  const navigate = useNavigate();

  const [showMessages, setShowMessages] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  
  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleOpenMessages = () => {
    setShowMessages(true);
    if (user) markNotificationsRead(user.id);
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* Messages Modal */}
      {showMessages && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-indigo-900 w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
              <div className="p-6 bg-indigo-800/50 border-b border-white/10 flex items-center justify-between">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                   <Bell className="text-electric" />
                   {t.messages}
                 </h2>
                 <button onClick={() => setShowMessages(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                   <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-4">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <MessageSquare size={64} className="mx-auto mb-4 opacity-20" />
                    <p>{t.noMessages}</p>
                  </div>
                ) : userNotifications.map(n => (
                  <div key={n.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-sm leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-500 mt-2">{new Date(n.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-indigo-950/80 backdrop-blur-xl border-b border-white/5">
        <Link to="/profile" className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-800 rounded-full border-2 border-electric overflow-hidden shadow-lg">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-700">
                  <UserIcon size={20} className="text-white" />
                </div>
              )}
           </div>
        </Link>
        
        <div className="flex items-center gap-4">
           {user && (
             <div onClick={() => navigate('/wallet')} className="flex items-center gap-2 bg-emerald px-4 py-2 rounded-full cursor-pointer shadow-lg shadow-emerald/20 hover:scale-105 transition-transform active:scale-95">
                <span className="text-sm font-bold">৳{(user.cashBalance + user.bonusBalance).toFixed(2)}</span>
                <div className="bg-white/20 p-0.5 rounded-full">
                  <Plus size={14} className="text-white" />
                </div>
             </div>
           )}
           <button onClick={handleOpenMessages} className="relative p-2 text-white/70 hover:text-white">
             <Bell size={22} />
             {unreadCount > 0 && (
               <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[8px] flex items-center justify-center rounded-full font-black border-2 border-indigo-950">
                 {unreadCount}
               </span>
             )}
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto p-5 pb-24">
        <div className="page-transition">
          {children}
        </div>
      </main>

      {/* FAB - Support */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-electric rounded-full flex items-center justify-center shadow-xl shadow-electric/30 animate-pulse-soft z-[100] active:scale-90 transition-transform">
        <MessageCircle size={28} className="text-white" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-indigo-900 border-t border-white/10 flex items-center justify-around px-2 z-[150] rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <MobileNavItem to="/" icon={<Home size={24} />} label={t.playNow} active={isActive('/')} />
        <MobileNavItem to="/wallet" icon={<Plus size={24} className="bg-emerald rounded-full p-0.5" />} label={t.addCash} active={isActive('/wallet')} />
        <MobileNavItem to="/profile" icon={<Share2 size={24} />} label={t.referral} active={isActive('/profile')} />
        <MobileNavItem to="/wallet?tab=withdraw" icon={<WalletIco size={24} />} label={t.wallet} active={location.pathname === '/wallet' && location.search.includes('tab=withdraw')} />
        {user?.isAdmin && (
          <MobileNavItem to="/admin" icon={<Shield size={24} />} label={t.admin} active={isActive('/admin')} />
        )}
      </nav>
    </div>
  );
};

const MobileNavItem = ({ to, icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 h-full ${active ? 'text-electric' : 'text-slate-500'}`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110 -translate-y-1' : ''}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-60'}`}>
      {label}
    </span>
    {active && <div className="w-1 h-1 bg-electric rounded-full mt-0.5 animate-fade-in" />}
  </Link>
);

export default Layout;

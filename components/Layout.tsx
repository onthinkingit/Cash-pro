import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Home, Plus, User as UserIcon, Share2, Bell, X, Wallet as WalletIco, BrainCircuit, Gamepad2, Languages } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AIChat from './AIChat';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, lang, setLang, notifications, markNotificationsRead } = useApp();
  const t = translations[lang];
  const location = useLocation();
  const navigate = useNavigate();

  const [showMessages, setShowMessages] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  
  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleOpenMessages = () => {
    setShowMessages(true);
    if (user) markNotificationsRead(user.id);
  };

  const toggleLanguage = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  return (
    <div className="min-h-screen bg-brand-black text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Notifications Modal */}
      {showMessages && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-brand-black/90 backdrop-blur-2xl animate-in fade-in">
           <div className="bg-brand-dark w-full max-w-md rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-slide-up">
              <div className="p-8 bg-white/5 border-b border-white/5 flex items-center justify-between">
                 <h2 className="text-2xl font-bebas tracking-widest text-white flex items-center gap-4">
                   <Bell className="text-brand-accent" size={24} />
                   NOTIFICATIONS
                 </h2>
                 <button onClick={() => setShowMessages(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                   <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-auto p-8 space-y-4">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-20 text-slate-500">
                    <p className="text-sm font-medium">{t.noMessages}</p>
                  </div>
                ) : userNotifications.map(n => (
                  <div key={n.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 animate-in slide-in-from-right-4">
                    <p className="text-sm leading-relaxed text-slate-200">{n.message}</p>
                    <p className="text-[10px] text-slate-500 mt-3 font-black uppercase tracking-widest">{new Date(n.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* AI Strategist Chat */}
      {showAIChat && <AIChat onClose={() => setShowAIChat(false)} />}

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-brand-black/80 backdrop-blur-xl border-b border-white/5">
        <Link to="/profile" className="flex items-center gap-3">
           <div className="w-11 h-11 bg-brand-dark rounded-2xl border border-white/10 overflow-hidden shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={22} className="text-brand-accent" />
              )}
           </div>
        </Link>
        
        <div className="flex items-center gap-3">
           {user && (
             <div onClick={() => navigate('/wallet')} className="flex items-center gap-3 bg-brand-dark px-4 py-2.5 rounded-2xl cursor-pointer border border-white/5 shadow-inner hover:border-brand-accent/50 transition-all active:scale-95 group">
                <span className="text-sm font-bold text-brand-success flex items-center gap-1.5">
                   <span className="text-xs">৳</span>{(user.cashBalance + user.bonusBalance).toFixed(2)}
                </span>
                <Plus size={14} className="text-slate-500 group-hover:text-brand-accent transition-colors" />
             </div>
           )}
           
           <div className="flex items-center gap-2">
              <button 
                onClick={toggleLanguage} 
                className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all active:scale-90 flex items-center gap-2"
              >
                <Languages size={18} className="text-brand-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {lang === 'bn' ? 'EN' : 'বাং'}
                </span>
              </button>

              <button onClick={handleOpenMessages} className="relative p-2.5 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl">
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-brand-secondary text-[9px] flex items-center justify-center rounded-full font-black border-2 border-brand-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto p-6 pb-32">
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* AI Floating Button - Hidden only in specific game states if needed, but keeping consistently available for now */}
      {!location.pathname.includes('/game') && (
        <button 
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-28 right-6 w-16 h-16 bg-brand-accent rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-accent/30 z-[100] active:scale-90 transition-transform border-4 border-brand-black animate-bounce"
        >
          <BrainCircuit size={32} className="text-brand-black" />
        </button>
      )}

      {/* Bottom Navigation - Always visible */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-brand-black/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-6 z-[200] rounded-t-[3rem] shadow-2xl">
        <MobileNavItem to="/" icon={<Home size={24} />} label={t.playNow} active={isActive('/')} />
        <MobileNavItem to="/wallet" icon={<Plus size={24} className="bg-brand-accent text-brand-black rounded-xl p-0.5" />} label={t.addCash} active={isActive('/wallet')} />
        <Link to="/games" className="w-16 h-16 -mt-10 bg-brand-dark rounded-[2rem] border-4 border-brand-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
          <Gamepad2 size={32} className={`${isActive('/games') ? 'text-brand-gold' : 'text-brand-accent'}`} />
        </Link>
        <MobileNavItem to="/profile" icon={<Share2 size={24} />} label={t.referral} active={isActive('/profile')} />
        <MobileNavItem to="/wallet?tab=withdraw" icon={<WalletIco size={24} />} label={t.withdraw} active={location.pathname === '/wallet' && location.search.includes('tab=withdraw')} />
      </nav>
    </div>
  );
};

const MobileNavItem = ({ to, icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center gap-2 transition-all flex-1 h-full ${active ? 'text-brand-accent' : 'text-slate-500'}`}
  >
    <div className={`transition-all duration-300 ${active ? 'scale-110 translate-y-[-4px]' : 'opacity-60'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>
      {label}
    </span>
  </Link>
);

export default Layout;
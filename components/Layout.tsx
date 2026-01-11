
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Home, Wallet, User as UserIcon, Shield, LogOut, MessageSquare, Bell, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, lang, setLang, notifications, markNotificationsRead } = useApp();
  const t = translations[lang];
  const location = useLocation();

  const [showMessages, setShowMessages] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  
  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleOpenMessages = () => {
    setShowMessages(true);
    if (user) markNotificationsRead(user.id);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-24 bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/10 blur-[100px]"></div>
      </div>

      {/* Messages Modal */}
      {showMessages && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
              <div className="p-6 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                 <h2 className="text-2xl font-bebas tracking-widest flex items-center gap-2">
                   <Bell className="text-amber-500" />
                   {t.messages}
                 </h2>
                 <button onClick={() => setShowMessages(false)} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                   <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-4 custom-scrollbar">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-16 text-slate-600">
                    <MessageSquare size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium">{t.noMessages}</p>
                  </div>
                ) : userNotifications.map(n => (
                  <div key={n.id} className="bg-slate-950/50 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <p className="text-sm leading-relaxed text-slate-300">{n.message}</p>
                    <p className="text-[10px] text-slate-600 mt-3 font-mono font-bold">{new Date(n.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-24 bg-slate-900 border-r border-slate-800 items-center py-10 space-y-10 z-50">
        <Link to="/" className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center font-bebas text-3xl overflow-hidden shadow-lg shadow-orange-500/20 transform hover:rotate-6 transition-transform">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            "W"
          )}
        </Link>
        
        <div className="flex flex-col space-y-4 flex-1">
          <NavItem to="/" icon={<Home size={28} />} label={t.playNow} active={isActive('/')} />
          <NavItem to="/wallet" icon={<Wallet size={28} />} label={t.wallet} active={isActive('/wallet')} />
          <NavItem to="/profile" icon={<UserIcon size={28} />} label={t.profile} active={isActive('/profile')} />
          {user?.isAdmin && (
            <NavItem to="/admin" icon={<Shield size={28} />} label={t.admin} active={isActive('/admin')} />
          )}
        </div>

        <div className="space-y-6 flex flex-col items-center">
          <button 
            onClick={handleOpenMessages}
            className="p-4 rounded-2xl transition-all duration-200 group relative text-slate-500 hover:bg-slate-800 hover:text-amber-500"
          >
            <div className="relative">
              <Bell size={28} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-slate-900">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>
          
          <button 
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            {lang.toUpperCase()}
          </button>
          
          <button onClick={() => setUser(null)} className="p-4 text-slate-600 hover:text-red-500 transition-colors">
            <LogOut size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-5 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center font-bebas text-2xl overflow-hidden shadow-lg shadow-orange-500/20">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                "W"
              )}
           </div>
           <span className="font-bebas text-2xl tracking-[0.1em] text-white">WIN CASH PRO</span>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleOpenMessages}
             className="relative p-2 text-slate-500 hover:text-amber-500 transition-colors"
           >
             <Bell size={22} />
             {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[8px] flex items-center justify-center rounded-full font-black border-2 border-slate-900">
                {unreadCount}
              </span>
            )}
           </button>
           
           {user && (
             <div className="bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 text-right">
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Wallet</p>
                <p className="text-sm font-black text-amber-500">৳{user.cashBalance + user.bonusBalance}</p>
             </div>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-5 md:p-12 relative z-10">
        <div className="page-transition h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden flex fixed bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 h-20 items-center justify-around px-2 z-[60] rounded-3xl shadow-2xl">
        <MobileNavItem to="/" icon={<Home size={26} />} active={isActive('/')} />
        <MobileNavItem to="/wallet" icon={<Wallet size={26} />} active={isActive('/wallet')} />
        <MobileNavItem to="/profile" icon={<UserIcon size={26} />} active={isActive('/profile')} />
        {user?.isAdmin && (
          <MobileNavItem to="/admin" icon={<Shield size={26} />} active={isActive('/admin')} />
        )}
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`p-4 rounded-2xl transition-all duration-300 group relative ${active ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
  >
    {icon}
    <span className="absolute left-full ml-6 px-3 py-1.5 bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-slate-700">
      {label}
    </span>
  </Link>
);

const MobileNavItem = ({ to, icon, active }: any) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${active ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-800'}`}
  >
    {icon}
  </Link>
);

export default Layout;

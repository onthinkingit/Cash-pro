
import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Home, Wallet, User as UserIcon, Shield, LogOut, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, lang, setLang } = useApp();
  const t = translations[lang];
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-20 bg-slate-900 text-white flex flex-col">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-slate-800 border-r border-slate-700 items-center py-8 space-y-8 z-50">
        <Link to="/" className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center font-bebas text-2xl overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            "W"
          )}
        </Link>
        <NavItem to="/" icon={<Home />} label={t.playNow} active={isActive('/')} />
        <NavItem to="/wallet" icon={<Wallet />} label={t.wallet} active={isActive('/wallet')} />
        <NavItem to="/profile" icon={<UserIcon />} label={t.profile} active={isActive('/profile')} />
        {user?.isAdmin && (
          <NavItem to="/admin" icon={<Shield />} label={t.admin} active={isActive('/admin')} />
        )}
        <div className="mt-auto space-y-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold"
          >
            {lang.toUpperCase()}
          </button>
          <button onClick={() => setUser(null)} className="p-3 text-slate-400 hover:text-red-400">
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bebas text-xl overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                "W"
              )}
           </div>
           <span className="font-bebas text-xl tracking-wider">WIN CASH PRO</span>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
             className="px-2 py-1 rounded bg-slate-700 text-xs font-bold"
           >
             {lang.toUpperCase()}
           </button>
           {user && (
             <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Balance</p>
                <p className="text-sm font-bold text-amber-400">৳{user.cashBalance + user.bonusBalance}</p>
             </div>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-7xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden flex fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 h-16 items-center justify-around px-2 z-50">
        <MobileNavItem to="/" icon={<Home />} active={isActive('/')} />
        <MobileNavItem to="/wallet" icon={<Wallet />} active={isActive('/wallet')} />
        <MobileNavItem to="/profile" icon={<UserIcon />} active={isActive('/profile')} />
        {user?.isAdmin && (
          <MobileNavItem to="/admin" icon={<Shield />} active={isActive('/admin')} />
        )}
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`p-3 rounded-xl transition-all duration-200 group relative ${active ? 'bg-amber-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
  >
    {icon}
    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </span>
  </Link>
);

const MobileNavItem = ({ to, icon, active }: any) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${active ? 'text-amber-500' : 'text-slate-400'}`}
  >
    {icon}
  </Link>
);

export default Layout;

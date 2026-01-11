
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Send, Users, User, Trophy, Zap, ChevronRight, Play, AlertCircle, XCircle, Wallet, Frown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Home: React.FC = () => {
  const { lang, settings, user } = useApp();
  const t = translations[lang];
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedFee, setSelectedFee] = useState<number>(settings.matchFees[0] || 12);
  const [mode, setMode] = useState<'2P' | '4P'>('2P');
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success'; action?: { label: string; onClick: () => void } } | null>(null);

  useEffect(() => {
    // Handle game results passed via location state
    if (location.state?.gameResult) {
      const { gameResult, prize } = location.state;
      if (gameResult === 'win') {
        showFeedback(
          `${t.win}! ${t.totalPrize.replace('{amount}', prize)}`, 
          'success'
        );
      } else {
        showFeedback(t.lose, 'error');
      }
      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const showFeedback = (message: string, type: 'error' | 'success', action?: { label: string; onClick: () => void }) => {
    setToast({ message, type, action });
    if (!action) {
      setTimeout(() => setToast(null), 5000);
    }
  };

  const playersCount = mode === '2P' ? 2 : 4;
  const totalPool = selectedFee * playersCount;
  const prizePool = totalPool * (1 - settings.commissionRate);

  const handleStartMatch = () => {
    if (!user) return;
    
    // Check for block status
    if (user.status === 'banned') {
      showFeedback(t.bannedError, 'error');
      return;
    }

    const totalBalance = user.cashBalance + user.bonusBalance;
    if (totalBalance < selectedFee) {
      showFeedback(
        t.insufficientBalance, 
        'error', 
        { 
          label: t.deposit, 
          onClick: () => navigate('/wallet?tab=deposit') 
        }
      );
      return;
    }

    setShowEntryDialog(false);
    navigate(`/game?fee=${selectedFee}&mode=${mode}`);
  };

  return (
    <div className="space-y-6 animate-in slide-up duration-500 relative">
      {/* Dynamic Toast Feedback */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-sm animate-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl flex flex-col gap-3 border backdrop-blur-md ${
            toast.type === 'error' ? 'bg-red-600/90 border-white/20 text-white' : 'bg-emerald/90 border-white/20 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                {toast.message.includes(t.win) ? <Trophy size={24} className="text-amber-300" /> : 
                 toast.type === 'error' ? <AlertCircle size={24} /> : <Zap size={24} />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-full">
                <XCircle size={18} />
              </button>
            </div>
            {toast.action && (
              <button 
                onClick={() => {
                  toast.action?.onClick();
                  setToast(null);
                }}
                className="w-full bg-white text-indigo-900 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <Wallet size={14} />
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selection Modal */}
      {showEntryDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-indigo-950 w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 space-y-8 animate-slide-up shadow-2xl">
            <h2 className="text-3xl font-bebas text-center tracking-widest">{t.chooseMode}</h2>
            
            <div className="space-y-4">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">{t.entryFee} (Per Person)</p>
              <div className="grid grid-cols-3 gap-3">
                {settings.matchFees.map(fee => (
                  <button 
                    key={fee} 
                    onClick={() => setSelectedFee(fee)}
                    className={`py-3 rounded-xl font-bebas text-xl border transition-all ${selectedFee === fee ? 'bg-electric border-electric text-white scale-105 shadow-lg shadow-electric/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'}`}
                  >
                    ৳{fee}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">Players</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setMode('2P')}
                  className={`flex-1 py-4 rounded-2xl font-bebas text-2xl border transition-all ${mode === '2P' ? 'bg-indigo-800 border-electric text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}
                >
                  2 Players
                </button>
                <button 
                  onClick={() => setMode('4P')}
                  className={`flex-1 py-4 rounded-2xl font-bebas text-2xl border transition-all ${mode === '4P' ? 'bg-indigo-800 border-electric text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}
                >
                  4 Players
                </button>
              </div>
            </div>

            <div className="bg-emerald/10 p-4 rounded-2xl border border-emerald/20 text-center">
               <p className="text-[10px] text-emerald font-black uppercase tracking-widest mb-1">{t.prize}</p>
               <p className="text-3xl font-bebas text-emerald tracking-widest">৳{prizePool.toFixed(0)}</p>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                onClick={() => setShowEntryDialog(false)}
                className="flex-1 py-4 bg-white/5 rounded-2xl font-bebas text-2xl tracking-widest text-slate-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleStartMatch}
                className="flex-[2] py-4 bg-emerald rounded-2xl font-bebas text-2xl tracking-widest text-white glossy-btn shadow-lg shadow-emerald/20 active:scale-95"
              >
                {t.playNow}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero LUDO Card */}
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-800 to-indigo-950 p-10 shadow-2xl border border-white/10 text-center flex flex-col items-center">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform">
          <Zap size={180} />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
          </div>
          
          <h1 className="text-7xl font-bebas tracking-[0.2em] text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">LUDO</h1>
          
          <button 
            onClick={() => setShowEntryDialog(true)}
            className="w-full bg-white text-indigo-950 px-12 py-5 rounded-[2rem] font-bebas text-3xl tracking-widest shadow-2xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3 glossy-btn"
          >
            <Play fill="currentColor" size={28} />
            {t.playNow}
          </button>
        </div>
      </div>

      {/* Join Telegram Banner */}
      <div className="flex items-center justify-between p-5 bg-electric rounded-3xl shadow-lg shadow-electric/20 overflow-hidden relative">
        <div className="flex items-center gap-4 z-10">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Send size={24} className="text-white fill-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">{t.joinTelegram}</span>
        </div>
        <a 
          href={settings.telegramLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white text-electric px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl z-10 active:scale-95"
        >
          {t.joinNow}
        </a>
      </div>

      {/* Game Grid Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bebas tracking-[0.1em] px-2">{t.allGames}</h2>
        <div className="grid grid-cols-2 gap-4">
           <GameTile 
             title={t.ludo} 
             mode="Classic" 
             color="bg-gradient-to-br from-indigo-700 to-indigo-900" 
             icon={<User size={32} />}
             onClick={() => setShowEntryDialog(true)}
           />
           <GameTile 
             title={t.speedLudo} 
             mode="Fast" 
             color="bg-gradient-to-br from-electric to-indigo-700" 
             icon={<Zap size={32} />}
             onClick={() => setShowEntryDialog(true)}
           />
           <GameTile 
             title={t.tezzLeedo} 
             mode="Pro" 
             color="bg-gradient-to-br from-purple-600 to-indigo-950" 
             icon={<Trophy size={32} />}
             onClick={() => setShowEntryDialog(true)}
           />
        </div>
      </div>
      
      {/* Online Players Indicator */}
      <div className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="w-2 h-2 rounded-full bg-emerald animate-pulse"></div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">2,841 {t.playersOnline}</span>
      </div>
    </div>
  );
};

const GameTile = ({ title, mode, color, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`${color} rounded-[2.5rem] p-6 flex flex-col items-start text-left shadow-xl border border-white/10 group active:scale-95 transition-all overflow-hidden relative`}
  >
    <div className="p-3 bg-white/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="relative z-10">
      <p className="text-[10px] uppercase font-black text-white/50 tracking-[0.2em] mb-1">{mode}</p>
      <h3 className="text-xl font-bebas tracking-widest text-white leading-tight">{title}</h3>
    </div>
    <ChevronRight className="absolute bottom-6 right-6 text-white/20" size={24} />
  </button>
);

export default Home;

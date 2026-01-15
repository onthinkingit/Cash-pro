
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Trophy, Zap, ChevronRight, Play, AlertCircle, XCircle, Award, ShieldCheck, Coins, Sparkles, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlayerColor } from '../types';
import { COLORS } from '../constants';

const Home: React.FC = () => {
  const { lang, settings, user } = useApp();
  const t = translations[lang];
  const navigate = useNavigate();

  const [selectedFee, setSelectedFee] = useState<number>(settings.matchFees[0] || 12);
  const [mode, setMode] = useState<'2P' | '3P' | '4P'>('2P');
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('GREEN');
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showFeedback = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const getMultiplier = () => {
    if (mode === '2P') return 2;
    if (mode === '3P') return 3;
    return 4;
  };

  const prizePool = (selectedFee * getMultiplier() * (1 - settings.commissionRate)).toFixed(0);
  const isInsufficient = user ? (user.cashBalance + user.bonusBalance) < selectedFee : true;

  const handleStartMatch = () => {
    if (!user) return;
    if (user.status === 'banned') {
      showFeedback(t.bannedError, 'error');
      return;
    }
    
    // Allow start if it's Practice Mode (selectedFee === 0)
    if (selectedFee > 0 && isInsufficient) {
      showFeedback(t.insufficientBalance, 'error');
      return;
    }
    
    setShowEntryDialog(false);
    navigate(`/game?fee=${selectedFee}&mode=${mode}&color=${selectedColor}`);
  };

  return (
    <div className="space-y-6 animate-in slide-up duration-700 pb-28 font-sans">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-sm animate-in slide-in-from-top-4">
          <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            toast.type === 'error' ? 'bg-brand-secondary/90 border-white/20' : 'bg-brand-success/90 border-white/20'
          }`}>
            <AlertCircle size={20} className="text-white" />
            <p className="text-xs font-semibold text-white flex-1">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Main Hero Showcase */}
      <div className="relative p-8 bg-brand-dark rounded-[3rem] border border-white/5 overflow-hidden flex flex-col items-center text-center ludo-board-base">
         <div className="absolute top-0 right-0 w-72 h-72 bg-brand-accent/5 blur-[100px] -mr-32 -mt-32"></div>
         <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-secondary/5 blur-[100px] -ml-32 -mb-32"></div>
         
         <div className="relative z-10 space-y-6 w-full">
            <div className="flex items-center justify-center gap-3">
               <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 backdrop-blur-md">
                  <ShieldCheck size={12} className="text-brand-accent" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">Secure PvP Infrastructure</span>
               </div>
            </div>
            
            <div className="space-y-1">
               <h1 className="text-4xl font-bebas tracking-normal text-white leading-tight">LUDO ARENA PRO</h1>
               <div className="h-0.5 w-10 bg-brand-accent mx-auto rounded-full"></div>
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest pt-1">{t.proStandard}</p>
            </div>
            
            <button 
              onClick={() => setShowEntryDialog(true)}
              className="w-full bg-brand-accent text-brand-black px-8 py-4 rounded-[2rem] font-bebas text-2xl tracking-wide shadow-2xl shadow-brand-accent/20 active:scale-95 transition-all flex items-center justify-center gap-2 btn-premium group"
            >
              <Play fill="currentColor" size={20} className="group-hover:translate-x-1 transition-transform" /> 
              {t.battleNow}
            </button>
         </div>
      </div>

      {/* Match Setup Popup */}
      {showEntryDialog && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-brand-black/98 backdrop-blur-3xl animate-in fade-in">
          <div className="bg-brand-dark w-full max-w-sm rounded-[3rem] border border-white/10 p-6 space-y-6 shadow-2xl animate-in slide-up relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-2 sticky top-0 bg-brand-dark z-10 py-2">
               <h2 className="text-2xl font-bebas tracking-wide text-white">{t.arenaSetup}</h2>
               <button onClick={() => setShowEntryDialog(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all"><XCircle size={20} className="text-slate-500" /></button>
            </div>
            
            <div className="space-y-3">
              <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider ml-1">{t.chooseMode}</label>
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-brand-black rounded-xl border border-white/5">
                <button onClick={() => setMode('2P')} className={`py-3 rounded-lg flex items-center justify-center gap-2 font-bebas text-lg tracking-wide transition-all ${mode === '2P' ? 'bg-brand-accent text-brand-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>2P</button>
                <button onClick={() => setMode('3P')} className={`py-3 rounded-lg flex items-center justify-center gap-2 font-bebas text-lg tracking-wide transition-all ${mode === '3P' ? 'bg-brand-accent text-brand-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>3P</button>
                <button onClick={() => setMode('4P')} className={`py-3 rounded-lg flex items-center justify-center gap-2 font-bebas text-lg tracking-wide transition-all ${mode === '4P' ? 'bg-brand-accent text-brand-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>4P</button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider ml-1">Arena Color</label>
              <div className="grid grid-cols-4 gap-3">
                {(['GREEN', 'YELLOW', 'BLUE', 'RED'] as PlayerColor[]).map((color) => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center relative overflow-hidden ${selectedColor === color ? 'border-white scale-105 shadow-xl z-10' : 'border-transparent opacity-40 hover:opacity-100'}`}
                    style={{ backgroundColor: COLORS[color] }}
                  >
                    {selectedColor === color && <Check className="text-white relative z-10" size={18} strokeWidth={3} />}
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider ml-1">{t.entryFee}</label>
              <div className="grid grid-cols-3 gap-2">
                {/* Practice Mode Option */}
                <button 
                  onClick={() => setSelectedFee(0)}
                  className={`py-3 rounded-xl font-bebas text-xl border-2 transition-all relative overflow-hidden group ${selectedFee === 0 ? 'bg-brand-success border-brand-success text-brand-black shadow-lg scale-105' : 'bg-brand-black border-white/5 text-brand-success/60 hover:border-brand-success/30'}`}
                >
                  <span className="relative z-10">{t.free}</span>
                  <div className="absolute top-0 right-0 p-1 bg-white/10 group-hover:rotate-12 transition-transform">
                    <Info size={8} />
                  </div>
                </button>
                {settings.matchFees.map(fee => (
                  <button 
                    key={fee} 
                    onClick={() => setSelectedFee(fee)}
                    className={`py-3 rounded-xl font-bebas text-xl border-2 transition-all ${selectedFee === fee ? 'bg-brand-accent border-brand-accent text-brand-black shadow-lg scale-105' : 'bg-brand-black border-white/5 text-slate-500 hover:border-white/20'}`}
                  >৳{fee}</button>
                ))}
              </div>
            </div>

            {selectedFee === 0 ? (
               <div className="p-6 bg-brand-success/5 rounded-[2rem] border border-brand-success/20 text-center">
                  <p className="text-[9px] text-brand-success font-black uppercase tracking-widest mb-1">{t.practiceMode}</p>
                  <h4 className="text-2xl font-bebas text-white tracking-wide leading-none">{t.noStakes}</h4>
               </div>
            ) : (
               <div className="p-6 bg-brand-black/40 rounded-[2rem] border border-white/10 text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Trophy size={60} /></div>
                  <p className="text-[9px] text-brand-accent font-black uppercase tracking-widest mb-1">{t.prize}</p>
                  <h4 className="text-4xl font-bebas text-white tracking-wide leading-none">৳{prizePool}</h4>
               </div>
            )}

            {selectedFee > 0 && isInsufficient ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-brand-secondary/10 border border-brand-secondary/30 rounded-2xl animate-in fade-in">
                  <AlertCircle size={18} className="text-brand-secondary shrink-0" />
                  <p className="text-[10px] font-bold text-slate-300 leading-tight">
                    {t.insufficientBalance}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/wallet')} 
                  className="w-full py-4 bg-brand-secondary text-white rounded-[1.5rem] font-bebas text-2xl tracking-wide shadow-2xl shadow-brand-secondary/20 transition-all btn-premium flex items-center justify-center gap-3"
                >
                  <Coins size={20} />
                  {t.depositNow}
                </button>
              </div>
            ) : (
              <button 
                onClick={handleStartMatch} 
                className="w-full py-4 bg-brand-accent rounded-[1.5rem] font-bebas text-2xl tracking-wide text-brand-black shadow-2xl shadow-brand-accent/20 transition-all btn-premium"
              >
                {t.confirmBattle}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid Features */}
      <div className="grid grid-cols-2 gap-4">
         <FeatureCard title={t.proClassic} label={t.competitive} icon={<Trophy className="text-brand-accent" size={20} />} onClick={() => setShowEntryDialog(true)} />
         <FeatureCard title={t.blitz} label={t.fastAction} icon={<Zap className="text-brand-gold" size={20} />} onClick={() => setShowEntryDialog(true)} />
         <FeatureCard title={t.tourney} label={t.seasonPass} icon={<Award className="text-brand-secondary" size={20} />} onClick={() => setShowEntryDialog(true)} />
         <FeatureCard title={t.cashier} label={t.withdrawals} icon={<Coins className="text-brand-success" size={20} />} onClick={() => navigate('/wallet')} />
      </div>

      {/* Refer Card */}
      <div onClick={() => navigate('/profile')} className="p-8 bg-brand-dark rounded-[2.5rem] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-brand-accent/20 transition-all ludo-board-base relative overflow-hidden">
         <div className="absolute top-0 left-0 w-32 h-32 bg-brand-accent/5 blur-[60px] -ml-16 -mt-16"></div>
         <div className="flex items-center gap-6 z-10">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform border border-white/10 shadow-2xl">
               <Sparkles className="text-brand-gold" size={20} />
            </div>
            <div>
               <p className="text-xl font-bebas text-white tracking-wide leading-none">{t.affiliateProgram}</p>
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mt-1.5">{t.earnBonus}</p>
            </div>
         </div>
         <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-accent transition-all">
            <ChevronRight size={20} className="text-slate-600 group-hover:text-brand-black transition-all" />
         </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, label, icon, onClick }: any) => (
  <button onClick={onClick} className="bg-brand-dark p-6 rounded-[2rem] border border-white/5 flex flex-col items-center gap-4 group active:scale-95 transition-all text-center ludo-board-base relative overflow-hidden">
    <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xl border border-white/10">{icon}</div>
    <div>
      <h3 className="text-xl font-bebas tracking-wide text-white leading-none">{title}</h3>
      <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider mt-1.5">{label}</p>
    </div>
  </button>
);

export default Home;

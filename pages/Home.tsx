
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Send, Users, User, Trophy, Zap, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { lang, settings, user } = useApp();
  const t = translations[lang];
  const navigate = useNavigate();

  const [selectedFee, setSelectedFee] = useState<number>(10);
  const [mode, setMode] = useState<'2P' | '4P'>('2P');

  const fees = [10, 25, 50, 100, 250, 500, 1000];

  const handleStartMatch = () => {
    if (!user) return;
    const totalBalance = user.cashBalance + user.bonusBalance;
    if (totalBalance < selectedFee) {
      alert(lang === 'en' ? 'Insufficient balance!' : 'পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }
    navigate(`/game?fee=${selectedFee}&mode=${mode}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 shadow-2xl shadow-amber-500/20">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bebas tracking-wider mb-2">{t.welcome}</h1>
          <p className="text-amber-100 max-w-md opacity-90">
            {lang === 'en' ? 'Challenge players across Bangladesh and win real cash in every roll!' : 'সারা বাংলাদেশের খেলোয়াড়দের চ্যালেঞ্জ করুন এবং প্রতিটি রোলে আসল টাকা জিতে নিন!'}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a 
              href={settings.telegramLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-orange-50 transition-colors shadow-lg"
            >
              <Send size={20} fill="currentColor" />
              {t.joinTelegram}
            </a>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="font-medium">1,248 {t.playersOnline}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Zap size={200} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-800 rounded-3xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bebas tracking-widest mb-6 flex items-center gap-2">
            <Trophy className="text-amber-500" />
            {t.chooseMode}
          </h2>

          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setMode('2P')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all ${mode === '2P' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-900/50'}`}
            >
              <User size={32} className={`mx-auto mb-2 ${mode === '2P' ? 'text-amber-500' : 'text-slate-500'}`} />
              <p className="font-bold">2 Players</p>
              <p className="text-xs text-slate-400">1 vs 1 Battle</p>
            </button>
            <button 
              onClick={() => setMode('4P')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all ${mode === '4P' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-900/50'}`}
            >
              <Users size={32} className={`mx-auto mb-2 ${mode === '4P' ? 'text-amber-500' : 'text-slate-500'}`} />
              <p className="font-bold">4 Players</p>
              <p className="text-xs text-slate-400">Free For All</p>
            </button>
          </div>

          <p className="text-sm text-slate-400 mb-4 font-bold uppercase tracking-wider">{t.entryFee}</p>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {fees.map(fee => (
              <button
                key={fee}
                onClick={() => setSelectedFee(fee)}
                className={`py-3 rounded-xl font-bold transition-all ${selectedFee === fee ? 'bg-amber-500 text-white scale-105 shadow-lg shadow-amber-500/30' : 'bg-slate-900 text-slate-400 border border-slate-700'}`}
              >
                ৳{fee}
              </button>
            ))}
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-700">
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-wider">{t.prize}</p>
              <p className="text-4xl font-bebas text-amber-400 tracking-widest">
                ৳{(selectedFee * (mode === '2P' ? 2 : 4) * (1 - settings.commissionRate)).toFixed(0)}
              </p>
              <p className="text-[10px] text-slate-500">6% {t.commission} included</p>
            </div>
            <button 
              onClick={handleStartMatch}
              className="w-full md:w-auto px-12 py-4 bg-amber-500 hover:bg-amber-600 rounded-2xl font-bebas text-2xl tracking-widest transition-transform active:scale-95 shadow-xl shadow-amber-500/20"
            >
              {t.startMatch}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
            <h3 className="text-lg font-bebas tracking-wider mb-4">{t.level} System</h3>
            <div className="space-y-4">
              <LevelBadge name="Super Man" range="81-100%" color="bg-purple-500" />
              <LevelBadge name="Golden" range="51-80%" color="bg-amber-500" />
              <LevelBadge name="Plutonium" range="31-50%" color="bg-cyan-500" />
              <LevelBadge name="Silver" range="0-30%" color="bg-slate-400" />
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700 flex items-center gap-2 text-xs text-slate-400">
              <Info size={14} />
              Levels are based on your win percentage
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-lg font-bebas tracking-wider text-white mb-2">Refer & Earn</h3>
            <p className="text-indigo-100 text-sm mb-4">Invite friends and get ৳15 bonus balance for every signup!</p>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors"
            >
              Copy Referral ID
            </button>
            <Send className="absolute -bottom-4 -right-4 text-white/10" size={100} />
          </div>
        </div>
      </div>
    </div>
  );
};

const LevelBadge = ({ name, range, color }: any) => (
  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700/50">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="font-bold text-sm">{name}</span>
    </div>
    <span className="text-xs text-slate-500 font-mono">{range}</span>
  </div>
);

export default Home;

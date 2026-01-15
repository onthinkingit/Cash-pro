
import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { useNavigate } from 'react-router-dom';
import { Trophy, Zap, Clock, Star, ChevronRight, Gamepad2, Sparkles, Flame } from 'lucide-react';

const Games: React.FC = () => {
  const { lang } = useApp();
  const t = translations[lang];
  const navigate = useNavigate();

  const gameList = [
    {
      id: 'ludo-classic',
      title: t.ludo || 'Ludo Classic',
      desc: 'The timeless professional board game experience.',
      icon: <Trophy className="text-brand-accent" size={32} />,
      badge: 'POPULAR',
      color: 'from-blue-500/20 to-brand-accent/20',
      tag: 'Classic'
    },
    {
      id: 'speed-ludo',
      title: t.speedLudo || 'Speed Ludo',
      desc: 'Double the speed, triple the excitement. Play fast!',
      icon: <Zap className="text-brand-gold" size={32} />,
      badge: 'HOT',
      color: 'from-amber-500/20 to-brand-gold/20',
      tag: 'Fast'
    },
    {
      id: 'tezz-leedo',
      title: t.tezzLeedo || 'Tezz Leedo',
      desc: 'A rapid variation for elite strategists.',
      icon: <Flame className="text-brand-secondary" size={32} />,
      badge: 'NEW',
      color: 'from-rose-500/20 to-brand-secondary/20',
      tag: 'Blitz'
    },
    {
      id: 'tourney',
      title: t.tourney || 'Tournaments',
      desc: 'Compete for massive prize pools in daily events.',
      icon: <Star className="text-brand-success" size={32} />,
      badge: 'LIVE',
      color: 'from-emerald-500/20 to-brand-success/20',
      tag: 'Events'
    }
  ];

  return (
    <div className="space-y-8 animate-in slide-up duration-700 pb-28 font-sans">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bebas tracking-widest text-white">{t.allGames || 'ARENA GAMES'}</h1>
        <div className="h-1 w-12 bg-brand-accent mx-auto rounded-full"></div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{t.proStandard}</p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 gap-6">
        {gameList.map((game) => (
          <div 
            key={game.id}
            onClick={() => navigate('/')}
            className="group relative bg-brand-dark rounded-[2.5rem] border border-white/5 overflow-hidden cursor-pointer hover:border-brand-accent/30 transition-all duration-500 ludo-board-base"
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative z-10 p-8 flex items-center gap-6">
              {/* Icon Container */}
              <div className="w-20 h-20 bg-brand-black/60 rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                {game.icon}
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bebas tracking-wide text-white leading-none">{game.title}</h3>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                    game.badge === 'HOT' ? 'bg-brand-secondary text-white' : 
                    game.badge === 'NEW' ? 'bg-brand-gold text-brand-black' : 
                    'bg-brand-accent text-brand-black'
                  }`}>
                    {game.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed pr-4">
                  {game.desc}
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    <Clock size={10} /> 5-10 MINS
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    <Sparkles size={10} className="text-brand-gold" /> {game.tag}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-accent transition-all duration-300">
                <ChevronRight size={20} className="text-slate-600 group-hover:text-brand-black transition-all" />
              </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-5 group-hover:animate-shine" style={{ pointerEvents: 'none' }}></div>
          </div>
        ))}
      </div>

      {/* Community Banner */}
      <div className="p-8 bg-brand-dark rounded-[2.5rem] border border-white/5 relative overflow-hidden text-center ludo-board-base">
         <div className="absolute top-0 left-0 w-32 h-32 bg-brand-secondary/5 blur-3xl -ml-16 -mt-16"></div>
         <div className="relative z-10">
            <Gamepad2 className="mx-auto text-brand-accent mb-4" size={32} />
            <h4 className="text-xl font-bebas text-white tracking-widest mb-1">MORE TITLES COMING SOON</h4>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Expansion Pack Phase 1.0</p>
         </div>
      </div>
    </div>
  );
};

export default Games;

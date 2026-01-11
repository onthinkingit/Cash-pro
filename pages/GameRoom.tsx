
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Trophy, User, ArrowLeft, RotateCw, Frown, Smile, Heart, Flame } from 'lucide-react';

const GameRoom: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, user, setUser, settings, addTransaction } = useApp();
  const t = translations[lang];

  const fee = parseInt(searchParams.get('fee') || '10');
  const mode = searchParams.get('mode') || '2P';

  const [gameState, setGameState] = useState<'searching' | 'playing' | 'ended'>('searching');
  const [countdown, setCountdown] = useState(5);
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [turn, setTurn] = useState(0); // 0 = Player, 1+ = Opponents
  const [missedTurns, setMissedTurns] = useState(0);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (gameState === 'searching') {
      const searchTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(searchTimer);
            setGameState('playing');
            deductFee();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(searchTimer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const gameTimer = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            if (turn === 0) {
              handleMissedTurn();
            } else {
              // Simulate opponent turn
              setTurn(0);
              setTimer(30);
            }
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(gameTimer);
    }
  }, [gameState, turn]);

  const handleMissedTurn = () => {
    const newMissed = missedTurns + 1;
    setMissedTurns(newMissed);
    alert(t.turnMissed);
    if (newMissed >= 3) {
      handleLoss();
    } else {
      setTurn(1);
      setTimer(30);
    }
  };

  const deductFee = () => {
    if (!user) return;
    let remainingFee = fee;
    let bonusUsed = 0;
    
    let newBonus = user.bonusBalance;
    let newCash = user.cashBalance;

    if (newBonus >= remainingFee) {
      bonusUsed = remainingFee;
      newBonus -= remainingFee;
      remainingFee = 0;
    } else {
      bonusUsed = newBonus;
      remainingFee -= newBonus;
      newBonus = 0;
      newCash -= remainingFee;
    }

    addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: 'match_fee',
      amount: fee,
      bonusUsed,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });

    setUser({ ...user, cashBalance: newCash, bonusBalance: newBonus, matchesPlayed: user.matchesPlayed + 1 });
  };

  const handleRoll = () => {
    if (rolling || turn !== 0) return;
    setRolling(true);
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceValue(val);
      setRolling(false);
      setTimer(30);
      
      // Simulating simple logic: 6 gives another turn, others pass
      if (val === 6) {
        setTurn(0);
      } else {
        // Random chance to win for demo purposes
        if (Math.random() > 0.9) handleWin();
        else setTurn(1);
      }
    }, 600);
  };

  const handleWin = () => {
    if (!user) return;
    const playersCount = mode === '2P' ? 2 : 4;
    const totalPool = fee * playersCount;
    const prize = totalPool * (1 - settings.commissionRate);

    addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: 'win',
      amount: prize,
      bonusUsed: 0,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });

    setUser({ 
      ...user, 
      cashBalance: user.cashBalance + prize, 
      wins: user.wins + 1,
      level: calculateLevel(user.wins + 1, user.matchesPlayed)
    });

    setGameState('ended');
  };

  const handleLoss = () => {
    if (!user) return;
    setUser({
      ...user,
      losses: user.losses + 1,
      level: calculateLevel(user.wins, user.matchesPlayed)
    });
    setGameState('ended');
  };

  const calculateLevel = (wins: number, total: number) => {
    const rate = (wins / total) * 100;
    if (rate >= 81) return 'Super Man' as any;
    if (rate >= 51) return 'Golden' as any;
    if (rate >= 31) return 'Plutonium' as any;
    return 'Silver' as any;
  };

  if (gameState === 'searching') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in zoom-in duration-500">
        <div className="relative">
          <div className="w-48 h-48 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bebas text-amber-500">{countdown}</span>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bebas tracking-widest text-white mb-2">{t.searching}</h2>
          <p className="text-slate-400">Mode: {mode} | Entry: ৳{fee}</p>
        </div>
        <div className="flex gap-4">
          <PlayerCard name={user?.username || 'You'} level={user?.level || 'Silver'} />
          <div className="w-12 h-px bg-slate-700 self-center"></div>
          <PlayerCard name="Waiting..." level="???" isSkeleton />
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const isWin = (user?.wins || 0) > (localStorage.getItem('last_wins') ? parseInt(localStorage.getItem('last_wins')!) : 0);
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-in zoom-in duration-500">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${isWin ? 'bg-amber-500 shadow-amber-500/50' : 'bg-slate-700'}`}>
          {isWin ? <Trophy size={64} className="text-white animate-bounce" /> : <Frown size={64} className="text-slate-400" />}
        </div>
        <div className="text-center">
          <h1 className={`text-6xl font-bebas tracking-wider mb-2 ${isWin ? 'text-amber-500' : 'text-slate-400'}`}>
            {isWin ? t.win : t.lose}
          </h1>
          {isWin && <p className="text-2xl text-slate-300">Prize: ৳{(fee * (mode === '2P' ? 2 : 4) * (1 - settings.commissionRate)).toFixed(0)}</p>}
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-12 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bebas text-2xl tracking-widest transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 h-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => { if(confirm('Exit game? Entry fee will be lost.')) navigate('/'); }} className="p-2 hover:bg-slate-700 rounded-xl transition-colors">
            <ArrowLeft />
          </button>
          <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20">
             Missed: {missedTurns}/3
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Prize Pool</p>
          <p className="text-xl font-bebas text-amber-500">৳{(fee * (mode === '2P' ? 2 : 4) * (1 - settings.commissionRate)).toFixed(0)}</p>
        </div>
        
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${timer < 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-slate-600 text-slate-300'}`}>
           {timer}
        </div>
      </div>

      <div className="relative w-full aspect-square max-w-md bg-white rounded shadow-2xl p-2 grid grid-cols-15 grid-rows-15 border-4 border-slate-800">
        {/* Simple Ludo Visual Simulation */}
        <div className="col-span-6 row-span-6 bg-red-500 rounded-sm border border-black/10 flex items-center justify-center">
           <div className="w-2/3 h-2/3 bg-white/20 rounded-full flex flex-wrap gap-2 p-4">
              {[1,2,3,4].map(i => <div key={i} className="w-5 h-5 bg-red-600 rounded-full shadow-lg border-2 border-white/50" />)}
           </div>
        </div>
        <div className="col-span-3 row-span-6 bg-slate-50 flex flex-wrap">
          {Array.from({length: 18}).map((_, i) => <div key={i} className="w-1/3 h-1/6 border border-slate-200" />)}
        </div>
        <div className="col-span-6 row-span-6 bg-green-500 rounded-sm border border-black/10 flex items-center justify-center">
           <div className="w-2/3 h-2/3 bg-white/20 rounded-full flex flex-wrap gap-2 p-4">
              {[1,2,3,4].map(i => <div key={i} className="w-5 h-5 bg-green-600 rounded-full shadow-lg border-2 border-white/50" />)}
           </div>
        </div>
        
        <div className="col-span-6 row-span-3 bg-slate-50 flex flex-wrap">
          {Array.from({length: 18}).map((_, i) => <div key={i} className="w-1/6 h-1/3 border border-slate-200" />)}
        </div>
        <div className="col-span-3 row-span-3 bg-slate-900 flex items-center justify-center text-amber-500 font-bebas text-2xl">
          PRO
        </div>
        <div className="col-span-6 row-span-3 bg-slate-50 flex flex-wrap">
          {Array.from({length: 18}).map((_, i) => <div key={i} className="w-1/6 h-1/3 border border-slate-200" />)}
        </div>

        <div className="col-span-6 row-span-6 bg-blue-500 rounded-sm border border-black/10 flex items-center justify-center">
           <div className="w-2/3 h-2/3 bg-white/20 rounded-full flex flex-wrap gap-2 p-4">
              {[1,2,3,4].map(i => <div key={i} className="w-5 h-5 bg-blue-600 rounded-full shadow-lg border-2 border-white/50" />)}
           </div>
        </div>
        <div className="col-span-3 row-span-6 bg-slate-50 flex flex-wrap">
          {Array.from({length: 18}).map((_, i) => <div key={i} className="w-1/3 h-1/6 border border-slate-200" />)}
        </div>
        <div className="col-span-6 row-span-6 bg-yellow-500 rounded-sm border border-black/10 flex items-center justify-center">
           <div className="w-2/3 h-2/3 bg-white/20 rounded-full flex flex-wrap gap-2 p-4">
              {[1,2,3,4].map(i => <div key={i} className="w-5 h-5 bg-yellow-600 rounded-full shadow-lg border-2 border-white/50" />)}
           </div>
        </div>
      </div>

      <div className="w-full flex justify-around items-center p-6 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl">
        <div className={`p-4 rounded-2xl transition-all ${turn === 0 ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : 'bg-slate-900 opacity-50 scale-95'}`}>
          <p className="text-[10px] uppercase font-bold text-center mb-1 text-white">Your Turn</p>
          <button 
            onClick={handleRoll}
            disabled={turn !== 0 || rolling}
            className="w-16 h-16 bg-white rounded-xl shadow-inner flex items-center justify-center transition-transform active:scale-90"
          >
            {rolling ? (
              <RotateCw className="animate-spin text-slate-800" size={32} />
            ) : (
              <span className="text-4xl font-bold text-slate-800">{diceValue}</span>
            )}
          </button>
        </div>
        
        <div className="text-center hidden md:block">
          <p className="text-slate-400 text-sm mb-2 font-bold uppercase tracking-widest">Reactions</p>
          <div className="flex gap-2">
            {[<Smile size={20}/>, <Frown size={20}/>, <Heart size={20}/>, <Flame size={20}/>].map((icon, idx) => (
              <button key={idx} className="w-10 h-10 bg-slate-700 text-amber-500 rounded-full hover:bg-slate-600 transition-colors flex items-center justify-center">
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-2xl transition-all ${turn !== 0 ? 'bg-indigo-500 shadow-lg shadow-indigo-500/30' : 'bg-slate-900 opacity-50 scale-95'}`}>
          <p className="text-[10px] uppercase font-bold text-center mb-1 text-white">Opponent</p>
          <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center">
             <User className="text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerCard = ({ name, level, isSkeleton }: any) => (
  <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-[140px] shadow-lg">
    <div className={`w-12 h-12 mx-auto rounded-full mb-2 flex items-center justify-center ${isSkeleton ? 'bg-slate-700 animate-pulse' : 'bg-amber-500'}`}>
      <User size={24} className={isSkeleton ? 'text-slate-600' : 'text-white'} />
    </div>
    <div className="text-center">
      <p className={`font-bold truncate ${isSkeleton ? 'text-slate-600' : 'text-white'}`}>{name}</p>
      <p className={`text-[10px] font-bold uppercase ${isSkeleton ? 'text-slate-700' : 'text-amber-500'}`}>{level}</p>
    </div>
  </div>
);

export default GameRoom;

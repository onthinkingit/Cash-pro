
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Trophy, User, RotateCw, Frown, LogOut, Star, Smile, AlertTriangle, AlertCircle } from 'lucide-react';

const EMOJIS = ['😂', '😍', '🔥', '😡', '👍', '👎', '🎉', '💩'];

const MOCK_OPPONENTS = [
  { username: 'LudoMaster99', level: 'Golden' },
  { username: 'King_Of_Dice', level: 'Plutonium' },
  { username: 'ProPlayer_X', level: 'Silver' },
  { username: 'WinMachine', level: 'Super Man' },
  { username: 'LuckyStar', level: 'Golden' },
  { username: 'Desi_Gamer', level: 'Plutonium' },
];

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
  const [turn, setTurn] = useState(0); // 0 = User, 1 = Opponent
  const [missedTurns, setMissedTurns] = useState(0);
  const [timer, setTimer] = useState(30);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojis, setActiveEmojis] = useState<{ id: number, emoji: string, isUser: boolean }[]>([]);
  const [opponent, setOpponent] = useState<{ username: string, level: string } | null>(null);
  const [missedToast, setMissedToast] = useState(false);

  // Refs for state to be used in cleanups/listeners
  const gameStateRef = useRef(gameState);
  const opponentRef = useRef(opponent);
  const userRef = useRef(user);
  const isGameFinishedRef = useRef(false);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { opponentRef.current = opponent; }, [opponent]);
  useEffect(() => { userRef.current = user; }, [user]);

  const playersCount = mode === '2P' ? 2 : 4;
  const totalPool = fee * playersCount;
  const prize = totalPool * (1 - settings.commissionRate);

  // Prevent accidental refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameStateRef.current === 'playing' && !isGameFinishedRef.current) {
        const msg = lang === 'en' 
          ? "Leaving the match results in an automatic LOSS." 
          : "ম্যাচ ছেড়ে দিলে আপনি অটোমেটিক হেরে যাবেন।";
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [lang]);

  // Handle component unmount (loss on disconnect/exit)
  useEffect(() => {
    return () => {
      if (gameStateRef.current === 'playing' && userRef.current && !isGameFinishedRef.current) {
        const updatedUser = {
          ...userRef.current,
          losses: userRef.current.losses + 1,
        };
        setUser(updatedUser);
      }
    };
  }, []);

  // Matchmaking simulation
  useEffect(() => {
    if (gameState === 'searching') {
      const searchTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(searchTimer);
            setGameState('playing');
            setOpponent(MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)]);
            deductFee();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(searchTimer);
    }
  }, [gameState]);

  // Turn and Inactivity Timer
  useEffect(() => {
    if (gameState === 'playing') {
      const gameTimer = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            if (turn === 0) {
              handleMissedTurn();
            } else {
              setTurn(0);
              return 30;
            }
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(gameTimer);
    }
  }, [gameState, turn]);

  // Simulate Opponent moves
  useEffect(() => {
    if (gameState === 'playing' && turn === 1) {
      const delay = 3000 + Math.random() * 4000;
      const timeout = setTimeout(() => {
        if (Math.random() > 0.98) {
           handleLoss(); 
        } else {
           setTurn(0);
           setTimer(30);
           if (Math.random() > 0.8) triggerEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)], false);
        }
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [turn, gameState]);

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
      
      if (val === 6) {
        setTurn(0);
      } else {
        if (Math.random() > 0.95) handleWin();
        else {
          setTurn(1);
        }
      }
    }, 800);
  };

  const handleWin = () => {
    if (!user) return;
    isGameFinishedRef.current = true;
    
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
    });

    navigate('/', { 
      state: { 
        gameResult: 'win', 
        prize: prize.toFixed(0) 
      }, 
      replace: true 
    });
  };

  const handleLoss = () => {
    if (!user) return;
    isGameFinishedRef.current = true;
    
    setUser({
      ...user,
      losses: user.losses + 1,
    });

    navigate('/', { 
      state: { 
        gameResult: 'lose' 
      }, 
      replace: true 
    });
  };

  const handleMissedTurn = () => {
    const newMissed = missedTurns + 1;
    setMissedTurns(newMissed);
    setMissedToast(true);
    setTimeout(() => setMissedToast(false), 3000);

    if (newMissed >= 3) {
      handleLoss();
    } else {
      setTurn(1); 
      setTimer(30);
    }
  };

  const triggerEmoji = (emoji: string, isUser: boolean) => {
    const id = Date.now();
    setActiveEmojis(prev => [...prev, { id, emoji, isUser }]);
    setTimeout(() => {
      setActiveEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  if (gameState === 'searching') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-electric border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-bebas text-4xl">{countdown}</div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bebas tracking-widest">{t.searching}</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Finding best opponent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-10">
      {/* Turn indicator and Timer */}
      <div className="flex items-center justify-between bg-indigo-900/40 p-5 rounded-[2rem] border border-white/5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${turn === 0 ? 'border-electric bg-electric/20 scale-110 shadow-lg' : 'border-white/10 bg-white/5 opacity-50'}`}>
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Turn</p>
            <h4 className="font-bold text-white">{user?.username}</h4>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bebas text-2xl transition-all ${timer < 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-electric text-electric'}`}>
            {timer}
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Opponent</p>
            <h4 className="font-bold text-white">{opponent?.username}</h4>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${turn === 1 ? 'border-electric bg-electric/20 scale-110 shadow-lg' : 'border-white/10 bg-white/5 opacity-50'}`}>
            <User size={24} />
          </div>
        </div>
      </div>

      {/* Game Board (Mock) */}
      <div className="aspect-square bg-indigo-900/60 rounded-[3rem] border-4 border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center pointer-events-none opacity-20">
          <RotateCw size={120} className="animate-spin-slow" />
        </div>
        
        {/* Active Emojis */}
        {activeEmojis.map(e => (
          <div key={e.id} className={`absolute z-50 text-6xl animate-bounce-short ${e.isUser ? 'bottom-20 left-10' : 'top-20 right-10'}`}>
            {e.emoji}
          </div>
        ))}

        {/* Dice Area */}
        <div className="relative z-10 flex flex-col items-center gap-8">
           <button 
             onClick={handleRoll}
             disabled={turn !== 0 || rolling}
             className={`w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center transition-all ${rolling ? 'animate-bounce scale-90' : 'hover:scale-105 active:scale-95'} ${turn !== 0 ? 'opacity-30' : 'ring-4 ring-electric shadow-electric/20'}`}
           >
              <div className="grid grid-cols-3 grid-rows-3 gap-2 p-4 w-full h-full">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`rounded-full bg-indigo-950 transition-opacity duration-200 ${
                    (diceValue === 1 && i === 4) ||
                    (diceValue === 2 && (i === 0 || i === 8)) ||
                    (diceValue === 3 && (i === 0 || i === 4 || i === 8)) ||
                    (diceValue === 4 && (i === 0 || i === 2 || i === 6 || i === 8)) ||
                    (diceValue === 5 && (i === 0 || i === 2 || i === 4 || i === 6 || i === 8)) ||
                    (diceValue === 6 && (i === 0 || i === 2 || i === 3 || i === 5 || i === 6 || i === 8))
                    ? 'opacity-100' : 'opacity-0'
                  }`} />
                ))}
              </div>
           </button>
           
           <p className="font-bebas text-2xl tracking-[0.3em] text-white/40 uppercase">
             {rolling ? 'Rolling...' : (turn === 0 ? 'Your Turn' : "Opponent's Turn")}
           </p>
        </div>
      </div>

      {/* Missed Turn Warning */}
      {missedToast && (
        <div className="bg-red-500 text-white p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
           <AlertTriangle />
           <p className="font-bold text-sm">{t.turnMissed} ({missedTurns}/3)</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
         <div className="relative flex-1">
           <button 
             onClick={() => setShowEmojiPicker(!showEmojiPicker)}
             className="w-full bg-white/5 border border-white/10 py-5 rounded-3xl flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-all active:scale-95"
           >
             <Smile size={24} />
             <span className="font-bebas text-xl tracking-widest">{t.sendEmoji}</span>
           </button>
           
           {showEmojiPicker && (
             <div className="absolute bottom-full left-0 right-0 mb-4 bg-indigo-900 border border-white/10 p-4 rounded-[2rem] shadow-2xl grid grid-cols-4 gap-2 animate-in slide-in-from-bottom-4">
               {EMOJIS.map(emoji => (
                 <button 
                   key={emoji} 
                   onClick={() => { triggerEmoji(emoji, true); setShowEmojiPicker(false); }}
                   className="text-3xl p-3 hover:bg-white/5 rounded-2xl transition-all active:scale-90"
                 >
                   {emoji}
                 </button>
               ))}
             </div>
           )}
         </div>

         <button 
           onClick={() => navigate('/')}
           className="bg-red-600/10 border border-red-600/20 text-red-600 px-8 py-5 rounded-3xl active:scale-95 transition-all"
         >
           <LogOut size={24} />
         </button>
      </div>
    </div>
  );
};

export default GameRoom;

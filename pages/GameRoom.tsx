import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Trophy, LogOut, Volume2, VolumeX, User as UserIcon, Star, Search, Clock, MessageCircle, Send, X, Smile
} from 'lucide-react';
import { COLORS, START_INDICES, SAFE_SPOTS } from '../constants';
import { PlayerColor, Player, GameState, PlayerLevel, ChatMessage } from '../types';
import LudoBoard from '../components/LudoBoard';
import { translations } from '../translations';

const TURN_TIME_LIMIT = 15;

const SOUNDS = {
  DICE_ROLL: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3',
  MOVE_STEP: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  CAPTURE: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
  VICTORY: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  TURN_START: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  TOKEN_SELECT: 'https://assets.mixkit.co/active_storage/sfx/2562/2562-preview.mp3',
  HOME_STRETCH: 'https://assets.mixkit.co/active_storage/sfx/2564/2564-preview.mp3',
  ERROR: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
  MESSAGE: 'https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3'
};

const audioCache: Record<string, HTMLAudioElement> = {};
const QUICK_REACTIONS = ["GG!", "Nice move!", "Unlucky!", "Hurry up!", "😂", "🔥", "😭", "😮"];

const DiceFace: React.FC<{ value: number | null, rolling: boolean, color: string, size?: number }> = ({ value, rolling, size = 32 }) => {
  const [tempValue, setTempValue] = useState(1);
  
  useEffect(() => {
    let interval: any;
    if (rolling) {
      interval = setInterval(() => {
        setTempValue(Math.floor(Math.random() * 6) + 1);
      }, 60);
    }
    return () => clearInterval(interval);
  }, [rolling]);

  const displayValue = rolling ? tempValue : (value || 1);
  const dotPositions: Record<number, number[]> = {
    1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
  };
  const dotSize = size / 5;

  return (
    <div 
      className={`grid grid-cols-3 grid-rows-3 gap-1 p-1 bg-white/10 rounded-lg shadow-inner transition-transform duration-75 ${rolling ? 'scale-110' : 'scale-100'}`} 
      style={{ width: size, height: size, background: rolling ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {dotPositions[displayValue]?.includes(i) && (
            <div 
              className="rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]" 
              style={{ width: dotSize, height: dotSize }} 
            />
          )}
        </div>
      ))}
    </div>
  );
};

const GameRoom: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUserBalance, lang, settings } = useApp();
  const t = translations[lang];

  const fee = parseInt(searchParams.get('fee') || '12');
  const mode = (searchParams.get('mode') || '2P') as '2P' | '3P' | '4P';
  const initialColor = (searchParams.get('color') || 'GREEN') as PlayerColor;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [movingTokenId, setMovingTokenId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMatchmaking, setIsMatchmaking] = useState(true);
  const [matchProgress, setMatchProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TURN_TIME_LIMIT);
  const [isAutoLoss, setIsAutoLoss] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const hasUnlockedAudio = useRef(false);

  useEffect(() => {
    Object.values(SOUNDS).forEach(url => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioCache[url] = audio;
    });
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [gameState?.chatMessages, isChatOpen]);

  useEffect(() => {
    if (isMatchmaking) {
      const interval = setInterval(() => {
        setMatchProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsMatchmaking(false), 800);
            return 100;
          }
          return prev + Math.random() * 20;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isMatchmaking]);

  const playSound = useCallback((soundUrl: string, volume = 0.5) => {
    if (isMuted) return;
    try {
      const baseAudio = audioCache[soundUrl] || new Audio(soundUrl);
      const sound = baseAudio.cloneNode() as HTMLAudioElement;
      sound.volume = volume;
      sound.play().catch(() => {});
    } catch (err) {}
  }, [isMuted]);

  const unlockAudio = useCallback(() => {
    if (hasUnlockedAudio.current) return;
    const silent = new Audio();
    silent.play().then(() => { hasUnlockedAudio.current = true; }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isMatchmaking) return;
    const allColors: PlayerColor[] = ['GREEN', 'YELLOW', 'BLUE', 'RED'];
    const selectedColors: PlayerColor[] = [initialColor];
    const count = mode === '2P' ? 2 : mode === '3P' ? 3 : 4;
    const others = allColors.filter(c => c !== initialColor);
    if (mode === '2P') {
      const opposite: Record<PlayerColor, PlayerColor> = { GREEN: 'BLUE', BLUE: 'GREEN', YELLOW: 'RED', RED: 'YELLOW' };
      selectedColors.push(opposite[initialColor]);
    } else {
      for (let i = 0; i < count - 1; i++) selectedColors.push(others[i]);
    }
    const botNames = ['Apex', 'Racer', 'Master', 'LudoGod', 'Elite', 'Slayer', 'Ghost', 'Fury'];
    const players: Player[] = selectedColors.map((color, i) => ({
      id: color === initialColor ? user?.id || 'p1' : `bot_${i}`,
      username: color === initialColor ? user?.username || 'Player 1' : botNames[Math.floor(Math.random() * botNames.length)] + '_' + Math.floor(Math.random()*99),
      avatar: color === initialColor ? user?.avatar : undefined,
      level: color === initialColor ? user?.level : PlayerLevel.GOLDEN,
      color,
      tokens: Array.from({ length: 4 }, (_, j) => ({ id: i * 4 + j, color, position: -1, stackOffset: 0 })),
      isBot: color !== initialColor,
      isActive: true,
      missedTurns: 0
    }));

    // Deduct fee if not practice mode
    if (fee > 0 && user) {
      updateUserBalance(user.id, -fee, 0);
    }

    const turnOrder = ['GREEN', 'YELLOW', 'BLUE', 'RED'];
    players.sort((a, b) => turnOrder.indexOf(a.color) - turnOrder.indexOf(b.color));
    setGameState({
      id: Math.random().toString(36).substr(2, 9),
      players,
      currentTurn: players[0].color,
      diceValue: null,
      status: 'rolling',
      history: [],
      winner: null,
      rollExtra: false,
      chatMessages: []
    });
  }, [mode, initialColor, user, isMatchmaking, fee]);

  const localPlayer = useMemo(() => gameState?.players.find(p => p.id === user?.id), [gameState, user]);
  const localColor = localPlayer?.color || initialColor;
  const currentPlayer = useMemo(() => gameState?.players.find(p => p.color === gameState.currentTurn), [gameState]);

  const handleSendMessage = (text: string) => {
    if (!gameState || !text.trim() || !user) return;
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id, senderName: user.username, senderColor: localColor,
      text: text.trim(), timestamp: new Date().toISOString()
    };
    setGameState(prev => prev ? { ...prev, chatMessages: [...prev.chatMessages, newMessage].slice(-50) } : null);
    setChatInput('');
    playSound(SOUNDS.MESSAGE, 0.4);
  };

  const handleMissedTurn = useCallback(() => {
    if (!gameState || gameState.winner) return;
    playSound(SOUNDS.ERROR, 0.4);
    setGameState(prev => {
      if (!prev) return null;
      const players = prev.players.map(p => {
        if (p.color === prev.currentTurn) {
          const newMissed = p.missedTurns + 1;
          if (newMissed >= 3 && p.color === localColor) setIsAutoLoss(true);
          return { ...p, missedTurns: newMissed };
        }
        return p;
      });
      const colors = players.map(p => p.color);
      const currentIdx = colors.indexOf(prev.currentTurn);
      const nextIdx = (currentIdx + 1) % colors.length;
      return { ...prev, players, currentTurn: colors[nextIdx], diceValue: null, status: 'rolling', rollExtra: false };
    });
    setTimeLeft(TURN_TIME_LIMIT);
  }, [gameState, localColor, playSound]);

  useEffect(() => {
    if (!gameState || gameState.winner || gameState.status === 'ended') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { handleMissedTurn(); return TURN_TIME_LIMIT; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, handleMissedTurn]);

  const switchTurn = useCallback(() => {
    if (!gameState) return;
    setGameState(prev => {
      if (!prev) return null;
      const colors = prev.players.map(p => p.color);
      const nextIdx = (colors.indexOf(prev.currentTurn) + 1) % colors.length;
      if (colors[nextIdx] === localColor) playSound(SOUNDS.TURN_START, 0.4);
      return { ...prev, currentTurn: colors[nextIdx], diceValue: null, status: 'rolling', rollExtra: false };
    });
    setTimeLeft(TURN_TIME_LIMIT);
  }, [gameState, localColor, playSound]);

  const rollDice = useCallback(() => {
    if (!gameState || gameState.status !== 'rolling' || isRolling) return;
    unlockAudio(); setIsRolling(true); playSound(SOUNDS.DICE_ROLL, 0.6);
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);
      setGameState(prev => {
        if (!prev) return null;
        const player = prev.players.find(p => p.color === prev.currentTurn);
        if (!player) return prev;
        const movable = player.tokens.filter(t => t.position === -1 ? val === 6 : t.position + val <= 57);
        if (movable.length === 0) { setTimeout(switchTurn, 1000); return { ...prev, diceValue: val, status: 'waiting' }; }
        return { ...prev, diceValue: val, status: 'moving' };
      });
    }, 800);
  }, [gameState, isRolling, switchTurn, playSound, unlockAudio]);

  const moveToken = async (tokenId: number) => {
    if (!gameState || gameState.status !== 'moving' || !gameState.diceValue) return;
    const currentPlayerObj = gameState.players.find(p => p.color === gameState.currentTurn);
    const token = currentPlayerObj?.tokens.find(t => t.id === tokenId);
    if (!token) return;
    
    playSound(SOUNDS.TOKEN_SELECT, 0.5); 
    setMovingTokenId(tokenId);
    
    const steps = token.position === -1 ? 1 : gameState.diceValue;
    for (let i = 0; i < steps; i++) {
      await new Promise(res => setTimeout(res, 200)); 
      playSound(SOUNDS.MOVE_STEP, 0.3);
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map(p => ({
            ...p,
            tokens: p.tokens.map(t => {
              if (t.id === tokenId) {
                const nextPos = t.position === -1 ? 0 : t.position + 1;
                if (nextPos === 52) playSound(SOUNDS.HOME_STRETCH, 0.4);
                return { ...t, position: nextPos };
              }
              return t;
            })
          }))
        };
      });
    }

    setGameState(prev => {
      if (!prev) return null;
      let killed = false; 
      let finished = false;
      
      const pIdx = prev.players.findIndex(p => p.color === prev.currentTurn);
      if (pIdx === -1) return prev;
      
      const tIdx = prev.players[pIdx].tokens.findIndex(t => t.id === tokenId);
      if (tIdx === -1) return prev;
      
      const movingToken = prev.players[pIdx].tokens[tIdx];
      if (movingToken.position === 57) finished = true;
      
      const globalIdx = (movingToken.position + START_INDICES[movingToken.color]) % 52;
      const isSafe = SAFE_SPOTS.includes(movingToken.position) || movingToken.position >= 52;
      
      const updatedPlayers = prev.players.map(p => {
        if (p.color === movingToken.color) return p;
        return {
          ...p,
          tokens: p.tokens.map(t => {
            if (t.position === -1 || t.position >= 52) return t;
            const tGlobalIdx = (t.position + START_INDICES[p.color]) % 52;
            if (!isSafe && tGlobalIdx === globalIdx) {
              killed = true;
              return { ...t, position: -1 };
            }
            return t;
          })
        };
      });

      if (killed) playSound(SOUNDS.CAPTURE, 0.7);
      
      const getsExtra = killed || finished || prev.diceValue === 6;
      const pTokens = updatedPlayers[pIdx].tokens;
      if (pTokens.every(t => t.position === 57)) {
        playSound(SOUNDS.VICTORY, 0.8);
        if (prev.currentTurn === localColor && user && fee > 0) {
          const prize = fee * (mode === '2P' ? 2 : mode === '3P' ? 3 : 4) * (1 - settings.commissionRate);
          updateUserBalance(user.id, prize, 0);
        }
        return { ...prev, players: updatedPlayers, status: 'ended', winner: prev.currentTurn };
      }
      
      setMovingTokenId(null);
      if (getsExtra) {
        setTimeLeft(TURN_TIME_LIMIT);
        return { ...prev, players: updatedPlayers, status: 'rolling', diceValue: null };
      }
      
      setTimeout(switchTurn, 600);
      return { ...prev, players: updatedPlayers, status: 'waiting' };
    });
  };

  useEffect(() => {
    if (gameState?.status === 'rolling' && currentPlayer?.isBot && !isRolling) { 
      const timeout = setTimeout(rollDice, 1500); 
      return () => clearTimeout(timeout);
    }
    if (gameState?.status === 'moving' && currentPlayer?.isBot) {
      const dice = gameState.diceValue;
      if (dice === null) return;
      const movable = currentPlayer.tokens.filter(t => t.position === -1 ? dice === 6 : t.position + dice <= 57);
      if (movable.length > 0) { 
        const best = movable.reduce((p, c) => c.position > p.position ? c : p); 
        const timeout = setTimeout(() => moveToken(best.id), 1000); 
        return () => clearTimeout(timeout);
      }
    }
  }, [gameState, currentPlayer, isRolling, rollDice, moveToken]);

  if (isMatchmaking) {
    return (
      <div className="fixed inset-0 bg-brand-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in font-sans">
        <div className="relative z-10 w-full max-w-sm space-y-12">
           <div className="mx-auto w-32 h-32 flex items-center justify-center border-4 border-t-brand-accent rounded-full animate-spin"><Search size={40} className="text-brand-accent animate-pulse" /></div>
           <div className="space-y-4">
              <h2 className="text-5xl font-bebas tracking-widest text-white leading-none">{t.findingArena}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">{t.proStandard}</p>
           </div>
           <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent">{matchProgress < 30 ? t.pinging : matchProgress < 70 ? t.validating : t.syncing}</p>
                 <p className="text-2xl font-bebas text-white">{Math.floor(matchProgress)}%</p>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5"><div className="h-full bg-brand-accent rounded-full transition-all duration-300" style={{ width: `${matchProgress}%` }}></div></div>
           </div>
        </div>
      </div>
    );
  }

  if (!gameState) return null;
  const opponents = gameState.players.filter(p => p.id !== user?.id);
  const isLocalTurn = gameState.currentTurn === localColor;

  return (
    <div className="flex flex-col items-center gap-4 animate-in fade-in pb-16 min-h-screen relative overflow-hidden font-sans">
      {isChatOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-end justify-center p-4">
          <div className="bg-brand-dark w-full max-w-md h-[60vh] rounded-[2.5rem] border border-white/10 flex flex-col">
             <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between"><h3 className="text-2xl font-bebas tracking-widest text-white flex items-center gap-3"><MessageCircle className="text-brand-accent" /> {t.battleChat}</h3><button onClick={() => setIsChatOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button></div>
             <div ref={chatScrollRef} className="flex-1 overflow-auto p-6 space-y-4">{gameState.chatMessages.map(msg => (<div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}><div className="text-[8px] font-black uppercase mb-1 opacity-60" style={{ color: COLORS[msg.senderColor] }}>{msg.senderName}</div><div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.senderId === user?.id ? 'bg-brand-accent text-brand-black' : 'bg-white/5 text-white border border-white/5'}`}>{msg.text}</div></div></div>))}</div>
             <div className="p-6 bg-white/5 border-t border-white/5 space-y-4"><div className="flex gap-2 overflow-x-auto no-scrollbar">{QUICK_REACTIONS.map(r => (<button key={r} onClick={() => handleSendMessage(r)} className="px-4 py-2 bg-brand-black/40 border border-white/5 rounded-xl text-xs">{r}</button>))}</div><div className="relative"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(chatInput)} placeholder={t.typeMessage} className="w-full bg-brand-black border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm" /><button onClick={() => handleSendMessage(chatInput)} disabled={!chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-accent rounded-xl text-brand-black"><Send size={18} /></button></div></div>
          </div>
        </div>
      )}

      <div className="w-full flex items-center justify-between bg-brand-dark p-4 rounded-3xl border border-white/5">
        <button onClick={() => navigate('/')} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-red-500"><LogOut size={20} /></button>
        <div className="text-center">
          <h2 className="text-xl font-bebas tracking-widest text-white uppercase">ARENA {mode}</h2>
          <p className="text-[10px] font-black uppercase text-brand-accent">
            {fee === 0 ? t.free : `${t.prize}: ৳${(fee * (mode === '2P' ? 2 : mode === '3P' ? 3 : 4) * (1 - settings.commissionRate)).toFixed(0)}`}
          </p>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-white/5 rounded-2xl text-slate-400">{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
      </div>

      <div className={`w-full grid gap-3 ${mode === '4P' || mode === '3P' ? 'grid-cols-3' : 'grid-cols-1'}`}>
        {opponents.map(p => {
          const isTurn = gameState.currentTurn === p.color;
          const showDice = isTurn && (gameState.status === 'rolling' || gameState.status === 'moving');
          return (
            <div key={p.color} className={`p-3 rounded-[1.5rem] border flex items-center justify-between relative overflow-hidden transition-all ${isTurn ? `bg-brand-dark border-brand-accent scale-[1.02]` : 'bg-brand-dark/40 border-white/5 opacity-60'}`}>
              <div className="flex items-center gap-2 overflow-hidden"><div className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/20" style={{ backgroundColor: COLORS[p.color] }}>{p.avatar ? <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" /> : <UserIcon size={18} className="text-white" />}</div><div className="flex flex-col"><p className="text-[10px] font-black text-white truncate uppercase">{p.username}</p><div className="flex gap-0.5 mt-0.5">{[...Array(3)].map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full ${i < p.missedTurns ? 'bg-red-500' : 'bg-white/10'}`}></div>))}</div></div></div>
              {showDice && <DiceFace value={gameState.diceValue} rolling={isRolling && p.color === gameState.currentTurn} color={COLORS[p.color]} size={34} />}
              {isTurn && <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-accent/20"><div className="h-full bg-brand-accent transition-all duration-1000" style={{ width: `${(timeLeft / TURN_TIME_LIMIT) * 100}%` }}></div></div>}
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex items-center justify-center w-full max-w-lg"><LudoBoard gameState={gameState} moveToken={moveToken} movingTokenId={movingTokenId} localColor={localColor} onRollDice={rollDice} isRolling={isRolling} /></div>

      {!gameState.winner && (<button onClick={() => setIsChatOpen(true)} className="fixed bottom-40 left-6 w-14 h-14 bg-brand-dark/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl z-[100] border border-white/10 text-brand-accent"><Smile size={28} />{gameState.chatMessages.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent rounded-full animate-pulse" />}</button>)}

      <div className={`w-full bg-brand-dark p-6 rounded-[2.5rem] border-t-4 flex flex-col items-center gap-4 relative overflow-hidden transition-all mb-12 ${isLocalTurn ? `border-brand-accent/50` : 'border-white/5'}`}>
        {isLocalTurn && !gameState.winner && <div className="absolute top-0 left-0 h-1.5 bg-brand-accent/30 w-full"><div className={`h-full transition-all duration-1000 ${timeLeft < 5 ? 'bg-brand-secondary' : 'bg-brand-accent'}`} style={{ width: `${(timeLeft / TURN_TIME_LIMIT) * 100}%` }}></div></div>}
        {gameState.winner ? (
          <div className="text-center space-y-4 py-4"><Trophy size={48} className="text-brand-gold mx-auto" /><h3 className="text-4xl font-bebas text-white tracking-widest">{isAutoLoss ? t.autoLossWarning : (gameState.winner === localColor ? t.victory : t.defeat)}</h3><button onClick={() => navigate('/')} className="px-10 py-4 bg-brand-accent text-brand-black rounded-2xl font-bebas text-2xl tracking-widest">{t.exitLobby}</button></div>
        ) : (
          <div className="w-full flex items-center justify-between gap-6">
            <div className="flex items-center gap-4"><div className="relative"><div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-white/30 ${isLocalTurn ? 'scale-110' : ''}`} style={{ backgroundColor: COLORS[localColor] }}>{localPlayer?.avatar ? <img src={localPlayer.avatar} alt={user?.username} className="w-full h-full object-cover" /> : <UserIcon size={32} className="text-white" />}</div><div className="absolute -bottom-2 -right-2 bg-brand-gold p-2 rounded-xl border-4 border-brand-dark shadow-xl"><Star size={16} className="text-brand-dark fill-brand-dark" /></div></div><div className="flex flex-col"><p className="text-lg font-black text-white uppercase tracking-widest leading-none">{user?.username}</p><div className="flex items-center gap-2 mt-1"><div className="flex gap-1">{[...Array(3)].map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full border border-white/10 ${i < (localPlayer?.missedTurns || 0) ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-brand-black'}`}></div>))}</div><p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{3 - (localPlayer?.missedTurns || 0)} {t.chancesLeft}</p></div><p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 ${isLocalTurn ? 'text-white/60 animate-pulse' : 'text-slate-500'}`}>{isLocalTurn ? (gameState.status === 'rolling' ? t.readyToRoll : t.chooseToken) : t.opponentTurn}</p></div></div>
            <div className="flex items-center gap-4">
              {isLocalTurn && (gameState.status === 'rolling' || gameState.status === 'moving') && (
                <div className="flex flex-col items-center gap-2">
                  <div 
                    onClick={rollDice} 
                    className={`p-1 rounded-2xl transition-all cursor-pointer ${gameState.status === 'rolling' && !isRolling ? 'ring-4 ring-brand-accent/30 animate-token-pulse' : ''} ${isRolling ? 'animate-shake' : ''}`}
                  >
                    <DiceFace value={gameState.diceValue} rolling={isRolling} color={COLORS[localColor]} size={56} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-black/40 rounded-full border border-white/5">
                    <Clock size={10} className={timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-brand-accent'} />
                    <span className={`text-xs font-bebas tracking-widest ${timeLeft < 5 ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</span>
                  </div>
                </div>
              )}
              {isLocalTurn && gameState.status === 'moving' && (
                <div className="absolute top-2 right-6 bg-brand-gold text-brand-black text-[9px] font-black px-4 py-2 rounded-full animate-bounce uppercase">
                  {t.tapToken}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom;
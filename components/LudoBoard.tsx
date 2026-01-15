import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Star as StarIcon, Trophy, MapPin, Sparkles } from 'lucide-react';
import { COLORS, getGridCoordinates } from '../constants';
import { PlayerColor, GameState } from '../types';

interface LudoBoardProps {
  gameState: GameState;
  moveToken: (tokenId: number) => Promise<void>;
  movingTokenId: number | null;
  localColor: PlayerColor;
  onRollDice: () => void;
  isRolling: boolean;
}

const CaptureExplosion: React.FC<{ r: number, c: number, stepSize: number }> = ({ r, c, stepSize }) => {
  return (
    <div 
      className="absolute pointer-events-none z-[100] flex items-center justify-center"
      style={{ 
        top: `${r * stepSize}%`, 
        left: `${c * stepSize}%`, 
        width: `${stepSize}%`, 
        height: `${stepSize}%` 
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Shockwave Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-90 scale-150" />
        <div className="absolute inset-0 rounded-full border-2 border-brand-accent animate-ping opacity-50 scale-125 delay-100" />
        
        {/* Central Core Flash */}
        <div className="absolute w-12 h-12 rounded-full bg-white blur-xl animate-pulse scale-150 opacity-80" />
        <div className="absolute w-8 h-8 rounded-full bg-brand-accent blur-md animate-pulse scale-110" />
        
        {/* Debris Particles */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * (360 / 16) * Math.PI) / 180;
          const velocity = 50 + Math.random() * 40;
          const tx = Math.cos(angle) * velocity;
          const ty = Math.sin(angle) * velocity;
          
          return (
            <div 
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#FFF] animate-particle-out"
              style={{
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
                backgroundColor: i % 2 === 0 ? '#FFF' : '#00D9FF',
                animationDuration: '0.6s',
                animationDelay: `${Math.random() * 0.05}s`
              } as React.CSSProperties}
            />
          );
        })}

        {/* Floating Embers */}
        {[...Array(8)].map((_, i) => (
          <div 
            key={`ember-${i}`}
            className="absolute w-1 h-1 rounded-full bg-brand-gold animate-float opacity-70"
            style={{
              top: `${Math.random() * 40 - 20}px`,
              left: `${Math.random() * 40 - 20}px`,
              animationDuration: `${2 + Math.random()}s`,
              animationDelay: `${Math.random()}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const LudoBoard: React.FC<LudoBoardProps> = ({ gameState, moveToken, movingTokenId, localColor }) => {
  const [capturePos, setCapturePos] = useState<{ r: number, c: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const prevTokensRef = useRef<Record<number, number>>({});
  
  const rotationDegrees = useMemo(() => {
    switch (localColor) {
      case 'RED': return 0;
      case 'BLUE': return 90;
      case 'YELLOW': return 180;
      case 'GREEN': return 270;
      default: return 0;
    }
  }, [localColor]);

  // Enhanced Capture Detection
  useEffect(() => {
    gameState.players.forEach(p => {
      p.tokens.forEach(t => {
        const prevPos = prevTokensRef.current[t.id];
        
        // Check if token was moved back to base from an active spot
        if (prevPos !== undefined && prevPos >= 0 && t.position === -1) {
          const [r, c] = getGridCoordinates(p.color, prevPos, t.id);
          setCapturePos({ r, c });
          setIsShaking(true);
          
          // Clear animation after delay
          setTimeout(() => {
            setCapturePos(null);
            setIsShaking(false);
          }, 850);
        }
        prevTokensRef.current[t.id] = t.position;
      });
    });
  }, [gameState]);

  const tokenGroups = useMemo(() => {
    const groups: Record<string, number[]> = {};
    gameState.players.forEach(p => {
      p.tokens.forEach(t => {
        const coords = getGridCoordinates(p.color, t.position, t.id);
        const key = `${coords[0]}-${coords[1]}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t.id);
      });
    });
    return groups;
  }, [gameState.players]);

  const getCellType = (r: number, c: number) => {
    const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
    const isBaseArea = (r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c > 8) || (r > 8 && c < 6);
    const isEntryCell = (r === 6 && c === 1) || (r === 1 && c === 8) || (r === 8 && c === 13) || (r === 13 && c === 6);
    const isHomeStretch = (r === 7 && c > 0 && c < 6) || (c === 7 && r > 0 && r < 6) || (r === 7 && c > 8 && c < 14) || (c === 7 && r > 8 && r < 14);

    const isBaseSeat = [
      [1, 1], [1, 3], [3, 1], [3, 3],
      [1, 11], [1, 13], [3, 11], [3, 13],
      [11, 11], [11, 13], [13, 11], [13, 13],
      [11, 1], [11, 3], [13, 1], [13, 3]
    ].some(s => s[0] === r && s[1] === c);

    return { isCenter, isBaseArea, isEntryCell, isHomeStretch, isBaseSeat, isPath: !isBaseArea && !isCenter && !isHomeStretch && !isEntryCell };
  };

  const getCellStyles = (r: number, c: number) => {
    const { isCenter, isEntryCell, isBaseArea } = getCellType(r, c);
    let bgColor = 'rgba(255,255,255,0.03)';
    let borderColor = 'rgba(255, 255, 255, 0.1)'; 

    if (isBaseArea) {
      if (r < 6 && c < 6) bgColor = COLORS.GREEN;
      else if (r < 6 && c > 8) bgColor = COLORS.YELLOW;
      else if (r > 8 && c > 8) bgColor = COLORS.BLUE;
      else if (r > 8 && c < 6) bgColor = COLORS.RED;
      borderColor = 'rgba(255, 255, 255, 0.2)';
    }

    if (r === 7 && c > 0 && c < 7) bgColor = COLORS.GREEN;
    if (c === 7 && r > 0 && r < 7) bgColor = COLORS.YELLOW;
    if (r === 7 && c > 7 && c < 14) bgColor = COLORS.BLUE;
    if (c === 7 && r > 7 && r < 14) bgColor = COLORS.RED;

    if (r === 6 && c === 1) { bgColor = COLORS.GREEN; borderColor = 'rgba(255,255,255,0.5)'; }
    if (r === 1 && c === 8) { bgColor = COLORS.YELLOW; borderColor = 'rgba(255,255,255,0.5)'; }
    if (r === 8 && c === 13) { bgColor = COLORS.BLUE; borderColor = 'rgba(255,255,255,0.5)'; }
    if (r === 13 && c === 6) { bgColor = COLORS.RED; borderColor = 'rgba(255,255,255,0.5)'; }

    if (isCenter) return {};

    return {
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      aspectRatio: '1 / 1',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box' as const
    };
  };

  const stepSize = 100 / 15;

  return (
    <div 
      className={`relative w-full max-w-[480px] aspect-square bg-brand-dark rounded-[2.5rem] p-3 ludo-board-base border-[8px] border-brand-accent/20 shadow-[0_0_80px_rgba(0,217,255,0.15)] transition-all duration-700 ease-in-out ${isShaking ? 'animate-shake' : ''}`}
      style={{ transform: `rotate(${rotationDegrees}deg)` }}
    >
      <div className="relative w-full h-full aspect-square bg-brand-black/40 rounded-2xl overflow-hidden border border-white/10">
        <div className="w-full h-full grid grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)]">
          {Array.from({ length: 15 * 15 }).map((_, i) => {
            const r = Math.floor(i / 15);
            const c = i % 15;
            const { isCenter, isEntryCell, isBaseArea, isBaseSeat } = getCellType(r, c);
            
            if (r === 6 && c === 6) {
              return (
                <div key="center-goal" style={{ gridArea: '7 / 7 / 10 / 10' }} className="z-[5] border border-white/20 overflow-hidden pointer-events-none rounded-sm shadow-2xl relative">
                  <div className="w-full h-full relative" style={{ 
                    background: `conic-gradient(from 45deg, 
                      ${COLORS.BLUE} 0deg 90deg, 
                      ${COLORS.RED} 90deg 180deg, 
                      ${COLORS.GREEN} 180deg 270deg, 
                      ${COLORS.YELLOW} 270deg 360deg)` 
                  }}>
                    <div className="absolute top-1/2 left-0 w-[142%] h-[1px] bg-white/30 -translate-y-1/2 rotate-45 -translate-x-[15%]"></div>
                    <div className="absolute top-1/2 left-0 w-[142%] h-[1px] bg-white/30 -translate-y-1/2 -rotate-45 -translate-x-[15%]"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${-rotationDegrees}deg)` }}>
                       <div className="bg-brand-black/30 backdrop-blur-[4px] p-2 rounded-full border border-white/20 shadow-xl">
                          <Trophy size={22} className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
                       </div>
                    </div>
                  </div>
                </div>
              );
            }
            if (isCenter) return null;

            const styles = getCellStyles(r, c);
            const isSafeStar = [[6, 1], [2, 6], [1, 8], [6, 12], [8, 13], [12, 8], [13, 6], [8, 2]].some(s => s[0] === r && s[1] === c);

            return (
              <div key={i} className={`relative aspect-square ${!isBaseArea ? 'hover:brightness-110 transition-all duration-300' : ''}`} style={styles as React.CSSProperties}>
                {isBaseSeat && (
                  <div className="w-[70%] h-[70%] rounded-full bg-white/80 border border-white/20 shadow-inner flex items-center justify-center">
                    <div className="w-[30%] h-[30%] rounded-full bg-slate-400/20"></div>
                  </div>
                )}
                {isSafeStar && !isBaseArea && (
                  <div style={{ transform: `rotate(${-rotationDegrees}deg)` }}>
                    <StarIcon size={12} className={`${isEntryCell ? 'text-white' : 'text-brand-gold'} drop-shadow-[0_0_4px_rgba(255,255,255,0.5)] animate-pulse`} />
                  </div>
                )}
                {isEntryCell && (
                  <div style={{ transform: `rotate(${-rotationDegrees}deg)` }}>
                    <Sparkles size={8} className="absolute text-white/40 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Capture Animation Layer */}
        {capturePos && <CaptureExplosion r={capturePos.r} c={capturePos.c} stepSize={stepSize} />}

        {gameState.players.map(p => p.tokens.map(t => {
          let [row, col] = getGridCoordinates(p.color, t.position, t.id);
          const isCurrentPlayerToken = gameState.currentTurn === p.color;
          const isMoving = movingTokenId === t.id;
          const coordsKey = `${row}-${col}`;
          const group = tokenGroups[coordsKey] || [];
          const indexInGroup = group.indexOf(t.id);
          
          let offsetX = 0; let offsetY = 0;
          if (group.length > 1 && t.position !== 57 && t.position !== -1) {
            const spread = 0.12; 
            if (group.length === 2) { offsetX = indexInGroup === 0 ? -spread : spread; } 
            else { 
              offsetX = (indexInGroup % 2 === 0) ? -spread : spread; 
              offsetY = (indexInGroup < 2) ? -spread : spread; 
            }
          }
          
          if (t.position === 57) {
            const goalOffsets: Record<PlayerColor, [number, number]> = { 
              RED: [-0.2, -0.2], GREEN: [-0.2, 0.2], YELLOW: [0.2, 0.2], BLUE: [0.2, -0.2] 
            };
            offsetX = goalOffsets[p.color][0]; 
            offsetY = goalOffsets[p.color][1];
          }

          const isEligibleToLeaveBase = t.position === -1 && gameState.diceValue === 6;
          const canMoveNormal = t.position !== -1 && t.position + (gameState.diceValue || 0) <= 57;
          const canMove = gameState.status === 'moving' && isCurrentPlayerToken && !p.isBot && (isEligibleToLeaveBase || canMoveNormal);
          const isRising = canMove && t.position === -1;
          
          return (
            <React.Fragment key={t.id}>
              {/* Dynamic Shadow */}
              {!isMoving && t.position !== -1 && (
                <div 
                  className="absolute pointer-events-none transition-all duration-300 opacity-20" 
                  style={{ 
                    top: `${(row + offsetY) * stepSize + (isRising ? 0.8 : 0.4)}%`, 
                    left: `${(col + offsetX) * stepSize + 0.4}%`, 
                    width: `${stepSize}%`, 
                    height: `${stepSize}%`, 
                    zIndex: 10, 
                    filter: isRising ? 'blur(4px)' : 'blur(2px)', 
                    transform: `rotate(${-rotationDegrees}deg)` 
                  }}
                >
                  <div className="w-full h-full rounded-full bg-black"></div>
                </div>
              )}
              
              {/* Token Shell */}
              <div 
                onClick={() => canMove && moveToken(t.id)} 
                className={`absolute flex items-center justify-center transition-all duration-300 ease-in-out ${canMove ? 'cursor-pointer' : ''}`} 
                style={{ 
                  top: `${(row + offsetY) * stepSize}%`, 
                  left: `${(col + offsetX) * stepSize}%`, 
                  width: `${stepSize}%`, 
                  height: `${stepSize}%`, 
                  zIndex: isMoving ? 100 : (20 + indexInGroup), 
                  transform: `rotate(${-rotationDegrees}deg) ${isMoving ? 'scale(1.15)' : isRising ? 'scale(1.2) translateY(-6px)' : 'scale(1)'}`, 
                  filter: (isMoving || isRising) ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))' : 'none' 
                }}
              >
                 <div 
                   className={`w-[84%] h-[84%] rounded-full border-[2.5px] border-white/90 shadow-lg relative flex items-center justify-center transition-all ${canMove ? 'ring-2 ring-brand-accent animate-token-pulse' : ''}`} 
                   style={{ 
                     backgroundColor: COLORS[p.color], 
                     boxShadow: (isMoving || isRising) ? 'inset 0 2px 5px rgba(255,255,255,0.7), 0 4px 8px rgba(0,0,0,0.5)' : 'inset 0 2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)',
                     transform: (t.position === -1 && !isRising) ? 'scale(0.9)' : 'scale(1)'
                   }}
                 >
                    <div className="w-[40%] h-[40%] bg-white/40 rounded-full blur-[1px] absolute top-[10%] left-[10%]"></div>
                    <MapPin size={8} className="text-white fill-white/10 absolute opacity-50" />
                 </div>
              </div>
            </React.Fragment>
          );
        }))}
      </div>
    </div>
  );
};

export default LudoBoard;
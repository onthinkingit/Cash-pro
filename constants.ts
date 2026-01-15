
import { PlayerColor } from './types';

export const COLORS = {
  RED: '#E73124',
  GREEN: '#16A249',
  YELLOW: '#FEC208',
  BLUE: '#1F76BC'
};

export const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

/**
 * FIXED START OFFSETS (Global Track Entry Points)
 * GREEN starts at 0
 * YELLOW starts at 13
 * BLUE starts at 26
 * RED starts at 39
 */
export const START_INDICES: Record<PlayerColor, number> = {
  GREEN: 0,
  YELLOW: 13,
  BLUE: 26,
  RED: 39
};

export const getGridCoordinates = (color: PlayerColor, pos: number, tokenId: number): [number, number] => {
  // 1. Yard / Base Positions (Inner Base)
  if (pos === -1) {
    const localId = tokenId % 4;
    const yardPositions: Record<PlayerColor, [number, number][]> = {
      GREEN: [[1, 1], [1, 3], [3, 1], [3, 3]],      // Top Left
      YELLOW: [[1, 11], [1, 13], [3, 11], [3, 13]], // Top Right
      BLUE: [[11, 11], [11, 13], [13, 11], [13, 13]], // Bottom Right
      RED: [[11, 1], [11, 3], [13, 1], [13, 3]]      // Bottom Left
    };
    return yardPositions[color][localId];
  }

  // 2. Center / Home Goal
  if (pos === 57) return [7, 7];

  // 3. Shared Main Track (52 Cells)
  const mainTrackPath: [number, number][] = [
    // GREEN Entrance Area (0-12)
    [6,1], [6,2], [6,3], [6,4], [6,5], [5,6], [4,6], [3,6], [2,6], [1,6], [0,6], [0,7], [0,8],
    // YELLOW Entrance Area (13-25)
    [1,8], [2,8], [3,8], [4,8], [5,8], [6,9], [6,10], [6,11], [6,12], [6,13], [6,14], [7,14], [8,14],
    // BLUE Entrance Area (26-38)
    [8,13], [8,12], [8,11], [8,10], [8,9], [9,8], [10,8], [11,8], [12,8], [13,8], [14,8], [14,7], [14,6],
    // RED Entrance Area (39-51)
    [13,6], [12,6], [11,6], [10,6], [9,6], [8,5], [8,4], [8,3], [8,2], [8,1], [8,0], [7,0], [6,0]
  ];

  if (pos <= 51) {
    const globalIdx = (pos + START_INDICES[color]) % 52;
    return mainTrackPath[globalIdx];
  }

  // 4. Color-Specific Home Stretches (Progress 52-56)
  const stretchIdx = pos - 52;
  const homeStretches: Record<PlayerColor, [number, number][]> = {
    GREEN: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
    YELLOW: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
    BLUE: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
    RED: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
  };

  return homeStretches[color][stretchIdx];
};

export const ChangeLevel = Object.freeze({
    NONE: 0,
    LV1: 1, // ±5%
    LV2: 2, // ±10%
    LV3: 3, // ±20%
    LV4: 4, // ±30%
    LV5: 5  // ±50%
});

/**
 * Converts a percentage change into a Level Enum
 */
export function getLevelFromChange(percent) {
    const change = Math.abs(percent);
    
    if (change >= 50) return ChangeLevel.LV5;
    if (change >= 30) return ChangeLevel.LV4;
    if (change >= 20) return ChangeLevel.LV3;
    if (change >= 10) return ChangeLevel.LV2;
    if (change >= 5)  return ChangeLevel.LV1;
    
    return ChangeLevel.NONE;
}
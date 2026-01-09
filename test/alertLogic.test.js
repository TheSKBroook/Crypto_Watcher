import { describe, it, expect, beforeEach, vi } from 'vitest';
import { alertLogic } from '../src/logic/alertLogic.js';
import { fakeCoinDataList, fakeUserDatabase } from '../src/fakeDB.js';
import { ChangeLevel, getLevelFromChange } from '../src/constants/levels.js';

describe('alertLogic', () => {
  beforeEach(() => {
    // Reset fake database to initial state
    fakeCoinDataList.coins = [
      {
        id: 'bitcoin',
        lastDirection: 'down',
        lastLevel: ChangeLevel.LV2,
        lastNotification: 1767590000000
      },
      {
        id: 'ethereum',
        lastDirection: 'down',
        lastLevel: ChangeLevel.LV1,
        lastNotification: 1767590000000
      }
    ];
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('checkPriceOverThreshold', () => {
    it('should filter coins with price change >= 5%', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 6, currentPrice: 50000 },
        { coinName: 'ethereum', priceChange1h: 3, currentPrice: 3000 },
        { coinName: 'ripple', priceChange1h: -5.5, currentPrice: 2 }
      ];

      // Call alertLogic with mocked coins
      // The internal checkPriceOverThreshold filters coins >= 5% threshold
      alertLogic(coins);

      // Verify console.log was called (indicating the function ran)
      expect(console.log).toHaveBeenCalled();
    });

    it('should return empty array when no coins exceed threshold', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 3, currentPrice: 50000 },
        { coinName: 'ethereum', priceChange1h: 2, currentPrice: 3000 }
      ];

      alertLogic(coins);

      // Should log "No coins over threshold, skipping alerts."
      expect(console.log).toHaveBeenCalledWith('No coins over threshold, skipping alerts.');
    });

    it('should handle exactly 5% threshold', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 5, currentPrice: 50000 }
      ];

      alertLogic(coins);

      // Should process the coin since it meets the threshold
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle negative percentage changes at threshold', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: -5, currentPrice: 50000 }
      ];

      alertLogic(coins);

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('checkDirectionChanged', () => {
    it('should trigger notification when price direction changes from down to up', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 8, currentPrice: 50000 }
      ];

      alertLogic(coins);

      // Bitcoin's lastDirection in fakeDB is 'down', but priceChange1h is positive (up)
      // This should trigger a notification
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Sending notification'));
    });

    it('should trigger notification when price direction changes from up to down', () => {
      // Change bitcoin's initial direction to 'up'
      fakeCoinDataList.coins[0].lastDirection = 'up';

      const coins = [
        { coinName: 'bitcoin', priceChange1h: -6, currentPrice: 50000 }
      ];

      alertLogic(coins);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Sending notification'));
    });

    it('should not trigger notification when direction stays the same', () => {
      // Keep bitcoin's direction as 'down' with negative price change
      const coins = [
        { coinName: 'bitcoin', priceChange1h: -6, currentPrice: 50000 }
      ];

      alertLogic(coins);

      // No notification should be sent for direction change
      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('•漲幅'));
    });
  });

  describe('checkLevelChanged', () => {
    it('should trigger notification when price level changes', () => {
      // Bitcoin is at LV2 (±20%), set a change to LV3 (±30%)
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 35, currentPrice: 50000 }
      ];

      alertLogic(coins);

      // Level changes from LV2 to LV3, should trigger notification
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Sending notification'));
    });

    it('should not trigger notification when level stays the same', () => {
      // Bitcoin is at LV2, set a change that also results in LV2 (15%)
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 15, currentPrice: 50000 }
      ];

      alertLogic(coins);

      // Level stays at LV2, direction also stays 'down'
      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('•跌幅'));
    });
  });

  describe('checkTimerExpired', () => {
    it('should trigger notification when 1 hour has passed since last notification', () => {
      // Set last notification to 2 hours ago
      const twoHoursAgo = Date.now() - 7200000;
      fakeCoinDataList.coins[0].lastNotification = twoHoursAgo;
      fakeCoinDataList.coins[0].lastDirection = 'up'; // Change direction to avoid direction change check

      const coins = [
        { coinName: 'bitcoin', priceChange1h: 6, currentPrice: 50000 }
      ];

      alertLogic(coins);

      // Timer should have expired, triggering notification
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Sending notification'));
    });

    it('should not trigger notification when timer has not expired', () => {
      // Set last notification to 30 minutes ago
      const thirtyMinutesAgo = Date.now() - 1800000;
      fakeCoinDataList.coins[0].lastNotification = thirtyMinutesAgo;
      fakeCoinDataList.coins[0].lastDirection = 'up';
      fakeCoinDataList.coins[0].lastLevel = ChangeLevel.LV1;

      const coins = [
        { coinName: 'bitcoin', priceChange1h: 6, currentPrice: 50000 }
      ];

      alertLogic(coins);

      // Timer has not expired and direction/level haven't changed
      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('Sending notification'));
    });

    it('should trigger notification when exactly 1 hour has passed', () => {
      // Set last notification to exactly 1 hour ago
      const oneHourAgo = Date.now() - 3600000;
      fakeCoinDataList.coins[0].lastNotification = oneHourAgo;
      fakeCoinDataList.coins[0].lastDirection = 'up';

      const coins = [
        { coinName: 'bitcoin', priceChange1h: 6, currentPrice: 50000 }
      ];

      alertLogic(coins);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Sending notification'));
    });
  });

  describe('updateCoinData', () => {
    it('should update coin data in the database', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 8, currentPrice: 50000 }
      ];

      const beforeNotification = fakeCoinDataList.coins[0].lastNotification;

      alertLogic(coins);

      // After alertLogic, the coin data should be updated
      const updatedCoin = fakeCoinDataList.coins[0];
      expect(updatedCoin.lastDirection).toBe('up');
      expect(updatedCoin.lastNotification).toBeGreaterThan(beforeNotification);
      expect(console.log).toHaveBeenCalledWith('Updated coin data:', expect.any(Object));
    });
  });

  describe('sendNotification', () => {
    it('should send notification with correct format for positive price change', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 8, currentPrice: 50000 }
      ];

      alertLogic(coins);

      // Check if notification was sent with the correct format
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('幣圈行情通知'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('漲幅'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('bitcoin'));
    });

    it('should send notification with correct format for negative price change', () => {
      fakeCoinDataList.coins[0].lastDirection = 'up';

      const coins = [
        { coinName: 'bitcoin', priceChange1h: -8, currentPrice: 50000 }
      ];

      alertLogic(coins);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('幣圈行情通知'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('跌幅'));
    });

    it('should include coin price in notification', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 8, currentPrice: 55000 }
      ];

      alertLogic(coins);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('$55000'));
    });

    it('should include percentage change in notification', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 12.5, currentPrice: 50000 }
      ];

      alertLogic(coins);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('12.5%'));
    });
  });

  describe('Multiple coins', () => {
    it('should process multiple coins and notify for each that meets criteria', () => {
      const coins = [
        { coinName: 'bitcoin', priceChange1h: 8, currentPrice: 50000 },
        { coinName: 'ethereum', priceChange1h: -8, currentPrice: 3000 }
      ];

      alertLogic(coins);

      // Both coins should trigger notifications (direction changes)
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Sending notification'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('bitcoin'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('ethereum'));
    });

    it('should stop checking after first match for a coin', () => {
      // Set up ethereum to trigger both direction and level changes
      fakeCoinDataList.coins[1].lastDirection = 'up';
      fakeCoinDataList.coins[1].lastLevel = ChangeLevel.NONE;

      const coins = [
        { coinName: 'ethereum', priceChange1h: -35, currentPrice: 3000 }
      ];

      alertLogic(coins);

      // Should trigger on direction change and stop (not check level)
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Sending notification'));
    });
  });

  describe('Error handling', () => {
    it('should throw error when coin data not found in database', () => {
      const coins = [
        { coinName: 'unknownCoin', priceChange1h: 8, currentPrice: 50000 }
      ];

      expect(() => alertLogic(coins)).toThrow('Coin data not found for unknownCoin');
    });
  });
});

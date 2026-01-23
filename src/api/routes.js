/**
 * API route handlers for the Crypto Watcher application.
 * 
 * This module defines all HTTP endpoint handlers for polling cryptocurrency data
 * and retrieving stored coin information.
 */

import { poll } from '../logic/poller.js';
import { alertLogic, getCoinDataStore } from '../logic/alertLogic.js';

/**
 * POST /api/poll
 * 
 * Polls cryptocurrency price data and runs alert logic.
 * Fetches current price and 1-hour change data for specified coins,
 * then evaluates alert conditions.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array<string>} req.body.coins - Array of coin names to poll
 * @param {Object} res - Express response object
 * @returns {Object} Response containing coin data and notification
 * @returns {boolean} returns.success - Whether the operation was successful
 * @returns {Array<Object>} returns.coins - Processed coin data with price changes
 * @returns {string} returns.notification - Alert notification message if triggered
 * @returns {string} returns.message - Status message
 * 
 * @example
 * // Request
 * POST /api/poll
 * { "coins": ["bitcoin", "ethereum"] }
 * 
 * // Response
 * {
 *   "success": true,
 *   "coins": [
 *     { "coinName": "bitcoin", "priceChange1h": 2.5, "currentPrice": 45000 },
 *     { "coinName": "ethereum", "priceChange1h": -1.2, "currentPrice": 2500 }
 *   ],
 *   "notification": "幣圈行情通知: ...",
 *   "message": "Poll completed successfully"
 * }
 */
export async function handlePoll(req, res) {
    try {
        const { coins } = req.body;

        if (!coins || coins.length === 0) {
            return res.status(400).json({ error: 'No coins provided' });
        }

        console.log(`Polling for coins: ${coins.join(', ')}`);
        
        // Use the poll function from logic to fetch and transform price data
        const cleanCoinList = await poll(coins);

        console.log('Price change info:', cleanCoinList);

        // Run alert logic and capture notification
        const notification = alertLogic(cleanCoinList);

        res.json({
            success: true,
            coins: cleanCoinList,
            notification: notification,
            message: 'Poll completed successfully'
        });
    } catch (error) {
        console.error('Error during polling:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.toString()
        });
    }
}

/**
 * GET /api/coin-data
 * 
 * Retrieves the current stored coin data from the database.
 * This includes coins that have been previously tracked with their
 * last known price direction, volatility level, and notification timestamp.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response containing stored coin data
 * @returns {Array<Object>} returns.coins - Array of stored coin objects
 * @returns {string} returns.coins[].id - Coin identifier
 * @returns {string} returns.coins[].lastDirection - Last recorded price direction ('up' or 'down')
 * @returns {string} returns.coins[].lastLevel - Last recorded volatility level
 * @returns {number} returns.coins[].lastNotification - Timestamp of last notification
 * 
 * @example
 * // Request
 * GET /api/coin-data
 * 
 * // Response
 * {
 *   "coins": [
 *     {
 *       "id": "bitcoin",
 *       "lastDirection": "up",
 *       "lastLevel": "high",
 *       "lastNotification": 1674518400000
 *     }
 *   ]
 * }
 */
export function handleCoinData(req, res) {
    const currentStore = getCoinDataStore();
    res.json({
        coins: currentStore.coins
    });
}

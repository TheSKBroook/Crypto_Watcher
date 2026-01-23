import {getPriceChangeInfo} from '../api/api.js';
import { alertLogic } from './alertLogic.js';
import { fakeWatchList } from '../fakeDB.js';

/**
 * Fetches and processes price change data for specified coins or the watch list.
 * 
 * This async function retrieves the current price and 1-hour price change percentage 
 * for each coin, then transforms the API response into a standardized coin data format 
 * with normalized field names. If no coins are provided, uses the default watch list.
 * 
 * @async
 * @param {Array<string>} [coins] - Optional array of coin names to fetch data for. 
 *                                   If not provided, uses the fakeWatchList coins.
 * @returns {Promise<Array<Object>>} Array of coin objects with standardized properties
 * @returns {string} returns[].coinName - The identifier of the coin
 * @returns {number} returns[].priceChange1h - Price change percentage over the last hour
 * @returns {number} returns[].currentPrice - Current price of the coin in base currency
 * 
 * @example
 * // Using default watch list
 * const coins = await poll();
 * 
 * // Polling specific coins
 * const coins = await poll(['bitcoin', 'ethereum']);
 * console.log(coins);
 * // Output: [
 * //   { coinName: 'bitcoin', priceChange1h: 2.5, currentPrice: 45000 },
 * //   { coinName: 'ethereum', priceChange1h: -1.2, currentPrice: 2500 }
 * // ]
 */
export async function poll(coins) {
    console.log("Polling for watch list...\n");
    const coinLists = coins || fakeWatchList.coins;

    console.log("Fetching price change info...\n");
    const res = await getPriceChangeInfo(coinLists);

    
    const cleanCoinList = res.map( ({ id, price_change_percentage_1h_in_currency, current_price }) => ({
        coinName: id,
        priceChange1h: price_change_percentage_1h_in_currency,
        currentPrice: current_price
    }) );
    
    console.log("Price change info:", cleanCoinList);

    return cleanCoinList
}

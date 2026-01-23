
import { getLevelFromChange } from '../constants/levels.js';

const threshold = 5;

// Default empty coin data store - can be set via setCoinDataStore()
let coinDataStore = {
    coins: []
};

function checkPriceOverThreshold( coins ) {
    const newCoinList = [];
    coins.forEach( coin => { 
        if ( Math.abs( coin.priceChange1h ) >= threshold) {
            newCoinList.push( coin );
        }
    })
    return newCoinList;
}

function checkDirectionChanged( currentCoinData, coinData ) {
    return currentCoinData.lastDirection !== coinData.lastDirection;
}

function checkLevelChanged( currentCoinData, coinData ) {
    return currentCoinData.lastLevel !== coinData.lastLevel;
}

function checkTimerExpired( currentCoinData, coinData ) {
    return currentCoinData.lastNotification - coinData.lastNotification >= 3600000; // 1 hour
}

function updateCoinData( currentCoinData, lastCoinData ) {
    lastCoinData.lastDirection = currentCoinData.lastDirection;
    lastCoinData.lastLevel = currentCoinData.lastLevel;
    lastCoinData.lastNotification = currentCoinData.lastNotification;

    console.log("Updated coin data:", lastCoinData);
    return;
}

function sendNotification( coins ) {
    if ( coins.length === 0 ) {
        console.log("No coins to notify.");
        return;
    }

    console.log("Sending notification...");
    
    const notificationItems = coins.map( coin => {
        const direction = coin.priceChange1h > 0 ? '漲幅' : '跌幅';
        
        return `•${direction}:
            ${coin.coinName}${direction}達${coin.priceChange1h}%
            行情波動,立即行動
            目前價格:$${coin.currentPrice}`;
    }).join('\n');
    
    const message = `幣圈行情通知:\n\n${notificationItems}\n\n--\nCrypto Watcher`;
    console.log(message);
    return message;
}

/**
 * Sets the coin data store for alert logic to use.
 * 
 * This allows you to inject a different data store (e.g., fakeCoinDataList, database, etc.)
 * instead of using the default empty list.
 * 
 * @param {Object} dataStore - The data store object containing coins array
 * @param {Array<Object>} dataStore.coins - Array of coin data objects
 * 
 * @example
 * // Import and set the fake database
 * import { fakeCoinDataList } from '../fakeDB.js';
 * setCoinDataStore(fakeCoinDataList);
 * 
 * // Or use a custom data store
 * setCoinDataStore({ coins: [] });
 */
export function setCoinDataStore(dataStore) {
    coinDataStore = dataStore;
    console.log("Coin data store updated.");
}

/**
 * Gets the current coin data store being used by alert logic.
 * 
 * @returns {Object} The current coin data store object
 * @returns {Array<Object>} returns.coins - Array of coin data objects currently stored
 * 
 * @example
 * const currentStore = getCoinDataStore();
 * console.log(currentStore.coins); // View all tracked coins
 */
export function getCoinDataStore() {
    return coinDataStore;
}

/**
 * Evaluates cryptocurrency price data and triggers alerts based on predefined conditions.
 * 
 * This function filters coins by price change threshold, compares current data against 
 * stored data, and generates notifications when price direction, volatility level, or 
 * notification timer conditions are met.
 * 
 * @param {Array<Object>} coins - Array of coin objects to evaluate
 * @param {string} coins[].coinName - The name of the cryptocurrency
 * @param {number} coins[].priceChange1h - Price change percentage over the last hour
 * @param {number} coins[].currentPrice - Current price of the coin
 * @returns {string|undefined} Notification message in Chinese format if alerts are generated, 
 *                             undefined if no coins exceed the threshold
 * 
 * @example
 * const coins = [
 *   { coinName: 'BTC', priceChange1h: 0.05, currentPrice: 45000 },
 *   { coinName: 'ETH', priceChange1h: -0.02, currentPrice: 2500 }
 * ];
 * const notification = alertLogic(coins);
 */
export function alertLogic( coins ) {
    console.log("Running alert logic...");
    coins = checkPriceOverThreshold( coins );
    if ( coins.length === 0 ) { 
        console.log("No coins over threshold, skipping alerts.");    
        return; 
    }

    const notifiedCoins = [];
    const checkFunctions = [
        { check: checkDirectionChanged, reason: 'direction' },
        { check: checkLevelChanged, reason: 'level' },
        { check: checkTimerExpired, reason: 'timer' }
    ];

    for ( const coin of coins ) {
        const currentCoinData = {
            id: coin.coinName,
            lastDirection: coin.priceChange1h > 0 ? 'up' : 'down',
            lastLevel: getLevelFromChange( coin.priceChange1h ),
            lastNotification: Date.now()
        }
        let lastCoinData = coinDataStore.coins.find( c => c.id === coin.coinName );
        
        // If coin not found, add it to the database and notify
        if ( !lastCoinData ) { 
            console.log(`New coin detected: ${coin.coinName}. Adding to database...`);
            lastCoinData = {
                id: coin.coinName,
                lastDirection: currentCoinData.lastDirection,
                lastLevel: currentCoinData.lastLevel,
                lastNotification: currentCoinData.lastNotification - 3600000 // Set to 1 hour ago to trigger notification
            };
            coinDataStore.coins.push( lastCoinData );
            notifiedCoins.push( coin );
            console.log(`Added new coin: ${coin.coinName}`);
            continue;
        }

        for ( const { check, reason } of checkFunctions ) {
            if ( check( currentCoinData, lastCoinData )) {
                notifiedCoins.push( coin );
                updateCoinData( currentCoinData, lastCoinData );
                break; // Stop after first match
            }
        }
    }

    const notification = sendNotification( notifiedCoins );

    return notification;

}

import { fakeCoinDataList, fakeUserDatabase } from '../fakeDB.js';
import { ChangeLevel, getLevelFromChange } from '../constants/levels.js';

const threshold = 0.01;

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
        let lastCoinData = fakeCoinDataList.coins.find( c => c.id === coin.coinName );
        
        // If coin not found, add it to the database and notify
        if ( !lastCoinData ) { 
            console.log(`New coin detected: ${coin.coinName}. Adding to database...`);
            lastCoinData = {
                id: coin.coinName,
                lastDirection: currentCoinData.lastDirection,
                lastLevel: currentCoinData.lastLevel,
                lastNotification: currentCoinData.lastNotification - 3600000 // Set to 1 hour ago to trigger notification
            };
            fakeCoinDataList.coins.push( lastCoinData );
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

    // Advanced feature for later use
    // findUsersByCoins( coins ).forEach( user => {
    //     for ( const coin of coins ) {
    //         const userCoinData = user.coins.find( c => c.id === coin.coinName );
    //         if ( !userCoinData ) { continue; }
    //         if (checkDirectionChanged( coin, userCoinData )) { alertAction( coin, user, "direction" ); continue; }
    //         if (checkLevelChanged( coin, userCoinData )) { alertAction( coin, user, "level" ); continue; }
    //         if (checkTimerExpired( coin, userCoinData )) { alertAction( coin, user, "timer" ); continue; }
    //     }

    //     sendNotification( user );
    // });

}


// Maybe put this in another file later
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

// This is advanced feature for later use
function findUsersByCoins( coins ) {
    // this is a database query placeholder
    // will need to be moved to another files later
    // 
    // Here we will be using that fakeDB 

    const coinSet = new Set(coins.map(c => c.coinName));

    return fakeUserDatabase.users.filter(user => 
        user.coins.some(userCoin => coinSet.has(userCoin.id))
    );
}
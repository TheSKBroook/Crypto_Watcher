
import fakeDatabase from '../fakeDB.js';
import { ChangeLevel, getLevelFromChange } from '../constants/levels.js';

const threshold = 5;

function checkPriceOverThreshold( coins ) {
    const newCoinList = [];
    coins.forEach( coin => { 
        if ( Math.abs( coin.priceChange1h ) >= threshold) {
            newCoinList.push( coin );
        }
    })
    return newCoinList;
}

function findUsersByCoins( coins ) {
    // this is a database query placeholder
    // will need to be moved to another files later
    // 
    // Here we will be using that fakeDB 

    const coinSet = new Set(coins.map(c => c.coinName));

    return fakeDatabase.users.filter(user => 
        user.coins.some(userCoin => coinSet.has(userCoin.id))
    );
}

function checkDirectionChanged( coin, userCoinData ) {
    const currentDirection = coin.priceChange1h > 0 ? 'up' : 'down';
    return currentDirection !== userCoinData.lastDirection;
}

function checkLevelChanged( coin, userCoinData ) {
    return getLevelFromChange( coin.priceChange1h ) !== userCoinData.lastLevel;
}

function checkTimerExpired( coin, userCoinData ) {
    return Date.now() - userCoinData.lastNotification >= 3600000; // 1 hour
}

export function alertLogic( coins ) {
    console.log("Running alert logic...");
    coins = checkPriceOverThreshold( coins );
    if ( coins.length === 0 ) { 
        console.log("No coins over threshold, skipping alerts.");    
        return; 
    }

    findUsersByCoins( coins ).forEach( user => {
        for ( const coin of coins ) {
            const userCoinData = user.coins.find( c => c.id === coin.coinName );
            if ( !userCoinData ) { continue; }
            if (checkDirectionChanged( coin, userCoinData )) { alertAction( coin, user, "direction" ); continue; }
            if (checkLevelChanged( coin, userCoinData )) { alertAction( coin, user, "level" ); continue; }
            if (checkTimerExpired( coin, userCoinData )) { alertAction( coin, user, "timer" ); continue; }
        }

        sendNotification( user );
    });

    return;
}


function alertAction ( coin, user, reason ) {
    console.log(`Alert action for ${user.name} on ${coin.coinName} due to ${reason}`);
    return;
}

function sendNotification( user ) {
    console.log(`Sending notification to ${user.name}`);
    console.log("");
    return;
}

import fakeDatabase from '../fakeDB.js';
import { ChangeLevel, getLevelFromChange } from '../constants/levels.js';

function checkPriceOverThreshold( coins ) {
    const newCoinList = [];
    coins.forEach( coin => { 
        if ( Math.abs( coin.priceChange1h ) >= 0.1) {
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
    const usersWithThoseCoins = [];
    fakeDatabase.users.forEach( user => {
        for ( const coin of coins ) {
            if ( user.coins[ coin.coinName ] ) {
                // user has that coin
                usersWithThoseCoins.push( user );
                break;
            }
        }
    });
    return usersWithThoseCoins;
}

function checkDirectionChanged( coin, user ) {
    const userCoinData = user.coins[ coin.coinName ];
    const currentDirection = coin.priceChange1h > 0 ? 'up' : 'down';
    return currentDirection !== userCoinData.lastDirection;
}

function checkLevelChanged( coin, user ) {
    const userCoinData = user.coins[ coin.coinName ];
    return getLevelFromChange( coin.priceChange1h ) !== userCoinData.lastLevel;
}

function checkTimerExpired( coin, user ) {
    const userCoinData = user.coins[ coin.coinName ];
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
            if ( !user.coins[ coin.coinName ] ) { continue; }
            if (checkDirectionChanged( coin, user )) { alertAction( coin, user, "direction" ); continue; }
            if (checkLevelChanged( coin, user )) { alertAction( coin, user, "level" ); continue; }
            if (checkTimerExpired( coin, user )) { alertAction( coin, user, "timer" ); continue; }
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
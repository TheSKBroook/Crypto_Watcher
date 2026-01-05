import fakeDatabase from '../fakeDB.js';
const threshold = 5; // percentage

function checkPriceOverThreshold( coins ) {
    const newCoinList = [];
    coins.forEach( coin => { 
        if ( Math.abs( coin.priceChange1h ) >= threshold ) {
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

export function alertLogic( coins ) {
    coins = checkPriceOverThreshold( coins );
    if ( coins.length === 0 ) { return; }

    findUsersByCoins( coins ).forEach( user => {
        if (checkDirectionChanged( coin, user )) { alertAction( coin, user ) }
        if (checkLevelChanged( coin, user )) { alertAction( coin, user ) }
        if (checkTimerExpired( coin, user )) { alertAction( coin, user ) }
    });
    
    return;
}


function alertAction ( coin, user ) {
    resetTimer(user);
}
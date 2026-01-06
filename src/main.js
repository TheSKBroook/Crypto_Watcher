import { poll } from './logic/poller.js';
import { alertLogic } from './logic/alertLogic.js';

console.log("Starting Crypto Watcher...");

async function runCryptoCheck() {
    const coins = await poll();
    alertLogic( coins );
}

// Run immediately
runCryptoCheck();

// Then run every 20 seconds
setInterval( runCryptoCheck, 20000 );
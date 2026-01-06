import {getPriceChangeInfo} from '../api/api.js';
import { alertLogic } from './alertLogic.js';
import { fakeWatchList } from '../fakeDB.js';

export async function poll() {
    console.log("Polling for watch list...\n");
    const coinLists = fakeWatchList.coins;

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

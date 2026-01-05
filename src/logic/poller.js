import {getPriceChangeInfo} from '../api/api.js';
import { alertLogic } from './alertLogic.js';

const coinLists = ['bitcoin', 'ethereum'];


export async function poll() {
    console.log("Fetching price change info...");
    const res = await getPriceChangeInfo(coinLists);

    
    const clean = res.map( ({ id, price_change_percentage_1h_in_currency, current_price }) => ({
        coinName: id,
        priceChange1h: price_change_percentage_1h_in_currency,
        currentPrice: current_price
    }) );
    
    console.log("Price change info:", clean);

    alertLogic( clean );
}

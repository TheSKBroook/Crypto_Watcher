import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.API_KEY;

export async function getPriceChangeInfo(coinIds = ['bitcoin']) {
    const options = {method: 'GET', headers: {'x-cg-demo-api-key': apiKey}};

    const idsParam = coinIds.join(',');
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}&price_change_percentage=1h`, options);
    const data = await res.json();

    return data;
}

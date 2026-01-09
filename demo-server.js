import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { alertLogic } from './src/logic/alertLogic.js';
import { getPriceChangeInfo } from './src/api/api.js';
import { fakeCoinDataList } from './src/fakeDB.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'test')));

// API endpoint for polling and running alert logic
app.post('/api/poll', async (req, res) => {
    try {
        const { coins } = req.body;

        if (!coins || coins.length === 0) {
            return res.status(400).json({ error: 'No coins provided' });
        }

        console.log(`Polling for coins: ${coins.join(', ')}`);
        
        // Fetch price data for the specified coins
        const priceData = await getPriceChangeInfo(coins);

        // Transform the data to match alertLogic format
        const cleanCoinList = priceData.map(({ id, price_change_percentage_1h_in_currency, current_price }) => ({
            coinName: id,
            priceChange1h: price_change_percentage_1h_in_currency,
            currentPrice: current_price
        }));

        console.log('Price change info:', cleanCoinList);

        // Run alert logic and capture notification
        const notification = alertLogic(cleanCoinList);

        res.json({
            success: true,
            coins: cleanCoinList,
            notification: notification,
            message: 'Poll completed successfully'
        });
    } catch (error) {
        console.error('Error during polling:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.toString()
        });
    }
});

// API endpoint to get current coin data
app.get('/api/coin-data', (req, res) => {
    res.json({
        coins: fakeCoinDataList.coins
    });
});

// Serve the demo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test', 'demo.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Crypto Watcher Demo Server running at http://localhost:${PORT}`);
    console.log(`📊 Open your browser and navigate to http://localhost:${PORT}\n`);
});

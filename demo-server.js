import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handlePoll, handleCoinData } from './src/api/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'test')));

// API Routes
app.post('/api/poll', handlePoll);
app.get('/api/coin-data', handleCoinData);

// Serve the demo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test', 'demo.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Crypto Watcher Demo Server running at http://localhost:${PORT}`);
    console.log(`📊 Open your browser and navigate to http://localhost:${PORT}\n`);
});

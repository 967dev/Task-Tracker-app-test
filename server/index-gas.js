const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Используем встроенный fetch в Node.js 18+, либо полифилл если версия старая
// Для v18+ ничего устанавливать не нужно

dotenv.config();

const config = require('./config');

const app = express();
const PORT = process.env.PORT || config.PORT || 3001;
const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL || config.GOOGLE_APPS_SCRIPT_URL;

app.use(cors());
app.use(express.json());

// Проверка наличия URL скрипта
if (!GAS_URL) {
    console.warn('⚠️ WARNING: GOOGLE_APPS_SCRIPT_URL is not set in .env');
}

// Вспомогательная функция для запросов к GAS
async function callGoogleScript(data) {
    if (!GAS_URL) {
        throw new Error('Google Apps Script URL not configured');
    }

    // Google Apps Script имеет особенность: он делает 302 редирект.
    // При редиректе POST тела часто теряются.
    // Самый надежный способ - передавать данные через GET параметры.
    const url = new URL(GAS_URL);
    Object.keys(data).forEach(key => url.searchParams.append(key, data[key]));

    console.log('📡 Calling GAS:', data.action);

    const response = await fetch(url.toString(), {
        method: 'GET', // Используем GET, так как данные в URL
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow'
    });

    const text = await response.text();

    // Иногда Google возвращает HTML (страница ошибки или входа)
    if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1] : 'Unknown Title';

        console.error('❌ GAS Error. Received HTML instead of JSON.');
        console.error(`📄 Page Title: "${title}"`);
        console.error('💡 HINT: Check "Who has access" in deploy settings. It MUST be "Anyone".');
        console.error('💡 HINT: Check if the URL involves a redirect that invalidates the request.');

        throw new Error(`Google Apps Script Error: ${title}. Check deployment permissions (Must be 'Anyone').`);
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('❌ Failed to parse GAS response:', text);
        throw new Error('Invalid response from Google Apps Script');
    }
}

// === API Routes ===

// 1. Авторизация и получение данных
app.post('/api/auth', async (req, res) => {
    try {
        const { userId, username } = req.body;

        // Запрашиваем auth у скрипта
        const result = await callGoogleScript({
            action: 'auth',
            userId: userId,
            username: username
        });

        if (result.error) {
            throw new Error(result.error);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in /api/auth:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Получение статусов заданий (фактически то же самое что auth, но без создания)
app.get('/api/tasks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await callGoogleScript({
            action: 'getTasks',
            userId: userId
        });

        if (result.error && result.error !== 'User not found') {
            throw new Error(result.error);
        }

        // Если юзер не найден или ошибка - вернем пустые данные
        if (result.error === 'User not found') {
            return res.json({ tasks: {}, proofLinks: {} });
        }

        res.json({
            tasks: result.tasks || {},
            proofLinks: result.proofLinks || {}
        });
    } catch (error) {
        console.error('Error in /api/tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Отправка отчета
app.post('/api/submit', async (req, res) => {
    try {
        const { userId, taskNum, proofLink } = req.body;

        // Валидация на стороне Node.js
        if (!proofLink || !proofLink.startsWith('https://t.me/')) {
            return res.status(400).json({ error: 'Invalid proof link' });
        }

        const result = await callGoogleScript({
            action: 'submit',
            userId: userId,
            taskNum: taskNum,
            proofLink: proofLink
        });

        if (result.error) {
            throw new Error(result.error);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error in /api/submit:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mode: 'google-apps-script',
        configured: !!GAS_URL
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server (GAS Mode) running on http://localhost:${PORT}`);
});

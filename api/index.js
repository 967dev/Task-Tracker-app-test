const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Инициализация Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// URL нашего Google Apps Script
const GAS_URL = 'https://script.google.com/macros/s/AKfycbylRT9qx8uctGfkFBjiH7OBQat0Ofs5M7R0TZe72WUMs3O3n2fqeeUGy2GnhmTJlP0/exec';

// Вспомогательная функция для запросов к GAS
async function fetchGAS(action, params = {}) {
    const url = new URL(GAS_URL);
    url.searchParams.append('action', action);

    // Добавляем остальные параметры в URL
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });

    console.log(`[Vercel API] Fetching GAS: ${action}`, Object.keys(params));

    try {
        const response = await fetch(url.toString(), {
            method: 'GET', // Используем GET для надежности (redirects)
        });

        const text = await response.text();
        console.log(`[Vercel API Debug] GAS Response for ${action}:`, text.substring(0, 500)); // Логируем первые 500 символов ответа

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('[Vercel API] JSON Parse Error. Received:', text);
            throw new Error('Invalid JSON response from GAS');
        }
    } catch (error) {
        console.error(`[Vercel API] Error in ${action}:`, error);
        throw error;
    }
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: 'vercel' });
});

// Регистрация/проверка пользователя
app.post('/api/auth', async (req, res) => {
    try {
        const { userId, username, firstName, lastName } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const result = await fetchGAS('registerUser', {
            userId,
            username,
            firstName,
            lastName
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение заданий пользователя
app.get('/api/tasks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const result = await fetchGAS('getUserTasks', { userId });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Отправка задания на проверку
app.post('/api/submit', async (req, res) => {
    try {
        const { userId, taskNum, proofLink } = req.body;
        if (!userId || !taskNum) return res.status(400).json({ error: 'Missing data' });

        const result = await fetchGAS('submitTask', {
            userId,
            taskNum,
            proofLink
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Экспортируем приложение для Vercel
// Обновление текущего дня (только для админа)
app.post('/api/admin/set-day', async (req, res) => {
    try {
        const { userId, day } = req.body;
        const data = await fetchGAS('setGlobalDay', { userId, day });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;

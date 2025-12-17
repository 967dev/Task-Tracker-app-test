const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Инициализация Google Sheets
let doc;
let sheet;

async function initializeGoogleSheets() {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');

        const serviceAccountAuth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        // Используем первый лист или создаем новый
        sheet = doc.sheetsByIndex[0];

        if (!sheet) {
            sheet = await doc.addSheet({
                headerValues: ['User ID', 'Username', 'Задание 1 (Тест)', 'Дата регистрации']
            });
        }

        // Проверяем и добавляем заголовки если их нет
        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;

        if (headers.length === 0) {
            await sheet.setHeaderRow(['User ID', 'Username', 'Задание 1 (Тест)', 'Дата регистрации']);
        }

        console.log('✅ Google Sheets initialized successfully');
        console.log('📊 Sheet title:', sheet.title);
    } catch (error) {
        console.error('❌ Error initializing Google Sheets:', error.message);
        console.error('💡 Make sure GOOGLE_SHEETS_CREDENTIALS and GOOGLE_SHEETS_SPREADSHEET_ID are set correctly');
    }
}

// API Routes

// Авторизация/регистрация пользователя
app.post('/api/auth', async (req, res) => {
    try {
        const { userId, username, firstName, lastName } = req.body;

        if (!sheet) {
            return res.status(500).json({ error: 'Google Sheets not initialized' });
        }

        await sheet.loadCells();
        const rows = await sheet.getRows();

        // Проверяем, существует ли пользователь
        const existingUser = rows.find(row => row.get('User ID') == userId);

        if (!existingUser) {
            // Регистрируем нового пользователя
            await sheet.addRow({
                'User ID': userId,
                'Username': username,
                'Задание 1 (Тест)': '',
                'Дата регистрации': new Date().toLocaleDateString('ru-RU')
            });

            console.log(`✅ New user registered: ${username} (${userId})`);
        } else {
            console.log(`👤 Existing user logged in: ${username} (${userId})`);
        }

        res.json({ success: true, isNewUser: !existingUser });
    } catch (error) {
        console.error('Error in /api/auth:', error);
        res.status(500).json({ error: error.message });
    }
});

// Получение статусов заданий пользователя
app.get('/api/tasks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!sheet) {
            return res.status(500).json({ error: 'Google Sheets not initialized' });
        }

        const rows = await sheet.getRows();
        const userRow = rows.find(row => row.get('User ID') == userId);

        if (!userRow) {
            return res.json({ tasks: {}, proofLinks: {} });
        }

        // Получаем статусы заданий
        const task1Link = userRow.get('Задание 1 (Тест)') || '';

        const tasks = {
            1: task1Link ? 'review' : 'pending' // review если ссылка есть, pending если нет
        };

        const proofLinks = {
            1: task1Link
        };

        res.json({ tasks, proofLinks });
    } catch (error) {
        console.error('Error in /api/tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// Отправка отчета о выполнении задания
app.post('/api/submit', async (req, res) => {
    try {
        const { userId, taskNum, proofLink } = req.body;

        if (!sheet) {
            return res.status(500).json({ error: 'Google Sheets not initialized' });
        }

        // Валидация ссылки
        if (!proofLink || !proofLink.startsWith('https://t.me/')) {
            return res.status(400).json({ error: 'Invalid proof link' });
        }

        const rows = await sheet.getRows();
        const userRow = rows.find(row => row.get('User ID') == userId);

        if (!userRow) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Обновляем ячейку с заданием
        const taskColumn = `Задание ${taskNum} (Тест)`;
        userRow.set(taskColumn, proofLink);
        await userRow.save();

        console.log(`✅ Task ${taskNum} submitted by user ${userId}`);
        console.log(`🔗 Proof link: ${proofLink}`);

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
        googleSheets: sheet ? 'connected' : 'not connected'
    });
});

// Инициализация
async function startServer() {
    await initializeGoogleSheets();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

startServer();

// 📋 ИНСТРУКЦИЯ:
// 1. Откройте вашу Google Таблицу
// 2. Перейдите в Расширения > Apps Script (Extensions > Apps Script)
// 3. Скопируйте этот код и вставьте вместо всего, что там есть
// 4. Нажмите "Начать развертывание" > "Новое развертывание" (Deploy > New deployment)
// 5. Выберите тип: "Веб-приложение" (Web app)
// 6. Описание: "v1"
// 7. От имени: "Меня" (Me)
// 8. У кого есть доступ: "Всех" (Anyone) - ЭТО ВАЖНО!
// 9. Нажмите "Начать развертывание" и скопируйте полученный URL (Web App URL)

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

        // Инициализация заголовков, если таблица пустая
        if (sheet.getLastRow() === 0) {
            const headers = ['User ID', 'Username', 'Задание 1 (Тест)', 'Задание 2', 'Дата регистрации'];
            sheet.appendRow(headers);
        }

        // Разбор параметров
        let requestData = {};
        if (e.postData && e.postData.contents) {
            requestData = JSON.parse(e.postData.contents);
        } else if (e.parameter) {
            requestData = e.parameter;
        }

        const action = requestData.action;
        const userId = requestData.userId; // Всегда строкой

        if (!userId) {
            return responseJSON({ error: 'User ID is required' });
        }

        // Поиск пользователя
        const data = sheet.getDataRange().getValues();
        let userRowIndex = -1;

        // data[0] - заголовки. Ищем начиная с 1
        for (let i = 1; i < data.length; i++) {
            // Сравниваем как строки, чтобы избежать проблем с типами
            if (String(data[i][0]) === String(userId)) {
                userRowIndex = i + 1; // Индекс для API (1-based)
                break;
            }
        }

        // === ЛОГИКА ДЕЙСТВИЙ ===

        // 1. АВТОРИЗАЦИЯ / ПОЛУЧЕНИЕ ДАННЫХ
        if (action === 'auth' || action === 'getTasks') {
            if (userRowIndex === -1 && action === 'auth') {
                // Регистрация нового
                const username = requestData.username || 'unknown';
                const date = new Date().toLocaleDateString('ru-RU');

                sheet.appendRow([userId, username, '', '', date]);
                return responseJSON({ success: true, isNewUser: true, tasks: { 1: 'pending', 2: 'pending' }, proofLinks: { 1: '', 2: '' } });
            } else if (userRowIndex !== -1) {
                // Пользователь существует, возвращаем данные
                const rowData = sheet.getRange(userRowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

                // Индексы колонок (начинаются с 0 в массиве rowData):
                // 0: User ID, 1: Username, 2: Задание 1, 3: Задание 2

                const task1Link = rowData[2];
                const task2Link = rowData[3];

                const tasks = {
                    1: task1Link ? 'review' : 'pending',
                    2: task2Link ? 'review' : 'pending'
                };

                const proofLinks = {
                    1: task1Link || '',
                    2: task2Link || ''
                };

                return responseJSON({ success: true, isNewUser: false, tasks, proofLinks });
            } else {
                return responseJSON({ success: false, error: 'User not found' });
            }
        }

        // 2. ОТПРАВКА ОТЧЕТА
        if (action === 'submit') {
            const taskNum = requestData.taskNum;
            const proofLink = requestData.proofLink;

            if (!taskNum || !proofLink) {
                return responseJSON({ error: 'Missing taskNum or proofLink' });
            }

            if (userRowIndex === -1) {
                return responseJSON({ error: 'User not found for submission' });
            }

            // Определяем колонку для записи (Задание 1 -> колонка 3, Задание 2 -> колонка 4)
            // В Sheets API getRange: row, col. Col 1 = A.
            // Заголовки: A(1), B(2), C(3)...
            // C = Задание 1. D = Задание 2.
            // Формула: 2 + taskNum

            const colIndex = 2 + parseInt(taskNum);
            sheet.getCell(userRowIndex, colIndex).setValue(proofLink);

            return responseJSON({ success: true, message: 'Updated' });
        }

        return responseJSON({ error: 'Unknown action' });

    } catch (err) {
        return responseJSON({ error: err.toString() });
    } finally {
        lock.releaseLock();
    }
}

function responseJSON(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

// Тестовая функция для проверки в редакторе скриптов
function test() {
    const e = {
        parameter: {
            action: 'auth',
            userId: '12345',
            username: 'test_user'
        }
    };
    Logger.log(doGet(e).getContent());
}

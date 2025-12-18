// 📋 ИНСТРУКЦИЯ:
// 1. Вставьте этот код в Google Apps Script.
// 2. Создайте НОВОЕ развертывание (Deploy > New deployment).
// 3. Скопируйте новый URL.

const TASK_IDS = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 16];

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

        // Инициализация заголовков
        if (sheet.getLastRow() === 0) {
            const headers = ['User ID', 'Username'];
            TASK_IDS.forEach(id => headers.push(`Задание ${id}`));
            headers.push('Дата регистрации');
            sheet.appendRow(headers);
        }

        // Разбор параметров
        let requestData = {};
        if (e.parameter) {
            requestData = e.parameter;
        } else if (e.postData && e.postData.contents) {
            try {
                requestData = JSON.parse(e.postData.contents);
            } catch (err) { }
        }

        const action = requestData.action;
        const userId = requestData.userId ? String(requestData.userId) : null;

        // Разрешаем getTasks без userId (вернет пустышку), но для остальных нужен ID
        if (!userId && action !== 'getUserTasks') {
            return responseJSON({ error: 'User ID is required' });
        }

        // Поиск пользователя
        const lastRow = sheet.getLastRow();
        let userRowIndex = -1;

        if (lastRow > 1) {
            // Берем только колонку A (User ID)
            const userIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().map(String);
            const index = userIds.indexOf(userId);
            if (index !== -1) {
                userRowIndex = index + 2; // +2 к индексу (учитываем заголовок и base-0)
            }
        }

        // === 1. РЕГИСТРАЦИЯ ===
        if (action === 'registerUser') {
            const username = requestData.username || 'unknown';
            const date = new Date().toLocaleDateString('ru-RU');

            if (userRowIndex === -1) {
                const newRow = [userId, username];
                TASK_IDS.forEach(() => newRow.push(''));
                newRow.push(date);
                sheet.appendRow(newRow);
                return responseJSON({ success: true, isNewUser: true });
            } else {
                sheet.getRange(userRowIndex, 2).setValue(username);
                return responseJSON({ success: true, isNewUser: false });
            }
        }

        // === 2. ПОЛУЧЕНИЕ ЗАДАНИЙ ===
        if (action === 'getUserTasks') {
            if (userRowIndex === -1) {
                return responseJSON({ tasks: {}, proofLinks: {} });
            }

            // Читаем строку пользователя
            const rowValues = sheet.getRange(userRowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
            const tasks = {};
            const proofLinks = {};

            TASK_IDS.forEach((taskId, index) => {
                const colValue = rowValues[index + 2];
                const proof = colValue ? String(colValue) : '';
                proofLinks[taskId] = proof;

                const p = proof.toUpperCase();
                // Проверяем все варианты: TRUE, true, completed, ok, done, +, 1
                if (p === 'TRUE' || p === 'COMPLETED' || p === 'OK' || p === 'DONE' || p === '+' || p === '1' || p === 'YES') {
                    tasks[taskId] = 'completed';
                } else if (proof && proof.length > 5) {
                    tasks[taskId] = 'review';
                } else {
                    tasks[taskId] = 'pending';
                }
            });

            return responseJSON({ tasks, proofLinks });
        }

        // === 3. ОТПРАВКА ЗАДАНИЯ ===
        if (action === 'submitTask') {
            const taskNum = parseInt(requestData.taskNum);
            const proofLink = requestData.proofLink;

            if (!taskNum || !proofLink) return responseJSON({ error: 'Missing data' });
            if (userRowIndex === -1) return responseJSON({ error: 'User not found' });

            const taskArrayIndex = TASK_IDS.indexOf(taskNum);
            if (taskArrayIndex === -1) return responseJSON({ error: 'Invalid Task ID' });

            // ИСПРАВЛЕНИЕ ТУТ: используем getRange вместо getCell
            const colIndex = taskArrayIndex + 3;
            sheet.getRange(userRowIndex, colIndex).setValue(proofLink);

            return responseJSON({ success: true });
        }

        return responseJSON({ error: 'Unknown action: ' + action });

    } catch (err) {
        return responseJSON({ error: 'Server Error: ' + err.toString() });
    } finally {
        lock.releaseLock();
    }
}

function responseJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

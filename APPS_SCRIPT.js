// 📋 ИНСТРУКЦИЯ: Обновите этот код в Google Apps Script.

const TASK_IDS = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 16];
const ADMIN_ID = "1392201995"; // Ваш ID

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
        const props = PropertiesService.getScriptProperties();

        // Разбор параметров
        let requestData = {};
        if (e.parameter) { requestData = e.parameter; }
        else if (e.postData && e.postData.contents) {
            try { requestData = JSON.parse(e.postData.contents); } catch (err) { }
        }

        const action = requestData.action;
        const userId = requestData.userId ? String(requestData.userId) : null;

        // --- АДМИН-ДЕЙСТВИЕ: Установка дня ---
        if (action === 'setGlobalDay') {
            if (userId !== ADMIN_ID) return responseJSON({ error: 'Permission denied' });
            const newDay = requestData.day;
            props.setProperty('currentActiveDay', String(newDay));
            return responseJSON({ success: true, newDay: newDay });
        }

        // Получаем текущий активный день (по умолчанию 1)
        const currentActiveDay = parseInt(props.getProperty('currentActiveDay') || "1");

        // Поиск пользователя
        const lastRow = sheet.getLastRow();
        let userRowIndex = -1;
        if (lastRow > 1 && userId) {
            const userIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().map(String);
            const index = userIds.indexOf(userId);
            if (index !== -1) userRowIndex = index + 2;
        }

        // === 1. РЕГИСТРАЦИЯ ===
        if (action === 'registerUser') {
            if (userRowIndex === -1 && userId) {
                const newRow = [userId, requestData.username || 'unknown'];
                TASK_IDS.forEach(() => newRow.push(''));
                newRow.push(new Date().toLocaleDateString('ru-RU'));
                sheet.appendRow(newRow);
            }
            return responseJSON({ success: true, currentDay: currentActiveDay });
        }

        // === 2. ПОЛУЧЕНИЕ ЗАДАНИЙ ===
        if (action === 'getUserTasks') {
            const tasks = {};
            const proofLinks = {};

            if (userRowIndex !== -1) {
                const rowValues = sheet.getRange(userRowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
                TASK_IDS.forEach((taskId, index) => {
                    const proof = rowValues[index + 2] ? String(rowValues[index + 2]) : '';
                    proofLinks[taskId] = proof;
                    const p = proof.toUpperCase();
                    if (['TRUE', 'COMPLETED', 'OK', 'DONE', '+', '1', 'YES'].includes(p)) tasks[taskId] = 'completed';
                    else if (proof.length > 5) tasks[taskId] = 'review';
                    else tasks[taskId] = 'pending';
                });
            }
            return responseJSON({ tasks, proofLinks, currentDay: currentActiveDay });
        }

        // === 3. ОТПРАВКА ЗАДАНИЯ ===
        if (action === 'submitTask') {
            const taskNum = parseInt(requestData.taskNum);
            const taskArrayIndex = TASK_IDS.indexOf(taskNum);
            if (taskArrayIndex === -1 || userRowIndex === -1) return responseJSON({ error: 'Invalid request' });
            sheet.getRange(userRowIndex, taskArrayIndex + 3).setValue(requestData.proofLink);
            return responseJSON({ success: true });
        }

        return responseJSON({ error: 'Unknown action' });
    } catch (err) {
        return responseJSON({ error: err.toString() });
    } finally {
        lock.releaseLock();
    }
}

function responseJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

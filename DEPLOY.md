# 🌐 Деплой Quest Tracker

## Варианты деплоя

### 1. Vercel (Рекомендуется для Frontend)

#### Шаг 1: Подготовка
```bash
npm run build
```

#### Шаг 2: Деплой
1. Установите Vercel CLI:
```bash
npm install -g vercel
```

2. Залогиньтесь:
```bash
vercel login
```

3. Деплой:
```bash
vercel --prod
```

4. Добавьте переменные окружения в Vercel Dashboard

### 2. Railway (Для Full-Stack приложения)

1. Создайте аккаунт на [Railway.app](https://railway.app)
2. Создайте новый проект
3. Подключите GitHub репозиторий
4. Добавьте переменные окружения:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SHEETS_CREDENTIALS`
   - `PORT`

### 3. Render

1. Создайте аккаунт на [Render.com](https://render.com)
2. Создайте Web Service
3. Подключите репозиторий
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run server`

### 4. Heroku

```bash
# Установите Heroku CLI
heroku login
heroku create quest-tracker-app

# Добавьте переменные окружения
heroku config:set GOOGLE_SHEETS_SPREADSHEET_ID=your_id
heroku config:set GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account"...}'

# Деплой
git push heroku main
```

## 📱 Обновление URL в Telegram Bot

После деплоя:
1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/myapps`
3. Выберите ваше приложение
4. Нажмите "Edit Web App URL"
5. Вставьте новый URL

## 🔒 Безопасность Production

### ⚠️ Важно!

1. **Никогда не коммитьте .env файл**
2. **Используйте переменные окружения на платформе деплоя**
3. **Ограничьте доступ к Google Service Account**
4. **Используйте HTTPS для всех запросов**

### Проверка безопасности

```bash
# Убедитесь, что .env в .gitignore
cat .gitignore | grep .env

# Проверьте, что .env не в git
git ls-files | grep .env
```

## 🚀 CI/CD с GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

## 📊 Мониторинг

### Health Check Endpoint

```bash
curl https://your-app.com/api/health
```

### Логирование

Проверяйте логи на вашей платформе:
- Vercel: Dashboard → Your Project → Logs
- Railway: Dashboard → Your Project → Deployments → View Logs
- Render: Dashboard → Your Service → Logs

## 🔄 Обновления

```bash
# Обновите код
git add .
git commit -m "Update features"
git push

# Платформа автоматически задеплоит новую версию
```

## 📝 Checklist перед деплоем

- [ ] `.env` файл не в git
- [ ] Все зависимости установлены
- [ ] Build проходит успешно (`npm run build`)
- [ ] Backend тесты пройдены
- [ ] Google Sheets подключены и работают
- [ ] Service Account имеет доступ к таблице
- [ ] Переменные окружения настроены на платформе
- [ ] HTTPS включен
- [ ] URL обновлен в BotFather

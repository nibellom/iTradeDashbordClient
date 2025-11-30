# Настройка переменных окружения

## Для разработки

Создайте файл `.env.development` в папке `client/`:

```
REACT_APP_API_URL=http://localhost:8000
```

## Для продакшена

Создайте файл `.env.production` в папке `client/`:

```
REACT_APP_API_URL=https://itradedashbord-nibellom.amvera.io
```

## Для Vercel

В настройках проекта Vercel добавьте переменную окружения:

- **Name**: `REACT_APP_API_URL`
- **Value**: `https://itradedashbord-nibellom.amvera.io`

Это можно сделать в разделе Settings → Environment Variables в панели Vercel.

## Примечание

React автоматически использует:
- `.env.development` при запуске `npm start`
- `.env.production` при сборке `npm run build`

Все переменные окружения должны начинаться с `REACT_APP_` чтобы быть доступными в коде.


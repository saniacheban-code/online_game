# Учебная арена Mobile 1.2

18 предметов, 17 игр, обязательные фамилия и имя, класс 1–11, пароль от 6 символов. Месячный рейтинг, общий счёт и архив победителей. Автоматическое подведение итогов 1-го числа через Apps Script.

Начните с [MOBILE_START_HERE.md](MOBILE_START_HERE.md). Для новых функций замените Code.gs и appsscript.json в том же проекте Apps Script, выполните setup и обновите существующее развертывание. Не удаляйте прежнюю базу и AUTH_PEPPER. Последний URL уже внесён в mobile/config.js; проверьте также переменную GitHub ARENA_API_URL.

Контрольная GitHub 3.0 сохранена отдельно. `npm test` — проверки; `npm run build:web` — сайт; `npm run build:android` — Android-ресурсы. APK/AAB собираются в GitHub Actions, готовый бинарник в архив не входит.

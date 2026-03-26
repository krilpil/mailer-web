# Progress

## Status
- Базовая документация и Memory Bank заполнены; добавлен эндпоинт обновления DNS записей; сформирован SQL для таблицы доменов аккаунта и уточнён тип `accounts.id`; добавлено сохранение домена и фильтрация списка по `account_domain`; включена проверка JWT для API; подготовлен SQL для `account_mailbox` с уникальным `username` и жёсткой привязкой домена; требуется UNIQUE/PK на `(account_id, domain)` в `account_domain`; добавлена запись mailbox при создании домена; добавлены приватные страницы `/mailboxes` и `/mailing/new`; добавлены серверный/клиентский эндпоинты списка mailbox и таблица на странице; добавлен эндпоинт удаления mailbox с проверкой доступа; добавлен OTP-флоу создания mailbox; `deleteDomain` терпимо обрабатывает отсутствие mailbox; добавлены модульные заметки для доменов и mailbox; базовый перенос `MailerEditor` завершён без store и без кастомных NodeView; добавлены `EditorFloatingMenu`, `EditorPositionMenu`, `EditorBubbleMenu` с логикой из `frontend_employee`, адаптированной под базовые extension’ы; `AddRecipientMailer` получил рабочий UI управления списком email-получателей; устранены предупреждения AntD/Tiptap и ранний доступ к `editor.view`; `title/content` редактора вынесены на уровень `MailingPage`; добавлен базовый `EmailTemplate` на `@react-email/components` с типизированными пропсами и дефолтами; реализован рендер TipTap `JSONContent` в `EmailTemplate` и подключена передача `content` из `MailingPage` в рендер письма.

## Completed
- В `EmailTemplate` реализован рендер `content: JSONContent` в `react-email` блоки (heading, paragraph, list, image, hr, code, text marks/link).
- В `MailingPage` передача `content` в `<EmailTemplate />` добавлена в сценарии генерации HTML (`@react-email/render`).
- Добавлен `src/entities/mailer/ui/EmailTemplate/EmailTemplate.tsx` как базовый шаблон письма на `@react-email/components`.
- В `EmailTemplate` добавлены настраиваемые пропсы (`previewText`, `title`, `message`, `buttonLabel`, `buttonHref`, `footerText`) и дефолтный UI-каркас письма.
- `MailerEditor` переведен на управляемые пропсы `title/content/onUpdateTitle/onUpdateContent`.
- В `MailingPage` добавлены локальные `useState` для `title` и `content` и проброс в `MailerEditor`.
- Для dropdown-меню редактора заменен deprecated `overlayClassName` на `classNames.root`.
- В `MailerEditor` установлен `immediatelyRender: false` для SSR-safe гидрации.
- В `EditorPositionMenu`/`editorPositionMenu` добавлены безопасные проверки перед использованием `editor.view`.
- В `AddRecipientMailer` добавлен ввод email + кнопка добавления + список получателей с удалением.
- `MailerEditor` доведен до базовой рабочей версии с локальными `useState` для `title` и `content`.
- Добавлены `EditorFloatingMenu`, `EditorPositionMenu`, `EditorBubbleMenu` и их утилиты/типы в `entities/mailer`.
- `MailerEditor` переключен с временной toolbar на меню-слой из `frontend_employee`.
- `editorConfig` для mailer-редактора упрощен до базовых TipTap extension’ов (`StarterKit`, `Link`, `Underline`, `Image`, `Placeholder`).
- Реализован `POST /api/domains/fresh_dns_records` (сервер/клиент).
- Добавлены описания в `docs/API.md` и `local/README.md`.
- Созданы карты публичных страниц и компонентов в `.memory_bank/ui_extension`.
- Добавлены карта репозитория и границы подсистем в Memory Bank.
- Сформирован SQL для таблицы доменов, привязанных к аккаунту.
- Подготовлен SQL для таблицы `account_mailbox` (привязка почтовых ящиков к аккаунту) с уникальным `username` и FK на `account_domain`.
- Зафиксировано требование UNIQUE/PK на `(account_id, domain)` в `account_domain` для FK из `account_mailbox`.
- В `createDomain` добавлена запись в `account_mailbox` после успешного создания mailbox.
- Добавлена страница `Новая рассылка` (`/mailing/new`) и пункт навигации.
- Добавлена страница `Почтовые ящики` (`/mailboxes`) и пункт навигации.
- Добавлены `GET /api/mailbox/all` (сервер/клиент) и таблица почтовых ящиков в UI.
- Добавлены `POST /api/mailbox/delete` (сервер/клиент) и кнопка удаления в таблице почтовых ящиков.
- Добавлены `POST /api/mailbox/create/otp` и `POST /api/mailbox/create` (сервер/клиент) и модальный флоу создания mailbox.
- В `deleteDomain` кейс домена без mailbox больше не приводит к ошибке.
- Добавлены модульные заметки: `.memory_bank/modules/domains.md` и `.memory_bank/modules/mailboxes.md`.
- Подтвержден тип `accounts.id` = `uuid` для внешнего ключа.
- В `createDomain` после успеха BillionMail сохранение домена в `account_domain`.
- В `listDomains` добавлена фильтрация доменов по таблице `account_domain`.
- В `proxy` добавлена проверка JWT для `/api/*`, кроме `/api/auth` и `/api/sign-up`.

## In Progress
- Подготовка коммита и фиксация `last_checked_commit`.

## Next
- Исправить `yarn lint` (опция `--fix` не поддерживается).
- Уточнить CI/CD и инфраструктуру, если они находятся вне репозитория.

## Known Issues
- `yarn lint` падает: `next lint` не принимает `--fix` в текущей версии.

## Changelog
- Добавлена обработка TipTap `JSONContent` в `EmailTemplate` с конвертацией узлов редактора в структуру письма на `react-email`.
- Добавлена передача `content` в `EmailTemplate` при отправке письма из `MailingPage`.
- Добавлен базовый шаблон `EmailTemplate` для mailer-сущности на `react-email` компонентах.
- Состояние редактора (`title`, `content`) поднято из `MailerEditor` в `MailingPage` с управлением через пропсы/callback.
- Исправлены предупреждение AntD (`overlayClassName`) и ошибки TipTap, связанные с SSR и ранним доступом к `editor.view`.
- Добавлен рабочий `AddRecipientMailer` со списком email-получателей, добавлением и удалением адресов.
- Завершен базовый перенос ядра `MailerEditor` с локальным состоянием и базовым набором форматирования.
- Реализованы `EditorFloatingMenu`, `EditorPositionMenu`, `EditorBubbleMenu` (адаптация из `frontend_employee` без кастомных NodeView/store).
- Добавлены эндпоинты обновления DNS‑записей (сервер/клиент) и базовая документация проекта (Memory Bank, UI‑страницы/компоненты, local/README, карта подсистем).
- Добавлен SQL‑черновик схемы таблицы доменов аккаунта.
- Добавлен SQL‑черновик схемы таблицы `account_mailbox`.
- Уточнен тип внешнего ключа `account_id` (UUID).
- Добавлена запись домена в `account_domain` при создании.
- Добавлена фильтрация списка доменов по `account_domain`.
- Добавлена приватная страница `/mailing/new` и обновлена навигация.
- Добавлена приватная страница `/mailboxes` и обновлена навигация.
- Добавлены серверный и клиентский эндпоинты для списка почтовых ящиков и таблица на `/mailboxes`.
- Добавлены серверный и клиентский эндпоинты удаления mailbox и кнопка удаления в UI.
- Добавлены OTP-эндпоинты и UI-флоу для создания mailbox.
- Исправлена обработка удаления домена без почтовых ящиков.
- Добавлена проверка JWT для `/api/*`, кроме `/api/auth` и `/api/sign-up`.
- Добавлены модульные заметки для доменов и mailbox в `.memory_bank/modules/`.

## Контроль изменений
- last_checked_commit: 915533372926d80dd5735fe1e0700b0bd5ee0364
- last_checked_date: 2026-03-26

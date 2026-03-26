# Active Context

## Current Focus
- Рендер TipTap `JSONContent` из `MailerEditor` в email-шаблон `EmailTemplate` через `react-email` компоненты.
- Добавление базового `EmailTemplate` на `@react-email/components` для сущности mailer.
- Завершение базового переноса `MailerEditor` с локальным `useState` и базовым набором TipTap-команд.
- Почтовые ящики: список, создание с OTP и удаление с проверкой доступа.
- Применение SQL‑таблиц/ограничений для `account_domain` и `account_mailbox`.
- Актуализация Memory Bank и документации API/маршрутов.

## Recent Changes
- В `EmailTemplate` добавлен рекурсивный рендер TipTap `JSONContent` (параграфы, заголовки, списки, изображения, ссылки, inline marks, разделители, code block) в структуру `react-email`.
- В `MailingPage` в `EmailTemplate` начал передаваться `content` из `MailerEditor` при генерации HTML для отправки.
- В `src/entities/mailer/ui/EmailTemplate/EmailTemplate.tsx` добавлен базовый email-шаблон на `react-email` компонентах (`Html`, `Body`, `Container`, `Heading`, `Text`, `Button`, `Hr`).
- Для `EmailTemplate` добавлены типизированные пропсы с дефолтами: `previewText`, `title`, `message`, `buttonLabel`, `buttonHref`, `footerText`.
- Состояния `title` и `content` для редактора рассылки подняты в `MailingPage`.
- `MailerEditor` переведен в управляемый компонент через пропсы `title`, `content`, `onUpdateTitle`, `onUpdateContent`.
- Убрано предупреждение AntD: в dropdown-меню редактора `overlayClassName` заменен на `classNames.root`.
- Для `MailerEditor` включен SSR-safe режим TipTap: `immediatelyRender: false`.
- В позиционном меню редактора убран ранний доступ к `editor.view.dom`; добавлены безопасные проверки доступности `view`.
- В `AddRecipientMailer` добавлены локальный список получателей, поле ввода email, кнопка добавления и удаление адресов из списка.
- `MailerEditor` переведен на локальные `title` + `content` (`JSONContent`) без store.
- В `MailerEditor` подключены `EditorFloatingMenu`, `EditorPositionMenu`, `EditorBubbleMenu` по логике `frontend_employee`.
- Добавлены `src/entities/mailer/lib/getFloatingMenu.tsx` и `src/entities/mailer/lib/editorPositionMenu.ts`.
- Добавлены UI-компоненты меню редактора в `src/entities/mailer/ui/*` и типы в `src/entities/mailer/model/*`.
- `editorConfig` упрощен до базовых extension’ов: `StarterKit`, `Link`, `Underline`, `Image`, `Placeholder`.
- Меню адаптированы под базовые TipTap-команды без кастомных NodeView.
- Добавлена приватная страница `/mailing/new` (экран, маршрут и пункт навигации).
- В `deleteDomain` обработан кейс домена без почтовых ящиков как нормальный (без ошибки).
- Добавлен OTP-флоу создания mailbox и серверные эндпоинты `/api/mailbox/create/otp` и `/api/mailbox/create`.
- На странице `/mailboxes` добавлен модальный флоу `CreateMailbox`.
- Добавлен `POST /api/mailbox/delete` с проверкой доступа и кнопкой удаления в таблице `/mailboxes`.
- Добавлены серверный и клиентский эндпоинты `GET /api/mailbox/all` с фильтрацией по доменам аккаунта.
- На странице `/mailboxes` добавлена таблица почтовых ящиков.
- Добавлена приватная страница `/mailboxes` (экран, маршрут и пункт в боковом меню).
- Подготовлен SQL для таблицы `account_mailbox` (привязка почтовых ящиков к аккаунту).
- Уточнены требования к `account_mailbox`: `username` уникален; домен жёстко привязан к `account_domain`.
- Для FK на `(account_id, domain)` требуется UNIQUE/PK в `account_domain`.
- В `createDomain` добавлено сохранение почтового ящика в `account_mailbox` после успешного создания.
- Добавлен `POST /api/domains/fresh_dns_records` (сервер/клиент) и документация API.
- Сформирована карта проекта в Memory Bank и UI‑карты публичных страниц/компонентов.
- Создан `local/README.md` с обзором подсистем.
- Сформирован SQL для таблицы доменов, связанных с аккаунтом.
- Уточнено, что `accounts.id` имеет тип `uuid` (для внешнего ключа).
- В `createDomain` добавлено сохранение домена в `account_domain` после успеха BillionMail.
- В `listDomains` добавлена фильтрация доменов по таблице `account_domain`.
- В `proxy` добавлена проверка JWT для `/api/*` (кроме `/api/auth`, `/api/sign-up`).

## Next Steps
- Подключить `EmailTemplate` в целевой сценарий отправки/рендера писем (вместо заглушек/сырого HTML там, где это потребуется).
- Подключить сохранение `title` и `content` из `MailerEditor` в целевой сценарий отправки рассылки.
- Применить SQL‑схему `account_domain`/`account_mailbox` и UNIQUE/PK на `(account_id, domain)`.
- Зафиксировать изменения коммитом и обновить `last_checked_commit` (если появится `.git`).
- Исправить скрипт `yarn lint` (неподдерживаемый `--fix`) или обновить инструкции.
- Уточнить CI/CD и инфраструктуру, если находятся вне репозитория.
- Согласовать имя таблицы аккаунтов (если отличается от `accounts`).

## Open Questions
- Где расположен `.git` для этого проекта?
- Нужны ли дополнительные публичные страницы кроме `/sign-in` и `/sign-up`?
- Какой ожидаемый режим обновления DNS записей (частота/триггеры)?
- Как называется таблица аккаунтов (если не `accounts`)?

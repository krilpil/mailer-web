# Mailfinch — Архитектурный обзор

## Обзор подсистем

- Клиентское приложение (Next.js App Router): `src/app/`.
- Серверные API (route handlers): `src/app/api/`.
- UI-слои по FSD: `src/screens/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/`.
- Аутентификация и прокси: `src/auth.ts`, `src/proxy.ts`.
- Данные и БД: `database/`, `src/database/`.
- Публичные ассеты: `public/`.
- Документация и память: `docs/`, `.memory_bank/`.

## Маршруты и страницы верхнего уровня

- Приватные: `src/app/(private)/page.tsx`, `src/app/(private)/analytics/page.tsx`, `src/app/(private)/mailings/page.tsx`, `src/app/(private)/mailing/page.tsx`, `src/app/(private)/templates/page.tsx`, `src/app/(private)/contacts/page.tsx`, `src/app/(private)/mailboxes/page.tsx`, `src/app/(private)/settings/page.tsx`.
- Публичные: `src/app/(public)/sign-in/page.tsx`, `src/app/(public)/sign-up/page.tsx`.

## Ключевые модули

- `src/app/` — точки входа App Router и группировка маршрутов.
- `src/app/api/` — серверные API эндпоинты.
  - Включает route groups: `(analytics)`, `(auth)`, `(contacts)`, `(domains)`, `(mailing)`, `(mailboxes)`.
  - В `(mailing)` доступны endpoint'ы рассылки и шаблонов: `POST /api/mailing/sendMail`, `POST /api/batch_mail/task/create`, `GET /api/batch_mail/task/list`, `GET /api/batch_mail/task/analytics`, `POST /api/email_template/create`, `GET /api/email_template/list`, `POST /api/email_template/delete`.
  - В `(analytics)` доступны endpoint'ы сводной аналитики аккаунта: `GET /api/analytics/domains`, `GET /api/analytics/mailboxes`.
  - `POST /api/batch_mail/task/create` создаёт задачу напрямую по `template_id` уже существующего шаблона BillionMail.
  - `GET /api/batch_mail/task/list` возвращает только задачи, доступные текущему пользователю (по ownership в `account_template`, `account_recipient`, `account_mailbox`, `account_domain`).
  - `GET /api/batch_mail/task/analytics` агрегирует аналитику задачи из BillionMail: графики (`/batch_mail/task/stat_chart`), статистику провайдеров (`/batch_mail/tracking/mail_provider`) и логи (`/batch_mail/tracking/logs`).
  - `GET /api/analytics/domains` и `GET /api/analytics/mailboxes` возвращают агрегаты только по данным текущего пользователя (`account_id` из сессии + фильтрация по `account_domain`/`account_mailbox`).
  - `POST /api/email_template/create` создаёт шаблон в BillionMail (из `content` редактора или из raw `html_content`) и сохраняет связь пользователя с шаблоном в `account_template`.
  - `GET /api/email_template/list` и `POST /api/email_template/delete` работают только с шаблонами текущего пользователя (по `account_template`).
- `src/screens/` — страницы (слой экранов).
- `src/widgets/` — составные UI-блоки.
- `src/features/` — функциональные модули.
- `src/entities/` — доменные сущности и их UI/API.
  - В том числе `src/entities/contact` для клиентских API групп контактов.
- `src/shared/` — общие утилиты, типы, API-клиент.
- `src/auth.ts` — конфигурация аутентификации.
- `src/proxy.ts` — проксирование запросов.
- `database/` и `src/database/` — конфигурация/доступ к данным.
- `public/` — статические файлы.

## Связи между модулями

- UI-слои следуют FSD: `screens` → `widgets` → `features` → `entities` → `shared`.
- Клиентский код использует API через `src/shared/api`.
- Серверные API находятся в `src/app/api` и обслуживают клиент.
- Аутентификация/прокси подключаются на уровне приложения (`src/auth.ts`, `src/proxy.ts`).

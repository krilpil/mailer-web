# Mailfinch Core — Архитектурный обзор

## Обзор подсистем
- Клиентское приложение (Next.js App Router): `src/app/`.
- Серверные API (route handlers): `src/app/api/`.
- UI-слои по FSD: `src/screens/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/`.
- Аутентификация и прокси: `src/auth.ts`, `src/proxy.ts`.
- Данные и БД: `database/`, `src/database/`.
- Публичные ассеты: `public/`.
- Документация и память: `docs/`, `.memory_bank/`.

## Маршруты и страницы верхнего уровня
- Приватные: `src/app/(private)/page.tsx`, `src/app/(private)/mailing/page.tsx`, `src/app/(private)/contacts/page.tsx`, `src/app/(private)/mailboxes/page.tsx`, `src/app/(private)/settings/page.tsx`.
- Публичные: `src/app/(public)/sign-in/page.tsx`, `src/app/(public)/sign-up/page.tsx`.

## Ключевые модули
- `src/app/` — точки входа App Router и группировка маршрутов.
- `src/app/api/` — серверные API эндпоинты.
  - Включает route groups: `(auth)`, `(contacts)`, `(domains)`, `(mailing)`, `(mailboxes)`.
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

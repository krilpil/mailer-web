# Analytics Module

## Scope

- Приватная страница `/analytics` с аналитикой по доменам и почтовым ящикам отправителей.
- Серверные account-scoped endpoint'ы для агрегирования метрик из BillionMail.
- Клиентские API-хуки и UI-таблицы/сводки по доменам и mailbox отправителей.

## Server API

- `GET /api/analytics/domains`:
  - принимает `start_time`, `end_time`, `domains`, `account_id?`;
  - проверяет текущую сессию и запрещает доступ к чужому `account_id`;
  - фильтрует данные только по текущему аккаунту через `account_domain` и `account_mailbox`;
  - агрегирует задачи, ошибки, DNS/SSL/blacklist/quota метрики и top/timeline аналитику.
- `GET /api/analytics/mailboxes`:
  - принимает `start_time`, `end_time`, `mailboxes`, `account_id?`;
  - использует тот же account-scoped доступ;
  - возвращает агрегаты по отправителям (mailbox), включая delivery/failure/quota/DNS и timeline.

## Data Sources

- Локальная БД: `account_domain`, `account_mailbox` для контроля доступа и ownership.
- BillionMail API:
  - `/batch_mail/task/list` (все страницы задач);
  - `/overview` и `/overview/failed` (по доменам и периоду);
  - `/domains/all` (DNS/SSL/quota/blacklist);
  - `/mailbox/all` (состояние mailbox по доменам).

## Client API

- `useGetDomainsAnalytics` → `GET /api/analytics/domains`.
- `useGetMailboxesAnalytics` → `GET /api/analytics/mailboxes`.
- Оба хука поддерживают период и фильтры списка (`domains`/`mailboxes`).

## UI

- `AnalyticsPage` + `SettingAnalytics`:
  - выбор периода (`RangePicker`), ручной refresh;
  - вкладки `По доменам` и `По отправителям`;
  - summary KPI-карточки;
  - top-таблицы и детальные таблицы;
  - timeline таблицы;
  - loader-состояния в `Card` и `Table` для первичной загрузки;
  - warnings при частично недоступных источниках.
- `ViewMailingTaskAnalytics`:
  - для первичной загрузки dashboard/графиков включен `Card loading`.

## Implementation Notes

- В `SettingAnalytics` диапазон дат хранится как Unix-метки (`[start_time, end_time]`), а не как `[Dayjs, Dayjs]`.
- Причина: в strict TypeScript возможен конфликт типов `Dayjs` между `antd/rc-picker` и локально расширенным `dayjs` (plugins `isToday/isYesterday/timezone`), который ломает `yarn build:prod`.
- Для `RangePicker` используется вычисляемый `rangePickerValue` из Unix-state; payload API формируется напрямую из Unix-значений.

## Access Rules

- Аналитика строится строго для текущего пользователя:
  - `account_id` берётся из NextAuth session;
  - запрос с чужим `account_id` получает `403`;
  - данные по доменам/ящикам ограничены ownership таблицами.

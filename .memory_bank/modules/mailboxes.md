# Mailboxes Module

## Scope
- Приватная страница `/mailboxes`, виджет списка и feature создания/удаления.
- Серверные эндпоинты и клиентские API‑хуки для управления почтовыми ящиками.

## Server API
- `GET /api/mailbox/all`: получает домены аккаунта из `account_domain`, вызывает BillionMail `/api/mailbox/all` для каждого домена, возвращает агрегированный список `{ username, create_time }`.
- `POST /api/mailbox/delete`: принимает `{ username }`, проверяет доступ (по `account_mailbox` или через `account_domain` домена), вызывает BillionMail `/api/mailbox/delete`, затем best‑effort удаляет запись из `account_mailbox`.
- `POST /api/mailbox/create/otp`: принимает `{ domain, local_part }`, проверяет доступ к домену, создаёт OTP и отправляет его на `local_part@domain`.
- `POST /api/mailbox/create`: принимает `{ domain, local_part, otp, otp_guid }`, проверяет OTP, создаёт mailbox через BillionMail `/api/mailbox/create` (пароль/active/isAdmin на сервере), сохраняет `account_mailbox`.

## Client API
- `useGetMailboxesList` → `GET /api/mailbox/all`.
- `useDeleteMailbox` → `POST /api/mailbox/delete` (refetch списка).
- `useSendOTPCreateMailbox` → `POST /api/mailbox/create/otp`.
- `useSubmitOTPCreateMailbox` → `POST /api/mailbox/create` (refetch списка).

## UI
- `MailboxesPage`: заголовок, `CreateMailbox`, `SettingMailboxes`.
- `SettingMailboxes`: таблица с `username` и `create_time`, кнопка «Удалить».
- `CreateMailbox`: модальный флоу из 2 стадий.
  - Stage 1: выбор домена и ввод `local_part`.
  - Stage 2: ввод OTP (повторная отправка), используется `CreateDomainCode`.

## Data & Access
- Таблица `account_mailbox`: `account_id`, `username`, `domain`, `local_part`, `created_at`.
- `username` должен быть уникальным; домен жёстко связан с `account_domain` по `(account_id, domain)`.
- `account_domain` должен иметь UNIQUE/PK на `(account_id, domain)` для FK.

## Notes
- OTP хранится в таблице `otp`, проверка/consumption через `verifyMailboxOtp`.
- Отправка OTP использует шаблон `CreateDomainOtpEmail`.

## Build Notes (2026-04-01)
- Клиентский response-validator `deleteMailbox` приведён к контракту `IDeleteMailboxResponse`: добавлено optional-поле `error`.

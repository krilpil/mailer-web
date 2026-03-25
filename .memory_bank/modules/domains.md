# Domains Module

## Scope
- Управление доменами (создание, список, удаление, DNS‑обновление).
- Привязка доменов к аккаунту через `account_domain`.

## Server API
- `POST /api/domains/create/otp`: отправляет OTP на `${local_part}@${domain}`.
- `POST /api/domains/create`: проверяет OTP, создаёт домен через BillionMail, сохраняет `account_domain`,
  удаляет существующие mailbox домена и создаёт новый, пишет его в `account_mailbox`.
- `GET /api/domains/list`: получает список доменов из BillionMail и фильтрует по `account_domain`.
- `POST /api/domains/delete`: получает mailbox домена, удаляет (если есть), затем удаляет домен;
  отсутствие mailbox считается нормальным кейсом.
- `POST /api/domains/fresh_dns_records`: обновляет DNS‑записи домена.

## Client API
- `useGetDomainsList`, `useDeleteDomain`, `useFreshDNSRecords`,
  `useSendOTPCreateDomain`, `useSubmitOTPCreateDomain`.

## UI
- `SettingsPage` → `SettingDomains` (таблица доменов, DNS‑модалка, удаление).
- `CreateDomain` модальный флоу: домен → local_part → OTP.

## Data & Access
- Таблица `account_domain` хранит доступные домены аккаунта.
- `accounts.id` — `uuid`.
- `account_mailbox` используется для хранения созданного mailbox при создании домена.

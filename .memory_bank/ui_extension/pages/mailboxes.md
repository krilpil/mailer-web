# /mailboxes

## Назначение
- Приватная страница управления почтовыми ящиками.

## Компоненты/виджеты
- `MailboxesPage` (screen): `src/screens/MailboxesPage/ui/MailboxesPage.tsx`.
- `SettingMailboxes` (widget): `src/widgets/SettingMailboxes/ui/SettingMailboxes.tsx`.
- `CreateMailbox` (feature): `src/features/CreateMailbox/ui/CreateMailbox.tsx`.

## Входы/выходы данных
- Загружает список почтовых ящиков через `GET /api/mailbox/all`.
- Выводит таблицу с адресом (`username`) и временем создания (`create_time`).
- Действие: удаление почтового ящика через `POST /api/mailbox/delete`.
- Создание ящика: `POST /api/mailbox/create/otp` → ввод OTP → `POST /api/mailbox/create`.

## Где искать реализацию
- Страница маршрута: `src/app/(private)/mailboxes/page.tsx`.
- Экран: `src/screens/MailboxesPage/`.

# /mailing/new

## Назначение
- Приватная страница создания новой рассылки.

## Компоненты/виджеты
- `NewMailingPage` (screen): `src/screens/NewMailingPage/ui/NewMailingPage.tsx`.
- `MailerEditor` (widget): `src/widgets/MailerEditor/ui/MailerEditor.tsx`.

## Входы/выходы данных
- Отправка письма через `POST /api/mailing/sendMail`.
- Поля формы: `recipient`, `message`.

## Где искать реализацию
- Страница маршрута: `src/app/(private)/mailing/new/page.tsx`.
- Экран: `src/screens/NewMailingPage/`.

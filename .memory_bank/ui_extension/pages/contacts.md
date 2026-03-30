# /contacts

## Назначение
- Приватная страница управления контактными группами и просмотра пользователей в выбранной группе.

## Компоненты/виджеты
- `ContactsPage` (screen): `src/screens/ContactsPage/ui/ContactsPage.tsx`.
- `SettingContacts` (widget): `src/widgets/SettingContacts/ui/SettingContacts.tsx`.
- `CreateContactGroup` (feature): `src/features/CreateContactGroup/ui/CreateContactGroup.tsx`.

## Входы/выходы данных
- Загружает список групп через `GET /api/contact/group/list` (включая `recipients_count` по каждой группе).
- Для выбранной группы загружает пользователей через `GET /api/contact/group/contacts?group_id=...`.
- Создаёт новую группу с пользователями через `POST /api/contact/group/create` + `POST /api/contact/group/import` (ввод вручную и/или импорт из файла `csv/txt/xls/xlsx` до 20 Мб).
- Удаляет выбранную группу через `POST /api/contact/group/delete` (вместе с пользователями группы).
- В модальном окне группы позволяет добавить новых пользователей в эту группу через `POST /api/contact/group/import` (вручную и/или импорт из файла `csv/txt/xls/xlsx` до 20 Мб).
- В модальном окне группы позволяет удалить пользователя из выбранной группы через `POST /api/contact/group/recipient/remove`.
- Выводит:
  - таблицу групп (`group_id`, `name`, количество пользователей в группе);
  - модальное окно с таблицей пользователей группы (`email`, `active`, `status`, `create_time`).

## Где искать реализацию
- Страница маршрута: `src/app/(private)/contacts/page.tsx`.
- Экран: `src/screens/ContactsPage/`.

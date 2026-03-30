# Contact Groups Module

## Scope
- Серверные endpoint для групп контактов и импорта получателей.
- Клиентские API-хуки для списка/создания/удаления групп, добавления и удаления получателей.

## Server API
- `POST /api/contact/group/create`: принимает `{ name, description?, double_optin? }`, генерирует `group_id` из `account_id + name + guid`, проверяет коллизию в `account_recipient`, создаёт группу в BillionMail (`/api/contact/group/create`), сохраняет связь в `account_recipient`.
- `POST /api/contact/group/delete`: принимает `{ group_id }`, проверяет доступ через `account_recipient`, удаляет всех пользователей группы через BillionMail (`/api/contact/delete_ndp`), удаляет группу в BillionMail (`/api/contact/group/delete`), проверяет факт удаления через `/api/contact/group/info`, и только после этого удаляет локальную запись.
- `GET /api/contact/group/list`: возвращает список групп аккаунта из `account_recipient` в формате `{ group_id, name, recipients_count }`, где `recipients_count` берется из BillionMail `/api/contact/group/list`.
- `POST /api/contact/group/import`: принимает `{ group_ids, recipients?, file_data?, file_type?, default_active?, status?, overwrite? }`, валидирует доступ ко всем группам через `account_recipient`, отправляет импорт в BillionMail (`/api/contact/group/import`) в режимах paste/file.
- `GET /api/contact/group/contacts`: принимает `group_id` в query, проверяет доступ через `account_recipient`, выгружает всех пользователей группы из BillionMail (`/api/contact/list_ndp`, `active=-1`) с пагинацией.
- `POST /api/contact/group/recipient/remove`: принимает `{ group_id, email, active }`, проверяет доступ к группе и удаляет пользователя из выбранной группы (через `/api/contact/update_group` для пересборки групп или `/api/contact/delete`, если группа была последней).

## Client API
- `useGetContactGroupsList` → `GET /api/contact/group/list`.
- `useGetContactGroupContacts` → `GET /api/contact/group/contacts`.
- `useCreateContactGroup` → `POST /api/contact/group/create` (refetch списка).
- `useDeleteContactGroup` → `POST /api/contact/group/delete` (refetch списка).
- `useImportContactGroupRecipients` → `POST /api/contact/group/import` (refetch списка).
- `useRemoveContactFromGroup` → `POST /api/contact/group/recipient/remove` (refetch списка групп и пользователей выбранной группы).

## UI
- Приватная страница `/contacts` показывает:
  - feature `CreateContactGroup` (кнопка + модалка создания группы с вводом пользователей вручную или импортом из файла `csv/txt/xls/xlsx` до 20 Мб; распознанные email из файла показываются в списке пользователей);
  - таблицу групп с действиями `Пользователи` и `Удалить`;
  - модальное окно пользователей выбранной группы с добавлением новых пользователей (вручную или из файла `csv/txt/xls/xlsx` до 20 Мб) и удалением пользователя из выбранной группы.

## Data & Access
- Таблица `account_recipient` хранит привязку групп к аккаунту.
- Доступ к операциям `delete/import/list` ограничен группами текущего `account_id`.

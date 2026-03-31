# Mailing Module

## Scope

- Экран `src/screens/MailingPage` (`/mailing`) для создания пользовательских email-шаблонов.
- Экран `src/screens/TemplatesPage` (`/templates`) для списка и удаления пользовательских шаблонов.
- Экран `src/screens/MailingsPage` (`/mailings`) для списка batch-задач рассылки.
- Редактор контента `MailerEditor` и рендер шаблона через `EmailTemplate`.
- Серверные endpoint:
  - `POST /api/email_template/create` (создание пользовательского шаблона).
  - `GET /api/email_template/list`, `POST /api/email_template/delete` (список/удаление пользовательских шаблонов).
  - `POST /api/batch_mail/task/create`, `GET /api/batch_mail/task/list`, `GET /api/batch_mail/task/analytics` (batch-задачи и аналитика).

## MailingPage State

- `title: string` (имя шаблона).
- `content: JSONContent` (контент редактора).
- `saveResult: { type, message } | null`.

## MailingPage UX

- На странице оставлены только `MailerEditor` и кнопка `Сохранить шаблон`.
- Блоки выбора получателей/отправителя и кнопка отправки рассылки удалены.
- Пункт меню переименован: `Новый шаблон` (`/mailing`).

## Templates List UX

- На странице `/templates` отображается таблица шаблонов текущего пользователя.
- Для каждой строки доступно удаление шаблона.
- Пункт меню: `Список шаблонов`.

## Create Task From Mailings

- На странице `/mailings` добавлена feature `CreateMailingTask` (кнопка `Новая рассылка` + модальное окно).
- В модальном окне пользователь выбирает:
  - почтовый ящик отправителя;
  - одну или несколько групп получателей;
  - сохранённый шаблон из `account_template`.
- При запуске создаются batch-задачи (по одной на группу) через `POST /api/batch_mail/task/create` с параметром `warmup=1`.
- `POST /api/batch_mail/task/create` принимает готовый `template_id` и не создаёт/не удаляет временный template.

## Mailings Table

- Таблица задач на `/mailings` выводит расчетное время выполнения из поля `estimated_time_with_warmup`.
- Значение форматируется в человекочитаемый вид (`д/ч/м/с`), пустые/некорректные значения отображаются как `—`.
- В каждой строке есть кнопка `Аналитика`, открывающая feature-модалку полной аналитики текущей задачи.
- Аналитика агрегируется из BillionMail endpoint: `/batch_mail/task/stat_chart`, `/batch_mail/tracking/mail_provider`, `/batch_mail/tracking/logs`.
- В модалке аналитики реализованы визуальные графики (динамика отправок, ошибок, открытий, кликов) и диаграмма статистики по почтовым провайдерам.
- UI-блок логов отправки удалён; в аналитике оставлены сводка, провайдеры и графики.

## Email Template Create Flow

- Клиент: `useCreateUserTemplate` (`src/entities/mailer/api/createUserTemplate`).
- Сервер: `src/app/api/(mailing)/_handlers/createUserTemplate.ts`.
- Шаги:
  - валидация payload `{ template_name, content }`;
  - проверка авторизации (`auth`);
  - рендер `content` в HTML через `EmailTemplate` + `@react-email/render`;
  - создание шаблона в BillionMail (`/api/email_template/create`);
  - сохранение связи в PostgreSQL `account_template (account_id, template_id, template_name)` и JSON редактора в `account_template.template`;
  - при ошибке сохранения в БД выполняется best-effort rollback через `/api/email_template/delete`.

## Template List/Delete Flow

- `GET /api/email_template/list`:
  - читает шаблоны только текущего пользователя из `account_template`;
  - возвращает `{ template_id, template_name, template, create_time, update_time }`.
- `POST /api/email_template/delete`:
  - проверяет ownership шаблона в `account_template`;
  - удаляет шаблон в BillionMail (`/api/email_template/delete`);
  - удаляет локальную запись в `account_template`.

## Data & Access

- Таблица `account_template` хранит принадлежность шаблона аккаунту.
- Доступ к созданию шаблона разрешён только авторизованному пользователю.
- Сохранённый `template_id` можно использовать в будущем для выдачи списка шаблонов только текущего пользователя.

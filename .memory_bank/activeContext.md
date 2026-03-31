# Active Context

## Current Focus

- Страница `/mailing`: создание пользовательских шаблонов через `MailerEditor` и `useCreateUserTemplate`.
- Страница `/templates`: список и удаление пользовательских шаблонов через таблицу.
- Страница `/mailings`: запуск новой рассылки из модального окна (выбор отправителя, групп и шаблона).
- Страница `/mailings`: список задач рассылки из `GET /api/batch_mail/task/list` (фильтры + пагинация).
- Страница `/mailings`: feature аналитики задачи (кнопка в таблице + модальное окно с полной аналитикой).
- Batch mailing tasks: серверные endpoint `POST /api/batch_mail/task/create` и `GET /api/batch_mail/task/list`, плюс клиентские хуки для create/list.
- Страница `/contacts`: таблица групп контактов и модальное окно просмотра пользователей выбранной группы.
- Удаление пользователя из выбранной группы контактов из модального окна `/contacts`.
- Контактные группы: серверные и клиентские endpoint для create/delete/list/import с доступом через `account_recipient`.
- Нормализация ссылок в `EditorBubbleMenu`: автодобавление `https://` для URL без протокола.
- Рендер TipTap `JSONContent` из `MailerEditor` в email-шаблон `EmailTemplate` через `react-email` компоненты.
- Добавление базового `EmailTemplate` на `@react-email/components` для сущности mailer.
- Завершение базового переноса `MailerEditor` с локальным `useState` и базовым набором TipTap-команд.
- Почтовые ящики: список, создание с OTP и удаление с проверкой доступа.
- Применение SQL‑таблиц/ограничений для `account_domain` и `account_mailbox`.
- Актуализация Memory Bank и документации API/маршрутов.

## Recent Changes

- На странице `/mailings` в таблицу задач добавлена колонка `Расчетное время` из `estimated_time_with_warmup` с форматированием длительности.
- На странице `/mailings` добавлена кнопка `Аналитика` в строке задачи и feature-модалка с полной аналитикой текущей task.
- Добавлен endpoint `GET /api/batch_mail/task/analytics`: агрегирует BillionMail `task/stat_chart`, `tracking/mail_provider`, `tracking/logs`.
- Добавлен клиентский hook `useGetBatchMailTaskAnalytics` и нормализация ответа аналитики.
- В feature аналитики задачи реализована визуализация графиков (динамика отправок/ошибок/открытий/кликов) и диаграмма по провайдерам; raw JSON-блок убран.
- В feature аналитики улучшен парсинг `mail_provider` для вложенных форматов ответа BillionMail; блок `Логи отправки` удалён из UI по требованию.
- На странице `/mailings` удалены фильтр `status` и колонка `Статус`: список теперь всегда запрашивается без `status` (по всем статусам), поиск остаётся по `keyword`.
- Добавлена новая приватная страница `/templates` (`Список шаблонов`) с таблицей шаблонов текущего пользователя и удалением.
- Добавлены endpoint'ы шаблонов: `GET /api/email_template/list` и `POST /api/email_template/delete` (ownership через `account_template`).
- В `SettingMailings` добавлена feature `Новая рассылка`: модальное окно создания task с `warmup=1` и выбором mailbox/groups/template.
- На `/mailing` UI переименован в `Новый шаблон`: удалены controls получателей/отправителя и отправки рассылки, оставлено создание шаблона (`title + content`).
- Добавлен endpoint `POST /api/email_template/create`: создание шаблона в BillionMail и сохранение связи `(account_id, template_id, template_name)` в `account_template`.
- В `POST /api/email_template/create` сохранение в `account_template` расширено полем `template`: туда пишется JSONContent редактора в виде строки JSON.
- Для `POST /api/batch_mail/task/create` включён прямой режим: задача создаётся по переданному `template_id` без временных шаблонов.
- Создание task на `/mailings` использует выбранный сохранённый `template_id` без передачи `content`.
- Исправлен сценарий ошибки на `/mailings`: клиентский `getBatchMailTasksList` переведен на безопасную нормализацию ответа (без hard-fail на Yup-валидации отдельных полей задач).
- В серверном сервисе `listBatchMailTasks` исключена отправка `status` в провайдер при значении `< 0` (режим «Все статусы»), чтобы не ломать список у инсталляций с иным поведением API.
- В `MailingPage` отправка переключена с `useSendMail` на `useCreateBatchMailTask`: создание задач по выбранным `group_id`, с полями `addresser` и `template_id`.
- На `/mailing` добавлены controls выбора mailbox-отправителя и ввода `template_id` BillionMail.
- Добавлена новая приватная страница `/mailings` (`MailingsPage` + `SettingMailings`) со списком задач из `/api/batch_mail/task/list`, поиском, фильтром статуса и пагинацией.
- В `SideMenu` добавлен пункт `Рассылки`, в `routes` добавлен `MAILINGS_PAGE`.
- Добавлены серверные endpoint `POST /api/batch_mail/task/create` и `GET /api/batch_mail/task/list` в route-group `(mailing)` с Yup-валидацией и проксированием в BillionMail `/batch_mail/task/create` и `/batch_mail/task/list`.
- В `GET /api/batch_mail/task/list` добавлена нормализация ответа провайдера (типизированный `data.list` с task/group/tag полями и безопасными дефолтами).
- Добавлены клиентские API-модули `entities/mailer/api/createBatchMailTask` и `entities/mailer/api/getBatchMailTasksList` с валидацией ответов и экспортом через `entities/mailer/api/index.ts`.
- Обновлены `docs/API.md`, `README.md` и `.memory_bank/modules/mailing.md` под новые batch-mail маршруты и контракты.
- `AddRecipientMailer` переведен на выбор групп пользователя через `antd Select mode="multiple"`; старый UI ручного ввода/удаления email удален.
- В `MailingPage` поднято состояние выбранных групп (`selectedGroupIds`), добавлен вывод выбранных `group_id`, обновлен контракт `AddRecipientMailerProps`.
- В `SettingContacts` добавлен импорт пользователей из файла рядом с ручным добавлением; распознанные email из файла показываются в поле списка пользователей.
- Общая логика импорта (валидация файлов, парсинг/предпросмотр email, подготовка payload) вынесена в `entities/contact/lib/recipientsImport.ts`, общий UI-блок файла — в `entities/contact/ui/RecipientsImportFileInput`.
- В `CreateContactGroup` при загрузке файла email автоматически добавляются в поле ручного списка пользователей (предпросмотр перед импортом).
- В `CreateContactGroup` удалено поле `description`; добавлен импорт пользователей из файла (`csv/txt/xls/xlsx`, до 20 Мб) с передачей в `POST /api/contact/group/import`.
- `GET /api/contact/group/list` теперь возвращает `recipients_count` для каждой группы: сервер обогащает локальные группы данными BillionMail `/api/contact/group/list`.
- В таблицу групп на `/contacts` добавлена колонка с количеством пользователей в каждой группе (в штуках).
- На `/contacts` добавлено удаление пользователя из группы: серверный endpoint `POST /api/contact/group/recipient/remove`, клиентский хук `useRemoveContactFromGroup` и action `Удалить из группы` в таблице пользователей.
- В `SettingContacts` добавлено добавление новых пользователей в выбранную группу (textarea + импорт в `POST /api/contact/group/import` + refresh списка пользователей группы).
- Для `POST /api/contact/group/import` включено подтверждение контактов по умолчанию: импорт отправляется в BillionMail с `status=1` (Confirmed).
- Усилен `POST /api/contact/group/delete`: удаление группы теперь подтверждается повторной проверкой в BillionMail (`/api/contact/group/info`) до удаления локальной записи.
- В таблицу групп на `/contacts` добавлена кнопка удаления с подтверждением; удаление запускает `POST /api/contact/group/delete`.
- `deleteGroup` на сервере расширен: перед удалением группы удаляет всех пользователей этой группы через BillionMail `/api/contact/delete_ndp` (по ID контактов из `/api/contact/list_ndp`).
- Исправлен сценарий `create -> import` для групп контактов: `createGroup` теперь резолвит реальный `group_id` из BillionMail перед сохранением в `account_recipient`; `importContacts` умеет восстановить устаревший `group_id` по имени группы и повторить импорт.
- Добавлена feature `CreateContactGroup` (кнопка + модальное окно) на страницу `/contacts`: создание группы и импорт пользователей одним UX-сценарием.
- `GET /api/contact/group/list` отрефакторен: удалён soft-fail fallback, упрощено формирование списка групп, восстановлен стандартный ответ `500` только при реальной ошибке БД.
- Добавлена приватная страница `/contacts` (роут, screen, виджет, пункт в боковом меню и `routes.CONTACTS_PAGE`).
- Добавлен endpoint `GET /api/contact/group/contacts` с проверкой доступа и выгрузкой всех пользователей группы через BillionMail `/api/contact/list_ndp`.
- В `entities/contact/api` добавлен `useGetContactGroupContacts`; в `SettingContacts` реализован просмотр пользователей группы в модальном окне.
- Добавлен route-group `src/app/api/(contacts)` с endpoint: `POST /api/contact/group/create`, `POST /api/contact/group/delete`, `GET /api/contact/group/list`, `POST /api/contact/group/import`.
- В `create` реализована генерация `group_id` из `account_id + name + guid` с проверкой коллизии в `account_recipient`; добавлено создание/удаление групп в BillionMail.
- Добавлена клиентская сущность `src/entities/contact` с хуками `useGetContactGroupsList`, `useCreateContactGroup`, `useDeleteContactGroup`, `useImportContactGroupRecipients`.
- Обновлены `docs/API.md`, `README.md` и добавлен модульный файл `.memory_bank/modules/contact-groups.md`.
- В `EditorBubbleMenu` добавлена нормализация URL: если в поле ссылки отсутствует протокол, автоматически добавляется `https://` перед `setLink`.
- В `EmailTemplate` добавлен рекурсивный рендер TipTap `JSONContent` (параграфы, заголовки, списки, изображения, ссылки, inline marks, разделители, code block) в структуру `react-email`.
- В `MailingPage` в `EmailTemplate` начал передаваться `content` из `MailerEditor` при генерации HTML для отправки.
- В `src/entities/mailer/ui/EmailTemplate/EmailTemplate.tsx` добавлен базовый email-шаблон на `react-email` компонентах (`Html`, `Body`, `Container`, `Heading`, `Text`, `Button`, `Hr`).
- Для `EmailTemplate` добавлены типизированные пропсы с дефолтами: `previewText`, `title`, `message`, `buttonLabel`, `buttonHref`, `footerText`.
- Состояния `title` и `content` для редактора рассылки подняты в `MailingPage`.
- `MailerEditor` переведен в управляемый компонент через пропсы `title`, `content`, `onUpdateTitle`, `onUpdateContent`.
- Убрано предупреждение AntD: в dropdown-меню редактора `overlayClassName` заменен на `classNames.root`.
- Для `MailerEditor` включен SSR-safe режим TipTap: `immediatelyRender: false`.
- В позиционном меню редактора убран ранний доступ к `editor.view.dom`; добавлены безопасные проверки доступности `view`.
- В `AddRecipientMailer` добавлены локальный список получателей, поле ввода email, кнопка добавления и удаление адресов из списка.
- `MailerEditor` переведен на локальные `title` + `content` (`JSONContent`) без store.
- В `MailerEditor` подключены `EditorFloatingMenu`, `EditorPositionMenu`, `EditorBubbleMenu` по логике `frontend_employee`.
- Добавлены `src/entities/mailer/lib/getFloatingMenu.tsx` и `src/entities/mailer/lib/editorPositionMenu.ts`.
- Добавлены UI-компоненты меню редактора в `src/entities/mailer/ui/*` и типы в `src/entities/mailer/model/*`.
- `editorConfig` упрощен до базовых extension’ов: `StarterKit`, `Link`, `Underline`, `Image`, `Placeholder`.
- Меню адаптированы под базовые TipTap-команды без кастомных NodeView.
- Добавлена приватная страница `/mailing/new` (экран, маршрут и пункт навигации).
- В `deleteDomain` обработан кейс домена без почтовых ящиков как нормальный (без ошибки).
- Добавлен OTP-флоу создания mailbox и серверные эндпоинты `/api/mailbox/create/otp` и `/api/mailbox/create`.
- На странице `/mailboxes` добавлен модальный флоу `CreateMailbox`.
- Добавлен `POST /api/mailbox/delete` с проверкой доступа и кнопкой удаления в таблице `/mailboxes`.
- Добавлены серверный и клиентский эндпоинты `GET /api/mailbox/all` с фильтрацией по доменам аккаунта.
- На странице `/mailboxes` добавлена таблица почтовых ящиков.
- Добавлена приватная страница `/mailboxes` (экран, маршрут и пункт в боковом меню).
- Подготовлен SQL для таблицы `account_mailbox` (привязка почтовых ящиков к аккаунту).
- Уточнены требования к `account_mailbox`: `username` уникален; домен жёстко привязан к `account_domain`.
- Для FK на `(account_id, domain)` требуется UNIQUE/PK в `account_domain`.
- В `createDomain` добавлено сохранение почтового ящика в `account_mailbox` после успешного создания.
- Добавлен `POST /api/domains/fresh_dns_records` (сервер/клиент) и документация API.
- Сформирована карта проекта в Memory Bank и UI‑карты публичных страниц/компонентов.
- Создан `local/README.md` с обзором подсистем.
- Сформирован SQL для таблицы доменов, связанных с аккаунтом.
- Уточнено, что `accounts.id` имеет тип `uuid` (для внешнего ключа).
- В `createDomain` добавлено сохранение домена в `account_domain` после успеха BillionMail.
- В `listDomains` добавлена фильтрация доменов по таблице `account_domain`.
- В `proxy` добавлена проверка JWT для `/api/*` (кроме `/api/auth`, `/api/sign-up`).

## Next Steps

- Реализовать список пользовательских шаблонов из `account_template` + BillionMail для последующего выбора при создании batch-задачи.
- Добавить действия управления задачами на `/mailings` (pause/resume/delete) при необходимости продукта.
- Согласовать и реализовать стратегию отправки при выборе нескольких групп (`selectedGroupIds`) с атомарностью/rollback (сейчас задачи создаются последовательно по группам).
- Подключить новые хуки `entities/contact/api` в UI сценарии выбора групп и добавления получателей.
- Применить SQL‑схему `account_domain`/`account_mailbox` и UNIQUE/PK на `(account_id, domain)`.
- Зафиксировать изменения коммитом и обновить `last_checked_commit` (если появится `.git`).
- Исправить скрипт `yarn lint` (неподдерживаемый `--fix`) или обновить инструкции.
- Уточнить CI/CD и инфраструктуру, если находятся вне репозитория.
- Согласовать имя таблицы аккаунтов (если отличается от `accounts`).

## Open Questions

- Где расположен `.git` для этого проекта?
- Нужны ли дополнительные публичные страницы кроме `/sign-in` и `/sign-up`?
- Какой ожидаемый режим обновления DNS записей (частота/триггеры)?
- Как называется таблица аккаунтов (если не `accounts`)?

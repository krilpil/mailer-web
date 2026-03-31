# Progress

## Status

- Базовая документация и Memory Bank заполнены; добавлен эндпоинт обновления DNS записей; сформирован SQL для таблицы доменов аккаунта и уточнён тип `accounts.id`; добавлено сохранение домена и фильтрация списка по `account_domain`; включена проверка JWT для API; подготовлен SQL для `account_mailbox` с уникальным `username` и жёсткой привязкой домена; требуется UNIQUE/PK на `(account_id, domain)` в `account_domain`; добавлена запись mailbox при создании домена; добавлены приватные страницы `/mailboxes` и `/mailing/new`; добавлены серверный/клиентский эндпоинты списка mailbox и таблица на странице; добавлен эндпоинт удаления mailbox с проверкой доступа; добавлен OTP-флоу создания mailbox; `deleteDomain` терпимо обрабатывает отсутствие mailbox; добавлены модульные заметки для доменов и mailbox; базовый перенос `MailerEditor` завершён без store и без кастомных NodeView; добавлены `EditorFloatingMenu`, `EditorPositionMenu`, `EditorBubbleMenu` с логикой из `frontend_employee`, адаптированной под базовые extension’ы; старый email-ввод в `AddRecipientMailer` удален и заменен выбором пользовательских групп через `antd Select mode="multiple"`; `selectedGroupIds` подняты в `MailingPage`; устранены предупреждения AntD/Tiptap и ранний доступ к `editor.view`; `title/content` редактора вынесены на уровень `MailingPage`; добавлен базовый `EmailTemplate` на `@react-email/components` с типизированными пропсами и дефолтами; реализован рендер TipTap `JSONContent` в `EmailTemplate` и подключена передача `content` из `MailingPage` в рендер письма; в `EditorBubbleMenu` добавлена авто-нормализация URL (`https://` для ссылок без протокола); добавлены серверные и клиентские endpoint групп контактов (`create/delete/list/import/remove recipient`) с проверкой доступа по `account_recipient`; реализована страница `/contacts` с таблицей групп, просмотром пользователей группы и удалением пользователей из выбранной группы.
- Добавлены server/client endpoint для batch-рассылок по OpenAPI: `POST /api/batch_mail/task/create` и `GET /api/batch_mail/task/list`, включая нормализацию provider-response и клиентские хуки `useCreateBatchMailTask`/`useGetBatchMailTasksList`.
- На `/mailing` отправка переключена на `useCreateBatchMailTask`; добавлены поля `addresser` и `template_id`.
- Для batch-рассылки реализован временный шаблон: `POST /api/batch_mail/task/create` теперь принимает `content` редактора, рендерит HTML, создаёт уникальный `email_template`, создаёт task и удаляет template.
- Страница `/mailing` переведена в режим `Новый шаблон`: создание шаблона в BillionMail + запись связи шаблона с пользователем в `account_template`.
- При сохранении шаблона в `account_template` теперь также сохраняется JSONContent редактора в колонку `template` (JSON-строка).
- Добавлена страница `/templates` (`Список шаблонов`) с таблицей и удалением шаблонов текущего пользователя.
- На странице `/mailings` добавлена feature `Новая рассылка` (модальное окно выбора отправителя, групп и шаблона) с запуском task в режиме прогрева (`warmup=1`).
- Добавлена новая приватная страница `/mailings` со списком batch-задач, фильтрами (`keyword`, `status`) и пагинацией.
- На странице `/mailings` в таблицу задач добавлена колонка `Расчетное время` (`estimated_time_with_warmup`) с человекочитаемым форматированием длительности.
- Добавлен endpoint `GET /api/batch_mail/task/analytics` (агрегация `task/stat_chart`, `tracking/mail_provider`, `tracking/logs`) и клиентский hook `useGetBatchMailTaskAnalytics`.
- В таблицу `/mailings` добавлена кнопка `Аналитика` с feature-модалкой полной аналитики по выбранной задаче.
- В модальном окне аналитики реализованы графики (SVG) для `send_mail_chart`, `bounce_rate_chart`, `open_rate_chart`, `click_rate_chart` и визуальная диаграмма по почтовым провайдерам.
- Улучшен парсинг `mail_provider` для вложенных структур ответа; удалён блок `Логи отправки` из UI модалки аналитики.
- `POST /api/batch_mail/task/create` переведён на прямое создание задач по `template_id` без временного template-flow (`create/delete`).
- Исправлена ошибка UI `Не удалось загрузить список рассылок`: список `/api/batch_mail/task/list` теперь безопасно нормализуется на клиенте, а `status=-1` не отправляется в BillionMail.

## Completed

- На `/mailings` удалены статусные фильтры и колонка статуса; запрос списка работает без `status` (все статусы).
- Добавлен серверный endpoint `POST /api/email_template/create` (auth + render HTML + provider create + insert в `account_template`).
- Добавлены серверные endpoint'ы `GET /api/email_template/list` и `POST /api/email_template/delete` (проверка ownership через `account_template`).
- Добавлен клиентский хук `useCreateUserTemplate`; `MailingPage` теперь сохраняет шаблон вместо создания task.
- Добавлены клиентские хуки `useGetUserTemplatesList` и `useDeleteUserTemplate`; таблица `/templates` подключена к ним.
- Добавлена feature `CreateMailingTask` в `SettingMailings`: создание batch-задач по выбранным группам через `useCreateBatchMailTask` с `warmup=1`.
- В таблице `/mailings` добавлена колонка `Расчетное время` из `estimated_time_with_warmup`.
- Реализована feature `Аналитика задачи` на `/mailings` (кнопка в строке + модальное окно с dashboard/провайдерами/логами).
- Реализована визуализация графиков в аналитике задачи вместо вывода raw JSON.
- Модалка `Новая рассылка` отправляет `template_id` выбранного шаблона напрямую в `POST /api/batch_mail/task/create`.
- В `SideMenu` пункт `Новая рассылка` переименован в `Новый шаблон`.
- В `SideMenu` добавлен пункт `Список шаблонов`.
- `POST /api/batch_mail/task/create` переведён на payload с `content` вместо `template_id`; серверный handler реализует flow `email_template/create -> batch_mail/task/create -> email_template/delete`.
- В `MailingPage` удалён ввод `template_id`; отправка использует `title + content` из `MailerEditor`.
- В `MailingPage` удалено использование `useSendMail`; добавлено создание batch-задач через `useCreateBatchMailTask` (последовательно по выбранным группам).
- На `/mailing` добавлены controls: выбор mailbox-отправителя (`useGetMailboxesList`) и ввод `template_id`.
- Создана страница `Рассылки` (`/mailings`): `src/screens/MailingsPage`, `src/widgets/SettingMailings`, table + фильтры + пагинация на базе `useGetBatchMailTasksList`.
- В `routes` добавлен `MAILINGS_PAGE`, в `SideMenu` добавлен пункт `Рассылки`.
- Для `useGetBatchMailTasksList` убран hard-fail на полной Yup-валидации задач; добавлена безопасная нормализация ответа с дефолтами.
- В `src/app/api/(mailing)/_services/listBatchMailTasks.ts` включено условное добавление query-параметра `status` (только `>= 0`).
- Реализованы route handlers и сервисы в `src/app/api/(mailing)` для `POST /api/batch_mail/task/create` и `GET /api/batch_mail/task/list` с Yup-валидацией payload/query.
- Добавлены серверные DTO для batch-task create/list в `src/app/api/(mailing)/batch_mail/task/*` и нормализация `task/tag/group` полей в ответе `list`.
- Добавлены клиентские модули `src/entities/mailer/api/createBatchMailTask` и `src/entities/mailer/api/getBatchMailTasksList` с валидацией ответов и экспортом через `src/entities/mailer/api/index.ts`.
- Обновлены `docs/API.md`, `README.md` и `.memory_bank/modules/mailing.md` с описанием новых batch-mail endpoint и контрактов.
- `AddRecipientMailer` полностью переключен на выбор групп контактов пользователя через `antd Select mode="multiple"` без старого ручного ввода email.
- В `MailingPage` добавлено состояние `selectedGroupIds` и отображение выбранных `group_id` рядом с блоком выбора получателей.
- В `SettingContacts` реализован импорт пользователей из файла рядом с ручным добавлением (та же архитектура, что в `CreateContactGroup`).
- Создан общий модуль `entities/contact/lib/recipientsImport.ts` и общий UI-блок `entities/contact/ui/RecipientsImportFileInput` для исключения дублирования логики file-import.
- В `CreateContactGroup` реализован предпросмотр импорта: при выборе файла распознанные email автоматически добавляются в поле ручного списка пользователей.
- В `CreateContactGroup` удалено поле `description`, добавлен импорт пользователей из файла (`csv/txt/xls/xlsx`, до 20 Мб).
- `POST /api/contact/group/import` расширен: поддерживает режимы paste-import (`recipients`) и file-import (`file_data` + `file_type`).
- `GET /api/contact/group/list` расширен: в ответ добавлен `recipients_count` по каждой группе (получение из BillionMail `/api/contact/group/list` на сервере).
- В таблицу групп на `/contacts` добавлена колонка с количеством пользователей в группе (`N шт.`).
- Добавлена возможность удалить пользователя из группы: endpoint `POST /api/contact/group/recipient/remove`, клиентский хук `useRemoveContactFromGroup`, кнопка `Удалить из группы` в модальном окне пользователей.
- Добавлена feature `CreateContactGroup` и подключена на `/contacts`: кнопка с модальным окном, поля `name/recipients`, создание группы и добавление пользователей.
- Добавлена приватная страница `Контакты` (`/contacts`): route, screen, widget `SettingContacts`, навигация в `SideMenu`, `routes.CONTACTS_PAGE`.
- Добавлен `GET /api/contact/group/contacts` с серверной пагинацией по BillionMail `/api/contact/list_ndp` и проверкой доступа к группе через `account_recipient`.
- В `entities/contact/api` добавлен `useGetContactGroupContacts` для получения пользователей выбранной группы.
- Добавлен route-group `src/app/api/(contacts)` с endpoint групп контактов: `POST /api/contact/group/create`, `POST /api/contact/group/delete`, `GET /api/contact/group/list`, `POST /api/contact/group/import`.
- В `createGroup` добавлена генерация `group_id` из `account_id + name + guid` и проверка уникальности по `account_recipient`.
- Добавлены сервисы BillionMail для `contact/group/create`, `contact/group/delete`, `contact/group/import`.
- Добавлена клиентская сущность `src/entities/contact` с хуками `useGetContactGroupsList`, `useCreateContactGroup`, `useDeleteContactGroup`, `useImportContactGroupRecipients`.
- Добавлен модульный файл `.memory_bank/modules/contact-groups.md`, обновлены `docs/API.md` и `README.md`.
- В `EditorBubbleMenu` добавлена нормализация URL перед `setLink`: при отсутствии схемы ссылка дополняется `https://`.
- В `EmailTemplate` реализован рендер `content: JSONContent` в `react-email` блоки (heading, paragraph, list, image, hr, code, text marks/link).
- В `MailingPage` передача `content` в `<EmailTemplate />` добавлена в сценарии генерации HTML (`@react-email/render`).
- Добавлен `src/entities/mailer/ui/EmailTemplate/EmailTemplate.tsx` как базовый шаблон письма на `@react-email/components`.
- В `EmailTemplate` добавлены настраиваемые пропсы (`previewText`, `title`, `message`, `buttonLabel`, `buttonHref`, `footerText`) и дефолтный UI-каркас письма.
- `MailerEditor` переведен на управляемые пропсы `title/content/onUpdateTitle/onUpdateContent`.
- В `MailingPage` добавлены локальные `useState` для `title` и `content` и проброс в `MailerEditor`.
- Для dropdown-меню редактора заменен deprecated `overlayClassName` на `classNames.root`.
- В `MailerEditor` установлен `immediatelyRender: false` для SSR-safe гидрации.
- В `EditorPositionMenu`/`editorPositionMenu` добавлены безопасные проверки перед использованием `editor.view`.
- В `AddRecipientMailer` добавлен ввод email + кнопка добавления + список получателей с удалением.
- `MailerEditor` доведен до базовой рабочей версии с локальными `useState` для `title` и `content`.
- Добавлены `EditorFloatingMenu`, `EditorPositionMenu`, `EditorBubbleMenu` и их утилиты/типы в `entities/mailer`.
- `MailerEditor` переключен с временной toolbar на меню-слой из `frontend_employee`.
- `editorConfig` для mailer-редактора упрощен до базовых TipTap extension’ов (`StarterKit`, `Link`, `Underline`, `Image`, `Placeholder`).
- Реализован `POST /api/domains/fresh_dns_records` (сервер/клиент).
- Добавлены описания в `docs/API.md` и `local/README.md`.
- Созданы карты публичных страниц и компонентов в `.memory_bank/ui_extension`.
- Добавлены карта репозитория и границы подсистем в Memory Bank.
- Сформирован SQL для таблицы доменов, привязанных к аккаунту.
- Подготовлен SQL для таблицы `account_mailbox` (привязка почтовых ящиков к аккаунту) с уникальным `username` и FK на `account_domain`.
- Зафиксировано требование UNIQUE/PK на `(account_id, domain)` в `account_domain` для FK из `account_mailbox`.
- В `createDomain` добавлена запись в `account_mailbox` после успешного создания mailbox.
- Добавлена страница `Новая рассылка` (`/mailing/new`) и пункт навигации.
- Добавлена страница `Почтовые ящики` (`/mailboxes`) и пункт навигации.
- Добавлены `GET /api/mailbox/all` (сервер/клиент) и таблица почтовых ящиков в UI.
- Добавлены `POST /api/mailbox/delete` (сервер/клиент) и кнопка удаления в таблице почтовых ящиков.
- Добавлены `POST /api/mailbox/create/otp` и `POST /api/mailbox/create` (сервер/клиент) и модальный флоу создания mailbox.
- В `deleteDomain` кейс домена без mailbox больше не приводит к ошибке.
- Добавлены модульные заметки: `.memory_bank/modules/domains.md` и `.memory_bank/modules/mailboxes.md`.
- Подтвержден тип `accounts.id` = `uuid` для внешнего ключа.
- В `createDomain` после успеха BillionMail сохранение домена в `account_domain`.
- В `listDomains` добавлена фильтрация доменов по таблице `account_domain`.
- В `proxy` добавлена проверка JWT для `/api/*`, кроме `/api/auth` и `/api/sign-up`.

## In Progress

- Подготовка коммита и фиксация `last_checked_commit`.

## Next

- Реализовать endpoint списка пользовательских шаблонов (фильтрация по `account_template`), чтобы подключить выбор шаблона в сценарий создания batch-задачи.
- Добавить действия управления задачами на странице `/mailings` (pause/resume/delete) при необходимости продукта.
- Исправить `yarn lint` (опция `--fix` не поддерживается).
- Уточнить CI/CD и инфраструктуру, если они находятся вне репозитория.

## Known Issues

- `yarn lint` падает: `next lint` не принимает `--fix` в текущей версии.

## Changelog

- На странице `/mailings` убраны UI-статусы: удалён фильтр `status` и колонка `Статус`; поиск работает сразу по всем статусам задач.
- На странице `/mailings` в таблицу добавлена колонка `Расчетное время` (`estimated_time_with_warmup`) с форматированием `д/ч/м/с`.
- Добавлен маршрут `GET /api/batch_mail/task/analytics` и UI-feature аналитики задачи по кнопке `Аналитика` в таблице `/mailings`.
- Страница `/mailing` переименована в `Новый шаблон`; удалены элементы отправки рассылки, добавлено сохранение шаблона через `POST /api/email_template/create`.
- Добавлена страница `Список шаблонов` с удалением; выводятся только шаблоны пользователя из `account_template`.
- На странице `Рассылки` добавлена кнопка `Новая рассылка` с модальным окном и запуском задач рассылки в режиме прогрева.
- В `POST /api/email_template/create` добавлена запись ownership в `account_template` с `account_id` текущего пользователя.
- В `POST /api/batch_mail/task/create` изменён контракт: вместо `template_id` клиент передаёт `content` из `MailerEditor`; сервер создаёт временный template, создаёт задачу рассылки и удаляет template.
- На `/mailing` удалён input `template_id`; пользователь формирует письмо только в редакторе, контент идёт в batch-flow.
- Исправлен кейс, когда `/api/batch_mail/task/list` возвращал данные, но UI показывал `Не удалось загрузить список рассылок`: клиентский слой больше не падает на частично несовпадающем контракте.
- Для режима «Все статусы» перестали отправлять `status=-1` в BillionMail при вызове `/batch_mail/task/list`.
- `MailingPage` переключен на `useCreateBatchMailTask`: вместо `sendMail` создаются batch-задачи с payload OpenAPI (`addresser`, `subject`, `template_id`, `group_id`, `start_time` и флаги).
- На `/mailing` добавлены UI-поля выбора отправителя и `template_id`, источник отправителей — `GET /api/mailbox/all`.
- Добавлена приватная страница `/mailings` (`MailingsPage` + `SettingMailings`) со списком задач из `GET /api/batch_mail/task/list`.
- В таблице `/mailings` реализованы поиск по теме, фильтр `status`, пагинация и вывод ключевых метрик задач.
- В навигацию (`SideMenu`) добавлен пункт `Рассылки`; в `routes` добавлен `MAILINGS_PAGE`.
- Добавлены серверные endpoint `POST /api/batch_mail/task/create` и `GET /api/batch_mail/task/list` в route-group `(mailing)`.
- Для `POST /api/batch_mail/task/create` добавлена валидация payload по обязательным полям OpenAPI (`addresser`, `subject`, `template_id`, `group_id`, `start_time`) и проксирование в BillionMail.
- Для `GET /api/batch_mail/task/list` добавлена валидация query (`page`, `page_size`, `keyword?`, `status?`) и серверная нормализация данных задач, тегов и групп.
- В `entities/mailer/api` добавлены клиентские хуки `useCreateBatchMailTask` и `useGetBatchMailTasksList` и соответствующие response-validators.
- Обновлены `docs/API.md`, `README.md` и `.memory_bank/modules/mailing.md` под новые маршруты `/api/batch_mail/task/*`.
- `AddRecipientMailer` переведен с ручного ввода email на выбор групп пользователя (`Select mode="multiple"`), с загрузкой из `GET /api/contact/group/list` и fallback-кнопкой `Создать группу` при пустом списке.
- В `MailingPage` заменено состояние `recipients` на `selectedGroupIds`; выбранные `group_id` выводятся в UI для контроля результата выбора.
- В `SettingContacts` добавлен импорт из файла (`csv/txt/xls/xlsx`, до 20 Мб) рядом с ручным добавлением пользователей.
- Логика импорта из файла (парсинг, предпросмотр, валидация, payload) вынесена в общий модуль `entities/contact/lib/recipientsImport.ts` и переиспользуется в `CreateContactGroup` и `SettingContacts`.
- В `CreateContactGroup` после загрузки файла распознанные email отображаются в списке пользователей (поле ручного ввода).
- В `CreateContactGroup` добавлен файл-импорт контактов (`csv/txt/xls/xlsx`, до 20 Мб), поле `description` удалено.
- В серверном/клиентском контракте `POST /api/contact/group/import` добавлены поля `file_data` и `file_type` для импорта из файла.
- Серверный `GET /api/contact/group/list` теперь возвращает список групп с полем `recipients_count`, поэтому фронт не делает отдельные запросы по группам для подсчета.
- На странице `/contacts` в таблице групп добавлена колонка количества пользователей (`Пользователей`, `N шт.`).
- Добавлен endpoint `POST /api/contact/group/recipient/remove`: удаляет пользователя из выбранной группы, а если это последняя группа пользователя, удаляет контакт из BillionMail.
- В `SettingContacts` добавлена кнопка `Удалить из группы` для каждого пользователя в модальном списке группы.
- В `SettingContacts` добавлена возможность добавлять новых пользователей в уже созданную группу через `POST /api/contact/group/import` из модального окна группы.
- Для импорта в группы включен режим подтверждения по умолчанию: `POST /api/contact/group/import` теперь отправляет `status=1` (Confirmed).
- В `POST /api/contact/group/delete` добавлена верификация фактического удаления группы в BillionMail и повторные попытки; локальная запись удаляется только после подтверждённого удаления группы у провайдера.
- Исправлена ошибка `Group <id> does not exist` при `POST /api/contact/group/import`: добавлен recovery устаревшего `group_id` по имени группы и повтор импорта; в `createGroup` сохраняется резолвленный `group_id` провайдера.
- На страницу `/contacts` добавлена feature создания группы с пользователями через модальное окно.
- В `GET /api/contact/group/list` убран временный soft-fail fallback, упрощена обработка rows и восстановлена строгая ошибка `500` только при фактическом сбое чтения БД.
- Добавлена страница `/contacts` с таблицей групп и модальным просмотром пользователей группы.
- Добавлен endpoint `GET /api/contact/group/contacts` и клиентский hook для загрузки пользователей выбранной группы.
- Добавлены серверные endpoint контактных групп и импорт получателей (`/api/contact/group/create|delete|list|import`) с локальной привязкой к `account_recipient`.
- Добавлен клиентский API-слой `entities/contact` для списка/создания/удаления групп и импорта получателей.
- В `EditorBubbleMenu` реализовано автоматическое добавление `https://` для ссылок без протокола.
- Добавлена обработка TipTap `JSONContent` в `EmailTemplate` с конвертацией узлов редактора в структуру письма на `react-email`.
- Добавлена передача `content` в `EmailTemplate` при отправке письма из `MailingPage`.
- Добавлен базовый шаблон `EmailTemplate` для mailer-сущности на `react-email` компонентах.
- Состояние редактора (`title`, `content`) поднято из `MailerEditor` в `MailingPage` с управлением через пропсы/callback.
- Исправлены предупреждение AntD (`overlayClassName`) и ошибки TipTap, связанные с SSR и ранним доступом к `editor.view`.
- Добавлен рабочий `AddRecipientMailer` со списком email-получателей, добавлением и удалением адресов.
- Завершен базовый перенос ядра `MailerEditor` с локальным состоянием и базовым набором форматирования.
- Реализованы `EditorFloatingMenu`, `EditorPositionMenu`, `EditorBubbleMenu` (адаптация из `frontend_employee` без кастомных NodeView/store).
- Добавлены эндпоинты обновления DNS‑записей (сервер/клиент) и базовая документация проекта (Memory Bank, UI‑страницы/компоненты, local/README, карта подсистем).
- Добавлен SQL‑черновик схемы таблицы доменов аккаунта.
- Добавлен SQL‑черновик схемы таблицы `account_mailbox`.
- Уточнен тип внешнего ключа `account_id` (UUID).
- Добавлена запись домена в `account_domain` при создании.
- Добавлена фильтрация списка доменов по `account_domain`.
- Добавлена приватная страница `/mailing/new` и обновлена навигация.
- Добавлена приватная страница `/mailboxes` и обновлена навигация.
- Добавлены серверный и клиентский эндпоинты для списка почтовых ящиков и таблица на `/mailboxes`.
- Добавлены серверный и клиентский эндпоинты удаления mailbox и кнопка удаления в UI.
- Добавлены OTP-эндпоинты и UI-флоу для создания mailbox.
- Исправлена обработка удаления домена без почтовых ящиков.
- Добавлена проверка JWT для `/api/*`, кроме `/api/auth` и `/api/sign-up`.
- Добавлены модульные заметки для доменов и mailbox в `.memory_bank/modules/`.

## Контроль изменений

- last_checked_commit: f6b800b
- last_checked_date: 2026-03-31

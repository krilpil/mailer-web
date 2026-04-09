# API Architecture

## Overview

- Server API lives in `src/app/api` (Next.js App Router).
- We use feature-scoped route groups: `(auth)`, `(contacts)`, `(domains)`, `(mailing)`, `(mailboxes)`.
- Route groups in parentheses are not part of the URL.
- Public URL paths are defined by the folders under each route group.

Example: `src/app/api/(auth)/sign-up/otp/route.ts` → `POST /api/sign-up/otp`.

## Responsibilities

`route.ts`

- Re-exports HTTP handlers from `_handlers`.
- No business logic.

`_handlers`

- Parse request body and query.
- Validate payload with Yup.
- Map errors to HTTP status and response shape.
- Call service functions.

`_services`

- Business logic.
- Orchestrate repositories and external APIs.
- No framework-specific code.

`_repositories`

- Database access (TypeORM).
- Query composition and transaction scope.

`*.types.ts` and `*.validation.ts`

- Request/response DTOs and Yup schemas.
- Live next to endpoint folders.

## Request Flow

`route.ts` → `_handlers` → `_services` → `_repositories` → DB or external API.

## Error Handling Conventions

- `400` for invalid JSON or validation errors.
- `404` for OTP not found.
- `409` for already existing account on sign-up OTP.
- `500` for internal or provider errors.

## Common error payload:

`{ success: false, msg, error? }`

## Domains

`POST /api/domains/create/otp`

- Request: `{ email }`
- Response: `{ otp_guid, expires_at }`

`POST /api/domains/create`

- Request: `{ otp, otp_guid, domain, email }`
- Response: `{ otp_guid, expires_at }`
- Side effects: creates the domain in the mail provider (quota 10 MB).
- Errors: `404` when OTP not found.
- Side effects: deletes existing mailboxes for the domain and creates `${local_part}@${domain}`.

`POST /api/domains/delete`

- Request: `{ domain }`
- Response: `{ success, msg }`
- Side effects: deletes all mailboxes for the domain, then deletes the domain.

`POST /api/domains/fresh_dns_records`

- Request: `{ domain }`
- Response: `{ success, msg, data }` where `data` contains `spf`, `dkim`, `dkim_short`, `dmarc`, `mx`, `a`, `ptr`
- Side effects: refreshes cached DNS records for the domain and returns validation flags.

## Mailboxes

`GET /api/mailbox/all`

- Response: `{ success, msg, data }` where `data.list` contains `{ username, create_time }`
- Notes: aggregates mailboxes for all domains available to the account.

`POST /api/mailbox/create/otp`

- Request: `{ domain, local_part }`
- Response: `{ otp_guid, expires_at }`
- Notes: sends OTP to `local_part@domain` after domain access check.

`POST /api/mailbox/create`

- Request: `{ domain, local_part, otp, otp_guid }`
- Response: `{ success, msg }`
- Notes: verifies OTP and creates mailbox in provider (password/isAdmin/active set server-side).

`POST /api/mailbox/delete`

- Request: `{ username }`
- Response: `{ success, msg }`
- Notes: checks mailbox access for the account before calling provider API.

## Contact Groups

`POST /api/contact/group/create`

- Request: `{ name, description?, double_optin? }`
- Response: `{ success, msg, data }` where `data` contains `{ group_id, name }`
- Notes: generates `group_id` from `account_id + name + guid`, checks collision in `account_recipient`, creates group in BillionMail, stores mapping in `account_recipient`.

`POST /api/contact/group/delete`

- Request: `{ group_id }`
- Response: `{ success, msg }`
- Notes: checks group ownership in `account_recipient`, deletes all contacts of this group in BillionMail (`/api/contact/delete_ndp`), then deletes the group in BillionMail, verifies it via `/api/contact/group/info`, and only then deletes local mapping.

`GET /api/contact/group/list`

- Response: `{ success, msg, data }` where `data.list` contains `{ group_id, name, recipients_count }`.
- Notes: returns groups from local `account_recipient` for current account and enriches each group with recipient count from BillionMail `/api/contact/group/list`.

`POST /api/contact/group/import`

- Request: `{ group_ids, recipients?, file_data?, file_type?, default_active?, status?, overwrite? }`
- Response: `{ success, msg, data? }` where `data.imported_count` is imported recipient count.
- Notes: validates ownership for all `group_ids` via `account_recipient` and forwards to BillionMail `/api/contact/group/import`; supports both paste-import (`recipients`) and file-import (`file_data` + `file_type` where `file_type` is `csv|txt|excel`); server enforces imported contacts as confirmed (`status=1`).

`GET /api/contact/group/contacts`

- Query: `{ group_id }`
- Response: `{ success, msg, data }` where `data.list` contains group contacts (`email`, `active`, `status`, `create_time`).
- Notes: checks ownership of `group_id` in `account_recipient`, fetches all pages from BillionMail `/api/contact/list_ndp` with `active=-1`.

`POST /api/contact/group/recipient/remove`

- Request: `{ group_id, email, active }`
- Response: `{ success, msg, error? }`
- Notes: checks group ownership in `account_recipient`; resolves recipient by `email` inside the group, then:
  - if recipient has other groups in BillionMail, updates contact groups via `/api/contact/update_group`;
  - if target group is the last one, deletes recipient via `/api/contact/delete`.

## Batch Mail Tasks

`POST /api/batch_mail/task/create`

- Request: `{ addresser, subject, template_id, group_id, start_time, full_name?, is_record?, unsubscribe?, threads?, track_open?, track_click?, warmup?, remark?, tag_ids?, tag_logic? }`
- Response: `{ success, msg, code?, data? }` where `data.id` is created task id.
- Notes: server proxies task creation to BillionMail `/batch_mail/task/create` using the provided existing `template_id` (no temporary template creation/deletion).

`GET /api/batch_mail/task/list`

- Query: `{ page, page_size, keyword?, status? }`
- Response: `{ success, msg, code?, data }` where `data` contains `{ total, list }` and normalized task objects.
- Notes: endpoint requires auth and returns only tasks доступные текущему пользователю; ownership определяется по связям аккаунта (`account_template.template_id`, `account_recipient.group_id`, `account_mailbox.username`, `account_domain.domain`) и полям задачи (`template_id`, `group_id`, `groups.id`, `addresser` email/domain). После фильтрации сервер применяет локальную пагинацию и возвращает только разрешённые задачи.

`GET /api/batch_mail/task/analytics`

- Query: `{ task_id, start_time?, end_time?, logs_status?, logs_domain?, logs_page?, logs_page_size? }`
- Response: `{ success, msg, code?, data }` where `data` contains:
  - `period` — фактический период аналитики;
  - `stat_chart` — агрегированные графики задачи;
  - `mail_provider` — статистика по почтовым провайдерам;
  - `logs` — логи отправки с пагинацией;
  - `warnings` — предупреждения по частично недоступным источникам.
- Notes: server aggregates BillionMail endpoints `/batch_mail/task/stat_chart`, `/batch_mail/tracking/mail_provider`, `/batch_mail/tracking/logs` and returns normalized payload for UI feature аналитики задачи.

## Email Templates

`POST /api/email_template/create`

- Request: `{ template_name, content? , html_content? }` where:
  - `content` is TipTap `JSONContent` from `MailerEditor`;
  - `html_content` is raw HTML template string;
  - at least one of `content` or `html_content` is required.
- Response: `{ success, msg, code?, data? }` where `data` contains `{ template_id, template_name }`.
- Notes: endpoint checks auth, creates template in BillionMail (`/api/email_template/create`) and stores template ownership in PostgreSQL table `account_template` for current `account_id`; if `content` is provided, server renders it to HTML, if `html_content` is provided, server uses it as-is.

`GET /api/email_template/list`

- Response: `{ success, msg, data }` where `data.list` contains `{ template_id, template_name, template, create_time, update_time }`.
- Notes: returns only templates from `account_template` for current authenticated user.

`POST /api/email_template/delete`

- Request: `{ template_id }`
- Response: `{ success, msg, error?, code? }`
- Notes: checks ownership in `account_template`, deletes template in BillionMail (`/api/email_template/delete`) and removes local row in `account_template`.

## Add a New Endpoint

1. Create a route folder under `src/app/api/(feature)/<path>/route.ts` and re-export the handler.
2. Add a handler in `src/app/api/(feature)/_handlers`.
3. Add a service in `src/app/api/(feature)/_services`.
4. Add a repository in `src/app/api/(feature)/_repositories` if DB access is needed.
5. Define `*.types.ts` and `*.validation.ts` next to the endpoint folder.
6. Add a client API module under `src/entities/<feature>/api` if the UI needs it.

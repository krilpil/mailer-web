# Mailing Module

## Scope
- Экран `src/screens/MailingPage` для подготовки рассылки.
- Редактор контента (`MailerEditor`) и список получателей (`AddRecipientMailer`).

## MailingPage State
- `title: string`
- `content: JSONContent`
- `recipients: string[]`

## AddRecipientMailer
- Локальное состояние:
  - `recipient` — текущее значение input
  - `recipients` — массив email-адресов
  - `error` — текст ошибки валидации
- Поддержка:
  - добавления email по кнопке и по Enter
  - валидации формата email
  - запрета дублей
  - удаления адреса из списка

## Notes
- `recipients` уже поднимается в `MailingPage` через `onUpdate` из `AddRecipientMailer`.
- Для интеграции отправки нужно пробросить `recipients` в контейнер страницы или общий callback.

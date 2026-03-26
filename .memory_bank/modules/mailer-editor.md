# Mailer Editor Module

## Scope
- Базовый rich-text редактор писем в `src/widgets/MailerEditor`.
- Управляемый компонент без глобального store.

## State
- Состояние хранится на уровне `src/screens/MailingPage` и передается в `MailerEditor` через пропсы:
  - `title`
  - `content`
  - `onUpdateTitle`
  - `onUpdateContent`

## TipTap Extensions
- `StarterKit`
- `Link` (`openOnClick: false`, `linkOnPaste: true`)
- `Underline`
- `Image`
- `Placeholder`

## UI
- Поле заголовка (`Input.TextArea`).
- `EditorFloatingMenu` для вставки/переключения блочных элементов (`paragraph`, `h2`, `h3`, `image`, `ul/ol`, `hr`).
- `EditorPositionMenu` для операций над текущим блоком (вверх/вниз/удалить).
- `EditorBubbleMenu` для inline-форматирования (`bold`, `italic`, `underline`, `strike`, `link`).
- `EditorContent` для основного контента.

## Constraints
- Не используются кастомные NodeView (`NodeViewBlockquote`, `NodeViewButton`, `NodeViewDigest`, `NodeViewImage`).
- Не используется `usePublicationEditorStore` и любые глобальные store.

# ConfirmationForm

## Назначение
- Форма подтверждения OTP-кода и повторной отправки кода.

## Точки конфигурации
- `email` — используется в тексте подсказки.
- `expiresAt` — управляет таймером и возможностью повторной отправки.
- `onSubmitAction`, `onRepeatOTP` — обработчики действий.
- `error` — внешний текст ошибки для отображения.
- Встроенная длина OTP: 6.

## Параметры
- `email: string`.
- `expiresAt: number`.
- `onSubmitAction: (values: ConfirmationFormValues) => void`.
- `onRepeatOTP: () => void`.
- `error?: string`.

## Шаблоны
- Текст с email.
- OTP-инпут.
- Ошибка и подсказки по повторной отправке.
- Кнопка подтверждения.

## Зависимости
- `formik`, `yup`, `antd` Button.
- Styled components из `src/entities/session/ui/ConfirmationForm/ConfirmationForm.styles`.

## Где вызывается
- `SignUpPage` (`src/screens/SignUpPage/ui/SignUpPage.tsx`).

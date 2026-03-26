'use client';

import React, { FC, useState } from 'react';
import { InputProps } from 'antd';

import {
  SAddRecipientMailer,
  SAddRecipientRow,
  SErrorText,
  SRecipientInput,
  SRecipientItem,
  SRecipientList,
  SRemoveRecipientButton,
  SSectionTitle,
  SSubmitRecipientButton,
} from './addRecipientMailer.styles';
import { AddRecipientMailerProps } from '../model/addRecipientMailer.types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AddRecipientMailer: FC<AddRecipientMailerProps> = ({ recipients, onUpdate }) => {
  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState('');

  const handleAddRecipient = () => {
    const normalizedRecipient = recipient.trim().toLowerCase();
    if (!normalizedRecipient) return;

    if (!emailPattern.test(normalizedRecipient)) {
      setError('Введите корректный email');
      return;
    }

    if (recipients.includes(normalizedRecipient)) {
      setError('Этот email уже добавлен');
      return;
    }

    onUpdate([...recipients, normalizedRecipient]);
    setRecipient('');
    setError('');
  };

  const handleRemoveRecipient = (email: string) => {
    onUpdate(recipients.filter((recipientEmail) => recipientEmail !== email));
  };

  const handleChangeRecipient: InputProps['onChange'] = (event) => {
    setRecipient(event.target.value);
    if (error) setError('');
  };

  const handlePressEnterRecipient: InputProps['onPressEnter'] = () => {
    handleAddRecipient();
  };

  return (
    <SAddRecipientMailer>
      <SSectionTitle>Получатели</SSectionTitle>

      <SAddRecipientRow>
        <SRecipientInput
          placeholder="email@domain.com"
          value={recipient}
          onChange={handleChangeRecipient}
          onPressEnter={handlePressEnterRecipient}
        />
        <SSubmitRecipientButton onClick={handleAddRecipient}>Добавить</SSubmitRecipientButton>
      </SAddRecipientRow>

      {error && <SErrorText>{error}</SErrorText>}

      <SRecipientList>
        {recipients.map((email) => (
          <SRecipientItem key={email}>
            <span>{email}</span>
            <SRemoveRecipientButton type="text" onClick={() => handleRemoveRecipient(email)}>
              Удалить
            </SRemoveRecipientButton>
          </SRecipientItem>
        ))}
      </SRecipientList>
    </SAddRecipientMailer>
  );
};

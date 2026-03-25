'use client';

import React from 'react';

import { CreateMailbox } from '@/features/CreateMailbox';
import { SettingMailboxes } from '@/widgets/SettingMailboxes';

export const MailboxesPage = () => {
  return (
    <div>
      <h2>Почтовые ящики</h2>
      <CreateMailbox />
      <SettingMailboxes />
    </div>
  );
};

'use client';

import React from 'react';

import { CreateContactGroup } from '@/features/CreateContactGroup';
import { SettingContacts } from '@/widgets/SettingContacts';

export const ContactsPage = () => {
  return (
    <div>
      <h2>Контакты</h2>
      <CreateContactGroup />
      <SettingContacts />
    </div>
  );
};

'use client';

import React from 'react';
import { UploadHtmlTemplate } from '@/features/UploadHtmlTemplate';

import { SettingTemplates } from '@/widgets/SettingTemplates';

export const TemplatesPage = () => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>Список шаблонов</h2>
        <UploadHtmlTemplate />
      </div>
      <SettingTemplates />
    </div>
  );
};

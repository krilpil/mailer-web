'use client';

import React, { FC, useMemo } from 'react';
import { Button, Select, SelectProps, Typography } from 'antd';
import { useRouter } from 'next/navigation';

import { useGetContactGroupsList } from '@/entities/contact/api';
import { routes } from '@/shared/config/routes';

import { SAddRecipientMailer } from './addRecipientMailer.styles';
import { AddRecipientMailerProps } from '../model/addRecipientMailer.types';

const NotFoundContent = () => {
  const router = useRouter();

  return (
    <>
      <Typography.Text type="secondary">У вас пока нет созданных групп</Typography.Text>
      <Button type="primary" onClick={() => router.push(routes.CONTACTS_PAGE)}>
        Создать группу
      </Button>
    </>
  );
};

export const AddRecipientMailer: FC<AddRecipientMailerProps> = ({ selectedGroupIds, onUpdate }) => {
  const contactGroups = useGetContactGroupsList();

  const options = useMemo<SelectProps<number>['options']>(
    () =>
      (contactGroups.data || []).map((group) => ({
        value: group.group_id,
        label: `${group.name} (${group.recipients_count})`,
      })),
    [contactGroups.data]
  );

  const isLoading = contactGroups.isFetching;

  const handleChangeGroups = (values: number[]) => {
    onUpdate(
      values
        .map((groupId) => Number(groupId))
        .filter((groupId) => Number.isInteger(groupId) && groupId > 0)
    );
  };

  return (
    <SAddRecipientMailer>
      <Select<number>
        mode="multiple"
        placeholder="Выберите одну или несколько групп"
        value={selectedGroupIds}
        options={options}
        onChange={handleChangeGroups}
        disabled={contactGroups.isFetching}
        notFoundContent={<NotFoundContent />}
        style={{ width: '100%' }}
        variant={'borderless'}
        loading={isLoading}
        optionFilterProp="label"
      />
    </SAddRecipientMailer>
  );
};

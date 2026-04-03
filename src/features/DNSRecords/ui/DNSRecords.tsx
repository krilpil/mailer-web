import React, { FC, useMemo, useState } from 'react';
import { Button, Divider, Modal, Radio, Table, TableProps, Tag, Typography } from 'antd';

import { DNSRecordsProps } from '../model/DNSRecords.types';

export const DNSRecords: FC<DNSRecordsProps> = ({ value, isLoadingUpdate, onClose, onUpdate }) => {
  const [dkimFormat, setDkimFormat] = useState<'2048' | '1024'>('2048');

  type SummaryRow = {
    key: string;
    domain: string;
    mx: boolean;
    a: boolean;
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
    ptr: boolean;
  };
  type SimpleRecordRow = {
    key: string;
    type: string;
    host: string;
    value: string;
  };
  type MxRecordRow = {
    key: string;
    type: string;
    host: string;
    value: string;
    priority: string;
  };

  const domainLabel = useMemo(() => {
    const candidates = [
      value.a.host,
      value.mx.host,
      value.spf.host,
      value.dmarc.host,
      value.dkim.host,
      value.dkim_short.host,
      value.ptr.host,
    ];

    const candidate = candidates.find(
      (host) => host && host !== '@' && host.includes('.') && !host.includes('_')
    );

    if (!candidate) return '-';

    return candidate.replace(/^(mail|smtp|imap|pop|pop3|mx)\./, '');
  }, [
    value.a.host,
    value.mx.host,
    value.spf.host,
    value.dmarc.host,
    value.dkim.host,
    value.dkim_short.host,
    value.ptr.host,
  ]);

  const handleFreshDNSRecords = () => onUpdate(domainLabel);

  const renderCopyableValue = (text: string) => {
    if (!text) {
      return <Typography.Text type="secondary">-</Typography.Text>;
    }

    return (
      <Typography.Text copyable ellipsis={{ tooltip: text }} style={{ maxWidth: 420 }}>
        {text}
      </Typography.Text>
    );
  };

  const renderStatus = (valid: boolean) => (
    <Tag color={valid ? 'green' : 'red'}>{valid ? 'Установлено' : 'Не установлено'}</Tag>
  );

  const summaryColumns: TableProps<SummaryRow>['columns'] = [
    {
      title: 'Домен',
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: 'MX',
      dataIndex: 'mx',
      key: 'mx',
      render: renderStatus,
    },
    {
      title: 'A',
      dataIndex: 'a',
      key: 'a',
      render: renderStatus,
    },
    {
      title: 'SPF',
      dataIndex: 'spf',
      key: 'spf',
      render: renderStatus,
    },
    {
      title: 'DKIM',
      dataIndex: 'dkim',
      key: 'dkim',
      render: renderStatus,
    },
    {
      title: 'DMARC',
      dataIndex: 'dmarc',
      key: 'dmarc',
      render: renderStatus,
    },
    {
      title: 'PTR',
      dataIndex: 'ptr',
      key: 'ptr',
      render: renderStatus,
    },
  ];

  const summaryData: SummaryRow[] = [
    {
      key: 'summary',
      domain: domainLabel,
      mx: value.mx.valid,
      a: value.a.valid,
      spf: value.spf.valid,
      dkim: value.dkim.valid,
      dmarc: value.dmarc.valid,
      ptr: value.ptr.valid,
    },
  ];

  const mxPriority = useMemo(() => {
    const match = value.mx.value.trim().match(/^(\d+)\s+.+/);
    return match ? match[1] : '-';
  }, [value.mx.value]);

  const aRecordData: SimpleRecordRow[] = [
    {
      key: 'a',
      type: value.a.type || 'A',
      host: value.a.host,
      value: value.a.value,
    },
  ];

  const mxRecordData: MxRecordRow[] = [
    {
      key: 'mx',
      type: value.mx.type || 'MX',
      host: value.mx.host,
      value: value.mx.value,
      priority: mxPriority,
    },
  ];

  const dkimRecord = dkimFormat === '2048' ? value.dkim : value.dkim_short;
  const txtRecordsData: SimpleRecordRow[] = [
    {
      key: 'spf',
      type: value.spf.type || 'TXT',
      host: value.spf.host,
      value: value.spf.value,
    },
    {
      key: 'dkim',
      type: dkimRecord.type || 'TXT',
      host: dkimRecord.host,
      value: dkimRecord.value,
    },
    {
      key: 'dmarc',
      type: value.dmarc.type || 'TXT',
      host: value.dmarc.host,
      value: value.dmarc.value,
    },
  ];

  const columnsSimple: TableProps<SimpleRecordRow>['columns'] = [
    {
      title: 'Тип записи',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Хост',
      dataIndex: 'host',
      key: 'host',
      render: (text: string) =>
        text ? text : <Typography.Text type="secondary">-</Typography.Text>,
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      key: 'value',
      render: renderCopyableValue,
    },
  ];

  const columnsMx: TableProps<MxRecordRow>['columns'] = [
    {
      title: 'Тип записи',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Хост',
      dataIndex: 'host',
      key: 'host',
      render: (text: string) =>
        text ? text : <Typography.Text type="secondary">-</Typography.Text>,
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      key: 'value',
      render: renderCopyableValue,
    },
    {
      title: 'Приоритет MX',
      dataIndex: 'priority',
      key: 'priority',
      render: () => <Typography.Text type="secondary">10</Typography.Text>,
    },
  ];

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      title="DNS записи"
      centered
      width={1000}
      styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
    >
      <Table
        dataSource={summaryData}
        columns={summaryColumns}
        pagination={false}
        size="small"
        scroll={{ x: 780 }}
      />

      <Divider />

      <Typography.Title level={4}>Шаг 1: Добавьте A запись</Typography.Title>
      <Table
        dataSource={aRecordData}
        columns={columnsSimple}
        pagination={false}
        size="small"
        scroll={{ x: 780 }}
      />

      <Divider />

      <Typography.Title level={4}>Шаг 2: Добавьте MX запись</Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        Войдите к вашему провайдеру домена и добавьте MX запись для почтового сервиса (пожалуйста,
        скопируйте параметры ниже напрямую)
      </Typography.Paragraph>
      <Table
        dataSource={mxRecordData}
        columns={columnsMx}
        pagination={false}
        size="small"
        scroll={{ x: 780 }}
      />

      <Divider />

      <Typography.Title level={4}>Шаг 3: Добавьте TXT запись</Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        Добавьте TXT записи для антиспама почты (пожалуйста, скопируйте параметры ниже напрямую)
      </Typography.Paragraph>
      <div style={{ marginBottom: 12 }}>
        <Typography.Text style={{ marginRight: 8 }}>Формат DKIM записи:</Typography.Text>
        <Radio.Group value={dkimFormat} onChange={(event) => setDkimFormat(event.target.value)}>
          <Radio value="2048">2048-битный RSA ключ</Radio>
          <Radio value="1024">1024-битный RSA ключ</Radio>
        </Radio.Group>
      </div>
      <Table
        dataSource={txtRecordsData}
        columns={columnsSimple}
        pagination={false}
        size="small"
        scroll={{ x: 780 }}
      />

      <Divider />

      <Typography.Title level={4}>Шаг 4: Добавьте PTR запись</Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        (Опционально) PTR запись используется для обратного DNS запроса
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary">
        Обратитесь к вашему провайдеру IP для создания PTR записи
      </Typography.Paragraph>
      <Button type={'primary'} loading={isLoadingUpdate} onClick={handleFreshDNSRecords}>
        Проверить DNS записи
      </Button>
    </Modal>
  );
};

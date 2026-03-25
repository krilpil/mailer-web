import { Button, TableProps } from 'antd';
import { unix } from 'dayjs';

import { DNSRecordsType, DomainType } from '@/entities/domain';

type IBuilderDomainColumns = (args: {
  onDNSRecords: (records: DNSRecordsType) => void;
  onRemove: (domain: string) => void;
}) => TableProps['columns'];

export const builderDomainsColumns: IBuilderDomainColumns = ({ onDNSRecords, onRemove }) => [
  {
    title: 'Домен',
    dataIndex: 'domain',
    key: 'domain',
  },
  {
    title: 'Добавлен',
    dataIndex: 'create_time',
    key: 'create_time',
    render: (createTime: number) => {
      return unix(createTime).format('DD MMMM YYYY в HH:mm');
    },
  },
  {
    key: 'show_dns',
    render: ({ dns_records }: DomainType) => (
      <Button type="primary" onClick={() => onDNSRecords(dns_records)}>
        DNS-записи
      </Button>
    ),
  },
  {
    key: 'remove',
    render: ({ domain }: DomainType) => (
      <Button type={'dashed'} onClick={() => onRemove(domain)}>
        Удалить
      </Button>
    ),
  },
];

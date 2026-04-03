import React, { useState } from 'react';
import { Table } from 'antd';

import { useDeleteDomain, useFreshDNSRecords, useGetDomainsList } from '@/entities/domain/api';
import { CreateDomain } from '@/features/CreateDomain';
import { DNSRecords } from '@/features/DNSRecords';
import { DNSRecordsType } from '@/entities/domain';
import { DNSRecordsProps } from '@/features/DNSRecords/model/DNSRecords.types';

import { builderDomainsColumns } from '../lib/builderColumn';

export const SettingDomains = () => {
  const getDomainsList = useGetDomainsList();
  const deleteDomain = useDeleteDomain();
  const freshDNSRecords = useFreshDNSRecords();

  const [valueDNSRecords, setValueDNSRecords] = useState<DNSRecordsType | null>(null);

  const tableDataSource = getDomainsList.data || [];

  const handleOpenDNSRecords = (dnsRecords: DNSRecordsType) => setValueDNSRecords(dnsRecords);
  const handleDeleteDomain = (domain: string) => {
    deleteDomain.mutateAsync({ domain });
  };

  const handleCloseDNSRecords = () => setValueDNSRecords(null);
  const handleFreshDNSRecords: DNSRecordsProps['onUpdate'] = (domain) => {
    freshDNSRecords.mutateAsync({ domain }).then(({ data }) => {
      setValueDNSRecords(data);
    });
  };

  const domainsColumns = builderDomainsColumns({
    onDNSRecords: handleOpenDNSRecords,
    onRemove: handleDeleteDomain,
  });

  return (
    <div>
      <CreateDomain />

      {valueDNSRecords !== null && (
        <DNSRecords
          value={valueDNSRecords}
          isLoadingUpdate={freshDNSRecords.isPending}
          onClose={handleCloseDNSRecords}
          onUpdate={handleFreshDNSRecords}
        />
      )}

      <Table
        rowKey="domain"
        columns={domainsColumns}
        dataSource={tableDataSource}
        pagination={false}
        loading={getDomainsList.isFetching}
        scroll={{ x: 980 }}
      />
    </div>
  );
};

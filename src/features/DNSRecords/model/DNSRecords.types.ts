import { DNSRecordsType } from '@/entities/domain';

export interface DNSRecordsProps {
  value: DNSRecordsType;
  isLoadingUpdate: boolean;
  onUpdate: (domain: string) => void;
  onClose: () => void;
}

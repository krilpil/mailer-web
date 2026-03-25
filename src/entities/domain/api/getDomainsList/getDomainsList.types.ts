import { DomainType } from '../../model/domain.types';

export interface IGetDomainsListPayload {
  page: number;
}

export interface IGetDomainsListResponse {
  success: boolean;
  msg: string;
  data: {
    total: number;
    list: Array<DomainType>;
  };
}

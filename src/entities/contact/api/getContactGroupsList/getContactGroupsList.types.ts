import { ContactGroupType } from '../../model/contactGroup.types';

export interface IGetContactGroupsListResponse {
  success: boolean;
  msg: string;
  data: {
    total: number;
    list: Array<ContactGroupType>;
  };
}

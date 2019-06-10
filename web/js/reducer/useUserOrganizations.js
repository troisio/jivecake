import {
  GET_USER_ORGANIZATIONS
} from 'js/reducer/useFetch';

import { getPaginationStoreHook } from 'js/helper/pagination';

export const useUserOrganizations = getPaginationStoreHook(GET_USER_ORGANIZATIONS, 'userId');
